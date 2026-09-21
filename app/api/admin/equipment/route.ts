import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import {
  formatDateOnly,
  isDuplicateError,
  parseEquipmentBody,
  requireAdmin,
} from "@/lib/equipment";

/* =========================================================
   GET - READ (ครุภัณฑ์ + หมวดหมู่)
========================================================= */

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึงข้อมูล" },
        { status: 403 }
      );
    }

    const [equipmentRows] = await db.execute<RowDataPacket[]>(`
      SELECT
        e.id,
        e.equipment_code,
        e.name,
        e.category_id,
        c.name AS category_name,
        c.image_url AS category_image_url,
        e.description,
        e.location,
        e.quantity,
        e.available_quantity,
        e.status,
        e.purchase_date,
        e.image_url
      FROM equipment e
      LEFT JOIN equipment_categories c
        ON e.category_id = c.id
      ORDER BY e.equipment_code ASC
    `);

    const equipment = equipmentRows.map((row) => ({
      ...row,
      purchase_date: formatDateOnly(row.purchase_date),
    }));

    const [categories] = await db.execute(`
      SELECT id, name, image_url
      FROM equipment_categories
      ORDER BY id ASC
    `);

    return NextResponse.json({
      success: true,
      data: equipment,
      categories,
    });
  } catch (error) {
    console.error("GET EQUIPMENT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "ไม่สามารถดึงข้อมูลครุภัณฑ์ได้" },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST - CREATE
========================================================= */

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เพิ่มครุภัณฑ์" },
        { status: 403 }
      );
    }

    const parsed = parseEquipmentBody(await request.json());

    if (!parsed.data) {
      return NextResponse.json(
        { success: false, message: parsed.error },
        { status: 400 }
      );
    }

    const {
      code,
      name,
      location,
      description,
      categoryId,
      quantity,
      status,
      purchaseDate,
    } = parsed.data;

    const [insertResult] = await db.execute<ResultSetHeader>(
      `
      INSERT INTO equipment
        (equipment_code, name, category_id, description, location,
         quantity, available_quantity, status, purchase_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        code,
        name,
        categoryId,
        description,
        location,
        quantity,
        quantity,
        status,
        purchaseDate,
      ]
    );

    // ส่ง id กลับ เพื่อให้หน้าเว็บอัปโหลดรูปต่อได้ทันที
    return NextResponse.json({
      success: true,
      id: Number(insertResult.insertId),
    });
  } catch (error) {
    if (isDuplicateError(error)) {
      return NextResponse.json(
        { success: false, message: "รหัสครุภัณฑ์นี้มีอยู่แล้ว" },
        { status: 409 }
      );
    }

    console.error("CREATE EQUIPMENT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "ไม่สามารถเพิ่มครุภัณฑ์ได้" },
      { status: 500 }
    );
  }
}
