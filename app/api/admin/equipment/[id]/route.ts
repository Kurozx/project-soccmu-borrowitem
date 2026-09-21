import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import {
  isDuplicateError,
  parseEquipmentBody,
  requireAdmin,
} from "@/lib/equipment";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getEquipmentId(context: RouteContext) {
  const { id } = await context.params;
  const equipmentId = Number(id);

  return Number.isInteger(equipmentId) && equipmentId > 0
    ? equipmentId
    : null;
}

/* =========================================================
   PUT - UPDATE
========================================================= */

export async function PUT(request: Request, context: RouteContext) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์แก้ไขครุภัณฑ์" },
        { status: 403 }
      );
    }

    const equipmentId = await getEquipmentId(context);

    if (!equipmentId) {
      return NextResponse.json(
        { success: false, message: "รหัสครุภัณฑ์ไม่ถูกต้อง" },
        { status: 400 }
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

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT quantity, available_quantity FROM equipment WHERE id = ?`,
      [equipmentId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบครุภัณฑ์" },
        { status: 404 }
      );
    }

    // จำนวนที่ถูกยืมอยู่ต้องคงเดิม เมื่อเปลี่ยนจำนวนทั้งหมด
    const inUse =
      Number(rows[0].quantity) - Number(rows[0].available_quantity);
    const availableQuantity = quantity - inUse;

    if (availableQuantity < 0) {
      return NextResponse.json(
        {
          success: false,
          message: `มีการยืมอยู่ ${inUse} ชิ้น จำนวนทั้งหมดต้องไม่น้อยกว่านี้`,
        },
        { status: 400 }
      );
    }

    await db.execute(
      `
      UPDATE equipment
      SET
        equipment_code = ?,
        name = ?,
        category_id = ?,
        description = ?,
        location = ?,
        quantity = ?,
        available_quantity = ?,
        status = ?,
        purchase_date = ?
      WHERE id = ?
      `,
      [
        code,
        name,
        categoryId,
        description,
        location,
        quantity,
        availableQuantity,
        status,
        purchaseDate,
        equipmentId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDuplicateError(error)) {
      return NextResponse.json(
        { success: false, message: "รหัสครุภัณฑ์นี้มีอยู่แล้ว" },
        { status: 409 }
      );
    }

    console.error("UPDATE EQUIPMENT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "ไม่สามารถแก้ไขครุภัณฑ์ได้" },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE
========================================================= */

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์ลบครุภัณฑ์" },
        { status: 403 }
      );
    }

    const equipmentId = await getEquipmentId(context);

    if (!equipmentId) {
      return NextResponse.json(
        { success: false, message: "รหัสครุภัณฑ์ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const [borrowings] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM borrowings WHERE equipment_id = ?`,
      [equipmentId]
    );

    if (Number(borrowings[0].total) > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่สามารถลบได้ เนื่องจากมีประวัติการยืม ให้เปลี่ยนสถานะเป็น \"ปิดใช้งาน\" แทน",
        },
        { status: 409 }
      );
    }

    const [deleted] = await db.execute<ResultSetHeader>(
      `DELETE FROM equipment WHERE id = ?`,
      [equipmentId]
    );

    if (deleted.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบครุภัณฑ์" },
        { status: 404 }
      );
    }

    // ลบรูปทั้งหมดของครุภัณฑ์ในระบบรูปภาพกลาง
    await db.execute(
      `DELETE FROM images WHERE owner_type = 'equipment' AND owner_id = ?`,
      [equipmentId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE EQUIPMENT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "ไม่สามารถลบครุภัณฑ์ได้" },
      { status: 500 }
    );
  }
}
