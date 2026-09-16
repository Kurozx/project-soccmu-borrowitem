"use client";

import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function DashboardPage() {
  return (
    <main className="bg-light min-vh-100">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div className="container py-2">

          <Link
            href="/"
            className="navbar-brand d-flex align-items-center gap-3"
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "48px",
                height: "48px",
                background: "#6f42c1",
                color: "white",
              }}
            >
              <i className="bi bi-box-seam fs-4"></i>
            </div>

            <div>
              <div className="fw-bold text-dark">
                ระบบยืม–คืนครุภัณฑ์
              </div>

              <small className="text-secondary">
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
              </small>
            </div>
          </Link>


          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>


          <div
            className="collapse navbar-collapse"
            id="navbarMenu"
          >
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">

              <li className="nav-item">
                <Link
                  href="/"
                  className="nav-link"
                >
                  <i className="bi bi-house me-1"></i>
                  หน้าหลัก
                </Link>
              </li>


              <li className="nav-item">
                <Link
                  href="/equipment"
                  className="nav-link"
                >
                  <i className="bi bi-box me-1"></i>
                  ครุภัณฑ์
                </Link>
              </li>


              <li className="nav-item">
                <Link
                  href="/search"
                  className="nav-link"
                >
                  <i className="bi bi-search me-1"></i>
                  ค้นหา
                </Link>
              </li>


              <li className="nav-item">
                <Link
                  href="/history"
                  className="nav-link"
                >
                  <i className="bi bi-clock-history me-1"></i>
                  ประวัติ
                </Link>
              </li>


              <li className="nav-item">
                <Link
                  href="/borrowing"
                  className="nav-link"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i>
                  กำลังยืม
                </Link>
              </li>


              <li className="nav-item">
                <Link
                  href="/dashboard"
                  className="nav-link active fw-semibold"
                >
                  <i className="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </Link>
              </li>


              <li className="nav-item ms-lg-2">
                <Link
                  href="/profile"
                  className="btn rounded-pill px-4 text-white"
                  style={{
                    background: "#6f42c1",
                  }}
                >
                  <i className="bi bi-person-circle me-2"></i>
                  โปรไฟล์
                </Link>
              </li>

            </ul>
          </div>

        </div>
      </nav>


      {/* =====================================================
          DASHBOARD HEADER
      ===================================================== */}

      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(135deg, #f5f0ff 0%, #ffffff 60%, #eee8ff 100%)",
        }}
      >
        <div className="container">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">

            <div>

              <span className="badge rounded-pill bg-white border text-primary px-3 py-2 mb-3">

                <i className="bi bi-speedometer2 me-2"></i>

                DASHBOARD

              </span>


              <h1 className="fw-bold display-6 mb-2">
                Dashboard สรุปข้อมูล
              </h1>


              <p className="text-secondary mb-0">
                ภาพรวมข้อมูลการยืม–คืนครุภัณฑ์
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
              </p>

            </div>


            <div className="bg-white shadow-sm rounded-4 p-3">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "#eee8ff",
                    color: "#6f42c1",
                  }}
                >
                  <i className="bi bi-calendar3 fs-5"></i>
                </div>

                <div>
                  <small className="text-secondary d-block">
                    ข้อมูล ณ วันที่
                  </small>

                  <strong>
                    7 กันยายน 2026
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}

      <section className="py-4 pb-5">

        <div className="container">


          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="row g-4 mb-4">

            <DashboardStat
              icon="bi-box-seam"
              title="ครุภัณฑ์ทั้งหมด"
              number="248"
              description="รายการ"
              iconBg="#eee8ff"
              iconColor="#6f42c1"
              trend="+12"
              trendText="จากเดือนที่แล้ว"
            />


            <DashboardStat
              icon="bi-check-circle-fill"
              title="พร้อมใช้งาน"
              number="186"
              description="รายการ"
              iconBg="#d1e7dd"
              iconColor="#198754"
              trend="+8"
              trendText="จากเดือนที่แล้ว"
            />


            <DashboardStat
              icon="bi-box-arrow-up-right"
              title="กำลังถูกยืม"
              number="42"
              description="รายการ"
              iconBg="#fff3cd"
              iconColor="#997404"
              trend="+5"
              trendText="จากเดือนที่แล้ว"
            />


            <DashboardStat
              icon="bi-tools"
              title="กำลังซ่อม"
              number="20"
              description="รายการ"
              iconBg="#f8d7da"
              iconColor="#dc3545"
              trend="-3"
              trendText="จากเดือนที่แล้ว"
            />

          </div>


          {/* =================================================
              SECOND ROW
          ================================================= */}

          <div className="row g-4 mb-4">


            {/* MONTHLY BORROW */}

            <div className="col-lg-8">

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
                      className="form-select form-select-sm rounded-pill"
                      style={{
                        width: "130px",
                      }}
                      defaultValue="2026"
                    >
                      <option value="2026">
                        ปี 2026
                      </option>

                      <option value="2025">
                        ปี 2025
                      </option>

                      <option value="2024">
                        ปี 2024
                      </option>
                    </select>

                  </div>


                  {/* SIMPLE CHART */}

                  <div
                    className="d-flex align-items-end gap-3 px-2"
                    style={{
                      height: "270px",
                    }}
                  >

                    {[
                      {
                        month: "ม.ค.",
                        borrow: 45,
                        returned: 38,
                      },
                      {
                        month: "ก.พ.",
                        borrow: 52,
                        returned: 44,
                      },
                      {
                        month: "มี.ค.",
                        borrow: 68,
                        returned: 59,
                      },
                      {
                        month: "เม.ย.",
                        borrow: 48,
                        returned: 41,
                      },
                      {
                        month: "พ.ค.",
                        borrow: 72,
                        returned: 65,
                      },
                      {
                        month: "มิ.ย.",
                        borrow: 83,
                        returned: 75,
                      },
                      {
                        month: "ก.ค.",
                        borrow: 76,
                        returned: 70,
                      },
                      {
                        month: "ส.ค.",
                        borrow: 91,
                        returned: 82,
                      },
                      {
                        month: "ก.ย.",
                        borrow: 64,
                        returned: 57,
                      },
                    ].map((data) => (

                      <div
                        key={data.month}
                        className="flex-grow-1 d-flex flex-column align-items-center justify-content-end h-100"
                      >

                        <div
                          className="d-flex align-items-end gap-1"
                          style={{
                            height: "220px",
                          }}
                        >

                          <div
                            className="rounded-top"
                            title={`ยืม ${data.borrow} รายการ`}
                            style={{
                              width: "12px",
                              height: `${data.borrow * 2}px`,
                              maxHeight: "200px",
                              background: "#6f42c1",
                            }}
                          ></div>


                          <div
                            className="rounded-top"
                            title={`คืน ${data.returned} รายการ`}
                            style={{
                              width: "12px",
                              height: `${data.returned * 2}px`,
                              maxHeight: "180px",
                              background: "#198754",
                            }}
                          ></div>

                        </div>


                        <small className="text-secondary mt-2">
                          {data.month}
                        </small>

                      </div>

                    ))}

                  </div>


                  <div className="d-flex justify-content-center gap-4 mt-3">

                    <div className="d-flex align-items-center gap-2">

                      <span
                        className="rounded-circle"
                        style={{
                          width: "10px",
                          height: "10px",
                          background: "#6f42c1",
                        }}
                      ></span>

                      <small>
                        ยืม
                      </small>

                    </div>


                    <div className="d-flex align-items-center gap-2">

                      <span
                        className="rounded-circle"
                        style={{
                          width: "10px",
                          height: "10px",
                          background: "#198754",
                        }}
                      ></span>

                      <small>
                        คืน
                      </small>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* EQUIPMENT STATUS */}

            <div className="col-lg-4">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <h5 className="fw-bold mb-1">
                    สถานะครุภัณฑ์
                  </h5>

                  <small className="text-secondary">
                    สถานะปัจจุบันของครุภัณฑ์ทั้งหมด
                  </small>


                  <div className="text-center my-4">

                    <div
                      className="mx-auto rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "170px",
                        height: "170px",
                        background:
                          "conic-gradient(#198754 0deg 270deg, #ffc107 270deg 330deg, #dc3545 330deg 360deg)",
                      }}
                    >

                      <div
                        className="rounded-circle bg-white d-flex flex-column align-items-center justify-content-center"
                        style={{
                          width: "125px",
                          height: "125px",
                        }}
                      >

                        <div className="fs-2 fw-bold">
                          248
                        </div>

                        <small className="text-secondary">
                          รายการ
                        </small>

                      </div>

                    </div>

                  </div>


                  <StatusRow
                    color="#198754"
                    title="พร้อมใช้งาน"
                    value="186"
                    percent="75%"
                  />


                  <StatusRow
                    color="#ffc107"
                    title="กำลังยืม"
                    value="42"
                    percent="17%"
                  />


                  <StatusRow
                    color="#dc3545"
                    title="กำลังซ่อม"
                    value="20"
                    percent="8%"
                  />

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              THIRD ROW
          ================================================= */}

          <div className="row g-4 mb-4">


            {/* POPULAR EQUIPMENT */}

            <div className="col-lg-7">

              <div className="card border-0 shadow-sm rounded-4">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                      <h5 className="fw-bold mb-1">
                        ครุภัณฑ์ที่ถูกยืมบ่อย
                      </h5>

                      <small className="text-secondary">
                        5 อันดับครุภัณฑ์ที่มีการยืมสูงสุด
                      </small>

                    </div>

                    <Link
                      href="/equipment"
                      className="btn btn-outline-dark btn-sm rounded-pill"
                    >
                      ดูทั้งหมด
                    </Link>

                  </div>


                  <PopularEquipment
                    rank="01"
                    icon="bi-camera"
                    name="Digital Camera"
                    code="SOC-CAM-001"
                    count="48"
                    percent="92%"
                  />


                  <PopularEquipment
                    rank="02"
                    icon="bi-projector"
                    name="Projector"
                    code="SOC-PRO-002"
                    count="41"
                    percent="78%"
                  />


                  <PopularEquipment
                    rank="03"
                    icon="bi-laptop"
                    name="Notebook Computer"
                    code="SOC-LAP-001"
                    count="36"
                    percent="69%"
                  />


                  <PopularEquipment
                    rank="04"
                    icon="bi-mic"
                    name="Wireless Microphone"
                    code="SOC-MIC-001"
                    count="31"
                    percent="59%"
                  />


                  <PopularEquipment
                    rank="05"
                    icon="bi-tablet"
                    name="Tablet"
                    code="SOC-TAB-001"
                    count="27"
                    percent="52%"
                  />

                </div>

              </div>

            </div>


            {/* RECENT ACTIVITY */}

            <div className="col-lg-5">

              <div className="card border-0 shadow-sm rounded-4">

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

                  </div>


                  <Activity
                    icon="bi-box-arrow-up-right"
                    iconBg="#eee8ff"
                    iconColor="#6f42c1"
                    title="สมชาย ใจดี"
                    description="ยืม Digital Camera"
                    time="10 นาทีที่แล้ว"
                  />


                  <Activity
                    icon="bi-check-circle"
                    iconBg="#d1e7dd"
                    iconColor="#198754"
                    title="กมลชนก แสงดี"
                    description="คืน Projector"
                    time="35 นาทีที่แล้ว"
                  />


                  <Activity
                    icon="bi-box-arrow-up-right"
                    iconBg="#eee8ff"
                    iconColor="#6f42c1"
                    title="ธนกร ใจบุญ"
                    description="ยืม Notebook Computer"
                    time="1 ชั่วโมงที่แล้ว"
                  />


                  <Activity
                    icon="bi-tools"
                    iconBg="#f8d7da"
                    iconColor="#dc3545"
                    title="เจ้าหน้าที่"
                    description="เปลี่ยนสถานะ Camera เป็นกำลังซ่อม"
                    time="2 ชั่วโมงที่แล้ว"
                  />


                  <Activity
                    icon="bi-check-circle"
                    iconBg="#d1e7dd"
                    iconColor="#198754"
                    title="พิมพ์ชนก สุขใจ"
                    description="คืน Wireless Microphone"
                    time="3 ชั่วโมงที่แล้ว"
                  />

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              FOURTH ROW
          ================================================= */}

          <div className="row g-4">


            {/* CATEGORY */}

            <div className="col-lg-5">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <h5 className="fw-bold mb-1">
                    ครุภัณฑ์ตามประเภท
                  </h5>

                  <small className="text-secondary">
                    จำนวนครุภัณฑ์แยกตามหมวดหมู่
                  </small>


                  <div className="mt-4">

                    <CategoryBar
                      icon="bi-camera"
                      name="อุปกรณ์ถ่ายภาพ"
                      count="68"
                      percent="27%"
                      width="27%"
                    />


                    <CategoryBar
                      icon="bi-laptop"
                      name="คอมพิวเตอร์"
                      count="54"
                      percent="22%"
                      width="22%"
                    />


                    <CategoryBar
                      icon="bi-projector"
                      name="อุปกรณ์นำเสนอ"
                      count="47"
                      percent="19%"
                      width="19%"
                    />


                    <CategoryBar
                      icon="bi-mic"
                      name="อุปกรณ์เสียง"
                      count="39"
                      percent="16%"
                      width="16%"
                    />


                    <CategoryBar
                      icon="bi-box"
                      name="อื่น ๆ"
                      count="40"
                      percent="16%"
                      width="16%"
                    />

                  </div>

                </div>

              </div>

            </div>


            {/* BORROW SUMMARY */}

            <div className="col-lg-7">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                      <h5 className="fw-bold mb-1">
                        สรุปการยืม–คืน
                      </h5>

                      <small className="text-secondary">
                        ข้อมูลการใช้งานระบบในเดือนนี้
                      </small>

                    </div>


                    <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2">

                      กันยายน 2026

                    </span>

                  </div>


                  <div className="row g-3">

                    <SummaryBox
                      icon="bi-box-arrow-up-right"
                      title="รายการยืม"
                      value="64"
                      unit="รายการ"
                      color="#6f42c1"
                    />


                    <SummaryBox
                      icon="bi-box-arrow-in-left"
                      title="รายการคืน"
                      value="57"
                      unit="รายการ"
                      color="#198754"
                    />


                    <SummaryBox
                      icon="bi-clock-history"
                      title="เฉลี่ยระยะเวลายืม"
                      value="3.2"
                      unit="วัน"
                      color="#fd7e14"
                    />


                    <SummaryBox
                      icon="bi-people"
                      title="ผู้ใช้งานที่ยืม"
                      value="48"
                      unit="คน"
                      color="#0d6efd"
                    />

                  </div>


                  <div className="alert alert-light border rounded-4 mt-4 mb-0">

                    <div className="d-flex gap-3">

                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: "45px",
                          height: "45px",
                          background: "#eee8ff",
                          color: "#6f42c1",
                        }}
                      >

                        <i className="bi bi-graph-up"></i>

                      </div>


                      <div>

                        <div className="fw-semibold">
                          แนวโน้มการใช้งานเพิ่มขึ้น
                        </div>

                        <small className="text-secondary">
                          จำนวนการยืมเพิ่มขึ้น 12.5%
                          เมื่อเทียบกับเดือนที่ผ่านมา
                        </small>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="py-4 text-white"
        style={{
          background: "#17131f",
        }}
      >

        <div className="container">

          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">

            <div>

              <div className="fw-bold">
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

    </main>
  );
}


