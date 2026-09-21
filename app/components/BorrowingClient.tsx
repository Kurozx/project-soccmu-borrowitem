"use client";

import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import UserNavbar from "@/app/components/UserNavbar";

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

      setReturningItem(null);

      await Swal.fire({
        icon: "success",
        title: "คืนครุภัณฑ์สำเร็จ",
        text: "ระบบบันทึกการคืนครุภัณฑ์เรียบร้อยแล้ว",
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

  const getStatusClass = (
    status: BorrowingItem["status"]
  ) => {
    switch (status) {
      case "approved":
        return "status-approved";

      case "borrowed":
        return "status-borrowed";

      case "overdue":
        return "status-overdue";

      case "pending":
        return "status-pending";

      default:
        return "status-default";
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
        <div className="borrowing-page">
          {/* =========================
              Header
          ========================= */}
          <div className="page-header">
            <div>
              <div className="breadcrumb-text">
                หน้าหลัก / รายการยืมของฉัน
              </div>

              <h1>
                <i className="bi bi-journal-check me-2"></i>
                รายการยืมของฉัน
              </h1>

              <p>
                ตรวจสอบรายการครุภัณฑ์ที่กำลังยืม
                และดำเนินการคืนครุภัณฑ์
              </p>
            </div>

            <Link
              href="/equipment"
              className="btn btn-purple"
            >
              <i className="bi bi-plus-circle me-2"></i>
              ยืมครุภัณฑ์เพิ่มเติม
            </Link>
          </div>

          {/* =========================
              Summary
          ========================= */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-4">
              <div className="summary-card">
                <div className="summary-icon purple">
                  <i className="bi bi-box-seam"></i>
                </div>

                <div>
                  <div className="summary-label">
                    รายการที่กำลังยืม
                  </div>

                  <div className="summary-value">
                    {totalItems}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="summary-card">
                <div className="summary-icon blue">
                  <i className="bi bi-clock-history"></i>
                </div>

                <div>
                  <div className="summary-label">
                    กำลังยืม
                  </div>

                  <div className="summary-value">
                    {borrowedItems}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="summary-card">
                <div className="summary-icon red">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>

                <div>
                  <div className="summary-label">
                    เกินกำหนด
                  </div>

                  <div className="summary-value">
                    {overdueItems}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              Warning
          ========================= */}
          {overdueItems > 0 && (
            <div className="alert alert-danger custom-alert mb-4">
              <div className="d-flex align-items-start">
                <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>

                <div>
                  <strong>
                    มีรายการครุภัณฑ์เกินกำหนด
                  </strong>

                  <div className="mt-1">
                    กรุณาดำเนินการคืนครุภัณฑ์
                    ที่เกินกำหนดโดยเร็วที่สุด
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================
              Empty State
          ========================= */}
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
                className="btn btn-purple"
              >
                <i className="bi bi-search me-2"></i>
                ดูครุภัณฑ์
              </Link>
            </div>
          ) : (
            <>
              {/* =========================
                  Section Title
              ========================= */}
              <div className="section-title">
                <div>
                  <h2>
                    <i className="bi bi-list-check me-2"></i>
                    ครุภัณฑ์ที่กำลังยืม
                  </h2>

                  <p>
                    รายการครุภัณฑ์ที่อยู่ภายใต้บัญชีของคุณ
                  </p>
                </div>

                <span className="count-badge">
                  {items.length} รายการ
                </span>
              </div>

              {/* =========================
                  Cards
              ========================= */}
              <div className="row g-4">
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

                          <span
                            className={`status-badge ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {getStatusText(item.status)}
                          </span>
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
                            className="btn btn-detail"
                            onClick={() =>
                              setSelectedItem(item)
                            }
                          >
                            <i className="bi bi-eye me-2"></i>
                            รายละเอียด
                          </button>

                          <button
                            type="button"
                            className="btn btn-return"
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
            </>
          )}

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
                <h3>
                  <i className="bi bi-info-circle me-2"></i>
                  รายละเอียดการยืม
                </h3>

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
            </div>

            <div className="modal-footer-custom">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setSelectedItem(null)
                }
              >
                ปิด
              </button>

              <button
                type="button"
                className="btn btn-return"
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
              setReturningItem(null);
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

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isReturning}
                onClick={() =>
                  setReturningItem(null)
                }
              >
                ยกเลิก
              </button>

              <button
                type="button"
                className="btn btn-return"
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
          background: #f8f7fc;
        }

        .borrowing-page {
          min-height: 100vh;
          padding: 32px;
        }

        /* =========================
           HEADER
        ========================= */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 30px;
        }

        .breadcrumb-text {
          color: #8b85a3;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .page-header h1 {
          color: #2d2540;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .page-header p {
          color: #77718a;
          margin: 0;
        }

        .btn-purple {
          background: #6f42c1;
          color: #fff;
          border: none;
          padding: 11px 20px;
          border-radius: 10px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .btn-purple:hover {
          background: #5d35a5;
          color: #fff;
          transform: translateY(-1px);
        }

        /* =========================
           SUMMARY
        ========================= */
        .summary-card {
          background: #fff;
          border-radius: 16px;
          padding: 22px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 20px rgba(43, 32, 68, 0.06);
          border: 1px solid #eeeaf7;
        }

        .summary-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
        }

        .summary-icon.purple {
          background: #eee7fb;
          color: #6f42c1;
        }

        .summary-icon.blue {
          background: #e8f1ff;
          color: #3976d3;
        }

        .summary-icon.red {
          background: #fdeaea;
          color: #dc3545;
        }

        .summary-label {
          color: #77718a;
          font-size: 14px;
          margin-bottom: 3px;
        }

        .summary-value {
          color: #302642;
          font-size: 28px;
          font-weight: 700;
        }

        /* =========================
           ALERT
        ========================= */
        .custom-alert {
          border-radius: 14px;
          border: none;
          padding: 18px 20px;
        }

        /* =========================
           SECTION
        ========================= */
        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-title h2 {
          font-size: 22px;
          font-weight: 700;
          color: #302642;
          margin: 0 0 5px;
        }

        .section-title p {
          color: #817a94;
          margin: 0;
          font-size: 14px;
        }

        .count-badge {
          background: #eee7fb;
          color: #6f42c1;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        /* =========================
           CARD
        ========================= */
        .borrowing-card {
          background: #fff;
          border-radius: 18px;
          padding: 22px;
          height: 100%;
          border: 1px solid #eeeaf7;
          box-shadow: 0 5px 20px rgba(43, 32, 68, 0.06);
          transition: all 0.2s ease;
        }

        .borrowing-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(43, 32, 68, 0.1);
        }

        .card-overdue {
          border-color: #f2b8be;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .equipment-icon {
          width: 48px;
          height: 48px;
          background: #eee7fb;
          color: #6f42c1;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .status-badge {
          padding: 6px 11px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-approved {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-borrowed {
          background: #e8f1ff;
          color: #3976d3;
        }

        .status-overdue {
          background: #fdeaea;
          color: #dc3545;
        }

        .status-pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-default {
          background: #f0eef5;
          color: #6f687b;
        }

        .equipment-info h3 {
          font-size: 19px;
          font-weight: 700;
          color: #302642;
          margin-bottom: 7px;
        }

        .equipment-code,
        .category {
          font-size: 13px;
          color: #7b748b;
          margin-bottom: 4px;
        }

        .info-list {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid #eeeaf7;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .info-box {
          min-width: 0;
        }

        .info-label {
          color: #928ba1;
          font-size: 11px;
          margin-bottom: 3px;
        }

        .info-value {
          color: #393248;
          font-size: 13px;
          font-weight: 600;
          word-break: break-word;
        }

        .info-value.danger {
          color: #dc3545;
        }

        /* =========================
           DAYS
        ========================= */
        .days-left {
          margin-top: 17px;
          padding: 12px 14px;
          border-radius: 11px;
          background: #f3f0fa;
          color: #6f42c1;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .days-left > i {
          font-size: 19px;
        }

        .days-left strong {
          display: block;
          font-size: 13px;
        }

        .days-left small {
          display: block;
          font-size: 11px;
          margin-top: 2px;
        }

        .days-overdue {
          background: #fdeaea;
          color: #dc3545;
        }

        .days-urgent {
          background: #fff4df;
          color: #b36b00;
        }

        /* =========================
           BUTTONS
        ========================= */
        .card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          margin-top: 18px;
        }

        .btn-detail,
        .btn-return {
          border-radius: 9px;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 600;
        }

        .btn-detail {
          background: #f1eef7;
          border: none;
          color: #5d536e;
        }

        .btn-detail:hover {
          background: #e5def2;
          color: #4c4260;
        }

        .btn-return {
          background: #6f42c1;
          border: none;
          color: #fff;
        }

        .btn-return:hover {
          background: #5d35a5;
          color: #fff;
        }

        .btn-return:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* =========================
           EMPTY
        ========================= */
        .empty-state {
          background: #fff;
          border-radius: 20px;
          padding: 70px 20px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(43, 32, 68, 0.05);
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: #eee7fb;
          color: #6f42c1;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          margin: 0 auto 20px;
        }

        .empty-state h3 {
          color: #302642;
          font-weight: 700;
        }

        .empty-state p {
          color: #817a94;
          margin-bottom: 20px;
        }

        /* =========================
           MODAL
        ========================= */
        .modal-backdrop-custom {
          position: fixed;
          inset: 0;
          background: rgba(32, 25, 45, 0.58);
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
          border-radius: 20px;
          box-shadow: 0 20px 70px rgba(0, 0, 0, 0.2);
        }

        .modal-header-custom {
          padding: 20px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #eeeaf7;
        }

        .modal-header-custom h3 {
          margin: 0;
          color: #302642;
          font-size: 19px;
        }

        .modal-header-custom small {
          color: #8b8497;
        }

        .modal-close {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 9px;
          background: #f1eef7;
          color: #665c75;
        }

        .modal-body-custom {
          padding: 24px;
        }

        .modal-footer-custom {
          padding: 16px 22px;
          border-top: 1px solid #eeeaf7;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .detail-equipment {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f7f5fb;
          border-radius: 14px;
          margin-bottom: 20px;
        }

        .detail-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: #eee7fb;
          color: #6f42c1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .detail-equipment h4 {
          margin: 0 0 4px;
          font-size: 17px;
          color: #302642;
        }

        .detail-equipment span {
          color: #817a94;
          font-size: 13px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .purpose-box {
          margin-top: 20px;
          background: #f8f7fc;
          padding: 16px;
          border-radius: 12px;
        }

        .purpose-box strong {
          color: #433953;
          font-size: 14px;
        }

        .purpose-box p {
          margin: 8px 0 0;
          color: #6f687b;
          font-size: 14px;
          line-height: 1.6;
        }

        /* =========================
           RETURN MODAL
        ========================= */
        .return-modal {
          max-width: 450px;
          text-align: center;
          padding: 35px 30px 30px;
        }

        .return-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 18px;
          border-radius: 50%;
          background: #eee7fb;
          color: #6f42c1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }

        .return-modal h3 {
          color: #302642;
          font-size: 21px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .return-modal p {
          color: #77718a;
          margin-bottom: 3px;
        }

        .return-equipment-name {
          color: #6f42c1;
          font-size: 17px;
        }

        .confirm-note {
          margin-top: 18px;
          background: #f5f1fc;
          color: #6d6380;
          border-radius: 10px;
          padding: 12px;
          font-size: 12px;
          text-align: left;
        }

        .modal-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 24px;
        }

        .modal-actions .btn {
          min-width: 120px;
        }

        /* =========================
           FOOTER
        ========================= */
        .borrowing-footer {
          margin-top: 50px;
          padding: 24px 0 10px;
          border-top: 1px solid #e7e2ef;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: #8b8497;
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

          .borrowing-page {
            padding: 22px 16px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .page-header h1 {
            font-size: 26px;
          }

          .btn-purple {
            width: 100%;
            text-align: center;
          }
        }

        @media (max-width: 575.98px) {
          .summary-card {
            padding: 17px;
          }

          .section-title {
            align-items: flex-start;
            gap: 10px;
            flex-direction: column;
          }

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

          .return-modal {
            padding: 28px 20px 24px;
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
    </div>
  );
}