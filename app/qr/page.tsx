"use client";

import { QRCodeCanvas } from "qrcode.react";

export default function QRPage() {
  // ตอนพัฒนาบนเครื่องตัวเอง
  // ถ้าจะให้มือถือในวง LAN สแกน ต้องเปลี่ยน localhost เป็น IP ของคอม
  const webUrl = "http://localhost:3000/login";

  return (
    <main className="qr-page">

      {/* =========================================
          NAVBAR
      ========================================= */}
      <nav className="qr-navbar">
        <div className="container">
          <div className="qr-navbar-inner">

            {/* Brand */}
                <i className="bi bi-box-seam"></i>
              </div>

              <div className="qr-brand-text">
                <div className="qr-brand-title">
                  ระบบยืม–คืนครุภัณฑ์
                </div>

                <div className="qr-brand-subtitle">
                  คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
                </div>
              </div>

            {/* Login */}
            <a href="/login" className="qr-login-btn">
              <i className="bi bi-box-arrow-in-right"></i>
              <span>เข้าสู่ระบบ</span>
            </a>

          </div>
      </nav>


      {/* =========================================
          MAIN
      ========================================= */}
      <section className="qr-main">

        {/* Background Decorations */}
        <div className="qr-decoration qr-decoration-left"></div>
        <div className="qr-decoration qr-decoration-right"></div>

        <div className="container qr-container">

          {/* =====================================
              QR CARD
          ===================================== */}
          <div className="qr-card">

            {/* QR Icon */}
            <div className="qr-main-icon">
              <i className="bi bi-qr-code-scan"></i>
            </div>


            {/* Heading */}
            <div className="qr-card-header">

              <h1>
                เข้าสู่ระบบผ่าน{" "}
                <span>QR Code</span>
              </h1>

              <p>
                สแกน QR Code ด้วยโทรศัพท์มือถือ
                เพื่อเข้าสู่ระบบยืม–คืนครุภัณฑ์
              </p>

            </div>


            {/* =================================
                QR CODE
            ================================= */}
            <div className="qr-code-wrapper">

              <div className="qr-code-box">

                <QRCodeCanvas
                  value={webUrl}
                  size={230}
                  level="H"
                  includeMargin={true}
                />

              </div>

            </div>


            {/* =================================
                STEPS
            ================================= */}
            <div className="qr-steps">

              {/* Step 1 */}
              <div className="qr-step">

                <div className="qr-step-number">
                  1
                </div>

                <div className="qr-step-icon">
                  <i className="bi bi-phone"></i>
                </div>

                <div className="qr-step-content">

                  <div className="qr-step-title">
                    เปิดกล้องโทรศัพท์
                  </div>

                  <div className="qr-step-text">
                    เปิดกล้องหรือแอปสำหรับ
                    สแกน QR Code
                  </div>

                </div>

              </div>


              {/* Arrow */}
              <div className="qr-step-arrow">
                <i className="bi bi-chevron-right"></i>
              </div>


              {/* Step 2 */}
              <div className="qr-step">

                <div className="qr-step-number">
                  2
                </div>

                <div className="qr-step-icon">
                  <i className="bi bi-qr-code-scan"></i>
                </div>

                <div className="qr-step-content">

                  <div className="qr-step-title">
                    สแกน QR Code
                  </div>

                  <div className="qr-step-text">
                    หันกล้องไปที่ QR Code
                    ด้านบน
                  </div>

                </div>

              </div>


              {/* Arrow */}
              <div className="qr-step-arrow">
                <i className="bi bi-chevron-right"></i>
              </div>


              {/* Step 3 */}
              <div className="qr-step">

                <div className="qr-step-number">
                  3
                </div>

                <div className="qr-step-icon">
                  <i className="bi bi-box-arrow-in-right"></i>
                </div>

                <div className="qr-step-content">

                  <div className="qr-step-title">
                    เข้าสู่ระบบ
                  </div>

                  <div className="qr-step-text">
                    แตะลิงก์ที่ปรากฏเพื่อ
                    เข้าสู่เว็บแอป
                  </div>

                </div>

              </div>

            </div>


            {/* =================================
                URL BOX
            ================================= */}
            <div className="qr-url-box">

              <div className="qr-url-icon">
                <i className="bi bi-link-45deg"></i>
              </div>

              <div className="qr-url-content">

                <div className="qr-url-label">
                  URL ของระบบ
                </div>

                <div className="qr-url-text">
                  {webUrl}
                </div>

              </div>

              <button
                type="button"
                className="qr-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(webUrl);
                }}
                title="คัดลอก URL"
              >
                <i className="bi bi-copy"></i>
              </button>

            </div>


            {/* =================================
                DIRECT LOGIN
            ================================= */}
            <a
              href="/login"
              className="qr-direct-login"
            >
              <i className="bi bi-box-arrow-in-right"></i>
              <span>เข้าสู่ระบบโดยตรง</span>
            </a>

          </div>


          {/* =====================================
              FOOTER TEXT
          ===================================== */}
          <div className="qr-bottom-text">

            <i className="bi bi-shield-check"></i>

            <span>
              ระบบจัดการการยืม–คืนครุภัณฑ์
              คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
            </span>

          </div>

        </div>

      </section>


      {/* =========================================
          FOOTER
      ========================================= */}
      <footer className="qr-footer">

        <div className="container text-center">

          © 2026 ระบบยืม–คืนครุภัณฑ์
          คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่

        </div>

      </footer>

    </main>
  );
}