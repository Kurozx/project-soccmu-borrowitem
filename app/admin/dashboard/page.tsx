"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import AdminNavbar from "@/app/components/AdminNavbar";

export default function DashboardClient() {
  return (
    <main className="bg-light min-vh-100">

      {/* =====================================================
          ADMIN NAVBAR
      ===================================================== */}

      <AdminNavbar />


      {/* =====================================================
          DASHBOARD CONTENT
      ===================================================== */}

      <section
        className="admin-page-content"
        style={{
          paddingTop: "98px",
        }}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section
          className="dashboard-header rounded-4 overflow-hidden mb-4"
          style={{
            background:
              "linear-gradient(135deg, #f3edff 0%, #ffffff 55%, #eee8ff 100%)",
          }}
        >
          <div className="container-fluid px-4 py-4">

            <div className="d-flex justify-content-between align-items-center">

              {/* TITLE */}

              <div>
                <h2 className="fw-bold mb-1">
                  Dashboard สรุปข้อมูล
                </h2>

                <p className="text-secondary mb-0">
                  ภาพรวมระบบยืม–คืนครุภัณฑ์
                </p>
              </div>


              {/* DATE */}

              <div className="d-none d-md-block">
                <div className="bg-white rounded-3 shadow-sm px-3 py-2">

                  <small className="text-secondary d-block">
                    วันนี้
                  </small>

                  <strong>
                    19 กันยายน 2569
                  </strong>

                </div>
              </div>

            </div>

          </div>
        </section>


        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <div className="container-fluid px-0">


          {/* =====================================================
              STAT CARDS
          ===================================================== */}

          <div className="row g-4 mb-4">

            <StatCard
              title="ครุภัณฑ์ทั้งหมด"
              value="248"
              subtitle="รายการ"
              icon="bi-box-seam"
              iconColor="#6f42c1"
              iconBg="#eee8ff"
              badge="+12"
            />

            <StatCard
              title="พร้อมใช้งาน"
              value="186"
              subtitle="รายการ"
              icon="bi-check-circle"
              iconColor="#198754"
              iconBg="#d1e7dd"
              badge="+8"
            />

            <StatCard
              title="กำลังถูกยืม"
              value="42"
              subtitle="รายการ"
              icon="bi-arrow-up-right-circle"
              iconColor="#997404"
              iconBg="#fff3cd"
              badge="+5"
            />

            <StatCard
              title="กำลังซ่อม"
              value="20"
              subtitle="รายการ"
              icon="bi-tools"
              iconColor="#dc3545"
              iconBg="#f8d7da"
              badge="-3"
            />

          </div>


          {/* =====================================================
              CHART + RECENT ACTIVITY
          ===================================================== */}

          <div className="row g-4 mb-4">


            {/* =================================================
                BORROW / RETURN CHART
            ================================================= */}

            <div className="col-xl-8">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>
                      <h5 className="fw-bold mb-1">
                        สถิติการยืม–คืน
                      </h5>

                      <small className="text-secondary">
                        จำนวนรายการยืมและคืนในแต่ละเดือน
                      </small>
                    </div>

                    <select
                      className="form-select form-select-sm"
                      style={{
                        width: "120px",
                      }}
                      defaultValue="2569"
                    >
                      <option value="2569">
                        ปี 2569
                      </option>

                      <option value="2568">
                        ปี 2568
                      </option>

                      <option value="2567">
                        ปี 2567
                      </option>
                    </select>

                  </div>


                  {/* BAR CHART */}

                  <div
                    className="d-flex align-items-end justify-content-between"
                    style={{
                      height: "280px",
                      padding: "10px 20px 0",
                    }}
                  >

                    {[
                      {
                        month: "ม.ค.",
                        borrow: 42,
                        returned: 35,
                      },
                      {
                        month: "ก.พ.",
                        borrow: 55,
                        returned: 43,
                      },
                      {
                        month: "มี.ค.",
                        borrow: 48,
                        returned: 40,
                      },
                      {
                        month: "เม.ย.",
                        borrow: 65,
                        returned: 52,
                      },
                      {
                        month: "พ.ค.",
                        borrow: 58,
                        returned: 48,
                      },
                      {
                        month: "มิ.ย.",
                        borrow: 72,
                        returned: 61,
                      },
                      {
                        month: "ก.ค.",
                        borrow: 68,
                        returned: 57,
                      },
                      {
                        month: "ส.ค.",
                        borrow: 76,
                        returned: 64,
                      },
                      {
                        month: "ก.ย.",
                        borrow: 64,
                        returned: 57,
                      },
                    ].map((item) => (

                      <div
                        key={item.month}
                        className="d-flex flex-column align-items-center"
                        style={{
                          flex: 1,
                        }}
                      >

                        <div
                          className="d-flex align-items-end gap-1"
                          style={{
                            height: "220px",
                          }}
                        >

                          {/* BORROW */}

                          <div
                            title={`ยืม ${item.borrow} รายการ`}
                            style={{
                              width: "14px",
                              height: `${item.borrow * 2.5}px`,
                              maxHeight: "210px",
                              background: "#6f42c1",
                              borderRadius: "5px 5px 0 0",
                            }}
                          />


                          {/* RETURN */}

                          <div
                            title={`คืน ${item.returned} รายการ`}
                            style={{
                              width: "14px",
                              height: `${item.returned * 2.5}px`,
                              maxHeight: "210px",
                              background: "#198754",
                              borderRadius: "5px 5px 0 0",
                            }}
                          />

                        </div>


                        <small className="text-secondary mt-2">
                          {item.month}
                        </small>

                      </div>

                    ))}

                  </div>


                  {/* LEGEND */}

                  <div className="d-flex justify-content-center gap-4 mt-3">

                    <span className="small">

                      <span
                        className="d-inline-block rounded-circle me-2"
                        style={{
                          width: "10px",
                          height: "10px",
                          background: "#6f42c1",
                        }}
                      />

                      รายการยืม

                    </span>


                    <span className="small">

                      <span
                        className="d-inline-block rounded-circle me-2"
                        style={{
                          width: "10px",
                          height: "10px",
                          background: "#198754",
                        }}
                      />

                      รายการคืน

                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                RECENT ACTIVITY
            ================================================= */}

            <div className="col-xl-4">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                      <h5 className="fw-bold mb-1">
                        กิจกรรมล่าสุด
                      </h5>

                      <small className="text-secondary">
                        รายการล่าสุดของระบบ
                      </small>

                    </div>

                    <i
                      className="bi bi-three-dots"
                      style={{
                        color: "#6c757d",
                      }}
                    />

                  </div>


                  <Activity
                    icon="bi-box-arrow-up-right"
                    color="#6f42c1"
                    bg="#eee8ff"
                    title="สมชาย ใจดี"
                    detail="ยืม Digital Camera"
                    time="10 นาทีที่แล้ว"
                  />

                  <Activity
                    icon="bi-check-circle"
                    color="#198754"
                    bg="#d1e7dd"
                    title="กมลชนก แสงดี"
                    detail="คืน Projector"
                    time="35 นาทีที่แล้ว"
                  />

                  <Activity
                    icon="bi-box-arrow-up-right"
                    color="#997404"
                    bg="#fff3cd"
                    title="ณัฐวุฒิ พรชัย"
                    detail="ยืม Notebook Computer"
                    time="1 ชั่วโมงที่แล้ว"
                  />

                  <Activity
                    icon="bi-person-plus"
                    color="#0d6efd"
                    bg="#cfe2ff"
                    title="วรพล ศรีสุข"
                    detail="เพิ่มผู้ใช้งานใหม่"
                    time="2 ชั่วโมงที่แล้ว"
                  />

                  <Activity
                    icon="bi-arrow-return-left"
                    color="#dc3545"
                    bg="#f8d7da"
                    title="นภัสสร วัฒนะ"
                    detail="คืน Wireless Microphone"
                    time="3 ชั่วโมงที่แล้ว"
                  />

                </div>

              </div>

            </div>

          </div>


          {/* =====================================================
              POPULAR EQUIPMENT + STATUS
          ===================================================== */}

          <div className="row g-4 mb-4">


            {/* =================================================
                POPULAR EQUIPMENT
            ================================================= */}

            <div className="col-lg-7">

              <div className="card border-0 shadow-sm rounded-4">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                      <h5 className="fw-bold mb-1">
                        ครุภัณฑ์ที่ถูกยืมบ่อย
                      </h5>

                      <small className="text-secondary">
                        รายการที่มีการใช้งานสูงสุด
                      </small>

                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      ดูทั้งหมด
                    </button>

                  </div>


                  <div className="table-responsive">

                    <table className="table align-middle mb-0">

                      <thead>

                        <tr>

                          <th>
                            อันดับ
                          </th>

                          <th>
                            ครุภัณฑ์
                          </th>

                          <th>
                            รหัส
                          </th>

                          <th className="text-end">
                            จำนวนครั้ง
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        <EquipmentRow
                          rank="1"
                          name="Notebook Computer"
                          code="SOC-LAP-001"
                          count="38"
                        />

                        <EquipmentRow
                          rank="2"
                          name="Digital Camera"
                          code="SOC-CAM-001"
                          count="34"
                        />

                        <EquipmentRow
                          rank="3"
                          name="Projector"
                          code="SOC-PRO-002"
                          count="31"
                        />

                        <EquipmentRow
                          rank="4"
                          name="Wireless Microphone"
                          code="SOC-MIC-001"
                          count="28"
                        />

                        <EquipmentRow
                          rank="5"
                          name="Tablet"
                          code="SOC-TAB-001"
                          count="27"
                        />

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                EQUIPMENT STATUS
            ================================================= */}

            <div className="col-lg-5">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <h5 className="fw-bold mb-1">
                    สถานะครุภัณฑ์
                  </h5>

                  <small className="text-secondary">
                    ภาพรวมสถานะครุภัณฑ์ทั้งหมด
                  </small>


                  <div className="mt-4">

                    <StatusBar
                      label="พร้อมใช้งาน"
                      value="186"
                      percent={75}
                      color="#198754"
                    />

                    <StatusBar
                      label="กำลังถูกยืม"
                      value="42"
                      percent={17}
                      color="#ffc107"
                    />

                    <StatusBar
                      label="กำลังซ่อม"
                      value="20"
                      percent={8}
                      color="#dc3545"
                    />

                  </div>


                  {/* INFO */}

                  <div
                    className="rounded-4 p-3 mt-4"
                    style={{
                      background: "#f8f5ff",
                    }}
                  >

                    <div className="d-flex gap-3">

                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "45px",
                          height: "45px",
                          background: "#eee8ff",
                          color: "#6f42c1",
                        }}
                      >

                        <i className="bi bi-info-circle" />

                      </div>


                      <div>

                        <div className="fw-semibold">
                          อัตราพร้อมใช้งาน
                        </div>

                        <small className="text-secondary">
                          ครุภัณฑ์พร้อมใช้งานคิดเป็น 75%
                          ของทั้งหมด
                        </small>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =====================================================
              QUICK SUMMARY
          ===================================================== */}

          <div className="row g-4">

            <SummaryCard
              icon="bi-calendar-check"
              title="รายการยืมเดือนนี้"
              value="64"
              unit="รายการ"
              color="#6f42c1"
            />

            <SummaryCard
              icon="bi-arrow-return-left"
              title="รายการคืนเดือนนี้"
              value="57"
              unit="รายการ"
              color="#198754"
            />

            <SummaryCard
              icon="bi-people"
              title="ผู้ใช้งานทั้งหมด"
              value="156"
              unit="คน"
              color="#0d6efd"
            />

            <SummaryCard
              icon="bi-clock-history"
              title="เฉลี่ยระยะเวลายืม"
              value="3.2"
              unit="วัน"
              color="#fd7e14"
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="py-4"
        style={{
          background: "#17131f",
          color: "#fff",
        }}
      >

        <div className="admin-page-content py-0">

          <div className="container-fluid px-0">

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">

              <div>

                <div className="fw-bold">
                  ระบบยืม–คืนครุภัณฑ์
                </div>

                <small className="text-white-50">
                  คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
                </small>

              </div>

              <small className="text-white-50">
                Admin Panel
              </small>

            </div>

          </div>

        </div>

      </footer>

    </main>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  iconBg,
  badge,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  badge: string;
}) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">

      <div className="card border-0 shadow-sm rounded-4 h-100">

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-start">

            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: "50px",
                height: "50px",
                background: iconBg,
                color: iconColor,
              }}
            >
              <i className={`bi ${icon} fs-5`} />
            </div>

            <span
              className="badge rounded-pill"
              style={{
                background: iconBg,
                color: iconColor,
              }}
            >
              {badge}
            </span>

          </div>


          <div className="mt-3">

            <div className="text-secondary small">
              {title}
            </div>

            <div className="d-flex align-items-baseline gap-2">

              <span className="fs-2 fw-bold">
                {value}
              </span>

              <small className="text-secondary">
                {subtitle}
              </small>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   ACTIVITY
