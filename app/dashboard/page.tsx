import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import UserNavbar from "@/app/components/UserNavbar";

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

  const userName = session.user.name || "ผู้ใช้งาน";
  const userEmail = session.user.email || "-";

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
      className="bg-light min-vh-100"
      style={{
        overflowX: "hidden",
      }}
    >
      <UserNavbar />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="user-main-content">
        <div className="container-fluid p-3 p-md-4 p-lg-5">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="dashboard-header mb-4">
            <div>
              <h2 className="fw-bold mb-1">
                Dashboard
              </h2>

              <p className="text-secondary mb-0">
                ยินดีต้อนรับกลับมา,{" "}
                <span className="fw-semibold text-dark">
                  {userName}
                </span>
              </p>
            </div>
          </div>

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="row g-4 mb-4">

            {/* TOTAL */}

            <div className="col-12 col-sm-6 col-xl-3">
              <DashboardCard
                title="รายการยืมทั้งหมด"
                value={stats.total}
                icon="bi-box-arrow-up-right"
                bg="#eee8ff"
                color="#6f42c1"
              />
            </div>

            {/* BORROWING */}

            <div className="col-12 col-sm-6 col-xl-3">
              <DashboardCard
                title="กำลังยืม"
                value={stats.borrowing}
                icon="bi-box-seam"
                bg="#e8f4ff"
                color="#0d6efd"
              />
            </div>

            {/* PENDING */}

            <div className="col-12 col-sm-6 col-xl-3">
              <DashboardCard
                title="รออนุมัติ"
                value={stats.pending}
                icon="bi-hourglass-split"
                bg="#fff4df"
                color="#fd7e14"
              />
            </div>

            {/* RETURNED */}

            <div className="col-12 col-sm-6 col-xl-3">
              <DashboardCard
                title="คืนแล้ว"
                value={stats.returned}
                icon="bi-check-circle"
                bg="#e8f8ef"
                color="#198754"
              />
            </div>

          </div>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="row g-4">

            {/* =================================================
                QUICK MENU
            ================================================= */}

            <div className="col-12 col-xl-7">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <h5 className="fw-bold mb-0">
                      เมนูด่วน
                    </h5>

                    <i
                      className="bi bi-grid fs-5"
                      style={{
                        color: "#6f42c1",
                      }}
                    ></i>

                  </div>

                  <div className="row g-3">

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

                </div>
              </div>

            </div>

            {/* =================================================
                ACCOUNT INFO
            ================================================= */}

            <div className="col-12 col-xl-5">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <h5 className="fw-bold mb-0">
                      ข้อมูลบัญชี
                    </h5>

                    <div
                      className="account-icon"
                    >
                      <i className="bi bi-person"></i>
                    </div>

                  </div>

                  <InfoRow
                    icon="bi-person"
                    label="Username"
                    value={userName}
                  />

                  <InfoRow
                    icon="bi-envelope"
                    label="Email"
                    value={userEmail}
                  />

                  <InfoRow
                    icon="bi-shield-check"
                    label="สิทธิ์การใช้งาน"
                    value="ผู้ใช้งาน"
                  />

                  <div className="mt-4">

                    <Link
                      href="/profile"
                      className="btn btn-outline-primary rounded-pill w-100 profile-btn"
                    >
                      <i className="bi bi-person me-2"></i>
                      จัดการโปรไฟล์
                    </Link>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              RECENT BORROWINGS
          ================================================= */}

          <div className="card border-0 shadow-sm rounded-4 mt-4">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                  <h5 className="fw-bold mb-1">
                    รายการล่าสุด
                  </h5>

                  <small className="text-secondary">
                    รายการยืม–คืนล่าสุดของคุณ
                  </small>
                </div>

                <Link
                  href="/history"
                  className="text-decoration-none fw-semibold"
                  style={{
                    color: "#6f42c1",
                  }}
                >
                  ดูทั้งหมด
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>

              </div>

              {recentBorrowings.length === 0 ? (

                /* =================================================
                   EMPTY STATE
                ================================================= */

                <div className="text-center py-5">

                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "76px",
                      height: "76px",
                      background: "#eee8ff",
                      color: "#6f42c1",
                    }}
                  >
                    <i className="bi bi-inbox fs-3"></i>
                  </div>

                  <h6 className="fw-semibold mb-2">
                    ยังไม่มีรายการยืม
                  </h6>

                  <p className="text-secondary mb-3">
                    คุณยังไม่มีประวัติการยืมครุภัณฑ์
                  </p>

                  <Link
                    href="/equipment"
                    className="btn dashboard-primary-btn rounded-pill px-4"
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

                  <table className="table align-middle mb-0">

                    <thead>
                      <tr>
                        <th className="border-0 text-secondary">
                          ครุภัณฑ์
                        </th>

                        <th className="border-0 text-secondary">
                          จำนวน
                        </th>

                        <th className="border-0 text-secondary">
                          วันที่ยืม
                        </th>

                        <th className="border-0 text-secondary">
                          กำหนดคืน
                        </th>

                        <th className="border-0 text-secondary">
                          สถานะ
                        </th>
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

                                <div
                                  className="equipment-icon"
                                >
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

            </div>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="text-center text-secondary small py-4">

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

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .dashboard-primary-btn {
          background: #6f42c1;
          border-color: #6f42c1;
          color: #fff;
          transition: all 0.2s ease;
        }

        .dashboard-primary-btn:hover {
          background: #5f35ad;
          border-color: #5f35ad;
          color: #fff;
          transform: translateY(-1px);
        }

        .profile-btn {
          border-color: #6f42c1;
          color: #6f42c1;
          transition: all 0.2s ease;
        }

        .profile-btn:hover {
          background: #6f42c1;
          border-color: #6f42c1;
          color: #fff;
        }

        .account-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eee8ff;
          color: #6f42c1;
        }

        .equipment-icon {
          width: 46px;
          height: 46px;
          min-width: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f0ff;
          color: #6f42c1;
        }

        .quick-menu-card {
          border: 1px solid #e9ecef;
          border-radius: 16px;
          padding: 16px;
          height: 100%;
          transition: all 0.2s ease;
          background: #fff;
        }

        .quick-menu-card:hover {
          border-color: #d8c7f5;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }

        .quick-menu-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eee8ff;
          color: #6f42c1;
        }

        .table > :not(caption) > * > * {
          padding: 14px 10px;
        }

        .table thead th {
          white-space: nowrap;
          font-size: 0.85rem;
        }

        .table tbody td {
          border-color: #f0f0f0;
        }

        @media (max-width: 1199.98px) {

          .dashboard-header {
            align-items: flex-start;
          }

        }

        @media (max-width: 991.98px) {

          .user-main-content {
            margin-left: 0 !important;
            padding-top: 64px;
          }

        }

        @media (max-width: 575.98px) {

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .dashboard-header .btn {
            width: 100%;
          }

          .card-body {
            padding: 18px !important;
          }

          .table {
            min-width: 760px;
          }

        }

      `}</style>

    </div>
  );
}

/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  title,
  value,
  icon,
  bg,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  bg: string;
  color: string;
}) {
  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">

      <div className="card-body p-4">

        <div className="d-flex align-items-center justify-content-between">

          <div>

            <div className="text-secondary mb-2">
              {title}
            </div>

            <h3 className="fw-bold mb-0">
              {value.toLocaleString("th-TH")}
            </h3>

          </div>

          <div
            className="rounded-4 d-flex align-items-center justify-content-center"
            style={{
              width: "55px",
              height: "55px",
              background: bg,
              color: color,
            }}
          >
            <i className={`bi ${icon} fs-4`}></i>
          </div>

        </div>

      </div>

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
      className="text-decoration-none"
    >
      <div className="quick-menu-card">

        <div className="d-flex align-items-center gap-3">

          <div className="quick-menu-icon">
            <i className={`bi ${icon} fs-5`}></i>
          </div>

          <div className="min-w-0">

            <div className="fw-semibold text-dark">
              {title}
            </div>

            <small className="text-secondary">
              {description}
            </small>

          </div>

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
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="d-flex align-items-center gap-3 border-bottom py-3">

      <div
        className="rounded-3 d-flex align-items-center justify-content-center"
        style={{
          width: "42px",
          height: "42px",
          minWidth: "42px",
          background: "#f5f0ff",
          color: "#6f42c1",
        }}
      >
        <i className={`bi ${icon}`}></i>
      </div>

      <div className="overflow-hidden">

        <small className="text-secondary d-block">
          {label}
        </small>

        <span
          className="fw-semibold text-truncate d-block"
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
      <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-2">
        <i className="bi bi-exclamation-circle me-1"></i>
        เกินกำหนด
      </span>
    );
  }

  switch (status) {

    case "pending":
      return (
        <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2">
          <i className="bi bi-hourglass-split me-1"></i>
          รออนุมัติ
        </span>
      );

    case "approved":
      return (
        <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
          <i className="bi bi-check2-circle me-1"></i>
          อนุมัติแล้ว
        </span>
      );

    case "borrowed":
      return (
        <span className="badge rounded-pill bg-info-subtle text-info-emphasis px-3 py-2">
          <i className="bi bi-box-seam me-1"></i>
          กำลังยืม
        </span>
      );

    case "returned":
      return (
        <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2">
          <i className="bi bi-check-circle me-1"></i>
          คืนแล้ว
        </span>
      );

    case "rejected":
      return (
        <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-2">
          <i className="bi bi-x-circle me-1"></i>
          ไม่อนุมัติ
        </span>
      );

    case "overdue":
      return (
        <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-2">
          <i className="bi bi-exclamation-circle me-1"></i>
          เกินกำหนด
        </span>
      );

    default:
      return (
        <span className="badge rounded-pill bg-secondary-subtle text-secondary px-3 py-2">
          ไม่ทราบสถานะ
        </span>
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