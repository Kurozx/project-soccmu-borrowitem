"use client";

import { useEffect, useState } from "react";

// เรียกหลังบันทึกโปรไฟล์ เพื่อให้ Navbar โหลดชื่อใหม่จากฐานข้อมูล
export const PROFILE_UPDATED_EVENT = "profile-updated";

const USER_TYPE_LABEL: Record<string, string> = {
  student: "นักศึกษา",
  teacher: "อาจารย์",
  staff: "เจ้าหน้าที่",
};

export type CurrentUser = {
  name: string;
  roleLabel: string;
  avatarUrl: string | null;
};

// จำค่าไว้ระหว่างเปลี่ยนหน้า จะได้ไม่ต้องแสดงสถานะโหลดซ้ำทุกหน้า
let cachedUser: CurrentUser | null = null;

// ข้อมูลผู้ใช้ที่ล็อกอินอยู่ อ่านจากฐานข้อมูลผ่าน /api/profile
// คืน null ระหว่างโหลดครั้งแรก (ให้ UI แสดงช่องว่างแทนชื่อชั่วคราว)
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(
    () => cachedUser
  );

  useEffect(() => {
    let cancelled = false;

    const load = () =>
      fetch("/api/profile", { cache: "no-store" })
        .then((response) => response.json())
        .then((body) => {
          if (cancelled || !body?.success) return;

          const data = body.data as {
            username: string;
            role: "user" | "admin";
            user_type: string | null;
            avatar_url?: string | null;
          };

          cachedUser = {
            name: data.username,
            roleLabel:
              data.role === "admin"
                ? "ผู้ดูแลระบบ"
                : USER_TYPE_LABEL[data.user_type ?? ""] ?? "ผู้ใช้งาน",
            avatarUrl: data.avatar_url || null,
          };

          setUser(cachedUser);
        })
        .catch(() => {
          // โหลดไม่ได้ — คงค่าเดิมไว้
        });

    load();
    window.addEventListener(PROFILE_UPDATED_EVENT, load);

    return () => {
      cancelled = true;
      window.removeEventListener(PROFILE_UPDATED_EVENT, load);
    };
  }, []);

  return user;
}

// ล้างค่าที่จำไว้ตอนออกจากระบบ
export function clearCurrentUser() {
  cachedUser = null;
}
