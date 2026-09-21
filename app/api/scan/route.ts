import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_BORROW_DAYS = 30;

// สถานะที่ยืมไม่ได้ และข้อความที่แสดงให้ผู้ใช้
const UNAVAILABLE_REASON: Record<string, string> = {
  maintenance: "ครุภัณฑ์นี้อยู่ระหว่างซ่อมบำรุง",
  inactive: "ครุภัณฑ์นี้ปิดการใช้งานอยู่",
  damaged: "ครุภัณฑ์นี้ชำรุด ไม่สามารถยืมได้",
  lost: "ครุภัณฑ์นี้ถูกแจ้งสูญหาย",
};

type EquipmentRow = {
  id: number;
  equipment_code: string;
  name: string;
  category_name: string | null;
  location: string | null;
  image_url: string | null;
  quantity: number;
  available_quantity: number;
  status:
    | "available"
    | "borrowed"
    | "maintenance"
    | "inactive"
    | "damaged"
    | "lost";
};

type ActiveBorrowingRow = {
  id: number;
  user_id: number;
  borrow_date: Date | string;
  due_date: Date | string;
};

/* =======================================================
   HELPERS
======================================================= */

function json(
  body: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

async function getUserId() {
  const session = await auth();

  if (!session?.user) {
    return {
      error: json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        401
      ),
    };
  }

  if (session.user.role !== "user") {
    return {
      error: json(
        {
          success: false,
          message: "การยืม–คืนผ่านการสแกนใช้ได้เฉพาะผู้ใช้งานทั่วไป",
        },
        403
      ),
    };
  }

  const userId = Number(session.user.id);

  if (!Number.isFinite(userId)) {
    return {
      error: json(
        { success: false, message: "ข้อมูลผู้ใช้ไม่ถูกต้อง" },
        401
      ),
    };
  }

  return { userId };
}

// QR อาจเป็นรหัสครุภัณฑ์ล้วน ๆ หรือเป็นลิงก์ที่มี ?code=...
function normalizeCode(raw: string | null | undefined) {
  const value = String(raw || "").trim();

  if (!value) return "";

  try {
    const url = new URL(value);
    const code = url.searchParams.get("code");

    if (code) return code.trim();
  } catch {
    // ไม่ใช่ URL ใช้ค่าเดิม
  }

  return value;
}

/* =======================================================
   GET /api/scan?code=XXX
   ค้นหาครุภัณฑ์จากรหัส และบอกว่าผู้ใช้ทำอะไรได้บ้าง
======================================================= */

