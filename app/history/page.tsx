import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import HistoryClient from "@/app/components/HistoryClient";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type HistoryRow = {
  id: number;
  equipment_code: string;
  equipment_name: string;
  category_name: string | null;
  location: string | null;
  quantity: number;
  borrow_date: Date | string;
  due_date: Date | string;
  return_date: Date | string | null;
  purpose: string | null;
  note: string | null;
  status:
    | "pending"
    | "approved"
    | "borrowed"
    | "returned"
    | "rejected"
    | "overdue";
};

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "user") {
    redirect("/admin/dashboard");
  }

  const userId = Number(session.user.id);

  if (!Number.isFinite(userId)) {
    redirect("/login");
  }

  let historyData: HistoryRow[] = [];

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
        b.return_date,
        b.purpose,
        b.note,
        b.status
      FROM borrowings b
      INNER JOIN equipment e
        ON b.equipment_id = e.id
      LEFT JOIN equipment_categories c
        ON e.category_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC, b.id DESC
      `,
      [userId]
    );

    if (Array.isArray(rows)) {
      historyData = rows as HistoryRow[];
    }
  } catch (error) {
    console.error("HISTORY PAGE ERROR:", error);
  }

  const items = historyData.map((item) => ({
    id: Number(item.id),

    borrowId: `BR-${new Date(
      item.borrow_date
    ).getFullYear()}-${String(item.id).padStart(3, "0")}`,

    equipmentCode: item.equipment_code,

    name: item.equipment_name,

    category:
      item.category_name || "ไม่ระบุประเภท",

    location:
      item.location || "ไม่ระบุสถานที่",

    quantity: Number(item.quantity || 1),

    borrowDate: new Date(
      item.borrow_date
    ).toISOString(),

    dueDate: new Date(
      item.due_date
    ).toISOString(),

    returnDate: item.return_date
      ? new Date(item.return_date).toISOString()
      : null,

    purpose:
      item.purpose ||
      "ไม่ได้ระบุวัตถุประสงค์",

    note: item.note || "",

    status: item.status,
  }));

  return <HistoryClient items={items} />;
}