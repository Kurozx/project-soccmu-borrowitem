import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1 AS connected");

    return NextResponse.json({
      success: true,
      message: "เชื่อมต่อฐานข้อมูลสำเร็จ",
      data: rows,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "เชื่อมต่อฐานข้อมูลไม่สำเร็จ",
        error:
          error instanceof Error
            ? error.message
            : "Unknown database error",
      },
      { status: 500 }
    );
  }
}