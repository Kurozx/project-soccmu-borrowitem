import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type EquipmentStatus =
  | "available"
  | "borrowed"
  | "maintenance"
  | "inactive"
  | "damaged"
  | "lost";

type BorrowingStatus =
  | "pending"
  | "approved"
  | "borrowed"
  | "returned"
  | "rejected"
  | "overdue";

type EquipmentRow = {
  id: number;
  equipment_code: string;
  name: string;
  category_name: string | null;
  location: string | null;
  quantity: number;
  available_quantity: number;
  status: EquipmentStatus;
};

type HistoryRow = {
  id: number;
  borrower: string | null;
  borrow_date: Date | string | null;
  due_date: Date | string | null;
  return_date: Date | string | null;
  status: BorrowingStatus;
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

// DB เก็บเวลาเป็น UTC (pool ตั้ง timezone "Z") → ส่งออกเป็น ISO
function toIso(value: Date | string | null) {
  if (!value) return null;

  const date =
    value instanceof Date
      ? value
      : new Date(
          /[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
            ? value
            : `${value.replace(" ", "T")}Z`
        );

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
}

function toThaiStatus(
  status: BorrowingStatus,
  dueIso: string | null,
  now: number
) {
  switch (status) {
    case "pending":
      return "รออนุมัติ";
    case "returned":
      return "คืนแล้ว";
    case "rejected":
      return "ยกเลิก";
    case "overdue":
      return "เกินกำหนด";
    default:
      // approved / borrowed
      return dueIso && new Date(dueIso).getTime() < now
        ? "เกินกำหนด"
        : "กำลังยืม";
  }
}

/* =======================================================
   GET /api/equipment/{id}/history
   รายละเอียด + สถานะปัจจุบัน + ประวัติการยืม–คืน
======================================================= */

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return json(
      { success: false, message: "กรุณาเข้าสู่ระบบ" },
      401
    );
  }

  const { id } = await context.params;
  const equipmentId = Number(id);

  if (!Number.isInteger(equipmentId) || equipmentId <= 0) {
    return json(
      { success: false, message: "ไม่พบครุภัณฑ์" },
      404
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
        e.quantity,
        e.available_quantity,
        e.status

      FROM equipment e

      LEFT JOIN equipment_categories c
        ON e.category_id = c.id

      WHERE e.id = ?

      LIMIT 1
      `,
      [equipmentId]
    );

    const equipment = (
      equipmentRows as EquipmentRow[]
    )[0];

    if (!equipment) {
      return json(
        { success: false, message: "ไม่พบครุภัณฑ์" },
        404
      );
    }

    const [historyRows] = await db.execute(
      `
      SELECT
        b.id,
        u.username AS borrower,
        b.borrow_date,
        b.due_date,
        b.return_date,
        b.status

      FROM borrowings b

      LEFT JOIN users u
        ON b.user_id = u.id

      WHERE b.equipment_id = ?

      ORDER BY b.borrow_date DESC, b.id DESC

      LIMIT 50
      `,
      [equipmentId]
    );

    const now = Date.now();

    const history = (historyRows as HistoryRow[]).map(
      (row) => {
        const dueDate = toIso(row.due_date);

        return {
          id: Number(row.id),
          borrower: row.borrower || "ไม่ทราบผู้ใช้",
          borrowDate: toIso(row.borrow_date),
          dueDate,
          returnDate: toIso(row.return_date),
          rawStatus: row.status,
          status: toThaiStatus(row.status, dueDate, now),
        };
      }
    );

    return json({
      success: true,
      data: {
        equipment: {
          id: Number(equipment.id),
          code: equipment.equipment_code,
          name: equipment.name,
          category: equipment.category_name,
          location: equipment.location,
          status: equipment.status,
          quantity: Number(equipment.quantity),
          availableQuantity: Number(
            equipment.available_quantity
          ),
        },
        history,
      },
    });
  } catch (error) {
    console.error("EQUIPMENT HISTORY ERROR:", error);

    return json(
      {
        success: false,
        message: "ไม่สามารถโหลดประวัติครุภัณฑ์ได้",
      },
      500
    );
  }
}
