import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// รายการที่ยังไม่คืน
const ACTIVE = "('approved', 'borrowed', 'overdue')";

// DB เก็บเวลาเป็น UTC — แปลงเป็นเวลาไทยก่อนจัดกลุ่มตามเดือน
const TH = (column: string) =>
  `DATE_ADD(${column}, INTERVAL 7 HOUR)`;

type Row = Record<string, unknown>;

async function query<T extends Row>(
  sql: string,
  params: (string | number)[] = []
) {
  const [rows] = await db.execute(sql, params);

  return rows as T[];
}

const num = (value: unknown) => Number(value || 0);

/* =======================================================
   GET /api/admin/dashboard?year=2026
======================================================= */

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "ไม่มีสิทธิ์เข้าถึงข้อมูล" },
      { status: 403 }
    );
  }

  const nowTh = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const currentYear = nowTh.getUTCFullYear();
  const currentMonth = nowTh.getUTCMonth() + 1;

  const yearParam = Number(
    new URL(request.url).searchParams.get("year")
  );

  const year =
    Number.isInteger(yearParam) &&
    yearParam >= 2000 &&
    yearParam <= currentYear
      ? yearParam
      : currentYear;

  try {
    const [
      equipmentRows,
      activeRows,
      monthlyBorrowRows,
      monthlyReturnRows,
      thisMonthRows,
      userRows,
      avgRows,
      popularRows,
      overdueRows,
      activityRows,
      yearRows,
    ] = await Promise.all([
      // ---------- ครุภัณฑ์ ----------
      query(`
        SELECT
          COALESCE(SUM(quantity), 0) AS total,
          COALESCE(SUM(
            CASE WHEN status IN ('available', 'borrowed')
              THEN available_quantity ELSE 0 END
          ), 0) AS available,
          COALESCE(SUM(
            CASE WHEN status = 'maintenance'
              THEN quantity ELSE 0 END
          ), 0) AS maintenance,
          COALESCE(SUM(
            CASE WHEN status = 'inactive'
              THEN quantity ELSE 0 END
          ), 0) AS inactive,
          COALESCE(SUM(
            CASE WHEN status = 'damaged'
              THEN quantity ELSE 0 END
          ), 0) AS damaged,
          COALESCE(SUM(
            CASE WHEN status = 'lost'
              THEN quantity ELSE 0 END
          ), 0) AS lost
        FROM equipment
      `),

      // ---------- กำลังยืม / ค้างส่ง ----------
      query(`
        SELECT
          COALESCE(SUM(quantity), 0) AS borrowed,
          COALESCE(SUM(
            CASE WHEN due_date < NOW() THEN quantity ELSE 0 END
          ), 0) AS overdue
        FROM borrowings
        WHERE status IN ${ACTIVE}
      `),

      // ---------- กราฟรายเดือน ----------
      query(
        `
        SELECT MONTH(${TH("borrow_date")}) AS m, COUNT(*) AS n
        FROM borrowings
        WHERE YEAR(${TH("borrow_date")}) = ?
          AND status NOT IN ('pending', 'rejected')
        GROUP BY m
        `,
        [year]
      ),

      query(
        `
        SELECT MONTH(${TH("return_date")}) AS m, COUNT(*) AS n
        FROM borrowings
        WHERE return_date IS NOT NULL
          AND YEAR(${TH("return_date")}) = ?
        GROUP BY m
        `,
        [year]
      ),

      // ---------- เดือนนี้ ----------
      query(
        `
        SELECT
          COALESCE(SUM(
            CASE WHEN YEAR(${TH("borrow_date")}) = ?
              AND MONTH(${TH("borrow_date")}) = ?
              AND status NOT IN ('pending', 'rejected')
            THEN 1 ELSE 0 END
          ), 0) AS borrows,
          COALESCE(SUM(
            CASE WHEN return_date IS NOT NULL
              AND YEAR(${TH("return_date")}) = ?
              AND MONTH(${TH("return_date")}) = ?
            THEN 1 ELSE 0 END
          ), 0) AS returns
        FROM borrowings
        `,
        [currentYear, currentMonth, currentYear, currentMonth]
      ),

      query(`
        SELECT COUNT(*) AS n FROM users WHERE role = 'user'
      `),

      query(`
        SELECT
          AVG(TIMESTAMPDIFF(HOUR, borrow_date, return_date)) / 24
            AS days
        FROM borrowings
        WHERE status = 'returned' AND return_date IS NOT NULL
      `),

      // ---------- ถูกยืมบ่อย ----------
      query(`
        SELECT
          e.name,
          e.equipment_code AS code,
          COUNT(b.id) AS n
        FROM borrowings b
        INNER JOIN equipment e ON b.equipment_id = e.id
        WHERE b.status NOT IN ('pending', 'rejected')
        GROUP BY e.id, e.name, e.equipment_code
        ORDER BY n DESC, e.name ASC
        LIMIT 5
      `),

      // ---------- ค้างส่ง ----------
      query(`
        SELECT
          b.id,
          u.username,
          e.name AS equipment_name,
          e.equipment_code AS code,
          b.due_date
        FROM borrowings b
        INNER JOIN users u ON b.user_id = u.id
        INNER JOIN equipment e ON b.equipment_id = e.id
        WHERE b.status IN ${ACTIVE}
          AND b.due_date < NOW()
        ORDER BY b.due_date ASC
        LIMIT 10
      `),

      // ---------- กิจกรรมล่าสุด ----------
      query(`
        SELECT
          l.id,
          l.action,
          l.description,
          l.created_at,
          u.username
        FROM activity_logs l
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC, l.id DESC
        LIMIT 6
      `),

      // ---------- ปีที่มีข้อมูล ----------
      query(`
        SELECT DISTINCT YEAR(${TH("borrow_date")}) AS y
        FROM borrowings
        ORDER BY y DESC
      `),
    ]);

    const equipment = equipmentRows[0] ?? {};
    const active = activeRows[0] ?? {};
    const thisMonth = thisMonthRows[0] ?? {};

    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      borrow: num(
        monthlyBorrowRows.find((r) => num(r.m) === i + 1)?.n
      ),
      returned: num(
        monthlyReturnRows.find((r) => num(r.m) === i + 1)?.n
      ),
    }));

    const years = Array.from(
      new Set([
        currentYear,
        ...yearRows.map((r) => num(r.y)).filter(Boolean),
      ])
    ).sort((a, b) => b - a);

    return NextResponse.json(
      {
        success: true,
        data: {
          updatedAt: new Date().toISOString(),
          year,
          years,
          equipment: {
            total: num(equipment.total),
            available: num(equipment.available),
            borrowed: num(active.borrowed),
            overdue: num(active.overdue),
            maintenance: num(equipment.maintenance),
            inactive: num(equipment.inactive),
            damaged: num(equipment.damaged),
            lost: num(equipment.lost),
          },
          monthly,
          thisMonth: {
            borrows: num(thisMonth.borrows),
            returns: num(thisMonth.returns),
          },
          totalUsers: num(userRows[0]?.n),
          avgBorrowDays:
            avgRows[0]?.days == null
              ? null
              : Math.round(num(avgRows[0].days) * 10) / 10,
          popular: popularRows.map((r) => ({
            name: String(r.name),
            code: String(r.code),
            count: num(r.n),
          })),
          overdueList: overdueRows.map((r) => ({
            id: num(r.id),
            username: String(r.username),
            equipmentName: String(r.equipment_name),
            code: String(r.code),
            dueDate: r.due_date,
          })),
          activity: activityRows.map((r) => ({
            id: num(r.id),
            action: String(r.action),
            description: r.description
              ? String(r.description)
              : "",
            createdAt: r.created_at,
            username: r.username ? String(r.username) : "ระบบ",
          })),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้",
      },
      { status: 500 }
    );
  }
}
