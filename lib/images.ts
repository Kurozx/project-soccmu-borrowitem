import { auth } from "@/auth";
import { db } from "@/lib/db";

// =========================================================
// ระบบรูปภาพกลาง (ตาราง images)
// owner_type:
//   user      = รูปโปรไฟล์ (1 รูป, แทนที่ของเดิม)       → users.avatar_url
//   equipment = รูปครุภัณฑ์ (หลายรูป, รูปแรก = ปก)       → equipment.image_url
//   category  = รูปหมวดหมู่ (1 รูป, แทนที่ของเดิม)       → equipment_categories.image_url
//   borrowing = รูปหลักฐานตอนยืม/คืน (kind: borrow | return)
// =========================================================

export const OWNER_TYPES = [
  "user",
  "equipment",
  "category",
  "borrowing",
] as const;

export type OwnerType = (typeof OWNER_TYPES)[number];

export const BORROWING_KINDS = ["borrow", "return"] as const;

export const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];

export const MAX_BYTES = 2 * 1024 * 1024;

// จำนวนรูปสูงสุดต่อเจ้าของ (ต่อ kind สำหรับ borrowing)
export const MAX_IMAGES: Record<OwnerType, number> = {
  user: 1,
  equipment: 8,
  category: 1,
  borrowing: 3,
};

// ประเภทที่มีได้รูปเดียว — อัปโหลดใหม่จะแทนที่ของเดิม
export const SINGLE_IMAGE: OwnerType[] = ["user", "category"];

export const imageUrl = (id: number) => `/api/images/${id}`;

export type Viewer = {
  id: number;
  role: "user" | "admin";
};

export async function getViewer(): Promise<Viewer | null> {
  const session = await auth();

  if (!session?.user) return null;

  const id = Number(session.user.id);

  if (!Number.isFinite(id)) return null;

  return {
    id,
    role: session.user.role === "admin" ? "admin" : "user",
  };
}

async function borrowingOwner(borrowingId: number) {
  const [rows] = await db.execute(
    `SELECT user_id FROM borrowings WHERE id = ? LIMIT 1`,
    [borrowingId]
  );

  const row = (rows as { user_id: number }[])[0];

  return row ? Number(row.user_id) : null;
}

export async function ownerExists(type: OwnerType, ownerId: number) {
  const table = {
    user: "users",
    equipment: "equipment",
    category: "equipment_categories",
    borrowing: "borrowings",
  }[type];

  const [rows] = await db.execute(
    `SELECT id FROM ${table} WHERE id = ? LIMIT 1`,
    [ownerId]
  );

  return Array.isArray(rows) && rows.length > 0;
}

/* ---------------- permissions ---------------- */

export async function canView(
  viewer: Viewer,
  type: OwnerType,
  ownerId: number
) {
  if (viewer.role === "admin") return true;

  if (type === "equipment" || type === "category") return true;

  if (type === "user") return ownerId === viewer.id;

  return (await borrowingOwner(ownerId)) === viewer.id;
}

export async function canUpload(
  viewer: Viewer,
  type: OwnerType,
  ownerId: number
) {
  if (viewer.role === "admin") return true;

  if (type === "user") return ownerId === viewer.id;

  if (type === "borrowing") {
    return (await borrowingOwner(ownerId)) === viewer.id;
  }

  return false;
}

export async function canDelete(
  viewer: Viewer,
  image: { owner_type: OwnerType; owner_id: number; created_by: number | null }
) {
  if (viewer.role === "admin") return true;

  if (image.owner_type === "user") return image.owner_id === viewer.id;

  // รูปหลักฐานยืม–คืน ผู้ใช้ลบได้เฉพาะรูปที่ตัวเองอัปโหลด
  if (image.owner_type === "borrowing") {
    return image.created_by === viewer.id;
  }

  return false;
}

/* ---------------- sync ลิงก์รูปหลัก ---------------- */

// อัปเดต avatar_url / image_url ให้ชี้ไปที่รูปแรก (หรือ NULL ถ้าไม่มีรูป)
export async function syncPrimaryImage(type: OwnerType, ownerId: number) {
  if (type === "borrowing") return;

  const [rows] = await db.execute(
    `
    SELECT id
    FROM images
    WHERE owner_type = ? AND owner_id = ?
    ORDER BY sort_order ASC, id ASC
    LIMIT 1
    `,
    [type, ownerId]
  );

  const first = (rows as { id: number }[])[0];
  const url = first ? imageUrl(Number(first.id)) : null;

  const target = {
    user: ["users", "avatar_url"],
    equipment: ["equipment", "image_url"],
    category: ["equipment_categories", "image_url"],
  }[type];

  await db.execute(
    `UPDATE ${target[0]} SET ${target[1]} = ? WHERE id = ?`,
    [url, ownerId]
  );
}
