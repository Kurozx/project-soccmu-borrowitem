"use client";

import {
  useMemo,
  useState,
} from "react";

import UserNavbar from "@/app/components/UserNavbar";
import {
  PageHeader,
  Panel,
  Pill,
  StatCard,
  Toolbar,
  type Tone,
} from "@/app/components/ui";
import BorrowingPhotos from "@/app/components/BorrowingPhotos";

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

        <div className="ui-page">

          {/* =================================================
              HEADER
          ================================================= */}

          <PageHeader
            eyebrow="ประวัติ"
            title="ประวัติการยืม–คืน"
            description="ประวัติการยืมและคืนครุภัณฑ์ของคุณ"
          />

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="row g-3">

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-journal-text"
                label="ทั้งหมด"
                value={statistics.total.toLocaleString()}
                tone="purple"
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-arrow-repeat"
                label="กำลังยืม"
                value={statistics.borrowing.toLocaleString()}
                tone="blue"
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-check-circle"
                label="คืนแล้ว"
                value={statistics.returned.toLocaleString()}
                tone="emerald"
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-hourglass-split"
                label="รออนุมัติ"
                value={statistics.pending.toLocaleString()}
                tone="amber"
              />
            </div>

            <div className="col-12 col-xl">
              <StatCard
                icon="bi-x-circle"
                label="ไม่อนุมัติ"
                value={statistics.rejected.toLocaleString()}
                tone="rose"
              />
            </div>

          </div>

          {/* =================================================
              SEARCH / FILTER
          ================================================= */}

          <Toolbar>

            {/* SEARCH */}

            <div className="history-search">

              <i className="bi bi-search" />

              <input
                type="text"
                className="form-control"
                aria-label="ค้นหาประวัติ"
                placeholder="ค้นหาชื่อครุภัณฑ์ รหัส หรือเลขรายการ..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

            {/* STATUS */}

            <select
              className="form-select history-status-select"
              aria-label="สถานะ"
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

            {/* RESET */}

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={
                resetFilter
              }
            >
              <i className="bi bi-arrow-clockwise me-2" />
              ล้างตัวกรอง
            </button>

          </Toolbar>

          {/* =================================================
              HISTORY LIST
          ================================================= */}

          <Panel
            title="รายการประวัติ"
            description={
              <>
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
              </>
            }
          >

            {filteredItems.length ===
            0 ? (
              <div className="history-empty">

                <div className="history-empty-icon">
                  <i className="bi bi-clock-history" />
                </div>

                <p className="history-empty-title">
                  ไม่พบประวัติ
                </p>

                <p className="history-empty-text">
                  ยังไม่มีรายการที่ตรงกับเงื่อนไข
                </p>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={
                    resetFilter
                  }
                >
                  ล้างตัวกรอง
                </button>

              </div>
            ) : (
              <div className="d-flex flex-column gap-3">

                {filteredItems.map(
                  (item) => (
                    <HistoryCard
                      key={item.id}
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
                  )
                )}

              </div>
            )}

          </Panel>

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
          background: #fafafa;
        }

        .history-search {
          position: relative;
          flex: 1 1 260px;
          min-width: 0;
        }

        .history-search > i {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          color: #a3a3a3;
          font-size: 14px;
          pointer-events: none;
        }

        .history-search .form-control {
          padding-left: 34px;
        }

        .history-status-select {
          width: auto;
          min-width: 160px;
        }

        .history-empty {
          padding: 40px 20px;
          text-align: center;
        }

        .history-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #f5f5f5;
          color: #737373;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin: 0 auto 14px;
        }

        .history-empty-title {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 600;
          color: #171717;
        }

        .history-empty-text {
          margin: 0 0 16px;
          font-size: 13px;
          color: #737373;
        }

        .history-card {
          background: #ffffff;
          border: 1px solid #e4e4e4;
          border-radius: 12px;
          padding: 16px 18px;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
          cursor: pointer;
        }

        .history-card:hover {
          border-color: #d4d4d4;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .history-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #f3efff;
          color: #6f42c1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .history-code {
          color: #737373;
          font-size: 12px;
          font-weight: 600;
          font-family: var(--font-geist-mono, ui-monospace, monospace);
        }

        .history-equipment-name {
          font-size: 15px;
          font-weight: 600;
          color: #171717;
        }

        .history-info {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: #737373;
        }

        .history-info i {
          color: #a3a3a3;
        }

        .history-date-box {
          min-width: 180px;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          padding: 10px 14px;
        }

        .history-date-label {
          font-size: 11px;
          color: #737373;
        }

        .history-date-value {
          font-size: 13px;
          font-weight: 600;
          color: #171717;
        }

        .history-modal-content {
          border: 1px solid #e4e4e4;
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        }

        .history-modal-content .modal-header,
        .history-modal-content .modal-footer {
          border-color: #e4e4e4;
        }

        .history-modal-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #f3efff;
          color: #6f42c1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .history-detail-box {
          height: 100%;
          padding: 12px 14px;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          background: #fafafa;
        }

        .history-detail-label {
          margin-bottom: 2px;
          font-size: 12px;
          color: #737373;
        }

        .history-detail-row {
          padding: 13px 0;
          border-bottom: 1px solid #f0f0f0;
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

          .history-status-select {
            flex: 1 1 auto;
          }

        }

      `}</style>
    </>
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
            className="btn btn-sm btn-outline-secondary px-3"
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
      tone: Tone;
    }
  > = {
    pending: {
      text: "รออนุมัติ",
      tone: "amber",
    },

    approved: {
      text: "อนุมัติแล้ว",
      tone: "purple",
    },

    borrowed: {
      text: "กำลังยืม",
      tone: "blue",
    },

    returned: {
      text: "คืนแล้ว",
      tone: "emerald",
    },

    rejected: {
      text: "ไม่อนุมัติ",
      tone: "neutral",
    },

    overdue: {
      text: "เกินกำหนด",
      tone: "rose",
    },
  };

  const current =
    config[status];

  return (
    <Pill tone={current.tone}>
      {current.text}
    </Pill>
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
          "rgba(0,0,0,0.45)",
        zIndex: 2100,
      }}
      onClick={onClose}
    >

      <div
        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="modal-content history-modal-content">

          {/* HEADER */}

          <div className="modal-header">

            <div className="d-flex align-items-center gap-3">

              <div className="history-modal-icon">
                <i className="bi bi-clock-history" />
              </div>

              <div>

                <h5 className="modal-title fs-6 fw-semibold mb-0">
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

              <h4 className="fs-5 fw-semibold mb-2">
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

            {/* PHOTOS */}

            <BorrowingPhotos
              borrowingId={item.id}
              uploadKinds={
                item.status === "approved" ||
                item.status === "borrowed" ||
                item.status === "overdue"
                  ? ["borrow"]
                  : []
              }
              allowDelete
            />

          </div>

          {/* FOOTER */}

          <div className="modal-footer">

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
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

      <div className="history-detail-box">

        <div className="history-detail-label">
          {label}
        </div>

        <div className="fw-semibold small">
          {value}
        </div>

      </div>

    </div>
  );
}
