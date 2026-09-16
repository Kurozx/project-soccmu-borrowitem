"use client";

import { useState } from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type EquipmentStatus = "พร้อมใช้งาน" | "ถูกยืม" | "ชำรุด";

type Equipment = {
  id: number;
  code: string;
  name: string;
  category: string;
  location: string;
  status: EquipmentStatus;
  icon: string;
  description: string;
  brand: string;
  model: string;
};

const equipmentData: Equipment[] = [
  {
    id: 1,
    code: "SOC-LAP-001",
    name: "Notebook Computer",
    category: "คอมพิวเตอร์",
    location: "ห้องปฏิบัติการคอมพิวเตอร์",
    status: "พร้อมใช้งาน",
    icon: "bi-laptop",
    description:
      "คอมพิวเตอร์โน้ตบุ๊กสำหรับใช้ในการเรียนการสอน การทำงานวิจัย และกิจกรรมต่าง ๆ ของคณะ",
    brand: "Dell",
    model: "Latitude 5420",
  },
  {
    id: 2,
    code: "SOC-LAP-002",
    name: "Notebook Computer",
    category: "คอมพิวเตอร์",
    location: "ห้องปฏิบัติการคอมพิวเตอร์",
    status: "ถูกยืม",
    icon: "bi-laptop",
    description:
      "คอมพิวเตอร์โน้ตบุ๊กสำหรับงานทั่วไปและการเรียนการสอน",
    brand: "Lenovo",
    model: "ThinkPad E14",
  },
  {
    id: 3,
    code: "SOC-CAM-001",
    name: "Digital Camera",
    category: "อุปกรณ์ถ่ายภาพ",
    location: "ห้องโสตทัศนศึกษา",
    status: "พร้อมใช้งาน",
    icon: "bi-camera",
    description:
      "กล้องดิจิทัลสำหรับการบันทึกภาพกิจกรรม การเรียนการสอน และงานประชาสัมพันธ์",
    brand: "Canon",
    model: "EOS 90D",
  },
  {
    id: 4,
    code: "SOC-CAM-002",
    name: "Digital Camera",
    category: "อุปกรณ์ถ่ายภาพ",
    location: "ห้องโสตทัศนศึกษา",
    status: "พร้อมใช้งาน",
    icon: "bi-camera",
    description:
      "กล้องดิจิทัลพร้อมอุปกรณ์เสริมสำหรับการถ่ายภาพและบันทึกกิจกรรมของคณะ",
    brand: "Sony",
    model: "Alpha A6400",
  },
  {
    id: 5,
    code: "SOC-PRO-001",
    name: "Projector",
    category: "อุปกรณ์นำเสนอ",
    location: "ห้องประชุมคณะ",
    status: "ถูกยืม",
    icon: "bi-projector",
    description:
      "เครื่องฉายภาพสำหรับใช้ในการประชุม การเรียนการสอน และการนำเสนอผลงาน",
    brand: "Epson",
    model: "EB-X06",
  },
  {
    id: 6,
    code: "SOC-PRO-002",
    name: "Projector",
    category: "อุปกรณ์นำเสนอ",
    location: "ห้องประชุมคณะ",
    status: "พร้อมใช้งาน",
    icon: "bi-projector",
    description:
      "เครื่องฉายภาพความละเอียดสูงสำหรับห้องเรียนและห้องประชุม",
    brand: "BenQ",
    model: "MH550",
  },
  {
    id: 7,
    code: "SOC-MIC-001",
    name: "Wireless Microphone",
    category: "อุปกรณ์เสียง",
    location: "ห้องโสตทัศนศึกษา",
    status: "พร้อมใช้งาน",
    icon: "bi-mic",
    description:
      "ไมโครโฟนไร้สายสำหรับการประชุม การบรรยาย และกิจกรรมของคณะ",
    brand: "Shure",
    model: "BLX24/SM58",
  },
  {
    id: 8,
    code: "SOC-MON-001",
    name: "Computer Monitor",
    category: "คอมพิวเตอร์",
    location: "ห้องปฏิบัติการคอมพิวเตอร์",
    status: "ชำรุด",
    icon: "bi-display",
    description:
      "จอภาพคอมพิวเตอร์สำหรับใช้งานร่วมกับเครื่องคอมพิวเตอร์ภายในห้องปฏิบัติการ",
    brand: "LG",
    model: "24MP400",
  },
  {
    id: 9,
    code: "SOC-TAB-001",
    name: "Tablet",
    category: "อุปกรณ์อิเล็กทรอนิกส์",
    location: "สำนักงานคณะ",
    status: "พร้อมใช้งาน",
    icon: "bi-tablet",
    description:
      "แท็บเล็ตสำหรับใช้ในการเรียนการสอน การประชุม และงานภายในคณะ",
    brand: "Samsung",
    model: "Galaxy Tab S9",
  },
];