/* =====================================================
   DASHBOARD STAT
===================================================== */

function DashboardStat({
  icon,
  title,
  number,
  description,
  iconBg,
  iconColor,
  trend,
  trendText,
}: {
  icon: string;
  title: string;
  number: string;
  description: string;
  iconBg: string;
  iconColor: string;
  trend: string;
  trendText: string;
}) {

  return (
    <div className="col-12 col-sm-6 col-xl-3">

      <div className="card border-0 shadow-sm rounded-4 h-100">

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-start">

            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: "52px",
                height: "52px",
                background: iconBg,
                color: iconColor,
              }}
            >
              <i className={`${icon} fs-5`}></i>
            </div>


            <span className="badge bg-success-subtle text-success rounded-pill">
              {trend}
            </span>

          </div>


          <div className="mt-4">

            <small className="text-secondary">
              {title}
            </small>

            <div className="mt-1">

              <span className="display-6 fw-bold">
                {number}
              </span>

              <span className="text-secondary ms-2">
                {description}
              </span>

            </div>

          </div>


          <small className="text-secondary">
            {trendText}
          </small>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   STATUS ROW
===================================================== */

function StatusRow({
  color,
  title,
  value,
  percent,
}: {
  color: string;
  title: string;
  value: string;
  percent: string;
}) {

  return (
    <div className="mb-3">

      <div className="d-flex justify-content-between mb-1">

        <div className="d-flex align-items-center gap-2">

          <span
            className="rounded-circle"
            style={{
              width: "9px",
              height: "9px",
              background: color,
            }}
          ></span>

          <small>
            {title}
          </small>

        </div>


        <small className="fw-semibold">
          {value}
        </small>

      </div>


      <div
        className="progress"
        style={{
          height: "7px",
        }}
      >

        <div
          className="progress-bar"
          style={{
            width: percent,
            background: color,
          }}
        ></div>

      </div>

    </div>
  );
}


