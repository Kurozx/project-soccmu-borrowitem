"use client";

import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
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

/* =====================================================
   TYPES
===================================================== */

type BorrowStatus =
  | "คืนแล้ว"
  | "กำลังยืม"
  | "เกินกำหนด"
  | "รออนุมัติ"
  | "ยกเลิก";

type BorrowHistory = {
  id: number;
  borrowId: string;
  equipmentCode: string;
  equipmentName: string;
  category: string;
  borrower: string;
  email: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  quantity: number;
  purpose: string;
  note: string;
  status: BorrowStatus;
};

const canReturn = (status: BorrowStatus) =>
  status === "กำลังยืม" || status === "เกินกำหนด";

/* =====================================================
   DATA
===================================================== */

async function fetchHistory(): Promise<BorrowHistory[]> {
  const res = await fetch("/api/admin/borrowings", {
    cache: "no-store",
  });

  const result = await res.json().catch(() => null);

  if (!res.ok || !result?.success) {
    throw new Error(
      result?.message || "ไม่สามารถดึงข้อมูลรายการยืมได้"
    );
  }

  return result.data as BorrowHistory[];
}

const toTime = (value: string | null | undefined) => {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(time) ? 0 : time;
};

// ไอคอนตามประเภทครุภัณฑ์ (API ไม่มีฟิลด์ไอคอน)
function categoryIcon(category: string) {
  const c = category.toLowerCase();

  if (/คอม|notebook|laptop|โน้ตบุ๊ก/.test(c)) return "bi-laptop";
  if (/กล้อง|ภาพ|camera/.test(c)) return "bi-camera";
  if (/โปรเจ|นำเสนอ|projector/.test(c)) return "bi-projector";
  if (/เสียง|ไมค์|mic|audio/.test(c)) return "bi-mic";
  if (/แท็บ|tablet|อิเล็ก/.test(c)) return "bi-tablet";

  return "bi-box-seam";
}


/* =====================================================
   PAGE
===================================================== */

