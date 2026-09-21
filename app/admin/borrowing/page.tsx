"use client";

import { useMemo, useState } from "react";
import AdminNavbar from "@/app/components/AdminNavbar";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type BorrowStatus =
  | "รออนุมัติ"
  | "กำลังยืม"
  | "คืนแล้ว"
  | "เกินกำหนด"
  | "ยกเลิก";

type BorrowItem = {
  id: string;
  user: string;
  studentId: string;
  department: string;
  equipment: string;
  equipmentCode: string;
  category: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  purpose: string;
  phone: string;
  note?: string;
};

const initialBorrowItems: BorrowItem[] = [
  {
    id: "BR-2026-00125",
    user: "สมชาย ใจดี",
    studentId: "650110001",
    department: "เทคโนโลยีสารสนเทศ",
    equipment: "Canon EOS 90D",
    equipmentCode: "EQ-CAM-001",
    category: "กล้องถ่ายภาพ",
    borrowDate: "06/09/2026",
    dueDate: "08/09/2026",
    status: "กำลังยืม",
    purpose: "ถ่ายทำวิดีโอสำหรับโครงงาน",
    phone: "08X-XXX-1234",
    note: "รับอุปกรณ์ที่ห้องพัสดุ",
  },
  {
    id: "BR-2026-00124",
    user: "กมลชนก แสงดี",
    studentId: "650110025",
    department: "สังคมศาสตร์",
    equipment: "MacBook Pro 14",
    equipmentCode: "EQ-PC-004",
    category: "คอมพิวเตอร์",
    borrowDate: "05/09/2026",
    dueDate: "07/09/2026",
    returnDate: "07/09/2026",
    status: "คืนแล้ว",
    purpose: "ใช้จัดทำงานวิจัย",
    phone: "08X-XXX-5678",
  },
  {
    id: "BR-2026-00123",
    user: "ธนกร ใจบุญ",
    studentId: "640110087",
    department: "รัฐศาสตร์",
    equipment: "Sony Alpha A6400",
    equipmentCode: "EQ-CAM-002",
    category: "กล้องถ่ายภาพ",
    borrowDate: "04/09/2026",
    dueDate: "06/09/2026",
    returnDate: "06/09/2026",
    status: "คืนแล้ว",
    purpose: "บันทึกกิจกรรมของคณะ",
    phone: "09X-XXX-2468",
  },
  {
    id: "BR-2026-00122",
    user: "พิมพ์ชนก สุขใจ",
    studentId: "650110113",
    department: "สังคมวิทยา",
    equipment: "Epson EB-X06",
    equipmentCode: "EQ-PRO-003",
    category: "โปรเจคเตอร์",
    borrowDate: "03/09/2026",
    dueDate: "05/09/2026",
    status: "เกินกำหนด",
    purpose: "ใช้สำหรับนำเสนอรายงาน",
    phone: "08X-XXX-9999",
    note: "ยังไม่ได้ส่งคืน",
  },
  {
    id: "BR-2026-00121",
    user: "อาจารย์วิชัย สมบูรณ์",
    studentId: "STAFF-001",
    department: "คณะสังคมศาสตร์",
    equipment: "iPad Air",
    equipmentCode: "EQ-TAB-005",
    category: "แท็บเล็ต",
    borrowDate: "02/09/2026",
    dueDate: "04/09/2026",
    returnDate: "04/09/2026",
    status: "คืนแล้ว",
    purpose: "ใช้ประกอบการเรียนการสอน",
    phone: "08X-XXX-5555",
  },
  {
    id: "BR-2026-00120",
    user: "ณัฐวุฒิ พรหมมา",
    studentId: "660110045",
    department: "ภูมิศาสตร์",
    equipment: "Zoom H6",
    equipmentCode: "EQ-AUD-001",
    category: "เครื่องเสียง",
    borrowDate: "01/09/2026",
    dueDate: "10/09/2026",
    status: "กำลังยืม",
    purpose: "บันทึกเสียงภาคสนาม",
    phone: "09X-XXX-1111",
  },
  {
    id: "BR-2026-00119",
    user: "ศิริพร วัฒนะ",
    studentId: "660110078",
    department: "สังคมศาสตร์",
    equipment: "Canon EOS 90D",
    equipmentCode: "EQ-CAM-001",
    category: "กล้องถ่ายภาพ",
    borrowDate: "01/09/2026",
    dueDate: "03/09/2026",
    returnDate: "03/09/2026",
    status: "คืนแล้ว",
    purpose: "ถ่ายภาพกิจกรรม",
    phone: "08X-XXX-7777",
  },
  {
    id: "BR-2026-00118",
    user: "กิตติพงษ์ แก้วดี",
    studentId: "650110091",
    department: "รัฐศาสตร์",
    equipment: "Dell Latitude 5440",
    equipmentCode: "EQ-PC-007",
    category: "คอมพิวเตอร์",
    borrowDate: "31/08/2026",
    dueDate: "10/09/2026",
    status: "รออนุมัติ",
    purpose: "ใช้ทำงานกลุ่ม",
    phone: "09X-XXX-3333",
  },
];

