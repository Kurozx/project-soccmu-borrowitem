import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  canDelete,
  canView,
  getViewer,
  syncPrimaryImage,
  type OwnerType,
} from "@/lib/images";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ImageRow = {
  id: number;
  owner_type: OwnerType;
  owner_id: number;
  created_by: number | null;
  mime_type: string;
  data?: Buffer;
};

async function getImageId(context: RouteContext) {
  const { id } = await context.params;
  const imageId = Number(id);

  return Number.isInteger(imageId) && imageId > 0 ? imageId : null;
}

/* =========================================================
   GET /api/images/[id] — ส่งไฟล์รูป
========================================================= */

export async function GET(_request: Request, context: RouteContext) {
  const viewer = await getViewer();

  if (!viewer) return new Response("Unauthorized", { status: 401 });

  const imageId = await getImageId(context);

  if (!imageId) return new Response("Not found", { status: 404 });

  try {
    const [rows] = await db.execute(
      `
      SELECT id, owner_type, owner_id, created_by, mime_type, data
      FROM images
      WHERE id = ?
      LIMIT 1
      `,
      [imageId]
    );

    const image = (rows as ImageRow[])[0];

    if (!image || !image.data) {
      return new Response("Not found", { status: 404 });
    }

    if (!(await canView(viewer, image.owner_type, Number(image.owner_id)))) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response(new Uint8Array(image.data), {
      headers: {
        "Content-Type": image.mime_type,
        // id ของรูปไม่ซ้ำและเนื้อหาไม่เปลี่ยน จึง cache ได้นาน
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET IMAGE ERROR:", error);

    return new Response("Error", { status: 500 });
  }
}

/* =========================================================
   DELETE /api/images/[id]
========================================================= */

export async function DELETE(_request: Request, context: RouteContext) {
  const viewer = await getViewer();

  if (!viewer) {
    return NextResponse.json(
      { success: false, message: "กรุณาเข้าสู่ระบบ" },
      { status: 401 }
    );
  }

  const imageId = await getImageId(context);

  if (!imageId) {
    return NextResponse.json(
      { success: false, message: "ไม่พบรูปภาพ" },
      { status: 404 }
    );
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT id, owner_type, owner_id, created_by, mime_type
      FROM images
      WHERE id = ?
      LIMIT 1
      `,
      [imageId]
    );

    const image = (rows as ImageRow[])[0];

    if (!image) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรูปภาพ" },
        { status: 404 }
      );
    }

    const allowed = await canDelete(viewer, {
      owner_type: image.owner_type,
      owner_id: Number(image.owner_id),
      created_by:
        image.created_by === null ? null : Number(image.created_by),
    });

    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์ลบรูปภาพนี้" },
        { status: 403 }
      );
    }

    await db.execute(`DELETE FROM images WHERE id = ?`, [imageId]);
    await syncPrimaryImage(image.owner_type, Number(image.owner_id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE IMAGE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "ไม่สามารถลบรูปภาพได้" },
      { status: 500 }
    );
  }
}
