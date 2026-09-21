"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// =====================================================
// TYPES
// =====================================================

type HomeStats = {
  totalEquipment: number;
  borrowed: number;
  available: number;
  totalBorrowings: number;
};

// =====================================================
// HOME
// =====================================================

export default function Home() {
  // =====================================================
  // STATE
  // =====================================================

  const [stats, setStats] = useState<HomeStats>({
    totalEquipment: 0,
    borrowed: 0,
    available: 0,
    totalBorrowings: 0,
  });

  const [statsLoading, setStatsLoading] =
    useState(true);

  // =====================================================
  // LOAD BOOTSTRAP JS
  // =====================================================

  useEffect(() => {
    import(
      "bootstrap/dist/js/bootstrap.bundle.min.js"
    );
  }, []);

  // =====================================================
  // LOAD HOME STATISTICS
  // =====================================================

  useEffect(() => {
    const loadHomeStats = async () => {
      try {
        setStatsLoading(true);

        const response = await fetch(
          "/api/home-stats",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const contentType =
          response.headers.get("content-type");

        if (
          !contentType?.includes(
            "application/json"
          )
        ) {
          throw new Error(
            "API ไม่ได้ส่งข้อมูล JSON กลับมา"
          );
        }

        const result = await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "ไม่สามารถโหลดสถิติได้"
          );
        }

        setStats({
          totalEquipment: Number(
            result.data?.totalEquipment || 0
          ),

          borrowed: Number(
            result.data?.borrowed || 0
          ),

          available: Number(
            result.data?.available || 0
          ),

          totalBorrowings: Number(
            result.data?.totalBorrowings || 0
          ),
        });
      } catch (error) {
        console.error(
          "LOAD HOME STATS ERROR:",
          error
        );

        // หาก API มีปัญหา ให้เป็น 0
        setStats({
          totalEquipment: 0,
          borrowed: 0,
          available: 0,
          totalBorrowings: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    loadHomeStats();
  }, []);

  // =====================================================
  // NUMBER FORMAT
  // =====================================================

  const formatNumber = (value: number) => {
    return value.toLocaleString("th-TH");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="bg-light min-vh-100">
      {/* ================= NAVBAR ================= */}

      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div className="container py-2">
          {/* LOGO */}

          <Link
            className="navbar-brand d-flex align-items-center gap-3"
            href="/"
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
              <span className="fw-bold">
                CMU
              </span>
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

          {/* MOBILE MENU BUTTON */}

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* NAVIGATION */}

          <div
            className="collapse navbar-collapse"
            id="mainNavbar"
          >
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              {/* HOME */}

              <li className="nav-item">
                <Link
                  className="nav-link active"
                  href="/"
                >
                  <i className="bi bi-house me-1"></i>
                  หน้าหลัก
                </Link>
              </li>

              {/* EQUIPMENT */}

              <li className="nav-item">
                <Link
                  href="/login"
                  className="nav-link"
                >
                  <i className="bi bi-box me-1"></i>
                  ครุภัณฑ์
                </Link>
              </li>

              {/* LOGIN */}

              <li className="nav-item ms-lg-2">
                <Link
                  href="/login"
                  className="btn btn-outline-dark rounded-pill px-4"
                >
                  <i className="bi bi-person me-1"></i>
                  เข้าสู่ระบบ
                </Link>
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

                <span
                  style={{
                    color: "#6f42c1",
                  }}
                >
                  ครุภัณฑ์ออนไลน์
                </span>
              </h1>

              <p className="lead text-secondary mb-4">
                ระบบจัดการการยืมและคืนครุภัณฑ์
                ช่วยให้ตรวจสอบข้อมูลครุภัณฑ์
                และดำเนินการยืม–คืนได้อย่างสะดวก
              </p>

              {/* LOGIN BUTTON */}

              <div className="d-flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="btn btn-lg text-white rounded-pill px-4"
                  style={{
                    background: "#6f42c1",
                  }}
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  เข้าสู่ระบบ
                </Link>
              </div>
            </div>

            {/* RIGHT */}

            <div className="col-lg-5">
              <div
                className="bg-white rounded-4 shadow-lg p-4 mx-auto"
                style={{
                  maxWidth: "380px",
                }}
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
                    <i className="bi bi-box-seam fs-1"></i>
                  </div>

                  <h5 className="fw-bold">
                    ระบบยืม–คืนครุภัณฑ์
                  </h5>

                  <p className="text-secondary small mb-0">
                    จัดการข้อมูลครุภัณฑ์
                    และรายการยืม–คืนผ่านระบบออนไลน์
                  </p>
                </div>

                <hr />

                {/* FEATURE 1 */}

                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
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
                      ตรวจสอบครุภัณฑ์
                    </div>

                    <small className="text-secondary">
                      ตรวจสอบข้อมูลและสถานะครุภัณฑ์
                    </small>
                  </div>
                </div>

                {/* FEATURE 2 */}

                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "42px",
                      height: "42px",
                      background: "#fff3cd",
                      color: "#997404",
                    }}
                  >
                    <i className="bi bi-arrow-left-right"></i>
                  </div>

                  <div>
                    <div className="fw-semibold">
                      จัดการการยืม–คืน
                    </div>

                    <small className="text-secondary">
                      ดำเนินการยืมและคืนครุภัณฑ์ผ่านระบบ
                    </small>
                  </div>
                </div>

                {/* FEATURE 3 */}

                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "42px",
                      height: "42px",
                      background: "#eee8ff",
                      color: "#6f42c1",
                    }}
                  >
                    <i className="bi bi-clock-history"></i>
                  </div>

                  <div>
                    <div className="fw-semibold">
                      ตรวจสอบประวัติ
                    </div>

                    <small className="text-secondary">
                      ตรวจสอบรายการยืม–คืนย้อนหลัง
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
            {/* TOTAL EQUIPMENT */}

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
                    <div className="fs-4 fw-bold">
                      {statsLoading
                        ? "..."
                        : formatNumber(
                            stats.totalEquipment
                          )}
                    </div>

                    <small className="text-secondary">
                      ครุภัณฑ์ทั้งหมด
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* BORROWED */}

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
                    <div className="fs-4 fw-bold">
                      {statsLoading
                        ? "..."
                        : formatNumber(
                            stats.borrowed
                          )}
                    </div>

                    <small className="text-secondary">
                      กำลังถูกยืม
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* AVAILABLE */}

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
                    <div className="fs-4 fw-bold">
                      {statsLoading
                        ? "..."
                        : formatNumber(
                            stats.available
                          )}
                    </div>

                    <small className="text-secondary">
                      พร้อมใช้งาน
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* TOTAL BORROWINGS */}

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
                    <div className="fs-4 fw-bold">
                      {statsLoading
                        ? "..."
                        : formatNumber(
                            stats.totalBorrowings
                          )}
                    </div>

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
              icon="bi-box-seam"
              title="เลือกครุภัณฑ์"
              description="ตรวจสอบข้อมูลและเลือกครุภัณฑ์ที่ต้องการยืม"
            />

            <Step
              number="02"
              icon="bi-file-earmark-check"
              title="ทำรายการยืม"
              description="เข้าสู่ระบบและกรอกข้อมูลเพื่อส่งคำขอยืม"
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
        style={{
          background: "#17131f",
        }}
      >
        <div className="container">
          <div className="row g-4">
            {/* ABOUT */}

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

            {/* MENU */}

            <div className="col-lg-3">
              <h6 className="fw-bold mb-3">
                เมนู
              </h6>

              <div className="d-flex flex-column gap-2">
                <Link
                  href="/"
                  className="text-white-50 text-decoration-none"
                >
                  หน้าหลัก
                </Link>

                <Link
                  href="/login"
                  className="text-white-50 text-decoration-none"
                >
                  ครุภัณฑ์
                </Link>
              </div>
            </div>

            {/* CONTACT */}

            <div className="col-lg-3">
              <h6 className="fw-bold mb-3">
                ติดต่อ
              </h6>

              <div className="text-white-50 small">
                <div className="mb-2">
                  <i className="bi bi-geo-alt me-2"></i>
                  คณะสังคมศาสตร์
                  มหาวิทยาลัยเชียงใหม่
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

// =====================================================
// STEP COMPONENT
// =====================================================

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