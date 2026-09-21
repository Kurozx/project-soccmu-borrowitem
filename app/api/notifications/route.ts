import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// แจ้งเตือนคำนวณจากข้อมูลจริงในฐานข้อมูลทุกครั้งที่เรียก
// (ไม่มีตารางแยก) — สถานะ "อ่านแล้ว" เก็บฝั่งเบราว์เซอร์ด้วย id ที่คงที่

type Tone = "rose" | "amber" | "blue" | "emerald" | "purple" | "neutral";

type Notification = {
  id: string;
  tone: Tone;
  icon: string;
  title: string;
  message: string;
  href: string;
  createdAt: string;
};

const ACTIVE = "('approved', 'borrowed', 'overdue')";
const DUE_SOON_HOURS = 48;
const DAY_MS = 24 * 60 * 60 * 1000;

type Row = Record<string, unknown>;

async function query(sql: string, params: (string | number)[] = []) {
  const [rows] = await db.execute(sql, params);

  return rows as Row[];
}

const iso = (value: unknown) =>
  new Date(value as string | Date).toISOString();

function thaiDate(value: unknown) {
  return new Date(value as string | Date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Bangkok",
  });
}

function daysLate(value: unknown) {
  const diff = Date.now() - new Date(value as string | Date).getTime();

  return Math.max(1, Math.floor(diff / DAY_MS));
}

/* =========================================================
   USER
========================================================= */

async function userNotifications(userId: number) {
  const [active, rejected] = await Promise.all([
    query(
      `
      SELECT b.id, b.due_date, e.name
      FROM borrowings b
      INNER JOIN equipment e ON b.equipment_id = e.id
      WHERE b.user_id = ?
        AND b.status IN ${ACTIVE}
        AND b.due_date < DATE_ADD(NOW(), INTERVAL ${DUE_SOON_HOURS} HOUR)
      ORDER BY b.due_date ASC
      `,
      [userId]
    ),

    query(
      `
      SELECT b.id, b.updated_at, e.name
      FROM borrowings b
      INNER JOIN equipment e ON b.equipment_id = e.id
      WHERE b.user_id = ?
        AND b.status = 'rejected'
        AND b.updated_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY b.updated_at DESC
      `,
      [userId]
    ),
  ]);

  const list: Notification[] = [];

  for (const row of active) {
    const overdue = new Date(row.due_date as string) < new Date();

    list.push(
      overdue
        ? {
            id: `overdue:${row.id}:${daysLate(row.due_date)}`,
            tone: "rose",
            icon: "bi-exclamation-triangle",
            title: "เลยกำหนดคืนแล้ว",
            message: `${row.name} เลยกำหนดคืนมา ${daysLate(
              row.due_date
            )} วัน กรุณานำมาคืนโดยเร็ว`,
            href: "/return",
            createdAt: iso(row.due_date),
          }
        : {
            id: `due-soon:${row.id}`,
            tone: "amber",
            icon: "bi-alarm",
            title: "ใกล้ถึงกำหนดคืน",
            message: `${row.name} ครบกำหนดคืน ${thaiDate(row.due_date)}`,
            href: "/return",
            createdAt: new Date(
              new Date(row.due_date as string).getTime() -
                DUE_SOON_HOURS * 60 * 60 * 1000
            ).toISOString(),
          }
    );
  }

  for (const row of rejected) {
    list.push({
      id: `rejected:${row.id}`,
      tone: "neutral",
      icon: "bi-x-circle",
      title: "รายการยืมถูกยกเลิก",
      message: `ผู้ดูแลระบบยกเลิกรายการยืม ${row.name}`,
      href: "/history",
      createdAt: iso(row.updated_at),
    });
  }

  return list;
}

/* =========================================================
   ADMIN
========================================================= */

async function adminNotifications() {
  const [overdue, pending, recent] = await Promise.all([
    query(`
      SELECT b.id, b.due_date, e.name, u.username
      FROM borrowings b
      INNER JOIN equipment e ON b.equipment_id = e.id
      INNER JOIN users u ON b.user_id = u.id
      WHERE b.status IN ${ACTIVE}
        AND b.due_date < NOW()
      ORDER BY b.due_date ASC
      LIMIT 20
    `),

    query(`
      SELECT b.id, b.created_at, e.name, u.username
      FROM borrowings b
      INNER JOIN equipment e ON b.equipment_id = e.id
      INNER JOIN users u ON b.user_id = u.id
      WHERE b.status = 'pending'
      ORDER BY b.created_at DESC
      LIMIT 20
    `),

    query(`
      SELECT l.id, l.action, l.description, l.created_at, u.username
      FROM activity_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.action IN ('BORROW_EQUIPMENT', 'RETURN_EQUIPMENT')
        AND l.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
      ORDER BY l.created_at DESC
      LIMIT 20
    `),
  ]);

  const list: Notification[] = [];

  for (const row of overdue) {
    list.push({
      id: `overdue:${row.id}:${daysLate(row.due_date)}`,
      tone: "rose",
      icon: "bi-exclamation-triangle",
      title: "มีรายการค้างส่ง",
      message: `${row.username} ยังไม่คืน ${row.name} (เกินกำหนด ${daysLate(
        row.due_date
      )} วัน)`,
      href: "/admin/borrowing",
      createdAt: iso(row.due_date),
    });
  }

  for (const row of pending) {
    list.push({
      id: `pending:${row.id}`,
      tone: "amber",
      icon: "bi-hourglass-split",
      title: "คำขอยืมรออนุมัติ",
      message: `${row.username} ขอยืม ${row.name}`,
      href: "/admin/borrowing",
      createdAt: iso(row.created_at),
    });
  }

  for (const row of recent) {
    const isReturn = row.action === "RETURN_EQUIPMENT";

    list.push({
      id: `log:${row.id}`,
      tone: isReturn ? "emerald" : "purple",
      icon: isReturn ? "bi-arrow-return-left" : "bi-box-arrow-up-right",
      title: isReturn ? "มีการคืนครุภัณฑ์" : "มีการยืมครุภัณฑ์",
      message: `${row.username ?? "ผู้ใช้งาน"} — ${row.description ?? ""}`,
      href: "/admin/dashboard",
      createdAt: iso(row.created_at),
    });
  }

  return list;
}

/* =========================================================
   GET /api/notifications
========================================================= */

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "กรุณาเข้าสู่ระบบ" },
      { status: 401 }
    );
  }

  try {
    const list =
      session.user.role === "admin"
        ? await adminNotifications()
        : await userNotifications(Number(session.user.id));

    // ด่วนก่อน (ค้างส่ง) แล้วค่อยเรียงตามเวลาใหม่ → เก่า
    const priority: Record<Tone, number> = {
      rose: 0,
      amber: 1,
      neutral: 2,
      blue: 2,
      emerald: 3,
      purple: 3,
    };

    list.sort(
      (a, b) =>
        priority[a.tone] - priority[b.tone] ||
        b.createdAt.localeCompare(a.createdAt)
    );

    return NextResponse.json(
      { success: true, data: list },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("NOTIFICATIONS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "ไม่สามารถโหลดการแจ้งเตือนได้" },
      { status: 500 }
    );
  }
}
