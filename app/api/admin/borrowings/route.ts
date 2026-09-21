import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/equipment";

export const dynamic = "force-dynamic";

// สถานะที่หน้าแอดมินใช้แสดงผล (ภาษาไทย)
export type AdminBorrowStatus =
  | "รออนุมัติ"
  | "กำลังยืม"
  | "เกินกำหนด"
  | "คืนแล้ว"
  | "ยกเลิก";

type Row = {
  id: number;
  username: string;
  email: string;
  equipment_name: string;
  equipment_code: string;
  category_name: string | null;
  borrow_date: Date | string;
  due_date: Date | string;
  return_date: Date | string | null;
  status:
    | "pending"
    | "approved"
    | "borrowed"
    | "returned"
    | "rejected"
    | "overdue";
  purpose: string | null;
  note: string | null;
  quantity: number;
};

function toThaiStatus(row: Row): AdminBorrowStatus {
  switch (row.status) {
    case "pending":
      return "รออนุมัติ";
    case "returned":
      return "คืนแล้ว";
    case "rejected":
      return "ยกเลิก";
    case "overdue":
      return "เกินกำหนด";
    default:
      // approved / borrowed ที่เลยกำหนดแล้วถือว่าเกินกำหนด
      return new Date(row.due_date) < new Date()
        ? "เกินกำหนด"
        : "กำลังยืม";
  }
}

const iso = (value: Date | string | null) =>
  value ? new Date(value).toISOString() : null;

/* =========================================================
   GET /api/admin/borrowings
   รายการยืม–คืนทั้งหมด (ใช้ร่วมกันในหน้าจัดการรายการยืม /
   จัดการรายการคืน / รายงานสถิติ)
========================================================= */

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, message: "ไม่มีสิทธิ์เข้าถึงข้อมูล" },
      { status: 403 }
    );
  }

  try {
    const [rows] = await db.execute(`
      SELECT
        b.id,
        u.username,
        u.email,
        e.name AS equipment_name,
        e.equipment_code,
        c.name AS category_name,
        b.borrow_date,
        b.due_date,
        b.return_date,
        b.status,
        b.purpose,
        b.note,
        b.quantity

      FROM borrowings b

      INNER JOIN users u
        ON b.user_id = u.id

      INNER JOIN equipment e
        ON b.equipment_id = e.id

      LEFT JOIN equipment_categories c
        ON e.category_id = c.id

      ORDER BY b.borrow_date DESC, b.id DESC
    `);

    const data = (rows as Row[]).map((row) => ({
      id: Number(row.id),
      borrowId: `BR-${String(row.id).padStart(6, "0")}`,
      borrower: row.username,
      email: row.email,
      equipmentName: row.equipment_name,
      equipmentCode: row.equipment_code,
      category: row.category_name || "ไม่ระบุประเภท",
      borrowDate: iso(row.borrow_date),
      dueDate: iso(row.due_date),
      returnDate: iso(row.return_date),
      quantity: Number(row.quantity),
      purpose: row.purpose || "",
      note: row.note || "",
      rawStatus: row.status,
      status: toThaiStatus(row),
    }));

    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("ADMIN BORROWINGS GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถดึงข้อมูลรายการยืมได้",
      },
      { status: 500 }
    );
  }
}
