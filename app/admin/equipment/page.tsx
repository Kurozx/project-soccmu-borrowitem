"use client";

import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import AdminNavbar from "@/app/components/AdminNavbar";

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
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");

  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

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
    const keyword = search.toLowerCase().trim();

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
     OPEN ADD FORM
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
     OPEN EDIT FORM
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
     SAVE EQUIPMENT
  ===================================================== */

  const saveEquipment = () => {
    if (
      !form.code.trim() ||
      !form.name.trim() ||
      !form.category.trim() ||
      !form.location.trim()
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (form.quantity < 1) {
      alert("จำนวนครุภัณฑ์ต้องมากกว่า 0");
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

  /* =====================================================
     STATUS ICON
  ===================================================== */

  const getStatusIcon = (
    status: Equipment["status"]
  ) => {
    if (status === "พร้อมใช้งาน") {
      return "bi-check-circle";
    }

    if (status === "กำลังยืม") {
      return "bi-clock";
    }

    return "bi-tools";
  };

  return (
    <main className="bg-light min-vh-100">

      {/* =====================================================
          ADMIN NAVBAR
      ===================================================== */}

      <AdminNavbar />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="admin-page-content admin-equipment-page">

        <div className="container-fluid">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="admin-equipment-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

            <div>
              <h2 className="admin-page-title">
                จัดการครุภัณฑ์
              </h2>
            </div>

            <button
              className="btn admin-primary-btn rounded-pill px-4"
              onClick={openAddForm}
            >
              <i className="bi bi-plus-lg me-2"></i>
              เพิ่มครุภัณฑ์
            </button>

          </div>

          {/* =====================================================
              STATISTICS
          ===================================================== */}

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
              value={equipment
                .filter(
                  (x) => x.status === "พร้อมใช้งาน"
                )
                .length.toString()}
              color="#198754"
            />

            <AdminStat
              icon="bi-arrow-up-right-circle"
              title="กำลังยืม"
              value={equipment
                .filter(
                  (x) => x.status === "กำลังยืม"
                )
                .length.toString()}
              color="#997404"
            />

            <AdminStat
              icon="bi-tools"
              title="กำลังซ่อม"
              value={equipment
                .filter(
                  (x) => x.status === "กำลังซ่อม"
                )
                .length.toString()}
              color="#dc3545"
            />

          </div>

          {/* =====================================================
              TABLE CARD
          ===================================================== */}

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-4">

              {/* =================================================
                  SEARCH / FILTER
              ================================================= */}

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
                      setStatusFilter(e.target.value)
                    }
                  >
                    <option>ทั้งหมด</option>
                    <option>พร้อมใช้งาน</option>
                    <option>กำลังยืม</option>
                    <option>กำลังซ่อม</option>
                  </select>

                </div>

                <div className="col-lg-2">

                  <button
                    className="btn btn-light w-100"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ทั้งหมด");
                    }}
                  >
                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                    รีเซ็ต
                  </button>

                </div>

              </div>

              {/* =================================================
                  TABLE
              ================================================= */}

              <div className="table-responsive">

                <table className="table align-middle">

                  <thead>
                    <tr className="text-secondary">

                      <th>ครุภัณฑ์</th>
                      <th>หมวดหมู่</th>
                      <th>สถานที่</th>
                      <th>จำนวน</th>
                      <th>สถานะ</th>

                      <th className="text-end">
                        จัดการ
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredEquipment.length > 0 ? (

                      filteredEquipment.map((item) => (

                        <tr key={item.id}>

                          {/* EQUIPMENT */}

                          <td>

                            <div className="d-flex align-items-center gap-3">

                              <div
                                className="equipment-icon-box rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                              >
                                <i className="bi bi-box-seam fs-5"></i>
                              </div>

                              <div className="equipment-name-wrapper">

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
                                className={`bi ${getStatusIcon(
                                  item.status
                                )} me-1`}
                              ></i>

                              {item.status}

                            </span>

                          </td>

                          {/* ACTION */}

                          <td className="text-end">

                            <div className="d-flex justify-content-end gap-2">

                              <button
                                className="btn btn-light btn-sm rounded-circle equipment-action-btn"
                                title="แก้ไข"
                                onClick={() =>
                                  openEditForm(item)
                                }
                              >
                                <i className="bi bi-pencil"></i>
                              </button>

                              <button
                                className="btn btn-light btn-sm rounded-circle text-danger equipment-action-btn"
                                title="ลบ"
                                onClick={() =>
                                  openDeleteModal(item)
                                }
                              >
                                <i className="bi bi-trash"></i>
                              </button>

                            </div>

                          </td>

                        </tr>

                      ))

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

              {/* =================================================
                  FOOTER
              ================================================= */}

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

        </div>

      </section>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (

        <div
          className="equipment-modal-backdrop"
          onClick={() => setShowForm(false)}
        >

          <div
            className="equipment-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="equipment-modal">

              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div className="equipment-modal-header">

                <div>

                  <h5 className="mb-1 fw-bold">
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
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowForm(false)}
                />

              </div>

              {/* =================================================
                  MODAL BODY
              ================================================= */}

              <div className="equipment-modal-body">

                <div className="row g-3">

                  {/* CODE */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      รหัสครุภัณฑ์
                      <span className="text-danger">*</span>
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
                      <span className="text-danger">*</span>
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
                      <span className="text-danger">*</span>
                    </label>

                    <select
                      className="form-select"
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value,
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
                      <span className="text-danger">*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น ห้องโสตทัศนศึกษา"
                      value={form.location}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          location: e.target.value,
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
                          quantity: Number(
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
                            e.target.value as Equipment["status"],
                        })
                      }
                    >

                      <option value="พร้อมใช้งาน">
                        พร้อมใช้งาน
                      </option>

                      <option value="กำลังยืม">
                        กำลังยืม
                      </option>

                      <option value="กำลังซ่อม">
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
                      className="form-control equipment-description"
                      rows={3}
                      placeholder="รายละเอียดเพิ่มเติมของครุภัณฑ์..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                    />

                  </div>

                  {/* IMAGE */}

                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      รูปภาพครุภัณฑ์
                    </label>

                    <div className="equipment-image-upload">

                      <i className="bi bi-cloud-arrow-up equipment-upload-icon"></i>

                      <div className="fw-semibold mt-2">
                        อัปโหลดรูปภาพ
                      </div>

                      <small className="text-secondary">
                        PNG, JPG หรือ WEBP
                      </small>

                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm rounded-pill mt-2"
                      >
                        <i className="bi bi-upload me-2"></i>
                        เลือกรูปภาพ
                      </button>

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  MODAL FOOTER
              ================================================= */}

              <div className="equipment-modal-footer">

                <button
                  className="btn btn-light rounded-pill px-4"
                  onClick={() => setShowForm(false)}
                >
                  ยกเลิก
                </button>

                <button
                  className="btn admin-primary-btn rounded-pill px-4"
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
          className="equipment-modal-backdrop equipment-delete-backdrop"
          onClick={() => setShowDelete(false)}
        >

          <div
            className="equipment-delete-dialog"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="equipment-modal border-0">

              <div className="p-4 p-md-5 text-center">

                {/* ICON */}

                <div className="delete-icon mx-auto mb-4">

                  <i className="bi bi-trash fs-2"></i>

                </div>

                <h4 className="fw-bold mb-2">
                  ยืนยันการลบ?
                </h4>

                <p className="text-secondary mb-1">
                  คุณต้องการลบครุภัณฑ์
                </p>

                <div className="fw-bold fs-5">
                  {deleteEquipment.name}
                </div>

                <small className="text-secondary">
                  {deleteEquipment.code}
                </small>

                <div className="alert alert-danger border-0 rounded-4 text-start mt-4 mb-0">

                  <i className="bi bi-exclamation-triangle me-2"></i>

                  การลบข้อมูลไม่สามารถย้อนกลับได้

                </div>

                <div className="d-flex gap-2 mt-4">

                  <button
                    className="btn btn-light rounded-pill flex-grow-1"
                    onClick={() => setShowDelete(false)}
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

/* =========================================================
   ADMIN STAT
========================================================= */

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

      <div className="card border-0 shadow-sm rounded-4 h-100">

        <div className="card-body p-4">

          <div className="d-flex align-items-center gap-3">

            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
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