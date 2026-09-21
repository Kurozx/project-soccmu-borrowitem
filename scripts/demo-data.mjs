// =========================================================
// ข้อมูลจำลองการยืม–คืน (สำหรับทดสอบ / นำเสนอ)
//
//   npm run demo:seed    สร้างผู้ใช้ demo + รายการยืม–คืนย้อนหลัง ~6 เดือน
//   npm run demo:clear   ลบข้อมูล demo ทั้งหมด และคืนจำนวนครุภัณฑ์
//
// ข้อมูล demo แยกจากข้อมูลจริงด้วยชื่อผู้ใช้ขึ้นต้น "demo_"
// ลบได้หมดโดยไม่กระทบข้อมูลจริง
// =========================================================

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const DEMO_PASSWORD = "Demo#1234";
const DAY = 24 * 60 * 60 * 1000;

const DEMO_USERS = [
  { username: "demo_somchai", email: "somchai@demo.local", type: "student" },
  { username: "demo_kanyarat", email: "kanyarat@demo.local", type: "student" },
  { username: "demo_thanakorn", email: "thanakorn@demo.local", type: "student" },
  { username: "demo_ajarn_wichai", email: "wichai@demo.local", type: "teacher" },
  { username: "demo_staff_nok", email: "nok@demo.local", type: "staff" },
];

const PURPOSES = [
  "ถ่ายทำวิดีโอสำหรับโครงงาน",
  "ใช้นำเสนอรายงานในชั้นเรียน",
  "บันทึกกิจกรรมของคณะ",
  "ใช้ในการประชุมภาควิชา",
  "เก็บข้อมูลภาคสนาม",
  "จัดสัมมนาวิชาการ",
  "ใช้สอนในรายวิชา",
  "ถ่ายภาพงานรับน้อง",
];

// สุ่มแบบกำหนด seed — รันซ้ำได้ข้อมูลรูปแบบเดิม
let seed = 20260921;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = (list) => list[Math.floor(rand() * list.length)];
const between = (min, max) => min + Math.floor(rand() * (max - min + 1));

// เวลาไทยช่วงทำการ (9:00–16:59) ของวันที่ห่างจากวันนี้ `daysAgo` วัน
function thaiWorkTime(daysAgo) {
  const date = new Date(Date.now() - daysAgo * DAY);
  const hour = between(9, 16);
  const minute = between(0, 59);

  // ตั้งเวลาไทย แล้วแปลงเป็น UTC (ไทย = UTC+7)
  date.setUTCHours(hour - 7, minute, between(0, 59), 0);

  return date;
}

// สิ้นวันตามเวลาไทย (23:59:59) — ใช้เป็นกำหนดคืน
function thaiEndOfDay(date) {
  const d = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  d.setUTCHours(23, 59, 59, 0);

  return new Date(d.getTime() - 7 * 60 * 60 * 1000);
}

async function connect() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "ไม่พบ DATABASE_URL — รันผ่าน npm run demo:seed (อ่านค่าจาก .env.local)"
    );
  }

  return mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    timezone: "Z",
  });
}

async function demoUserIds(db) {
  const [rows] = await db.query(
    `SELECT id FROM users WHERE username LIKE 'demo\\_%'`
  );

  return rows.map((row) => row.id);
}

/* =========================================================
   CLEAR
========================================================= */

async function clear(db) {
  const ids = await demoUserIds(db);

  if (ids.length === 0) {
    console.log("ไม่มีข้อมูล demo ในระบบ");
    return;
  }

  await db.beginTransaction();

  try {
    // คืนจำนวนครุภัณฑ์ของรายการที่ยังไม่คืน
    const [active] = await db.query(
      `
      SELECT equipment_id, SUM(quantity) AS qty
      FROM borrowings
      WHERE user_id IN (?) AND status IN ('approved', 'borrowed', 'overdue')
      GROUP BY equipment_id
      `,
      [ids]
    );

    for (const row of active) {
      const [[eq]] = await db.query(
        `SELECT quantity, available_quantity, status FROM equipment WHERE id = ? FOR UPDATE`,
        [row.equipment_id]
      );

      if (!eq) continue;

      const available = Math.min(
        Number(eq.quantity),
        Number(eq.available_quantity) + Number(row.qty)
      );

      const status =
        eq.status === "borrowed" && available > 0 ? "available" : eq.status;

      await db.query(
        `UPDATE equipment SET available_quantity = ?, status = ? WHERE id = ?`,
        [available, status, row.equipment_id]
      );
    }

    const [borrowings] = await db.query(
      `SELECT id FROM borrowings WHERE user_id IN (?)`,
      [ids]
    );
    const borrowingIds = borrowings.map((row) => row.id);

    if (borrowingIds.length) {
      await db.query(
        `DELETE FROM images WHERE owner_type = 'borrowing' AND owner_id IN (?)`,
        [borrowingIds]
      );
    }

    await db.query(
      `DELETE FROM images WHERE owner_type = 'user' AND owner_id IN (?)`,
      [ids]
    );
    await db.query(`DELETE FROM activity_logs WHERE user_id IN (?)`, [ids]);
    await db.query(`DELETE FROM borrowings WHERE user_id IN (?)`, [ids]);
    await db.query(`DELETE FROM users WHERE id IN (?)`, [ids]);

    await db.commit();

    console.log(
      `ลบข้อมูล demo แล้ว: ผู้ใช้ ${ids.length} คน, รายการยืม ${borrowingIds.length} รายการ`
    );
  } catch (error) {
    await db.rollback();
    throw error;
  }
}

