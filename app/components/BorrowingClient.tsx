"use client";

import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
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

type BorrowingItem = {
  id: number;
  borrowId: string;
  equipmentCode: string;
  name: string;
  category: string;
  location: string;
  borrowDate: string;
  returnDate: string;
  purpose: string;
  quantity: number;
  status:
    | "pending"
    | "approved"
    | "borrowed"
    | "returned"
    | "rejected"
    | "overdue";
  daysLeft: number;
};

type BorrowingClientProps = {
  items: BorrowingItem[];
};

export default function BorrowingClient({
  items: initialItems,
}: BorrowingClientProps) {
  const [items, setItems] = useState<BorrowingItem[]>(initialItems);

  const [selectedItem, setSelectedItem] =
    useState<BorrowingItem | null>(null);

  const [returningItem, setReturningItem] =
    useState<BorrowingItem | null>(null);

  const [isReturning, setIsReturning] = useState(false);

  // รูปสภาพครุภัณฑ์ตอนคืน (แนบก่อนยืนยัน อัปโหลดหลังคืนสำเร็จ)
  const [returnPhotos, setReturnPhotos] = useState<PickedPhoto[]>([]);
  const [uploadProgress, setUploadProgress] =
    useState<UploadProgress | null>(null);

  const closeReturnModal = () => {
    releasePhotos(returnPhotos);
    setReturnPhotos([]);
    setReturningItem(null);
  };

  // =========================
  // Format วันที่
  // =========================
  const formatDate = (date: string) => {
    const d = new Date(date);

    return d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    const d = new Date(date);

    return d.toLocaleString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================
  // คืนอุปกรณ์
  // =========================
  const handleReturn = async () => {
    if (!returningItem) return;

    try {
      setIsReturning(true);

      const response = await fetch(
        `/api/borrowing/${returningItem.id}/return`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "ไม่สามารถคืนครุภัณฑ์ได้"
        );
      }

      // เอารายการออกจากรายการกำลังยืม
      setItems((currentItems) =>
        currentItems.filter(
          (item) => item.id !== returningItem.id
        )
      );

      const photoSummary = await uploadPhotos(
        returningItem.id,
        "return",
        returnPhotos,
        setUploadProgress
      );

      setUploadProgress(null);
      closeReturnModal();

      const photoFailure = photoFailureText(photoSummary);

      await Swal.fire({
        icon: photoFailure ? "warning" : "success",
        title: "คืนครุภัณฑ์สำเร็จ",
        text: photoFailure
          ? `ระบบบันทึกการคืนครุภัณฑ์เรียบร้อยแล้ว ${photoFailure}`
          : "ระบบบันทึกการคืนครุภัณฑ์เรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#6f42c1",
      });
    } catch (error) {
      console.error("RETURN ERROR:", error);

      await Swal.fire({
        icon: "error",
        title: "คืนครุภัณฑ์ไม่สำเร็จ",
        text:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#6f42c1",
      });
    } finally {
      setIsReturning(false);
      setUploadProgress(null);
    }
  };

  // =========================
  // สถานะ
  // =========================
  const getStatusText = (
    status: BorrowingItem["status"]
  ) => {
    switch (status) {
      case "approved":
        return "อนุมัติแล้ว";

      case "borrowed":
        return "กำลังยืม";

      case "overdue":
        return "เกินกำหนด";

      case "pending":
        return "รออนุมัติ";

      case "returned":
        return "คืนแล้ว";

      case "rejected":
        return "ไม่อนุมัติ";

      default:
        return status;
    }
  };

  const getStatusTone = (
    status: BorrowingItem["status"]
  ): Tone => {
    switch (status) {
      case "approved":
        return "purple";

      case "borrowed":
        return "blue";

      case "overdue":
        return "rose";

      case "pending":
        return "amber";

      default:
        return "neutral";
    }
  };

  // =========================
  // จำนวนสถานะ
  // =========================
  const totalItems = items.length;

  const borrowedItems = items.filter(
    (item) =>
      item.status === "borrowed" ||
      item.status === "approved"
  ).length;

  const overdueItems = items.filter(
    (item) => item.status === "overdue"
  ).length;

  // =========================
  // Render
  // =========================
  return (
    <>
      {/* =========================
          USER SIDEBAR
      ========================= */}
      <UserNavbar />

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="borrowing-main-content">
        <div className="ui-page">
          <PageHeader
            eyebrow="การยืม"
            title="รายการยืมของฉัน"
            description="ตรวจสอบรายการครุภัณฑ์ที่กำลังยืม และดำเนินการคืนครุภัณฑ์"
            actions={
              <Link
                href="/equipment"
                className="btn btn-primary btn-sm"
              >
                <i className="bi bi-plus-circle me-2"></i>
                ยืมครุภัณฑ์เพิ่มเติม
              </Link>
            }
          />

          {/* =========================
              Summary
          ========================= */}
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <StatCard
                label="รายการที่กำลังยืม"
                value={totalItems}
                icon="bi-box-seam"
                tone="purple"
              />
            </div>

            <div className="col-12 col-md-4">
              <StatCard
                label="กำลังยืม"
                value={borrowedItems}
                icon="bi-clock-history"
                tone="blue"
              />
            </div>

            <div className="col-12 col-md-4">
              <StatCard
                label="เกินกำหนด"
                value={overdueItems}
                icon="bi-exclamation-triangle"
                tone="rose"
              />
            </div>
          </div>

          {/* =========================
              Warning
          ========================= */}
          {overdueItems > 0 && (
            <div className="overdue-alert">
              <i className="bi bi-exclamation-triangle-fill"></i>

              <div>
                <strong>
                  มีรายการครุภัณฑ์เกินกำหนด
                </strong>

                <div>
                  กรุณาดำเนินการคืนครุภัณฑ์
                  ที่เกินกำหนดโดยเร็วที่สุด
                </div>
              </div>
            </div>
          )}

          {/* =========================
              List
          ========================= */}
          <Panel
            title="ครุภัณฑ์ที่กำลังยืม"
            description="รายการครุภัณฑ์ที่อยู่ภายใต้บัญชีของคุณ"
            action={
              items.length > 0 ? (
                <Pill tone="purple">
                  {items.length} รายการ
                </Pill>
              ) : undefined
            }
          >
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="bi bi-inbox"></i>
                </div>

                <h3>
                  ไม่มีรายการที่กำลังยืม
                </h3>

                <p>
                  ขณะนี้คุณไม่มีรายการครุภัณฑ์ที่กำลังยืม
                </p>

                <Link
                  href="/equipment"
                  className="btn btn-primary btn-sm"
                >
                  <i className="bi bi-search me-2"></i>
                  ดูครุภัณฑ์
                </Link>
              </div>
            ) : (
              <div className="row g-3">
                {items.map((item) => {
                  const isOverdue =
                    item.status === "overdue" ||
                    item.daysLeft < 0;

                  const isUrgent =
                    !isOverdue &&
                    item.daysLeft >= 0 &&
                    item.daysLeft <= 2;

                  return (
                    <div
                      className="col-12 col-md-6 col-xl-4"
                      key={item.id}
                    >
                      <div
                        className={`borrowing-card ${
                          isOverdue
                            ? "card-overdue"
                            : ""
                        }`}
                      >
                        {/* Card Header */}
                        <div className="card-top">
                          <div className="equipment-icon">
                            <i className="bi bi-laptop"></i>
                          </div>

                          <Pill
                            tone={getStatusTone(
                              item.status
                            )}
                          >
                            {getStatusText(item.status)}
                          </Pill>
                        </div>

                        {/* Equipment */}
                        <div className="equipment-info">
                          <h3>{item.name}</h3>

                          <div className="equipment-code">
                            <i className="bi bi-upc-scan me-1"></i>
                            {item.equipmentCode}
                          </div>

                          <div className="category">
                            <i className="bi bi-tag me-1"></i>
                            {item.category}
                          </div>
                        </div>

                        {/* Information */}
                        <div className="info-list">
                          <InfoBox
                            icon="bi-calendar-check"
                            label="วันที่ยืม"
                            value={formatDate(
                              item.borrowDate
                            )}
                          />

                          <InfoBox
                            icon="bi-calendar-event"
                            label="กำหนดคืน"
                            value={formatDate(
                              item.returnDate
                            )}
                            danger={isOverdue}
                          />

                          <InfoBox
                            icon="bi-box-seam"
                            label="จำนวน"
                            value={`${item.quantity} ชิ้น`}
                          />

                          <InfoBox
                            icon="bi-geo-alt"
                            label="สถานที่"
                            value={item.location}
                          />
                        </div>

                        {/* Days Left */}
                        <div
                          className={`days-left ${
                            isOverdue
                              ? "days-overdue"
                              : isUrgent
                              ? "days-urgent"
                              : ""
                          }`}
                        >
                          <i
                            className={`bi ${
                              isOverdue
                                ? "bi-exclamation-circle-fill"
                                : "bi-clock-fill"
                            }`}
                          ></i>

                          <div>
                            {isOverdue ? (
                              <>
                                <strong>
                                  เกินกำหนด{" "}
                                  {Math.abs(
                                    item.daysLeft
                                  )}{" "}
                                  วัน
                                </strong>

                                <small>
                                  กรุณาคืนโดยเร็วที่สุด
                                </small>
                              </>
                            ) : item.daysLeft === 0 ? (
                              <>
                                <strong>
                                  ครบกำหนดวันนี้
                                </strong>

                                <small>
                                  กรุณาคืนภายในวันนี้
                                </small>
                              </>
                            ) : (
                              <>
                                <strong>
                                  เหลือ{" "}
                                  {item.daysLeft} วัน
                                </strong>

                                <small>
                                  ก่อนถึงกำหนดคืน
                                </small>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="card-actions">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              setSelectedItem(item)
                            }
                          >
                            <i className="bi bi-eye me-2"></i>
                            รายละเอียด
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                              setReturningItem(item)
                            }
                          >
                            <i className="bi bi-arrow-return-left me-2"></i>
                            คืนครุภัณฑ์
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* =========================
              Footer
          ========================= */}
          <footer className="borrowing-footer">
            <div>
              ระบบยืม–คืนครุภัณฑ์
              คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
            </div>

            <div>
              © {new Date().getFullYear()} Equipment
              Borrowing System
            </div>
          </footer>
        </div>
      </main>

      {/* =================================================
          DETAIL MODAL
      ================================================= */}
      {selectedItem && (
        <div
          className="modal-backdrop-custom"
          style={{ zIndex: 2000 }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="custom-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom">
              <div>
                <h3>รายละเอียดการยืม</h3>

                <small>
                  {selectedItem.borrowId}
                </small>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setSelectedItem(null)
                }
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body-custom">
              <div className="detail-equipment">
                <div className="detail-icon">
                  <i className="bi bi-laptop"></i>
                </div>

                <div>
                  <h4>
                    {selectedItem.name}
                  </h4>

                  <span>
                    {selectedItem.equipmentCode}
                  </span>
                </div>
              </div>

              <div className="detail-grid">
                <InfoBox
                  icon="bi-tag"
                  label="ประเภท"
                  value={selectedItem.category}
                />

                <InfoBox
                  icon="bi-box-seam"
                  label="จำนวน"
                  value={`${selectedItem.quantity} ชิ้น`}
                />

                <InfoBox
                  icon="bi-calendar-check"
                  label="วันที่ยืม"
                  value={formatDateTime(
                    selectedItem.borrowDate
                  )}
                />

                <InfoBox
                  icon="bi-calendar-event"
                  label="กำหนดคืน"
                  value={formatDateTime(
                    selectedItem.returnDate
                  )}
                  danger={
                    selectedItem.daysLeft < 0
                  }
                />

                <InfoBox
                  icon="bi-geo-alt"
                  label="สถานที่"
                  value={selectedItem.location}
                />
              </div>

              <div className="purpose-box">
                <strong>
                  <i className="bi bi-chat-left-text me-2"></i>
                  วัตถุประสงค์การยืม
                </strong>

                <p>
                  {selectedItem.purpose}
                </p>
              </div>

              <BorrowingPhotos
                borrowingId={selectedItem.id}
                uploadKinds={["borrow"]}
                allowDelete
              />
            </div>

            <div className="modal-footer-custom">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() =>
                  setSelectedItem(null)
                }
              >
                ปิด
              </button>

              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setSelectedItem(null);
                  setReturningItem(selectedItem);
                }}
              >
                <i className="bi bi-arrow-return-left me-2"></i>
                คืนครุภัณฑ์
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          RETURN CONFIRM MODAL
      ================================================= */}
      {returningItem && (
        <div
          className="modal-backdrop-custom"
          style={{ zIndex: 2100 }}
          onClick={() => {
            if (!isReturning) {
              closeReturnModal();
            }
          }}
        >
          <div
            className="custom-modal return-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="return-icon">
              <i className="bi bi-arrow-return-left"></i>
            </div>

            <h3>
              ยืนยันการคืนครุภัณฑ์
            </h3>

            <p>
              คุณต้องการคืน
            </p>

            <strong className="return-equipment-name">
              {returningItem.name}
            </strong>

            <p className="text-muted mt-2">
              รหัสครุภัณฑ์:{" "}
              {returningItem.equipmentCode}
            </p>

            <div className="confirm-note">
              <i className="bi bi-info-circle me-2"></i>
              เมื่อยืนยันแล้ว ระบบจะบันทึกการคืน
              และเพิ่มจำนวนครุภัณฑ์ที่พร้อมใช้งาน
            </div>

            <div className="mt-3">
              <PhotoPicker
                value={returnPhotos}
                onChange={setReturnPhotos}
                disabled={isReturning}
                progress={uploadProgress}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={isReturning}
                onClick={closeReturnModal}
              >
                ยกเลิก
              </button>

              <button
                type="button"
                className="btn btn-primary"
                disabled={isReturning}
                onClick={handleReturn}
              >
                {isReturning ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    ยืนยันคืน
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          STYLE
      ================================================= */}
      <style jsx>{`
        /* =========================
           MAIN LAYOUT
        ========================= */
        .borrowing-main-content {
          margin-left: 270px;
          min-height: 100vh;
          transition: margin-left 0.25s ease;
          background: #fafafa;
        }

        /* =========================
           ALERT
        ========================= */
        .overdue-alert {
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

        .overdue-alert > i {
          font-size: 18px;
          color: #e11d48;
          line-height: 1.3;
        }

        .overdue-alert strong {
          display: block;
          margin-bottom: 2px;
        }

        /* =========================
           CARD
        ========================= */
        .borrowing-card {
          background: #fff;
          border-radius: 12px;
          padding: 18px;
          height: 100%;
          border: 1px solid #e4e4e4;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          transition: box-shadow 0.15s ease;
        }

        .borrowing-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .card-overdue {
          border-color: #fecdd3;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .equipment-icon {
          width: 40px;
          height: 40px;
          background: #f3efff;
          color: #6f42c1;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .equipment-info h3 {
          font-size: 15px;
          font-weight: 600;
          color: #171717;
          margin-bottom: 6px;
        }

        .equipment-code,
        .category {
          font-size: 12px;
          color: #737373;
          margin-bottom: 2px;
        }

        .info-list {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #f0f0f0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* =========================
           DAYS
        ========================= */
        .days-left {
          margin-top: 14px;
          padding: 10px 12px;
          border-radius: 8px;
          background: #f5f5f5;
          color: #404040;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .days-left > i {
          font-size: 16px;
        }

        .days-left strong {
          display: block;
          font-size: 13px;
          font-weight: 600;
        }

        .days-left small {
          display: block;
          font-size: 11px;
          margin-top: 1px;
          opacity: 0.85;
        }

        .days-overdue {
          background: #fff1f2;
          color: #e11d48;
        }

        .days-urgent {
          background: #fffbeb;
          color: #b45309;
        }

        /* =========================
           BUTTONS
        ========================= */
        .card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 14px;
        }

        /* =========================
           EMPTY
        ========================= */
        .empty-state {
          padding: 48px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          background: #f5f5f5;
          color: #737373;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin: 0 auto 14px;
        }

        .empty-state h3 {
          color: #171717;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .empty-state p {
          color: #737373;
          font-size: 13px;
          margin-bottom: 16px;
        }

        /* =========================
           MODAL
        ========================= */
        .modal-backdrop-custom {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .custom-modal {
          width: 100%;
          max-width: 620px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          background: #fff;
          border: 1px solid #e4e4e4;
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        }

        .modal-header-custom {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e4e4e4;
        }

        .modal-header-custom h3 {
          margin: 0;
          color: #171717;
          font-size: 16px;
          font-weight: 600;
        }

        .modal-header-custom small {
          color: #737373;
          font-size: 12px;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #737373;
        }

        .modal-close:hover {
          background: #f5f5f5;
          color: #171717;
        }

        .modal-body-custom {
          padding: 20px;
        }

        .modal-footer-custom {
          padding: 14px 20px;
          border-top: 1px solid #e4e4e4;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .detail-equipment {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border: 1px solid #e4e4e4;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .detail-icon {
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

        .detail-equipment h4 {
          margin: 0 0 2px;
          font-size: 15px;
          font-weight: 600;
          color: #171717;
        }

        .detail-equipment span {
          color: #737373;
          font-size: 12px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .purpose-box {
          margin-top: 20px;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          padding: 14px;
          border-radius: 8px;
        }

        .purpose-box strong {
          color: #171717;
          font-size: 13px;
          font-weight: 600;
        }

        .purpose-box p {
          margin: 6px 0 0;
          color: #525252;
          font-size: 14px;
          line-height: 1.6;
        }

        /* =========================
           RETURN MODAL
        ========================= */
        .return-modal {
          max-width: 440px;
          text-align: center;
          padding: 28px 24px 24px;
        }

        .return-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 14px;
          border-radius: 12px;
          background: #f3efff;
          color: #6f42c1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .return-modal h3 {
          color: #171717;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .return-modal p {
          color: #737373;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .return-equipment-name {
          color: #171717;
          font-size: 16px;
          font-weight: 600;
        }

        .confirm-note {
          margin-top: 16px;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          color: #525252;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 12px;
          text-align: left;
        }

        .modal-actions {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .modal-actions .btn {
          min-width: 120px;
        }

        /* =========================
           FOOTER
        ========================= */
        .borrowing-footer {
          margin-top: 12px;
          padding-top: 16px;
          border-top: 1px solid #e4e4e4;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: #737373;
          font-size: 12px;
        }

        /* =========================
           MOBILE
        ========================= */
        @media (max-width: 991.98px) {
          .borrowing-main-content {
            margin-left: 0 !important;
            padding-top: 64px;
          }
        }

        @media (max-width: 575.98px) {
          .info-list {
            grid-template-columns: 1fr;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .card-actions {
            grid-template-columns: 1fr;
          }

          .borrowing-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}

/* =================================================
   INFO BOX
================================================= */

function InfoBox({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: string;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="info-box">
      <div className="info-label">
        <i className={`bi ${icon} me-1`}></i>
        {label}
      </div>

      <div
        className={`info-value ${
          danger ? "danger" : ""
        }`}
      >
        {value}
      </div>

      <style jsx>{`
        .info-box {
          min-width: 0;
        }

        .info-label {
          color: #737373;
          font-size: 11px;
          margin-bottom: 2px;
        }

        .info-value {
          color: #171717;
          font-size: 13px;
          font-weight: 500;
          word-break: break-word;
        }

        .info-value.danger {
          color: #e11d48;
        }
      `}</style>
    </div>
  );
}
