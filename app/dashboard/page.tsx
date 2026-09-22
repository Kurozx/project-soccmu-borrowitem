import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import UserNavbar from "@/app/components/UserNavbar";
import { PageHeader, StatCard, Panel, Pill } from "@/app/components/ui";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type BorrowingStatus =
  | "pending"
  | "approved"
  | "borrowed"
  | "returned"
  | "rejected"
  | "overdue";

type DashboardStats = {
  total: number;
  borrowing: number;
  pending: number;
  returned: number;
};

type RecentBorrowing = {
  id: number;
  equipment_code: string;
  equipment_name: string;
  quantity: number;
  borrow_date: string | Date;
  due_date: string | Date;
  return_date: string | Date | null;
  status: BorrowingStatus;
};

export default async function UserDashboardPage() {
  const session = await auth();

  /* =========================================================
     AUTH CHECK
  ========================================================= */

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "user") {
    redirect("/admin/dashboard");
  }

  const userId = Number(session.user.id);

  if (!Number.isFinite(userId)) {
    redirect("/login");
  }

  // ข้อมูลบัญชีล่าสุดจากฐานข้อมูล (session อาจเก่าถ้าแก้โปรไฟล์ภายหลัง)
  let userName = session.user.name || "ผู้ใช้งาน";
  let userEmail = session.user.email || "-";
  let userTypeLabel = "ผู้ใช้งาน";

  try {
    const [userRows] = await db.execute(
      `SELECT username, email, user_type FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    const user = (
      userRows as {
        username: string;
        email: string;
        user_type: "student" | "teacher" | "staff" | null;
      }[]
    )[0];

    if (user) {
      userName = user.username;
      userEmail = user.email;
      userTypeLabel = user.user_type
        ? {
            student: "นักศึกษา",
            teacher: "อาจารย์",
            staff: "เจ้าหน้าที่",
          }[user.user_type]
        : "ผู้ใช้งาน (ยังไม่ระบุประเภท)";
    }
  } catch (error) {
    console.error("USER DASHBOARD PROFILE ERROR:", error);
  }

  /* =========================================================
     DEFAULT DATA
  ========================================================= */

  let stats: DashboardStats = {
    total: 0,
    borrowing: 0,
    pending: 0,
    returned: 0,
  };

  let recentBorrowings: RecentBorrowing[] = [];

  /* =========================================================
     GET DASHBOARD DATA
  ========================================================= */

  try {
    /* -------------------------------------------------------
       STATISTICS
    ------------------------------------------------------- */

    const [statsRows] = await db.execute(
      `
      SELECT
        COUNT(*) AS total,

        SUM(
          CASE
            WHEN status IN ('approved', 'borrowed', 'overdue')
            THEN 1
            ELSE 0
          END
        ) AS borrowing,

        SUM(
          CASE
            WHEN status = 'pending'
            THEN 1
            ELSE 0
          END
        ) AS pending,

        SUM(
          CASE
            WHEN status = 'returned'
            THEN 1
            ELSE 0
          END
        ) AS returned

      FROM borrowings
      WHERE user_id = ?
      `,
      [userId]
    );

    if (Array.isArray(statsRows) && statsRows.length > 0) {
      const row = statsRows[0] as {
        total: number | string | null;
        borrowing: number | string | null;
        pending: number | string | null;
        returned: number | string | null;
      };

      stats = {
        total: Number(row.total || 0),
        borrowing: Number(row.borrowing || 0),
        pending: Number(row.pending || 0),
        returned: Number(row.returned || 0),
      };
    }

    /* -------------------------------------------------------
       RECENT BORROWINGS
    ------------------------------------------------------- */

    const [recentRows] = await db.execute(
      `
      SELECT
        b.id,
        e.equipment_code,
        e.name AS equipment_name,
        b.quantity,
        b.borrow_date,
        b.due_date,
        b.return_date,
        b.status

      FROM borrowings b

      INNER JOIN equipment e
        ON b.equipment_id = e.id

      WHERE b.user_id = ?

      ORDER BY b.created_at DESC
      LIMIT 5
      `,
      [userId]
    );

    if (Array.isArray(recentRows)) {
      recentBorrowings = recentRows as RecentBorrowing[];
    }
  } catch (error) {
    console.error("USER DASHBOARD ERROR:", error);
  }

  /* =========================================================
     RENDER
  ========================================================= */


  return (
    <div
      className="min-vh-100"
      style={{
        overflowX: "hidden",
      }}
    >
      <UserNavbar />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="user-main-content">
        <div className="ui-page">

          {/* =================================================
              HEADER
          ================================================= */}

          <PageHeader
            eyebrow="ภาพรวมของฉัน"
            title="แดชบอร์ด"
            actions={
              <Link href="/" className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
                <i className="bi bi-house-door" aria-hidden="true" />
                กลับหน้าหลัก
              </Link>
            }
            description={
              <>
                ยินดีต้อนรับกลับมา,{" "}
                <span className="fw-semibold text-dark">
                  {userName}
                </span>
              </>
            }
          />

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="row g-3">
            <div className="col-6 col-xl-3">
              <StatCard
                label="รายการยืมทั้งหมด"
                value={stats.total.toLocaleString("th-TH")}
                icon="bi-box-arrow-up-right"
                tone="purple"
              />
            </div>

            <div className="col-6 col-xl-3">
              <StatCard
                label="กำลังยืม"
                value={stats.borrowing.toLocaleString("th-TH")}
                icon="bi-box-seam"
                tone="blue"
              />
            </div>

            <div className="col-6 col-xl-3">
              <StatCard
                label="รออนุมัติ"
                value={stats.pending.toLocaleString("th-TH")}
                icon="bi-hourglass-split"
                tone="amber"
              />
            </div>

            <div className="col-6 col-xl-3">
              <StatCard
                label="คืนแล้ว"
                value={stats.returned.toLocaleString("th-TH")}
                icon="bi-check-circle"
                tone="emerald"
              />
            </div>
          </div>

          {/* =================================================
              QUICK MENU + ACCOUNT
          ================================================= */}

          <div className="row g-3">

            <div className="col-12 col-xl-7">
              <Panel
                title="เมนูด่วน"
                description="ทางลัดไปยังหน้าที่ใช้บ่อย"
                className="h-100"
              >
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <QuickMenu
                      href="/equipment"
                      icon="bi-search"
                      title="ค้นหาครุภัณฑ์"
                      description="ดูครุภัณฑ์ที่สามารถยืมได้"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <QuickMenu
                      href="/borrowing"
                      icon="bi-box-arrow-up-right"
                      title="รายการยืมของฉัน"
                      description="ตรวจสอบสถานะรายการยืม"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <QuickMenu
                      href="/return"
                      icon="bi-box-arrow-in-left"
                      title="รายการคืน"
                      description="จัดการรายการที่ต้องคืน"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <QuickMenu
                      href="/history"
                      icon="bi-clock-history"
                      title="ประวัติการยืม–คืน"
                      description="ดูประวัติการใช้งานทั้งหมด"
                    />
                  </div>
                </div>
              </Panel>
            </div>

            <div className="col-12 col-xl-5">
              <Panel
                title="ข้อมูลบัญชี"
                description="ข้อมูลผู้ใช้งานที่เข้าสู่ระบบ"
                className="h-100"
              >
                <InfoRow
                  icon="bi-person"
                  label="ชื่อผู้ใช้"
                  value={userName}
                />

                <InfoRow
                  icon="bi-envelope"
                  label="อีเมล"
                  value={userEmail}
                />

                <InfoRow
                  icon="bi-shield-check"
                  label="ประเภทผู้ใช้"
                  value={userTypeLabel}
                  last
                />

                <Link
                  href="/profile"
                  className="btn btn-sm btn-outline-secondary w-100 mt-3"
                >
                  <i className="bi bi-person me-2"></i>
                  จัดการโปรไฟล์
                </Link>
              </Panel>
            </div>

          </div>

          {/* =================================================
              RECENT BORROWINGS
          ================================================= */}

          <Panel
            flush
            title="รายการล่าสุด"
            description="รายการยืม–คืนล่าสุดของคุณ"
            action={
              <Link
                href="/history"
                className="dashboard-link"
              >
                ดูทั้งหมด
                <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            }
          >
            {recentBorrowings.length === 0 ? (

              /* =================================================
                 EMPTY STATE
              ================================================= */

              <div className="text-center py-5 px-3">
                <div className="dashboard-empty-icon mx-auto mb-3">
                  <i className="bi bi-inbox"></i>
                </div>

                <p className="fw-semibold mb-1">
                  ยังไม่มีรายการยืม
                </p>

                <p className="text-secondary small mb-3">
                  คุณยังไม่มีประวัติการยืมครุภัณฑ์
                </p>

                <Link
                  href="/equipment"
                  className="btn btn-sm dashboard-primary-btn px-3"
                >
                  <i className="bi bi-search me-2"></i>
                  ค้นหาครุภัณฑ์
                </Link>
              </div>

            ) : (

              /* =================================================
                 TABLE
              ================================================= */

              <div className="table-responsive">
                <table className="ui-table dashboard-table">
                  <thead>
                    <tr>
                      <th>ครุภัณฑ์</th>
                      <th>จำนวน</th>
                      <th>วันที่ยืม</th>
                      <th>กำหนดคืน</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentBorrowings.map((item) => {
                      const isOverdue =
                        item.status !== "returned" &&
                        new Date(item.due_date).getTime() <
                          new Date().getTime();

                      return (
                        <tr key={item.id}>
                          {/* EQUIPMENT */}

                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div className="equipment-icon">
                                <i className="bi bi-box-seam"></i>
                              </div>

                              <div>
                                <div className="fw-semibold">
                                  {item.equipment_name}
                                </div>

                                <small className="text-secondary">
                                  {item.equipment_code}
                                </small>
                              </div>
                            </div>
                          </td>

                          {/* QUANTITY */}

                          <td>
                            <span className="fw-semibold">
                              {item.quantity}
                            </span>
                          </td>

                          {/* BORROW DATE */}

                          <td>
                            <span className="text-secondary">
                              {formatDate(item.borrow_date)}
                            </span>
                          </td>

                          {/* DUE DATE */}

                          <td>
                            <span
                              className={
                                isOverdue
                                  ? "text-danger fw-semibold"
                                  : "text-secondary"
                              }
                            >
                              {formatDate(item.due_date)}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td>
                            <StatusBadge
                              status={item.status}
                              overdue={isOverdue}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            )}
          </Panel>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="text-center text-secondary small py-2">
            ระบบจัดการยืม–คืนครุภัณฑ์
            <span className="mx-2">•</span>
            Faculty of Social Sciences
          </div>

        </div>
      </main>

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style>{`

        .user-main-content {
          margin-left: 270px;
          min-height: 100vh;
          transition: margin-left 0.25s ease;
        }

        .dashboard-primary-btn {
          background: #6f42c1;
          border-color: #6f42c1;
          color: #fff;
          border-radius: 8px;
          font-weight: 500;
        }

        .dashboard-primary-btn:hover {
          background: #5f35ad;
          border-color: #5f35ad;
          color: #fff;
        }

        .dashboard-link {
          font-size: 13px;
          font-weight: 500;
          color: #6f42c1;
          text-decoration: none;
          white-space: nowrap;
        }

        .dashboard-link:hover {
          color: #5f35ad;
        }

        .dashboard-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          color: #737373;
          font-size: 20px;
        }

        .equipment-icon {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3efff;
          color: #6f42c1;
        }

        .quick-menu-card {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e4e4e4;
          border-radius: 10px;
          padding: 12px 14px;
          height: 100%;
          background: #fff;
          transition: border-color 0.15s ease, background-color 0.15s ease;
        }

        .quick-menu-card:hover {
          border-color: #cdb9f0;
          background: #fcfbff;
        }

        .quick-menu-icon {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3efff;
          color: #6f42c1;
        }

        .info-row-icon {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          color: #525252;
          font-size: 14px;
        }

        @media (max-width: 991.98px) {

          .user-main-content {
            margin-left: 0 !important;
            padding-top: 64px;
          }

        }

        @media (max-width: 575.98px) {

          .dashboard-table {
            min-width: 700px;
          }

        }

      `}</style>

    </div>
  );
}

/* =========================================================
   QUICK MENU
========================================================= */

function QuickMenu({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="text-decoration-none quick-menu-card"
    >
      <div className="quick-menu-icon">
        <i className={`bi ${icon}`}></i>
      </div>

      <div className="min-w-0">
        <div className="fw-semibold text-dark small">
          {title}
        </div>

        <div className="text-secondary" style={{ fontSize: "12px" }}>
          {description}
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: string;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`d-flex align-items-center gap-3 py-2 ${
        last ? "" : "border-bottom"
      }`}
    >
      <div className="info-row-icon">
        <i className={`bi ${icon}`}></i>
      </div>

      <div className="overflow-hidden">
        <small className="text-secondary d-block" style={{ fontSize: "12px" }}>
          {label}
        </small>

        <span
          className="fw-semibold text-truncate d-block small"
          style={{
            maxWidth: "100%",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
  overdue,
}: {
  status: BorrowingStatus;
  overdue: boolean;
}) {
  if (overdue && status !== "returned") {
    return (
      <Pill tone="rose">
        <i className="bi bi-exclamation-circle"></i>
        เกินกำหนด
      </Pill>
    );
  }

  switch (status) {

    case "pending":
      return (
        <Pill tone="amber">
          <i className="bi bi-hourglass-split"></i>
          รออนุมัติ
        </Pill>
      );

    case "approved":
      return (
        <Pill tone="purple">
          <i className="bi bi-check2-circle"></i>
          อนุมัติแล้ว
        </Pill>
      );

    case "borrowed":
      return (
        <Pill tone="blue">
          <i className="bi bi-box-seam"></i>
          กำลังยืม
        </Pill>
      );

    case "returned":
      return (
        <Pill tone="emerald">
          <i className="bi bi-check-circle"></i>
          คืนแล้ว
        </Pill>
      );

    case "rejected":
      return (
        <Pill tone="rose">
          <i className="bi bi-x-circle"></i>
          ไม่อนุมัติ
        </Pill>
      );

    case "overdue":
      return (
        <Pill tone="rose">
          <i className="bi bi-exclamation-circle"></i>
          เกินกำหนด
        </Pill>
      );

    default:
      return (
        <Pill tone="neutral">
          ไม่ทราบสถานะ
        </Pill>
      );
  }
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
  value: string | Date | null
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
