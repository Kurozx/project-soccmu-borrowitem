import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import { db } from "@/lib/db";
import {
  ALLOWED_MIME,
  BORROWING_KINDS,
  MAX_BYTES,
  MAX_IMAGES,
  OWNER_TYPES,
  SINGLE_IMAGE,
  canDelete,
  canUpload,
  canView,
  getViewer,
  imageUrl,
  ownerExists,
  syncPrimaryImage,
  type OwnerType,
} from "@/lib/images";

export const dynamic = "force-dynamic";

const fail = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

function parseOwner(
  type: unknown,
  id: unknown,
  kind: unknown
):
  | { error: string }
  | { type: OwnerType; ownerId: number; kind: string | null } {
  const ownerType = String(type || "") as OwnerType;
  const ownerId = Number(id);

  if (!OWNER_TYPES.includes(ownerType)) {
    return { error: "ประเภทรูปภาพไม่ถูกต้อง" };
  }

  if (!Number.isInteger(ownerId) || ownerId <= 0) {
    return { error: "รหัสเจ้าของรูปไม่ถูกต้อง" };
  }

  if (ownerType === "borrowing") {
    const value = String(kind || "");

    if (!(BORROWING_KINDS as readonly string[]).includes(value)) {
      return { error: "กรุณาระบุว่าเป็นรูปตอนยืมหรือตอนคืน" };
    }

    return { type: ownerType, ownerId, kind: value };
  }

  return { type: ownerType, ownerId, kind: null };
}

/* =========================================================
   GET /api/images?ownerType=&ownerId=[&kind=]
   รายการรูปของเจ้าของ
========================================================= */

export async function GET(request: Request) {
  const viewer = await getViewer();

  if (!viewer) return fail("กรุณาเข้าสู่ระบบ", 401);

  const params = new URL(request.url).searchParams;
  const kindParam = params.get("kind");

  const owner = parseOwner(
    params.get("ownerType"),
    params.get("ownerId"),
    // borrowing: ไม่ระบุ kind = ดึงทั้งตอนยืมและตอนคืน
    kindParam ?? "borrow"
  );

  if ("error" in owner) return fail(owner.error, 400);

  try {
    if (!(await canView(viewer, owner.type, owner.ownerId))) {
      return fail("ไม่มีสิทธิ์ดูรูปภาพนี้", 403);
    }

    const filterKind = owner.type === "borrowing" && kindParam;

    const [rows] = await db.execute(
      `
      SELECT id, kind, created_by, created_at
      FROM images
      WHERE owner_type = ? AND owner_id = ?
        ${filterKind ? "AND kind = ?" : ""}
      ORDER BY sort_order ASC, id ASC
      `,
      filterKind
        ? [owner.type, owner.ownerId, owner.kind as string]
        : [owner.type, owner.ownerId]
    );

    const list = rows as {
      id: number;
      kind: string | null;
      created_by: number | null;
      created_at: Date;
    }[];

    const data = await Promise.all(
      list.map(async (row) => ({
        id: Number(row.id),
        url: imageUrl(Number(row.id)),
        kind: row.kind,
        createdAt: new Date(row.created_at).toISOString(),
        // ให้หน้าเว็บซ่อนปุ่มลบของรูปที่ผู้ใช้ลบไม่ได้
        canDelete: await canDelete(viewer, {
          owner_type: owner.type,
          owner_id: owner.ownerId,
          created_by:
            row.created_by === null ? null : Number(row.created_by),
        }),
      }))
    );

    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("LIST IMAGES ERROR:", error);

    return fail("ไม่สามารถโหลดรูปภาพได้", 500);
  }
}

/* =========================================================
   POST /api/images  (multipart: file, ownerType, ownerId, kind?)
========================================================= */

export async function POST(request: Request) {
  const viewer = await getViewer();

  if (!viewer) return fail("กรุณาเข้าสู่ระบบ", 401);

  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    return fail("ข้อมูลไม่ถูกต้อง", 400);
  }

  const owner = parseOwner(
    form.get("ownerType"),
    form.get("ownerId"),
    form.get("kind")
  );

  if ("error" in owner) return fail(owner.error, 400);

  const file = form.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return fail("กรุณาเลือกรูปภาพ", 400);
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return fail("รองรับเฉพาะไฟล์ PNG, JPG หรือ WEBP", 400);
  }

  if (file.size > MAX_BYTES) {
    return fail("ไฟล์รูปภาพต้องไม่เกิน 2 MB", 400);
  }

  try {
    if (!(await ownerExists(owner.type, owner.ownerId))) {
      return fail("ไม่พบข้อมูลที่ต้องการแนบรูป", 404);
    }

    if (!(await canUpload(viewer, owner.type, owner.ownerId))) {
      return fail("ไม่มีสิทธิ์อัปโหลดรูปภาพนี้", 403);
    }

    const single = SINGLE_IMAGE.includes(owner.type);

    // นับรูปที่มีอยู่ (borrowing นับแยกตาม kind)
    const [countRows] = await db.execute(
      `
      SELECT COUNT(*) AS n, COALESCE(MAX(sort_order), -1) AS maxOrder
      FROM images
      WHERE owner_type = ? AND owner_id = ?
        ${owner.kind ? "AND kind = ?" : ""}
      `,
      owner.kind
        ? [owner.type, owner.ownerId, owner.kind]
        : [owner.type, owner.ownerId]
    );

    const count = countRows as { n: number; maxOrder: number }[];
    const existing = Number(count[0]?.n || 0);

    if (!single && existing >= MAX_IMAGES[owner.type]) {
      return fail(
        `อัปโหลดได้สูงสุด ${MAX_IMAGES[owner.type]} รูป`,
        409
      );
    }

    // ประเภทรูปเดียว → ลบรูปเดิมก่อน
    if (single) {
      await db.execute(
        `DELETE FROM images WHERE owner_type = ? AND owner_id = ?`,
        [owner.type, owner.ownerId]
      );
    }

    const data = Buffer.from(await file.arrayBuffer());

    const [result] = await db.execute<ResultSetHeader>(
      `
      INSERT INTO images
        (owner_type, owner_id, kind, mime_type, data, sort_order, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        owner.type,
        owner.ownerId,
        owner.kind,
        file.type,
        data,
        single ? 0 : Number(count[0]?.maxOrder ?? -1) + 1,
        viewer.id,
      ]
    );

    await syncPrimaryImage(owner.type, owner.ownerId);

    const id = Number(result.insertId);

    return NextResponse.json({
      success: true,
      data: { id, url: imageUrl(id), kind: owner.kind },
    });
  } catch (error) {
    console.error("UPLOAD IMAGE ERROR:", error);

    return fail("ไม่สามารถอัปโหลดรูปภาพได้", 500);
  }
}