/* =====================================================
   POPULAR EQUIPMENT
===================================================== */

function PopularEquipment({
  rank,
  icon,
  name,
  code,
  count,
  percent,
}: {
  rank: string;
  icon: string;
  name: string;
  code: string;
  count: string;
  percent: string;
}) {

  return (
    <div className="d-flex align-items-center gap-3 mb-3">

      <div
        className="fw-bold text-secondary"
        style={{
          width: "25px",
        }}
      >
        {rank}
      </div>


      <div
        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: "48px",
          height: "48px",
          background: "#f1eef6",
          color: "#6f42c1",
        }}
      >

        <i className={`${icon} fs-5`}></i>

      </div>


      <div className="flex-grow-1">

        <div className="fw-semibold">
          {name}
        </div>

        <small className="text-secondary">
          {code}
        </small>

        <div
          className="progress mt-2"
          style={{
            height: "5px",
          }}
        >

          <div
            className="progress-bar"
            style={{
              width: percent,
              background: "#6f42c1",
            }}
          ></div>

        </div>

      </div>


      <div className="text-end">

        <strong>
          {count}
        </strong>

        <small className="text-secondary d-block">
          ครั้ง
        </small>

      </div>

    </div>
  );
}


/* =====================================================
   ACTIVITY
===================================================== */

