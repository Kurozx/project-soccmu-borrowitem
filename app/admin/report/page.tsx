"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type ReportRow = {
  month: string;
  borrow: number;
  returned: number;
  overdue: number;
};

const monthlyData: ReportRow[] = [
  {
    month: "ม.ค.",
    borrow: 42,
    returned: 38,
    overdue: 4,
  },
  {
    month: "ก.พ.",
    borrow: 56,
    returned: 51,
    overdue: 5,
  },
  {
    month: "มี.ค.",
    borrow: 68,
    returned: 61,
    overdue: 7,
  },
  {
    month: "เม.ย.",
    borrow: 49,
    returned: 45,
    overdue: 4,
  },
  {
    month: "พ.ค.",
    borrow: 74,
    returned: 69,
    overdue: 5,
  },
  {
    month: "มิ.ย.",
    borrow: 82,
    returned: 75,
    overdue: 7,
  },
  {
    month: "ก.ค.",
    borrow: 91,
    returned: 84,
    overdue: 7,
  },
  {
    month: "ส.ค.",
    borrow: 77,
    returned: 72,
    overdue: 5,
  },
  {
    month: "ก.ย.",
    borrow: 64,
    returned: 60,
    overdue: 4,
  },
  {
    month: "ต.ค.",
    borrow: 70,
    returned: 65,
    overdue: 5,
  },
  {
    month: "พ.ย.",
    borrow: 58,
    returned: 55,
    overdue: 3,
  },
  {
    month: "ธ.ค.",
    borrow: 63,
    returned: 59,
    overdue: 4,
  },
];

const popularEquipment = [
  {
    rank: 1,
    name: "Canon EOS 90D",
    category: "กล้องถ่ายภาพ",
    borrow: 48,
  },
  {
    rank: 2,
    name: "Sony Alpha A6400",
    category: "กล้องถ่ายภาพ",
    borrow: 41,
  },
  {
    rank: 3,
    name: "MacBook Pro 14",
    category: "คอมพิวเตอร์",
    borrow: 36,
  },
  {
    rank: 4,
    name: "Epson EB-X06",
    category: "โปรเจคเตอร์",
    borrow: 29,
  },
  {
    rank: 5,
    name: "iPad Air",
    category: "แท็บเล็ต",
    borrow: 25,
  },
];

const categoryData = [
  {
    name: "กล้องถ่ายภาพ",
    count: 89,
  },
  {
    name: "คอมพิวเตอร์",
    count: 72,
  },
  {
    name: "โปรเจคเตอร์",
    count: 54,
  },
  {
    name: "เครื่องเสียง",
    count: 38,
  },
  {
    name: "แท็บเล็ต",
    count: 25,
  },
];

