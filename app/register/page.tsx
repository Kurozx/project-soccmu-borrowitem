"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type UserType = "student" | "teacher" | "staff";

const USER_TYPE_OPTIONS: {
  value: UserType;
  label: string;
  icon: string;
}[] = [
  { value: "student", label: "นักศึกษา", icon: "bi-mortarboard" },
  { value: "teacher", label: "อาจารย์", icon: "bi-person-video3" },
  { value: "staff", label: "เจ้าหน้าที่", icon: "bi-briefcase" },
];

export default function RegisterPage() {
  const router = useRouter();

  /* =====================================================
     FORM STATE
  ===================================================== */

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<UserType | "">("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  /* =====================================================
     REGISTER
  ===================================================== */

  const handleRegister = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    /* =================================================
       NORMALIZE DATA
    ================================================= */

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    /* =================================================
       VALIDATE REQUIRED FIELDS
    ================================================= */

    if (
      !normalizedUsername ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    /* =================================================
       VALIDATE USER TYPE
    ================================================= */

    if (!userType) {
      setError("กรุณาเลือกประเภทผู้ใช้");
      return;
    }

    /* =================================================
       VALIDATE USERNAME
    ================================================= */

    if (normalizedUsername.length < 3) {
      setError("ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร");
      return;
    }

    /* =================================================
       VALIDATE EMAIL
    ================================================= */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }

    /* =================================================
       VALIDATE PASSWORD
    ================================================= */

    if (password.length < 8) {
      setError(
        "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร"
      );
      return;
    }

    /* =================================================
       VALIDATE CONFIRM PASSWORD
    ================================================= */

    if (password !== confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      /* =================================================
         SEND DATA TO API
      ================================================= */

const response = await fetch("/api/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password,
    userType,
  }),
});


      /* =================================================
         READ API RESPONSE
      ================================================= */

      const data = await response.json();

      /* =================================================
         REGISTER FAILED
      ================================================= */

        if (!response.ok) {
        throw new Error(data.message || "สมัครสมาชิกไม่สำเร็จ");
        }
      /* =================================================
         REGISTER SUCCESS
      ================================================= */

      setSuccess(
        "สมัครสมาชิกสำเร็จ กำลังไปหน้าเข้าสู่ระบบ..."
      );

      /* =================================================
         CLEAR FORM
      ================================================= */

      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setUserType("");

      /* =================================================
         REDIRECT TO LOGIN
      ================================================= */

      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (err) {
      console.error("Register error:", err);

      setError(
        "เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-wrap wide">
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

        {/* REGISTER CARD */}
        <div className="auth-card">
          <div className="auth-head">
            <p className="ui-eyebrow">สร้างบัญชีใหม่</p>
            <h1 className="auth-title">สมัครสมาชิก</h1>
            <p className="auth-desc">
              กรอกข้อมูลด้านล่างเพื่อสร้างบัญชีผู้ใช้งาน
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="auth-alert auth-alert-danger" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="auth-alert auth-alert-success" role="alert">
              <i className="bi bi-check-circle"></i>
              <span>{success}</span>
            </div>
          )}

          {/* REGISTER FORM */}
          <form onSubmit={handleRegister}>
            <div className="row g-3 mb-4">
              {/* USER TYPE */}
              <div className="col-12">
                <span id="reg-usertype-label" className="auth-label">
                  ประเภทผู้ใช้
                </span>

                <div
                  className="auth-segment"
                  role="radiogroup"
                  aria-labelledby="reg-usertype-label"
                >
                  {USER_TYPE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={
                        userType === option.value
                          ? "auth-segment-item active"
                          : "auth-segment-item"
                      }
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={option.value}
                        checked={userType === option.value}
                        onChange={() => setUserType(option.value)}
                        required
                      />
                      <i className={`bi ${option.icon}`}></i>
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* USERNAME */}
              <div className="col-12 col-sm-6">
                <label htmlFor="reg-username" className="auth-label">
                  ชื่อผู้ใช้งาน
                </label>

                <input
                  id="reg-username"
                  type="text"
                  className="form-control auth-input"
                  placeholder="ชื่อผู้ใช้"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  minLength={3}
                  required
                />
              </div>

              {/* EMAIL */}
              <div className="col-12 col-sm-6">
                <label htmlFor="reg-email" className="auth-label">
                  อีเมล
                </label>

                <input
                  id="reg-email"
                  type="email"
                  className="form-control auth-input"
                  placeholder="อีเมล"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="col-12">
                <label htmlFor="reg-password" className="auth-label">
                  รหัสผ่าน
                </label>

                <div className="auth-password">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    className="form-control auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPassword((value) => !value)}
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

              {/* CONFIRM PASSWORD */}
              <div className="col-12">
                <label htmlFor="reg-confirm" className="auth-label">
                  ยืนยันรหัสผ่าน
                </label>

                <div className="auth-password">
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control auth-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    aria-label={
                      showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                    }
                  >
                    <i
                      className={
                        showConfirmPassword
                          ? "bi bi-eye-slash"
                          : "bi bi-eye"
                      }
                    ></i>
                  </button>
                </div>
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
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                "สมัครสมาชิก"
              )}
            </button>
          </form>
        </div>

        {/* BACK TO LOGIN */}
        <div className="auth-foot">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="auth-link">
            เข้าสู่ระบบ
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

  .auth-segment {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    padding: 4px;
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    background: #fafafa;
  }

  .auth-segment-item {
    position: relative;
    min-width: 0;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: 0;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #525252;
    cursor: pointer;
    white-space: nowrap;
    user-select: none;
  }

  .auth-segment-item span {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .auth-segment-item input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    pointer-events: none;
  }

  .auth-segment-item:hover {
    color: #171717;
  }

  .auth-segment-item.active {
    border-color: #e4e4e4;
    background: #ffffff;
    color: #6f42c1;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  .auth-segment-item:has(input:focus-visible) {
    box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.18);
  }

  @media (max-width: 379.98px) {
    .auth-segment-item i {
      display: none;
    }
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
