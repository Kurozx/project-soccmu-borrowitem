import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import BorrowingClient from "@/app/components/BorrowingClient";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type BorrowingRow = {
  id: number;
  equipment_code: string;
  equipment_name: string;
  category_name: string | null;
  location: string | null;
  borrow_date: Date | string;
  due_date: Date | string;
  purpose: string | null;
  quantity: number;
  status:
    | "pending"
    | "approved"
    | "borrowed"
    | "returned"
    | "rejected"
    | "overdue";
};

export default async function BorrowingPage() {
  // =========================
  // ตรวจสอบ Login
  // =========================
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // หน้านี้สำหรับ user เท่านั้น
  if (session.user.role !== "user") {
    redirect("/admin/dashboard");
  }

  const userId = Number(session.user.id);

  if (!Number.isFinite(userId)) {
    redirect("/login");
  }

  let borrowingData: BorrowingRow[] = [];

  try {
    // =========================
    // ดึงรายการยืมของ User
    // =========================
    const [rows] = await db.execute(
      `
      SELECT
        b.id,
        e.equipment_code,
        e.name AS equipment_name,
        c.name AS category_name,
        e.location,
        b.borrow_date,
        b.due_date,
        b.purpose,
        b.quantity,
        b.status
      FROM borrowings b

      INNER JOIN equipment e
        ON b.equipment_id = e.id

      LEFT JOIN equipment_categories c
        ON e.category_id = c.id

      WHERE
        b.user_id = ?
        AND b.status IN (
          'approved',
          'borrowed',
          'overdue'
        )

      ORDER BY
        b.due_date ASC,
        b.created_at DESC
      `,
      [userId]
    );

    if (Array.isArray(rows)) {
      borrowingData = rows as BorrowingRow[];
    }
  } catch (error) {
    console.error("BORROWING PAGE ERROR:", error);
  }

  // =========================
  // แปลงข้อมูลจาก DB
  // =========================
  const items = borrowingData.map((item) => ({
    id: Number(item.id),

    borrowId: `BR-${new Date(item.borrow_date).getFullYear()}-${String(
      item.id
    ).padStart(3, "0")}`,

    equipmentCode: item.equipment_code,

    name: item.equipment_name,

    category: item.category_name || "ไม่ระบุประเภท",

    location: item.location || "ไม่ระบุสถานที่",

    borrowDate: new Date(item.borrow_date).toISOString(),

    returnDate: new Date(item.due_date).toISOString(),

    purpose: item.purpose || "ไม่ได้ระบุวัตถุประสงค์",

    quantity: Number(item.quantity || 1),

    status: item.status,

    daysLeft: calculateDaysLeft(item.due_date),
  }));

  return <BorrowingClient items={items} />;
}

// =========================
// คำนวณจำนวนวันที่เหลือ
// =========================
function calculateDaysLeft(dueDate: Date | string): number {
  const due = new Date(dueDate).getTime();
  const now = new Date().getTime();

  const difference = due - now;

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}