"use client";

import { useState } from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type Equipment = {
  id: number;
  code: string;
  name: string;
  category: string;
  location: string;
  status: "พร้อมใช้งาน" | "กำลังยืม" | "กำลังซ่อม";
  quantity: number;
  description: string;
};

const initialEquipment: Equipment[] = [
  {
    id: 1,
    code: "SOC-CAM-001",
    name: "Digital Camera",
    category: "อุปกรณ์ถ่ายภาพ",
    location: "ห้องโสตทัศนศึกษา",
    status: "พร้อมใช้งาน",
    quantity: 5,
    description: "กล้องดิจิทัลสำหรับใช้ในการถ่ายภาพกิจกรรม",
  },
  {
    id: 2,
    code: "SOC-PRO-002",
    name: "Projector",
    category: "อุปกรณ์นำเสนอ",
    location: "ห้องประชุมคณะ",
    status: "กำลังยืม",
    quantity: 3,
    description: "เครื่องฉายภาพสำหรับการนำเสนอและการเรียนการสอน",
  },
  {
    id: 3,
    code: "SOC-LAP-001",
    name: "Notebook Computer",
    category: "คอมพิวเตอร์",
    location: "ห้อง IT",
    status: "พร้อมใช้งาน",
    quantity: 10,
    description: "คอมพิวเตอร์โน้ตบุ๊กสำหรับงานทั่วไป",
  },
  {
    id: 4,
    code: "SOC-MIC-001",
    name: "Wireless Microphone",
    category: "อุปกรณ์เสียง",
    location: "ห้องโสตทัศนศึกษา",
    status: "กำลังซ่อม",
    quantity: 4,
    description: "ไมโครโฟนไร้สายสำหรับการจัดกิจกรรม",
  },
  {
    id: 5,
    code: "SOC-TAB-001",
    name: "Tablet",
    category: "คอมพิวเตอร์",
    location: "ห้อง IT",
    status: "พร้อมใช้งาน",
    quantity: 8,
    description: "แท็บเล็ตสำหรับการเรียนการสอนและการใช้งานภายในคณะ",
  },
];

