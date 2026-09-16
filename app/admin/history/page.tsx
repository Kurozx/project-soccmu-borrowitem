"use client";

import { useState } from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type BorrowStatus =
  | "คืนแล้ว"
  | "กำลังยืม"
  | "รออนุมัติ"
  | "ยกเลิก";

type BorrowHistory = {
  id: number;
  borrowId: string;
  equipmentCode: string;
  equipmentName: string;
  category: string;
  borrower: string;
  department: string;
  borrowDate: string;
  returnDate: string;
  actualReturnDate?: string;
  purpose: string;
  status: BorrowStatus;
  icon: string;
};

const historyData: BorrowHistory[] = [
  {
    id: 1,
    borrowId: "BR-2026-001",
    equipmentCode: "SOC-LAP-001",
    equipmentName: "Notebook Computer",
    category: "คอมพิวเตอร์",
    borrower: "สมชาย ใจดี",
    department: "ภาควิชาสังคมศาสตร์",
    borrowDate: "2026-09-01",
    returnDate: "2026-09-05",
    actualReturnDate: "2026-09-05",
    purpose: "ใช้สำหรับการเรียนการสอน",
    status: "คืนแล้ว",
    icon: "bi-laptop",
  },
  {
    id: 2,
    borrowId: "BR-2026-002",
    equipmentCode: "SOC-CAM-001",
    equipmentName: "Digital Camera",
    category: "อุปกรณ์ถ่ายภาพ",
    borrower: "กิตติพงษ์ แสงทอง",
    department: "งานประชาสัมพันธ์",
    borrowDate: "2026-09-03",
    returnDate: "2026-09-10",
    purpose: "ถ่ายภาพกิจกรรมของคณะ",
    status: "กำลังยืม",
    icon: "bi-camera",
  },
  {
    id: 3,
    borrowId: "BR-2026-003",
    equipmentCode: "SOC-PRO-001",
    equipmentName: "Projector",
    category: "อุปกรณ์นำเสนอ",
    borrower: "นภัสสร วัฒนะ",
    department: "สำนักงานคณะ",
    borrowDate: "2026-09-04",
    returnDate: "2026-09-06",
    purpose: "ใช้ในการประชุม",
    status: "คืนแล้ว",
    icon: "bi-projector",
    actualReturnDate: "2026-09-06",
  },
  {
    id: 4,
    borrowId: "BR-2026-004",
    equipmentCode: "SOC-MIC-001",
    equipmentName: "Wireless Microphone",
    category: "อุปกรณ์เสียง",
    borrower: "ธนกร บุญมี",
    department: "งานกิจการนักศึกษา",
    borrowDate: "2026-09-05",
    returnDate: "2026-09-12",
    purpose: "ใช้สำหรับจัดกิจกรรม",
    status: "รออนุมัติ",
    icon: "bi-mic",
  },
  {
    id: 5,
    borrowId: "BR-2026-005",
    equipmentCode: "SOC-TAB-001",
    equipmentName: "Tablet",
    category: "อุปกรณ์อิเล็กทรอนิกส์",
    borrower: "พิมพ์ชนก ศรีสุข",
    department: "ภาควิชาสังคมศาสตร์",
    borrowDate: "2026-08-20",
    returnDate: "2026-08-25",
    actualReturnDate: "2026-08-25",
    purpose: "ใช้ในการเก็บข้อมูลภาคสนาม",
    status: "คืนแล้ว",
    icon: "bi-tablet",
  },
  {
    id: 6,
    borrowId: "BR-2026-006",
    equipmentCode: "SOC-LAP-002",
    equipmentName: "Notebook Computer",
    category: "คอมพิวเตอร์",
    borrower: "อาทิตย์ คำแก้ว",
    department: "ภาควิชามานุษยวิทยา",
    borrowDate: "2026-08-15",
    returnDate: "2026-08-20",
    purpose: "ใช้ทำงานวิจัย",
    status: "ยกเลิก",
    icon: "bi-laptop",
  },
  {
    id: 7,
    borrowId: "BR-2026-007",
    equipmentCode: "SOC-CAM-002",
    equipmentName: "Digital Camera",
    category: "อุปกรณ์ถ่ายภาพ",
    borrower: "วรพล ทองดี",
    department: "งานประชาสัมพันธ์",
    borrowDate: "2026-08-10",
    returnDate: "2026-08-15",
    actualReturnDate: "2026-08-14",
    purpose: "ถ่ายภาพกิจกรรม",
    status: "คืนแล้ว",
    icon: "bi-camera",
  },
  {
    id: 8,
    borrowId: "BR-2026-008",
    equipmentCode: "SOC-PRO-002",
    equipmentName: "Projector",
    category: "อุปกรณ์นำเสนอ",
    borrower: "ศุภชัย มณี",
    department: "งานวิชาการ",
    borrowDate: "2026-09-06",
    returnDate: "2026-09-08",
    purpose: "นำเสนอผลงานวิจัย",
    status: "กำลังยืม",
    icon: "bi-projector",
  },
];

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ทั้งหมด");
  const [sort, setSort] = useState("ล่าสุด");
  const [selectedHistory, setSelectedHistory] =
    useState<BorrowHistory | null>(null);

  const filteredHistory = historyData
    .filter((item) => {
      const keyword = search.toLowerCase().trim();

      const searchMatch =
        keyword === "" ||
        item.borrowId.toLowerCase().includes(keyword) ||
        item.equipmentCode.toLowerCase().includes(keyword) ||
        item.equipmentName.toLowerCase().includes(keyword) ||
        item.borrower.toLowerCase().includes(keyword) ||
        item.department.toLowerCase().includes(keyword);

      const statusMatch =
        status === "ทั้งหมด" || item.status === status;

      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      if (sort === "ล่าสุด") {
        return (
          new Date(b.borrowDate).getTime() -
          new Date(a.borrowDate).getTime()
        );
      }

      if (sort === "เก่าสุด") {
        return (
          new Date(a.borrowDate).getTime() -
          new Date(b.borrowDate).getTime()
        );
      }

      if (sort === "วันคืนใกล้สุด") {
        return (
          new Date(a.returnDate).getTime() -
          new Date(b.returnDate).getTime()
        );
      }

      return a.borrowId.localeCompare(b.borrowId);
    });

  const totalCount = historyData.length;

  const returnedCount = historyData.filter(
    (item) => item.status === "คืนแล้ว"
  ).length;

  const borrowingCount = historyData.filter(
    (item) => item.status === "กำลังยืม"
  ).length;

  const pendingCount = historyData.filter(
    (item) => item.status === "รออนุมัติ"
  ).length;

  const resetFilter = () => {
    setSearch("");
    setStatus("ทั้งหมด");
    setSort("ล่าสุด");
  };

  return (
    <main className="bg-light min-vh-100">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">

        <div className="container py-2">

          <Link
            href="/"
            className="navbar-brand d-flex align-items-center gap-3"
          >

            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "48px",
                height: "48px",
                background: "#6f42c1",
                color: "white",
              }}
            >
              <i className="">CMU</i>
            </div>

            <div>

              <div className="fw-bold text-dark">
                ระบบยืม–คืนครุภัณฑ์
              </div>

              <small className="text-secondary">
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
              </small>

            </div>

          </Link>


          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>


          <div
            className="collapse navbar-collapse"
            id="navbarMenu"
          >

            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">

              <li className="nav-item">
                <Link
                  href="/"
                  className="nav-link"
                >
                  <i className="bi bi-house me-1"></i>
                  หน้าหลัก
                </Link>
              </li>


              <li className="nav-item">
                <Link
                  href="/equipment"
                  className="nav-link"
                >
                  <i className="bi bi-box me-1"></i>
                  ครุภัณฑ์
                </Link>
              </li>


              <li className="nav-item">
                <Link
                  href="/search"
                  className="nav-link"
                >
                  <i className="bi bi-search me-1"></i>
                  ค้นหา
                </Link>
              </li>


              <li className="nav-item">
                <Link
                  href="/history"
                  className="nav-link active fw-semibold"
                >
                  <i className="bi bi-clock-history me-1"></i>
                  ประวัติการยืม
                </Link>
              </li>


              <li className="nav-item ms-lg-2">

                <button className="btn btn-outline-dark rounded-pill px-4">

                  <i className="bi bi-person me-1"></i>
                  เข้าสู่ระบบ

                </button>

              </li>

            </ul>

          </div>

        </div>

      </nav>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(135deg, #f5f0ff 0%, #ffffff 60%, #eee8ff 100%)",
        }}
      >

        <div className="container">

          <div className="row align-items-center">

            <div className="col-lg-7">

              <span className="badge rounded-pill bg-white border text-primary px-3 py-2 mb-3">

                <i className="bi bi-clock-history me-2"></i>

                BORROWING HISTORY

              </span>


              <h1 className="fw-bold display-6 mb-3">

                ประวัติการยืม–คืน

              </h1>


              <p className="text-secondary lead mb-0">

                ตรวจสอบรายการยืมและคืนครุภัณฑ์
                รวมถึงสถานะของแต่ละรายการ

              </p>

            </div>


            <div className="col-lg-5 mt-4 mt-lg-0">

              <div className="row g-2">

                <SummaryCard
                  icon="bi-list-ul"
                  number={totalCount}
                  title="รายการทั้งหมด"
                  color="#6f42c1"
                />

                <SummaryCard
                  icon="bi-check-circle-fill"
                  number={returnedCount}
                  title="คืนแล้ว"
                  color="#198754"
                />

                <SummaryCard
                  icon="bi-box-arrow-up-right"
                  number={borrowingCount}
                  title="กำลังยืม"
                  color="#fd7e14"
                />

                <SummaryCard
                  icon="bi-hourglass-split"
                  number={pendingCount}
                  title="รออนุมัติ"
                  color="#ffc107"
                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SEARCH & FILTER
      ===================================================== */}

      <section className="py-4">

        <div className="container">

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-4">

              <div className="row g-3 align-items-end">

                {/* SEARCH */}

                <div className="col-lg-6">

                  <label className="form-label fw-semibold">

                    <i className="bi bi-search me-2"></i>

                    ค้นหาประวัติ

                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-white">

                      <i className="bi bi-search"></i>

                    </span>


                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหารหัสการยืม, ครุภัณฑ์, ผู้ยืม..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                    />


                    {search && (

                      <button
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setSearch("")
                        }
                      >

                        <i className="bi bi-x-lg"></i>

                      </button>

                    )}

                  </div>

                </div>


                {/* STATUS */}

                <div className="col-md-6 col-lg-3">

                  <label className="form-label fw-semibold">

                    <i className="bi bi-circle me-2"></i>

                    สถานะ

                  </label>

                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                  >

                    <option value="ทั้งหมด">
                      ทั้งหมด
                    </option>

                    <option value="คืนแล้ว">
                      คืนแล้ว
                    </option>

                    <option value="กำลังยืม">
                      กำลังยืม
                    </option>

                    <option value="รออนุมัติ">
                      รออนุมัติ
                    </option>

                    <option value="ยกเลิก">
                      ยกเลิก
                    </option>

                  </select>

                </div>


                {/* SORT */}

                <div className="col-md-6 col-lg-3">

                  <label className="form-label fw-semibold">

                    <i className="bi bi-sort-down me-2"></i>

                    เรียงลำดับ

                  </label>

                  <select
                    className="form-select"
                    value={sort}
                    onChange={(e) =>
                      setSort(e.target.value)
                    }
                  >

                    <option value="ล่าสุด">
                      วันที่ยืมล่าสุด
                    </option>

                    <option value="เก่าสุด">
                      วันที่ยืมเก่าสุด
                    </option>

                    <option value="วันคืนใกล้สุด">
                      วันคืนใกล้สุด
                    </option>

                    <option value="รหัส">
                      รหัสการยืม
                    </option>

                  </select>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          RESULT
      ===================================================== */}

      <section className="pb-5">

        <div className="container">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

            <div>

              <h4 className="fw-bold mb-1">

                รายการประวัติ

              </h4>

              <span className="text-secondary">

                พบ{" "}

                <strong className="text-dark">

                  {filteredHistory.length}

                </strong>{" "}

                รายการ

              </span>

            </div>


            <button
              className="btn btn-outline-danger rounded-pill px-3"
              onClick={resetFilter}
            >

              <i className="bi bi-arrow-counterclockwise me-2"></i>

              ล้างตัวกรอง

            </button>

          </div>


          {/* =====================================================
              HISTORY LIST
          ===================================================== */}

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th className="px-4 py-3">
                      รายการ
                    </th>

                    <th>
                      ผู้ยืม
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

                    <th className="text-end px-4">
                      รายละเอียด
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredHistory.map((item) => (

                    <tr key={item.id}>

                      {/* EQUIPMENT */}

                      <td className="px-4">

                        <div className="d-flex align-items-center gap-3">

                          <div
                            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                            style={{
                              width: "52px",
                              height: "52px",
                              background: "#eee8ff",
                              color: "#6f42c1",
                            }}
                          >

                            <i
                              className={item.icon}
                              style={{
                                fontSize: "24px",
                              }}
                            ></i>

                          </div>


                          <div>

                            <div className="fw-semibold">

                              {item.equipmentName}

                            </div>

                            <small className="text-secondary">

                              {item.equipmentCode}

                            </small>

                            <br />

                            <small className="text-secondary">

                              {item.borrowId}

                            </small>

                          </div>

                        </div>

                      </td>


                      {/* BORROWER */}

                      <td>

                        <div className="fw-semibold">

                          {item.borrower}

                        </div>

                        <small className="text-secondary">

                          {item.department}

                        </small>

                      </td>


                      {/* BORROW DATE */}

                      <td>

                        <div className="fw-semibold">

                          {formatDate(item.borrowDate)}

                        </div>

                      </td>


                      {/* RETURN DATE */}

                      <td>

                        <div className="fw-semibold">

                          {formatDate(item.returnDate)}

                        </div>


                        {item.actualReturnDate && (

                          <small className="text-success">

                            คืนจริง{" "}

                            {formatDate(
                              item.actualReturnDate
                            )}

                          </small>

                        )}

                      </td>


                      {/* STATUS */}

                      <td>

                        <HistoryStatusBadge
                          status={item.status}
                        />

                      </td>


                      {/* DETAIL */}

                      <td className="text-end px-4">

                        <button
                          className="btn btn-outline-dark btn-sm rounded-pill px-3"
                          onClick={() =>
                            setSelectedHistory(item)
                          }
                        >

                          <i className="bi bi-eye me-1"></i>

                          ดูรายละเอียด

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>


            {/* EMPTY */}

            {filteredHistory.length === 0 && (

              <div className="text-center py-5">

                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "90px",
                    height: "90px",
                    background: "#eee8ff",
                    color: "#6f42c1",
                  }}
                >

                  <i className="bi bi-clock-history fs-1"></i>

                </div>


                <h5 className="fw-bold">

                  ไม่พบประวัติการยืม–คืน

                </h5>


                <p className="text-secondary">

                  ลองเปลี่ยนคำค้นหาหรือเงื่อนไขตัวกรอง

                </p>

              </div>

            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedHistory && (

        <div
          className="modal fade show d-block"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.6)",
          }}
          onClick={() =>
            setSelectedHistory(null)
          }
        >

          <div
            className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">


              {/* MODAL HEADER */}

              <div
                className="position-relative d-flex align-items-center justify-content-center"
                style={{
                  height: "190px",
                  background:
                    "linear-gradient(135deg,#f4f0fa,#eee8ff)",
                  color: "#6f42c1",
                }}
              >

                <i
                  className={selectedHistory.icon}
                  style={{
                    fontSize: "80px",
                  }}
                ></i>


                <button
                  className="btn-close position-absolute top-0 end-0 m-3 bg-white rounded-circle p-2"
                  onClick={() =>
                    setSelectedHistory(null)
                  }
                ></button>


                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">

                  <HistoryStatusBadge
                    status={
                      selectedHistory.status
                    }
                  />

                </div>

              </div>


              {/* MODAL BODY */}

              <div className="modal-body p-4 p-lg-5">

                <div className="text-center mb-4">

                  <small
                    className="fw-bold"
                    style={{
                      color: "#6f42c1",
                    }}
                  >

                    {selectedHistory.borrowId}

                  </small>


                  <h3 className="fw-bold mt-2 mb-1">

                    {selectedHistory.equipmentName}

                  </h3>


                  <p className="text-secondary mb-0">

                    {selectedHistory.equipmentCode}

                  </p>

                </div>


                <div className="row g-3">

                  <DetailBox
                    icon="bi-person"
                    title="ผู้ยืม"
                    value={
                      selectedHistory.borrower
                    }
                  />

                  <DetailBox
                    icon="bi-building"
                    title="หน่วยงาน"
                    value={
                      selectedHistory.department
                    }
                  />

                  <DetailBox
                    icon="bi-calendar-check"
                    title="วันที่ยืม"
                    value={formatDate(
                      selectedHistory.borrowDate
                    )}
                  />

                  <DetailBox
                    icon="bi-calendar-event"
                    title="กำหนดคืน"
                    value={formatDate(
                      selectedHistory.returnDate
                    )}
                  />

                  <DetailBox
                    icon="bi-tag"
                    title="ประเภทครุภัณฑ์"
                    value={
                      selectedHistory.category
                    }
                  />

                  <DetailBox
                    icon="bi-circle"
                    title="สถานะ"
                    value={selectedHistory.status}
                  />

                </div>


                {/* PURPOSE */}

                <div className="mt-4">

                  <div className="bg-light rounded-4 p-4">

                    <div className="d-flex gap-3">

                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "45px",
                          height: "45px",
                          background: "#eee8ff",
                          color: "#6f42c1",
                        }}
                      >

                        <i className="bi bi-chat-left-text"></i>

                      </div>


                      <div>

                        <small className="text-secondary">

                          วัตถุประสงค์ในการยืม

                        </small>


                        <div className="fw-semibold mt-1">

                          {selectedHistory.purpose}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>


                {/* ACTUAL RETURN */}

                {selectedHistory.actualReturnDate && (

                  <div className="alert alert-success border-0 rounded-4 mt-3 mb-0">

                    <i className="bi bi-check-circle-fill me-2"></i>

                    ครุภัณฑ์ถูกคืนแล้วเมื่อ{" "}

                    <strong>

                      {formatDate(
                        selectedHistory.actualReturnDate
                      )}

                    </strong>

                  </div>

                )}

              </div>


              {/* MODAL FOOTER */}

              <div className="modal-footer border-0 px-4 px-lg-5 pb-4">

                <button
                  className="btn btn-light rounded-pill px-4"
                  onClick={() =>
                    setSelectedHistory(null)
                  }
                >

                  ปิด

                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="py-4 text-white"
        style={{
          background: "#17131f",
        }}
      >

        <div className="container">

          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">

            <div>

              <div className="fw-bold">

                ระบบยืม–คืนครุภัณฑ์

              </div>

              <small className="text-white-50">

                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่

              </small>

            </div>


            <div className="text-white-50 small">

              © 2026 Faculty of Social Sciences

            </div>

          </div>

        </div>

      </footer>

    </main>
  );
}


