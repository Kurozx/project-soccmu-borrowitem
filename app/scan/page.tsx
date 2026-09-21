import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ScanClient from "@/app/components/ScanClient";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default async function ScanPage() {
  // =========================
  // ตรวจสอบ Login
  // =========================
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // หน้าสแกนสำหรับ user เท่านั้น
  if (session.user.role !== "user") {
    redirect("/admin/dashboard");
  }

  return <ScanClient />;
}