========================================================= */

function Activity({
  icon,
  color,
  bg,
  title,
  detail,
  time,
}: {
  icon: string;
  color: string;
  bg: string;
  title: string;
  detail: string;
  time: string;
}) {
  return (
    <div className="d-flex gap-3 mb-4">

      <div
        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: "42px",
          height: "42px",
          background: bg,
          color: color,
        }}
      >
        <i className={`bi ${icon}`} />
      </div>


      <div>

        <div className="fw-semibold">
          {title}
        </div>

        <div className="small text-secondary">
          {detail}
        </div>

        <div className="small text-muted">
          {time}
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   EQUIPMENT ROW
========================================================= */

function EquipmentRow({
  rank,
  name,
  code,
  count,
}: {
  rank: string;
  name: string;
  code: string;
  count: string;
}) {
  return (
    <tr>

      <td>

        <span
          className="rounded-circle d-inline-flex align-items-center justify-content-center"
          style={{
            width: "32px",
            height: "32px",
            background:
              rank === "1"
                ? "#eee8ff"
                : "#f8f9fa",
            color:
              rank === "1"
                ? "#6f42c1"
                : "#6c757d",
            fontWeight: 700,
          }}
        >
          {rank}
        </span>

      </td>


      <td>

        <div className="fw-semibold">
          {name}
        </div>

      </td>


      <td>

        <small className="text-secondary">
          {code}
        </small>

      </td>


      <td className="text-end fw-semibold">
        {count}
      </td>

    </tr>
  );
}


/* =========================================================
   STATUS BAR
========================================================= */

function StatusBar({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: string;
  percent: number;
  color: string;
}) {
  return (
    <div className="mb-4">

      <div className="d-flex justify-content-between mb-2">

        <span className="fw-semibold">
          {label}
        </span>

        <span className="text-secondary">
          {value} รายการ ({percent}%)
        </span>

      </div>


      <div
        className="progress"
        style={{
          height: "9px",
          background: "#f1f3f5",
        }}
      >

        <div
          className="progress-bar rounded-pill"
          style={{
            width: `${percent}%`,
            background: color,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  title,
  value,
  unit,
  color,
}: {
  icon: string;
  title: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">

      <div className="card border-0 shadow-sm rounded-4 h-100">

        <div className="card-body p-4">

          <div className="d-flex align-items-center gap-3">

            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "48px",
                height: "48px",
                background: `${color}15`,
                color: color,
              }}
            >
              <i className={`bi ${icon} fs-5`} />
            </div>


            <div>

              <small className="text-secondary d-block">
                {title}
              </small>

              <div className="d-flex align-items-baseline gap-2">

                <span className="fs-4 fw-bold">
                  {value}
                </span>

                <small className="text-secondary">
                  {unit}
                </small>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}