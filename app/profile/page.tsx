"use client";

import { useState } from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type BorrowItem = {
  id: number;
  name: string;
  code: string;
  borrowDate: string;
  returnDate: string;
  icon: string;
};

const currentBorrowing: BorrowItem[] = [
  {
    id: 1,
    name: "Digital Camera",
    code: "SOC-CAM-001",
    borrowDate: "3 ก.ย. 2026",
    returnDate: "10 ก.ย. 2026",
    icon: "bi-camera",
  },
  {
    id: 2,
    name: "Projector",
    code: "SOC-PRO-002",
    borrowDate: "6 ก.ย. 2026",
    returnDate: "8 ก.ย. 2026",
    icon: "bi-projector",
  },
];

const recentHistory = [
  {
    id: 1,
    code: "SOC-LAP-001",
    name: "Notebook Computer",
    date: "1 ก.ย. 2026",
    status: "คืนแล้ว",
    icon: "bi-laptop",
  },
  {
    id: 2,
    code: "SOC-PRO-001",
    name: "Projector",
    date: "4 ก.ย. 2026",
    status: "คืนแล้ว",
    icon: "bi-projector",
  },
  {
    id: 3,
    code: "SOC-TAB-001",
    name: "Tablet",
    date: "20 ส.ค. 2026",
    status: "คืนแล้ว",
    icon: "bi-tablet",
  },
];

