"use client";

import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Home() {
  useEffect(() => {
    // ป้องกันปัญหา Bootstrap JS หากภายหลังต้องใช้ Modal / Dropdown
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <main className="bg-light min-vh-100">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div className="container py-2">

          <a
            className="navbar-brand d-flex align-items-center gap-3"
            href="#"
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
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse"
            id="mainNavbar"
          >
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">

              <li className="nav-item">
                <a className="nav-link active" href="#">
                  <i className="bi bi-house me-1"></i>
                  หน้าหลัก
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#equipment">
                  <i className="bi bi-box me-1"></i>
                  ครุภัณฑ์
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#history">
                  <i className="bi bi-clock-history me-1"></i>
                  ประวัติการยืม
                </a>
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


      {/* ================= HERO ================= */}
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(135deg, #f5f0ff 0%, #ffffff 55%, #eee8ff 100%)",
        }}
      >
        <div className="container py-4">

          <div className="row align-items-center g-5">

            {/* LEFT */}
            <div className="col-lg-7">

              <span className="badge rounded-pill bg-white text-dark border px-3 py-2 mb-3">
                <i className="bi bi-building me-2 text-primary"></i>
                Faculty of Social Sciences
              </span>

              <h1 className="display-4 fw-bold text-dark mb-3">
                ระบบยืม–คืน
                <br />
                <span style={{ color: "#6f42c1" }}>
                  ครุภัณฑ์ออนไลน์
                </span>
              </h1>

              <p className="lead text-secondary mb-4">
                ระบบจัดการการยืมและคืนครุภัณฑ์
                สำหรับคณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
                ช่วยให้ค้นหา ยืม และตรวจสอบสถานะครุภัณฑ์ได้อย่างสะดวก
              </p>

              <div className="d-flex flex-wrap gap-3">

                <a
                  href="#equipment"
                  className="btn btn-lg text-white rounded-pill px-4"
                  style={{ background: "#6f42c1" }}
                >
                  <i className="bi bi-search me-2"></i>
                  ค้นหาครุภัณฑ์
                </a>

                <button
                  className="btn btn-lg btn-white bg-white border rounded-pill px-4"
                >
                  <i className="bi bi-qr-code-scan me-2"></i>
                  สแกน QR Code
                </button>

              </div>

            </div>


            {/* RIGHT */}
            <div className="col-lg-5">

              <div
                className="bg-white rounded-4 shadow-lg p-4 mx-auto"
                style={{ maxWidth: "380px" }}
              >

                <div className="text-center mb-3">

                  <div
                    className="mx-auto d-flex align-items-center justify-content-center rounded-4 mb-3"
                    style={{
                      width: "90px",
                      height: "90px",
                      background: "#f0eafa",
                      color: "#6f42c1",
                    }}
                  >
                    <i className="bi bi-qr-code fs-1"></i>
                  </div>

                  <h5 className="fw-bold">
                    ยืมครุภัณฑ์อย่างง่าย
                  </h5>

                  <p className="text-secondary small mb-0">
                    สแกน QR Code ที่ติดอยู่บนครุภัณฑ์
                    เพื่อดูรายละเอียดและทำรายการยืม
                  </p>

                </div>

                <hr />

                <div className="d-flex align-items-center gap-3 mb-3">

                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "42px",
                      height: "42px",
                      background: "#e9f7ef",
                      color: "#198754",
                    }}
                  >
                    <i className="bi bi-check-lg"></i>
                  </div>

                  <div>
                    <div className="fw-semibold">
                      ตรวจสอบสถานะ
                    </div>
                    <small className="text-secondary">
                      เช็กได้ว่าครุภัณฑ์พร้อมใช้งานหรือไม่
                    </small>
                  </div>

                </div>


                <div className="d-flex align-items-center gap-3">

                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "42px",
                      height: "42px",
                      background: "#fff3cd",
                      color: "#997404",
                    }}
                  >
                    <i className="bi bi-clock-history"></i>
                  </div>

                  <div>
                    <div className="fw-semibold">
                      ติดตามการยืม
                    </div>
                    <small className="text-secondary">
                      ดูประวัติการยืม–คืนของคุณ
                    </small>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ================= STATISTICS ================= */}
      <section className="py-4 bg-white border-bottom">
        <div className="container">

          <div className="row g-3">

            <div className="col-6 col-lg-3">
              <div className="p-3">
                <div className="d-flex align-items-center gap-3">

                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "#eee8ff",
                      color: "#6f42c1",
                    }}
                  >
                    <i className="bi bi-box-seam fs-5"></i>
                  </div>

                  <div>
                    <div className="fs-4 fw-bold">248</div>
                    <small className="text-secondary">
                      ครุภัณฑ์ทั้งหมด
                    </small>
                  </div>

                </div>
              </div>
            </div>


            <div className="col-6 col-lg-3">
              <div className="p-3">
                <div className="d-flex align-items-center gap-3">

                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "#fff3cd",
                      color: "#997404",
                    }}
                  >
                    <i className="bi bi-arrow-left-right fs-5"></i>
                  </div>

                  <div>
                    <div className="fs-4 fw-bold">37</div>
                    <small className="text-secondary">
                      กำลังถูกยืม
                    </small>
                  </div>

                </div>
              </div>
            </div>


            <div className="col-6 col-lg-3">
              <div className="p-3">
                <div className="d-flex align-items-center gap-3">

                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "#d1e7dd",
                      color: "#198754",
                    }}
                  >
                    <i className="bi bi-check-circle fs-5"></i>
                  </div>

                  <div>
                    <div className="fs-4 fw-bold">211</div>
                    <small className="text-secondary">
                      พร้อมใช้งาน
                    </small>
                  </div>

                </div>
              </div>
            </div>


            <div className="col-6 col-lg-3">
              <div className="p-3">
                <div className="d-flex align-items-center gap-3">

                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "#cff4fc",
                      color: "#087990",
                    }}
                  >
                    <i className="bi bi-arrow-repeat fs-5"></i>
                  </div>

                  <div>
                    <div className="fs-4 fw-bold">1,284</div>
                    <small className="text-secondary">
                      รายการยืมทั้งหมด
                    </small>
                  </div>

                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ================= EQUIPMENT ================= */}
      <section id="equipment" className="py-5">

        <div className="container">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">

            <div>
              <span className="text-primary fw-semibold">
                EQUIPMENT
              </span>

              <h2 className="fw-bold mb-1">
                ครุภัณฑ์แนะนำ
              </h2>

              <p className="text-secondary mb-0">
                ครุภัณฑ์ที่พร้อมให้บริการยืม
              </p>
            </div>

            <a
              href="#"
              className="btn btn-outline-dark rounded-pill px-4"
            >
              ดูทั้งหมด
              <i className="bi bi-arrow-right ms-2"></i>
            </a>

          </div>


          <div className="row g-4">

            {/* CARD 1 */}
            <EquipmentCard
              icon="bi-laptop"
              name="Notebook Computer"
              code="SOC-LAP-001"
              category="คอมพิวเตอร์"
              status="พร้อมใช้งาน"
              statusClass="success"
            />

            {/* CARD 2 */}
            <EquipmentCard
              icon="bi-camera"
              name="Digital Camera"
              code="SOC-CAM-014"
              category="อุปกรณ์ถ่ายภาพ"
              status="พร้อมใช้งาน"
              statusClass="success"
            />

            {/* CARD 3 */}
            <EquipmentCard
              icon="bi-projector"
              name="Projector"
              code="SOC-PRO-008"
              category="อุปกรณ์นำเสนอ"
              status="ถูกยืม"
              statusClass="warning"
            />

          </div>

        </div>

      </section>


      {/* ================= HOW TO ================= */}
      <section className="py-5 bg-white">

        <div className="container">

          <div className="text-center mb-5">

            <span className="text-primary fw-semibold">
              HOW IT WORKS
            </span>

            <h2 className="fw-bold mt-2">
              ยืมครุภัณฑ์ง่าย ๆ เพียง 3 ขั้นตอน
            </h2>

          </div>


          <div className="row g-4 text-center">

            <Step
              number="01"
              icon="bi-qr-code-scan"
              title="สแกน QR Code"
              description="ใช้กล้องมือถือสแกน QR Code ที่ติดอยู่บนครุภัณฑ์"
            />

            <Step
              number="02"
              icon="bi-file-earmark-check"
              title="ทำรายการยืม"
              description="ตรวจสอบข้อมูลและยืนยันรายการยืมผ่านระบบ"
            />

            <Step
              number="03"
              icon="bi-box-arrow-in-left"
              title="คืนครุภัณฑ์"
              description="นำครุภัณฑ์มาคืนและบันทึกการคืนในระบบ"
            />

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer
        className="py-5 text-white"
        style={{ background: "#17131f" }}
      >

        <div className="container">

          <div className="row g-4">

            <div className="col-lg-6">

              <div className="d-flex align-items-center gap-3 mb-3">

                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{
                    width: "45px",
                    height: "45px",
                    background: "#6f42c1",
                  }}
                >
                  <i className="bi bi-box-seam fs-5"></i>
                </div>

                <div>
                  <div className="fw-bold">
                    ระบบยืม–คืนครุภัณฑ์
                  </div>

                  <small className="text-white-50">
                    คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
                  </small>
                </div>

              </div>

              <p className="text-white-50 mb-0">
                ระบบจัดการครุภัณฑ์สำหรับการยืมและคืน
                เพื่อเพิ่มความสะดวกและประสิทธิภาพในการบริหารจัดการ
              </p>

            </div>


            <div className="col-lg-3">

              <h6 className="fw-bold mb-3">
                เมนู
              </h6>

              <div className="d-flex flex-column gap-2">

                <a href="#" className="text-white-50 text-decoration-none">
                  หน้าหลัก
                </a>

                <a href="#equipment" className="text-white-50 text-decoration-none">
                  ครุภัณฑ์
                </a>

                <a href="#history" className="text-white-50 text-decoration-none">
                  ประวัติการยืม
                </a>

              </div>

            </div>


            <div className="col-lg-3">

              <h6 className="fw-bold mb-3">
                ติดต่อ
              </h6>

              <div className="text-white-50 small">

                <div className="mb-2">
                  <i className="bi bi-geo-alt me-2"></i>
                  คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
                </div>

                <div>
                  <i className="bi bi-envelope me-2"></i>
                  Social Sciences Faculty
                </div>

              </div>

            </div>

          </div>

          <hr className="border-secondary my-4" />

          <div className="text-center text-white-50 small">
            © 2026 Faculty of Social Sciences, Chiang Mai University
          </div>

        </div>

      </footer>

    </main>
  );
}


