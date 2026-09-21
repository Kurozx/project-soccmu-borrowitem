import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { isDuplicateError, requireAdmin } from "@/lib/equipment";

export const dynamic = "force-dynamic";

// =========================================================
// จัดการหมวดหมู่ครุภัณฑ์ (admin เท่านั้น)
//   GET    → รายการหมวดหมู่ + image_url + จำนวนครุภัณฑ์
//   POST   { name }       → เพิ่มหมวดหมู่
//   PATCH  { id, name }   → เปลี่ยนชื่อ
//   DELETE ?id= | { id }  → ลบ (เฉพาะหมวดหมู่ที่ไม่มีครุภัณฑ์)
// รูปหมวดหมู่อัปโหลด/ลบผ่าน /api/images (ownerType "category")
// =========================================================

const MAX_NAME = 100;

const fail = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

const DUPLICATE_MESSAGE = "มีหมวดหมู่ชื่อนี้อยู่แล้ว";

function parseName(value: unknown) {
  const name = String(value ?? "").trim();

  if (!name) return { error: "กรุณากรอกชื่อหมวดหมู่" };

  if (name.length > MAX_NAME) {
    return { error: `ชื่อหมวดหมู่ต้องไม่เกิน ${MAX_NAME} ตัวอักษร` };
  }

  return { name };
}

function parseId(value: unknown) {
  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
}

async function readBody(request: Request) {
  try {
    const body = await request.json();

    return body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/* =========================================================
   GET
========================================================= */

export async function GET() {
  if (!(await requireAdmin())) {
    return fail("ไม่มีสิทธิ์เข้าถึงข้อมูล", 403);
  }

  try {
    const [rows] = await db.execute<RowDataPacket[]>(`
      SELECT
        c.id,
        c.name,
        c.image_url,
        (
          SELECT COUNT(*)
          FROM equipment e
          WHERE e.category_id = c.id
        ) AS equipment_count
      FROM equipment_categories c
      ORDER BY c.id ASC
    `);

    const data = rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      image_url: row.image_url ? String(row.image_url) : null,
      equipment_count: Number(row.equipment_count || 0),
    }));

    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return fail("ไม่สามารถโหลดหมวดหมู่ได้", 500);
  }
}

/* =========================================================
   POST - เพิ่มหมวดหมู่
========================================================= */

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return fail("ไม่มีสิทธิ์เพิ่มหมวดหมู่", 403);
  }

  const parsed = parseName((await readBody(request)).name);

  if ("error" in parsed) return fail(parsed.error as string, 400);

  try {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO equipment_categories (name) VALUES (?)`,
      [parsed.name]
    );

    return NextResponse.json({
      success: true,
      id: Number(result.insertId),
    });
  } catch (error) {
    if (isDuplicateError(error)) return fail(DUPLICATE_MESSAGE, 409);

    console.error("CREATE CATEGORY ERROR:", error);

    return fail("ไม่สามารถเพิ่มหมวดหมู่ได้", 500);
  }
}

/* =========================================================
   PATCH - เปลี่ยนชื่อหมวดหมู่
========================================================= */

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return fail("ไม่มีสิทธิ์แก้ไขหมวดหมู่", 403);
  }

  const body = await readBody(request);
  const id = parseId(body.id);

  if (!id) return fail("รหัสหมวดหมู่ไม่ถูกต้อง", 400);

  const parsed = parseName(body.name);

  if ("error" in parsed) return fail(parsed.error as string, 400);

  try {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE equipment_categories SET name = ? WHERE id = ?`,
      [parsed.name, id]
    );

    if (result.affectedRows === 0) {
      // affectedRows = 0 อาจเป็นเพราะชื่อเดิม — ตรวจว่ามีหมวดหมู่นี้จริงไหม
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT id FROM equipment_categories WHERE id = ? LIMIT 1`,
        [id]
      );

      if (rows.length === 0) return fail("ไม่พบหมวดหมู่", 404);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDuplicateError(error)) return fail(DUPLICATE_MESSAGE, 409);

    console.error("UPDATE CATEGORY ERROR:", error);

    return fail("ไม่สามารถแก้ไขหมวดหมู่ได้", 500);
  }
}

/* =========================================================
   DELETE - ลบหมวดหมู่ (ต้องไม่มีครุภัณฑ์)
========================================================= */

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return fail("ไม่มีสิทธิ์ลบหมวดหมู่", 403);
  }

  const queryId = new URL(request.url).searchParams.get("id");
  const id = parseId(queryId ?? (await readBody(request)).id);

  if (!id) return fail("รหัสหมวดหมู่ไม่ถูกต้อง", 400);

  try {
    const [countRows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM equipment WHERE category_id = ?`,
      [id]
    );

    const total = Number(countRows[0]?.total || 0);

    if (total > 0) {
      return fail(
        `ไม่สามารถลบได้ เนื่องจากมีครุภัณฑ์ในหมวดหมู่นี้ ${total} รายการ`,
        409
      );
    }

    const [result] = await db.execute<ResultSetHeader>(
      `DELETE FROM equipment_categories WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) return fail("ไม่พบหมวดหมู่", 404);

    await db.execute(
      `DELETE FROM images WHERE owner_type = 'category' AND owner_id = ?`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return fail("ไม่สามารถลบหมวดหมู่ได้", 500);
  }
}