export async function GET(request: Request) {
  const result = await getUserId();

  if (result.error) return result.error;

  const { userId } = result;

  const code = normalizeCode(
    new URL(request.url).searchParams.get("code")
  );

  if (!code) {
    return json(
      { success: false, message: "ไม่พบรหัสครุภัณฑ์" },
      400
    );
  }

  try {
    const [equipmentRows] = await db.execute(
      `
      SELECT
        e.id,
        e.equipment_code,
        e.name,
        c.name AS category_name,
        e.location,
        e.image_url,
        e.quantity,
        e.available_quantity,
        e.status

      FROM equipment e

      LEFT JOIN equipment_categories c
        ON e.category_id = c.id

      WHERE e.equipment_code = ?

      LIMIT 1
      `,
      [code]
    );

    const equipment = (
      equipmentRows as EquipmentRow[]
    )[0];

    if (!equipment) {
      return json(
        {
          success: false,
          message: `ไม่พบครุภัณฑ์รหัส ${code} ในระบบ`,
        },
        404
      );
    }

    // รายการที่ผู้ใช้คนนี้กำลังยืมครุภัณฑ์ชิ้นนี้อยู่
    const [myRows] = await db.execute(
      `
      SELECT id, user_id, borrow_date, due_date

      FROM borrowings

      WHERE
        equipment_id = ?
        AND user_id = ?
        AND status IN ('approved', 'borrowed', 'overdue')

      ORDER BY borrow_date ASC

      LIMIT 1
      `,
      [equipment.id, userId]
    );

    const myBorrowing = (
      myRows as ActiveBorrowingRow[]
    )[0];

    let action: "borrow" | "return" | "unavailable";
    let reason = "";

    if (myBorrowing) {
      action = "return";
    } else if (UNAVAILABLE_REASON[equipment.status]) {
      action = "unavailable";
      reason = UNAVAILABLE_REASON[equipment.status];
    } else if (Number(equipment.available_quantity) <= 0) {
      action = "unavailable";
      reason = "ครุภัณฑ์นี้ถูกยืมครบจำนวนแล้ว";
    } else {
      action = "borrow";
    }

    return json({
      success: true,
      data: {
        action,
        reason,
        maxBorrowDays: MAX_BORROW_DAYS,
        equipment: {
          id: Number(equipment.id),
          code: equipment.equipment_code,
          name: equipment.name,
          category: equipment.category_name,
          location: equipment.location,
          imageUrl: equipment.image_url,
          quantity: Number(equipment.quantity),
          availableQuantity: Number(
            equipment.available_quantity
          ),
          status: equipment.status,
        },
        borrowing: myBorrowing
          ? {
              id: Number(myBorrowing.id),
              borrowDate: myBorrowing.borrow_date,
              dueDate: myBorrowing.due_date,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("SCAN LOOKUP ERROR:", error);

    return json(
      {
        success: false,
        message: "ไม่สามารถค้นหาครุภัณฑ์ได้",
      },
      500
    );
  }
}

/* =======================================================
   POST /api/scan
   บันทึกการยืมจากการสแกน และอัปเดตสถานะครุภัณฑ์ทันที
   body: { code, dueDate: "YYYY-MM-DD", purpose? }
======================================================= */

export async function POST(request: Request) {
  const result = await getUserId();

  if (result.error) return result.error;

  const { userId } = result;

  let body: {
    code?: string;
    dueDate?: string;
    purpose?: string;
  };

  try {
    body = await request.json();
  } catch {
    return json(
      { success: false, message: "ข้อมูลไม่ถูกต้อง" },
      400
    );
  }

  const code = normalizeCode(body.code);
  const purpose = String(body.purpose || "").trim().slice(0, 500);

  if (!code) {
    return json(
      { success: false, message: "ไม่พบรหัสครุภัณฑ์" },
      400
    );
  }

  // =========================
  // ตรวจสอบวันกำหนดคืน
  // =========================

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.dueDate || ""))) {
    return json(
      { success: false, message: "กรุณาเลือกวันกำหนดคืน" },
      400
    );
  }

  // คืนได้ถึงสิ้นวันที่เลือก (เวลาไทย)
  const dueDate = new Date(`${body.dueDate}T23:59:59+07:00`);
  const now = new Date();
  const maxDue = new Date(
    now.getTime() + MAX_BORROW_DAYS * 24 * 60 * 60 * 1000
  );

  if (Number.isNaN(dueDate.getTime()) || dueDate <= now) {
    return json(
      {
        success: false,
        message: "วันกำหนดคืนต้องเป็นวันนี้หรือหลังจากนี้",
      },
      400
    );
  }

  if (dueDate > maxDue) {
    return json(
      {
        success: false,
        message: `ยืมได้ไม่เกิน ${MAX_BORROW_DAYS} วัน`,
      },
      400
    );
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // =========================
    // LOCK EQUIPMENT
    // =========================

    const [equipmentRows] = await connection.execute(
      `
      SELECT
        id,
        name,
        quantity,
        available_quantity,
        status

      FROM equipment

      WHERE equipment_code = ?

      LIMIT 1

      FOR UPDATE
      `,
      [code]
    );

    const equipment = (
      equipmentRows as EquipmentRow[]
    )[0];

    if (!equipment) {
      await connection.rollback();

      return json(
        {
          success: false,
          message: `ไม่พบครุภัณฑ์รหัส ${code} ในระบบ`,
        },
        404
      );
    }

    if (
      UNAVAILABLE_REASON[equipment.status] ||
      Number(equipment.available_quantity) <= 0
    ) {
      await connection.rollback();

      return json(
        {
          success: false,
          message: "ครุภัณฑ์นี้ไม่พร้อมให้ยืมในขณะนี้",
        },
        409
      );
    }

    // กันการสแกนยืมซ้ำชิ้นเดิม
    const [dupRows] = await connection.execute(
      `
      SELECT id

      FROM borrowings

      WHERE
        equipment_id = ?
        AND user_id = ?
        AND status IN ('approved', 'borrowed', 'overdue')

      LIMIT 1
      `,
      [equipment.id, userId]
    );

    if (Array.isArray(dupRows) && dupRows.length > 0) {
      await connection.rollback();

      return json(
        {
          success: false,
          message: "คุณกำลังยืมครุภัณฑ์ชิ้นนี้อยู่แล้ว",
        },
        409
      );
    }

    // =========================
    // CREATE BORROWING
    // =========================

    const [insertResult] = await connection.execute(
      `
      INSERT INTO borrowings
      (
        user_id,
        equipment_id,
        quantity,
        borrow_date,
        due_date,
        status,
        purpose,
        approved_at
      )

      VALUES
      (
        ?,
        ?,
        1,
        NOW(),
        ?,
        'borrowed',
        ?,
        NOW()
      )
      `,
      [
        userId,
        equipment.id,
        dueDate,
        purpose || null,
      ]
    );

    const borrowingId = Number(
      (insertResult as { insertId: number }).insertId
    );

    // =========================
    // UPDATE EQUIPMENT
    // =========================

    // คำนวณค่าใหม่เองจากแถวที่ lock ไว้
    // (ไม่พึ่งลำดับการ SET ของ SQL)
    const newAvailable =
      Number(equipment.available_quantity) - 1;

    await connection.execute(
      `
      UPDATE equipment

      SET
        available_quantity = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = ?
      `,
      [
        newAvailable,
        newAvailable <= 0 ? "borrowed" : "available",
        equipment.id,
      ]
    );

    // =========================
    // ACTIVITY LOG
    // =========================

    await connection.execute(
      `
      INSERT INTO activity_logs
      (
        user_id,
        action,
        description
      )

      VALUES
      (
        ?,
        ?,
        ?
      )
      `,
      [
        userId,
        "BORROW_EQUIPMENT",
        `ยืมครุภัณฑ์ ${equipment.name} (สแกน QR) รายการยืม #${borrowingId}`,
      ]
    );

    await connection.commit();

    return json({
      success: true,
      message: "ยืมครุภัณฑ์สำเร็จ",
      data: {
        borrowingId,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("SCAN BORROW ERROR:", error);

    return json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการยืมครุภัณฑ์",
      },
      500
    );
  } finally {
    connection.release();
  }
}