const recentTransactions = [
  {
    id: "BR-2026-00125",
    user: "สมชาย ใจดี",
    equipment: "Canon EOS 90D",
    borrowDate: "06/09/2026",
    returnDate: "08/09/2026",
    status: "กำลังยืม",
  },
  {
    id: "BR-2026-00124",
    user: "กมลชนก แสงดี",
    equipment: "MacBook Pro 14",
    borrowDate: "05/09/2026",
    returnDate: "07/09/2026",
    status: "คืนแล้ว",
  },
  {
    id: "BR-2026-00123",
    user: "ธนกร ใจบุญ",
    equipment: "Sony Alpha A6400",
    borrowDate: "04/09/2026",
    returnDate: "06/09/2026",
    status: "คืนแล้ว",
  },
  {
    id: "BR-2026-00122",
    user: "พิมพ์ชนก สุขใจ",
    equipment: "Epson EB-X06",
    borrowDate: "03/09/2026",
    returnDate: "05/09/2026",
    status: "เกินกำหนด",
  },
  {
    id: "BR-2026-00121",
    user: "อาจารย์วิชัย สมบูรณ์",
    equipment: "iPad Air",
    borrowDate: "02/09/2026",
    returnDate: "04/09/2026",
    status: "คืนแล้ว",
  },
];

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("ปีนี้");

  const [category, setCategory] =
    useState("ทุกประเภท");

  const [reportType, setReportType] =
    useState("จำนวนรายการ");

  const filteredData = useMemo(() => {
    if (period === "6 เดือนล่าสุด") {
      return monthlyData.slice(-6);
    }

    if (period === "3 เดือนล่าสุด") {
      return monthlyData.slice(-3);
    }

    return monthlyData;
  }, [period]);

  const totalBorrow = filteredData.reduce(
    (sum, item) => sum + item.borrow,
    0
  );

  const totalReturned = filteredData.reduce(
    (sum, item) => sum + item.returned,
    0
  );

  const totalOverdue = filteredData.reduce(
    (sum, item) => sum + item.overdue,
    0
  );

  const returnRate =
    totalBorrow > 0
      ? Math.round(
          (totalReturned / totalBorrow) * 100
        )
      : 0;

  const maxValue = Math.max(
    ...filteredData.map((item) => item.borrow)
  );

  const handleExport = () => {
    alert(
      "เตรียมส่งออกข้อมูลรายงานเป็นไฟล์ Excel / PDF"
    );
  };

  return (
    <main className="bg-light min-vh-100">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">

        <div className="container-fluid px-4">

          <Link
            href="/"
            className="navbar-brand d-flex align-items-center gap-3"
          >

            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: "48px",
                height: "48px",
                background: "#6f42c1",
                color: "#fff",
              }}
            >
              <i className="bi bi-box-seam fs-4"></i>
            </div>

            <div>
              <div className="fw-bold">
                ระบบยืม–คืนครุภัณฑ์
              </div>

              <small className="text-secondary">
                Admin Panel
              </small>
            </div>

          </Link>


          <div className="d-flex align-items-center gap-3">

            <div className="text-end d-none d-md-block">
              <div className="fw-semibold">
                ผู้ดูแลระบบ
              </div>

              <small className="text-secondary">
                Administrator
              </small>
            </div>

            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "45px",
                height: "45px",
                background: "#eee8ff",
                color: "#6f42c1",
              }}
            >
              <i className="bi bi-person-fill fs-5"></i>
            </div>

          </div>

        </div>

      </nav>


      {/* =====================================================
          LAYOUT
      ===================================================== */}

      <div className="container-fluid">

        <div className="row">


          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside
            className="col-lg-2 bg-white border-end d-none d-lg-block"
            style={{
              minHeight:
                "calc(100vh - 73px)",
            }}
          >

            <div className="pt-4">

              <small className="text-secondary px-3">
                MENU
              </small>


              <div className="mt-3">

                <AdminMenu
                  href="/dashboard"
                  icon="bi-speedometer2"
                  title="Dashboard"
                />

                <AdminMenu
                  href="/admin/equipment"
                  icon="bi-box-seam"
                  title="จัดการครุภัณฑ์"
                />

                <AdminMenu
                  href="/admin/borrowing"
                  icon="bi-arrow-left-right"
                  title="รายการยืม–คืน"
                />

                <AdminMenu
                  href="/admin/users"
                  icon="bi-people"
                  title="จัดการผู้ใช้งาน"
                />

                <AdminMenu
                  href="/admin/maintenance"
                  icon="bi-tools"
                  title="รายการซ่อม"
                />

                <AdminMenu
                  href="/admin/reports"
                  icon="bi-bar-chart-line"
                  title="รายงานสถิติ"
                  active
                />

              </div>


              <hr className="my-4" />


              <small className="text-secondary px-3">
                SYSTEM
              </small>


              <div className="mt-3">

                <AdminMenu
                  href="/"
                  icon="bi-house"
                  title="กลับหน้าหลัก"
                />

              </div>

            </div>

          </aside>


          {/* =================================================
              MAIN
          ================================================= */}

          <section className="col-lg-10 px-3 px-lg-4 py-4">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

              <div>

                <div className="text-secondary small mb-1">
                  Admin / Reports
                </div>

                <h2 className="fw-bold mb-1">
                  รายงานสถิติการยืม–คืน
                </h2>

                <p className="text-secondary mb-0">
                  วิเคราะห์ข้อมูลการใช้งานครุภัณฑ์ของคณะสังคมศาสตร์
                </p>

              </div>


              <button
                className="btn btn-outline-dark rounded-pill px-4"
                onClick={handleExport}
              >

                <i className="bi bi-download me-2"></i>

                ส่งออกรายงาน

              </button>

            </div>


            {/* =================================================
                FILTER
            ================================================= */}

            <div className="card border-0 shadow-sm rounded-4 mb-4">

              <div className="card-body p-4">

                <div className="row g-3 align-items-end">

                  <div className="col-md-4">

                    <label className="form-label fw-semibold">
                      ช่วงเวลา
                    </label>

                    <select
                      className="form-select"
                      value={period}
                      onChange={(e) =>
                        setPeriod(
                          e.target.value
                        )
                      }
                    >

                      <option>
                        ปีนี้
                      </option>

                      <option>
                        6 เดือนล่าสุด
                      </option>

                      <option>
                        3 เดือนล่าสุด
                      </option>

                    </select>

                  </div>


                  <div className="col-md-4">

                    <label className="form-label fw-semibold">
                      ประเภทครุภัณฑ์
                    </label>

                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) =>
                        setCategory(
                          e.target.value
                        )
                      }
                    >

                      <option>
                        ทุกประเภท
                      </option>

                      <option>
                        กล้องถ่ายภาพ
                      </option>

                      <option>
                        คอมพิวเตอร์
                      </option>

                      <option>
                        โปรเจคเตอร์
                      </option>

                      <option>
                        เครื่องเสียง
                      </option>

                      <option>
                        แท็บเล็ต
                      </option>

                    </select>

                  </div>


                  <div className="col-md-4">

                    <label className="form-label fw-semibold">
                      รูปแบบข้อมูล
                    </label>

                    <select
                      className="form-select"
                      value={reportType}
                      onChange={(e) =>
                        setReportType(
                          e.target.value
                        )
                      }
                    >

                      <option>
                        จำนวนรายการ
                      </option>

                      <option>
                        จำนวนผู้ใช้งาน
                      </option>

                      <option>
                        ระยะเวลาการยืม
                      </option>

                    </select>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="row g-3 mb-4">

              <ReportStat
                title="รายการยืมทั้งหมด"
                value={totalBorrow.toString()}
                unit="รายการ"
                icon="bi-box-arrow-up-right"
                color="#6f42c1"
                description="ตามช่วงเวลาที่เลือก"
              />

              <ReportStat
                title="คืนแล้ว"
                value={totalReturned.toString()}
                unit="รายการ"
                icon="bi-box-arrow-in-down-left"
                color="#198754"
                description={`อัตราการคืน ${returnRate}%`}
              />

              <ReportStat
                title="เกินกำหนด"
                value={totalOverdue.toString()}
                unit="รายการ"
                icon="bi-exclamation-circle"
                color="#dc3545"
                description="ควรติดตามการคืน"
              />

              <ReportStat
                title="กำลังยืม"
                value="23"
                unit="รายการ"
                icon="bi-clock-history"
                color="#fd7e14"
                description="รายการที่ยังไม่คืน"
              />

            </div>


            {/* =================================================
                MAIN CHART
            ================================================= */}

            <div className="row g-4 mb-4">

              <div className="col-xl-8">

                <div className="card border-0 shadow-sm rounded-4 h-100">

                  <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-start mb-4">

                      <div>

                        <h5 className="fw-bold mb-1">
                          สถิติการยืม–คืน
                        </h5>

                        <small className="text-secondary">
                          เปรียบเทียบจำนวนรายการในแต่ละเดือน
                        </small>

                      </div>


                      <div className="d-flex gap-3 small">

                        <span>
                          <i className="bi bi-circle-fill text-primary me-1"></i>
                          ยืม
                        </span>

                        <span>
                          <i className="bi bi-circle-fill text-success me-1"></i>
                          คืน
                        </span>

                        <span>
                          <i className="bi bi-circle-fill text-danger me-1"></i>
                          เกินกำหนด
                        </span>

                      </div>

                    </div>


                    {/* BAR CHART */}

                    <div
                      className="d-flex align-items-end gap-2 gap-md-3"
                      style={{
                        height: "300px",
                      }}
                    >

                      {filteredData.map(
                        (item) => {

                          const borrowHeight =
                            (item.borrow /
                              maxValue) *
                            220;

                          const returnedHeight =
                            (item.returned /
                              maxValue) *
                            220;

                          const overdueHeight =
                            (item.overdue /
                              maxValue) *
                            220;

                          return (

                            <div
                              key={item.month}
                              className="flex-grow-1 h-100 d-flex flex-column justify-content-end"
                            >

                              <div className="d-flex align-items-end justify-content-center gap-1 h-100">

                                <div
                                  className="rounded-top bg-primary"
                                  style={{
                                    width: "30%",
                                    maxWidth:
                                      "24px",
                                    height:
                                      `${borrowHeight}px`,
                                  }}
                                  title={`ยืม ${item.borrow}`}
                                ></div>

                                <div
                                  className="rounded-top bg-success"
                                  style={{
                                    width: "30%",
                                    maxWidth:
                                      "24px",
                                    height:
                                      `${returnedHeight}px`,
                                  }}
                                  title={`คืน ${item.returned}`}
                                ></div>

                                <div
                                  className="rounded-top bg-danger"
                                  style={{
                                    width: "20%",
                                    maxWidth:
                                      "16px",
                                    height:
                                      `${overdueHeight}px`,
                                  }}
                                  title={`เกินกำหนด ${item.overdue}`}
                                ></div>

                              </div>


                              <div className="text-center small text-secondary mt-2">
                                {item.month}
                              </div>

                            </div>

                          );

                        }
                      )}

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  RETURN RATE
              ================================================= */}

              <div className="col-xl-4">

                <div className="card border-0 shadow-sm rounded-4 h-100">

                  <div className="card-body p-4">

                    <h5 className="fw-bold mb-1">
                      อัตราการคืนครุภัณฑ์
                    </h5>

                    <small className="text-secondary">
                      เปรียบเทียบรายการยืมและคืน
                    </small>


                    <div className="text-center py-4">

                      <div
                        className="mx-auto rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "170px",
                          height: "170px",
                          background:
                            `conic-gradient(#198754 ${returnRate}%, #e9ecef 0)`,
                        }}
                      >

                        <div
                          className="rounded-circle bg-white d-flex flex-column align-items-center justify-content-center"
                          style={{
                            width: "135px",
                            height: "135px",
                          }}
                        >

                          <strong
                            className="display-5 fw-bold text-success"
                          >
                            {returnRate}%
                          </strong>

                          <small className="text-secondary">
                            อัตราการคืน
                          </small>

                        </div>

                      </div>

                    </div>


                    <div className="d-flex justify-content-between border-top pt-3">

                      <div>

                        <small className="text-secondary d-block">
                          ยืมทั้งหมด
                        </small>

                        <strong>
                          {totalBorrow}
                        </strong>

                      </div>


                      <div className="text-end">

                        <small className="text-secondary d-block">
                          คืนแล้ว
                        </small>

                        <strong className="text-success">
                          {totalReturned}
                        </strong>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                POPULAR EQUIPMENT + CATEGORY
            ================================================= */}

            <div className="row g-4 mb-4">


              {/* POPULAR */}

              <div className="col-xl-7">

                <div className="card border-0 shadow-sm rounded-4">

                  <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center mb-4">

                      <div>

                        <h5 className="fw-bold mb-1">
                          ครุภัณฑ์ที่ถูกยืมบ่อย
                        </h5>

                        <small className="text-secondary">
                          5 อันดับแรก
                        </small>

                      </div>

                      <i className="bi bi-trophy fs-4 text-warning"></i>

                    </div>


                    {popularEquipment.map(
                      (item) => (

                        <div
                          key={item.rank}
                          className="d-flex align-items-center gap-3 py-3 border-bottom"
                        >

                          <div
                            className="rounded-3 d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: "40px",
                              height: "40px",
                              background:
                                item.rank === 1
                                  ? "#fff3cd"
                                  : "#f8f9fa",
                              color:
                                item.rank === 1
                                  ? "#997404"
                                  : "#6c757d",
                            }}
                          >
                            {item.rank}
                          </div>


                          <div
                            className="rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                              width: "45px",
                              height: "45px",
                              background:
                                "#eee8ff",
                              color:
                                "#6f42c1",
                            }}
                          >
                            <i className="bi bi-camera fs-5"></i>
                          </div>


                          <div className="flex-grow-1">

                            <div className="fw-semibold">
                              {item.name}
                            </div>

                            <small className="text-secondary">
                              {item.category}
                            </small>

                          </div>


                          <div className="text-end">

                            <strong>
                              {item.borrow}
                            </strong>

                            <small className="text-secondary ms-1">
                              ครั้ง
                            </small>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              </div>


              {/* CATEGORY */}

              <div className="col-xl-5">

                <div className="card border-0 shadow-sm rounded-4">

                  <div className="card-body p-4">

                    <h5 className="fw-bold mb-1">
                      สถิติแยกตามประเภท
                    </h5>

                    <small className="text-secondary">
                      จำนวนการยืมตามประเภทครุภัณฑ์
                    </small>


                    <div className="mt-4">

                      {categoryData.map(
                        (item) => {

                          const percentage =
                            Math.round(
                              (item.count /
                                89) *
                                100
                            );

                          return (

                            <div
                              key={item.name}
                              className="mb-4"
                            >

                              <div className="d-flex justify-content-between mb-2">

                                <span className="small fw-semibold">
                                  {item.name}
                                </span>

                                <span className="small text-secondary">
                                  {item.count} ครั้ง
                                </span>

                              </div>


                              <div
                                className="progress"
                                style={{
                                  height: "8px",
                                }}
                              >

                                <div
                                  className="progress-bar"
                                  style={{
                                    width:
                                      `${percentage}%`,
                                  }}
                                ></div>

                              </div>

                            </div>

                          );

                        }
                      )}

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                RECENT TRANSACTIONS
            ================================================= */}

            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-center mb-4">

                  <div>

                    <h5 className="fw-bold mb-1">
                      รายการยืม–คืนล่าสุด
                    </h5>

                    <small className="text-secondary">
                      รายการล่าสุดของระบบ
                    </small>

                  </div>


                  <Link
                    href="/admin/borrowing"
                    className="btn btn-light rounded-pill px-3"
                  >
                    ดูทั้งหมด
                    <i className="bi bi-arrow-right ms-2"></i>
                  </Link>

                </div>


                <div className="table-responsive">

                  <table className="table align-middle">

                    <thead>

                      <tr className="text-secondary">

                        <th>
                          เลขรายการ
                        </th>

                        <th>
                          ผู้ยืม
                        </th>

                        <th>
                          ครุภัณฑ์
                        </th>

                        <th>
                          วันที่ยืม
                        </th>

                        <th>
                          กำหนดคืน
                        </th>

                        <th>
                          สถานะ
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {recentTransactions.map(
                        (item) => (

                          <tr key={item.id}>

                            <td>
                              <span className="fw-semibold">
                                {item.id}
                              </span>
                            </td>


                            <td>
                              {item.user}
                            </td>


                            <td>

                              <div className="d-flex align-items-center gap-2">

                                <div
                                  className="rounded-2 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "35px",
                                    height: "35px",
                                    background:
                                      "#f1eef6",
                                    color:
                                      "#6f42c1",
                                  }}
                                >

                                  <i className="bi bi-box-seam"></i>

                                </div>

                                <span>
                                  {item.equipment}
                                </span>

                              </div>

                            </td>


                            <td>
                              {item.borrowDate}
                            </td>


                            <td>
                              {item.returnDate}
                            </td>


                            <td>

                              <StatusBadge
                                status={
                                  item.status
                                }
                              />

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>


            {/* =================================================
                FOOTER NOTE
            ================================================= */}

            <div className="mt-4">

              <div className="alert alert-light border rounded-4">

                <div className="d-flex gap-3">

                  <i className="bi bi-info-circle text-primary fs-5"></i>

                  <div>

                    <div className="fw-semibold">
                      หมายเหตุ
                    </div>

                    <small className="text-secondary">
                      ข้อมูลในหน้านี้เป็นข้อมูลตัวอย่าง
                      เมื่อเชื่อมต่อฐานข้อมูลจริง
                      ระบบสามารถคำนวณสถิติจากรายการยืม–คืนแบบอัตโนมัติได้
                    </small>

                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}


