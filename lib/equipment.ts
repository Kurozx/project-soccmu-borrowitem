import { auth } from "@/auth";

export const EQUIPMENT_STATUSES = [
  "available",
  "borrowed",
  "maintenance",
  "inactive",
  "damaged",
  "lost",
] as const;

export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

/* =========================================================
   CHECK ADMIN
========================================================= */

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return session;
}

/* =========================================================
   VALIDATE BODY (ใช้ร่วมกับ POST / PUT)
========================================================= */

export function parseEquipmentBody(body: Record<string, unknown>) {
  const code = String(body.code || "").trim();
  const name = String(body.name || "").trim();
  const location = String(body.location || "").trim();
  const description = String(body.description || "").trim();
  const categoryId = Number(body.categoryId);
  const quantity = Number(body.quantity);
  const status = String(body.status || "available") as EquipmentStatus;

  if (!code || !name || !location) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { error: "กรุณาเลือกหมวดหมู่" };
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return { error: "จำนวนครุภัณฑ์ต้องมากกว่า 0" };
  }

  if (!EQUIPMENT_STATUSES.includes(status)) {
    return { error: "สถานะไม่ถูกต้อง" };
  }

  const purchaseDate = parsePurchaseDate(body.purchaseDate);

  if (purchaseDate === undefined) {
    return { error: "วันที่ซื้อไม่ถูกต้อง" };
  }

  return {
    data: {
      code,
      name,
      location,
      description: description || null,
      categoryId,
      quantity,
      status,
      purchaseDate,
    },
  };
}

/* =========================================================
   PURCHASE DATE
   - "" / null / undefined → null
   - "YYYY-MM-DD" ที่เป็นวันที่จริง และไม่เกินวันนี้ → string
   - อื่น ๆ → undefined (ไม่ถูกต้อง)
========================================================= */

function todayInBangkok() {
  // วันที่ปัจจุบันตามเวลาไทย (UTC+7) ในรูปแบบ YYYY-MM-DD
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function parsePurchaseDate(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null;

  const text = String(value).trim();
  if (!text) return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return undefined;

  const date = new Date(`${text}T00:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== text ||
    date.getUTCFullYear() < 1900
  ) {
    return undefined;
  }

  if (text > todayInBangkok()) return undefined;

  return text;
}

/** แปลงค่า DATE จาก mysql2 (Date ที่ UTC เที่ยงคืน หรือ string) เป็น "YYYY-MM-DD" */
export function formatDateOnly(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value.toISOString().slice(0, 10);
  }

  const text = String(value);
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : null;
}

export function isDuplicateError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  );
}