export default function AdminEquipmentPage() {
  const [equipment, setEquipment] =
    useState<Equipment[]>(initialEquipment);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ทั้งหมด");

  const [showForm, setShowForm] =
    useState(false);

  const [showDelete, setShowDelete] =
    useState(false);

  const [editingEquipment, setEditingEquipment] =
    useState<Equipment | null>(null);

  const [deleteEquipment, setDeleteEquipment] =
    useState<Equipment | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "",
    location: "",
    status: "พร้อมใช้งาน" as Equipment["status"],
    quantity: 1,
    description: "",
  });

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredEquipment = equipment.filter((item) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      item.name.toLowerCase().includes(keyword) ||
      item.code.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword);

    const matchStatus =
      statusFilter === "ทั้งหมด" ||
      item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  /* =====================================================
     OPEN ADD
  ===================================================== */

  const openAddForm = () => {
    setEditingEquipment(null);

    setForm({
      code: "",
      name: "",
      category: "",
      location: "",
      status: "พร้อมใช้งาน",
      quantity: 1,
      description: "",
    });

    setShowForm(true);
  };

  /* =====================================================
     OPEN EDIT
  ===================================================== */

  const openEditForm = (item: Equipment) => {
    setEditingEquipment(item);

    setForm({
      code: item.code,
      name: item.name,
      category: item.category,
      location: item.location,
      status: item.status,
      quantity: item.quantity,
      description: item.description,
    });

    setShowForm(true);
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const saveEquipment = () => {
    if (
      !form.code ||
      !form.name ||
      !form.category ||
      !form.location
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (editingEquipment) {
      setEquipment((current) =>
        current.map((item) =>
          item.id === editingEquipment.id
            ? {
                ...item,
                ...form,
              }
            : item
        )
      );
    } else {
      const newEquipment: Equipment = {
        id: Date.now(),
        ...form,
      };

      setEquipment((current) => [
        ...current,
        newEquipment,
      ]);
    }

    setShowForm(false);
    setEditingEquipment(null);
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const openDeleteModal = (item: Equipment) => {
    setDeleteEquipment(item);
    setShowDelete(true);
  };

  const confirmDelete = () => {
    if (!deleteEquipment) return;

    setEquipment((current) =>
      current.filter(
        (item) => item.id !== deleteEquipment.id
      )
    );

    setDeleteEquipment(null);
    setShowDelete(false);
  };

  /* =====================================================
     STATUS BADGE
  ===================================================== */

  const getStatusBadge = (
    status: Equipment["status"]
  ) => {
    if (status === "พร้อมใช้งาน") {
      return "bg-success-subtle text-success";
    }

    if (status === "กำลังยืม") {
      return "bg-warning-subtle text-warning-emphasis";
    }

    return "bg-danger-subtle text-danger";
  };

  return (
    <main className="bg-light min-vh-100">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">

        <div className="container-fluid px-4">

          <Link
            href="/"
            className="navbar-brand d-flex align-items-center gap-3"
          >

            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
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
              <div className="fw-bold">
                ระบบยืม–คืนครุภัณฑ์
              </div>

              <small className="text-secondary">
                Admin Panel
              </small>
            </div>

          </Link>


          <div className="d-flex align-items-center gap-3">

            <div className="text-end d-none d-md-block">

              <div className="fw-semibold">
                ผู้ดูแลระบบ
              </div>

              <small className="text-secondary">
                Administrator
              </small>

            </div>


            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "45px",
                height: "45px",
                background: "#eee8ff",
                color: "#6f42c1",
              }}
            >
              <i className="bi bi-person-fill fs-5"></i>
            </div>

          </div>

        </div>

      </nav>


      {/* =====================================================
          ADMIN LAYOUT
      ===================================================== */}

      <div className="container-fluid">

        <div className="row">


          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside
            className="col-lg-2 bg-white border-end d-none d-lg-block"
            style={{
              minHeight: "calc(100vh - 73px)",
            }}
          >

            <div className="pt-4">

              <small className="text-secondary px-3">
                MENU
              </small>


              <div className="mt-3">

                <AdminMenu
                  href="./dashboard"
                  icon="bi-speedometer2"
                  title="Dashboard"
                />


                <AdminMenu
                  href="/admin/equipment"
                  icon="bi-box-seam"
                  title="จัดการครุภัณฑ์"
                  active
                />


                <AdminMenu
                  href="/admin/borrowing"
                  icon="bi-arrow-left-right"
                  title="รายการยืม–คืน"
                />


                <AdminMenu
                  href="/admin/users"
                  icon="bi-people"
                  title="จัดการผู้ใช้งาน"
                />


                


                <AdminMenu
                  href="/history"
                  icon="bi-clock-history"
                  title="ประวัติการใช้งาน"
                />

              </div>


              <hr className="my-4" />


              <small className="text-secondary px-3">
                SYSTEM
              </small>


              <div className="mt-3">

                <AdminMenu
                  href="/"
                  icon="bi-house"
                  title="กลับหน้าหลัก"
                />

              </div>

            </div>

          </aside>


          {/* =================================================
              CONTENT
          ================================================= */}

          <section className="col-lg-10 px-3 px-lg-4 py-4">


            {/* HEADER */}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

              <div>

                <div className="text-secondary small mb-1">
                  Admin / Equipment
                </div>

                <h2 className="fw-bold mb-1">
                  จัดการครุภัณฑ์
                </h2>

                <p className="text-secondary mb-0">
                  เพิ่ม แก้ไข ลบ และจัดการข้อมูลครุภัณฑ์
                </p>

              </div>


              <button
                className="btn text-white rounded-pill px-4"
                style={{
                  background: "#6f42c1",
                }}
                onClick={openAddForm}
              >

                <i className="bi bi-plus-lg me-2"></i>

                เพิ่มครุภัณฑ์

              </button>

            </div>


            {/* =================================================
                STAT
            ================================================= */}

            <div className="row g-3 mb-4">

              <AdminStat
                icon="bi-box-seam"
                title="ครุภัณฑ์ทั้งหมด"
                value={equipment.length.toString()}
                color="#6f42c1"
              />


              <AdminStat
                icon="bi-check-circle"
                title="พร้อมใช้งาน"
                value={
                  equipment
                    .filter(
                      (x) =>
                        x.status ===
                        "พร้อมใช้งาน"
                    )
                    .length.toString()
                }
                color="#198754"
              />


              <AdminStat
                icon="bi-arrow-up-right-circle"
                title="กำลังยืม"
                value={
                  equipment
                    .filter(
                      (x) =>
                        x.status ===
                        "กำลังยืม"
                    )
                    .length.toString()
                }
                color="#997404"
              />


              <AdminStat
                icon="bi-tools"
                title="กำลังซ่อม"
                value={
                  equipment
                    .filter(
                      (x) =>
                        x.status ===
                        "กำลังซ่อม"
                    )
                    .length.toString()
                }
                color="#dc3545"
              />

            </div>


            {/* =================================================
                TABLE CARD
            ================================================= */}

            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-4">


                {/* SEARCH */}

                <div className="row g-3 mb-4">

                  <div className="col-lg-7">

                    <div className="input-group">

                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-search"></i>
                      </span>

                      <input
                        type="text"
                        className="form-control bg-light border-0"
                        placeholder="ค้นหาชื่อ หรือรหัสครุภัณฑ์..."
                        value={search}
                        onChange={(e) =>
                          setSearch(e.target.value)
                        }
                      />

                    </div>

                  </div>


                  <div className="col-lg-3">

                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(
                          e.target.value
                        )
                      }
                    >

                      <option>
                        ทั้งหมด
                      </option>

                      <option>
                        พร้อมใช้งาน
                      </option>

                      <option>
                        กำลังยืม
                      </option>

                      <option>
                        กำลังซ่อม
                      </option>

                    </select>

                  </div>


                  <div className="col-lg-2">

                    <button
                      className="btn btn-light w-100"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter(
                          "ทั้งหมด"
                        );
                      }}
                    >

                      <i className="bi bi-arrow-counterclockwise me-1"></i>

                      รีเซ็ต

                    </button>

                  </div>

                </div>


                {/* TABLE */}

                <div className="table-responsive">

                  <table className="table align-middle">

                    <thead>

                      <tr className="text-secondary">

                        <th>
                          ครุภัณฑ์
                        </th>

                        <th>
                          หมวดหมู่
                        </th>

                        <th>
                          สถานที่
                        </th>

                        <th>
                          จำนวน
                        </th>

                        <th>
                          สถานะ
                        </th>

                        <th className="text-end">
                          จัดการ
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredEquipment.length > 0 ? (

                        filteredEquipment.map(
                          (item) => (

                            <tr key={item.id}>

                              {/* EQUIPMENT */}

                              <td>

                                <div className="d-flex align-items-center gap-3">

                                  <div
                                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      background:
                                        "#f1eef6",
                                      color:
                                        "#6f42c1",
                                    }}
                                  >

                                    <i className="bi bi-box-seam fs-5"></i>

                                  </div>


                                  <div>

                                    <div className="fw-semibold">
                                      {item.name}
                                    </div>

                                    <small className="text-secondary">
                                      {item.code}
                                    </small>

                                  </div>

                                </div>

                              </td>


                              {/* CATEGORY */}

                              <td>
                                <span className="text-secondary">
                                  {item.category}
                                </span>
                              </td>


                              {/* LOCATION */}

                              <td>

                                <div className="d-flex align-items-center gap-2">

                                  <i className="bi bi-geo-alt text-secondary"></i>

                                  <span>
                                    {item.location}
                                  </span>

                                </div>

                              </td>


                              {/* QUANTITY */}

                              <td>

                                <span className="fw-semibold">
                                  {item.quantity}
                                </span>

                                <small className="text-secondary ms-1">
                                  ชิ้น
                                </small>

                              </td>


                              {/* STATUS */}

                              <td>

                                <span
                                  className={`badge rounded-pill px-3 py-2 ${getStatusBadge(
                                    item.status
                                  )}`}
                                >

                                  <i
                                    className={`bi ${
                                      item.status ===
                                      "พร้อมใช้งาน"
                                        ? "bi-check-circle"
                                        : item.status ===
                                          "กำลังยืม"
                                        ? "bi-clock"
                                        : "bi-tools"
                                    } me-1`}
                                  ></i>

                                  {item.status}

                                </span>

                              </td>


                              {/* ACTION */}

                              <td className="text-end">

                                <div className="d-flex justify-content-end gap-2">

                                  <button
                                    className="btn btn-light btn-sm rounded-circle"
                                    title="แก้ไข"
                                    onClick={() =>
                                      openEditForm(
                                        item
                                      )
                                    }
                                  >

                                    <i className="bi bi-pencil"></i>

                                  </button>


                                  <button
                                    className="btn btn-light btn-sm rounded-circle text-danger"
                                    title="ลบ"
                                    onClick={() =>
                                      openDeleteModal(
                                        item
                                      )
                                    }
                                  >

                                    <i className="bi bi-trash"></i>

                                  </button>

                                </div>

                              </td>

                            </tr>

                          )
                        )

                      ) : (

                        <tr>

                          <td
                            colSpan={6}
                            className="text-center py-5"
                          >

                            <i className="bi bi-search fs-1 text-secondary"></i>

                            <div className="fw-semibold mt-3">
                              ไม่พบข้อมูลครุภัณฑ์
                            </div>

                            <small className="text-secondary">
                              ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                            </small>

                          </td>

                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>


                {/* FOOTER */}

                <div className="d-flex justify-content-between align-items-center mt-3">

                  <small className="text-secondary">

                    แสดง{" "}
                    <strong>
                      {filteredEquipment.length}
                    </strong>{" "}
                    จาก{" "}
                    <strong>
                      {equipment.length}
                    </strong>{" "}
                    รายการ

                  </small>

                </div>

              </div>

            </div>

          </section>

        </div>

      </div>


      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (

        <div
          className="modal fade show d-block"
          style={{
            background: "rgba(0,0,0,0.6)",
            zIndex: 1050,
          }}
          onClick={() =>
            setShowForm(false)
          }
        >

          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-content border-0 rounded-4">

              {/* HEADER */}

              <div className="modal-header px-4 py-3">

                <div>

                  <h5 className="modal-title fw-bold">

                    {editingEquipment
                      ? "แก้ไขครุภัณฑ์"
                      : "เพิ่มครุภัณฑ์"}

                  </h5>

                  <small className="text-secondary">

                    {editingEquipment
                      ? "แก้ไขข้อมูลครุภัณฑ์"
                      : "เพิ่มข้อมูลครุภัณฑ์ใหม่เข้าสู่ระบบ"}

                  </small>

                </div>


                <button
                  className="btn-close"
                  onClick={() =>
                    setShowForm(false)
                  }
                ></button>

              </div>


              {/* BODY */}

              <div className="modal-body p-4">

                <div className="row g-3">


                  {/* CODE */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      รหัสครุภัณฑ์
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น SOC-CAM-001"
                      value={form.code}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          code: e.target.value,
                        })
                      }
                    />

                  </div>


                  {/* NAME */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      ชื่อครุภัณฑ์
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น Digital Camera"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                    />

                  </div>


                  {/* CATEGORY */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      หมวดหมู่
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <select
                      className="form-select"
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category:
                            e.target.value,
                        })
                      }
                    >

                      <option value="">
                        เลือกหมวดหมู่
                      </option>

                      <option>
                        อุปกรณ์ถ่ายภาพ
                      </option>

                      <option>
                        อุปกรณ์นำเสนอ
                      </option>

                      <option>
                        คอมพิวเตอร์
                      </option>

                      <option>
                        อุปกรณ์เสียง
                      </option>

                      <option>
                        อุปกรณ์สำนักงาน
                      </option>

                      <option>
                        อื่น ๆ
                      </option>

                    </select>

                  </div>


                  {/* LOCATION */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      สถานที่จัดเก็บ
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น ห้องโสตทัศนศึกษา"
                      value={form.location}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          location:
                            e.target.value,
                        })
                      }
                    />

                  </div>


                  {/* QUANTITY */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      จำนวน
                    </label>

                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quantity:
                            Number(
                              e.target.value
                            ),
                        })
                      }
                    />

                  </div>


                  {/* STATUS */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      สถานะ
                    </label>

                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status:
                            e.target
                              .value as Equipment["status"],
                        })
                      }
                    >

                      <option>
                        พร้อมใช้งาน
                      </option>

                      <option>
                        กำลังยืม
                      </option>

                      <option>
                        กำลังซ่อม
                      </option>

                    </select>

                  </div>


                  {/* DESCRIPTION */}

                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      รายละเอียด
                    </label>

                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="รายละเอียดเพิ่มเติมของครุภัณฑ์..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description:
                            e.target.value,
                        })
                      }
                    ></textarea>

                  </div>


                  {/* IMAGE PLACEHOLDER */}

                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      รูปภาพครุภัณฑ์
                    </label>

                    <div
                      className="border rounded-4 p-4 text-center"
                      style={{
                        borderStyle:
                          "dashed",
                        background:
                          "#fafafa",
                      }}
                    >

                      <i className="bi bi-cloud-arrow-up fs-1 text-secondary"></i>

                      <div className="fw-semibold mt-2">
                        อัปโหลดรูปภาพ
                      </div>

                      <small className="text-secondary">
                        PNG, JPG หรือ WEBP
                      </small>

                      <div className="mt-3">

                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-pill"
                        >

                          <i className="bi bi-upload me-2"></i>

                          เลือกรูปภาพ

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </div>


              {/* FOOTER */}

              <div className="modal-footer border-0 px-4 pb-4">

                <button
                  className="btn btn-light rounded-pill px-4"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  ยกเลิก
                </button>


                <button
                  className="btn text-white rounded-pill px-4"
                  style={{
                    background: "#6f42c1",
                  }}
                  onClick={saveEquipment}
                >

                  <i className="bi bi-check-lg me-2"></i>

                  {editingEquipment
                    ? "บันทึกการแก้ไข"
                    : "เพิ่มครุภัณฑ์"}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {showDelete && deleteEquipment && (

        <div
          className="modal fade show d-block"
          style={{
            background:
              "rgba(0,0,0,0.7)",
            zIndex: 1060,
          }}
          onClick={() =>
            setShowDelete(false)
          }
        >

          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-content border-0 rounded-4">

              <div className="modal-body text-center p-5">

                <div
                  className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "85px",
                    height: "85px",
                    background: "#f8d7da",
                    color: "#dc3545",
                  }}
                >

                  <i className="bi bi-trash fs-2"></i>

                </div>


                <h4 className="fw-bold">
                  ยืนยันการลบ?
                </h4>


                <p className="text-secondary">
                  คุณต้องการลบครุภัณฑ์
                </p>


                <div className="fw-bold fs-5">
                  {deleteEquipment.name}
                </div>


                <small className="text-secondary">
                  {deleteEquipment.code}
                </small>


                <div className="alert alert-danger border-0 rounded-4 text-start mt-4">

                  <i className="bi bi-exclamation-triangle me-2"></i>

                  การลบข้อมูลไม่สามารถย้อนกลับได้

                </div>


                <div className="d-flex gap-2 mt-4">

                  <button
                    className="btn btn-light rounded-pill flex-grow-1"
                    onClick={() =>
                      setShowDelete(false)
                    }
                  >
                    ยกเลิก
                  </button>


                  <button
                    className="btn btn-danger rounded-pill flex-grow-1"
                    onClick={confirmDelete}
                  >

                    <i className="bi bi-trash me-2"></i>

                    ยืนยันลบ

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}


