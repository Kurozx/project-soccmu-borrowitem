"use client";

import { signOut } from "next-auth/react";
import Swal from "sweetalert2";

import { clearCurrentUser, useCurrentUser } from "./useCurrentUser";
import AppShell, { type ShellMenuItem } from "./AppShell";

const menuItems: ShellMenuItem[] = [
  {
    label: "สแกน QR ยืม–คืน",
    icon: "bi-qr-code-scan",
    href: "/scan",
    exact: true,
  },
  {
    label: "แดชบอร์ด",
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
  // ชื่อและประเภทผู้ใช้จากฐานข้อมูล
  const user = useCurrentUser();

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

      clearCurrentUser();
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
    <AppShell
      homeHref="/dashboard"
      subtitle="คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่"
      sectionLabel="เมนูผู้ใช้งาน"
      menuItems={menuItems}
      userName={user?.name ?? ""}
      roleLabel={user?.roleLabel ?? ""}
      avatarUrl={user?.avatarUrl ?? null}
      sidebarWidth={270}
      onLogout={handleLogout}
    />
  );
}
