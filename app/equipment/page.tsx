import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import EquipmentClient from "@/app/components/EquipmentClient";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type EquipmentRow = {
  id: number;
  equipment_code: string;
  name: string;
  description: string | null;
  location: string | null;
  quantity: number;
  available_quantity: number;
  status:
    | "available"
    | "borrowed"
    | "maintenance"
    | "inactive"
    | "damaged"
    | "lost";
  image_url: string | null;
  category_name: string | null;
  category_image_url: string | null;
};

export default async function EquipmentPage() {
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

  let equipmentData: EquipmentRow[] = [];

  try {
    const [rows] = await db.execute(`
      SELECT
        e.id,
        e.equipment_code,
        e.name,
        e.description,
        e.location,
        e.quantity,
        e.available_quantity,
        e.status,
        e.image_url,
        c.name AS category_name,
        c.image_url AS category_image_url
      FROM equipment e
      LEFT JOIN equipment_categories c
        ON e.category_id = c.id
      ORDER BY e.id DESC
    `);

    if (Array.isArray(rows)) {
      equipmentData = rows as EquipmentRow[];
    }
  } catch (error) {
    console.error("EQUIPMENT PAGE ERROR:", error);
  }

  // ================================
  // แปลงข้อมูลจาก DB
  // snake_case → camelCase
  // ================================
  const items = equipmentData.map((item) => ({
    id: Number(item.id),

    equipmentCode: item.equipment_code,

    name: item.name,

    category:
      item.category_name || "ไม่ระบุประเภท",

    description:
      item.description ||
      "ไม่มีรายละเอียดของครุภัณฑ์",

    location:
      item.location ||
      "ไม่ระบุสถานที่",

    quantity: Number(
      item.quantity || 0
    ),

    availableQuantity: Number(
      item.available_quantity || 0
    ),

    status: item.status,

    imageUrl:
      item.image_url || null,

    // ใช้เป็นรูปสำรองเมื่อครุภัณฑ์ยังไม่มีรูป Test
    categoryImageUrl:
      item.category_image_url || null,
  }));

  // ================================
  // ส่งข้อมูลให้ Client Component
  // ================================
  return (
    <EquipmentClient
      items={items}
    />
  );
}