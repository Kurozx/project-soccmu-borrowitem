import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// ตรวจสิทธิ์ครั้งเดียวสำหรับทุกหน้าใต้ /admin
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // ยังไม่ได้เข้าสู่ระบบ
  if (!session?.user) {
    redirect("/login");
  }

  // ไม่ใช่ admin
  if (session.user.role !== "admin") {
    redirect("/scan");
  }

  return children;
}
