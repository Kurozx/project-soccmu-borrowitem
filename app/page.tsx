"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "next-auth/react";
import type { Session } from "next-auth";

import { Panel, StatCard, type Tone } from "@/app/components/ui";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// =====================================================
// TYPES
// =====================================================

type HomeStats = {
  totalEquipment: number;
  borrowed: number;
  available: number;
  totalBorrowings: number;
};

// =====================================================
// HOME
// =====================================================

export default function Home() {
  const [currentUser, setCurrentUser] = useState<Session["user"] | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let requestId = 0;

    const loadUser = async () => {
      const id = ++requestId;
      try {
        const session = await getSession();
        let user = session?.user ?? null;

        if (user) {
          // Read the latest name after profile edits; retain the session if unavailable.
          try {
            const response = await fetch("/api/profile", { cache: "no-store" });
            if (response.status === 401) {
              user = null;
            } else if (response.ok) {
              const result = await response.json();
              if (result.success && result.data?.username) {
                user = { ...user, name: result.data.username };
              }
            }
          } catch {
            // The authenticated session still supplies the account name.
          }
        }

        if (!cancelled && id === requestId) setCurrentUser(user);
      } catch (error) {
        console.error("LOAD HOME SESSION ERROR:", error);
      } finally {
        if (!cancelled && id === requestId) setAuthLoading(false);
      }
    };

    void loadUser();
    window.addEventListener("focus", loadUser);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", loadUser);
    };
  }, []);

  const dashboardHref = currentUser?.role === "admin" ? "/admin/dashboard" : "/dashboard";
  const equipmentHref = currentUser ? "/equipment" : "/login";
  // =====================================================
  // STATE
  // =====================================================

  const [stats, setStats] = useState<HomeStats>({
    totalEquipment: 0,
    borrowed: 0,
    available: 0,
    totalBorrowings: 0,
  });

  const [statsLoading, setStatsLoading] =
    useState(true);

  // =====================================================
  // LOAD BOOTSTRAP JS
  // =====================================================

  useEffect(() => {
    import(
      "bootstrap/dist/js/bootstrap.bundle.min.js"
    );
  }, []);

  // =====================================================
  // LOAD HOME STATISTICS
  // =====================================================

  useEffect(() => {
    const loadHomeStats = async () => {
      try {
        setStatsLoading(true);

        const response = await fetch(
          "/api/home-stats",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const contentType =
          response.headers.get("content-type");

        if (
          !contentType?.includes(
            "application/json"
          )
        ) {
          throw new Error(
            "API ไม่ได้ส่งข้อมูล JSON กลับมา"
          );
        }

        const result = await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "ไม่สามารถโหลดสถิติได้"
          );
        }

        setStats({
          totalEquipment: Number(
            result.data?.totalEquipment || 0
          ),

          borrowed: Number(
            result.data?.borrowed || 0
          ),

          available: Number(
            result.data?.available || 0
          ),

          totalBorrowings: Number(
            result.data?.totalBorrowings || 0
          ),
        });
      } catch (error) {
        console.error(
          "LOAD HOME STATS ERROR:",
          error
        );

        // หาก API มีปัญหา ให้เป็น 0
        setStats({
          totalEquipment: 0,
          borrowed: 0,
          available: 0,
          totalBorrowings: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    loadHomeStats();
  }, []);

  // =====================================================
  // NUMBER FORMAT
  // =====================================================

  const formatNumber = (value: number) => {
    return value.toLocaleString("th-TH");
  };

  // =====================================================
  // RENDER
  // =====================================================

  const statValue = (value: number) =>
    statsLoading ? "..." : formatNumber(value);

  return (
    <main className="home-page">
      {/* ================= TOP BAR ================= */}

      <header className="home-topbar">
        <div className="home-container home-topbar-inner">
          <Link href="/" className="home-brand">
            <span className="home-logo">CMU</span>
            <span className="home-brand-text">
              <span className="home-brand-name">
                ระบบยืม–คืนครุภัณฑ์
              </span>
              <span className="home-brand-sub">
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
              </span>
            </span>
          </Link>

          <nav className="home-nav">
            <Link href="/" className="home-nav-link active">
              หน้าหลัก
            </Link>

            <Link href={equipmentHref} className="home-nav-link">
              ครุภัณฑ์
            </Link>

            <span className="home-nav-sep" aria-hidden="true" />

            {authLoading ? (
              <span className="home-account-loading" role="status">กำลังตรวจสอบบัญชี…</span>
            ) : currentUser ? (
              <>
                <Link href="/profile" className="home-account" title={currentUser.name || "ผู้ใช้งาน"}>
                  <i className="bi bi-person-circle" aria-hidden="true" />
                  <span className="home-account-name">{currentUser.name || "ผู้ใช้งาน"}</span>
                </Link>
                <Link href={dashboardHref} className="btn btn-primary home-btn">
                  <i className="bi bi-grid me-2" aria-hidden="true" />
                  ไป Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn btn-outline-secondary home-btn d-none d-sm-inline-flex"
                >
                  สมัครสมาชิก
                </Link>

                <Link href="/login" className="btn btn-primary home-btn">
                  เข้าสู่ระบบ
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="home-hero">
        <div className="home-container">
          <div className="home-hero-text">
            <p className="ui-eyebrow">
              คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
            </p>

            <h1 className="home-hero-title">
              ระบบยืม–คืนครุภัณฑ์ออนไลน์
            </h1>

            <p className="home-hero-desc">
              ระบบจัดการการยืมและคืนครุภัณฑ์
              ช่วยให้ตรวจสอบข้อมูลครุภัณฑ์
              และดำเนินการยืม–คืนได้อย่างสะดวก
            </p>
          </div>

          {/* ================= STATISTICS ================= */}

          <div className="row g-3 home-stats">
            <div className="col-6 col-lg-3">
              <StatCard
                label="ครุภัณฑ์ทั้งหมด"
                value={statValue(stats.totalEquipment)}
                icon="bi-box-seam"
                tone="purple"
                hint="รายการในระบบ"
              />
            </div>

            <div className="col-6 col-lg-3">
              <StatCard
                label="กำลังถูกยืม"
                value={statValue(stats.borrowed)}
                icon="bi-arrow-left-right"
                tone="amber"
                hint="ยังไม่ได้คืน"
              />
            </div>

            <div className="col-6 col-lg-3">
              <StatCard
                label="พร้อมใช้งาน"
                value={statValue(stats.available)}
                icon="bi-check-circle"
                tone="emerald"
                hint="ยืมได้ทันที"
              />
            </div>

            <div className="col-6 col-lg-3">
              <StatCard
                label="รายการยืมทั้งหมด"
                value={statValue(stats.totalBorrowings)}
                icon="bi-arrow-repeat"
                tone="blue"
                hint="สะสมตั้งแต่เปิดระบบ"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW TO ================= */}

      <section className="home-section">
        <div className="home-container">
          <div className="home-section-head">
            <p className="ui-eyebrow">ขั้นตอนการใช้งาน</p>
            <h2 className="home-section-title">วิธีใช้งาน</h2>
            <p className="home-section-desc">
              จัดการข้อมูลครุภัณฑ์
              และรายการยืม–คืนผ่านระบบออนไลน์
            </p>
          </div>

          <div className="row g-3">
            <Feature
              step="01"
              icon="bi-search"
              tone="purple"
              title="ตรวจสอบครุภัณฑ์"
              description="ตรวจสอบข้อมูลและสถานะครุภัณฑ์"
            />

            <Feature
              step="02"
              icon="bi-arrow-left-right"
              tone="amber"
              title="จัดการการยืม–คืน"
              description="ดำเนินการยืมและคืนครุภัณฑ์ผ่านระบบ"
            />

            <Feature
              step="03"
              icon="bi-clock-history"
              tone="emerald"
              title="ตรวจสอบประวัติ"
              description="ตรวจสอบรายการยืม–คืนย้อนหลัง"
            />
          </div>

          {/* STEPS */}

          <div className="home-steps-wrap">
            <Panel
              title="ยืมครุภัณฑ์ง่าย ๆ เพียง 3 ขั้นตอน"
              flush
            >
              <ol className="home-steps">
                <Step
                  number="1"
                  title="เข้าสู่ระบบ"
                  description="เข้าสู่ระบบด้วยบัญชีผู้ใช้งานผ่านสมาร์ตโฟนหรือคอมพิวเตอร์"
                />

                <Step
                  number="2"
                  title="สแกน QR Code"
                  description="สแกน QR Code ที่ติดบนครุภัณฑ์ ระบบจะตรวจสอบให้ว่าเป็นการยืมหรือการคืน"
                />

                <Step
                  number="3"
                  title="ยืนยันการยืม–คืน"
                  description="กดยืนยัน สถานะครุภัณฑ์จะอัปเดตในระบบทันที"
                />
              </ol>
            </Panel>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-grid">
            <div>
              <div className="home-footer-title">
                ระบบยืม–คืนครุภัณฑ์
              </div>
              <p className="home-footer-text">
                ระบบจัดการครุภัณฑ์สำหรับการยืมและคืน
                เพื่อเพิ่มความสะดวกและประสิทธิภาพในการบริหารจัดการ
              </p>
            </div>

            <div>
              <div className="home-footer-title">เมนู</div>
              <div className="home-footer-links">
                <Link href="/">หน้าหลัก</Link>
                <Link href={equipmentHref}>ครุภัณฑ์</Link>
              </div>
            </div>

            <div>
              <div className="home-footer-title">ติดต่อ</div>
              <p className="home-footer-text">
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
                <br />
                Social Sciences Faculty
              </p>
            </div>
          </div>

          <div className="home-footer-copy">
            © 2026 Faculty of Social Sciences, Chiang Mai University
          </div>
        </div>
      </footer>

      <style jsx global>{HOME_STYLES}</style>
    </main>
  );
}

// =====================================================
// FEATURE CARD
// =====================================================

function Feature({
  step,
  icon,
  tone,
  title,
  description,
}: {
  step: string;
  icon: string;
  tone: Tone;
  title: string;
  description: string;
}) {
  return (
    <div className="col-md-4">
      <Panel className="home-feature">
        <p className="home-feature-step">ขั้นตอน {step}</p>

        <div className={`home-feature-icon tone-${tone}`}>
          <i className={`bi ${icon}`}></i>
        </div>

        <p className="home-feature-title">{title}</p>

        <p className="home-feature-desc">{description}</p>
      </Panel>
    </div>
  );
}

// =====================================================
// STEP ROW
// =====================================================

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <li className="home-step">
      <span className="home-step-num">{number}</span>

      <div>
        <div className="home-step-title">{title}</div>
        <div className="home-step-desc">{description}</div>
      </div>
    </li>
  );
}

// =====================================================
// STYLES
// =====================================================

const HOME_STYLES = `
  .home-page {
    min-height: 100vh;
    background: #fafafa;
    color: #171717;
  }

  .home-container {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 16px;
  }

  @media (min-width: 768px) {
    .home-container {
      padding: 0 24px;
    }
  }

  /* Top bar */

  .home-topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    height: 64px;
    border-bottom: 1px solid #e4e4e4;
    background: #ffffff;
  }

  .home-topbar-inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .home-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    color: inherit;
    text-decoration: none;
  }

  .home-logo {
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

  .home-brand-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.35;
  }

  .home-brand-name {
    font-size: 14px;
    font-weight: 600;
    color: #171717;
    white-space: nowrap;
  }

  .home-brand-sub {
    font-size: 11px;
    color: #737373;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .home-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .home-nav-link {
    display: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 14px;
    color: #737373;
    text-decoration: none;
  }

  .home-account {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: #6f42c1;
    text-decoration: none;
    font-size: 14px;
  }

  .home-account-name {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .home-account-loading {
    color: #737373;
    font-size: 13px;
  }

  @media (max-width: 575.98px) {
    .home-topbar {
      height: auto;
      min-height: 64px;
    }

    .home-topbar-inner {
      flex-wrap: wrap;
      padding-top: 12px;
      padding-bottom: 12px;
      gap: 12px;
    }

    .home-nav {
      width: 100%;
      justify-content: flex-end;
    }

    .home-account {
      margin-right: auto;
    }

    .home-account-name {
      max-width: 120px;
    }
  }

  .home-nav-link:hover,
  .home-nav-link.active {
    color: #171717;
  }

  .home-nav-sep {
    display: none;
    width: 1px;
    height: 20px;
    margin: 0 4px;
    background: #e4e4e4;
  }

  @media (min-width: 768px) {
    .home-nav-link {
      display: inline-block;
    }

    .home-nav-sep {
      display: inline-block;
    }
  }

  .home-btn.btn {
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 14px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
  }

  .home-btn.btn-outline-secondary {
    border-color: #e4e4e4;
    background: #ffffff;
    color: #171717;
  }

  .home-btn.btn-outline-secondary:hover {
    border-color: #d4d4d4;
    background: #f5f5f5;
    color: #171717;
  }

  /* Hero */

  .home-hero {
    padding: 64px 0 48px;
    border-bottom: 1px solid #e4e4e4;
    background: #ffffff;
  }

  @media (min-width: 768px) {
    .home-hero {
      padding: 88px 0 56px;
    }
  }

  .home-hero-text {
    max-width: 720px;
  }

  .home-hero-title {
    margin: 12px 0 12px;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.02em;
    color: #171717;
  }

  @media (min-width: 768px) {
    .home-hero-title {
      font-size: 40px;
    }
  }

  .home-hero-desc {
    max-width: 560px;
    margin: 0;
    font-size: 15px;
    line-height: 1.7;
    color: #737373;
  }

  .home-stats {
    margin-top: 48px;
  }

  /* Sections */

  .home-section {
    padding: 56px 0 64px;
  }

  .home-section-head {
    max-width: 640px;
    margin-bottom: 24px;
  }

  .home-section-title {
    margin: 6px 0 4px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #171717;
  }

  .home-section-desc {
    margin: 0;
    font-size: 14px;
    color: #737373;
  }

  .home-feature {
    height: 100%;
  }

  .home-feature-step {
    margin: 0 0 16px;
    font-size: 12px;
    font-weight: 500;
    color: #737373;
  }

  .home-feature-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 18px;
  }

  .home-feature-title {
    margin: 16px 0 4px;
    font-size: 15px;
    font-weight: 600;
    color: #171717;
  }

  .home-feature-desc {
    margin: 0;
    font-size: 14px;
    color: #737373;
  }

  .home-steps-wrap {
    margin-top: 16px;
  }

  .home-steps {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .home-step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  .home-step:last-child {
    border-bottom: none;
  }

  .home-step-num {
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

  .home-step-title {
    font-size: 14px;
    font-weight: 600;
    color: #171717;
  }

  .home-step-desc {
    margin-top: 2px;
    font-size: 13px;
    color: #737373;
  }

  /* Footer */

  .home-footer {
    padding: 40px 0 28px;
    border-top: 1px solid #e4e4e4;
    background: #ffffff;
  }

  .home-footer-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
 }

  @media (min-width: 768px) {
    .home-footer-grid {
      grid-template-columns: 2fr 1fr 1fr;
    }
  }

  .home-footer-title {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #171717;
  }

  .home-footer-text {
    max-width: 420px;
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    color: #737373;
  }

  .home-footer-links {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
  }

  .home-footer-links a {
    color: #737373;
    text-decoration: none;
  }

  .home-footer-links a:hover {
    color: #171717;
  }

  .home-footer-copy {
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
    font-size: 12px;
    color: #a3a3a3;
  }
`;