export default function ProfilePage() {
  const [showEditModal, setShowEditModal] = useState(false);

  const [user, setUser] = useState({
    name: "สมชาย ใจดี",
    studentId: "650610001",
    email: "somchai.j@example.com",
    phone: "081-234-5678",
    department: "ภาควิชาสังคมศาสตร์",
    position: "นักศึกษา",
  });

  const [editForm, setEditForm] = useState(user);

  const openEditModal = () => {
    setEditForm(user);
    setShowEditModal(true);
  };

  const saveProfile = () => {
    setUser(editForm);
    setShowEditModal(false);
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
                  className="nav-link"
                >
                  <i className="bi bi-clock-history me-1"></i>
                  ประวัติการยืม
                </Link>

              </li>


              <li className="nav-item ms-lg-2">

                <Link
                  href="/profile"
                  className="btn rounded-pill px-4 text-white"
                  style={{
                    background: "#6f42c1",
                  }}
                >

                  <i className="bi bi-person-circle me-2"></i>

                  โปรไฟล์

                </Link>

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

          <div className="d-flex align-items-center gap-3">

            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
              style={{
                width: "90px",
                height: "90px",
                background: "#6f42c1",
                fontSize: "38px",
              }}
            >

              <i className="bi bi-person"></i>

            </div>


            <div>

              <span className="badge rounded-pill bg-white border text-primary px-3 py-2 mb-2">

                <i className="bi bi-person-circle me-2"></i>

                MY PROFILE

              </span>


              <h1 className="fw-bold mb-1">

                {user.name}

              </h1>


              <p className="text-secondary mb-0">

                {user.position} · {user.department}

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <section className="py-4 pb-5">

        <div className="container">

          <div className="row g-4">


            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div className="col-lg-4">

              {/* PROFILE CARD */}

              <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">

                <div
                  className="text-center p-4"
                  style={{
                    background:
                      "linear-gradient(135deg,#6f42c1,#8e6ac8)",
                  }}
                >

                  <div
                    className="mx-auto rounded-circle bg-white d-flex align-items-center justify-content-center"
                    style={{
                      width: "110px",
                      height: "110px",
                      color: "#6f42c1",
                      fontSize: "48px",
                    }}
                  >

                    <i className="bi bi-person"></i>

                  </div>


                  <h4 className="text-white fw-bold mt-3 mb-1">

                    {user.name}

                  </h4>


                  <span className="badge bg-white text-dark rounded-pill px-3">

                    {user.position}

                  </span>

                </div>


                <div className="card-body p-4">

                  <div className="mb-3">

                    <small className="text-secondary">
                      รหัสนักศึกษา / บุคลากร
                    </small>

                    <div className="fw-semibold mt-1">

                      {user.studentId}

                    </div>

                  </div>


                  <div className="mb-3">

                    <small className="text-secondary">
                      อีเมล
                    </small>

                    <div className="fw-semibold mt-1 text-break">

                      {user.email}

                    </div>

                  </div>


                  <div className="mb-3">

                    <small className="text-secondary">
                      เบอร์โทรศัพท์
                    </small>

                    <div className="fw-semibold mt-1">

                      {user.phone}

                    </div>

                  </div>


                  <div>

                    <small className="text-secondary">
                      สังกัด
                    </small>

                    <div className="fw-semibold mt-1">

                      {user.department}

                    </div>

                  </div>

                </div>


                <div className="card-footer bg-white border-0 p-4 pt-0">

                  <button
                    className="btn btn-dark rounded-pill w-100"
                    onClick={openEditModal}
                  >

                    <i className="bi bi-pencil me-2"></i>

                    แก้ไขข้อมูลส่วนตัว

                  </button>

                </div>

              </div>


              {/* SECURITY CARD */}

              <div className="card border-0 shadow-sm rounded-4">

                <div className="card-body p-4">

                  <h5 className="fw-bold mb-3">

                    <i className="bi bi-shield-check me-2 text-success"></i>

                    ความปลอดภัย

                  </h5>


                  <div className="d-flex align-items-center justify-content-between mb-3">

                    <div>

                      <div className="fw-semibold">
                        บัญชีผู้ใช้งาน
                      </div>

                      <small className="text-secondary">
                        บัญชีใช้งานปกติ
                      </small>

                    </div>


                    <span className="badge rounded-pill bg-success-subtle text-success">

                      ใช้งานอยู่

                    </span>

                  </div>


                  <button className="btn btn-outline-secondary rounded-pill w-100">

                    <i className="bi bi-key me-2"></i>

                    เปลี่ยนรหัสผ่าน

                  </button>

                </div>

              </div>

            </div>


            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <div className="col-lg-8">


              {/* =================================================
                  STATISTICS
              ================================================= */}

              <div className="row g-3 mb-4">

                <ProfileStat
                  icon="bi-box-arrow-up-right"
                  number="12"
                  title="ยืมทั้งหมด"
                  color="#6f42c1"
                />

                <ProfileStat
                  icon="bi-check-circle-fill"
                  number="10"
                  title="คืนแล้ว"
                  color="#198754"
                />

                <ProfileStat
                  icon="bi-box-seam"
                  number={currentBorrowing.length.toString()}
                  title="กำลังยืม"
                  color="#fd7e14"
                />

                <ProfileStat
                  icon="bi-x-circle-fill"
                  number="0"
                  title="เกินกำหนด"
                  color="#dc3545"
                />

              </div>


              {/* =================================================
                  CURRENT BORROWING
              ================================================= */}

              <div className="card border-0 shadow-sm rounded-4 mb-4">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                      <h5 className="fw-bold mb-1">

                        ครุภัณฑ์ที่กำลังยืม

                      </h5>

                      <small className="text-secondary">

                        รายการที่ยังไม่ได้คืน

                      </small>

                    </div>


                    <span className="badge rounded-pill bg-warning-subtle text-warning px-3 py-2">

                      {currentBorrowing.length} รายการ

                    </span>

                  </div>


                  <div className="d-flex flex-column gap-3">

                    {currentBorrowing.map((item) => (

                      <div
                        key={item.id}
                        className="border rounded-4 p-3"
                      >

                        <div className="d-flex align-items-center gap-3">

                          <div
                            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: "58px",
                              height: "58px",
                              background: "#eee8ff",
                              color: "#6f42c1",
                            }}
                          >

                            <i
                              className={item.icon}
                              style={{
                                fontSize: "27px",
                              }}
                            ></i>

                          </div>


                          <div className="flex-grow-1">

                            <div className="fw-bold">

                              {item.name}

                            </div>

                            <small className="text-secondary">

                              {item.code}

                            </small>

                            <div className="mt-2">

                              <span className="badge rounded-pill bg-warning-subtle text-warning">

                                <i className="bi bi-clock me-1"></i>

                                กำลังยืม

                              </span>

                            </div>

                          </div>


                          <div className="text-end d-none d-md-block">

                            <small className="text-secondary d-block">

                              กำหนดคืน

                            </small>

                            <strong>

                              {item.returnDate}

                            </strong>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

              </div>


              {/* =================================================
                  RECENT HISTORY
              ================================================= */}

              <div className="card border-0 shadow-sm rounded-4 mb-4">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                      <h5 className="fw-bold mb-1">

                        ประวัติการยืมล่าสุด

                      </h5>

                      <small className="text-secondary">

                        รายการยืม–คืนล่าสุดของคุณ

                      </small>

                    </div>


                    <Link
                      href="/history"
                      className="btn btn-outline-dark btn-sm rounded-pill px-3"
                    >

                      ดูทั้งหมด

                      <i className="bi bi-arrow-right ms-2"></i>

                    </Link>

                  </div>


                  <div className="table-responsive">

                    <table className="table align-middle mb-0">

                      <thead>

                        <tr>

                          <th>
                            ครุภัณฑ์
                          </th>

                          <th>
                            วันที่ยืม
                          </th>

                          <th>
                            สถานะ
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {recentHistory.map((item) => (

                          <tr key={item.id}>

                            <td>

                              <div className="d-flex align-items-center gap-3">

                                <div
                                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{
                                    width: "45px",
                                    height: "45px",
                                    background: "#eee8ff",
                                    color: "#6f42c1",
                                  }}
                                >

                                  <i
                                    className={item.icon}
                                  ></i>

                                </div>


                                <div>

                                  <div className="fw-semibold">

                                    {item.name}

                                  </div>

                                  <small className="text-secondary">

                                    {item.code}

                                  </small>

                                </div>

                              </div>

                            </td>


                            <td>

                              {item.date}

                            </td>


                            <td>

                              <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2">

                                <i className="bi bi-check-circle me-1"></i>

                                {item.status}

                              </span>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>


              {/* =================================================
                  ACCOUNT ACTIONS
              ================================================= */}

              <div className="card border-0 shadow-sm rounded-4">

                <div className="card-body p-4">

                  <h5 className="fw-bold mb-3">

                    การจัดการบัญชี

                  </h5>


                  <div className="d-flex flex-column flex-md-row gap-2">

                    <button className="btn btn-outline-secondary rounded-pill">

                      <i className="bi bi-bell me-2"></i>

                      ตั้งค่าการแจ้งเตือน

                    </button>


                    <button className="btn btn-outline-danger rounded-pill">

                      <i className="bi bi-box-arrow-right me-2"></i>

                      ออกจากระบบ

                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      {showEditModal && (

        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
          onClick={() =>
            setShowEditModal(false)
          }
        >

          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-content border-0 rounded-4">

              {/* HEADER */}

              <div className="modal-header border-0 p-4">

                <div>

                  <h4 className="fw-bold mb-1">

                    แก้ไขข้อมูลส่วนตัว

                  </h4>

                  <small className="text-secondary">

                    แก้ไขข้อมูลสำหรับติดต่อของคุณ

                  </small>

                </div>


                <button
                  className="btn-close"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                ></button>

              </div>


              {/* BODY */}

              <div className="modal-body px-4 pb-4">

                <div className="row g-3">

                  {/* NAME */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">

                      ชื่อ–นามสกุล

                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          name: e.target.value,
                        })
                      }
                    />

                  </div>


                  {/* ID */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">

                      รหัสนักศึกษา / บุคลากร

                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={editForm.studentId}
                      disabled
                    />

                    <small className="text-secondary">

                      ไม่สามารถแก้ไขข้อมูลนี้ได้

                    </small>

                  </div>


                  {/* EMAIL */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">

                      อีเมล

                    </label>

                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          email: e.target.value,
                        })
                      }
                    />

                  </div>


                  {/* PHONE */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">

                      เบอร์โทรศัพท์

                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          phone: e.target.value,
                        })
                      }
                    />

                  </div>


                  {/* DEPARTMENT */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">

                      สังกัด / ภาควิชา

                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={editForm.department}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          department: e.target.value,
                        })
                      }
                    />

                  </div>


                  {/* POSITION */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">

                      ประเภทผู้ใช้งาน

                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={editForm.position}
                      disabled
                    />

                  </div>

                </div>

              </div>


              {/* FOOTER */}

              <div className="modal-footer border-0 px-4 pb-4">

                <button
                  className="btn btn-light rounded-pill px-4"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                >

                  ยกเลิก

                </button>


                <button
                  className="btn text-white rounded-pill px-4"
                  style={{
                    background: "#6f42c1",
                  }}
                  onClick={saveProfile}
                >

                  <i className="bi bi-check-lg me-2"></i>

                  บันทึกข้อมูล

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
   PROFILE STAT
===================================================== */

function ProfileStat({
  icon,
  number,
  title,
  color,
}: {
  icon: string;
  number: string;
  title: string;
  color: string;
}) {

  return (

    <div className="col-6 col-xl-3">

      <div className="card border-0 shadow-sm rounded-4 h-100">

        <div className="card-body p-3">

          <div className="d-flex align-items-center gap-3">

            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "45px",
                height: "45px",
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

    </div>
  );
}