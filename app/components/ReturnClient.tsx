"use client";

import {
  useMemo,
  useState,
} from "react";

import UserNavbar from "@/app/components/UserNavbar";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type ReturnStatus =
  | "approved"
  | "borrowed"
  | "overdue";

type ReturnItem = {
  id: number;
  borrowId: string;
  equipmentCode: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  borrowDate: string;
  dueDate: string;
  purpose: string;
  status: ReturnStatus;
  daysLeft: number;
};

type ReturnClientProps = {
  items: ReturnItem[];
};

export default function ReturnClient({
  items,
}: ReturnClientProps) {
  const [returnItems, setReturnItems] =
    useState<ReturnItem[]>(items);

  const [selectedItem, setSelectedItem] =
    useState<ReturnItem | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     STATISTICS
  ===================================================== */

  const statistics = useMemo(() => {
    const total = returnItems.length;

    const quantity =
      returnItems.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      );

    const overdue =
      returnItems.filter(
        (item) =>
          item.status === "overdue" ||
          item.daysLeft < 0
      ).length;

    const dueSoon =
      returnItems.filter(
        (item) =>
          item.daysLeft >= 0 &&
          item.daysLeft <= 3
      ).length;

    return {
      total,
      quantity,
      overdue,
      dueSoon,
    };
  }, [returnItems]);

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (
    date: string
  ) => {
    return new Intl.DateTimeFormat(
      "th-TH",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(date));
  };

  /* =====================================================
     RETURN EQUIPMENT
  ===================================================== */

  const handleReturn = async () => {
    if (!selectedItem) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/borrowing/${selectedItem.id}/return`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "ไม่สามารถคืนครุภัณฑ์ได้"
        );
      }

      // ลบรายการออกจากหน้า
      setReturnItems(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              selectedItem.id
          )
      );

      setSelectedItem(null);
    } catch (err) {
      console.error(
        "RETURN ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการคืนครุภัณฑ์"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <UserNavbar />

      <main className="return-main">

        <div className="container-fluid px-4 py-4">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

            <div>
              <h2 className="fw-bold mb-1">
                รายการคืน
              </h2>

              <p className="text-secondary mb-0">
                รายการครุภัณฑ์ที่กำลังยืมและสามารถคืนได้
              </p>
            </div>

            <div className="return-header-icon">
              <i className="bi bi-arrow-return-left" />
            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle-fill" />

              <span>
                {error}
              </span>

              <button
                type="button"
                className="btn-close ms-auto"
                onClick={() =>
                  setError("")
                }
              />
            </div>
          )}

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="row g-3 mb-4">

            <div className="col-6 col-xl-3">
              <ReturnStatCard
                icon="bi-journal-text"
                title="รายการที่ต้องคืน"
                value={
                  statistics.total
                }
                className="purple"
              />
            </div>

            <div className="col-6 col-xl-3">
              <ReturnStatCard
                icon="bi-box-seam"
                title="จำนวนครุภัณฑ์"
                value={
                  statistics.quantity
                }
                className="blue"
              />
            </div>

            <div className="col-6 col-xl-3">
              <ReturnStatCard
                icon="bi-clock-history"
                title="ใกล้ครบกำหนด"
                value={
                  statistics.dueSoon
                }
                className="orange"
              />
            </div>

            <div className="col-6 col-xl-3">
              <ReturnStatCard
                icon="bi-exclamation-circle"
                title="เกินกำหนด"
                value={
                  statistics.overdue
                }
                className="red"
              />
            </div>

          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {returnItems.length ===
          0 ? (
            <div className="card border-0 shadow-sm return-empty-card">

              <div className="card-body text-center py-5">

                <div className="return-empty-icon">
                  <i className="bi bi-check2-circle" />
                </div>

                <h4 className="fw-bold mt-3">
                  ไม่มีรายการที่ต้องคืน
                </h4>

                <p className="text-secondary mb-0">
                  ขณะนี้คุณไม่มีครุภัณฑ์ที่กำลังยืมอยู่
                </p>

              </div>

            </div>
          ) : (
            <>
              {/* =================================================
                  WARNING
              ================================================= */}

              {statistics.overdue >
                0 && (
                <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center gap-3 mb-4">

                  <div className="warning-icon">
                    <i className="bi bi-exclamation-triangle-fill" />
                  </div>

                  <div>
                    <div className="fw-bold">
                      มีรายการเกินกำหนดคืน
                    </div>

                    <div className="small">
                      กรุณาดำเนินการคืนครุภัณฑ์โดยเร็วที่สุด
                    </div>
                  </div>

                </div>
              )}

              {/* =================================================
                  LIST
              ================================================= */}

              <div className="row g-4">

                {returnItems.map(
                  (item) => (
                    <div
                      className="col-12"
                      key={item.id}
                    >
                      <ReturnCard
                        item={item}
                        formatDate={
                          formatDate
                        }
                        onReturn={() =>
                          setSelectedItem(
                            item
                          )
                        }
                      />
                    </div>
                  )
                )}

              </div>
            </>
          )}

        </div>
      </main>

      {/* =====================================================
          CONFIRM MODAL
      ===================================================== */}

      {selectedItem && (
        <ReturnConfirmModal
          item={selectedItem}
          loading={loading}
          formatDate={formatDate}
          onCancel={() => {
            if (!loading) {
              setSelectedItem(null);
            }
          }}
          onConfirm={
            handleReturn
          }
        />
      )}

      {/* =====================================================
          CSS
      ===================================================== */}

      <style jsx global>{`

        .return-main {
          margin-left: 270px;
          min-height: 100vh;
          background: #f7f7fb;
        }

        .return-header-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: #eee8fa;
          color: #6f42c1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .return-stat-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          box-shadow:
            0 4px 18px
            rgba(0, 0, 0, 0.05);
          height: 100%;
        }

        .return-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
        }

        .return-stat-icon.purple {
          background: #eee8fa;
          color: #6f42c1;
        }

        .return-stat-icon.blue {
          background: #e7f1ff;
          color: #0d6efd;
        }

        .return-stat-icon.orange {
          background: #fff2df;
          color: #fd7e14;
        }

        .return-stat-icon.red {
          background: #fde7e9;
          color: #dc3545;
        }

        .return-empty-card {
          border-radius: 20px;
        }

        .return-empty-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #e8f7ee;
          color: #198754;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin: auto;
        }

        .warning-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 12px;
          background: rgba(220,53,69,0.12);
          color: #dc3545;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .return-card {
          background: #ffffff;
          border: 0;
          border-radius: 18px;
          box-shadow:
            0 4px 18px
            rgba(0, 0, 0, 0.06);
          overflow: hidden;
          transition: 0.2s ease;
        }

        .return-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 8px 24px
            rgba(0, 0, 0, 0.09);
        }

        .return-card-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #f0eaff;
          color: #6f42c1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          flex-shrink: 0;
        }

        .return-code {
          color: #6f42c1;
          font-size: 13px;
          font-weight: 700;
        }

        .return-equipment-name {
          font-size: 19px;
          font-weight: 700;
          color: #212529;
        }

        .return-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6c757d;
          font-size: 14px;
        }

        .return-info i {
          color: #6f42c1;
        }

        .return-due-box {
          min-width: 170px;
          border-radius: 14px;
          padding: 14px 16px;
          background: #f8f9fa;
        }

        .return-due-box.warning {
          background: #fff4df;
          color: #9a6100;
        }

        .return-due-box.danger {
          background: #fde8ea;
          color: #b02a37;
        }

        .return-due-box.success {
          background: #e8f7ee;
          color: #146c43;
        }

        .return-status {
          display: inline-flex;
          align-items: center;
          padding: 6px 11px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .return-status.approved {
          background: #e7f1ff;
          color: #0d6efd;
        }

        .return-status.borrowed {
          background: #e8f7ee;
          color: #198754;
        }

        .return-status.overdue {
          background: #fde8ea;
          color: #dc3545;
        }

        .return-modal-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: #fff3cd;
          color: #997404;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto 18px;
        }

        @media (max-width: 991.98px) {

          .return-main {
            margin-left: 0;
            padding-top: 64px;
          }

        }

        @media (max-width: 767.98px) {

          .return-due-box {
            width: 100%;
            min-width: 0;
          }

        }

      `}</style>
    </>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function ReturnStatCard({
  icon,
  title,
  value,
  className,
}: {
  icon: string;
  title: string;
  value: number;
  className:
    | "purple"
    | "blue"
    | "orange"
    | "red";
}) {
  return (
    <div className="return-stat-card">

      <div className="d-flex align-items-center gap-3">

        <div
          className={`return-stat-icon ${className}`}
        >
          <i
            className={`bi ${icon}`}
          />
        </div>

        <div>

          <div className="small text-secondary">
            {title}
          </div>

          <div className="fs-4 fw-bold">
            {value.toLocaleString()}
          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   RETURN CARD
========================================================= */

function ReturnCard({
  item,
  formatDate,
  onReturn,
}: {
  item: ReturnItem;
  formatDate: (
    date: string
  ) => string;
  onReturn: () => void;
}) {
  const isOverdue =
    item.status === "overdue" ||
    item.daysLeft < 0;

  const isDueSoon =
    !isOverdue &&
    item.daysLeft <= 3;

  let dueClass =
    "success";

  if (isOverdue) {
    dueClass = "danger";
  } else if (isDueSoon) {
    dueClass = "warning";
  }

  return (
    <div className="return-card">

      <div className="p-4">

        <div className="row align-items-center g-4">

          {/* =================================================
              ICON
          ================================================= */}

          <div className="col-auto">

            <div className="return-card-icon">
              <i className="bi bi-box-seam" />
            </div>

          </div>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <div className="col">

            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">

              <span className="return-code">
                {item.equipmentCode}
              </span>

              <StatusBadge
                status={item.status}
              />

            </div>

            <div className="return-equipment-name mb-2">
              {item.name}
            </div>

            <div className="row g-2">

              <div className="col-md-6">

                <div className="return-info">
                  <i className="bi bi-tag" />
                  {item.category}
                </div>

              </div>

              <div className="col-md-6">

                <div className="return-info">
                  <i className="bi bi-geo-alt" />
                  {item.location}
                </div>

              </div>

              <div className="col-md-6">

                <div className="return-info">
                  <i className="bi bi-calendar-check" />

                  ยืมเมื่อ{" "}
                  {formatDate(
                    item.borrowDate
                  )}
                </div>

              </div>

              <div className="col-md-6">

                <div className="return-info">
                  <i className="bi bi-box" />

                  จำนวน{" "}
                  {item.quantity} รายการ
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              DUE DATE
          ================================================= */}

          <div className="col-12 col-lg-auto">

            <div
              className={`return-due-box ${dueClass}`}
            >

              <div className="small">
                กำหนดคืน
              </div>

              <div className="fw-bold">
                {formatDate(
                  item.dueDate
                )}
              </div>

              <div className="small mt-1">

                {isOverdue
                  ? `เกินกำหนด ${Math.abs(
                      item.daysLeft
                    )} วัน`
                  : item.daysLeft ===
                    0
                  ? "ครบกำหนดวันนี้"
                  : `เหลือ ${item.daysLeft} วัน`}

              </div>

            </div>

          </div>

          {/* =================================================
              RETURN BUTTON
          ================================================= */}

          <div className="col-12 col-lg-auto">

            <button
              type="button"
              className={`btn ${
                isOverdue
                  ? "btn-danger"
                  : "btn-primary"
              } px-4`}
              onClick={onReturn}
            >
              <i className="bi bi-arrow-return-left me-2" />

              คืนครุภัณฑ์
            </button>

          </div>

        </div>

        {/* PURPOSE */}

        {item.purpose && (
          <div className="mt-3 pt-3 border-top">

            <span className="text-secondary small">
              วัตถุประสงค์ในการยืม:{" "}
            </span>

            <span className="small">
              {item.purpose}
            </span>

          </div>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: ReturnStatus;
}) {
  const config = {
    approved: {
      text: "อนุมัติแล้ว",
      className: "approved",
    },

    borrowed: {
      text: "กำลังยืม",
      className: "borrowed",
    },

    overdue: {
      text: "เกินกำหนด",
      className: "overdue",
    },
  };

  const current =
    config[status];

  return (
    <span
      className={`return-status ${current.className}`}
    >
      {current.text}
    </span>
  );
}

/* =========================================================
   CONFIRM MODAL
========================================================= */

function ReturnConfirmModal({
  item,
  loading,
  formatDate,
  onCancel,
  onConfirm,
}: {
  item: ReturnItem;
  loading: boolean;
  formatDate: (
    date: string
  ) => string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{
        backgroundColor:
          "rgba(0,0,0,0.55)",
        zIndex: 2100,
      }}
      onClick={() => {
        if (!loading) {
          onCancel();
        }
      }}
    >

      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="modal-content border-0 shadow-lg rounded-4">

          <div className="modal-body p-4 text-center">

            <div className="return-modal-icon">
              <i className="bi bi-question-lg" />
            </div>

            <h4 className="fw-bold mb-2">
              ยืนยันการคืนครุภัณฑ์?
            </h4>

            <p className="text-secondary">
              คุณต้องการคืนครุภัณฑ์รายการนี้ใช่หรือไม่
            </p>

            <div className="bg-light rounded-4 p-3 text-start my-4">

              <div className="fw-bold">
                {item.name}
              </div>

              <div className="small text-secondary mt-1">
                รหัส:{" "}
                {item.equipmentCode}
              </div>

              <div className="small text-secondary">
                จำนวน:{" "}
                {item.quantity} รายการ
              </div>

              <div className="small text-secondary">
                กำหนดคืน:{" "}
                {formatDate(
                  item.dueDate
                )}
              </div>

            </div>

            <div className="d-flex gap-2">

              <button
                type="button"
                className="btn btn-light border flex-fill"
                onClick={onCancel}
                disabled={loading}
              >
                ยกเลิก
              </button>

              <button
                type="button"
                className="btn btn-primary flex-fill"
                onClick={onConfirm}
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />

                    กำลังดำเนินการ...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2" />

                    ยืนยันคืน
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}