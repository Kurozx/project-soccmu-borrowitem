import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type UserRole = "user" | "admin";

const USER_TYPES = ["student", "teacher", "staff"] as const;
type UserType = (typeof USER_TYPES)[number];

/* =========================================================
   RESOLVE USER TYPE
   - role = user  → ต้องเลือก student / teacher / staff
   - role = admin → ไม่ใช้ประเภทผู้ใช้ (NULL)
========================================================= */

function resolveUserType(
  role: UserRole,
  value: unknown
): { ok: true; userType: UserType | null } | { ok: false } {
  if (role === "admin") {
    return { ok: true, userType: null };
  }

  const userType = String(value ?? "").trim();

  if (!USER_TYPES.includes(userType as UserType)) {
    return { ok: false };
  }

  return { ok: true, userType: userType as UserType };
}

const USER_TYPE_ERROR = "กรุณาเลือกประเภทผู้ใช้";

/* =========================================================
   CHECK ADMIN
========================================================= */

async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (session.user.role !== "admin") {
    return null;
  }

  return session;
}

/* =========================================================
   GET - READ
========================================================= */

export async function GET() {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์เข้าถึงข้อมูล",
        },
        { status: 403 }
      );
    }

    const [rows] = await db.execute(`
      SELECT
        id,
        username,
        email,
        role,
        user_type,
        avatar_url,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถดึงข้อมูลผู้ใช้งานได้",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST - CREATE
========================================================= */

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์เพิ่มผู้ใช้งาน",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const username = String(body.username || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = String(body.role || "user") as UserRole;

    /* VALIDATE */

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกชื่อผู้ใช้ อีเมล และรหัสผ่าน",
        },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "สิทธิ์ผู้ใช้ไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    const userTypeResult = resolveUserType(role, body.userType);

    if (!userTypeResult.ok) {
      return NextResponse.json(
        {
          success: false,
          message: USER_TYPE_ERROR,
        },
        { status: 400 }
      );
    }

    /* CHECK USERNAME */

    const [usernameRows] = await db.execute(
      `
      SELECT id
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
      [username]
    );

    if (
      Array.isArray(usernameRows) &&
      usernameRows.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว",
        },
        { status: 409 }
      );
    }

    /* CHECK EMAIL */

    const [emailRows] = await db.execute(
      `
      SELECT id
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    if (
      Array.isArray(emailRows) &&
      emailRows.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "อีเมลนี้ถูกใช้งานแล้ว",
        },
        { status: 409 }
      );
    }

    /* HASH PASSWORD */

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    /* INSERT */

    const [result] = await db.execute(
      `
      INSERT INTO users
      (
        username,
        email,
        password,
        role,
        user_type
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        username,
        email,
        hashedPassword,
        role,
        userTypeResult.userType,
      ]
    );

    const insertResult = result as {
      insertId: number;
    };

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มผู้ใช้งานสำเร็จ",
        id: insertResult.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถเพิ่มผู้ใช้งานได้",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   PATCH - UPDATE
========================================================= */

export async function PATCH(request: Request) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์แก้ไขผู้ใช้งาน",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const id = Number(body.id);
    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const role = String(body.role || "") as UserRole;
    const password = String(body.password || "");

    if (!id || !email || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "ข้อมูลไม่ครบถ้วน",
        },
        { status: 400 }
      );
    }

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "สิทธิ์ผู้ใช้ไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    const userTypeResult = resolveUserType(role, body.userType);

    if (!userTypeResult.ok) {
      return NextResponse.json(
        {
          success: false,
          message: USER_TYPE_ERROR,
        },
        { status: 400 }
      );
    }

    /* =====================================================
       CHECK TARGET USER
    ===================================================== */

    const [userRows] = await db.execute(
      `
      SELECT id, username, email, role
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (
      !Array.isArray(userRows) ||
      userRows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบผู้ใช้งาน",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       PREVENT SELF DEMOTION
    ===================================================== */

    if (
      String(session.user.id) === String(id) &&
      role !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่สามารถลดสิทธิ์บัญชี Admin ที่กำลังใช้งานอยู่ได้",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       CHECK EMAIL DUPLICATE
    ===================================================== */

    const [emailRows] = await db.execute(
      `
      SELECT id
      FROM users
      WHERE email = ?
      AND id <> ?
      LIMIT 1
      `,
      [email, id]
    );

    if (
      Array.isArray(emailRows) &&
      emailRows.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "อีเมลนี้ถูกใช้งานโดยผู้ใช้งานคนอื่นแล้ว",
        },
        { status: 409 }
      );
    }

    /* =====================================================
       UPDATE WITH PASSWORD
    ===================================================== */

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message:
              "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร",
          },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      await db.execute(
        `
        UPDATE users
        SET
          email = ?,
          password = ?,
          role = ?,
          user_type = ?
        WHERE id = ?
        `,
        [
          email,
          hashedPassword,
          role,
          userTypeResult.userType,
          id,
        ]
      );
    } else {
      /* ===================================================
         UPDATE WITHOUT PASSWORD
      =================================================== */

      await db.execute(
        `
        UPDATE users
        SET
          email = ?,
          role = ?,
          user_type = ?
        WHERE id = ?
        `,
        [
          email,
          role,
          userTypeResult.userType,
          id,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: "แก้ไขข้อมูลผู้ใช้งานสำเร็จ",
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถแก้ไขข้อมูลผู้ใช้งานได้",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE - DELETE
========================================================= */

export async function DELETE(request: Request) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์ลบผู้ใช้งาน",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const id = Number(body.id);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบรหัสผู้ใช้งาน",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       PREVENT SELF DELETE
    ===================================================== */

    if (
      String(session.user.id) === String(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่สามารถลบบัญชี Admin ที่กำลังเข้าสู่ระบบอยู่ได้",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       CHECK USER
    ===================================================== */

    const [rows] = await db.execute(
      `
      SELECT id
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (
      !Array.isArray(rows) ||
      rows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบผู้ใช้งาน",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       DELETE
    ===================================================== */

    await db.execute(
      `
      DELETE FROM users
      WHERE id = ?
      `,
      [id]
    );

    // ลบรูปโปรไฟล์ของผู้ใช้ที่ถูกลบ (ระบบรูปภาพกลาง)
    await db.execute(
      `
      DELETE FROM images
      WHERE owner_type = 'user' AND owner_id = ?
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "ลบผู้ใช้งานสำเร็จ",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถลบผู้ใช้งานได้",
      },
      { status: 500 }
    );
  }
}