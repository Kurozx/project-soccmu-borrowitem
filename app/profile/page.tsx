"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Swal from "sweetalert2";
import { PROFILE_UPDATED_EVENT } from "@/app/components/useCurrentUser";
import {
  ACCEPT_IMAGES,
  deleteImage,
  uploadImage,
} from "@/lib/client-images";

import UserNavbar from "@/app/components/UserNavbar";
import AdminNavbar from "@/app/components/AdminNavbar";
import { PageHeader, Panel, Pill } from "@/app/components/ui";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type UserType = "student" | "teacher" | "staff";

const USER_TYPE_LABELS: Record<UserType, string> = {
  student: "นักศึกษา",
  teacher: "อาจารย์",
  staff: "เจ้าหน้าที่/บุคลากร",
};

function getUserTypeLabel(
  role: "user" | "admin",
  userType: UserType | null
) {
  if (role === "admin") return "ผู้ดูแลระบบ";
  return userType ? USER_TYPE_LABELS[userType] : "-";
}

// ดึงรหัสรูปจาก avatar_url ("/api/images/{id}")
function parseImageId(url: string | null) {
  const match = url?.match(/\/api\/images\/(\d+)/);
  return match ? Number(match[1]) : null;
}

type UserProfile = {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  user_type: UserType | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState<"upload" | "delete" | null>(
    null
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState<{
    username: string;
    email: string;
    userType: UserType | "";
  }>({
    username: "",
    email: "",
    userType: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  // silent = โหลดใหม่เงียบ ๆ (ไม่แสดงหน้าโหลดทั้งหน้า)
  const loadProfile = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await fetch("/api/profile", {
        method: "GET",
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        throw new Error("API ไม่ได้ส่งข้อมูล JSON กลับมา");
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 401) {
          window.location.replace("/login");
          return;
        }

        throw new Error(
          result.message || "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้"
        );
      }

      setUser(result.data);

      setEditForm({
        username: result.data.username,
        email: result.data.email,
        userType: result.data.user_type ?? "",
      });

      // เก็บข้อมูลให้ UserNavbar ใช้ได้ด้วย
      try {
        sessionStorage.setItem("userName", result.data.username);
        sessionStorage.setItem("userRole", result.data.role);
        sessionStorage.setItem("isLoggedIn", "true");
      } catch (storageError) {
        console.warn("SESSION STORAGE ERROR:", storageError);
      }
    } catch (error) {
      console.error("LOAD PROFILE ERROR:", error);

      await Swal.fire({
        icon: "error",
        title: "โหลดข้อมูลไม่สำเร็จ",
        text:
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: {
          confirmButton: "profile-swal-confirm",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const openEditModal = () => {
    if (!user) return;

    setEditForm({
      username: user.username,
      email: user.email,
      userType: user.user_type ?? "",
    });

    setShowEditModal(true);
  };

  const saveProfile = async () => {
    if (!editForm.username.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกชื่อผู้ใช้",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: {
          confirmButton: "profile-swal-confirm",
        },
      });

      return;
    }

    if (!editForm.email.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกอีเมล",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: {
          confirmButton: "profile-swal-confirm",
        },
      });

      return;
    }

    if (user?.role !== "admin" && !editForm.userType) {
      await Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณาเลือกประเภทผู้ใช้",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: {
          confirmButton: "profile-swal-confirm",
        },
      });

      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: editForm.username.trim(),
          email: editForm.email.trim(),
          userType: editForm.userType,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "ไม่สามารถบันทึกข้อมูลได้"
        );
      }

      setShowEditModal(false);

      await loadProfile();
      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));

      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "ข้อมูลโปรไฟล์ถูกแก้ไขแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("SAVE PROFILE ERROR:", error);

      await Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text:
          error instanceof Error
            ? error.message
            : "ไม่สามารถบันทึกข้อมูลได้",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: {
          confirmButton: "profile-swal-confirm",
        },
      });
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // AVATAR (รูปโปรไฟล์)
  // =====================================================

  const showAvatarError = async (error: unknown, fallback: string) => {
    await Swal.fire({
      icon: "error",
      title: "ดำเนินการไม่สำเร็จ",
      text: error instanceof Error ? error.message : fallback,
      confirmButtonText: "ตกลง",
      buttonsStyling: false,
      customClass: {
        confirmButton: "profile-swal-confirm",
      },
    });
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !user) return;

    try {
      setAvatarBusy("upload");

      await uploadImage({
        file,
        ownerType: "user",
        ownerId: user.id,
        maxSize: 512,
      });

      await loadProfile(true);
      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));

      await Swal.fire({
        icon: "success",
        title: "เปลี่ยนรูปโปรไฟล์สำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("UPLOAD AVATAR ERROR:", error);
      await showAvatarError(error, "ไม่สามารถอัปโหลดรูปได้");
    } finally {
      setAvatarBusy(null);
    }
  };

  const handleAvatarDelete = async () => {
    const imageId = parseImageId(user?.avatar_url ?? null);

    if (!imageId) return;

    const confirm = await Swal.fire({
      icon: "warning",
      title: "ลบรูปโปรไฟล์?",
      text: "ต้องการลบรูปโปรไฟล์ใช่หรือไม่",
      showCancelButton: true,
      confirmButtonText: "ลบรูป",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      focusCancel: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: "profile-swal-confirm",
        cancelButton: "profile-swal-cancel",
      },
    });

    if (!confirm.isConfirmed) return;

    try {
      setAvatarBusy("delete");

      await deleteImage(imageId);

      await loadProfile(true);
      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));

      await Swal.fire({
        icon: "success",
        title: "ลบรูปโปรไฟล์แล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("DELETE AVATAR ERROR:", error);
      await showAvatarError(error, "ไม่สามารถลบรูปได้");
    } finally {
      setAvatarBusy(null);
    }
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setShowPasswordModal(true);
  };

  const changePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      await Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกรหัสผ่านให้ครบทุกช่อง",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: {
          confirmButton: "profile-swal-confirm",
        },
      });

      return;
    }

    if (passwordForm.newPassword.length < 6) {
      await Swal.fire({
        icon: "warning",
        title: "รหัสผ่านไม่ถูกต้อง",
        text: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: {
          confirmButton: "profile-swal-confirm",
        },
      });

      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      await Swal.fire({
        icon: "warning",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณากรอกรหัสผ่านใหม่ให้ตรงกัน",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: {
          confirmButton: "profile-swal-confirm",
        },
      });

      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้"
        );
      }

      setShowPasswordModal(false);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      await Swal.fire({
        icon: "success",
        title: "เปลี่ยนรหัสผ่านสำเร็จ",
        text: "รหัสผ่านใหม่ถูกบันทึกเรียบร้อยแล้ว",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("CHANGE PASSWORD ERROR:", error);

      await Swal.fire({
        icon: "error",
        title: "เปลี่ยนรหัสผ่านไม่สำเร็จ",
        text:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาด",
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: {
          confirmButton: "profile-swal-confirm",
        },
      });
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

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
        confirmButton: "profile-swal-confirm",
        cancelButton: "profile-swal-cancel",
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoggingOut(true);

      Swal.fire({
        title: "กำลังออกจากระบบ...",
        text: "กรุณารอสักครู่",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await signOut({
        redirect: false,
      });

      try {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("userName");
      } catch (storageError) {
        console.warn(
          "SESSION STORAGE CLEAR ERROR:",
          storageError
        );
      }

      await Swal.fire({
        icon: "success",
        title: "ออกจากระบบสำเร็จ",
        text: "กำลังกลับไปหน้าเข้าสู่ระบบ...",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      window.location.replace("/login");
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
          confirmButton: "profile-swal-confirm",
        },
      });
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-vh-100" style={{ background: "#fafafa" }}>
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{
            minHeight: "100vh",
          }}
        >
          <div
            className="spinner-border mb-3"
            style={{
              color: "#6f42c1",
              width: "3rem",
              height: "3rem",
            }}
          />

          <div className="text-secondary">
            กำลังโหลดข้อมูลโปรไฟล์...
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // NO USER
  // =====================================================

  if (!user) {
    return (
      <main className="min-vh-100" style={{ background: "#fafafa" }}>
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            minHeight: "100vh",
          }}
        >
          <div className="text-center">
            <i
              className="bi bi-person-x"
              style={{
                fontSize: "60px",
                color: "#6f42c1",
              }}
            />

            <h3 className="fw-bold mt-3">
              ไม่พบข้อมูลผู้ใช้งาน
            </h3>

            <Link
              href="/login"
              className="btn profile-primary-btn px-4 mt-3"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <>
      {/* เมนูตามสิทธิ์ของผู้ใช้ */}
      {user.role === "admin" ? <AdminNavbar /> : <UserNavbar />}

      <main
        className={`profile-main-content min-vh-100 ${
          user.role === "admin" ? "is-admin" : ""
        }`}
      >
        <div className="ui-page">
          {/* =================================================
              HEADER
          ================================================= */}

          <PageHeader
            eyebrow="บัญชีผู้ใช้"
            title={user.username}
            description="ข้อมูลบัญชีผู้ใช้งาน"
          />

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="row g-3">
            {/* PROFILE CARD */}

            <div className="col-lg-5">
              <Panel className="h-100">
                <div className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom">
                  <div className="profile-avatar">
                    {user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar_url}
                        alt={`รูปโปรไฟล์ของ ${user.username}`}
                      />
                    ) : (
                      <i className="bi bi-person"></i>
                    )}

                    {avatarBusy && (
                      <span className="profile-avatar-busy">
                        <span className="spinner-border spinner-border-sm" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="fw-semibold text-break">
                      {user.username}
                    </div>

                    <div className="mt-1">
                      <Pill
                        tone={
                          user.role === "admin"
                            ? "rose"
                            : "purple"
                        }
                      >
                        {user.role === "admin"
                          ? "ผู้ดูแลระบบ"
                          : "ผู้ใช้งาน"}
                      </Pill>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 pb-3 mb-3 border-bottom">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept={ACCEPT_IMAGES}
                    className="d-none"
                    onChange={handleAvatarChange}
                  />

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary profile-btn"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarBusy !== null}
                  >
                    {avatarBusy === "upload" ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" />
                        กำลังอัปโหลด...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-camera me-1"></i>
                        เปลี่ยนรูปโปรไฟล์
                      </>
                    )}
                  </button>

                  {user.avatar_url && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger profile-btn"
                      onClick={handleAvatarDelete}
                      disabled={avatarBusy !== null}
                    >
                      {avatarBusy === "delete" ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" />
                          กำลังลบ...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-trash me-1"></i>
                          ลบรูป
                        </>
                      )}
                    </button>
                  )}
                </div>

                <ProfileField
                  icon="bi-person"
                  title="ชื่อผู้ใช้"
                  value={user.username}
                />

                <ProfileField
                  icon="bi-envelope"
                  title="อีเมล"
                  value={user.email}
                />

                {user.role !== "admin" && (
                  <ProfileField
                    icon="bi-person-badge"
                    title="ประเภทผู้ใช้"
                    value={getUserTypeLabel(
                      user.role,
                      user.user_type
                    )}
                  />
                )}

                <ProfileField
                  icon="bi-shield-check"
                  title="สิทธิ์การใช้งาน"
                  value={
                    user.role === "admin"
                      ? "ผู้ดูแลระบบ"
                      : "ผู้ใช้งาน"
                  }
                />

                <ProfileField
                  icon="bi-calendar-check"
                  title="วันที่สมัครสมาชิก"
                  value={formatDate(user.created_at)}
                />

                <ProfileField
                  icon="bi-clock-history"
                  title="แก้ไขข้อมูลล่าสุด"
                  value={formatDate(user.updated_at)}
                  last
                />

                <button
                  className="btn profile-primary-btn w-100 mt-3"
                  onClick={openEditModal}
                >
                  <i className="bi bi-pencil me-2"></i>
                  แก้ไขข้อมูลส่วนตัว
                </button>
              </Panel>
            </div>

            {/* RIGHT */}

            <div className="col-lg-7 d-flex flex-column gap-3">
              {/* ACCOUNT INFO */}

              <Panel
                title="ข้อมูลบัญชี"
                description="รายละเอียดบัญชีที่ใช้เข้าสู่ระบบ"
              >
                <div className="row g-2">
                  <div className="col-md-6">
                    <div className="profile-tile">
                      <div className="profile-tile-label">
                        Username
                      </div>

                      <div className="fw-semibold mt-1 text-break">
                        {user.username}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="profile-tile">
                      <div className="profile-tile-label">
                        Email
                      </div>

                      <div className="fw-semibold mt-1 text-break">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="profile-tile">
                      <div className="profile-tile-label">
                        ประเภทผู้ใช้
                      </div>

                      <div className="mt-2">
                        {user.role === "admin" ? (
                          <Pill tone="rose">
                            <i className="bi bi-person-badge"></i>
                            ผู้ดูแลระบบ
                          </Pill>
                        ) : user.user_type ? (
                          <Pill tone="blue">
                            <i className="bi bi-person-badge"></i>
                            {USER_TYPE_LABELS[user.user_type]}
                          </Pill>
                        ) : (
                          <span className="small text-secondary">
                            ยังไม่ระบุ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="profile-tile">
                      <div className="profile-tile-label">
                        สิทธิ์
                      </div>

                      <div className="mt-2">
                        <Pill
                          tone={
                            user.role === "admin"
                              ? "rose"
                              : "purple"
                          }
                        >
                          <i className="bi bi-shield-check"></i>

                          {user.role === "admin"
                            ? "ผู้ดูแลระบบ"
                            : "ผู้ใช้งาน"}
                        </Pill>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="profile-tile">
                      <div className="profile-tile-label">
                        สถานะบัญชี
                      </div>

                      <div className="mt-2">
                        <Pill tone="emerald">
                          <i className="bi bi-check-circle"></i>
                          ใช้งานอยู่
                        </Pill>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>

              {/* SECURITY */}

              <Panel
                title="ความปลอดภัย"
                description="จัดการรหัสผ่านสำหรับเข้าสู่ระบบ"
              >
                <div className="profile-tile d-flex align-items-center justify-content-between gap-3 mb-3">
                  <div>
                    <div className="fw-semibold small">
                      รหัสผ่าน
                    </div>

                    <div className="profile-tile-label">
                      รหัสผ่านถูกจัดเก็บแบบเข้ารหัส
                    </div>
                  </div>

                  <Pill tone="emerald">ปลอดภัย</Pill>
                </div>

                <button
                  className="btn btn-outline-secondary profile-btn w-100"
                  onClick={openPasswordModal}
                >
                  <i className="bi bi-key me-2"></i>
                  เปลี่ยนรหัสผ่าน
                </button>
              </Panel>

              {/* ACCOUNT ACTIONS */}

              <Panel
                title="การจัดการบัญชี"
                description="ออกจากระบบจากอุปกรณ์นี้"
              >
                <button
                  type="button"
                  className="btn btn-outline-danger profile-btn"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      กำลังออกจากระบบ...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      ออกจากระบบ
                    </>
                  )}
                </button>
              </Panel>
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="profile-footer">
            <div>
              <span className="fw-semibold text-dark">
                ระบบยืม–คืนครุภัณฑ์
              </span>
              <span className="mx-2">•</span>
              คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
            </div>

            <div>© 2026 Faculty of Social Sciences</div>
          </footer>
        </div>

        {/* =====================================================
            EDIT PROFILE MODAL
        ===================================================== */}

        {showEditModal && (
          <div
            className="modal fade show d-block"
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 2000,
            }}
            onClick={() =>
              !saving && setShowEditModal(false)
            }
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 rounded-3">
                <div className="modal-header border-0 p-4">
                  <div>
                    <h4 className="fw-bold mb-1">
                      แก้ไขข้อมูลส่วนตัว
                    </h4>

                    <small className="text-secondary">
                      {user.role === "admin"
                        ? "แก้ไขชื่อผู้ใช้และอีเมล"
                        : "แก้ไขชื่อผู้ใช้ อีเมล และประเภทผู้ใช้"}
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    disabled={saving}
                    onClick={() =>
                      setShowEditModal(false)
                    }
                  ></button>
                </div>

                <div className="modal-body px-4 pb-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Username
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          username: e.target.value,
                        })
                      }
                      disabled={saving}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Email
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          email: e.target.value,
                        })
                      }
                      disabled={saving}
                    />
                  </div>

                  {user.role !== "admin" && (
                    <div className="mb-3">
                      <label
                        htmlFor="profile-user-type"
                        className="form-label fw-semibold"
                      >
                        ประเภทผู้ใช้
                      </label>

                      <select
                        id="profile-user-type"
                        className="form-select"
                        value={editForm.userType}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            userType: e.target.value as
                              | UserType
                              | "",
                          })
                        }
                        disabled={saving}
                      >
                        <option value="" disabled>
                          เลือกประเภทผู้ใช้
                        </option>
                        <option value="student">
                          {USER_TYPE_LABELS.student}
                        </option>
                        <option value="teacher">
                          {USER_TYPE_LABELS.teacher}
                        </option>
                        <option value="staff">
                          {USER_TYPE_LABELS.staff}
                        </option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="form-label fw-semibold">
                      สิทธิ์การใช้งาน
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={
                        user.role === "admin"
                          ? "ผู้ดูแลระบบ"
                          : "ผู้ใช้งาน"
                      }
                      disabled
                    />

                    <small className="text-secondary">
                      ไม่สามารถแก้ไขสิทธิ์จากหน้า Profile ได้
                    </small>
                  </div>
                </div>

                <div className="modal-footer border-0 px-4 pb-4">
                  <button
                    className="btn btn-light profile-btn px-4"
                    disabled={saving}
                    onClick={() =>
                      setShowEditModal(false)
                    }
                  >
                    ยกเลิก
                  </button>

                  <button
                    className="btn profile-primary-btn px-4"
                    disabled={saving}
                    onClick={saveProfile}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        บันทึกข้อมูล
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            CHANGE PASSWORD MODAL
        ===================================================== */}

        {showPasswordModal && (
          <div
            className="modal fade show d-block"
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 2000,
            }}
            onClick={() =>
              !saving && setShowPasswordModal(false)
            }
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 rounded-3">
                <div className="modal-header border-0 p-4">
                  <div>
                    <h4 className="fw-bold mb-1">
                      เปลี่ยนรหัสผ่าน
                    </h4>

                    <small className="text-secondary">
                      กรุณากรอกรหัสผ่านปัจจุบันก่อน
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    disabled={saving}
                    onClick={() =>
                      setShowPasswordModal(false)
                    }
                  ></button>
                </div>

                <div className="modal-body px-4 pb-4">
                  <PasswordInput
                    label="รหัสผ่านปัจจุบัน"
                    value={passwordForm.currentPassword}
                    show={showCurrentPassword}
                    onChange={(value) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: value,
                      })
                    }
                    onToggle={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                    disabled={saving}
                  />

                  <PasswordInput
                    label="รหัสผ่านใหม่"
                    value={passwordForm.newPassword}
                    show={showNewPassword}
                    onChange={(value) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: value,
                      })
                    }
                    onToggle={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                    disabled={saving}
                    helpText="อย่างน้อย 6 ตัวอักษร"
                  />

                  <PasswordInput
                    label="ยืนยันรหัสผ่านใหม่"
                    value={passwordForm.confirmPassword}
                    show={showConfirmPassword}
                    onChange={(value) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: value,
                      })
                    }
                    onToggle={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    disabled={saving}
                  />
                </div>

                <div className="modal-footer border-0 px-4 pb-4">
                  <button
                    className="btn btn-light profile-btn px-4"
                    disabled={saving}
                    onClick={() =>
                      setShowPasswordModal(false)
                    }
                  >
                    ยกเลิก
                  </button>

                  <button
                    className="btn profile-primary-btn px-4"
                    disabled={saving}
                    onClick={changePassword}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-key me-2"></i>
                        เปลี่ยนรหัสผ่าน
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* =====================================================
          GLOBAL STYLE
      ===================================================== */}

      <style jsx global>{`
        .profile-main-content {
          margin-left: 270px;
          min-height: 100vh;
          transition: margin-left 0.25s ease;
        }

        .profile-main-content.is-admin {
          margin-left: var(--admin-sidebar-width);
        }

        .profile-primary-btn {
          background: #6f42c1;
          border-color: #6f42c1;
          color: #fff;
          border-radius: 8px;
          font-weight: 500;
        }

        .profile-primary-btn:hover,
        .profile-primary-btn:focus {
          background: #5a32a3;
          border-color: #5a32a3;
          color: #fff;
        }

        .profile-btn {
          border-radius: 8px;
          font-weight: 500;
        }

        .profile-avatar {
          position: relative;
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3efff;
          color: #6f42c1;
          font-size: 26px;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-avatar-busy {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.7);
        }

        .profile-tile {
          height: 100%;
          padding: 12px 14px;
          border: 1px solid #e4e4e4;
          border-radius: 10px;
          background: #ffffff;
        }

        .profile-tile-label {
          font-size: 12px;
          color: #737373;
        }

        .profile-field-icon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          color: #525252;
          font-size: 14px;
        }

        .profile-footer {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid #e4e4e4;
          font-size: 12px;
          color: #737373;
        }

        .profile-swal-confirm {
          border: none !important;
          background: #6f42c1 !important;
          color: white !important;
          padding: 10px 22px !important;
          border-radius: 10px !important;
          font-weight: 600 !important;
          margin: 0 5px !important;
        }

        .profile-swal-confirm:hover {
          background: #5a32a3 !important;
        }

        .profile-swal-cancel {
          border: none !important;
          background: #e9ecef !important;
          color: #495057 !important;
          padding: 10px 22px !important;
          border-radius: 10px !important;
          font-weight: 600 !important;
          margin: 0 5px !important;
        }

        .profile-swal-cancel:hover {
          background: #dee2e6 !important;
        }

        @media (max-width: 991.98px) {
          .profile-main-content,
          .profile-main-content.is-admin {
            margin-left: 0;
            padding-top: 64px;
          }
        }
      `}</style>
    </>
  );
}

// =====================================================
// PROFILE FIELD
// =====================================================

function ProfileField({
  icon,
  title,
  value,
  last = false,
}: {
  icon: string;
  title: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={
        last ? "" : "border-bottom pb-2 mb-2"
      }
    >
      <div className="d-flex align-items-center gap-3">
        <div className="profile-field-icon">
          <i className={`bi ${icon}`}></i>
        </div>

        <div className="flex-grow-1 min-w-0">
          <div className="profile-tile-label">
            {title}
          </div>

          <div className="fw-semibold small text-break">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// PASSWORD INPUT
// =====================================================

function PasswordInput({
  label,
  value,
  show,
  onChange,
  onToggle,
  disabled,
  helpText,
}: {
  label: string;
  value: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  disabled: boolean;
  helpText?: string;
}) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">
        {label}
      </label>

      <div className="input-group">
        <input
          type={show ? "text" : "password"}
          className="form-control"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          disabled={disabled}
        />

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onToggle}
          disabled={disabled}
        >
          <i
            className={`bi ${
              show
                ? "bi-eye-slash"
                : "bi-eye"
            }`}
          ></i>
        </button>
      </div>

      {helpText && (
        <small className="text-secondary">
          {helpText}
        </small>
      )}
    </div>
  );
}

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}