export default function AdminBorrowingPage() {
  const [items, setItems] =
    useState<BorrowItem[]>(initialBorrowItems);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ทั้งหมด");

  const [selectedItem, setSelectedItem] =
    useState<BorrowItem | null>(null);

  const [showModal, setShowModal] =
    useState(false);

  const [showApproveModal, setShowApproveModal] =
    useState(false);

  const [approveTarget, setApproveTarget] =
    useState<BorrowItem | null>(null);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const keyword = search.toLowerCase().trim();

      const matchSearch =
        !keyword ||
        item.id.toLowerCase().includes(keyword) ||
        item.user.toLowerCase().includes(keyword) ||
        item.studentId.toLowerCase().includes(keyword) ||
        item.equipment.toLowerCase().includes(keyword) ||
        item.equipmentCode.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "ทั้งหมด" ||
        item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const stats = {
    total: items.length,

    pending: items.filter(
      (item) => item.status === "รออนุมัติ"
    ).length,

    borrowing: items.filter(
      (item) => item.status === "กำลังยืม"
    ).length,

    returned: items.filter(
      (item) => item.status === "คืนแล้ว"
    ).length,

    overdue: items.filter(
      (item) => item.status === "เกินกำหนด"
    ).length,
  };

  /* =========================================================
     DETAIL
  ========================================================= */

  const openDetails = (item: BorrowItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeDetails = () => {
    setShowModal(false);

    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  };

  /* =========================================================
     APPROVE
  ========================================================= */

  const openApprove = (item: BorrowItem) => {
    setApproveTarget(item);
    setShowApproveModal(true);
  };

  const approveBorrow = () => {
    if (!approveTarget) return;

    setItems((current) =>
      current.map((item) =>
        item.id === approveTarget.id
          ? {
              ...item,
              status: "กำลังยืม",
            }
          : item
      )
    );

    setShowApproveModal(false);
    setApproveTarget(null);
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const cancelBorrow = (item: BorrowItem) => {
    const confirmed = window.confirm(
      `ต้องการยกเลิกรายการ ${item.id} หรือไม่?`
    );

    if (!confirmed) return;

    setItems((current) =>
      current.map((x) =>
        x.id === item.id
          ? {
              ...x,
              status: "ยกเลิก",
            }
          : x
      )
    );
  };

  /* =========================================================
     RETURN
  ========================================================= */

  const markReturned = (item: BorrowItem) => {
    const confirmed = window.confirm(
      `ยืนยันการรับคืน "${item.equipment}" จาก ${item.user} หรือไม่?`
    );

    if (!confirmed) return;

    setItems((current) =>
      current.map((x) =>
        x.id === item.id
          ? {
              ...x,
              status: "คืนแล้ว",
              returnDate: new Date().toLocaleDateString("th-TH"),
            }
          : x
      )
    );
  };

  return (
    <main className="bg-light min-vh-100">

      <AdminNavbar />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="admin-page-content admin-borrowing-page">

        <div className="container-fluid">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="admin-borrowing-header mb-4">

            <div>

              <h2 className="admin-page-title">
                รายการยืม–คืน
              </h2>

              <p className="admin-page-subtitle mb-0">
                จัดการ ตรวจสอบ และติดตามรายการยืม–คืนครุภัณฑ์
              </p>
            </div>

          </div>


          {/* =====================================================
              STATISTICS
          ===================================================== */}

          <div className="row g-3 mb-4">

            <StatCard
              title="รายการทั้งหมด"
              value={stats.total}
              icon="bi-list-check"
              color="#6f42c1"
            />

            <StatCard
              title="รออนุมัติ"
              value={stats.pending}
              icon="bi-hourglass-split"
              color="#fd7e14"
            />

            <StatCard
              title="กำลังยืม"
              value={stats.borrowing}
              icon="bi-box-arrow-up-right"
              color="#0d6efd"
            />

            <StatCard
              title="คืนแล้ว"
              value={stats.returned}
              icon="bi-check-circle"
              color="#198754"
            />

            <StatCard
              title="เกินกำหนด"
              value={stats.overdue}
              icon="bi-exclamation-circle"
              color="#dc3545"
            />

          </div>


          {/* =====================================================
              FILTER
          ===================================================== */}

          <div className="card border-0 shadow-sm rounded-4 mb-4">

            <div className="card-body p-4">

              <div className="row g-3">

                <div className="col-lg-6">

                  <label className="form-label fw-semibold">
                    ค้นหารายการ
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-white">
                      <i className="bi bi-search"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหาเลขรายการ, ชื่อผู้ยืม, รหัสนักศึกษา หรือครุภัณฑ์..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                    />

                    {search && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setSearch("")}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}

                  </div>

                </div>


                <div className="col-lg-3">

                  <label className="form-label fw-semibold">
                    สถานะ
                  </label>

                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                  >
                    <option>ทั้งหมด</option>
                    <option>รออนุมัติ</option>
                    <option>กำลังยืม</option>
                    <option>คืนแล้ว</option>
                    <option>เกินกำหนด</option>
                    <option>ยกเลิก</option>
                  </select>

                </div>


                <div className="col-lg-3">

                  <label className="form-label fw-semibold">
                    จำนวนรายการ
                  </label>

                  <div className="form-control bg-light">
                    แสดง {filteredItems.length} จาก{" "}
                    {items.length} รายการ
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =====================================================
              TABLE
          ===================================================== */}

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-0">

              <div className="p-4 border-bottom">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <h5 className="fw-bold mb-1">
                      รายการยืม–คืนทั้งหมด
                    </h5>

                    <small className="text-secondary">
                      ตรวจสอบสถานะและรายละเอียดการยืมครุภัณฑ์
                    </small>

                  </div>

                  <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                    {filteredItems.length} รายการ
                  </span>

                </div>

              </div>


              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0 admin-borrowing-table">

                  <thead className="table-light">

                    <tr>

                      <th className="px-4 py-3">
                        รายการ
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

                      <th className="text-end px-4">
                        จัดการ
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredItems.length === 0 ? (

                      <tr>

                        <td
                          colSpan={7}
                          className="text-center py-5"
                        >

                          <i className="bi bi-search display-5 text-secondary"></i>

                          <div className="fw-semibold mt-3">
                            ไม่พบรายการ
                          </div>

                          <small className="text-secondary">
                            ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                          </small>

                        </td>

                      </tr>

                    ) : (

                      filteredItems.map((item) => (

                        <tr key={item.id}>

                          {/* ID */}

                          <td className="px-4">

                            <div className="fw-semibold">
                              {item.id}
                            </div>

                            <small className="text-secondary">
                              {item.category}
                            </small>

                          </td>


                          {/* USER */}

                          <td>

                            <div className="d-flex align-items-center gap-2">

                              <div className="borrow-user-icon">

                                <i className="bi bi-person-fill"></i>

                              </div>

                              <div>

                                <div className="fw-semibold">
                                  {item.user}
                                </div>

                                <small className="text-secondary">
                                  {item.studentId}
                                </small>

                              </div>

                            </div>

                          </td>


                          {/* EQUIPMENT */}

                          <td>

                            <div className="d-flex align-items-center gap-2">

                              <div className="borrow-equipment-icon">

                                <i className="bi bi-box-seam"></i>

                              </div>

                              <div>

                                <div className="fw-semibold">
                                  {item.equipment}
                                </div>

                                <small className="text-secondary">
                                  {item.equipmentCode}
                                </small>

                              </div>

                            </div>

                          </td>


                          {/* BORROW DATE */}

                          <td>
                            {item.borrowDate}
                          </td>


                          {/* DUE DATE */}

                          <td>

                            <span
                              className={
                                item.status === "เกินกำหนด"
                                  ? "text-danger fw-semibold"
                                  : ""
                              }
                            >
                              {item.dueDate}
                            </span>

                          </td>


                          {/* STATUS */}

                          <td>
                            <StatusBadge status={item.status} />
                          </td>


                          {/* ACTION */}

                          <td className="text-end px-4">

                            <div className="dropdown">

                              <button
                                type="button"
                                className="btn btn-light border rounded-3 borrowing-action-btn"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="bi bi-three-dots"></i>
                              </button>

                              <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">

                                <li>

                                  <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() =>
                                      openDetails(item)
                                    }
                                  >
                                    <i className="bi bi-eye me-2"></i>
                                    ดูรายละเอียด
                                  </button>

                                </li>


                                {item.status === "รออนุมัติ" && (
                                  <>

                                    <li>
                                      <hr className="dropdown-divider" />
                                    </li>

                                    <li>

                                      <button
                                        type="button"
                                        className="dropdown-item text-success"
                                        onClick={() =>
                                          openApprove(item)
                                        }
                                      >
                                        <i className="bi bi-check-circle me-2"></i>
                                        อนุมัติการยืม
                                      </button>

                                    </li>

                                    <li>

                                      <button
                                        type="button"
                                        className="dropdown-item text-danger"
                                        onClick={() =>
                                          cancelBorrow(item)
                                        }
                                      >
                                        <i className="bi bi-x-circle me-2"></i>
                                        ยกเลิกรายการ
                                      </button>

                                    </li>

                                  </>
                                )}


                                {item.status === "กำลังยืม" && (

                                  <li>

                                    <button
                                      type="button"
                                      className="dropdown-item text-success"
                                      onClick={() =>
                                        markReturned(item)
                                      }
                                    >
                                      <i className="bi bi-box-arrow-in-down-left me-2"></i>
                                      รับคืนครุภัณฑ์
                                    </button>

                                  </li>

                                )}

                              </ul>

                            </div>

                          </td>

                        </tr>

                      ))

                    )}

                  </tbody>

                </table>

              </div>


              {/* FOOTER */}

              <div className="p-4 border-top">

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">

                  <small className="text-secondary">
                    แสดง {filteredItems.length} รายการ
                    จากทั้งหมด {items.length} รายการ
                  </small>

                  <small className="text-secondary">
                    ระบบยืม–คืนครุภัณฑ์
                    คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
                  </small>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {showModal && selectedItem && (

        <div
          className="modal fade show d-block admin-modal-backdrop"
          tabIndex={-1}
          onClick={closeDetails}
        >

          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-content border-0 rounded-4 shadow-lg">

              <div className="modal-header border-0 p-4">

                <div>

                  <small className="text-secondary">
                    รายละเอียดรายการ
                  </small>

                  <h5 className="modal-title fw-bold mt-1">
                    {selectedItem.id}
                  </h5>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDetails}
                />

              </div>


              <div className="modal-body px-4 pb-4">

                {/* STATUS */}

                <div className="d-flex justify-content-between align-items-center bg-light rounded-4 p-3 mb-4">

                  <div>

                    <small className="text-secondary d-block">
                      สถานะรายการ
                    </small>

                    <div className="mt-1">
                      <StatusBadge
                        status={selectedItem.status}
                      />
                    </div>

                  </div>

                  <i className="bi bi-clipboard-check fs-2 text-secondary"></i>

                </div>


                {/* USER */}

                <h6 className="fw-bold mb-3">
                  <i className="bi bi-person me-2"></i>
                  ข้อมูลผู้ยืม
                </h6>

                <div className="row g-3 mb-4">

                  <InfoBox
                    label="ชื่อผู้ยืม"
                    value={selectedItem.user}
                  />

                  <InfoBox
                    label="รหัสนักศึกษา / บุคลากร"
                    value={selectedItem.studentId}
                  />

                  <InfoBox
                    label="สังกัด / สาขา"
                    value={selectedItem.department}
                  />

                  <InfoBox
                    label="เบอร์โทรศัพท์"
                    value={selectedItem.phone}
                  />

                </div>


                {/* EQUIPMENT */}

                <h6 className="fw-bold mb-3">
                  <i className="bi bi-box-seam me-2"></i>
                  ข้อมูลครุภัณฑ์
                </h6>

                <div className="bg-light rounded-4 p-3 mb-4">

                  <div className="d-flex align-items-center gap-3">

                    <div className="borrow-modal-equipment-icon">

                      <i className="bi bi-box-seam fs-4"></i>

                    </div>

                    <div>

                      <div className="fw-bold">
                        {selectedItem.equipment}
                      </div>

                      <small className="text-secondary">
                        รหัสครุภัณฑ์:{" "}
                        {selectedItem.equipmentCode}
                      </small>

                      <div>

                        <span className="badge bg-white text-dark border mt-1">
                          {selectedItem.category}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>


                {/* BORROW INFO */}

                <h6 className="fw-bold mb-3">
                  <i className="bi bi-calendar3 me-2"></i>
                  ข้อมูลการยืม
                </h6>

                <div className="row g-3 mb-4">

                  <InfoBox
                    label="วันที่ยืม"
                    value={selectedItem.borrowDate}
                  />

                  <InfoBox
                    label="กำหนดคืน"
                    value={selectedItem.dueDate}
                  />

                  <InfoBox
                    label="วันที่คืน"
                    value={selectedItem.returnDate || "-"}
                  />

                  <InfoBox
                    label="วัตถุประสงค์"
                    value={selectedItem.purpose}
                  />

                </div>


                {/* NOTE */}

                {selectedItem.note && (

                  <div className="alert alert-warning border-0 rounded-4">

                    <i className="bi bi-info-circle me-2"></i>

                    {selectedItem.note}

                  </div>

                )}

              </div>


              {/* FOOTER */}

              <div className="modal-footer border-0 px-4 pb-4">

                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4"
                  onClick={closeDetails}
                >
                  ปิด
                </button>


                {selectedItem.status === "รออนุมัติ" && (

                  <button
                    type="button"
                    className="btn btn-success rounded-pill px-4"
                    onClick={() => {
                      closeDetails();
                      openApprove(selectedItem);
                    }}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    อนุมัติการยืม
                  </button>

                )}


                {selectedItem.status === "กำลังยืม" && (

                  <button
                    type="button"
                    className="btn btn-success rounded-pill px-4"
                    onClick={() => {
                      closeDetails();
                      markReturned(selectedItem);
                    }}
                  >
                    <i className="bi bi-box-arrow-in-down-left me-2"></i>
                    รับคืนครุภัณฑ์
                  </button>

                )}

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          APPROVE MODAL
      ===================================================== */}

      {showApproveModal && approveTarget && (

        <div
          className="modal fade show d-block admin-modal-backdrop"
          tabIndex={-1}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content border-0 rounded-4 shadow-lg">

              <div className="modal-body p-4 text-center">

                <div className="approve-icon">

                  <i className="bi bi-check-lg fs-2"></i>

                </div>

                <h5 className="fw-bold">
                  ยืนยันการอนุมัติ
                </h5>

                <p className="text-secondary mb-1">
                  ต้องการอนุมัติรายการ
                </p>

                <strong>
                  {approveTarget.id}
                </strong>

                <p className="text-secondary mt-2">
                  {approveTarget.user}
                  <br />
                  {approveTarget.equipment}
                </p>

                <div className="d-flex gap-2 justify-content-center mt-4">

                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => {
                      setShowApproveModal(false);
                      setApproveTarget(null);
                    }}
                  >
                    ยกเลิก
                  </button>

                  <button
                    type="button"
                    className="btn btn-success rounded-pill px-4"
                    onClick={approveBorrow}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    ยืนยันอนุมัติ
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="col-6 col-xl">

      <div className="card border-0 shadow-sm rounded-4 h-100">

        <div className="card-body p-3 p-xl-4">

          <div className="d-flex align-items-center justify-content-between">

            <div>

              <small className="text-secondary d-block mb-2">
                {title}
              </small>

              <strong className="fs-3">
                {value}
              </strong>

            </div>

            <div
              className="borrow-stat-icon"
              style={{
                "--stat-color": color,
              } as React.CSSProperties}
            >

              <i className={`bi ${icon} fs-5`}></i>

            </div>

          </div>

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
  status: BorrowStatus;
}) {
  const config: Record<
    BorrowStatus,
    {
      className: string;
      icon: string;
    }
  > = {
    "รออนุมัติ": {
      className:
        "bg-warning-subtle text-warning-emphasis",
      icon: "bi-hourglass-split",
    },

    "กำลังยืม": {
      className:
        "bg-primary-subtle text-primary",
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

    ยกเลิก: {
      className:
        "bg-secondary-subtle text-secondary",
      icon: "bi-x-circle",
    },
  };

  const current = config[status];

  return (
    <span
      className={`badge rounded-pill px-3 py-2 ${current.className}`}
    >
      <i className={`bi ${current.icon} me-1`}></i>
      {status}
    </span>
  );
}


/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="col-md-6">

      <div className="border rounded-3 p-3 h-100">

        <small className="text-secondary d-block mb-1">
          {label}
        </small>

        <div className="fw-semibold">
          {value}
        </div>

      </div>

    </div>
  );
}