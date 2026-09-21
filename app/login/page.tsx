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
        router.replace("/scan");
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
    <main className="auth-page">
      <div className="auth-wrap">
        {/* BRAND */}
        <Link href="/" className="auth-brand">
          <span className="auth-logo">CMU</span>
          <span className="auth-brand-text">
            <span className="auth-brand-name">
              ระบบยืม – คืนครุภัณฑ์
            </span>
            <span className="auth-brand-sub">
              คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
            </span>
          </span>
        </Link>

        {/* LOGIN CARD */}
        <div className="auth-card">
          <div className="auth-head">
            <p className="ui-eyebrow">ยินดีต้อนรับ</p>
            <h1 className="auth-title">เข้าสู่ระบบ</h1>
            <p className="auth-desc">เข้าสู่ระบบเพื่อใช้งานระบบ</p>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="auth-alert auth-alert-danger" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="username" className="auth-label">
                ชื่อผู้ใช้
              </label>

              <input
                id="username"
                type="text"
                className="form-control auth-input"
                placeholder="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="auth-label">
                รหัสผ่าน
              </label>

              <div className="auth-password">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={
                    showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                  }
                >
                  <i
                    className={
                      showPassword ? "bi bi-eye-slash" : "bi bi-eye"
                    }
                  ></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 auth-submit"
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
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>

          {/* REGISTER */}
          <div className="auth-divider">
            <span>ยังไม่มีบัญชี?</span>
          </div>

          <Link
            href="/register"
            className="btn btn-outline-secondary w-100 auth-submit"
          >
            สมัครสมาชิก
          </Link>
        </div>

        {/* BACK HOME */}
        <div className="auth-foot">
          <Link href="/" className="auth-link-muted">
            <i className="bi bi-arrow-left me-1"></i>
            กลับหน้าหลัก
          </Link>
        </div>
      </div>

      <style jsx global>{AUTH_STYLES}</style>
    </main>
  );
}

const AUTH_STYLES = `
  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    background: #fafafa;
    color: #171717;
  }

  .auth-wrap {
    width: 100%;
    max-width: 420px;
  }

  .auth-wrap.wide {
    max-width: 520px;
  }

  .auth-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    color: inherit;
    text-decoration: none;
  }

  .auth-logo {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #6f42c1;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .auth-brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.35;
  }

  .auth-brand-name {
    font-size: 14px;
    font-weight: 600;
    color: #171717;
  }

  .auth-brand-sub {
    font-size: 11px;
    color: #737373;
  }

  .auth-card {
    padding: 32px;
    border: 1px solid #e4e4e4;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  @media (max-width: 575.98px) {
    .auth-card {
      padding: 24px 20px;
    }
  }

  .auth-head {
    margin-bottom: 24px;
  }

  .auth-title {
    margin: 6px 0 4px;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #171717;
  }

  .auth-desc {
    margin: 0;
    font-size: 14px;
    color: #737373;
  }

  .auth-label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #404040;
  }

  .auth-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #737373;
  }

  .auth-input.form-control {
    height: 40px;
    padding: 8px 12px;
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    font-size: 14px;
    box-shadow: none;
  }

  .auth-input.form-control:focus {
    border-color: #6f42c1;
    box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.12);
  }

  .auth-input.form-control::placeholder {
    color: #a3a3a3;
  }

  .auth-password {
    position: relative;
  }

  .auth-password .auth-input.form-control {
    padding-right: 40px;
  }

  .auth-eye {
    position: absolute;
    top: 0;
    right: 0;
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: #737373;
  }

  .auth-eye:hover {
    color: #171717;
  }

  .auth-submit.btn {
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
  }

  .auth-submit.btn-outline-secondary {
    border-color: #e4e4e4;
    background: #ffffff;
    color: #171717;
  }

  .auth-submit.btn-outline-secondary:hover {
    border-color: #d4d4d4;
    background: #f5f5f5;
    color: #171717;
  }

  .auth-alert {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 20px;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
  }

  .auth-alert-danger {
    border: 1px solid #fecdd3;
    background: #fff1f2;
    color: #be123c;
  }

  .auth-alert-success {
    border: 1px solid #a7f3d0;
    background: #ecfdf5;
    color: #047857;
  }

  .auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0 12px;
    font-size: 12px;
    color: #737373;
  }

  .auth-divider::before,
  .auth-divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #e4e4e4;
  }

  .auth-foot {
    margin-top: 20px;
    text-align: center;
    font-size: 13px;
    color: #737373;
  }

  .auth-link-muted {
    color: #737373;
    text-decoration: none;
  }

  .auth-link-muted:hover {
    color: #171717;
  }

  .auth-link {
    color: #6f42c1;
    font-weight: 600;
    text-decoration: none;
  }

  .auth-link:hover {
    text-decoration: underline;
  }
`;
