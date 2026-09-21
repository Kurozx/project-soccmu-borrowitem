"use client";

import {
  useMemo,
  useState,
} from "react";

import UserNavbar from "@/app/components/UserNavbar";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

/* =========================================================
   TYPES
========================================================= */

type HistoryStatus =
  | "pending"
  | "approved"
  | "borrowed"
  | "returned"
  | "rejected"
  | "overdue";

type HistoryItem = {
  id: number;
  borrowId: string;
  equipmentCode: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  purpose: string;
  note: string;
  status: HistoryStatus;
};

type HistoryClientProps = {
  items: HistoryItem[];
};

/* =========================================================
   MAIN
========================================================= */

export default function HistoryClient({
  items,
}: HistoryClientProps) {
  const [selectedItem, setSelectedItem] =
    useState<HistoryItem | null>(null);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("ทั้งหมด");

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const total = items.length;

    const returned = items.filter(
      (item) =>
        item.status === "returned"
    ).length;

    const borrowing = items.filter(
      (item) =>
        item.status === "approved" ||
        item.status === "borrowed" ||
        item.status === "overdue"
    ).length;

    const pending = items.filter(
      (item) =>
        item.status === "pending"
    ).length;

    const rejected = items.filter(
      (item) =>
        item.status === "rejected"
    ).length;

    return {
      total,
      returned,
      borrowing,
      pending,
      rejected,
    };
  }, [items]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredItems = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return items.filter((item) => {
      const matchSearch =
        keyword === "" ||
        item.name
          .toLowerCase()
          .includes(keyword) ||
        item.equipmentCode
          .toLowerCase()
          .includes(keyword) ||
        item.borrowId
          .toLowerCase()
          .includes(keyword) ||
        item.category
          .toLowerCase()
          .includes(keyword);

      const matchStatus =
        status === "ทั้งหมด" ||
        item.status === status;

      return (
        matchSearch &&
        matchStatus
      );
    });
  }, [
    items,
    search,
    status,
  ]);

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (
    date: string | null
  ) => {
    if (!date) {
      return "-";
    }

    return new Intl.DateTimeFormat(
      "th-TH",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(date));
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetFilter = () => {
    setSearch("");
    setStatus("ทั้งหมด");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <UserNavbar />

      <main className="history-main">

        <div className="container-fluid px-4 py-4">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

            <div>
              <h2 className="fw-bold mb-1">
                ประวัติการยืม–คืน
              </h2>

              <p className="text-secondary mb-0">
                ประวัติการยืมและคืนครุภัณฑ์ของคุณ
              </p>
            </div>

            <div className="history-header-icon">
              <i className="bi bi-clock-history" />
            </div>

          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="row g-3 mb-4">

            <div className="col-6 col-xl">
              <HistoryStat
                icon="bi-journal-text"
                title="ทั้งหมด"
                value={
                  statistics.total
                }
                type="purple"
              />
            </div>

            <div className="col-6 col-xl">
              <HistoryStat
                icon="bi-arrow-repeat"
                title="กำลังยืม"
                value={
                  statistics.borrowing
                }
                type="blue"
              />
            </div>

            <div className="col-6 col-xl">
              <HistoryStat
                icon="bi-check-circle"
                title="คืนแล้ว"
                value={
                  statistics.returned
                }
                type="green"
              />
            </div>

            <div className="col-6 col-xl">
              <HistoryStat
                icon="bi-hourglass-split"
                title="รออนุมัติ"
                value={
                  statistics.pending
                }
                type="orange"
              />
            </div>

            <div className="col-12 col-xl">
              <HistoryStat
                icon="bi-x-circle"
                title="ไม่อนุมัติ"
                value={
                  statistics.rejected
                }
                type="red"
              />
            </div>

          </div>

          {/* =================================================
              SEARCH / FILTER
          ================================================= */}

          <div className="card border-0 shadow-sm mb-4 history-filter-card">

            <div className="card-body">

              <div className="row g-3">

                {/* SEARCH */}

                <div className="col-lg-6">

                  <label className="form-label fw-semibold">
                    ค้นหาประวัติ
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-white">
                      <i className="bi bi-search" />
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหาชื่อครุภัณฑ์ รหัส หรือเลขรายการ..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                {/* STATUS */}

                <div className="col-lg-4">

                  <label className="form-label fw-semibold">
                    สถานะ
                  </label>

                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                  >

                    <option value="ทั้งหมด">
                      ทั้งหมด
                    </option>

                    <option value="pending">
                      รออนุมัติ
                    </option>

                    <option value="approved">
                      อนุมัติแล้ว
                    </option>

                    <option value="borrowed">
                      กำลังยืม
                    </option>

                    <option value="returned">
                      คืนแล้ว
                    </option>

                    <option value="rejected">
                      ไม่อนุมัติ
                    </option>

                    <option value="overdue">
                      เกินกำหนด
                    </option>

                  </select>

                </div>

                {/* RESET */}

                <div className="col-lg-2 d-flex align-items-end">

                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={
                      resetFilter
                    }
                  >
                    <i className="bi bi-arrow-clockwise me-2" />
                    ล้างตัวกรอง
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              RESULT COUNT
          ================================================= */}

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div className="text-secondary">
              แสดง{" "}
              <strong className="text-dark">
                {
                  filteredItems.length
                }
              </strong>{" "}
              จาก{" "}
              <strong className="text-dark">
                {items.length}
              </strong>{" "}
              รายการ
            </div>

          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredItems.length ===
          0 ? (
            <div className="card border-0 shadow-sm history-empty">

              <div className="card-body text-center py-5">

                <div className="history-empty-icon">
                  <i className="bi bi-clock-history" />
                </div>

                <h5 className="fw-bold mt-3">
                  ไม่พบประวัติ
                </h5>

                <p className="text-secondary mb-3">
                  ยังไม่มีรายการที่ตรงกับเงื่อนไข
                </p>

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={
                    resetFilter
                  }
                >
                  ล้างตัวกรอง
                </button>

              </div>

            </div>
          ) : (
            /* =================================================
               HISTORY LIST
            ================================================= */

            <div className="row g-3">

              {filteredItems.map(
                (item) => (
                  <div
                    className="col-12"
                    key={item.id}
                  >

                    <HistoryCard
                      item={item}
                      formatDate={
                        formatDate
                      }
                      onClick={() =>
                        setSelectedItem(
                          item
                        )
                      }
                    />

                  </div>
                )
              )}

            </div>
          )}

        </div>
      </main>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedItem && (
        <HistoryModal
          item={selectedItem}
          formatDate={formatDate}
          onClose={() =>
            setSelectedItem(null)
          }
        />
      )}

      {/* =====================================================
          CSS
      ===================================================== */}

      <style jsx global>{`

        .history-main {
          margin-left: 270px;
          min-height: 100vh;
          background: #f7f7fb;
        }

        .history-header-icon {
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

        .history-filter-card {
          border-radius: 16px;
        }

        .history-stat-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          height: 100%;
          box-shadow:
            0 4px 18px
            rgba(0, 0, 0, 0.05);
        }

        .history-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
        }

        .history-stat-icon.purple {
          background: #eee8fa;
          color: #6f42c1;
        }

        .history-stat-icon.blue {
          background: #e7f1ff;
          color: #0d6efd;
        }

        .history-stat-icon.green {
          background: #e8f7ee;
          color: #198754;
        }

        .history-stat-icon.orange {
          background: #fff2df;
          color: #fd7e14;
        }

        .history-stat-icon.red {
          background: #fde8ea;
          color: #dc3545;
        }

        .history-empty {
          border-radius: 20px;
        }

        .history-empty-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f0eaff;
          color: #6f42c1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 38px;
          margin: auto;
        }

        .history-card {
          background: #ffffff;
          border: 0;
          border-radius: 18px;
          box-shadow:
            0 4px 18px
            rgba(0, 0, 0, 0.05);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
          cursor: pointer;
        }

        .history-card:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 8px 24px
            rgba(0, 0, 0, 0.08);
        }

        .history-card-icon {
          width: 58px;
          height: 58px;
          border-radius: 15px;
          background: #f0eaff;
          color: #6f42c1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          flex-shrink: 0;
        }

        .history-code {
          color: #6f42c1;
          font-size: 12px;
          font-weight: 700;
        }

        .history-equipment-name {
          font-size: 18px;
          font-weight: 700;
        }

        .history-info {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: #6c757d;
        }

        .history-info i {
          color: #6f42c1;
        }

        .history-date-box {
          min-width: 180px;
          background: #f8f9fa;
          border-radius: 13px;
          padding: 12px 15px;
        }

        .history-date-label {
          font-size: 12px;
          color: #6c757d;
        }

        .history-date-value {
          font-size: 13px;
          font-weight: 600;
        }

        .history-status {
          display: inline-flex;
          align-items: center;
          padding: 6px 11px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .history-status.pending {
          background: #fff3cd;
          color: #997404;
        }

        .history-status.approved {
          background: #e7f1ff;
          color: #0d6efd;
        }

        .history-status.borrowed {
          background: #e8f7ee;
          color: #198754;
        }

        .history-status.returned {
          background: #e8f7ee;
          color: #146c43;
        }

        .history-status.rejected {
          background: #fde8ea;
          color: #dc3545;
        }

        .history-status.overdue {
          background: #fde8ea;
          color: #b02a37;
        }

        .history-modal-icon {
          width: 70px;
          height: 70px;
          border-radius: 18px;
          background: #f0eaff;
          color: #6f42c1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }

        .history-detail-row {
          padding: 13px 0;
          border-bottom: 1px solid #eeeeee;
        }

        .history-detail-row:last-child {
          border-bottom: 0;
        }

        @media (max-width: 991.98px) {

          .history-main {
            margin-left: 0;
            padding-top: 64px;
          }

        }

        @media (max-width: 767.98px) {

          .history-date-box {
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

function HistoryStat({
  icon,
  title,
  value,
  type,
}: {
  icon: string;
  title: string;
  value: number;
  type:
    | "purple"
    | "blue"
    | "green"
    | "orange"
    | "red";
}) {
  return (
    <div className="history-stat-card">

      <div className="d-flex align-items-center gap-3">

        <div
          className={`history-stat-icon ${type}`}
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
   HISTORY CARD
========================================================= */

function HistoryCard({
  item,
  formatDate,
  onClick,
}: {
  item: HistoryItem;
  formatDate: (
    date: string | null
  ) => string;
  onClick: () => void;
}) {
  return (
    <div
      className="history-card"
      onClick={onClick}
    >

      <div className="p-4">

        <div className="row align-items-center g-3">

          {/* ICON */}

          <div className="col-auto">

            <div className="history-card-icon">
              <i className="bi bi-box-seam" />
            </div>

          </div>

          {/* INFO */}

          <div className="col">

            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">

              <span className="history-code">
                {item.borrowId}
              </span>

              <HistoryStatus
                status={
                  item.status
                }
              />

            </div>

            <div className="history-equipment-name mb-2">
              {item.name}
            </div>

            <div className="row g-2">

              <div className="col-md-6">

                <div className="history-info">
                  <i className="bi bi-upc-scan" />

                  {item.equipmentCode}
                </div>

              </div>

              <div className="col-md-6">

                <div className="history-info">
                  <i className="bi bi-tag" />

                  {item.category}
                </div>

              </div>

              <div className="col-md-6">

                <div className="history-info">
                  <i className="bi bi-calendar-check" />

                  ยืม{" "}
                  {formatDate(
                    item.borrowDate
                  )}
                </div>

              </div>

              <div className="col-md-6">

                <div className="history-info">
                  <i className="bi bi-box" />

                  จำนวน{" "}
                  {item.quantity} รายการ
                </div>

              </div>

            </div>

          </div>

          {/* DATES */}

          <div className="col-12 col-lg-auto">

            <div className="history-date-box">

              <div className="history-date-label">
                กำหนดคืน
              </div>

              <div className="history-date-value">
                {formatDate(
                  item.dueDate
                )}
              </div>

              <div className="history-date-label mt-2">
                วันที่คืน
              </div>

              <div className="history-date-value">
                {formatDate(
                  item.returnDate
                )}
              </div>

            </div>

          </div>

          {/* DETAIL BUTTON */}

          <div className="col-12 col-lg-auto">

            <button
              type="button"
              className="btn btn-outline-primary px-4"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <i className="bi bi-eye me-2" />
              รายละเอียด
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function HistoryStatus({
  status,
}: {
  status: HistoryStatus;
}) {
  const config: Record<
    HistoryStatus,
    {
      text: string;
      className: string;
    }
  > = {
    pending: {
      text: "รออนุมัติ",
      className: "pending",
    },

    approved: {
      text: "อนุมัติแล้ว",
      className: "approved",
    },

    borrowed: {
      text: "กำลังยืม",
      className: "borrowed",
    },

    returned: {
      text: "คืนแล้ว",
      className: "returned",
    },

    rejected: {
      text: "ไม่อนุมัติ",
      className: "rejected",
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
      className={`history-status ${current.className}`}
    >
      {current.text}
    </span>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function HistoryModal({
  item,
  formatDate,
  onClose,
}: {
  item: HistoryItem;
  formatDate: (
    date: string | null
  ) => string;
  onClose: () => void;
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
      onClick={onClose}
    >

      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="modal-content border-0 shadow-lg rounded-4">

          {/* HEADER */}

          <div className="modal-header">

            <div className="d-flex align-items-center gap-3">

              <div className="history-modal-icon">
                <i className="bi bi-clock-history" />
              </div>

              <div>

                <h5 className="modal-title fw-bold mb-1">
                  รายละเอียดการยืม–คืน
                </h5>

                <div className="small text-secondary">
                  {item.borrowId}
                </div>

              </div>

            </div>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            />

          </div>

          {/* BODY */}

          <div className="modal-body p-4">

            {/* Equipment */}

            <div className="mb-4">

              <div className="small text-secondary mb-1">
                ครุภัณฑ์
              </div>

              <h4 className="fw-bold mb-2">
                {item.name}
              </h4>

              <HistoryStatus
                status={
                  item.status
                }

              />

            </div>

            <div className="row g-3">

              <DetailItem
                label="รหัสครุภัณฑ์"
                value={
                  item.equipmentCode
                }
              />

              <DetailItem
                label="ประเภท"
                value={
                  item.category
                }
              />

              <DetailItem
                label="สถานที่"
                value={
                  item.location
                }
              />

              <DetailItem
                label="จำนวน"
                value={`${item.quantity} รายการ`}
              />

              <DetailItem
                label="วันที่ยืม"
                value={formatDate(
                  item.borrowDate
                )}
              />

              <DetailItem
                label="กำหนดคืน"
                value={formatDate(
                  item.dueDate
                )}
              />

              <DetailItem
                label="วันที่คืน"
                value={formatDate(
                  item.returnDate
                )}
              />

            </div>

            {/* PURPOSE */}

            <div className="history-detail-row mt-3">

              <div className="small text-secondary mb-1">
                วัตถุประสงค์
              </div>

              <div>
                {item.purpose ||
                  "-"}
              </div>

            </div>

            {/* NOTE */}

            {item.note && (
              <div className="history-detail-row">

                <div className="small text-secondary mb-1">
                  หมายเหตุ
                </div>

                <div>
                  {item.note}
                </div>

              </div>
            )}

          </div>

          {/* FOOTER */}

          <div className="modal-footer">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              ปิด
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="col-md-6">

      <div className="bg-light rounded-3 p-3 h-100">

        <div className="small text-secondary mb-1">
          {label}
        </div>

        <div className="fw-semibold">
          {value}
        </div>

      </div>

    </div>
  );
}