import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // =====================================================
    // ดึงสถิติครุภัณฑ์
    // =====================================================

    const [equipmentRows] = await db.execute(`
      SELECT
        COALESCE(SUM(quantity), 0) AS total_equipment,
        COALESCE(SUM(available_quantity), 0) AS available_equipment
      FROM equipment
    `);

    // =====================================================
    // ดึงจำนวนครุภัณฑ์ที่กำลังถูกยืม
    //
    // approved = อนุมัติแล้ว
    // borrowed = กำลังยืม
    // overdue  = เกินกำหนด
    // =====================================================

    const [borrowedRows] = await db.execute(`
      SELECT
        COALESCE(SUM(quantity), 0) AS borrowed_equipment
      FROM borrowings
      WHERE status IN (
        'approved',
        'borrowed',
        'overdue'
      )
    `);

    // =====================================================
    // ดึงจำนวนรายการยืมทั้งหมด
    // =====================================================

    const [borrowingRows] = await db.execute(`
      SELECT
        COUNT(*) AS total_borrowings
      FROM borrowings
    `);

    // =====================================================
    // แปลงข้อมูล
    // =====================================================

    const equipmentData =
      Array.isArray(equipmentRows) &&
      equipmentRows.length > 0
        ? (equipmentRows[0] as {
            total_equipment: number | string;
            available_equipment: number | string;
          })
        : {
            total_equipment: 0,
            available_equipment: 0,
          };

    const borrowedData =
      Array.isArray(borrowedRows) &&
      borrowedRows.length > 0
        ? (borrowedRows[0] as {
            borrowed_equipment: number | string;
          })
        : {
            borrowed_equipment: 0,
          };

    const borrowingData =
      Array.isArray(borrowingRows) &&
      borrowingRows.length > 0
        ? (borrowingRows[0] as {
            total_borrowings: number | string;
          })
        : {
            total_borrowings: 0,
          };

    // =====================================================
    // ผลลัพธ์
    // =====================================================

    const data = {
      totalEquipment: Number(
        equipmentData.total_equipment || 0
      ),

      borrowed: Number(
        borrowedData.borrowed_equipment || 0
      ),

      available: Number(
        equipmentData.available_equipment || 0
      ),

      totalBorrowings: Number(
        borrowingData.total_borrowings || 0
      ),
    };

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("HOME STATS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดสถิติจากฐานข้อมูลได้",
      },
      {
        status: 500,
      }
    );
  }
}