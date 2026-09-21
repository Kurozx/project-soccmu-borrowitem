import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import ReturnClient from "@/app/components/ReturnClient";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type ReturnRow = {
  id: number;
  equipment_code: string;
  equipment_name: string;
  category_name: string | null;
  location: string | null;
  quantity: number;
  borrow_date: Date | string;
  due_date: Date | string;
  purpose: string | null;
  status:
    | "approved"
    | "borrowed"
    | "overdue";
};

export default async function ReturnPage() {
  const session = await auth();

  // ================================
  // ตรวจสอบ Login
  // ================================
  if (!session?.user) {
    redirect("/login");
  }

  // ================================
  // เฉพาะ User
  // Admin ไปหน้า Admin Dashboard
  // ================================
  if (session.user.role !== "user") {
    redirect("/admin/dashboard");
  }

  const userId = Number(session.user.id);

  if (!Number.isFinite(userId)) {
    redirect("/login");
  }

  let returnData: ReturnRow[] = [];

  try {
    const [rows] = await db.execute(
      `
      SELECT
        b.id,
        e.equipment_code,
        e.name AS equipment_name,
        c.name AS category_name,
        e.location,
        b.quantity,
        b.borrow_date,
        b.due_date,
        b.purpose,
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
      returnData = rows as ReturnRow[];
    }
  } catch (error) {
    console.error(
      "RETURN PAGE ERROR:",
      error
    );
  }

  // ================================
  // แปลงข้อมูลให้ Client Component
  // ================================

  const items = returnData.map((item) => ({
    id: Number(item.id),

    borrowId: `BR-${new Date(
      item.borrow_date
    ).getFullYear()}-${String(
      item.id
    ).padStart(3, "0")}`,

    equipmentCode:
      item.equipment_code,

    name:
      item.equipment_name,

    category:
      item.category_name ||
      "ไม่ระบุประเภท",

    location:
      item.location ||
      "ไม่ระบุสถานที่",

    quantity:
      Number(item.quantity || 1),

    borrowDate:
      new Date(
        item.borrow_date
      ).toISOString(),

    dueDate:
      new Date(
        item.due_date
      ).toISOString(),

    purpose:
      item.purpose ||
      "ไม่ได้ระบุวัตถุประสงค์",

    status:
      item.status,

    daysLeft:
      calculateDaysLeft(
        item.due_date
      ),
  }));

  return (
    <ReturnClient
      items={items}
    />
  );
}

/* =========================================================
   CALCULATE DAYS LEFT
========================================================= */

function calculateDaysLeft(
  dueDate: Date | string
) {
  const due =
    new Date(dueDate).getTime();

  const now =
    new Date().getTime();

  const difference =
    due - now;

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
  );
}