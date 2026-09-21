import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  // ยังไม่ได้เข้าสู่ระบบ
  if (!session?.user) {
    redirect("/login");
  }

  // ไม่ใช่ admin
  if (session.user.role !== "admin") {
    redirect("/profile");
  }

  // เฉพาะ admin เท่านั้น
  return <DashboardClient />;
}