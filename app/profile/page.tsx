"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Swal from "sweetalert2";

import UserNavbar from "@/app/components/UserNavbar";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type UserProfile = {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
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

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
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

  const loadProfile = async () => {
    try {
      setLoading(true);

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
    });

    setShowEditModal(true);
  };

  const saveProfile = async () => {
    if (!editForm.username.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอก Username",
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
        text: "กรุณากรอก Email",
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
      <main className="bg-light min-vh-100">
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
      <main className="bg-light min-vh-100">
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
              className="btn text-white rounded-pill px-4 mt-3"
              style={{
                background: "#6f42c1",
              }}
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
      <UserNavbar />

      <main className="profile-main-content bg-light min-vh-100">
        {/* =================================================
            HEADER
        ================================================= */}

        <section
          className="py-5"
          style={{
            background:
              "linear-gradient(135deg, #f5f0ff 0%, #ffffff 60%, #eee8ff 100%)",
          }}
        >
          <div className="container-fluid px-4 px-lg-5">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{
                  width: "90px",
                  height: "90px",
                  background: "#6f42c1",
                  fontSize: "38px",
                }}
              >
                <i className="bi bi-person"></i>
              </div>

              <div>
                <span className="badge rounded-pill bg-white border text-primary px-3 py-2 mb-2">
                  <i className="bi bi-person-circle me-2"></i>
                  MY PROFILE
                </span>

                <h1 className="fw-bold mb-1">
                  {user.username}
                </h1>

                <p className="text-secondary mb-0">
                  ข้อมูลบัญชีผู้ใช้งาน
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="py-4 pb-5">
          <div className="container-fluid px-4 px-lg-5">
            <div className="row g-4">
              {/* PROFILE CARD */}

              <div className="col-lg-5">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  <div
                    className="text-center p-4"
                    style={{
                      background:
                        "linear-gradient(135deg,#6f42c1,#8e6ac8)",
                    }}
                  >
                    <div
                      className="mx-auto rounded-circle bg-white d-flex align-items-center justify-content-center"
                      style={{
                        width: "110px",
                        height: "110px",
                        color: "#6f42c1",
                        fontSize: "48px",
                      }}
                    >
                      <i className="bi bi-person"></i>
                    </div>

                    <h4 className="text-white fw-bold mt-3 mb-1">
                      {user.username}
                    </h4>

                    <span className="badge bg-white text-dark rounded-pill px-3">
                      {user.role === "admin"
                        ? "ผู้ดูแลระบบ"
                        : "ผู้ใช้งาน"}
                    </span>
                  </div>

                  <div className="card-body p-4">

                    <ProfileField
                      icon="bi-person"
                      title="Username"
                      value={user.username}
                    />

                    <ProfileField
                      icon="bi-envelope"
                      title="Email"
                      value={user.email}
                    />

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
                  </div>

                  <div className="card-footer bg-white border-0 p-4 pt-0">
                    <button
                      className="btn btn-dark rounded-pill w-100"
                      onClick={openEditModal}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      แก้ไขข้อมูลส่วนตัว
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT */}

              <div className="col-lg-7">
                {/* ACCOUNT INFO */}

                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-4">
                      <i
                        className="bi bi-person-vcard me-2"
                        style={{
                          color: "#6f42c1",
                        }}
                      ></i>
                      ข้อมูลบัญชี
                    </h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <small className="text-secondary">
                            Username
                          </small>

                          <div className="fw-bold mt-1 text-break">
                            {user.username}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <small className="text-secondary">
                            Email
                          </small>

                          <div className="fw-bold mt-1 text-break">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <small className="text-secondary">
                            สิทธิ์
                          </small>

                          <div className="mt-2">
                            <span
                              className={`badge rounded-pill ${
                                user.role === "admin"
                                  ? "bg-danger-subtle text-danger"
                                  : "bg-primary-subtle text-primary"
                              }`}
                            >
                              <i className="bi bi-shield-check me-1"></i>

                              {user.role === "admin"
                                ? "ผู้ดูแลระบบ"
                                : "ผู้ใช้งาน"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <small className="text-secondary">
                            สถานะบัญชี
                          </small>

                          <div className="mt-2">
                            <span className="badge rounded-pill bg-success-subtle text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              ใช้งานอยู่
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECURITY */}

                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-4">
                      <i className="bi bi-shield-check me-2 text-success"></i>
                      ความปลอดภัย
                    </h5>

                    <div className="d-flex align-items-center justify-content-between border rounded-4 p-3 mb-3">
                      <div>
                        <div className="fw-semibold">
                          รหัสผ่าน
                        </div>

                        <small className="text-secondary">
                          รหัสผ่านถูกจัดเก็บแบบเข้ารหัส
                        </small>
                      </div>

                      <span className="badge rounded-pill bg-success-subtle text-success">
                        ปลอดภัย
                      </span>
                    </div>

                    <button
                      className="btn btn-outline-secondary rounded-pill w-100"
                      onClick={openPasswordModal}
                    >
                      <i className="bi bi-key me-2"></i>
                      เปลี่ยนรหัสผ่าน
                    </button>
                  </div>
                </div>

                {/* ACCOUNT ACTIONS */}

                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      การจัดการบัญชี
                    </h5>

                    <button
                      type="button"
                      className="btn btn-outline-danger rounded-pill"
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
              <div className="modal-content border-0 rounded-4">
                <div className="modal-header border-0 p-4">
                  <div>
                    <h4 className="fw-bold mb-1">
                      แก้ไขข้อมูลส่วนตัว
                    </h4>

                    <small className="text-secondary">
                      แก้ไข Username และ Email
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
                    className="btn btn-light rounded-pill px-4"
                    disabled={saving}
                    onClick={() =>
                      setShowEditModal(false)
                    }
                  >
                    ยกเลิก
                  </button>

                  <button
                    className="btn text-white rounded-pill px-4"
                    style={{
                      background: "#6f42c1",
                    }}
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
              <div className="modal-content border-0 rounded-4">
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
                    className="btn btn-light rounded-pill px-4"
                    disabled={saving}
                    onClick={() =>
                      setShowPasswordModal(false)
                    }
                  >
                    ยกเลิก
                  </button>

                  <button
                    className="btn text-white rounded-pill px-4"
                    style={{
                      background: "#6f42c1",
                    }}
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

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer
          className="py-4 text-white"
          style={{
            background: "#17131f",
          }}
        >
          <div className="container-fluid px-4 px-lg-5">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
              <div>
                <div className="fw-bold">
                  ระบบยืม–คืนครุภัณฑ์
                </div>

                <small className="text-white-50">
                  คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
                </small>
              </div>

              <div className="text-white-50 small">
                © 2026 Faculty of Social Sciences
              </div>
            </div>
          </div>
        </footer>
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
          .profile-main-content {
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
        last ? "" : "border-bottom pb-3 mb-3"
      }
    >
      <div className="d-flex align-items-start gap-3">
        <div
          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: "42px",
            height: "42px",
            background: "#eee8ff",
            color: "#6f42c1",
          }}
        >
          <i className={`bi ${icon}`}></i>
        </div>

        <div className="flex-grow-1">
          <small className="text-secondary">
            {title}
          </small>

          <div className="fw-semibold mt-1 text-break">
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