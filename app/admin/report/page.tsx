"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

type BorrowStatus =
  | "รออนุมัติ"
  | "กำลังยืม"
  | "เกินกำหนด"
  | "คืนแล้ว"
  | "ยกเลิก";

// รูปแบบข้อมูลจาก GET /api/admin/borrowings
type BorrowHistory = {
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
  rawStatus: string;
  status: BorrowStatus;
};

const STATUS_OPTIONS: BorrowStatus[] = [
  "คืนแล้ว",
  "กำลังยืม",
  "เกินกำหนด",
  "รออนุมัติ",
  "ยกเลิก",
];

/* ---------- helpers ---------- */

const toTime = (value: string | null) =>
  value ? new Date(value).getTime() : NaN;

// แปลงค่า <input type="date"> (YYYY-MM-DD) เป็นเวลาท้องถิ่น
function parseInputDate(value: string, endOfDay = false) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return endOfDay
    ? new Date(y, m - 1, d, 23, 59, 59, 999).getTime()
    : new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

function categoryIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes("คอมพิวเตอร์") || c.includes("notebook") || c.includes("laptop"))
    return "bi-laptop";
  if (c.includes("ถ่ายภาพ") || c.includes("กล้อง") || c.includes("camera"))
    return "bi-camera";
  if (c.includes("นำเสนอ") || c.includes("projector") || c.includes("โปรเจก"))
    return "bi-projector";
  if (c.includes("เสียง") || c.includes("ไมค์") || c.includes("mic"))
    return "bi-mic";
  if (c.includes("แท็บเล็ต") || c.includes("tablet"))
    return "bi-tablet";
  return "bi-box-seam";
}

const isActive = (s: BorrowStatus) => s === "กำลังยืม" || s === "เกินกำหนด";

function csvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export default function AdminReportsPage() {
  const [rows, setRows] = useState<BorrowHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ทั้งหมด");
  const [sort, setSort] = useState("ล่าสุด");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedHistory, setSelectedHistory] =
    useState<BorrowHistory | null>(null);

  /* ---------- load ---------- */

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    fetch("/api/admin/borrowings", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          throw new Error(
            json?.message || "ไม่สามารถดึงข้อมูลรายงานได้"
          );
        }
        setRows(Array.isArray(json.data) ? json.data : []);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "ไม่สามารถดึงข้อมูลรายงานได้"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(loadData, 0);
    return () => clearTimeout(t);
  }, [loadData]);

  /* ---------- filtering ---------- */

  // ช่วงวันที่ (กรองตามวันที่ยืม) — ใช้กับการ์ดสรุปด้วย
  const rangedRows = useMemo(() => {
    const from = parseInputDate(dateFrom);
    const to = parseInputDate(dateTo, true);

    return rows.filter((item) => {
      const t = toTime(item.borrowDate);
      if (from !== null && !(t >= from)) return false;
      if (to !== null && !(t <= to)) return false;
      return true;
    });
  }, [rows, dateFrom, dateTo]);

  const filteredHistory = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return rangedRows
      .filter((item) => {
        const searchMatch =
          keyword === "" ||
          item.borrowId.toLowerCase().includes(keyword) ||
          item.equipmentCode.toLowerCase().includes(keyword) ||
          item.equipmentName.toLowerCase().includes(keyword) ||
          item.borrower.toLowerCase().includes(keyword) ||
          (item.email || "").toLowerCase().includes(keyword) ||
          item.category.toLowerCase().includes(keyword);

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
  }, [rangedRows, search, status, sort]);

  /* ---------- stats ---------- */

  const countBy = (s: BorrowStatus) =>
    rangedRows.filter((item) => item.status === s).length;

  const totalCount = rangedRows.length;
  const returnedCount = countBy("คืนแล้ว");
  const borrowingCount = countBy("กำลังยืม");
  const overdueCount = countBy("เกินกำหนด");
  const pendingCount = countBy("รออนุมัติ");
  const cancelledCount = countBy("ยกเลิก");

  const categorySummary = useMemo(() => {
    const map = new Map<
      string,
      { category: string; total: number; returned: number; active: number; overdue: number }
    >();

    for (const item of filteredHistory) {
      const entry =
        map.get(item.category) ??
        { category: item.category, total: 0, returned: 0, active: 0, overdue: 0 };
      entry.total += 1;
      if (item.status === "คืนแล้ว") entry.returned += 1;
      if (isActive(item.status)) entry.active += 1;
      if (item.status === "เกินกำหนด") entry.overdue += 1;
      map.set(item.category, entry);
    }

    return [...map.values()].sort(
      (a, b) => b.total - a.total || a.category.localeCompare(b.category, "th")
    );
  }, [filteredHistory]);

  const topEquipment = useMemo(() => {
    const map = new Map<
      string,
      { code: string; name: string; category: string; count: number }
    >();

    for (const item of filteredHistory) {
      const key = item.equipmentCode || item.equipmentName;
      const entry =
        map.get(key) ??
        { code: item.equipmentCode, name: item.equipmentName, category: item.category, count: 0 };
      entry.count += 1;
      map.set(key, entry);
    }

    return [...map.values()]
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "th"))
      .slice(0, 5);
  }, [filteredHistory]);

  /* ---------- actions ---------- */

  const resetFilter = () => {
    setSearch("");
    setStatus("ทั้งหมด");
    setSort("ล่าสุด");
    setDateFrom("");
    setDateTo("");
  };

  const exportCsv = () => {
    const header = [
      "รหัสรายการ",
      "ผู้ยืม",
      "อีเมล",
      "ครุภัณฑ์",
      "รหัสครุภัณฑ์",
      "ประเภท",
      "วันที่ยืม",
      "กำหนดคืน",
      "วันที่คืน",
      "สถานะ",
      "วัตถุประสงค์",
    ];

    const lines = filteredHistory.map((item) =>
      [
        item.borrowId,
        item.borrower,
        item.email,
        item.equipmentName,
        item.equipmentCode,
        item.category,
        formatDate(item.borrowDate),
        formatDate(item.dueDate),
        item.returnDate ? formatDate(item.returnDate) : "",
        item.status,
        item.purpose,
      ]
        .map(csvCell)
        .join(",")
    );

    const csv = "﻿" + [header.map(csvCell).join(","), ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    const a = document.createElement("a");
    a.href = url;
    a.download = `borrow-report-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const hasData = !loading && !error;

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
            eyebrow="รายงาน"
            title="รายงานการยืม–คืนครุภัณฑ์"
            description="ตรวจสอบข้อมูลและสรุปรายการยืม–คืนครุภัณฑ์"
            actions={
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={loadData}
                  disabled={loading}
                >
                  <i
                    className="bi bi-arrow-clockwise me-1"
                  ></i>
                  รีเฟรช
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={exportCsv}
                  disabled={!hasData || filteredHistory.length === 0}
                >
                  <i className="bi bi-download me-1"></i>
                  ส่งออก CSV
                </button>
              </>
            }
          />


          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div
              className="d-flex align-items-center gap-2 px-3 py-2 mb-3 small tone-rose"
              style={{ borderRadius: "8px" }}
              role="alert"
            >
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span className="flex-grow-1">{error}</span>
              <button
                type="button"
                className="btn btn-sm btn-link p-0 text-reset fw-semibold"
                onClick={loadData}
              >
                ลองอีกครั้ง
              </button>
            </div>
          )}


          {/* =====================================================
              SUMMARY CARDS
          ===================================================== */}

          <div className="row g-3">

            <div className="col-6 col-md-4 col-xl-2">
              <StatCard
                icon="bi-list-ul"
                label="รายการทั้งหมด"
                value={loading ? "…" : totalCount}
                tone="purple"
              />
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <StatCard
                icon="bi-check-circle"
                label="คืนแล้ว"
                value={loading ? "…" : returnedCount}
                tone="emerald"
              />
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <StatCard
                icon="bi-box-arrow-up-right"
                label="กำลังยืม"
                value={loading ? "…" : borrowingCount + overdueCount}
                tone="amber"
                hint={
                  overdueCount > 0 ? (
                    <span className="text-danger">
                      เกินกำหนด {overdueCount} รายการ
                    </span>
                  ) : (
                    "ไม่มีรายการเกินกำหนด"
                  )
                }
              />
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <StatCard
                icon="bi-hourglass-split"
                label="รออนุมัติ"
                value={loading ? "…" : pendingCount}
                tone="blue"
              />
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <StatCard
                icon="bi-x-circle"
                label="รายการที่ยกเลิก"
                value={loading ? "…" : cancelledCount}
                tone="rose"
              />
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <StatCard
                icon="bi-filter-circle"
                label="จำนวนรายการที่แสดง"
                value={loading ? "…" : filteredHistory.length}
                tone="neutral"
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
                placeholder="ค้นหารหัสการยืม, ครุภัณฑ์, ผู้ยืม, อีเมล..."
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


            {/* DATE RANGE */}

            <div className="input-group input-group-sm" style={{ width: "auto" }}>
              <span className="input-group-text bg-white">ตั้งแต่</span>
              <input
                type="date"
                className="form-control"
                aria-label="วันที่ยืมตั้งแต่"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="input-group input-group-sm" style={{ width: "auto" }}>
              <span className="input-group-text bg-white">ถึง</span>
              <input
                type="date"
                className="form-control"
                aria-label="วันที่ยืมถึง"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
              />
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

              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}

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


            {/* RESET */}

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={resetFilter}
            >

              <i className="bi bi-arrow-counterclockwise me-1"></i>

              ล้างตัวกรอง

            </button>

          </Toolbar>


          {/* =====================================================
              SUMMARY BY CATEGORY / TOP EQUIPMENT
          ===================================================== */}

          {hasData && filteredHistory.length > 0 && (

            <div className="row g-3 mb-3">

              <div className="col-lg-7">
                <Panel
                  flush
                  className="h-100"
                  title="สรุปตามประเภท"
                  description="คำนวณจากรายการที่แสดงตามตัวกรอง"
                >
                  <div className="table-responsive">
                    <table className="table ui-table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>ประเภท</th>
                          <th className="text-end">จำนวนครั้งที่ยืม</th>
                          <th className="text-end">คืนแล้ว</th>
                          <th className="text-end">กำลังยืม/เกินกำหนด</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categorySummary.map((c) => (
                          <tr key={c.category}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <i className={`bi ${categoryIcon(c.category)} text-secondary`}></i>
                                <span className="fw-semibold">{c.category}</span>
                              </div>
                            </td>
                            <td className="text-end">{c.total}</td>
                            <td className="text-end">{c.returned}</td>
                            <td className="text-end text-nowrap">
                              {c.active}
                              {c.overdue > 0 && (
                                <small className="text-danger ms-1">
                                  (เกิน {c.overdue})
                                </small>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </div>

              <div className="col-lg-5">
                <Panel
                  flush
                  className="h-100"
                  title="ครุภัณฑ์ที่ถูกยืมมากที่สุด"
                  description="5 อันดับแรก"
                >
                  <ul className="list-group list-group-flush">
                    {topEquipment.map((eq, index) => (
                      <li
                        key={`${eq.code}-${eq.name}`}
                        className="list-group-item d-flex align-items-center gap-3"
                      >
                        <span
                          className="fw-bold text-secondary"
                          style={{ width: "1.5rem" }}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="fw-semibold text-truncate">{eq.name}</div>
                          <small className="text-secondary">
                            {eq.code} · {eq.category}
                          </small>
                        </div>
                        <Pill tone="purple">{eq.count} ครั้ง</Pill>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </div>

            </div>

          )}


          {/* =====================================================
              RESULT TABLE
          ===================================================== */}

          <Panel
            flush
            title="รายงานรายการยืม–คืน"
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
              <Pill tone="neutral">
                <i className="bi bi-file-earmark-text"></i>
                {dateFrom || dateTo ? "ตามช่วงวันที่" : "รายงานทั้งหมด"}
              </Pill>
            }
          >

            {loading ? (

              <div className="text-center py-5 text-secondary">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                กำลังโหลดข้อมูล...
              </div>

            ) : error ? (

              <div className="text-center py-5">
                <div className="ui-stat-icon tone-rose mx-auto mb-3">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <p className="fw-semibold mb-1">โหลดข้อมูลไม่สำเร็จ</p>
                <p className="text-secondary small mb-0">
                  กด &quot;รีเฟรช&quot; เพื่อลองอีกครั้ง
                </p>
              </div>

            ) : filteredHistory.length === 0 ? (

              <div className="text-center py-5">

                <div className="ui-stat-icon tone-neutral mx-auto mb-3">
                  <i className="bi bi-file-earmark-x"></i>
                </div>

                <p className="fw-semibold mb-1">
                  {rows.length === 0
                    ? "ยังไม่มีรายการยืม–คืน"
                    : "ไม่พบข้อมูลรายงาน"}
                </p>

                <p className="text-secondary small mb-0">
                  {rows.length === 0
                    ? "เมื่อมีการยืมครุภัณฑ์ ข้อมูลจะแสดงที่นี่"
                    : "ลองเปลี่ยนคำค้นหา ช่วงวันที่ หรือเงื่อนไขตัวกรอง"}
                </p>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table ui-table align-middle mb-0">

                  <thead>

                    <tr>
                      <th>รายการ</th>
                      <th>ผู้ยืม</th>
                      <th>วันที่ยืม</th>
                      <th>กำหนดคืน</th>
                      <th>สถานะ</th>
                      <th className="text-end">รายละเอียด</th>
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

                          {item.email && (
                            <small className="text-secondary">
                              {item.email}
                            </small>
                          )}

                        </td>


                        {/* BORROW DATE */}

                        <td className="text-nowrap">
                          {formatDate(item.borrowDate)}
                        </td>


                        {/* DUE / RETURN DATE */}

                        <td className="text-nowrap">

                          <div>
                            {formatDate(item.dueDate)}
                          </div>

                          {item.returnDate && (

                            <small className="text-success">
                              คืนจริง {formatDate(item.returnDate)}
                            </small>

                          )}

                        </td>


                        {/* STATUS */}

                        <td>
                          <HistoryStatusBadge status={item.status} />
                        </td>


                        {/* DETAIL */}

                        <td className="text-end">

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

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

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
                    value={formatDate(selectedHistory.borrowDate)}
                  />

                  <DetailBox
                    icon="bi-calendar-event"
                    title="กำหนดคืน"
                    value={formatDate(selectedHistory.dueDate)}
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
                        icon="bi-journal-text"
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
                        {formatDate(selectedHistory.returnDate)}
                      </strong>
                    </span>

                  </div>

                )}

                {selectedHistory.status === "เกินกำหนด" && (

                  <div
                    className="d-flex align-items-center gap-2 mt-3 px-3 py-2 small tone-rose"
                    style={{ borderRadius: "8px" }}
                  >

                    <i className="bi bi-exclamation-triangle-fill"></i>

                    <span>
                      เกินกำหนดคืนตั้งแต่{" "}
                      <strong>{formatDate(selectedHistory.dueDate)}</strong>
                    </span>

                  </div>

                )}

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

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}



/* =====================================================
   STATUS BADGE
===================================================== */

const STATUS_CONFIG: Record<BorrowStatus, { tone: Tone; icon: string }> = {
  "คืนแล้ว": { tone: "emerald", icon: "bi-check-circle-fill" },
  "กำลังยืม": { tone: "amber", icon: "bi-box-arrow-up-right" },
  "เกินกำหนด": { tone: "rose", icon: "bi-exclamation-triangle-fill" },
  "รออนุมัติ": { tone: "blue", icon: "bi-hourglass-split" },
  "ยกเลิก": { tone: "neutral", icon: "bi-x-circle-fill" },
};

function HistoryStatusBadge({
  status,
}: {
  status: BorrowStatus;
}) {
  const current = STATUS_CONFIG[status] ?? {
    tone: "neutral" as Tone,
    icon: "bi-circle",
  };

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

        <div className="fw-semibold small mt-1" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {value}
        </div>

      </div>

    </div>
  );
}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(date: string | null) {
  if (!date) return "-";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
