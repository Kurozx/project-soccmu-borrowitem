"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import AdminNavbar from "@/app/components/AdminNavbar";
import {
  PageHeader,
  Panel,
  Pill,
  StatCard,
  Toolbar,
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

type BorrowStatus =
  | "รออนุมัติ"
  | "กำลังยืม"
  | "คืนแล้ว"
  | "เกินกำหนด"
  | "ยกเลิก";

type BorrowAction = "approve" | "reject" | "return";

type BorrowItem = {
  id: number;
  borrowId: string;
  borrower: string;
  email: string;
  equipmentName: string;
  equipmentCode: string;
  category: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  quantity: number;
  purpose: string;
  note: string;
  status: BorrowStatus;
};

const canApprove = (s: BorrowStatus) => s === "รออนุมัติ";
const canReturn = (s: BorrowStatus) =>
  s === "กำลังยืม" || s === "เกินกำหนด";
const canCancel = (s: BorrowStatus) =>
  canApprove(s) || canReturn(s);

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function fetchBorrowings(): Promise<BorrowItem[]> {
  const res = await fetch("/api/admin/borrowings", {
    cache: "no-store",
  });

  const result = await res.json().catch(() => null);

  if (!res.ok || !result?.success) {
    throw new Error(
      result?.message || "ไม่สามารถดึงข้อมูลรายการยืมได้"
    );
  }

  return result.data as BorrowItem[];
}

const ACTION_CONFIRM: Record<
  BorrowAction,
  {
    title: string;
    confirmText: string;
    icon: "question" | "warning";
    success: string;
  }
> = {
  approve: {
    title: "ยืนยันการอนุมัติ?",
    confirmText: "ยืนยันอนุมัติ",
    icon: "question",
    success: "อนุมัติการยืมสำเร็จ",
  },
  reject: {
    title: "ต้องการยกเลิกรายการ?",
    confirmText: "ยกเลิกรายการ",
    icon: "warning",
    success: "ยกเลิกรายการสำเร็จ",
  },
  return: {
    title: "ยืนยันการรับคืนครุภัณฑ์?",
    confirmText: "บันทึกการคืน",
    icon: "question",
    success: "บันทึกการคืนสำเร็จ",
  },
};

export default function AdminBorrowingPage() {
  const [items, setItems] = useState<BorrowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingId, setSubmittingId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ทั้งหมด");

  const [selectedItem, setSelectedItem] =
    useState<BorrowItem | null>(null);

  const [showModal, setShowModal] =
    useState(false);

  // ยืนยันรับคืน (แนบรูปสภาพตอนคืนได้)
  const [returnTarget, setReturnTarget] =
    useState<BorrowItem | null>(null);
  const [returnPhotos, setReturnPhotos] =
    useState<PickedPhoto[]>([]);
  const [uploadProgress, setUploadProgress] =
    useState<UploadProgress | null>(null);

  const closeReturnModal = () => {
    releasePhotos(returnPhotos);
    setReturnPhotos([]);
    setReturnTarget(null);
  };

  /* =========================================================
     LOAD
  ========================================================= */

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setItems(await fetchBorrowings());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาด"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadItems();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadItems]);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const keyword = search.toLowerCase().trim();

      const matchSearch =
        !keyword ||
        item.borrowId.toLowerCase().includes(keyword) ||
        item.borrower.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        item.equipmentName.toLowerCase().includes(keyword) ||
        item.equipmentCode.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "ทั้งหมด" ||
        item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const stats = {
    total: items.length,

    pending: items.filter(
      (item) => item.status === "รออนุมัติ"
    ).length,

    borrowing: items.filter(
      (item) => item.status === "กำลังยืม"
    ).length,

    returned: items.filter(
      (item) => item.status === "คืนแล้ว"
    ).length,

    overdue: items.filter(
      (item) => item.status === "เกินกำหนด"
    ).length,
  };

  /* =========================================================
     DETAIL
  ========================================================= */

  const openDetails = (item: BorrowItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeDetails = () => {
    setShowModal(false);

    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  };

  /* =========================================================
     ACTIONS (approve / reject / return)
  ========================================================= */

  const runAction = async (
    item: BorrowItem,
    action: BorrowAction
  ) => {
    if (submittingId !== null) return;

    // รับคืน → เปิดหน้าต่างยืนยันที่แนบรูปได้
    if (action === "return") {
      setReturnPhotos([]);
      setReturnTarget(item);
      return;
    }

    const config = ACTION_CONFIRM[action];

    const confirm = await Swal.fire({
      title: config.title,
      html: `
        <div>
          <strong>${escapeHtml(item.borrowId)}</strong>
          <div class="text-secondary mt-2">
            ${escapeHtml(item.borrower)}<br />
            ${escapeHtml(item.equipmentName)}
          </div>
        </div>
      `,
      icon: config.icon,
      showCancelButton: true,
      confirmButtonText: config.confirmText,
      cancelButtonText: "ปิด",
      confirmButtonColor: "#6f42c1",
    });

    if (!confirm.isConfirmed) return;

    await executeAction(item, action);
  };

  const executeAction = async (
    item: BorrowItem,
    action: BorrowAction,
    photos: PickedPhoto[] = []
  ) => {
    const config = ACTION_CONFIRM[action];

    setSubmittingId(item.id);

    try {
      const res = await fetch(
        `/api/admin/borrowings/${item.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        throw new Error(
          result?.message || "ไม่สามารถดำเนินการได้"
        );
      }

      const photoSummary = await uploadPhotos(
        item.id,
        "return",
        photos,
        setUploadProgress
      );
      const photoFailure = photoFailureText(photoSummary);

      setUploadProgress(null);
      if (action === "return") closeReturnModal();
      if (showModal) closeDetails();

      await loadItems();

      await Swal.fire({
        title: "สำเร็จ",
        text: `${result.message || config.success}${
          photoFailure ? ` ${photoFailure}` : ""
        }`,
        icon: photoFailure ? "warning" : "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#6f42c1",
      });
    } catch (err) {
      Swal.fire({
        title: "ไม่สำเร็จ",
        text:
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาด",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#6f42c1",
      });
    } finally {
      setSubmittingId(null);
      setUploadProgress(null);
    }
  };

  const busy = submittingId !== null;

  return (
    <main className="min-vh-100">

      <AdminNavbar />

      <section className="admin-page-content">

        <div className="ui-page p-0">

          {/* HEADER */}

          <PageHeader
            eyebrow="การยืม"
            title="รายการยืม–คืน"
            description="จัดการ ตรวจสอบ และติดตามรายการยืม–คืนครุภัณฑ์"
            actions={
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => void loadItems()}
                disabled={loading}
              >
                <i
                  className={`bi bi-arrow-clockwise me-2 ${loading ? "br-spin" : ""}`}
                ></i>
                รีเฟรช
              </button>
            }
          />

          {/* ERROR */}

          {error && (
            <div className="alert alert-danger br-alert mb-0">

              <div className="d-flex align-items-start gap-3">

                <i className="bi bi-exclamation-triangle fs-5"></i>

                <div>

                  <div className="fw-semibold">
                    ไม่สามารถโหลดข้อมูลรายการยืมได้
                  </div>

                  <div className="small mt-1">
                    {error}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* STATISTICS */}

          <div className="row g-3">

            <div className="col-6 col-xl">
              <StatCard
                label="รายการทั้งหมด"
                value={stats.total}
                icon="bi-list-check"
                tone="purple"
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                label="รออนุมัติ"
                value={stats.pending}
                icon="bi-hourglass-split"
                tone="amber"
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                label="กำลังยืม"
                value={stats.borrowing}
                icon="bi-box-arrow-up-right"
                tone="blue"
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                label="คืนแล้ว"
                value={stats.returned}
                icon="bi-check-circle"
                tone="emerald"
              />
            </div>

            <div className="col-12 col-xl">
              <StatCard
                label="เกินกำหนด"
                value={stats.overdue}
                icon="bi-exclamation-circle"
                tone="rose"
              />
            </div>

          </div>

          {/* FILTER */}

          <Toolbar>

            <div className="input-group br-search">

              <span className="input-group-text bg-white">
                <i className="bi bi-search text-secondary"></i>
              </span>

              <input
                type="text"
                className="form-control border-start-0"
                placeholder="ค้นหาเลขรายการ, ชื่อผู้ยืม, อีเมล หรือครุภัณฑ์..."
                aria-label="ค้นหารายการ"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSearch("")}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}

            </div>

            <select
              className="form-select w-auto"
              aria-label="สถานะ"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option>ทั้งหมด</option>
              <option>รออนุมัติ</option>
              <option>กำลังยืม</option>
              <option>คืนแล้ว</option>
              <option>เกินกำหนด</option>
              <option>ยกเลิก</option>
            </select>

            <small className="text-secondary ms-auto">
              แสดง {filteredItems.length} จาก{" "}
              {items.length} รายการ
            </small>

          </Toolbar>

          {/* TABLE */}

          <Panel
            flush
            title="รายการยืม–คืนทั้งหมด"
            description="ตรวจสอบสถานะและรายละเอียดการยืมครุภัณฑ์"
            action={
              <Pill tone="neutral">
                {filteredItems.length} รายการ
              </Pill>
            }
          >

            <div className="table-responsive">

              <table className="table align-middle ui-table br-table">

                <thead>

                  <tr>
                    <th>รายการ</th>
                    <th>ผู้ยืม</th>
                    <th>ครุภัณฑ์</th>
                    <th>วันที่ยืม</th>
                    <th>กำหนดคืน</th>
                    <th>สถานะ</th>
                    <th className="text-end">จัดการ</th>
                  </tr>

                </thead>

                <tbody>

                  {loading && items.length === 0 ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="text-center py-5"
                      >

                        <div className="spinner-border spinner-border-sm text-secondary"></div>

                        <div className="text-secondary small mt-2">
                          กำลังโหลดข้อมูล...
                        </div>

                      </td>

                    </tr>

                  ) : filteredItems.length === 0 ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="text-center py-5"
                      >

                        <i className="bi bi-search fs-3 text-secondary"></i>

                        <div className="fw-semibold mt-2">
                          ไม่พบรายการ
                        </div>

                        <small className="text-secondary">
                          {items.length === 0
                            ? "ยังไม่มีรายการยืมในระบบ"
                            : "ลองเปลี่ยนคำค้นหาหรือตัวกรอง"}
                        </small>

                      </td>

                    </tr>

                  ) : (

                    filteredItems.map((item) => (

                      <tr key={item.id}>

                        {/* ID */}

                        <td>

                          <div className="fw-semibold">
                            {item.borrowId}
                          </div>

                          <small className="text-secondary">
                            {item.category}
                          </small>

                        </td>

                        {/* USER */}

                        <td>

                          <div className="d-flex align-items-center gap-2">

                            <div className="br-icon tone-neutral">
                              <i className="bi bi-person-fill"></i>
                            </div>

                            <div>

                              <div className="fw-semibold">
                                {item.borrower}
                              </div>

                              <small className="text-secondary">
                                {item.email}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* EQUIPMENT */}

                        <td>

                          <div className="d-flex align-items-center gap-2">

                            <div className="br-icon tone-purple">
                              <i className="bi bi-box-seam"></i>
                            </div>

                            <div>

                              <div className="fw-semibold">
                                {item.equipmentName}
                              </div>

                              <small className="text-secondary">
                                {item.equipmentCode}
                                {item.quantity > 1
                                  ? ` · ${item.quantity} ชิ้น`
                                  : ""}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* BORROW DATE */}

                        <td>
                          {formatDate(item.borrowDate)}
                        </td>

                        {/* DUE DATE */}

                        <td>

                          <span
                            className={
                              item.status === "เกินกำหนด"
                                ? "text-danger fw-semibold"
                                : ""
                            }
                          >
                            {formatDate(item.dueDate)}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td>
                          <StatusBadge status={item.status} />
                        </td>

                        {/* ACTION */}

                        <td className="text-end">

                          <div className="dropdown">

                            <button
                              type="button"
                              className="btn btn-sm br-action"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                              disabled={submittingId === item.id}
                            >
                              {submittingId === item.id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className="bi bi-three-dots"></i>
                              )}
                            </button>

                            <ul className="dropdown-menu dropdown-menu-end br-menu">

                              <li>

                                <button
                                  type="button"
                                  className="dropdown-item"
                                  onClick={() =>
                                    openDetails(item)
                                  }
                                >
                                  <i className="bi bi-eye me-2"></i>
                                  ดูรายละเอียด
                                </button>

                              </li>

                              {canCancel(item.status) && (
                                <li>
                                  <hr className="dropdown-divider" />
                                </li>
                              )}

                              {canApprove(item.status) && (

                                <li>

                                  <button
                                    type="button"
                                    className="dropdown-item text-success"
                                    disabled={busy}
                                    onClick={() =>
                                      runAction(item, "approve")
                                    }
                                  >
                                    <i className="bi bi-check-circle me-2"></i>
                                    อนุมัติการยืม
                                  </button>

                                </li>

                              )}

                              {canReturn(item.status) && (

                                <li>

                                  <button
                                    type="button"
                                    className="dropdown-item text-success"
                                    disabled={busy}
                                    onClick={() =>
                                      runAction(item, "return")
                                    }
                                  >
                                    <i className="bi bi-box-arrow-in-down-left me-2"></i>
                                    รับคืนครุภัณฑ์
                                  </button>

                                </li>

                              )}

                              {canCancel(item.status) && (

                                <li>

                                  <button
                                    type="button"
                                    className="dropdown-item text-danger"
                                    disabled={busy}
                                    onClick={() =>
                                      runAction(item, "reject")
                                    }
                                  >
                                    <i className="bi bi-x-circle me-2"></i>
                                    ยกเลิกรายการ
                                  </button>

                                </li>

                              )}

                            </ul>

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

            {/* FOOTER */}

            <div className="br-footer">

              <small className="text-secondary">
                แสดง {filteredItems.length} รายการ
                จากทั้งหมด {items.length} รายการ
              </small>

              <small className="text-secondary">
                ระบบยืม–คืนครุภัณฑ์
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
              </small>

            </div>

          </Panel>

        </div>

      </section>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {showModal && selectedItem && (

        <div
          className="modal fade show d-block br-modal-backdrop"
          tabIndex={-1}
          onClick={closeDetails}
        >

          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-content br-modal">

              <div className="modal-header px-4 py-3">

                <div>

                  <small className="text-secondary">
                    รายละเอียดรายการ
                  </small>

                  <h5 className="modal-title fw-bold mt-1">
                    {selectedItem.borrowId}
                  </h5>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDetails}
                />

              </div>

              <div className="modal-body p-4">

                {/* STATUS */}

                <div className="br-soft d-flex justify-content-between align-items-center p-3 mb-4">

                  <div>

                    <small className="text-secondary d-block">
                      สถานะรายการ
                    </small>

                    <div className="mt-1">
                      <StatusBadge
                        status={selectedItem.status}
                      />
                    </div>

                  </div>

                  <i className="bi bi-clipboard-check fs-4 text-secondary"></i>

                </div>

                {/* USER */}

                <h6 className="br-section-title">
                  <i className="bi bi-person me-2"></i>
                  ข้อมูลผู้ยืม
                </h6>

                <div className="row g-3 mb-4">

                  <InfoBox
                    label="ชื่อผู้ใช้"
                    value={selectedItem.borrower}
                  />

                  <InfoBox
                    label="อีเมล"
                    value={selectedItem.email || "-"}
                  />

                </div>

                {/* EQUIPMENT */}

                <h6 className="br-section-title">
                  <i className="bi bi-box-seam me-2"></i>
                  ข้อมูลครุภัณฑ์
                </h6>

                <div className="br-soft p-3 mb-4">

                  <div className="d-flex align-items-center gap-3">

                    <div className="br-icon lg tone-purple">
                      <i className="bi bi-box-seam"></i>
                    </div>

                    <div>

                      <div className="fw-bold">
                        {selectedItem.equipmentName}
                      </div>

                      <small className="text-secondary">
                        รหัสครุภัณฑ์:{" "}
                        {selectedItem.equipmentCode}
                        {" · "}จำนวน {selectedItem.quantity} ชิ้น
                      </small>

                      <div className="mt-1">
                        <Pill tone="neutral">
                          {selectedItem.category}
                        </Pill>
                      </div>

                    </div>

                  </div>

                </div>

                {/* BORROW INFO */}

                <h6 className="br-section-title">
                  <i className="bi bi-calendar3 me-2"></i>
                  ข้อมูลการยืม
                </h6>

                <div className="row g-3 mb-4">

                  <InfoBox
                    label="วันที่ยืม"
                    value={formatDate(selectedItem.borrowDate)}
                  />

                  <InfoBox
                    label="กำหนดคืน"
                    value={formatDate(selectedItem.dueDate)}
                  />

                  <InfoBox
                    label="วันที่คืน"
                    value={formatDate(selectedItem.returnDate)}
                  />

                  <InfoBox
                    label="วัตถุประสงค์"
                    value={selectedItem.purpose || "-"}
                  />

                </div>

                {/* NOTE */}

                {selectedItem.note && (

                  <div className="alert alert-warning br-note mb-0">

                    <i className="bi bi-info-circle me-2"></i>

                    {selectedItem.note}

                  </div>

                )}

                {/* PHOTOS */}

                <BorrowingPhotos
                  borrowingId={selectedItem.id}
                  uploadKinds={["borrow", "return"]}
                  allowDelete
                />

              </div>

              {/* FOOTER */}

              <div className="modal-footer px-4 py-3">

                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={closeDetails}
                >
                  ปิด
                </button>

                {canCancel(selectedItem.status) && (

                  <button
                    type="button"
                    className="btn btn-outline-danger px-4"
                    disabled={busy}
                    onClick={() =>
                      runAction(selectedItem, "reject")
                    }
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    ยกเลิกรายการ
                  </button>

                )}

                {canApprove(selectedItem.status) && (

                  <button
                    type="button"
                    className="btn btn-success px-4"
                    disabled={busy}
                    onClick={() =>
                      runAction(selectedItem, "approve")
                    }
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    อนุมัติการยืม
                  </button>

                )}

                {canReturn(selectedItem.status) && (

                  <button
                    type="button"
                    className="btn btn-success px-4"
                    disabled={busy}
                    onClick={() =>
                      runAction(selectedItem, "return")
                    }
                  >
                    <i className="bi bi-box-arrow-in-down-left me-2"></i>
                    รับคืนครุภัณฑ์
                  </button>

                )}

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          RETURN CONFIRM MODAL (แนบรูปตอนคืน)
      ===================================================== */}

      {returnTarget && (
        <div
          className="modal fade show d-block br-modal-backdrop"
          tabIndex={-1}
          style={{ zIndex: 1058 }}
          onClick={() => {
            if (!busy) closeReturnModal();
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content br-modal">
              <div className="modal-header px-4 py-3">
                <h5 className="modal-title fw-bold fs-6">
                  {ACTION_CONFIRM.return.title}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  disabled={busy}
                  onClick={closeReturnModal}
                />
              </div>

              <div className="modal-body p-4">
                <div className="br-soft p-3 mb-3">
                  <div className="fw-bold">
                    {returnTarget.borrowId}
                  </div>
                  <small className="text-secondary d-block">
                    {returnTarget.borrower}
                  </small>
                  <small className="text-secondary d-block">
                    {returnTarget.equipmentName} ·{" "}
                    {returnTarget.equipmentCode}
                  </small>
                </div>

                <PhotoPicker
                  value={returnPhotos}
                  onChange={setReturnPhotos}
                  disabled={busy}
                  progress={uploadProgress}
                />
              </div>

              <div className="modal-footer px-4 py-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  disabled={busy}
                  onClick={closeReturnModal}
                >
                  ปิด
                </button>

                <button
                  type="button"
                  className="btn btn-success px-4"
                  disabled={busy}
                  onClick={() =>
                    executeAction(
                      returnTarget,
                      "return",
                      returnPhotos
                    )
                  }
                >
                  {busy ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      {uploadProgress
                        ? "กำลังอัปโหลดรูป..."
                        : "กำลังบันทึก..."}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-down-left me-2"></i>
                      {ACTION_CONFIRM.return.confirmText}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .br-search {
          flex: 1 1 260px;
          max-width: 480px;
        }

        .br-table {
          min-width: 860px;
        }

        .br-table > tbody > tr > td {
          background: transparent;
        }

        .br-icon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 14px;
        }

        .br-icon.lg {
          width: 40px;
          height: 40px;
          font-size: 18px;
        }

        .br-action {
          width: 32px;
          height: 32px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          background: #ffffff;
          color: #404040;
        }

        .br-action:hover {
          background: #f3efff;
          border-color: #d9ccff;
          color: #6f42c1;
        }

        .br-menu {
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          font-size: 14px;
        }

        .br-footer {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px solid #e4e4e4;
        }

        .br-modal-backdrop {
          background: rgba(15, 23, 42, 0.45);
        }

        .br-modal {
          border: 1px solid #e4e4e4;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .br-modal .modal-header,
        .br-modal .modal-footer {
          border-color: #e4e4e4;
        }

        .br-soft {
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          background: #fafafa;
        }

        .br-section-title {
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #171717;
        }

        .br-note {
          border: 1px solid #fde68a;
          border-radius: 8px;
          background: #fffbeb;
          color: #92400e;
          font-size: 14px;
        }

        .br-alert {
          border: 1px solid #fecdd3;
          border-radius: 12px;
          background: #fff1f2;
          color: #9f1239;
          font-size: 14px;
        }

        .br-spin {
          display: inline-block;
          animation: br-spin 0.8s linear infinite;
        }

        @keyframes br-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

    </main>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: BorrowStatus;
}) {
  const config: Record<
    BorrowStatus,
    {
      tone: Tone;
      icon: string;
    }
  > = {
    "รออนุมัติ": {
      tone: "amber",
      icon: "bi-hourglass-split",
    },

    "กำลังยืม": {
      tone: "blue",
      icon: "bi-clock",
    },

    "คืนแล้ว": {
      tone: "emerald",
      icon: "bi-check-circle",
    },

    "เกินกำหนด": {
      tone: "rose",
      icon: "bi-exclamation-circle",
    },

    ยกเลิก: {
      tone: "neutral",
      icon: "bi-x-circle",
    },
  };

  const current = config[status];

  return (
    <Pill tone={current.tone}>
      <i className={`bi ${current.icon}`}></i>
      {status}
    </Pill>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="col-md-6">

      <div className="h-100 p-3" style={{ border: "1px solid #e4e4e4", borderRadius: 8 }}>

        <small className="text-secondary d-block mb-1">
          {label}
        </small>

        <div className="fw-semibold">
          {value}
        </div>

      </div>

    </div>
  );
}