/* =====================================================
   EQUIPMENT CARD
===================================================== */

function EquipmentCard({
  icon,
  name,
  code,
  category,
  status,
  statusClass,
}: {
  icon: string;
  name: string;
  code: string;
  category: string;
  status: string;
  statusClass: "success" | "warning";
}) {
  return (
    <div className="col-md-6 col-lg-4">

      <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">

        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            height: "180px",
            background: "#f4f1fa",
            color: "#6f42c1",
          }}
        >
          <i className={`${icon} display-1`}></i>
        </div>

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-start gap-2">

            <div>
              <h5 className="fw-bold mb-1">
                {name}
              </h5>

              <small className="text-secondary">
                {code}
              </small>
            </div>

            <span
              className={`badge rounded-pill text-bg-${statusClass}`}
            >
              {status}
            </span>

          </div>

          <hr />

          <div className="d-flex justify-content-between">

            <span className="text-secondary">
              <i className="bi bi-tag me-2"></i>
              ประเภท
            </span>

            <span className="fw-semibold">
              {category}
            </span>

          </div>

        </div>

        <div className="card-footer bg-white border-0 px-4 pb-4">

          <button className="btn btn-outline-dark w-100 rounded-pill">
            ดูรายละเอียด
            <i className="bi bi-arrow-right ms-2"></i>
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   STEP
===================================================== */

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="col-md-4">

      <div className="px-3">

        <div className="position-relative d-inline-flex">

          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: "90px",
              height: "90px",
              background: "#eee8ff",
              color: "#6f42c1",
            }}
          >
            <i className={`${icon} fs-1`}></i>
          </div>

          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
            style={{
              background: "#6f42c1",
            }}
          >
            {number}
          </span>

        </div>

        <h5 className="fw-bold mt-4">
          {title}
        </h5>

        <p className="text-secondary">
          {description}
        </p>

      </div>

    </div>
  );
}