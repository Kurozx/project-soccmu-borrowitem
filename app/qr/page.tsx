"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

import "bootstrap-icons/font/bootstrap-icons.css";

export default function QRPage() {
  // ใช้ที่อยู่เว็บที่เปิดอยู่จริง (เช่น เปิดผ่าน IP ในวง LAN มือถือก็สแกนเข้าได้)
  // หรือกำหนดเองด้วย NEXT_PUBLIC_SITE_URL เมื่อขึ้นเซิร์ฟเวอร์จริง
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );

  const webUrl = `${process.env.NEXT_PUBLIC_SITE_URL || origin}/login`;

  return (
    <main className="qr-page">
      {/* =========================================
          TOP BAR
      ========================================= */}
      <header className="qr-topbar">
        <div className="qr-container qr-topbar-inner">
          {/* Brand */}
          <Link href="/" className="qr-brand">
            <span className="qr-logo">CMU</span>

            <span className="qr-brand-text">
              <span className="qr-brand-title">
                ระบบยืม–คืนครุภัณฑ์
              </span>

              <span className="qr-brand-subtitle">
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
              </span>
            </span>
          </Link>

          {/* Login */}
          <Link href="/login" className="qr-btn qr-btn-primary">
            เข้าสู่ระบบ
          </Link>
        </div>
      </header>

      {/* =========================================
          MAIN
      ========================================= */}
      <section className="qr-main">
        <div className="qr-container qr-narrow">
          {/* =====================================
              QR CARD
          ===================================== */}
          <div className="qr-card">
            {/* Heading */}
            <div className="qr-card-header">
              <p className="ui-eyebrow">สแกนคิวอาร์โค้ด</p>

              <h1>เข้าสู่ระบบผ่าน QR Code</h1>

              <p>
                สแกน QR Code ด้วยโทรศัพท์มือถือ
                เพื่อเข้าสู่ระบบยืม–คืนครุภัณฑ์
              </p>
            </div>

            {/* =================================
                QR CODE
            ================================= */}
            <div className="qr-code-box">
              <QRCodeCanvas
                value={webUrl}
                size={220}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* =================================
                URL BOX
            ================================= */}
            <div className="qr-url-box">
              <div className="qr-url-content">
                <div className="qr-url-label">URL ของระบบ</div>

                <div className="qr-url-text">{webUrl}</div>
              </div>

              <button
                type="button"
                className="qr-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(webUrl);
                }}
                title="คัดลอกลิงก์"
                aria-label="คัดลอกลิงก์"
              >
                <i className="bi bi-copy"></i>
              </button>
            </div>

            {/* =================================
                STEPS
            ================================= */}
            <ol className="qr-steps">
              <li className="qr-step">
                <span className="qr-step-number">1</span>

                <div className="qr-step-content">
                  <div className="qr-step-title">
                    เปิดกล้องโทรศัพท์
                  </div>

                  <div className="qr-step-text">
                    เปิดกล้องหรือแอปสำหรับ สแกน QR Code
                  </div>
                </div>
              </li>

              <li className="qr-step">
                <span className="qr-step-number">2</span>

                <div className="qr-step-content">
                  <div className="qr-step-title">สแกน QR Code</div>

                  <div className="qr-step-text">
                    หันกล้องไปที่ QR Code ด้านบน
                  </div>
                </div>
              </li>

              <li className="qr-step">
                <span className="qr-step-number">3</span>

                <div className="qr-step-content">
                  <div className="qr-step-title">เข้าสู่ระบบ</div>

                  <div className="qr-step-text">
                    แตะลิงก์ที่ปรากฏเพื่อ เข้าสู่เว็บแอป
                  </div>
                </div>
              </li>
            </ol>

            {/* =================================
                DIRECT LOGIN
            ================================= */}
            <Link href="/login" className="qr-btn qr-btn-primary qr-btn-block">
              เข้าสู่ระบบโดยตรง
            </Link>
          </div>

          {/* =====================================
              FOOTER TEXT
          ===================================== */}
          <p className="qr-bottom-text">
            ระบบจัดการการยืม–คืนครุภัณฑ์
            คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
          </p>
        </div>
      </section>

      {/* =========================================
          FOOTER
      ========================================= */}
      <footer className="qr-footer">
        <div className="qr-container">
          © 2026 ระบบยืม–คืนครุภัณฑ์
          คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
        </div>
      </footer>

      <style jsx global>{QR_STYLES}</style>
    </main>
  );
}

const QR_STYLES = `
  .qr-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fafafa;
    color: #171717;
  }

  .qr-container {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 16px;
  }

  .qr-narrow {
    max-width: 480px;
  }

  /* Top bar */

  .qr-topbar {
    height: 64px;
    border-bottom: 1px solid #e4e4e4;
    background: #ffffff;
  }

  .qr-topbar-inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .qr-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    color: inherit;
    text-decoration: none;
  }

  .qr-logo {
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

  .qr-brand-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.35;
  }

  .qr-brand-title {
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
  }

  .qr-brand-subtitle {
    font-size: 11px;
    color: #737373;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .qr-btn {
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0 14px;
    border: 1px solid transparent;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.15s ease;
  }

  .qr-btn-primary {
    background: #6f42c1;
    border-color: #6f42c1;
    color: #ffffff;
  }

  .qr-btn-primary:hover {
    background: #5f35ad;
    border-color: #5f35ad;
    color: #ffffff;
  }

  .qr-btn-block {
    width: 100%;
    height: 40px;
    margin-top: 24px;
    font-weight: 600;
  }

  /* Main */

  .qr-main {
    flex: 1;
    padding: 48px 0;
  }

  .qr-card {
    padding: 32px;
    border: 1px solid #e4e4e4;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  @media (max-width: 575.98px) {
    .qr-card {
      padding: 24px 20px;
    }
  }

  .qr-card-header h1 {
    margin: 6px 0 4px;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #171717;
  }

  .qr-card-header p:last-child {
    margin: 0;
    font-size: 14px;
    color: #737373;
  }

  .qr-code-box {
    display: flex;
    justify-content: center;
    margin: 24px 0 16px;
    padding: 16px;
    border: 1px solid #e4e4e4;
    border-radius: 12px;
    background: #ffffff;
  }

  .qr-code-box canvas {
    max-width: 100%;
    height: auto !important;
  }

  .qr-url-box {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    background: #fafafa;
  }

  .qr-url-content {
    flex: 1;
    min-width: 0;
  }

  .qr-url-label {
    font-size: 12px;
    color: #737373;
  }

  .qr-url-text {
    overflow: hidden;
    font-family: var(--font-geist-mono), monospace;
    font-size: 13px;
    color: #171717;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .qr-copy-btn {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    background: #ffffff;
    color: #404040;
  }

  .qr-copy-btn:hover {
    background: #f5f5f5;
    color: #171717;
  }

  /* Steps */

  .qr-steps {
    margin: 24px 0 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid #f0f0f0;
  }

  .qr-step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .qr-step-number {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e4e4e4;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #6f42c1;
  }

  .qr-step-title {
    font-size: 14px;
    font-weight: 600;
    color: #171717;
  }

  .qr-step-text {
    margin-top: 2px;
    font-size: 13px;
    color: #737373;
  }

  .qr-bottom-text {
    margin: 20px 0 0;
    text-align: center;
    font-size: 12px;
    color: #737373;
  }

  /* Footer */

  .qr-footer {
    padding: 20px 0;
    border-top: 1px solid #e4e4e4;
    background: #ffffff;
    text-align: center;
    font-size: 12px;
    color: #a3a3a3;
  }
`;