/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  icon,
  number,
  title,
  color,
}: {
  icon: string;
  number: number;
  title: string;
  color: string;
}) {

  return (

    <div className="col-6">

      <div className="bg-white rounded-4 shadow-sm p-3 h-100">

        <div className="d-flex align-items-center gap-3">

          <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: "42px",
              height: "42px",
              background: `${color}15`,
              color: color,
            }}
          >

            <i className={icon}></i>

          </div>


          <div>

            <div className="fs-4 fw-bold">

              {number}

            </div>

            <small className="text-secondary">

              {title}

            </small>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   STATUS BADGE
===================================================== */

function HistoryStatusBadge({
  status,
}: {
  status: BorrowStatus;
}) {

  const config = {

    "คืนแล้ว": {
      background: "#d1e7dd",
      color: "#146c43",
      icon: "bi-check-circle-fill",
    },

    "กำลังยืม": {
      background: "#fff3cd",
      color: "#997404",
      icon: "bi-box-arrow-up-right",
    },

    "รออนุมัติ": {
      background: "#cff4fc",
      color: "#087990",
      icon: "bi-hourglass-split",
    },

    "ยกเลิก": {
      background: "#f8d7da",
      color: "#b02a37",
      icon: "bi-x-circle-fill",
    },

  };

  const current = config[status];

  return (

    <span
      className="badge rounded-pill"
      style={{
        background: current.background,
        color: current.color,
        padding: "8px 13px",
      }}
    >

      <i
        className={`${current.icon} me-1`}
      ></i>

      {status}

    </span>
  );
}


/* =====================================================
   DETAIL BOX
===================================================== */

function DetailBox({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {

  return (

    <div className="col-md-6">

      <div className="bg-light rounded-4 p-3 h-100">

        <div className="d-flex gap-3">

          <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: "45px",
              height: "45px",
              background: "#eee8ff",
              color: "#6f42c1",
            }}
          >

            <i className={icon}></i>

          </div>


          <div>

            <small className="text-secondary">

              {title}

            </small>


            <div className="fw-semibold mt-1">

              {value}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(date: string) {

  return new Date(date).toLocaleDateString(
    "th-TH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}