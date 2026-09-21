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
  type Tone,
} from "@/app/components/ui";
import BorrowingPhotos, {
  PhotoPicker,
  photoFailureText,
  releasePhotos,
  uploadPhotos,
  type PickedPhoto,
  type UploadProgress,
} from "@/app/components/BorrowingPhotos";

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

  const [notice, setNotice] =
    useState("");

  // รูปสภาพครุภัณฑ์ตอนคืน (อัปโหลดหลังคืนสำเร็จ)
  const [photos, setPhotos] =
    useState<PickedPhoto[]>([]);

  const [uploadProgress, setUploadProgress] =
    useState<UploadProgress | null>(null);

  // รายการที่เปิดดูรูปภาพ
  const [photoItem, setPhotoItem] =
    useState<ReturnItem | null>(null);

  const closeConfirm = () => {
    releasePhotos(photos);
    setPhotos([]);
    setSelectedItem(null);
  };

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
    setNotice("");

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

      const photoSummary =
        await uploadPhotos(
          selectedItem.id,
          "return",
          photos,
          setUploadProgress
        );

      const photoFailure =
        photoFailureText(photoSummary);

      setNotice(
        `คืน ${selectedItem.name} สำเร็จ${
          photoFailure
            ? ` ${photoFailure}`
            : photoSummary.uploaded
              ? ` (แนบรูป ${photoSummary.uploaded} รูป)`
              : ""
        }`
      );

      closeConfirm();
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
      setUploadProgress(null);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <UserNavbar />

      <main className="return-main">

        <div className="ui-page">

          {/* =================================================
              HEADER
          ================================================= */}

          <PageHeader
            eyebrow="การคืน"
            title="รายการคืน"
            description="รายการครุภัณฑ์ที่กำลังยืมและสามารถคืนได้"
          />

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="return-alert"
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

          {notice && (
            <div
              className="return-alert return-notice"
              role="status"
            >
              <i className="bi bi-check-circle-fill" />

              <span>
                {notice}
              </span>

              <button
                type="button"
                className="btn-close ms-auto"
                onClick={() =>
                  setNotice("")
                }
              />
            </div>
          )}

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="row g-3">

            <div className="col-6 col-xl-3">
              <StatCard
                icon="bi-journal-text"
                label="รายการที่ต้องคืน"
                value={statistics.total.toLocaleString()}
                tone="purple"
              />
            </div>

            <div className="col-6 col-xl-3">
              <StatCard
                icon="bi-box-seam"
                label="จำนวนครุภัณฑ์"
                value={statistics.quantity.toLocaleString()}
                tone="blue"
              />
            </div>

            <div className="col-6 col-xl-3">
              <StatCard
                icon="bi-clock-history"
                label="ใกล้ครบกำหนด"
                value={statistics.dueSoon.toLocaleString()}
                tone="amber"
              />
            </div>

            <div className="col-6 col-xl-3">
              <StatCard
                icon="bi-exclamation-circle"
                label="เกินกำหนด"
                value={statistics.overdue.toLocaleString()}
                tone="rose"
              />
            </div>

          </div>

          {/* =================================================
              WARNING
          ================================================= */}

          {returnItems.length > 0 &&
            statistics.overdue > 0 && (
              <div className="return-alert">

                <i className="bi bi-exclamation-triangle-fill" />

                <div>
                  <div className="fw-semibold">
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

          <Panel
            title="ครุภัณฑ์ที่ต้องคืน"
            description="เลือกรายการที่ต้องการคืนครุภัณฑ์"
            action={
              returnItems.length > 0 ? (
                <Pill tone="purple">
                  {returnItems.length} รายการ
                </Pill>
              ) : undefined
            }
          >
            {returnItems.length ===
            0 ? (
              <div className="return-empty">

                <div className="return-empty-icon">
                  <i className="bi bi-check2-circle" />
                </div>

                <p className="return-empty-title">
                  ไม่มีรายการที่ต้องคืน
                </p>

                <p className="return-empty-text">
                  ขณะนี้คุณไม่มีครุภัณฑ์ที่กำลังยืมอยู่
                </p>

              </div>
            ) : (
              <div className="d-flex flex-column gap-3">

                {returnItems.map(
                  (item) => (
                    <ReturnCard
                      key={item.id}
                      item={item}
                      formatDate={
                        formatDate
                      }
                      onReturn={() =>
                        setSelectedItem(
                          item
                        )
                      }
                      onPhotos={() =>
                        setPhotoItem(item)
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
          CONFIRM MODAL
      ===================================================== */}

      {selectedItem && (
        <ReturnConfirmModal
          item={selectedItem}
          loading={loading}
          formatDate={formatDate}
          onCancel={() => {
            if (!loading) {
              closeConfirm();
            }
          }}
          onConfirm={
            handleReturn
          }
          photos={photos}
          onPhotosChange={setPhotos}
          uploadProgress={uploadProgress}
        />
      )}

      {/* =====================================================
          PHOTOS MODAL
      ===================================================== */}

      {photoItem && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.45)",
            zIndex: 2100,
          }}
          onClick={() =>
            setPhotoItem(null)
          }
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-content return-modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fs-6 fw-semibold">
                    รูปภาพ · {photoItem.name}
                  </h5>
                  <small className="text-secondary">
                    {photoItem.borrowId}
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="ปิด"
                  onClick={() =>
                    setPhotoItem(null)
                  }
                />
              </div>

              <div className="modal-body pt-0">
                <BorrowingPhotos
                  borrowingId={photoItem.id}
                  uploadKinds={["borrow"]}
                  allowDelete
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CSS
      ===================================================== */}

      <style jsx global>{`

        .return-main {
          margin-left: 270px;
          min-height: 100vh;
          background: #fafafa;
        }

        .return-alert {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border: 1px solid #fecdd3;
          border-radius: 12px;
          background: #fff1f2;
          color: #9f1239;
          font-size: 14px;
        }

        .return-alert > i {
          font-size: 18px;
          color: #e11d48;
          line-height: 1.3;
        }

        .return-notice {
          border-color: #a7f3d0;
          background: #ecfdf5;
          color: #065f46;
        }

        .return-notice > i {
          color: #059669;
        }

        .return-empty {
          padding: 40px 20px;
          text-align: center;
        }

        .return-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #ecfdf5;
          color: #047857;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin: 0 auto 14px;
        }

        .return-empty-title {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 600;
          color: #171717;
        }

        .return-empty-text {
          margin: 0;
          font-size: 13px;
          color: #737373;
        }

        .return-card {
          background: #ffffff;
          border: 1px solid #e4e4e4;
          border-radius: 12px;
          padding: 16px 18px;
          transition: box-shadow 0.15s ease;
        }

        .return-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .return-card.is-overdue {
          border-color: #fecdd3;
        }

        .return-card-icon {
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

        .return-code {
          color: #737373;
          font-size: 12px;
          font-weight: 600;
          font-family: var(--font-geist-mono, ui-monospace, monospace);
        }

        .return-equipment-name {
          font-size: 15px;
          font-weight: 600;
          color: #171717;
        }

        .return-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #737373;
          font-size: 13px;
        }

        .return-info i {
          color: #a3a3a3;
        }

        .return-due-box {
          min-width: 170px;
          border-radius: 8px;
          padding: 10px 14px;
          background: #f5f5f5;
          color: #404040;
          font-size: 13px;
        }

        .return-due-box.warning {
          background: #fffbeb;
          color: #b45309;
        }

        .return-due-box.danger {
          background: #fff1f2;
          color: #e11d48;
        }

        .return-due-box.success {
          background: #ecfdf5;
          color: #047857;
        }

        .return-due-label {
          font-size: 11px;
          opacity: 0.85;
        }

        .return-purpose {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
          font-size: 13px;
        }

        .return-modal-content {
          border: 1px solid #e4e4e4;
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        }

        .return-modal-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #fffbeb;
          color: #b45309;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin: 0 auto 14px;
        }

        .return-modal-summary {
          margin: 20px 0;
          padding: 12px 14px;
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          background: #fafafa;
          text-align: left;
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
   RETURN CARD
========================================================= */

function ReturnCard({
  item,
  formatDate,
  onReturn,
  onPhotos,
}: {
  item: ReturnItem;
  formatDate: (
    date: string
  ) => string;
  onReturn: () => void;
  onPhotos: () => void;
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
    <div
      className={`return-card ${
        isOverdue ? "is-overdue" : ""
      }`}
    >

      <div className="row align-items-center g-3">

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

            <div className="return-due-label">
              กำหนดคืน
            </div>

            <div className="fw-semibold">
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

        <div className="col-12 col-lg-auto d-flex gap-2">

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary px-3"
            onClick={onPhotos}
          >
            <i className="bi bi-images me-2" />
            รูปภาพ
          </button>

          <button
            type="button"
            className={`btn btn-sm ${
              isOverdue
                ? "btn-danger"
                : "btn-primary"
            } px-3`}
            onClick={onReturn}
          >
            <i className="bi bi-arrow-return-left me-2" />

            คืนครุภัณฑ์
          </button>

        </div>

      </div>

      {/* PURPOSE */}

      {item.purpose && (
        <div className="return-purpose">

          <span className="text-secondary">
            วัตถุประสงค์ในการยืม:{" "}
          </span>

          <span>
            {item.purpose}
          </span>

        </div>
      )}

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
  const config: Record<
    ReturnStatus,
    { text: string; tone: Tone }
  > = {
    approved: {
      text: "อนุมัติแล้ว",
      tone: "purple",
    },

    borrowed: {
      text: "กำลังยืม",
      tone: "blue",
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
   CONFIRM MODAL
========================================================= */

function ReturnConfirmModal({
  item,
  loading,
  formatDate,
  onCancel,
  onConfirm,
  photos,
  onPhotosChange,
  uploadProgress,
}: {
  item: ReturnItem;
  loading: boolean;
  formatDate: (
    date: string
  ) => string;
  onCancel: () => void;
  onConfirm: () => void;
  photos: PickedPhoto[];
  onPhotosChange: (photos: PickedPhoto[]) => void;
  uploadProgress: UploadProgress | null;
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

        <div className="modal-content return-modal-content">

          <div className="modal-body p-4 text-center">

            <div className="return-modal-icon">
              <i className="bi bi-question-lg" />
            </div>

            <h4 className="fw-semibold fs-5 mb-2">
              ยืนยันการคืนครุภัณฑ์?
            </h4>

            <p className="text-secondary small mb-0">
              คุณต้องการคืนครุภัณฑ์รายการนี้ใช่หรือไม่
            </p>

            <div className="return-modal-summary">

              <div className="fw-semibold">
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

            <div className="mb-3">
              <PhotoPicker
                value={photos}
                onChange={onPhotosChange}
                disabled={loading}
                progress={uploadProgress}
              />
            </div>

            <div className="d-flex gap-2">

              <button
                type="button"
                className="btn btn-outline-secondary flex-fill"
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