export default function HistoryPage() {
  const [historyData, setHistoryData] =
    useState<BorrowHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ทั้งหมด");
  const [sort, setSort] = useState("ล่าสุด");

  const [selectedHistory, setSelectedHistory] =
    useState<BorrowHistory | null>(null);

  // ยืนยันรับคืน (แนบรูปสภาพตอนคืนได้)
  const [returnTarget, setReturnTarget] =
    useState<BorrowHistory | null>(null);
  const [returnPhotos, setReturnPhotos] =
    useState<PickedPhoto[]>([]);
  const [uploadProgress, setUploadProgress] =
    useState<UploadProgress | null>(null);

  const closeReturnModal = () => {
    releasePhotos(returnPhotos);
    setReturnPhotos([]);
    setReturnTarget(null);
  };

  /* =====================================================
     LOAD
  ===================================================== */

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setHistoryData(await fetchHistory());
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
      void loadHistory();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadHistory]);

  /* =====================================================
     CONFIRM RETURN
  ===================================================== */

  const confirmReturn = async (item: BorrowHistory) => {
    if (submitting || !canReturn(item.status)) return;

    setReturnPhotos([]);
    setReturnTarget(item);
  };

  const executeReturn = async (
    item: BorrowHistory,
    photos: PickedPhoto[]
  ) => {
    if (submitting) return;

    setSubmitting(true);

    try {
      const res = await fetch(
        `/api/admin/borrowings/${item.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "return" }),
        }
      );

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        throw new Error(
          result?.message || "ไม่สามารถบันทึกการคืนได้"
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
      closeReturnModal();
      setSelectedHistory(null);

      await loadHistory();

      await Swal.fire({
        title: "สำเร็จ",
        text: `${result.message || "บันทึกการคืนสำเร็จ"}${
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
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredHistory = historyData
    .filter((item) => {
      const keyword = search.toLowerCase().trim();

      const searchMatch =
        keyword === "" ||
        item.borrowId.toLowerCase().includes(keyword) ||
        item.equipmentCode.toLowerCase().includes(keyword) ||
        item.equipmentName.toLowerCase().includes(keyword) ||
        item.borrower.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword);

      const statusMatch =
        status === "ทั้งหมด" || item.status === status;

      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      if (sort === "ล่าสุด") {
        return toTime(b.borrowDate) - toTime(a.borrowDate);
      }

      if (sort === "เก่าสุด") {
        return toTime(a.borrowDate) - toTime(b.borrowDate);
      }

      if (sort === "วันคืนใกล้สุด") {
        return toTime(a.dueDate) - toTime(b.dueDate);
      }

      return a.borrowId.localeCompare(b.borrowId);
    });

  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalCount = historyData.length;

  const returnedCount = historyData.filter(
    (item) => item.status === "คืนแล้ว"
  ).length;

  const borrowingCount = historyData.filter(
    (item) => item.status === "กำลังยืม"
  ).length;

  const overdueCount = historyData.filter(
    (item) => item.status === "เกินกำหนด"
  ).length;

  const pendingCount = historyData.filter(
    (item) => item.status === "รออนุมัติ"
  ).length;

  /* =====================================================
     RESET
  ===================================================== */

  const resetFilter = () => {
    setSearch("");
    setStatus("ทั้งหมด");
    setSort("ล่าสุด");
  };


  return (
    <main className="min-vh-100">

      {/* =====================================================
          ADMIN NAVBAR
      ===================================================== */}

      <AdminNavbar />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="admin-page-content">

        <div className="ui-page p-0">

          {/* =====================================================
              PAGE HEADER
          ===================================================== */}

          <PageHeader
            eyebrow="การยืม–คืน"
            title="ประวัติการยืม–คืน"
            actions={
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => void loadHistory()}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-arrow-clockwise me-2"></i>
                )}
                รีเฟรช
              </button>
            }
          />

          {/* ERROR */}

          {error && (
            <div className="alert alert-danger history-alert mb-0">

              <div className="d-flex align-items-start gap-3">

                <i className="bi bi-exclamation-triangle fs-5"></i>

                <div>

                  <div className="fw-semibold">
                    ไม่สามารถโหลดข้อมูลรายการยืม–คืนได้
                  </div>

                  <div className="small mt-1">
                    {error}
                  </div>

                </div>

              </div>

            </div>
          )}


          {/* =====================================================
              SUMMARY CARDS
          ===================================================== */}

          <div className="row g-3">

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-list-ul"
                label="รายการทั้งหมด"
                value={totalCount}
                tone="purple"
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-check-circle"
                label="คืนแล้ว"
                value={returnedCount}
                tone="emerald"
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-box-arrow-up-right"
                label="กำลังยืม"
                value={borrowingCount}
                tone="amber"
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-hourglass-split"
                label="รออนุมัติ"
                value={pendingCount}
                tone="blue"
              />
            </div>

            <div className="col-12 col-xl">
              <StatCard
                icon="bi-exclamation-circle"
                label="เกินกำหนด"
                value={overdueCount}
                tone="rose"
              />
            </div>

          </div>


          {/* =====================================================
              SEARCH & FILTER
          ===================================================== */}

          <Toolbar>

            {/* SEARCH */}

            <div
              className="input-group input-group-sm flex-grow-1"
              style={{ minWidth: "240px", flexBasis: "320px" }}
            >

              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>

              <input
                type="text"
                className="form-control"
                aria-label="ค้นหาประวัติ"
                placeholder="ค้นหารหัสการยืม, ครุภัณฑ์, ผู้ยืม..."
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

                  <i className="bi bi-x-lg"></i>

                </button>

              )}

            </div>


            {/* STATUS */}

            <select
              className="form-select"
              style={{ width: "auto", minWidth: "160px" }}
              aria-label="สถานะ"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >

              <option value="ทั้งหมด">
                สถานะ: ทั้งหมด
              </option>

              <option value="คืนแล้ว">
                คืนแล้ว
              </option>

              <option value="กำลังยืม">
                กำลังยืม
              </option>

              <option value="เกินกำหนด">
                เกินกำหนด
              </option>

              <option value="รออนุมัติ">
                รออนุมัติ
              </option>

              <option value="ยกเลิก">
                ยกเลิก
              </option>

            </select>


            {/* SORT */}

            <select
              className="form-select"
              style={{ width: "auto", minWidth: "170px" }}
              aria-label="เรียงลำดับ"
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
            >

              <option value="ล่าสุด">
                วันที่ยืมล่าสุด
              </option>

              <option value="เก่าสุด">
                วันที่ยืมเก่าสุด
              </option>

              <option value="วันคืนใกล้สุด">
                วันคืนใกล้สุด
              </option>

              <option value="รหัส">
                รหัสการยืม
              </option>

            </select>


          </Toolbar>


          {/* =====================================================
              RESULT TABLE
          ===================================================== */}

          <Panel
            flush
            title="รายการประวัติ"
            description={
              <>
                พบ{" "}
                <strong className="text-dark">
                  {filteredHistory.length}
                </strong>{" "}
                รายการ
              </>
            }
            action={
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary text-nowrap"
                onClick={resetFilter}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                ล้างตัวกรอง
              </button>
            }
          >

            <div className="table-responsive">

              <table className="table ui-table align-middle mb-0">

                <thead>

                  <tr>

                    <th>
                      รายการ
                    </th>

                    <th>
                      ผู้ยืม
                    </th>

                    <th>
                      วันที่ยืม
                    </th>

                    <th>
                      กำหนดคืน
                    </th>

                    <th>
                      สถานะ
                    </th>

                    <th className="text-end">
                      รายละเอียด
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredHistory.map((item) => (

                    <tr key={item.id}>

                      {/* EQUIPMENT */}

                      <td>

                        <div className="d-flex align-items-center gap-3">

                          <div className="ui-stat-icon tone-purple">
                            <i className={`bi ${categoryIcon(item.category)}`}></i>
                          </div>


                          <div>

                            <div className="fw-semibold">
                              {item.equipmentName}
                            </div>

                            <small className="text-secondary">
                              {item.equipmentCode} · {item.borrowId}
                            </small>

                          </div>

                        </div>

                      </td>


                      {/* BORROWER */}

                      <td>

                        <div className="fw-semibold">
                          {item.borrower}
                        </div>

                        <small className="text-secondary">
                          {item.email}
                        </small>

                      </td>


                      {/* BORROW DATE */}

                      <td className="text-nowrap">
                        {formatDate(item.borrowDate)}
                      </td>


                      {/* RETURN DATE */}

                      <td className="text-nowrap">

                        <div
                          className={
                            item.status === "เกินกำหนด"
                              ? "text-danger fw-semibold"
                              : ""
                          }
                        >
                          {formatDate(item.dueDate)}
                        </div>

                        {item.returnDate && (

                          <small className="text-success">

                            คืนจริง{" "}

                            {formatDate(
                              item.returnDate
                            )}

                          </small>

                        )}

                      </td>


                      {/* STATUS */}

                      <td>

                        <HistoryStatusBadge
                          status={item.status}
                        />

                      </td>


                      {/* DETAIL */}

                      <td className="text-end">

                        <div className="d-inline-flex gap-2">

                          {canReturn(item.status) && (

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success text-nowrap"
                              disabled={submitting}
                              onClick={() =>
                                confirmReturn(item)
                              }
                            >

                              <i className="bi bi-box-arrow-in-down-left me-1"></i>

                              บันทึกการคืน

                            </button>

                          )}

                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm text-nowrap"
                            onClick={() =>
                              setSelectedHistory(item)
                            }
                          >

                            <i className="bi bi-eye me-1"></i>

                            ดูรายละเอียด

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>


            {/* EMPTY */}

            {loading && historyData.length === 0 ? (

              <div className="text-center py-5">

                <div className="spinner-border spinner-border-sm text-secondary"></div>

                <p className="text-secondary small mt-2 mb-0">
                  กำลังโหลดข้อมูล...
                </p>

              </div>

            ) : filteredHistory.length === 0 && (

              <div className="text-center py-5">

                <div className="ui-stat-icon tone-neutral mx-auto mb-3">
                  <i className="bi bi-clock-history"></i>
                </div>

                <p className="fw-semibold mb-1">
                  ไม่พบประวัติการยืม–คืน
                </p>

                <p className="text-secondary small mb-0">
                  {historyData.length === 0
                    ? "ยังไม่มีรายการยืมในระบบ"
                    : "ลองเปลี่ยนคำค้นหาหรือเงื่อนไขตัวกรอง"}
                </p>

              </div>

            )}

          </Panel>

        </div>

      </section>


      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedHistory && (

        <div
          className="modal fade show d-block"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 2000,
          }}
          onClick={() =>
            setSelectedHistory(null)
          }
        >

          <div
            className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-content border-0 overflow-hidden" style={{ borderRadius: "12px" }}>

              {/* MODAL HEADER */}

              <div className="modal-header align-items-start gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--shell-border)" }}>

                <div className="ui-stat-icon tone-purple">
                  <i className={`bi ${categoryIcon(selectedHistory.category)}`}></i>
                </div>

                <div className="flex-grow-1" style={{ minWidth: 0 }}>

                  <p className="ui-eyebrow mb-1">
                    {selectedHistory.borrowId}
                  </p>

                  <h5 className="fw-bold mb-1">
                    {selectedHistory.equipmentName}
                  </h5>

                  <div className="d-flex flex-wrap align-items-center gap-2">

                    <small className="text-secondary">
                      {selectedHistory.equipmentCode}
                    </small>

                    <HistoryStatusBadge
                      status={selectedHistory.status}
                    />

                  </div>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="ปิด"
                  onClick={() =>
                    setSelectedHistory(null)
                  }
                ></button>

              </div>


              {/* MODAL BODY */}

              <div className="modal-body p-4">

                <div className="row g-3">

                  <DetailBox
                    icon="bi-person"
                    title="ผู้ยืม"
                    value={selectedHistory.borrower}
                  />

                  <DetailBox
                    icon="bi-envelope"
                    title="อีเมล"
                    value={selectedHistory.email || "-"}
                  />

                  <DetailBox
                    icon="bi-calendar-check"
                    title="วันที่ยืม"
                    value={formatDate(
                      selectedHistory.borrowDate
                    )}
                  />

                  <DetailBox
                    icon="bi-calendar-event"
                    title="กำหนดคืน"
                    value={formatDate(
                      selectedHistory.dueDate
                    )}
                  />

                  <DetailBox
                    icon="bi-tag"
                    title="ประเภทครุภัณฑ์"
                    value={selectedHistory.category}
                  />

                  <DetailBox
                    icon="bi-123"
                    title="จำนวน"
                    value={`${selectedHistory.quantity} ชิ้น`}
                  />

                  {/* PURPOSE */}

                  <div className="col-12">
                    <DetailContent
                      icon="bi-chat-left-text"
                      title="วัตถุประสงค์ในการยืม"
                      value={selectedHistory.purpose || "-"}
                    />
                  </div>

                  {selectedHistory.note && (
                    <div className="col-12">
                      <DetailContent
                        icon="bi-info-circle"
                        title="หมายเหตุ"
                        value={selectedHistory.note}
                      />
                    </div>
                  )}

                </div>


                {/* ACTUAL RETURN */}

                {selectedHistory.returnDate && (

                  <div
                    className="d-flex align-items-center gap-2 mt-3 px-3 py-2 small tone-emerald"
                    style={{ borderRadius: "8px" }}
                  >

                    <i className="bi bi-check-circle-fill"></i>

                    <span>
                      ครุภัณฑ์ถูกคืนแล้วเมื่อ{" "}

                      <strong>
                        {formatDate(
                          selectedHistory.returnDate
                        )}
                      </strong>
                    </span>

                  </div>

                )}

                {/* PHOTOS */}

                <BorrowingPhotos
                  borrowingId={selectedHistory.id}
                  uploadKinds={["borrow", "return"]}
                  allowDelete
                />

              </div>


              {/* MODAL FOOTER */}

              <div className="modal-footer px-4 py-3" style={{ borderTop: "1px solid var(--shell-border)" }}>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary px-3"
                  onClick={() =>
                    setSelectedHistory(null)
                  }
                >
                  ปิด
                </button>

                {canReturn(selectedHistory.status) && (

                  <button
                    type="button"
                    className="btn btn-sm btn-success px-3"
                    disabled={submitting}
                    onClick={() => {
                      // ปิด modal ก่อน เพราะ z-index ของ modal (2000) สูงกว่า SweetAlert
                      const target = selectedHistory;
                      setSelectedHistory(null);
                      void confirmReturn(target);
                    }}
                  >
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <i className="bi bi-box-arrow-in-down-left me-2"></i>
                    )}
                    บันทึกการคืน
                  </button>

                )}

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          RETURN CONFIRM MODAL (แนบรูปตอนคืน)
          z-index ต่ำกว่า SweetAlert (1060) เพื่อให้แจ้งผิดพลาดแสดงทับได้
      ===================================================== */}

      {returnTarget && (
        <div
          className="modal fade show d-block"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 1058,
          }}
          onClick={() => {
            if (!submitting) closeReturnModal();
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content border-0 overflow-hidden"
              style={{ borderRadius: "12px" }}
            >
              <div
                className="modal-header px-4 py-3"
                style={{ borderBottom: "1px solid var(--shell-border)" }}
              >
                <h5 className="modal-title fw-bold fs-6">
                  ยืนยันการรับคืนครุภัณฑ์?
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="ปิด"
                  disabled={submitting}
                  onClick={closeReturnModal}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div
                  className="p-3 mb-3"
                  style={{
                    border: "1px solid var(--shell-border)",
                    borderRadius: "8px",
                    background: "#fafafa",
                  }}
                >
                  <div className="fw-bold">{returnTarget.borrowId}</div>
                  <small className="text-secondary d-block">
                    {returnTarget.equipmentName} ·{" "}
                    {returnTarget.equipmentCode}
                  </small>
                  <small className="text-secondary d-block">
                    ผู้ยืม: {returnTarget.borrower}
                  </small>
                </div>

                <PhotoPicker
                  value={returnPhotos}
                  onChange={setReturnPhotos}
                  disabled={submitting}
                  progress={uploadProgress}
                />
              </div>

              <div
                className="modal-footer px-4 py-3"
                style={{ borderTop: "1px solid var(--shell-border)" }}
              >
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary px-3"
                  disabled={submitting}
                  onClick={closeReturnModal}
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-success px-3"
                  disabled={submitting}
                  onClick={() =>
                    void executeReturn(returnTarget, returnPhotos)
                  }
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {uploadProgress
                        ? "กำลังอัปโหลดรูป..."
                        : "กำลังบันทึก..."}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-down-left me-2"></i>
                      บันทึกการคืน
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="py-4 text-white"
        style={{
          background: "#171717",
        }}
      >

        <div className="history-footer-inner">

          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">

            <div>

              <div className="fw-semibold">
                ระบบยืม–คืนครุภัณฑ์
              </div>

              <small className="text-white-50">
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
              </small>

            </div>

            <div className="text-white-50 small">
              © 2026 Faculty of Social Sciences
            </div>

          </div>

        </div>

      </footer>

      <style jsx>{`
        .history-alert {
          border: 1px solid #fecdd3;
          border-radius: 12px;
          background: #fff1f2;
          color: #9f1239;
          font-size: 14px;
        }

        .history-footer-inner {
          margin-left: var(--admin-sidebar-width);
          padding: 0 24px;
        }

        @media (max-width: 991.98px) {
          .history-footer-inner {
            margin-left: 0;
            padding: 0 16px;
          }
        }
      `}</style>

    </main>
  );
}


