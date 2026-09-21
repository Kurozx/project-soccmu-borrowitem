import { NextResponse } from "next/server";
import type { PoolConnection } from "mysql2/promise";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/equipment";

type Action = "approve" | "reject" | "return";

const ACTION_LABEL: Record<Action, string> = {
  approve: "อนุมัติ",
  reject: "ยกเลิก",
  return: "บันทึกการคืน",
};

// ปรับจำนวนคงเหลือ (+ คืนของ / − ยืมออก) และสถานะของครุภัณฑ์
// คำนวณจากแถวที่ lock ไว้ ไม่พึ่งลำดับการ SET ของ SQL
async function adjustStock(
  connection: PoolConnection,
  equipmentId: number,
  delta: number
) {
  const [rows] = await connection.execute(
    `
    SELECT quantity, available_quantity, status
    FROM equipment
    WHERE id = ?
    FOR UPDATE
    `,
    [equipmentId]
  );

  const equipment = (
    rows as {
      quantity: number;
      available_quantity: number;
      status: string;
    }[]
  )[0];

  if (!equipment) return false;

  const available =
    Number(equipment.available_quantity) + delta;

  if (available < 0) return false;

  const newAvailable = Math.min(
    Number(equipment.quantity),
    available
  );

  const newStatus =
    ["maintenance", "inactive", "damaged", "lost"].includes(
      equipment.status
    )
      ? equipment.status
      : newAvailable > 0
        ? "available"
        : "borrowed";

  await connection.execute(
    `
    UPDATE equipment
    SET
      available_quantity = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [newAvailable, newStatus, equipmentId]
  );

  return true;
}

/* =========================================================
   PATCH /api/admin/borrowings/[id]
   body: { action: "approve" | "reject" | "return" }
========================================================= */

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "ไม่มีสิทธิ์ดำเนินการ" },
      { status: 403 }
    );
  }

  const adminId = Number(session.user.id);
  const { id } = await context.params;
  const borrowingId = Number(id);

  if (!Number.isInteger(borrowingId) || borrowingId <= 0) {
    return NextResponse.json(
      { success: false, message: "รหัสรายการยืมไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  let action: Action;

  try {
    const body = await request.json();
    action = body.action;
  } catch {
    return NextResponse.json(
      { success: false, message: "ข้อมูลไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  if (!["approve", "reject", "return"].includes(action)) {
    return NextResponse.json(
      { success: false, message: "คำสั่งไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `
      SELECT
        b.id,
        b.equipment_id,
        b.quantity,
        b.status,
        e.name AS equipment_name
      FROM borrowings b
      INNER JOIN equipment e ON b.equipment_id = e.id
      WHERE b.id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [borrowingId]
    );

    const borrowing = (
      rows as {
        id: number;
        equipment_id: number;
        quantity: number;
        status: string;
        equipment_name: string;
      }[]
    )[0];

    if (!borrowing) {
      await connection.rollback();

      return NextResponse.json(
        { success: false, message: "ไม่พบรายการยืม" },
        { status: 404 }
      );
    }

    const active = ["approved", "borrowed", "overdue"].includes(
      borrowing.status
    );

    const fail = async (message: string) => {
      await connection.rollback();

      return NextResponse.json(
        { success: false, message },
        { status: 409 }
      );
    };

    /* ---------------- APPROVE ---------------- */
    if (action === "approve") {
      if (borrowing.status !== "pending") {
        return fail("อนุมัติได้เฉพาะรายการที่รออนุมัติ");
      }

      const ok = await adjustStock(
        connection,
        borrowing.equipment_id,
        -Number(borrowing.quantity)
      );

      if (!ok) {
        return fail("ครุภัณฑ์คงเหลือไม่พอสำหรับอนุมัติ");
      }

      await connection.execute(
        `
        UPDATE borrowings
        SET status = 'borrowed', approved_by = ?, approved_at = NOW()
        WHERE id = ?
        `,
        [adminId, borrowingId]
      );
    }

    /* ---------------- REJECT / CANCEL ---------------- */
    if (action === "reject") {
      if (borrowing.status !== "pending" && !active) {
        return fail("รายการนี้ปิดไปแล้ว ไม่สามารถยกเลิกได้");
      }

      // ของที่ถูกยืมออกไปแล้ว ต้องคืนจำนวนกลับเข้าคลัง
      if (active) {
        await adjustStock(
          connection,
          borrowing.equipment_id,
          Number(borrowing.quantity)
        );
      }

      await connection.execute(
        `UPDATE borrowings SET status = 'rejected' WHERE id = ?`,
        [borrowingId]
      );
    }

    /* ---------------- RETURN ---------------- */
    if (action === "return") {
      if (!active) {
        return fail("รายการนี้ไม่อยู่ในสถานะที่คืนได้");
      }

      await adjustStock(
        connection,
        borrowing.equipment_id,
        Number(borrowing.quantity)
      );

      await connection.execute(
        `
        UPDATE borrowings
        SET status = 'returned', return_date = NOW()
        WHERE id = ?
        `,
        [borrowingId]
      );
    }

    await connection.execute(
      `
      INSERT INTO activity_logs (user_id, action, description)
      VALUES (?, ?, ?)
      `,
      [
        adminId,
        `ADMIN_${action.toUpperCase()}_BORROWING`,
        `${ACTION_LABEL[action]}รายการยืม #${borrowingId} (${borrowing.equipment_name})`,
      ]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: `${ACTION_LABEL[action]}สำเร็จ`,
    });
  } catch (error) {
    await connection.rollback();

    console.error("ADMIN BORROWING PATCH ERROR:", error);

    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดำเนินการ" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