/* =====================================================
   ADMIN MENU
===================================================== */

function AdminMenu({
  href,
  icon,
  title,
  active = false,
}: {
  href: string;
  icon: string;
  title: string;
  active?: boolean;
}) {

  return (

    <Link
      href={href}
      className={`d-flex align-items-center gap-3 mx-2 px-3 py-3 rounded-3 text-decoration-none ${
        active
          ? "text-white"
          : "text-secondary"
      }`}
      style={
        active
          ? {
              background: "#6f42c1",
            }
          : undefined
      }
    >

      <i className={`${icon} fs-5`}></i>

      <span className="fw-medium">
        {title}
      </span>

    </Link>
  );
}


/* =====================================================
   ADMIN STAT
===================================================== */

function AdminStat({
  icon,
  title,
  value,
  color,
}: {
  icon: string;
  title: string;
  value: string;
  color: string;
}) {

  return (

    <div className="col-sm-6 col-xl-3">

      <div className="card border-0 shadow-sm rounded-4">

        <div className="card-body p-4">

          <div className="d-flex align-items-center gap-3">

            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: "50px",
                height: "50px",
                background: `${color}15`,
                color,
              }}
            >

              <i className={`${icon} fs-5`}></i>

            </div>


            <div>

              <small className="text-secondary d-block">
                {title}
              </small>

              <strong className="fs-3">
                {value}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

