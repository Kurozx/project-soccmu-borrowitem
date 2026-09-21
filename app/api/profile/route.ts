import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// =====================================================
// GET PROFILE
// =====================================================
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเข้าสู่ระบบ",
        },
        {
          status: 401,
        }
      );
    }

    const userId = Number(session.user.id);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบรหัสผู้ใช้งาน",
        },
        {
          status: 400,
        }
      );
    }

    const [rows] = await db.execute(
      `
      SELECT
        id,
        username,
        email,
        role,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลผู้ใช้งาน",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// PATCH PROFILE
// =====================================================
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเข้าสู่ระบบ",
        },
        {
          status: 401,
        }
      );
    }

    const userId = Number(session.user.id);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบรหัสผู้ใช้งาน",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const username = String(body.username ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    if (!username || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอก Username และ Email ให้ครบ",
        },
        {
          status: 400,
        }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Username ต้องมีอย่างน้อย 3 ตัวอักษร",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // ตรวจสอบ Username / Email ซ้ำ
    // =================================================
    const [duplicateRows] = await db.execute(
      `
      SELECT id
      FROM users
      WHERE (username = ? OR email = ?)
      AND id <> ?
      LIMIT 1
      `,
      [username, email, userId]
    );

    if (
      Array.isArray(duplicateRows) &&
      duplicateRows.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Username หรือ Email นี้ถูกใช้งานแล้ว",
        },
        {
          status: 409,
        }
      );
    }

    // =================================================
    // UPDATE
    // ไม่ให้ User เปลี่ยน role จากหน้า Profile
    // =================================================
    await db.execute(
      `
      UPDATE users
      SET
        username = ?,
        email = ?
      WHERE id = ?
      `,
      [username, email, userId]
    );

    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลโปรไฟล์สำเร็จ",
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// CHANGE PASSWORD
// =====================================================
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเข้าสู่ระบบ",
        },
        {
          status: 401,
        }
      );
    }

    const userId = Number(session.user.id);

    const body = await request.json();

    const currentPassword = String(
      body.currentPassword ?? ""
    );

    const newPassword = String(
      body.newPassword ?? ""
    );

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกรหัสผ่านให้ครบ",
        },
        {
          status: 400,
        }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // ดึง Password ปัจจุบัน
    // =================================================
    const [rows] = await db.execute(
      `
      SELECT password
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลผู้ใช้งาน",
        },
        {
          status: 404,
        }
      );
    }

    const user = rows[0] as {
      password: string;
    };

    // =================================================
    // ตรวจสอบ Password เดิม
    // =================================================
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสผ่านปัจจุบันไม่ถูกต้อง",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // Hash Password ใหม่
    // =================================================
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await db.execute(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [hashedPassword, userId]
    );

    return NextResponse.json({
      success: true,
      message: "เปลี่ยนรหัสผ่านสำเร็จ",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถเปลี่ยนรหัสผ่านได้",
      },
      {
        status: 500,
      }
    );
  }
}