/* =========================================================
   SEED
========================================================= */

async function seedData(db) {
  if ((await demoUserIds(db)).length > 0) {
    console.log(
      "มีข้อมูล demo อยู่แล้ว — ถ้าต้องการสร้างใหม่ให้รัน npm run demo:clear ก่อน"
    );
    return;
  }

  const [equipment] = await db.query(`
    SELECT id, name, quantity, available_quantity
    FROM equipment
    WHERE status IN ('available', 'borrowed')
    ORDER BY id
  `);

  if (equipment.length === 0) {
    throw new Error("ไม่มีครุภัณฑ์ที่พร้อมใช้งานในระบบ");
  }

  await db.beginTransaction();

  try {
    // ---------- ผู้ใช้ demo ----------
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const users = [];

    for (const user of DEMO_USERS) {
      const [result] = await db.query(
        `
        INSERT INTO users (username, email, password, role, user_type, created_at)
        VALUES (?, ?, ?, 'user', ?, ?)
        `,
        [user.username, user.email, hash, user.type, thaiWorkTime(200)]
      );

      users.push({ id: result.insertId, ...user });
    }

    // จำนวนคงเหลือที่ใช้คำนวณระหว่างสร้างรายการที่ยังไม่คืน
    const stock = new Map(
      equipment.map((e) => [e.id, Number(e.available_quantity)])
    );

    const takeEquipment = () => {
      for (let i = 0; i < 50; i++) {
        const item = pick(equipment);

        if (stock.get(item.id) > 0) {
          stock.set(item.id, stock.get(item.id) - 1);
          return item;
        }
      }

      throw new Error("ครุภัณฑ์คงเหลือไม่พอสำหรับสร้างข้อมูล demo");
    };

    const plans = [];

    // ---------- คืนแล้ว (ย้อนหลัง ~6 เดือน) ----------
    for (let i = 0; i < 38; i++) {
      const daysAgo = between(12, 175);
      const borrowDate = thaiWorkTime(daysAgo);
      const loanDays = pick([3, 5, 7, 7, 7, 14]);
      const due = thaiEndOfDay(new Date(borrowDate.getTime() + loanDays * DAY));
      // ส่วนใหญ่คืนตรงเวลา มีบางรายการคืนช้า
      const late = rand() < 0.18;
      const usedDays = late ? loanDays + between(1, 4) : between(1, loanDays);
      const returnDate = thaiWorkTime(Math.max(daysAgo - usedDays, 1));

      plans.push({
        status: "returned",
        item: pick(equipment),
        borrowDate,
        due,
        returnDate:
          returnDate > borrowDate
            ? returnDate
            : new Date(borrowDate.getTime() + 3 * 60 * 60 * 1000),
      });
    }

    // ---------- กำลังยืม (ยังไม่ถึงกำหนด) ----------
    // มีรายการครบกำหนดใน 1–2 วัน เพื่อให้เห็นการแจ้งเตือน "ใกล้ถึงกำหนดคืน"
    for (const [daysAgo, dueIn] of [
      [1, 1],
      [3, 2],
      [2, 5],
      [0, 7],
      [4, 10],
    ]) {
      const borrowDate = thaiWorkTime(daysAgo);

      plans.push({
        status: "borrowed",
        item: takeEquipment(),
        borrowDate,
        due: thaiEndOfDay(new Date(Date.now() + dueIn * DAY)),
        returnDate: null,
      });
    }

    // ---------- เกินกำหนด (ค้างส่ง) ----------
    for (const [daysAgo, overdueDays] of [
      [12, 5],
      [9, 2],
      [8, 1],
    ]) {
      plans.push({
        status: "borrowed",
        item: takeEquipment(),
        borrowDate: thaiWorkTime(daysAgo),
        due: thaiEndOfDay(new Date(Date.now() - overdueDays * DAY)),
        returnDate: null,
      });
    }

    // ---------- รออนุมัติ ----------
    for (const hoursAgo of [2, 5]) {
      const borrowDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      plans.push({
        status: "pending",
        item: pick(equipment),
        borrowDate,
        due: thaiEndOfDay(new Date(Date.now() + 7 * DAY)),
        returnDate: null,
      });
    }

    // ---------- ยกเลิก ----------
    for (const daysAgo of [30, 3]) {
      const borrowDate = thaiWorkTime(daysAgo);

      plans.push({
        status: "rejected",
        item: pick(equipment),
        borrowDate,
        due: thaiEndOfDay(new Date(borrowDate.getTime() + 7 * DAY)),
        returnDate: null,
      });
    }

    plans.sort((a, b) => a.borrowDate - b.borrowDate);

    // ---------- บันทึกลงฐานข้อมูล ----------
    const counts = {};

    for (const [index, plan] of plans.entries()) {
      const user = users[index % users.length];
      const approvedAt = ["borrowed", "returned"].includes(plan.status)
        ? plan.borrowDate
        : null;

      const [result] = await db.query(
        `
        INSERT INTO borrowings
          (user_id, equipment_id, quantity, borrow_date, due_date, return_date,
           status, purpose, approved_at, created_at, updated_at)
        VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          user.id,
          plan.item.id,
          plan.borrowDate,
          plan.due,
          plan.returnDate,
          plan.status,
          pick(PURPOSES),
          approvedAt,
          plan.borrowDate,
          plan.returnDate ?? plan.borrowDate,
        ]
      );

      const borrowingId = result.insertId;

      if (plan.status === "borrowed" || plan.status === "returned") {
        await db.query(
          `
          INSERT INTO activity_logs (user_id, action, description, created_at)
          VALUES (?, 'BORROW_EQUIPMENT', ?, ?)
          `,
          [
            user.id,
            `ยืมครุภัณฑ์ ${plan.item.name} (สแกน QR) รายการยืม #${borrowingId}`,
            plan.borrowDate,
          ]
        );
      }

      if (plan.status === "returned") {
        await db.query(
          `
          INSERT INTO activity_logs (user_id, action, description, created_at)
          VALUES (?, 'RETURN_EQUIPMENT', ?, ?)
          `,
          [
            user.id,
            `คืนครุภัณฑ์ ${plan.item.name} รายการยืม #${borrowingId}`,
            plan.returnDate,
          ]
        );
      }

      counts[plan.status] = (counts[plan.status] || 0) + 1;
    }

    // ---------- ปรับจำนวนคงเหลือของรายการที่ยังไม่คืน ----------
    for (const item of equipment) {
      const available = stock.get(item.id);

      if (available !== Number(item.available_quantity)) {
        await db.query(
          `UPDATE equipment SET available_quantity = ?, status = ? WHERE id = ?`,
          [available, available > 0 ? "available" : "borrowed", item.id]
        );
      }
    }

    await db.commit();

    const overdue = 3;

    console.log("สร้างข้อมูล demo สำเร็จ");
    console.log(`  ผู้ใช้ demo ${users.length} คน (รหัสผ่าน: ${DEMO_PASSWORD})`);
    for (const user of users) {
      console.log(`    - ${user.username} (${user.type})`);
    }
    console.log(
      `  รายการยืม ${plans.length} รายการ: คืนแล้ว ${counts.returned}, ` +
        `กำลังยืม ${counts.borrowed - overdue}, เกินกำหนด ${overdue}, ` +
        `รออนุมัติ ${counts.pending}, ยกเลิก ${counts.rejected}`
    );
  } catch (error) {
    await db.rollback();
    throw error;
  }
}

/* =========================================================
   MAIN
========================================================= */

const command = process.argv[2];

if (!["seed", "clear"].includes(command)) {
  console.log("ใช้งาน: node --env-file=.env.local scripts/demo-data.mjs seed|clear");
  process.exit(1);
}

const db = await connect();

try {
  if (command === "seed") await seedData(db);
  else await clear(db);
} catch (error) {
  console.error("ผิดพลาด:", error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
