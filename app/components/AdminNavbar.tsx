"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Swal from "sweetalert2";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type MenuItem = {
  label: string;
  icon: string;
  href: string;
  exact?: boolean;
};

const menuItems: MenuItem[] = [
  {
    label: "Dashboard สรุปข้อมูล",
    icon: "bi-speedometer2",
    href: "/admin/dashboard",
    exact: true,
  },
  {
    label: "จัดการครุภัณฑ์",
    icon: "bi-box-seam",
    href: "/admin/equipment",
    exact: true,
  },
  {
    label: "จัดการรายการยืม",
    icon: "bi-box-arrow-up-right",
    href: "/admin/borrowing",
    exact: true,
  },
  {
    label: "จัดการรายการคืน",
    icon: "bi-box-arrow-in-left",
    href: "/admin/history",
    exact: true,
  },
  {
    label: "จัดการผู้ใช้งาน",
    icon: "bi-people",
    href: "/admin/users",
    exact: true,
  },
  {
    label: "รายงานสถิติการยืม–คืน",
    icon: "bi-bar-chart-line",
    href: "/admin/report",
    exact: true,
  },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState("ผู้ดูแลระบบ");
  const [loggingOut, setLoggingOut] = useState(false);

  // =========================
  // LOAD USER NAME
  // =========================
  useEffect(() => {
    const storedName = sessionStorage.getItem("userName");

    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  // =========================
  // CLOSE MOBILE MENU
  // =========================
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // =========================
  // ACTIVE MENU
  // =========================
  const isActive = (item: MenuItem) => {
    if (item.exact) {
      return pathname === item.href;
    }

    return pathname.startsWith(item.href);
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    if (loggingOut) return;

    const result = await Swal.fire({
      title: "ออกจากระบบ?",
      text: "คุณต้องการออกจากระบบใช่หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      focusCancel: true,

      buttonsStyling: false,

      customClass: {
        popup: "admin-swal-popup",
        title: "admin-swal-title",
        htmlContainer: "admin-swal-text",
        confirmButton: "admin-swal-confirm",
        cancelButton: "admin-swal-cancel",
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoggingOut(true);

      // Loading
      Swal.fire({
        title: "กำลังออกจากระบบ...",
        text: "กรุณารอสักครู่",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: "admin-swal-popup",
          title: "admin-swal-title",
          htmlContainer: "admin-swal-text",
        },
      });

      // Logout ผ่าน NextAuth
      await signOut({
        redirect: false,
      });

      // ล้าง sessionStorage เดิมด้วย
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("userName");

      // แสดงข้อความสำเร็จ
      await Swal.fire({
        icon: "success",
        title: "ออกจากระบบสำเร็จ",
        text: "กำลังกลับไปยังหน้าเข้าสู่ระบบ",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,

        customClass: {
          popup: "admin-swal-popup",
          title: "admin-swal-title",
          htmlContainer: "admin-swal-text",
        },
      });

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT ERROR:", error);

      setLoggingOut(false);

      await Swal.fire({
        icon: "error",
        title: "ออกจากระบบไม่สำเร็จ",
        text: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",

        buttonsStyling: false,

        customClass: {
          popup: "admin-swal-popup",
          title: "admin-swal-title",
          htmlContainer: "admin-swal-text",
          confirmButton: "admin-swal-confirm",
        },
      });
    }
  };

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      <header
        className="bg-white border-bottom"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "74px",
          zIndex: 1100,
        }}
      >
        <div
          className="h-100 d-flex align-items-center justify-content-between"
          style={{
            padding: "0 20px",
          }}
        >
          {/* ================= LOGO ================= */}
          <Link
            href="/admin/dashboard"
            className="text-decoration-none text-dark d-flex align-items-center gap-3"
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "40px",
                height: "40px",
                background: "#6f42c1",
                color: "#fff",
              }}
            >
              <i className="bi bi-box-seam fs-5" />
            </div>

            <div className="lh-sm">
              <div className="fw-bold">
                ระบบยืม–คืนครุภัณฑ์
              </div>

              <div
                className="text-secondary"
                style={{
                  fontSize: "14px",
                }}
              >
                Admin Panel
              </div>
            </div>
          </Link>

          {/* ================= USER ================= */}
          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-md-block">
              <div className="fw-semibold">
                {userName}
              </div>

              <small className="text-secondary">
                Administrator
              </small>
            </div>

            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                background: "#eee8ff",
                color: "#6f42c1",
              }}
            >
              <i className="bi bi-person-fill" />
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              className="btn btn-light d-lg-none"
              onClick={() => setMobileOpen(!mobileOpen)}
              disabled={loggingOut}
            >
              <i
                className={`bi ${
                  mobileOpen ? "bi-x-lg" : "bi-list"
                } fs-4`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ================= SIDEBAR ================= */}
      <aside
        className="bg-white border-end d-none d-lg-block"
        style={{
          position: "fixed",
          top: "74px",
          left: 0,
          bottom: 0,
          width: "260px",
          zIndex: 1050,
          overflowY: "auto",
        }}
      >
        <div className="p-3">

          <div
            className="text-secondary fw-semibold small mb-3"
            style={{
              letterSpacing: "1px",
            }}
          >
            เมนู
          </div>

          {/* MENU */}
          {menuItems.map((item) => {
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="text-decoration-none d-flex align-items-center gap-3 mb-2"
                style={{
                  padding: "15px 14px",
                  borderRadius: "9px",
                  color: active ? "#fff" : "#5f6368",
                  background: active
                    ? "#6f42c1"
                    : "transparent",
                  fontWeight: active ? 600 : 400,
                  transition: "0.2s",
                }}
              >
                <i
                  className={`bi ${item.icon} fs-5`}
                />

                <span>{item.label}</span>
              </Link>
            );
          })}

          <hr className="my-4" />

          {/* ================= HOME ================= */}
          <Link
            href="/"
            className="text-decoration-none d-flex align-items-center gap-3 mb-2"
            style={{
              padding: "15px 14px",
              borderRadius: "9px",
              color: "#5f6368",
            }}
          >
            <i className="bi bi-house fs-5" />

            <span>กลับหน้าหลัก</span>
          </Link>

          {/* ================= LOGOUT ================= */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="border-0 bg-light w-100 d-flex align-items-center gap-3"
            style={{
              padding: "15px 14px",
              borderRadius: "9px",
              color: "#212529",
              cursor: loggingOut
                ? "not-allowed"
                : "pointer",
              opacity: loggingOut ? 0.7 : 1,
              transition: "0.2s",
            }}
          >
            <i
              className={`bi ${
                loggingOut
                  ? "bi-hourglass-split"
                  : "bi-box-arrow-right"
              } fs-5`}
            />

            <span>
              {loggingOut
                ? "กำลังออกจากระบบ..."
                : "ออกจากระบบ"}
            </span>
          </button>
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR ================= */}
      {mobileOpen && (
        <>
          {/* OVERLAY */}
          <div
            className="d-lg-none position-fixed"
            onClick={() => setMobileOpen(false)}
            style={{
              top: "74px",
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.25)",
              zIndex: 1190,
            }}
          />

          {/* SIDEBAR */}
          <div
            className="d-lg-none position-fixed bg-white shadow"
            style={{
              top: "74px",
              left: 0,
              bottom: 0,
              width: "260px",
              zIndex: 1200,
              overflowY: "auto",
            }}
          >
            <div className="p-3">

              <div
                className="text-secondary fw-semibold small mb-3"
                style={{
                  letterSpacing: "1px",
                }}
              >
                เมนู
              </div>

              {menuItems.map((item) => {
                const active = isActive(item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="text-decoration-none d-flex align-items-center gap-3 mb-2"
                    style={{
                      padding: "14px",
                      borderRadius: "9px",
                      color: active
                        ? "#fff"
                        : "#5f6368",
                      background: active
                        ? "#6f42c1"
                        : "transparent",
                      fontWeight: active
                        ? 600
                        : 400,
                    }}
                  >
                    <i
                      className={`bi ${item.icon}`}
                    />

                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <hr className="my-4" />

              {/* MOBILE HOME */}
              <Link
                href="/"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="text-decoration-none d-flex align-items-center gap-3 mb-2"
                style={{
                  padding: "14px",
                  borderRadius: "9px",
                  color: "#5f6368",
                }}
              >
                <i className="bi bi-house fs-5" />

                <span>กลับหน้าหลัก</span>
              </Link>

              {/* MOBILE LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="border-0 bg-light w-100 d-flex align-items-center gap-3"
                style={{
                  padding: "14px",
                  borderRadius: "9px",
                  color: "#212529",
                  cursor: loggingOut
                    ? "not-allowed"
                    : "pointer",
                  opacity: loggingOut ? 0.7 : 1,
                }}
              >
                <i
                  className={`bi ${
                    loggingOut
                      ? "bi-hourglass-split"
                      : "bi-box-arrow-right"
                  } fs-5`}
                />

                <span>
                  {loggingOut
                    ? "กำลังออกจากระบบ..."
                    : "ออกจากระบบ"}
                </span>
              </button>

            </div>
          </div>
        </>
      )}

      {/* ================= GLOBAL STYLE ================= */}
      <style jsx global>{`
        .admin-page-content {
          margin-left: 260px;
          padding-top: 74px;
          min-height: 100vh;
        }

        @media (max-width: 991px) {
          .admin-page-content {
            margin-left: 0;
          }
        }

        /* ================= SWEETALERT ================= */

        .admin-swal-popup {
          border-radius: 18px !important;
          padding: 28px !important;
        }

        .admin-swal-title {
          font-size: 24px !important;
          font-weight: 700 !important;
          color: #212529 !important;
        }

        .admin-swal-text {
          color: #6c757d !important;
          font-size: 15px !important;
        }

        .admin-swal-confirm {
          border: none !important;
          background: #6f42c1 !important;
          color: #fff !important;
          padding: 10px 22px !important;
          border-radius: 9px !important;
          font-weight: 600 !important;
          margin: 0 5px !important;
        }

        .admin-swal-confirm:hover {
          background: #5a32a3 !important;
        }

        .admin-swal-cancel {
          border: none !important;
          background: #e9ecef !important;
          color: #495057 !important;
          padding: 10px 22px !important;
          border-radius: 9px !important;
          font-weight: 600 !important;
          margin: 0 5px !important;
        }

        .admin-swal-cancel:hover {
          background: #dee2e6 !important;
        }
      `}</style>
    </>
  );
}