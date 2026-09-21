"use client";

// =========================================================
// ตัวช่วยฝั่งเบราว์เซอร์สำหรับระบบรูปภาพกลาง (/api/images)
// =========================================================

export type OwnerType = "user" | "equipment" | "category" | "borrowing";

export type BorrowingKind = "borrow" | "return";

export type StoredImage = {
  id: number;
  url: string;
  kind: string | null;
  createdAt: string;
  canDelete?: boolean;
};

export const ACCEPT_IMAGES = "image/png,image/jpeg,image/webp";

const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

// ย่อรูปก่อนอัปโหลด (ด้านยาวสุด maxSize px, WEBP)
export function resizeImage(file: File, maxSize = 1280): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED.includes(file.type)) {
      reject(new Error("รองรับเฉพาะไฟล์ PNG, JPG หรือ WEBP"));
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");

      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas
        .getContext("2d")
        ?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("ไม่สามารถแปลงรูปภาพได้")),
        "image/webp",
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("ไม่สามารถอ่านไฟล์รูปภาพได้"));
    };

    img.src = url;
  });
}

async function readJson(response: Response) {
  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    throw new Error(body?.message || "เกิดข้อผิดพลาด");
  }

  return body;
}

// อัปโหลดรูป (ย่อให้อัตโนมัติ) — คืนข้อมูลรูปที่บันทึกแล้ว
export async function uploadImage(options: {
  file: File | Blob;
  ownerType: OwnerType;
  ownerId: number;
  kind?: BorrowingKind;
  maxSize?: number;
}): Promise<StoredImage> {
  const blob =
    options.file instanceof File
      ? await resizeImage(options.file, options.maxSize)
      : options.file;

  const form = new FormData();
  form.append("file", blob, "image.webp");
  form.append("ownerType", options.ownerType);
  form.append("ownerId", String(options.ownerId));

  if (options.kind) form.append("kind", options.kind);

  const body = await readJson(
    await fetch("/api/images", { method: "POST", body: form })
  );

  return body.data;
}

export async function listImages(options: {
  ownerType: OwnerType;
  ownerId: number;
  kind?: BorrowingKind;
}): Promise<StoredImage[]> {
  const params = new URLSearchParams({
    ownerType: options.ownerType,
    ownerId: String(options.ownerId),
  });

  if (options.kind) params.set("kind", options.kind);

  const body = await readJson(
    await fetch(`/api/images?${params}`, { cache: "no-store" })
  );

  return body.data;
}

export async function deleteImage(id: number) {
  await readJson(await fetch(`/api/images/${id}`, { method: "DELETE" }));
}
