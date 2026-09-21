"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import Swal from "sweetalert2";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    const normalizedUsername = username.trim();

    // ==================================================
    // ตรวจสอบข้อมูล
    // ==================================================

    if (!normalizedUsername || !password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");

      await Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูล",
        text: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#6f42c1",
      });

      return;
    }

    setLoading(true);

    try {
      // ==================================================
      // Login ผ่าน Auth.js
      // ==================================================

      const result = await signIn("credentials", {
        username: normalizedUsername,
        password,
        redirect: false,
      });

      console.log("LOGIN RESULT:", result);

      // ==================================================
      // Login ไม่สำเร็จ
      // ==================================================

      if (!result || result.error) {
        setError("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");

        await Swal.fire({
          icon: "error",
          title: "เข้าสู่ระบบไม่สำเร็จ",
          text: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง",
          confirmButtonText: "ลองอีกครั้ง",
          confirmButtonColor: "#6f42c1",
        });

        return;
      }

      // ==================================================
      // ดึง Session
      // ==================================================

      const session = await getSession();

      console.log("LOGIN SESSION:", session);

      // ==================================================
      // ไม่พบ Session
      // ==================================================

      if (!session?.user) {
        setError("ไม่พบข้อมูลบัญชีผู้ใช้งาน");

        await Swal.fire({
          icon: "error",
          title: "ไม่พบข้อมูลบัญชี",
          text: "เข้าสู่ระบบสำเร็จ แต่ไม่พบข้อมูลบัญชีผู้ใช้งาน",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#6f42c1",
        });

        return;
      }

      // ==================================================
      // ตรวจสอบ Role
      // ==================================================

      const role = session.user.role;

      console.log("USER ROLE:", role);

      // ==================================================
      // ตรวจสอบ Role ที่ไม่ถูกต้อง
      // ==================================================

      if (role !== "admin" && role !== "user") {
        setError("ไม่พบสิทธิ์การใช้งานของบัญชีนี้");

        await Swal.fire({
          icon: "error",
          title: "ไม่สามารถเข้าสู่ระบบได้",
          text: "ไม่พบสิทธิ์การใช้งานของบัญชีนี้",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#6f42c1",
        });

        return;
      }

      // ==================================================
      // บันทึกข้อมูลพื้นฐานลง sessionStorage
      // ใช้สำหรับแสดงชื่อบน Navbar
      // ==================================================

      sessionStorage.setItem(
        "isLoggedIn",
        "true"
      );

      sessionStorage.setItem(
        "userRole",
        role
      );

      sessionStorage.setItem(
        "userName",
        session.user.name ||
          normalizedUsername
      );

      // ==================================================
      // Login สำเร็จ
      // ==================================================

      await Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        text: `ยินดีต้อนรับ ${
          session.user.name ||
          normalizedUsername
        }`,
        confirmButtonText: "เข้าสู่ระบบ",
        confirmButtonColor: "#6f42c1",
        timer: 1500,
        timerProgressBar: true,
      });

      // ==================================================
      // ADMIN
      // ==================================================

      if (role === "admin") {
        router.replace("/admin/dashboard");
        return;
      }

      // ==================================================
      // USER
      // ==================================================

      if (role === "user") {
        router.replace("/dashboard");
        return;
      }

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง"
      );

      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#6f42c1",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, #f5f0ff 0%, #ffffff 50%, #eee8ff 100%)",
      }}
    >

      <div className="container py-5">

        <div className="row justify-content-center">

          <div className="col-12 col-md-8 col-lg-5 col-xl-4">

            {/* =================================================
                LOGIN CARD
            ================================================= */}

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">

              <div className="card-body p-4 p-md-5">

                {/* =================================================
                    LOGO
                ================================================= */}

                <div className="text-center mb-4">

                  <div
                    className="mx-auto d-flex align-items-center justify-content-center rounded-4 mb-3"
                    style={{
                      width: "72px",
                      height: "72px",
                      background: "#6f42c1",
                      color: "#fff",
                    }}
                  >
                    <i className="bi bi-box-seam fs-2"></i>
                  </div>

                  <h3 className="fw-bold mb-2">
                    ระบบยืม – คืนครุภัณฑ์
                  </h3>

                  <p className="text-muted mb-0">
                    เข้าสู่ระบบเพื่อใช้งานระบบ
                  </p>

                </div>


                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {error && (
                  <div
                    className="alert alert-danger border-0 rounded-3"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-circle me-2"></i>

                    {error}
                  </div>
                )}


                {/* =================================================
                    LOGIN FORM
                ================================================= */}

                <form onSubmit={handleLogin}>

                  {/* =================================================
                      USERNAME
                  ================================================= */}

                  <div className="mb-3">

                    <label
                      htmlFor="username"
                      className="form-label fw-semibold"
                    >
                      ชื่อผู้ใช้
                    </label>

                    <div className="input-group">

                      <span className="input-group-text bg-white">
                        <i className="bi bi-person"></i>
                      </span>

                      <input
                        id="username"
                        type="text"
                        className="form-control"
                        placeholder="Username"
                        value={username}
                        onChange={(e) =>
                          setUsername(e.target.value)
                        }
                        autoComplete="username"
                        disabled={loading}
                        required
                      />

                    </div>

                  </div>


                  {/* =================================================
                      PASSWORD
                  ================================================= */}

                  <div className="mb-4">

                    <label
                      htmlFor="password"
                      className="form-label fw-semibold"
                    >
                      รหัสผ่าน
                    </label>

                    <div className="input-group">

                      <span className="input-group-text bg-white">
                        <i className="bi bi-lock"></i>
                      </span>

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        className="form-control"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        autoComplete="current-password"
                        disabled={loading}
                        required
                      />

                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setShowPassword(
                            (value) => !value
                          )
                        }
                        disabled={loading}
                        aria-label={
                          showPassword
                            ? "ซ่อนรหัสผ่าน"
                            : "แสดงรหัสผ่าน"
                        }
                      >
                        <i
                          className={
                            showPassword
                              ? "bi bi-eye-slash"
                              : "bi bi-eye"
                          }
                        ></i>
                      </button>

                    </div>

                  </div>


                  {/* =================================================
                      LOGIN BUTTON
                  ================================================= */}

                  <button
                    type="submit"
                    className="btn text-white w-100 rounded-pill py-2 fw-semibold"
                    style={{
                      background: "#6f42c1",
                      border: "none",
                    }}
                    disabled={loading}
                  >

                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>

                        กำลังเข้าสู่ระบบ...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>

                        เข้าสู่ระบบ
                      </>
                    )}

                  </button>

                </form>


                {/* =================================================
                    REGISTER
                ================================================= */}

                <div className="mt-3">

                  <Link
                    href="/register"
                    className="btn text-white w-100 rounded-pill py-2 fw-semibold"
                    style={{
                      background: "#6f42c1",
                      border: "none",
                      textDecoration: "none",
                    }}
                  >
                    <i className="bi bi-person-plus me-2"></i>

                    สมัครสมาชิก
                  </Link>

                </div>


                {/* =================================================
                    BACK HOME
                ================================================= */}

                <div className="text-center mt-4">

                  <Link
                    href="/"
                    className="text-decoration-none text-secondary"
                  >
                    <i className="bi bi-arrow-left me-2"></i>

                    กลับหน้าหลัก
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}