"use client";

import { useCallback, useEffect, useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import AdminNavbar from "@/app/components/AdminNavbar";
import {
  PageHeader,
  Panel,
  Pill,
  StatCard,
  type Tone,
} from "@/app/components/ui";

// อัปเดตข้อมูลอัตโนมัติทุก 15 วินาที (เกือบเรียลไทม์)
const REFRESH_MS = 15000;

const MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

type DashboardData = {
  updatedAt: string;
  year: number;
  years: number[];
  equipment: {
    total: number;
    available: number;
    borrowed: number;
    overdue: number;
    maintenance: number;
    inactive: number;
    damaged: number;
    lost: number;
  };
  monthly: { month: number; borrow: number; returned: number }[];
  thisMonth: { borrows: number; returns: number };
  totalUsers: number;
  avgBorrowDays: number | null;
  popular: { name: string; code: string; count: number }[];
  overdueList: {
    id: number;
    username: string;
    equipmentName: string;
    code: string;
    dueDate: string;
  }[];
  activity: {
    id: number;
    action: string;
    description: string;
    createdAt: string;
    username: string;
  }[];
};

export default function AdminDashboardPage() {
  const [year, setYear] = useState<number | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const query = year ? `?year=${year}` : "";

      const response = await fetch(
        `/api/admin/dashboard${query}`,
        { cache: "no-store" }
      );

      const body = await response.json();

      if (!response.ok || !body.success) {
        throw new Error(
          body.message || "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้"
        );
      }

      setData(body.data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้"
      );
    }
  }, [year]);

  // โหลดครั้งแรก + โหลดซ้ำทุก REFRESH_MS
  useEffect(() => {
    const first = setTimeout(load, 0);
    const timer = setInterval(load, REFRESH_MS);

    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [load]);

  const eq = data?.equipment;
  const loading = !data;
  const show = (value: number | undefined) =>
    loading ? "..." : String(value ?? 0);

  const statusTotal = eq
    ? eq.available +
      eq.borrowed +
      eq.maintenance +
      eq.inactive +
      eq.damaged +
      eq.lost
    : 0;

  const percent = (value: number) =>
    statusTotal > 0 ? Math.round((value / statusTotal) * 100) : 0;

  const maxMonthly = Math.max(
    1,
    ...(data?.monthly ?? []).flatMap((m) => [m.borrow, m.returned])
  );

  return (
    <main className="min-vh-100">

      <AdminNavbar />

      <section className="admin-page-content">

        <div className="ui-page p-0">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <PageHeader
            eyebrow="ภาพรวมระบบ"
            title="แดชบอร์ดสรุปข้อมูล"
            description="สถานะครุภัณฑ์และการยืม–คืนจากฐานข้อมูล อัปเดตอัตโนมัติทุก 15 วินาที"
            actions={
              <div className="dash-date">
                <span className="dash-live" />
                <span>
                  <small>อัปเดตล่าสุด</small>
                  <strong>
                    {data
                      ? new Date(data.updatedAt).toLocaleTimeString(
                          "th-TH",
                          { hour: "2-digit", minute: "2-digit", second: "2-digit" }
                        )
                      : "กำลังโหลด..."}
                  </strong>
                </span>
              </div>
            }
          />

          {error && (
            <div className="dash-alert" role="alert">
              <i className="bi bi-exclamation-circle" />
              <span>{error}</span>
            </div>
          )}

          {/* =====================================================
              STAT CARDS
          ===================================================== */}

          <div className="row g-3">

            <div className="col-6 col-xl-3">
              <StatCard
                label="ครุภัณฑ์ทั้งหมด"
                value={<ValueWithUnit value={show(eq?.total)} unit="ชิ้น" />}
                icon="bi-box-seam"
                tone="purple"
              />
            </div>

            <div className="col-6 col-xl-3">
              <StatCard
                label="พร้อมใช้งาน"
                value={<ValueWithUnit value={show(eq?.available)} unit="ชิ้น" />}
                icon="bi-check-circle"
                tone="emerald"
              />
            </div>

            <div className="col-6 col-xl-3">
              <StatCard
                label="กำลังถูกยืม"
                value={<ValueWithUnit value={show(eq?.borrowed)} unit="ชิ้น" />}
                icon="bi-arrow-up-right-circle"
                tone="amber"
              />
            </div>

            <div className="col-6 col-xl-3">
              <StatCard
                label="ค้างส่ง (เกินกำหนด)"
                value={<ValueWithUnit value={show(eq?.overdue)} unit="ชิ้น" />}
                icon="bi-exclamation-triangle"
                tone="rose"
                hint={
                  eq && eq.overdue > 0 ? (
                    <Pill tone="rose">ต้องติดตาม</Pill>
                  ) : undefined
                }
              />
            </div>

          </div>

          {/* =====================================================
              CHART + RECENT ACTIVITY
          ===================================================== */}

          <div className="row g-3">

            <div className="col-xl-8">

              <Panel
                className="h-100"
                title="สถิติการยืม–คืน"
                description="จำนวนรายการยืมและคืนในแต่ละเดือน"
                action={
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "120px" }}
                    value={data?.year ?? ""}
                    onChange={(e) => setYear(Number(e.target.value))}
                    disabled={!data}
                  >
                    {(data?.years ?? []).map((y) => (
                      <option key={y} value={y}>
                        ปี {y + 543}
                      </option>
                    ))}
                  </select>
                }
              >

                <div
                  className="d-flex align-items-end justify-content-between"
                  style={{
                    height: "230px",
                    padding: "0 8px",
                    borderBottom: "1px solid var(--shell-border)",
                  }}
                >
                  {(data?.monthly ?? MONTHS.map((_, i) => ({
                    month: i + 1,
                    borrow: 0,
                    returned: 0,
                  }))).map((item) => (
                    <div
                      key={item.month}
                      className="d-flex justify-content-center align-items-end gap-1"
                      style={{ flex: 1, height: "220px" }}
                    >
                      <Bar
                        value={item.borrow}
                        max={maxMonthly}
                        color="#6f42c1"
                        title={`ยืม ${item.borrow} รายการ`}
                      />

                      <Bar
                        value={item.returned}
                        max={maxMonthly}
                        color="#10b981"
                        title={`คืน ${item.returned} รายการ`}
                      />
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between px-2 mt-2">
                  {MONTHS.map((month) => (
                    <small
                      key={month}
                      className="text-secondary text-center"
                      style={{ flex: 1, fontSize: "11px" }}
                    >
                      {month}
                    </small>
                  ))}
                </div>

                <div className="d-flex justify-content-center gap-4 mt-3">
                  <Legend color="#6f42c1" label="รายการยืม" />
                  <Legend color="#10b981" label="รายการคืน" />
                </div>

              </Panel>

            </div>

            <div className="col-xl-4">

              <Panel
                className="h-100"
                title="กิจกรรมล่าสุด"
                description="การยืม–คืนล่าสุดในระบบ"
              >
                <div className="d-flex flex-column gap-3">
                  {data?.activity.map((item) => (
                    <Activity
                      key={item.id}
                      {...activityStyle(item.action)}
                      title={item.username}
                      detail={item.description || item.action}
                      time={timeAgo(item.createdAt)}
                    />
                  ))}

                  {data && data.activity.length === 0 && (
                    <Empty text="ยังไม่มีกิจกรรม" />
                  )}

                  {loading && <Empty text="กำลังโหลด..." />}
                </div>
              </Panel>

            </div>

          </div>

          {/* =====================================================
              OVERDUE LIST
          ===================================================== */}

          <Panel
            flush
            title="รายการค้างส่ง"
            description="ครุภัณฑ์ที่เลยกำหนดคืนแล้วแต่ยังไม่คืน"
            action={
              <Pill tone={eq && eq.overdue > 0 ? "rose" : "neutral"}>
                {data ? data.overdueList.length : "..."} รายการ
              </Pill>
            }
          >
            <div className="table-responsive">
              <table className="table ui-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>ผู้ยืม</th>
                    <th>ครุภัณฑ์</th>
                    <th>รหัส</th>
                    <th>กำหนดคืน</th>
                    <th className="text-end">เกินมา</th>
                  </tr>
                </thead>

                <tbody>
                  {data?.overdueList.map((row) => (
                    <tr key={row.id}>
                      <td className="fw-semibold">{row.username}</td>
                      <td>{row.equipmentName}</td>
                      <td>
                        <small className="text-secondary">{row.code}</small>
                      </td>
                      <td>{formatThaiDate(row.dueDate)}</td>
                      <td className="text-end">
                        <Pill tone="rose">{daysLate(row.dueDate)} วัน</Pill>
                      </td>
                    </tr>
                  ))}

                  {data && data.overdueList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-secondary py-4">
                        ไม่มีรายการค้างส่ง
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* =====================================================
              POPULAR EQUIPMENT + STATUS
          ===================================================== */}

          <div className="row g-3">

            <div className="col-lg-7">

              <Panel
                flush
                className="h-100"
                title="ครุภัณฑ์ที่ถูกยืมบ่อย"
                description="5 อันดับที่มีการยืมมากที่สุด"
              >
                <div className="table-responsive">
                  <table className="table ui-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>อันดับ</th>
                        <th>ครุภัณฑ์</th>
                        <th>รหัส</th>
                        <th className="text-end">จำนวนครั้ง</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data?.popular.map((row, index) => (
                        <tr key={row.code}>
                          <td>
                            <Pill tone={index === 0 ? "purple" : "neutral"}>
                              {index + 1}
                            </Pill>
                          </td>
                          <td className="fw-semibold">{row.name}</td>
                          <td>
                            <small className="text-secondary">{row.code}</small>
                          </td>
                          <td className="text-end fw-semibold">{row.count}</td>
                        </tr>
                      ))}

                      {data && data.popular.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center text-secondary py-4">
                            ยังไม่มีข้อมูลการยืม
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>

            </div>

            <div className="col-lg-5">

              <Panel
                className="h-100"
                title="สถานะครุภัณฑ์"
                description="สัดส่วนครุภัณฑ์ทั้งหมดตามสถานะ"
              >
                <div className="d-flex flex-column gap-3">
                  <StatusBar
                    label="พร้อมใช้งาน"
                    value={eq?.available ?? 0}
                    percent={percent(eq?.available ?? 0)}
                    color="#10b981"
                  />
                  <StatusBar
                    label="กำลังถูกยืม"
                    value={eq?.borrowed ?? 0}
                    percent={percent(eq?.borrowed ?? 0)}
                    color="#f59e0b"
                  />
                  <StatusBar
                    label="ซ่อมบำรุง"
                    value={eq?.maintenance ?? 0}
                    percent={percent(eq?.maintenance ?? 0)}
                    color="#e11d48"
                  />
                  <StatusBar
                    label="ชำรุด"
                    value={eq?.damaged ?? 0}
                    percent={percent(eq?.damaged ?? 0)}
                    color="#be123c"
                  />
                  <StatusBar
                    label="สูญหาย"
                    value={eq?.lost ?? 0}
                    percent={percent(eq?.lost ?? 0)}
                    color="#525252"
                  />
                  <StatusBar
                    label="ปิดใช้งาน"
                    value={eq?.inactive ?? 0}
                    percent={percent(eq?.inactive ?? 0)}
                    color="#a3a3a3"
                  />
                </div>

                <div className="dash-info d-flex gap-3 align-items-start mt-4 p-3">
                  <div className="ui-stat-icon tone-purple">
                    <i className="bi bi-info-circle" />
                  </div>

                  <div>
                    <div className="fw-semibold small">อัตราพร้อมใช้งาน</div>
                    <small className="text-secondary">
                      ครุภัณฑ์พร้อมใช้งานคิดเป็น{" "}
                      {percent(eq?.available ?? 0)}% ของทั้งหมด
                    </small>
                  </div>
                </div>
              </Panel>

            </div>

          </div>

          {/* =====================================================
              QUICK SUMMARY
          ===================================================== */}

          <div className="row g-3">

            <div className="col-6 col-xl-3">
              <StatCard
                icon="bi-calendar-check"
                label="รายการยืมเดือนนี้"
                value={<ValueWithUnit value={show(data?.thisMonth.borrows)} unit="รายการ" />}
                tone="purple"
              />
            </div>

            <div className="col-6 col-xl-3">
              <StatCard
                icon="bi-arrow-return-left"
                label="รายการคืนเดือนนี้"
                value={<ValueWithUnit value={show(data?.thisMonth.returns)} unit="รายการ" />}
                tone="emerald"
              />
            </div>

            <div className="col-6 col-xl-3">
              <StatCard
                icon="bi-people"
                label="ผู้ใช้งานทั้งหมด"
                value={<ValueWithUnit value={show(data?.totalUsers)} unit="คน" />}
                tone="blue"
              />
            </div>

            <div className="col-6 col-xl-3">
              <StatCard
                icon="bi-clock-history"
                label="เฉลี่ยระยะเวลายืม"
                value={
                  <ValueWithUnit
                    value={
                      loading
                        ? "..."
                        : data?.avgBorrowDays == null
                          ? "-"
                          : String(data.avgBorrowDays)
                    }
                    unit="วัน"
                  />
                }
                tone="amber"
              />
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="py-4"
        style={{
          background: "#171717",
          color: "#fff",
        }}
      >
        <div className="dash-footer-inner">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <div>
              <div className="fw-semibold">ระบบยืม–คืนครุภัณฑ์</div>
              <small className="text-white-50">
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
              </small>
            </div>

            <small className="text-white-50">ระบบผู้ดูแล</small>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .dash-date {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px;
          border: 1px solid var(--shell-border);
          border-radius: 8px;
          background: #ffffff;
          font-size: 13px;
        }

        .dash-live {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 3px #d1fae5;
        }

        .dash-date span:last-child {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .dash-date small {
          font-size: 11px;
          color: var(--shell-muted);
        }

        .dash-alert {
          display: flex;
          gap: 8px;
          padding: 12px 14px;
          border: 1px solid #fecdd3;
          border-radius: 12px;
          background: #fff1f2;
          color: #9f1239;
          font-size: 14px;
        }

        .dash-info {
          border: 1px solid var(--shell-border);
          border-radius: 8px;
          background: #fafafa;
        }

        .dash-footer-inner {
          margin-left: var(--admin-sidebar-width);
          padding: 0 24px;
        }

        @media (max-width: 991.98px) {
          .dash-footer-inner {
            margin-left: 0;
            padding: 0 16px;
          }
        }
      `}</style>

    </main>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatThaiDate(value: string) {
  return new Date(value).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysLate(value: string) {
  const diff = Date.now() - new Date(value).getTime();

  return Math.max(1, Math.floor(diff / (24 * 60 * 60 * 1000)));
}

function timeAgo(value: string) {
  const minutes = Math.floor(
    (Date.now() - new Date(value).getTime()) / 60000
  );

  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;

  return formatThaiDate(value);
}

function activityStyle(action: string): { icon: string; tone: Tone } {
  if (action.includes("RETURN")) {
    return { icon: "bi-arrow-return-left", tone: "emerald" };
  }

  if (action.includes("BORROW")) {
    return { icon: "bi-box-arrow-up-right", tone: "purple" };
  }

  if (action.includes("USER")) {
    return { icon: "bi-person", tone: "blue" };
  }

  return { icon: "bi-activity", tone: "neutral" };
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function ValueWithUnit({
  value,
  unit,
}: {
  value: string;
  unit: string;
}) {
  return (
    <>
      {value}{" "}
      <span
        className="text-secondary fw-normal"
        style={{ fontSize: "13px" }}
      >
        {unit}
      </span>
    </>
  );
}

function Bar({
  value,
  max,
  color,
  title,
}: {
  value: number;
  max: number;
  color: string;
  title: string;
}) {
  return (
    <div
      title={title}
      style={{
        width: "12px",
        height: `${value > 0 ? Math.max(4, (value / max) * 210) : 0}px`,
        background: color,
        borderRadius: "3px 3px 0 0",
        transition: "height 0.3s ease",
      }}
    />
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="small text-secondary d-inline-flex align-items-center">
      <span
        className="d-inline-block me-2"
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "2px",
          background: color,
        }}
      />
      {label}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="text-center text-secondary small py-4">
      {text}
    </div>
  );
}

function Activity({
  icon,
  tone,
  title,
  detail,
  time,
}: {
  icon: string;
  tone: Tone;
  title: string;
  detail: string;
  time: string;
}) {
  return (
    <div className="d-flex gap-3">
      <div className={`ui-stat-icon tone-${tone}`}>
        <i className={`bi ${icon}`} />
      </div>

      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div className="d-flex justify-content-between gap-2">
          <div className="fw-semibold small text-truncate">{title}</div>

          <div
            className="text-secondary text-nowrap"
            style={{ fontSize: "12px" }}
          >
            {time}
          </div>
        </div>

        <div className="small text-secondary">{detail}</div>
      </div>
    </div>
  );
}

function StatusBar({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: number;
  percent: number;
  color: string;
}) {
  return (
    <div>
      <div className="d-flex justify-content-between mb-2 small">
        <span className="fw-semibold">{label}</span>

        <span className="text-secondary">
          {value} ชิ้น ({percent}%)
        </span>
      </div>

      <div
        className="progress"
        style={{ height: "6px", background: "#f0f0f0" }}
      >
        <div
          className="progress-bar"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </div>
  );
}
