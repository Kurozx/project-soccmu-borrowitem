import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const connection = await db.getConnection();

  try {
    /* =======================================================
       AUTH
    ======================================================= */

    const session = await auth();

    if (!session?.user) {
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

    if (session.user.role !== "user") {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์ดำเนินการ",
        },
        {
          status: 403,
        }
      );
    }

    const userId = Number(session.user.id);

    if (!Number.isFinite(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ข้อมูลผู้ใช้ไม่ถูกต้อง",
        },
        {
          status: 401,
        }
      );
    }

    /* =======================================================
       GET BORROWING ID
    ======================================================= */

    const { id } = await context.params;

    const borrowingId = Number(id);

    if (!Number.isInteger(borrowingId) || borrowingId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสรายการยืมไม่ถูกต้อง",
        },
        {
          status: 400,
        }
      );
    }

    /* =======================================================
       TRANSACTION
    ======================================================= */

    await connection.beginTransaction();

    /* -------------------------------------------------------
       LOCK BORROWING
    ------------------------------------------------------- */

    const [borrowingRows] =
      await connection.execute(
        `
        SELECT
          b.id,
          b.user_id,
          b.equipment_id,
          b.quantity,
          b.status,
          e.name AS equipment_name

        FROM borrowings b

        INNER JOIN equipment e
          ON b.equipment_id = e.id

        WHERE
          b.id = ?
          AND b.user_id = ?

        LIMIT 1

        FOR UPDATE
        `,
        [
          borrowingId,
          userId,
        ]
      );

    if (
      !Array.isArray(borrowingRows) ||
      borrowingRows.length === 0
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่พบรายการยืมนี้ หรือรายการนี้ไม่ใช่ของคุณ",
        },
        {
          status: 404,
        }
      );
    }

    const borrowing =
      borrowingRows[0] as {
        id: number;
        user_id: number;
        equipment_id: number;
        quantity: number;
        status: string;
        equipment_name: string;
      };

    /* -------------------------------------------------------
       CHECK STATUS
    ------------------------------------------------------- */

    if (
      ![
        "approved",
        "borrowed",
        "overdue",
      ].includes(borrowing.status)
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "รายการนี้ไม่สามารถดำเนินการคืนได้",
        },
        {
          status: 400,
        }
      );
    }

    /* -------------------------------------------------------
       UPDATE BORROWING
    ------------------------------------------------------- */

    await connection.execute(
      `
      UPDATE borrowings

      SET
        return_date = NOW(),
        status = 'returned',
        updated_at = CURRENT_TIMESTAMP

      WHERE
        id = ?
        AND user_id = ?
      `,
      [
        borrowingId,
        userId,
      ]
    );

    /* -------------------------------------------------------
       UPDATE EQUIPMENT
       เพิ่มจำนวนที่พร้อมใช้งานกลับ
    ------------------------------------------------------- */

    await connection.execute(
      `
      UPDATE equipment

      SET
        available_quantity =
          LEAST(
            quantity,
            available_quantity + ?
          ),

        status =
          CASE
            WHEN available_quantity + ? >= quantity
              THEN 'available'
            WHEN available_quantity + ? > 0
              THEN 'borrowed'
            ELSE status
          END,

        updated_at = CURRENT_TIMESTAMP

      WHERE id = ?
      `,
      [
        borrowing.quantity,
        borrowing.quantity,
        borrowing.quantity,
        borrowing.equipment_id,
      ]
    );

    /* -------------------------------------------------------
       ACTIVITY LOG
    ------------------------------------------------------- */

    await connection.execute(
      `
      INSERT INTO activity_logs
      (
        user_id,
        action,
        description
      )

      VALUES
      (
        ?,
        ?,
        ?
      )
      `,
      [
        userId,
        "RETURN_EQUIPMENT",
        `คืนครุภัณฑ์ ${borrowing.equipment_name} รายการยืม #${borrowingId}`,
      ]
    );

    /* -------------------------------------------------------
       COMMIT
    ------------------------------------------------------- */

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message:
          "คืนครุภัณฑ์สำเร็จ",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    await connection.rollback();

    console.error(
      "RETURN BORROWING API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการคืนครุภัณฑ์",
      },
      {
        status: 500,
      }
    );
  } finally {
    connection.release();
  }
}