import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as {
  db: mysql.Pool | undefined;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export const db =
  globalForDb.db ??
  mysql.createPool({
    uri: process.env.DATABASE_URL,

    // TiDB เก็บเวลาเป็น UTC (NOW() = UTC)
    // ให้ mysql2 อ่าน/เขียน DATETIME เป็น UTC ด้วย ไม่งั้นเวลาจะเพี้ยน 7 ชั่วโมง
    timezone: "Z",

    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },

    waitForConnections: true,
    connectionLimit: 1,
    maxIdle: 1,
    enableKeepAlive: true,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}