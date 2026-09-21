"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Swal from "sweetalert2";

import { clearCurrentUser, useCurrentUser } from "./useCurrentUser";
import AppShell, { type ShellMenuItem } from "./AppShell";

const menuItems: ShellMenuItem[] = [
  {
    label: "แดชบอร์ดสรุปข้อมูล",
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
    label: "QR Code ครุภัณฑ์",
    icon: "bi-qr-code",
    href: "/admin/qr",
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

const footerLinks: ShellMenuItem[] = [
  {
    label: "กลับหน้าหลัก",
    icon: "bi-house",
    href: "/",
    exact: true,
  },
];

export default function AdminNavbar() {
  const router = useRouter();

  // ชื่อผู้ดูแลจากฐานข้อมูล
  const user = useCurrentUser();
  const [loggingOut, setLoggingOut] = useState(false);

  // =========================
  // BOOTSTRAP JS (dropdown / modal ในหน้าแอดมิน)
  // =========================
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

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
      clearCurrentUser();
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
      <AppShell
        homeHref="/admin/dashboard"
        subtitle="ระบบผู้ดูแล"
        sectionLabel="เมนูผู้ดูแลระบบ"
        menuItems={menuItems}
        footerLinks={footerLinks}
        userName={user?.name ?? ""}
        roleLabel={user ? "ผู้ดูแลระบบ" : ""}
        avatarUrl={user?.avatarUrl ?? null}
        sidebarWidth={260}
        loggingOut={loggingOut}
        onLogout={handleLogout}
      />

      <style jsx global>{`
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