function Activity({
  icon,
  iconBg,
  iconColor,
  title,
  description,
  time,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
}) {

  return (
    <div className="d-flex gap-3 mb-4">

      <div
        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: "42px",
          height: "42px",
          background: iconBg,
          color: iconColor,
        }}
      >

        <i className={icon}></i>

      </div>


      <div className="flex-grow-1">

        <div className="fw-semibold">
          {title}
        </div>

        <div className="small text-secondary">
          {description}
        </div>

        <div className="small text-secondary mt-1">
          <i className="bi bi-clock me-1"></i>
          {time}
        </div>

      </div>

    </div>
  );
}


/* =====================================================
   CATEGORY BAR
===================================================== */

function CategoryBar({
  icon,
  name,
  count,
  percent,
  width,
}: {
  icon: string;
  name: string;
  count: string;
  percent: string;
  width: string;
}) {

  return (
    <div className="mb-4">

      <div className="d-flex justify-content-between align-items-center mb-2">

        <div className="d-flex align-items-center gap-2">

          <i
            className={`${icon}`}
            style={{
              color: "#6f42c1",
            }}
          ></i>

          <span>
            {name}
          </span>

        </div>


        <div>

          <strong>
            {count}
          </strong>

          <small className="text-secondary ms-2">
            {percent}
          </small>

        </div>

      </div>


      <div
        className="progress"
        style={{
          height: "8px",
        }}
      >

        <div
          className="progress-bar"
          style={{
            width,
            background: "#6f42c1",
          }}
        ></div>

      </div>

    </div>
  );
}


/* =====================================================
   SUMMARY BOX
===================================================== */

function SummaryBox({
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
    <div className="col-sm-6">

      <div
        className="border rounded-4 p-3 h-100"
        style={{
          background: "#fafafa",
        }}
      >

        <div className="d-flex align-items-center gap-3">

          <div
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{
              width: "45px",
              height: "45px",
              background: `${color}15`,
              color,
            }}
          >

            <i className={icon}></i>

          </div>


          <div>

            <small className="text-secondary d-block">
              {title}
            </small>

            <strong className="fs-4">
              {value}
            </strong>

            <small className="text-secondary ms-1">
              {unit}
            </small>

          </div>

        </div>

      </div>

    </div>
  );
}