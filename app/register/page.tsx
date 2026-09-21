"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

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
                REGISTER CARD
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
                    <i className="bi bi-person-plus fs-2"></i>
                  </div>

                  <h3 className="fw-bold mb-2">
                    สมัครสมาชิก
                  </h3>


                </div>


                {/* =================================================
                    ERROR
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
                    SUCCESS
                ================================================= */}

                {success && (
                  <div
                    className="alert alert-success border-0 rounded-3"
                    role="alert"
                  >
                    <i className="bi bi-check-circle me-2"></i>

                    {success}
                  </div>
                )}


                {/* =================================================
                    REGISTER FORM
                ================================================= */}

                <form onSubmit={handleRegister}>

                  {/* =================================================
                      USERNAME
                  ================================================= */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      ชื่อผู้ใช้งาน
                    </label>

                    <div className="input-group">

                      <span className="input-group-text bg-white">
                        <i className="bi bi-person"></i>
                      </span>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Username"
                        value={username}
                        onChange={(e) =>
                          setUsername(e.target.value)
                        }
                        autoComplete="username"
                        minLength={3}
                        required
                      />

                    </div>


                  </div>


                  {/* =================================================
                      EMAIL
                  ================================================= */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      อีเมล
                    </label>

                    <div className="input-group">

                      <span className="input-group-text bg-white">
                        <i className="bi bi-envelope"></i>
                      </span>

                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        autoComplete="email"
                        required
                      />

                    </div>

                  </div>

                  {/* =================================================
                      PASSWORD
                  ================================================= */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      รหัสผ่าน
                    </label>

                    <div className="input-group">

                      <span className="input-group-text bg-white">
                        <i className="bi bi-lock"></i>
                      </span>

                      <input
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
                        minLength={6}
                        autoComplete="new-password"
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
                      CONFIRM PASSWORD
                  ================================================= */}

                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      ยืนยันรหัสผ่าน
                    </label>

                    <div className="input-group">

                      <span className="input-group-text bg-white">
                        <i className="bi bi-shield-lock"></i>
                      </span>

                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        className="form-control"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        autoComplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? "ซ่อนรหัสผ่าน"
                            : "แสดงรหัสผ่าน"
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


                  {/* =================================================
                      REGISTER BUTTON
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

                        กำลังสมัครสมาชิก...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>

                        สมัครสมาชิก
                      </>
                    )}

                  </button>

                </form>


                {/* =================================================
                    BACK TO LOGIN
                ================================================= */}

                <div className="text-center mt-4">

                  <span className="text-secondary">
                    มีบัญชีอยู่แล้ว?{" "}
                  </span>

                  <Link
                    href="/login"
                    className="fw-semibold text-decoration-none"
                    style={{
                      color: "#6f42c1",
                    }}
                  >
                    เข้าสู่ระบบ
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