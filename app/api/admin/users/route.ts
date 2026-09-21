import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type UserRole = "user" | "admin";

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
          message: "กรุณากรอก Username, Email และ Password",
        },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Username ต้องมีอย่างน้อย 3 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password ต้องมีอย่างน้อย 6 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Role ไม่ถูกต้อง",
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
          message: "Username นี้ถูกใช้งานแล้ว",
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
          message: "Email นี้ถูกใช้งานแล้ว",
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
        role
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        username,
        email,
        hashedPassword,
        role,
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
          message: "Role ไม่ถูกต้อง",
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
          message: "Email นี้ถูกใช้งานโดยผู้ใช้งานคนอื่นแล้ว",
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
              "Password ใหม่ต้องมีอย่างน้อย 6 ตัวอักษร",
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
          role = ?
        WHERE id = ?
        `,
        [
          email,
          hashedPassword,
          role,
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
          role = ?
        WHERE id = ?
        `,
        [
          email,
          role,
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
          message: "ไม่พบ ID ผู้ใช้งาน",
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