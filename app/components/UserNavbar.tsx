"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    label: "Dashboard",
    icon: "bi-speedometer2",
    href: "/dashboard",
    exact: true,
  },
  {
    label: "ครุภัณฑ์",
    icon: "bi-box-seam",
    href: "/equipment",
    exact: true,
  },
  {
    label: "รายการยืมของฉัน",
    icon: "bi-box-arrow-up-right",
    href: "/borrowing",
    exact: true,
  },
  {
    label: "รายการคืน",
    icon: "bi-box-arrow-in-left",
    href: "/return",
    exact: true,
  },
  {
    label: "ประวัติการยืม–คืน",
    icon: "bi-clock-history",
    href: "/history",
    exact: true,
  },
  {
    label: "โปรไฟล์",
    icon: "bi-person",
    href: "/profile",
    exact: true,
  },
];

export default function UserNavbar() {
  const pathname = usePathname();

  const [userName, setUserName] = useState("ผู้ใช้งาน");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedName = sessionStorage.getItem("userName");

    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (item: MenuItem) => {
    if (item.exact) {
      return pathname === item.href;
    }

    return pathname.startsWith(item.href);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "ออกจากระบบ?",
      text: "คุณต้องการออกจากระบบใช่หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      confirmButtonColor: "#6f42c1",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await signOut({
        redirect: false,
      });

      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("userName");

      window.location.replace("/login");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);

      await Swal.fire({
        icon: "error",
        title: "ออกจากระบบไม่สำเร็จ",
        text: "กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#6f42c1",
      });
    }
  };

  return (
    <>
      {/* ================= MOBILE TOP BAR ================= */}
      <div
        className="d-lg-none position-fixed top-0 start-0 end-0 bg-white border-bottom"
        style={{
          height: "64px",
          zIndex: 1050,
        }}
      >
        <div className="d-flex align-items-center justify-content-between h-100 px-3">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "40px",
                height: "40px",
                background: "#6f42c1",
                color: "#fff",
              }}
            >
              <span className="fw-bold">CMU</span>
            </div>

            <div>
              <div className="fw-bold text-dark">
                ระบบยืม–คืนครุภัณฑ์
              </div>

              <small className="text-secondary">
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
              </small>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-light border"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="เปิดเมนู"
          >
            <i
              className={`bi ${
                mobileOpen ? "bi-x-lg" : "bi-list"
              } fs-4`}
            ></i>
          </button>
        </div>
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{
            background: "rgba(0,0,0,0.35)",
            zIndex: 1040,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`position-fixed top-0 start-0 h-100 bg-white border-end ${
          mobileOpen ? "mobile-sidebar-open" : ""
        }`}
        style={{
          width: collapsed ? "80px" : "270px",
          zIndex: 1060,
          transition: "width 0.25s ease, transform 0.25s ease",
          overflow: "hidden",
        }}
      >
        {/* ================= LOGO ================= */}
        <div
          className="d-flex align-items-center border-bottom"
          style={{
            height: "80px",
            padding: collapsed ? "0 17px" : "0 20px",
          }}
        >
          <Link
            href="/dashboard"
            className="text-decoration-none d-flex align-items-center gap-3"
            style={{
              minWidth: collapsed ? "46px" : "230px",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
              style={{
                width: "46px",
                height: "46px",
                background: "#6f42c1",
                color: "#fff",
              }}
            >
              <span className="fw-bold">CMU</span>
            </div>

            {!collapsed && (
              <div
                style={{
                  minWidth: 0,
                }}
              >
                <div
                  className="fw-bold text-dark"
                  style={{
                    fontSize: "15px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ระบบยืม–คืนครุภัณฑ์
                </div>

                <small
                  className="text-secondary"
                  style={{
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                  }}
                >
                  คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
                </small>
              </div>
            )}
          </Link>
        </div>

        {/* ================= USER PROFILE ================= */}
        <div
          className="border-bottom"
          style={{
            padding: collapsed ? "20px 17px" : "20px",
          }}
        >
          <div
            className={`d-flex align-items-center ${
              collapsed ? "justify-content-center" : "gap-3"
            }`}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "42px",
                height: "42px",
                background: "#eee8ff",
                color: "#6f42c1",
              }}
            >
              <i className="bi bi-person-fill fs-5"></i>
            </div>

            {!collapsed && (
              <div
                style={{
                  minWidth: 0,
                }}
              >
                <div
                  className="fw-semibold text-dark text-truncate"
                  style={{
                    maxWidth: "165px",
                    fontSize: "14px",
                  }}
                >
                  {userName}
                </div>

                <small className="text-secondary">
                  ผู้ใช้งาน
                </small>
              </div>
            )}
          </div>
        </div>

        {/* ================= MENU ================= */}
        <div
          className="py-3"
          style={{
            height: "calc(100vh - 190px)",
            overflowY: "auto",
          }}
        >
          {!collapsed && (
            <div
              className="text-uppercase text-secondary fw-semibold px-4 mb-2"
              style={{
                fontSize: "11px",
                letterSpacing: "0.5px",
              }}
            >
              เมนูผู้ใช้งาน
            </div>
          )}

          <ul className="nav flex-column px-2">
            {menuItems.map((item) => {
              const active = isActive(item);

              return (
                <li
                  className="nav-item mb-1"
                  key={item.href}
                >
                  <Link
                    href={item.href}
                    className={`nav-link d-flex align-items-center rounded-3 ${
                      collapsed
                        ? "justify-content-center"
                        : ""
                    }`}
                    style={{
                      minHeight: "46px",
                      padding: collapsed
                        ? "10px"
                        : "10px 14px",
                      background: active
                        ? "#6f42c1"
                        : "transparent",
                      color: active
                        ? "#fff"
                        : "#495057",
                      fontWeight: active
                        ? 600
                        : 400,
                      transition: "all 0.2s ease",
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <i
                      className={`bi ${item.icon}`}
                      style={{
                        fontSize: "18px",
                        width: "22px",
                        textAlign: "center",
                      }}
                    ></i>

                    {!collapsed && (
                      <span className="ms-3">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ================= BOTTOM ================= */}
        <div
          className="position-absolute bottom-0 start-0 end-0 bg-white border-top"
          style={{
            padding: collapsed ? "15px 17px" : "15px",
          }}
        >
          {/* COLLAPSE BUTTON */}
          <button
            type="button"
            className={`btn btn-light border w-100 d-flex align-items-center ${
              collapsed
                ? "justify-content-center"
                : ""
            }`}
            onClick={() => setCollapsed(!collapsed)}
            title={
              collapsed
                ? "ขยายเมนู"
                : "ย่อเมนู"
            }
          >
            <i
              className={`bi ${
                collapsed
                  ? "bi-chevron-right"
                  : "bi-chevron-left"
              }`}
            ></i>

            {!collapsed && (
              <span className="ms-2">
                ย่อเมนู
              </span>
            )}
          </button>

          {/* LOGOUT */}
          <button
            type="button"
            className={`btn btn-outline-danger w-100 mt-2 d-flex align-items-center ${
              collapsed
                ? "justify-content-center"
                : ""
            }`}
            onClick={handleLogout}
            title={
              collapsed
                ? "ออกจากระบบ"
                : undefined
            }
          >
            <i className="bi bi-box-arrow-right"></i>

            {!collapsed && (
              <span className="ms-2">
                ออกจากระบบ
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ================= SIDEBAR CSS ================= */}
      <style jsx>{`
        @media (max-width: 991.98px) {
          aside {
            width: 270px !important;
            transform: translateX(-100%);
          }

          aside.mobile-sidebar-open {
            transform: translateX(0);
          }
        }

        @media (min-width: 992px) {
          aside {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}