export default function EquipmentPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [status, setStatus] = useState("ทั้งหมด");

  // ครุภัณฑ์ที่กำลังเปิด Modal
  const [selectedEquipment, setSelectedEquipment] =
    useState<Equipment | null>(null);

  const filteredEquipment = equipmentData.filter((item) => {
    const searchText = search.toLowerCase().trim();

    const searchMatch =
      item.name.toLowerCase().includes(searchText) ||
      item.code.toLowerCase().includes(searchText) ||
      item.category.toLowerCase().includes(searchText) ||
      item.brand.toLowerCase().includes(searchText) ||
      item.model.toLowerCase().includes(searchText);

    const categoryMatch =
      category === "ทั้งหมด" || item.category === category;

    const statusMatch =
      status === "ทั้งหมด" || item.status === status;

    return searchMatch && categoryMatch && statusMatch;
  });

  const availableCount = equipmentData.filter(
    (item) => item.status === "พร้อมใช้งาน"
  ).length;

  const borrowedCount = equipmentData.filter(
    (item) => item.status === "ถูกยืม"
  ).length;

  const damagedCount = equipmentData.filter(
    (item) => item.status === "ชำรุด"
  ).length;

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
                  className="nav-link"
                  href="/"
                >
                  <i className="bi bi-house me-1"></i>
                  หน้าหลัก
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link active fw-semibold"
                  href="/equipment"
                >
                  <i className="bi bi-box me-1"></i>
                  ครุภัณฑ์
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link"
                  href="/history"
                >
                  <i className="bi bi-clock-history me-1"></i>
                  ประวัติการยืม
                </Link>
              </li>

              <li className="nav-item ms-lg-2">
                <button
                  className="btn btn-outline-dark rounded-pill px-4"
                >
                  <i className="bi bi-person me-1"></i>
                  เข้าสู่ระบบ
                </button>
              </li>

            </ul>
          </div>

        </div>
      </nav>


      {/* =====================================================
          HEADER
      ===================================================== */}
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(135deg, #f5f0ff 0%, #ffffff 60%, #eee8ff 100%)",
        }}
      >
        <div className="container">

          <div className="row align-items-center">

            <div className="col-lg-8">

              <span className="badge rounded-pill bg-white text-primary border px-3 py-2 mb-3">
                <i className="bi bi-box-seam me-2"></i>
                EQUIPMENT
              </span>

              <h1 className="fw-bold display-6 mb-3">
                รายการครุภัณฑ์
              </h1>

              <p className="text-secondary lead mb-0">
                ค้นหา ตรวจสอบรายละเอียด และสถานะของครุภัณฑ์
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
              </p>

            </div>

            <div className="col-lg-4 mt-4 mt-lg-0">

              <div className="bg-white rounded-4 shadow-sm p-4">

                <div className="text-secondary small mb-1">
                  ครุภัณฑ์ทั้งหมด
                </div>

                <div className="d-flex align-items-center gap-2 mb-3">

                  <i
                    className="bi bi-box-seam fs-2"
                    style={{ color: "#6f42c1" }}
                  ></i>

                  <span className="fs-2 fw-bold">
                    {equipmentData.length}
                  </span>

                  <span className="text-secondary">
                    รายการ
                  </span>

                </div>

                <div className="row g-2">

                  <div className="col-4">
                    <div className="text-center bg-success bg-opacity-10 rounded-3 py-2">
                      <div className="fw-bold text-success">
                        {availableCount}
                      </div>
                      <small className="text-secondary">
                        พร้อมใช้
                      </small>
                    </div>
                  </div>

                  <div className="col-4">
                    <div className="text-center bg-warning bg-opacity-10 rounded-3 py-2">
                      <div className="fw-bold text-warning">
                        {borrowedCount}
                      </div>
                      <small className="text-secondary">
                        ถูกยืม
                      </small>
                    </div>
                  </div>

                  <div className="col-4">
                    <div className="text-center bg-danger bg-opacity-10 rounded-3 py-2">
                      <div className="fw-bold text-danger">
                        {damagedCount}
                      </div>
                      <small className="text-secondary">
                        ชำรุด
                      </small>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          SEARCH / FILTER
      ===================================================== */}
      <section className="py-4">
        <div className="container">

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">

              <div className="row g-3">

                {/* SEARCH */}
                <div className="col-lg-6">

                  <label className="form-label fw-semibold">
                    ค้นหาครุภัณฑ์
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-white">
                      <i className="bi bi-search"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหาชื่อ, รหัส, ยี่ห้อ หรือรุ่น..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                    />

                    {search && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setSearch("")}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}

                  </div>

                </div>


                {/* CATEGORY */}
                <div className="col-md-6 col-lg-3">

                  <label className="form-label fw-semibold">
                    ประเภท
                  </label>

                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                  >
                    <option value="ทั้งหมด">
                      ทั้งหมด
                    </option>

                    <option value="คอมพิวเตอร์">
                      คอมพิวเตอร์
                    </option>

                    <option value="อุปกรณ์ถ่ายภาพ">
                      อุปกรณ์ถ่ายภาพ
                    </option>

                    <option value="อุปกรณ์นำเสนอ">
                      อุปกรณ์นำเสนอ
                    </option>

                    <option value="อุปกรณ์เสียง">
                      อุปกรณ์เสียง
                    </option>

                    <option value="อุปกรณ์อิเล็กทรอนิกส์">
                      อุปกรณ์อิเล็กทรอนิกส์
                    </option>
                  </select>

                </div>


                {/* STATUS */}
                <div className="col-md-6 col-lg-3">

                  <label className="form-label fw-semibold">
                    สถานะ
                  </label>

                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                  >
                    <option value="ทั้งหมด">
                      ทั้งหมด
                    </option>

                    <option value="พร้อมใช้งาน">
                      พร้อมใช้งาน
                    </option>

                    <option value="ถูกยืม">
                      ถูกยืม
                    </option>

                    <option value="ชำรุด">
                      ชำรุด
                    </option>
                  </select>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>


      {/* =====================================================
          EQUIPMENT LIST
      ===================================================== */}
      <section className="pb-5">
        <div className="container">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">

            <div>
              <h4 className="fw-bold mb-1">
                ครุภัณฑ์ทั้งหมด
              </h4>

              <span className="text-secondary">
                พบ {filteredEquipment.length} รายการ
              </span>
            </div>

            <div className="d-flex gap-2">

              {(search ||
                category !== "ทั้งหมด" ||
                status !== "ทั้งหมด") && (
                <button
                  className="btn btn-outline-danger rounded-pill px-3"
                  onClick={() => {
                    setSearch("");
                    setCategory("ทั้งหมด");
                    setStatus("ทั้งหมด");
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i>
                  ล้างตัวกรอง
                </button>
              )}

            </div>

          </div>


          {/* CARDS */}
          <div className="row g-4">

            {filteredEquipment.map((item) => (
              <div
                className="col-md-6 col-lg-4"
                key={item.id}
              >

                <EquipmentCard
                  equipment={item}
                  onDetail={() =>
                    setSelectedEquipment(item)
                  }
                />

              </div>
            ))}

          </div>


          {/* EMPTY STATE */}
          {filteredEquipment.length === 0 && (
            <div className="text-center py-5">

              <div
                className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "100px",
                  height: "100px",
                  background: "#eee8ff",
                  color: "#6f42c1",
                }}
              >
                <i className="bi bi-search fs-1"></i>
              </div>

              <h4 className="fw-bold">
                ไม่พบครุภัณฑ์
              </h4>

              <p className="text-secondary mb-4">
                ไม่พบครุภัณฑ์ที่ตรงกับเงื่อนไขการค้นหา
              </p>

              <button
                className="btn btn-dark rounded-pill px-4"
                onClick={() => {
                  setSearch("");
                  setCategory("ทั้งหมด");
                  setStatus("ทั้งหมด");
                }}
              >
                แสดงครุภัณฑ์ทั้งหมด
              </button>

            </div>
          )}

        </div>
      </section>


      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}
      {selectedEquipment && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
          onClick={() =>
            setSelectedEquipment(null)
          }
        >

          <div
            className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
            role="document"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">


              {/* ================= MODAL HEADER IMAGE ================= */}
              <div
                className="position-relative d-flex align-items-center justify-content-center"
                style={{
                  height: "250px",
                  background:
                    "linear-gradient(135deg, #f4f0fa, #eee8ff)",
                  color: "#6f42c1",
                }}
              >

                <i
                  className={selectedEquipment.icon}
                  style={{
                    fontSize: "100px",
                  }}
                ></i>


                {/* CLOSE */}
                <button
                  type="button"
                  className="btn-close position-absolute top-0 end-0 m-3 bg-white rounded-circle p-2"
                  aria-label="Close"
                  onClick={() =>
                    setSelectedEquipment(null)
                  }
                ></button>


                {/* STATUS */}
                <StatusBadge
                  status={selectedEquipment.status}
                  large
                />

              </div>


              {/* ================= MODAL BODY ================= */}
              <div className="modal-body p-4 p-lg-5">

                {/* TITLE */}
                <div className="mb-4">

                  <small
                    className="fw-bold"
                    style={{
                      color: "#6f42c1",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {selectedEquipment.code}
                  </small>

                  <h2 className="fw-bold mt-2 mb-2">
                    {selectedEquipment.name}
                  </h2>

                  <p className="text-secondary mb-0">
                    {selectedEquipment.description}
                  </p>

                </div>


                {/* INFORMATION */}
                <div className="row g-3">

                  <InfoBox
                    icon="bi-upc-scan"
                    title="รหัสครุภัณฑ์"
                    value={selectedEquipment.code}
                  />

                  <InfoBox
                    icon="bi-tag"
                    title="ประเภท"
                    value={selectedEquipment.category}
                  />

                  <InfoBox
                    icon="bi-building"
                    title="สถานที่จัดเก็บ"
                    value={selectedEquipment.location}
                    full
                  />

                  <InfoBox
                    icon="bi-award"
                    title="ยี่ห้อ"
                    value={selectedEquipment.brand}
                  />

                  <InfoBox
                    icon="bi-cpu"
                    title="รุ่น"
                    value={selectedEquipment.model}
                  />

                  <div className="col-md-6">

                    <div className="bg-light rounded-4 p-3 h-100">

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
                          <i className="bi bi-circle-fill"></i>
                        </div>

                        <div>

                          <small className="text-secondary">
                            สถานะ
                          </small>

                          <div className="mt-1">
                            <StatusBadge
                              status={
                                selectedEquipment.status
                              }
                            />
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>


                {/* QR CODE */}
                <div
                  className="mt-4 p-4 rounded-4 text-center"
                  style={{
                    background: "#faf8ff",
                    border:
                      "1px dashed #c9b8e8",
                  }}
                >

                  <div
                    className="d-inline-flex align-items-center justify-content-center bg-white rounded-4 shadow-sm p-3"
                  >
                    <i
                      className="bi bi-qr-code"
                      style={{
                        fontSize: "90px",
                        color: "#17131f",
                      }}
                    ></i>
                  </div>

                  <h6 className="fw-bold mt-3 mb-1">
                    QR Code ครุภัณฑ์
                  </h6>

                  <p className="text-secondary small mb-0">
                    {selectedEquipment.code}
                  </p>

                </div>

              </div>


              {/* ================= MODAL FOOTER ================= */}
              <div className="modal-footer border-0 px-4 px-lg-5 pb-4">

                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4"
                  onClick={() =>
                    setSelectedEquipment(null)
                  }
                >
                  ปิด
                </button>


                {selectedEquipment.status ===
                  "พร้อมใช้งาน" && (
                  <button
                    type="button"
                    className="btn text-white rounded-pill px-4"
                    style={{
                      background: "#6f42c1",
                    }}
                    onClick={() => {
                      alert(
                        `กำลังดำเนินการยืม ${selectedEquipment.name} (${selectedEquipment.code})`
                      );
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    ยืมครุภัณฑ์
                  </button>
                )}

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
   EQUIPMENT CARD
===================================================== */

function EquipmentCard({
  equipment,
  onDetail,
}: {
  equipment: Equipment;
  onDetail: () => void;
}) {

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">

      {/* IMAGE */}
      <div
        className="position-relative d-flex align-items-center justify-content-center"
        style={{
          height: "210px",
          background:
            "linear-gradient(135deg, #f4f0fa, #eee8ff)",
          color: "#6f42c1",
        }}
      >

        <i
          className={equipment.icon}
          style={{
            fontSize: "80px",
          }}
        ></i>


        {/* STATUS */}
        <StatusBadge
          status={equipment.status}
          position
        />

      </div>


      {/* BODY */}
      <div className="card-body p-4">

        <small
          className="fw-bold"
          style={{
            color: "#6f42c1",
          }}
        >
          {equipment.code}
        </small>

        <h5 className="fw-bold mt-2 mb-3">
          {equipment.name}
        </h5>


        <div className="d-flex align-items-center gap-2 mb-2">

          <i className="bi bi-tag text-secondary"></i>

          <span className="text-secondary small">
            {equipment.category}
          </span>

        </div>


        <div className="d-flex align-items-start gap-2 mb-2">

          <i className="bi bi-geo-alt text-secondary"></i>

          <span className="text-secondary small">
            {equipment.location}
          </span>

        </div>


        <div className="d-flex align-items-center gap-2">

          <i className="bi bi-building text-secondary"></i>

          <span className="text-secondary small">
            {equipment.brand} {equipment.model}
          </span>

        </div>

      </div>


      {/* FOOTER */}
      <div className="card-footer bg-white border-0 px-4 pb-4">

        <button
          type="button"
          className="btn btn-dark rounded-pill w-100"
          onClick={onDetail}
        >
          ดูรายละเอียด
          <i className="bi bi-arrow-right ms-2"></i>
        </button>

      </div>

    </div>
  );
}


/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({
  status,
  position = false,
  large = false,
}: {
  status: EquipmentStatus;
  position?: boolean;
  large?: boolean;
}) {

  const config = {
    "พร้อมใช้งาน": {
      background: "#d1e7dd",
      color: "#146c43",
      icon: "bi-check-circle-fill",
    },

    "ถูกยืม": {
      background: "#fff3cd",
      color: "#997404",
      icon: "bi-clock-fill",
    },

    "ชำรุด": {
      background: "#f8d7da",
      color: "#b02a37",
      icon: "bi-exclamation-triangle-fill",
    },
  };

  const current = config[status];

  return (
    <span
      className={`badge rounded-pill ${
        position
          ? "position-absolute top-0 end-0 m-3"
          : ""
      }`}
      style={{
        background: current.background,
        color: current.color,
        padding: large
          ? "10px 16px"
          : "7px 12px",
        fontSize: large
          ? "0.9rem"
          : "0.75rem",
      }}
    >

      <i
        className={`${current.icon} me-1`}
      ></i>

      {status}

    </span>
  );
}


/* =====================================================
   INFO BOX
===================================================== */

function InfoBox({
  icon,
  title,
  value,
  full = false,
}: {
  icon: string;
  title: string;
  value: string;
  full?: boolean;
}) {

  return (
    <div
      className={
        full
          ? "col-12"
          : "col-md-6"
      }
    >

      <div className="bg-light rounded-4 p-3 h-100">

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
            <i className={icon}></i>
          </div>

          <div>

            <small className="text-secondary">
              {title}
            </small>

            <div className="fw-semibold mt-1">
              {value}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}