/* =====================================================
   STATUS BADGE
===================================================== */

function HistoryStatusBadge({
  status,
}: {
  status: BorrowStatus;
}) {
  const config: Record<
    BorrowStatus,
    { tone: Tone; icon: string }
  > = {
    "คืนแล้ว": {
      tone: "emerald",
      icon: "bi-check-circle-fill",
    },

    "กำลังยืม": {
      tone: "amber",
      icon: "bi-box-arrow-up-right",
    },

    "รออนุมัติ": {
      tone: "blue",
      icon: "bi-hourglass-split",
    },

    "เกินกำหนด": {
      tone: "rose",
      icon: "bi-exclamation-circle-fill",
    },

    "ยกเลิก": {
      tone: "neutral",
      icon: "bi-x-circle-fill",
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


/* =====================================================
   DETAIL BOX
===================================================== */

function DetailBox({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="col-md-6">
      <DetailContent
        icon={icon}
        title={title}
        value={value}
      />
    </div>
  );
}

function DetailContent({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div
      className="d-flex gap-3 p-3 h-100"
      style={{
        border: "1px solid var(--shell-border)",
        borderRadius: "8px",
        background: "#fafafa",
      }}
    >

      <div className="ui-stat-icon tone-purple">
        <i className={`bi ${icon}`}></i>
      </div>

      <div style={{ minWidth: 0 }}>

        <small
          className="text-secondary d-block"
          style={{ fontSize: "12px" }}
        >
          {title}
        </small>

        <div className="fw-semibold small mt-1">
          {value}
        </div>

      </div>

    </div>
  );
}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(date: string | null | undefined) {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return "-";
  }

  return new Date(date).toLocaleDateString(
    "th-TH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}