/* =========================================================
   ADMIN MENU
========================================================= */

function AdminMenu({
  href,
  icon,
  title,
  active = false,
}: {
  href: string;
  icon: string;
  title: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`d-flex align-items-center gap-3 mx-2 px-3 py-3 rounded-3 text-decoration-none ${
        active
          ? "text-white"
          : "text-secondary"
      }`}
      style={
        active
          ? {
              background: "#6f42c1",
            }
          : undefined
      }
    >
      <i className={`${icon} fs-5`}></i>

      <span className="fw-medium">
        {title}
      </span>
    </Link>
  );
}


/* =========================================================
   REPORT STAT
========================================================= */

function ReportStat({
  title,
  value,
  unit,
  icon,
  color,
  description,
}: {
  title: string;
  value: string;
  unit: string;
  icon: string;
  color: string;
  description: string;
}) {
  return (
    <div className="col-sm-6 col-xl-3">

      <div className="card border-0 shadow-sm rounded-4 h-100">

        <div className="card-body p-4">

          <div className="d-flex align-items-start justify-content-between">

            <div>

              <small className="text-secondary d-block mb-2">
                {title}
              </small>

              <div className="d-flex align-items-baseline gap-2">

                <strong className="display-6 fw-bold">
                  {value}
                </strong>

                <small className="text-secondary">
                  {unit}
                </small>

              </div>

            </div>


            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: "50px",
                height: "50px",
                background: `${color}15`,
                color,
              }}
            >
              <i className={`${icon} fs-5`}></i>
            </div>

          </div>


          <small className="text-secondary">
            <i className="bi bi-info-circle me-1"></i>
            {description}
          </small>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {

  const config: Record<
    string,
    {
      className: string;
      icon: string;
    }
  > = {
    "กำลังยืม": {
      className:
        "bg-warning-subtle text-warning-emphasis",
      icon: "bi-clock",
    },

    "คืนแล้ว": {
      className:
        "bg-success-subtle text-success",
      icon: "bi-check-circle",
    },

    "เกินกำหนด": {
      className:
        "bg-danger-subtle text-danger",
      icon: "bi-exclamation-circle",
    },
  };

  const current =
    config[status] ?? {
      className:
        "bg-secondary-subtle text-secondary",
      icon: "bi-circle",
    };

  return (
    <span
      className={`badge rounded-pill px-3 py-2 ${current.className}`}
    >

      <i
        className={`${current.icon} me-1`}
      ></i>

      {status}

    </span>
  );
}

