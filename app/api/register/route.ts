import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("REGISTER BODY:", {
      username: body.username,
      email: body.email,
      hasPassword: !!body.password,
    });

    const username = String(body.username || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกข้อมูลให้ครบ",
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
          message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    // ตรวจ username ซ้ำ
    const [usernameRows] = await db.execute(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (Array.isArray(usernameRows) && usernameRows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Username นี้ถูกใช้งานแล้ว",
        },
        { status: 409 }
      );
    }

    // ตรวจ email ซ้ำ
    const [emailRows] = await db.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (Array.isArray(emailRows) && emailRows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email นี้ถูกใช้งานแล้ว",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Password hash created");

    // เพิ่มผู้ใช้
    const [result] = await db.execute(
      `
      INSERT INTO users
      (username, email, password, role)
      VALUES (?, ?, ?, ?)
      `,
      [username, email, hashedPassword, "user"]
    );

    console.log("REGISTER SUCCESS:", result);

    return NextResponse.json(
      {
        success: true,
        message: "สมัครสมาชิกสำเร็จ",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการสมัครสมาชิก",
      },
      { status: 500 }
    );
  }
}