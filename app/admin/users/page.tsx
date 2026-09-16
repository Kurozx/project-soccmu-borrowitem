"use client";

import { useState } from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
type UserRole = "นักศึกษา" | "บุคลากร" | "ผู้ดูแลระบบ";
type UserStatus = "ใช้งาน" | "ระงับการใช้งาน";

type User = {
  id: number;
  name: string;
  email: string;
  studentId: string;
  department: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  borrowCount: number;
  createdAt: string;
};

const initialUsers: User[] = [
  {
    id: 1,
    name: "สมชาย ใจดี",
    email: "somchai@example.com",
    studentId: "650610001",
    department: "สาขาวิชาสังคมศาสตร์",
    phone: "081-234-5678",
    role: "นักศึกษา",
    status: "ใช้งาน",
    borrowCount: 12,
    createdAt: "15/06/2025",
  },
  {
    id: 2,
    name: "กมลชนก แสงดี",
    email: "kamonchanok@example.com",
    studentId: "650610002",
    department: "สาขาวิชาสังคมวิทยา",
    phone: "082-345-6789",
    role: "นักศึกษา",
    status: "ใช้งาน",
    borrowCount: 8,
    createdAt: "18/06/2025",
  },
  {
    id: 3,
    name: "ธนกร ใจบุญ",
    email: "thanakorn@example.com",
    studentId: "640610015",
    department: "สาขาวิชารัฐศาสตร์",
    phone: "083-456-7890",
    role: "นักศึกษา",
    status: "ใช้งาน",
    borrowCount: 15,
    createdAt: "20/06/2025",
  },
  {
    id: 4,
    name: "พิมพ์ชนก สุขใจ",
    email: "pimchanok@example.com",
    studentId: "650610023",
    department: "สาขาวิชาภูมิศาสตร์",
    phone: "084-567-8901",
    role: "นักศึกษา",
    status: "ใช้งาน",
    borrowCount: 6,
    createdAt: "25/06/2025",
  },
  {
    id: 5,
    name: "อาจารย์วิชัย สมบูรณ์",
    email: "wichai@example.com",
    studentId: "STAFF-001",
    department: "คณะสังคมศาสตร์",
    phone: "085-678-9012",
    role: "บุคลากร",
    status: "ใช้งาน",
    borrowCount: 23,
    createdAt: "02/07/2025",
  },
  {
    id: 6,
    name: "เจ้าหน้าที่ระบบ",
    email: "admin@cmu.ac.th",
    studentId: "ADMIN-001",
    department: "สำนักงานคณะ",
    phone: "053-123-456",
    role: "ผู้ดูแลระบบ",
    status: "ใช้งาน",
    borrowCount: 0,
    createdAt: "01/01/2025",
  },
  {
    id: 7,
    name: "ณัฐวุฒิ พรหมมา",
    email: "nattawut@example.com",
    studentId: "640610031",
    department: "สาขาวิชามานุษยวิทยา",
    phone: "086-789-0123",
    role: "นักศึกษา",
    status: "ระงับการใช้งาน",
    borrowCount: 3,
    createdAt: "10/07/2025",
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState("ทั้งหมด");

  const [statusFilter, setStatusFilter] =
    useState("ทั้งหมด");

  const [showForm, setShowForm] =
    useState(false);

  const [showDelete, setShowDelete] =
    useState(false);

  const [showDetail, setShowDetail] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [deleteUser, setDeleteUser] =
    useState<User | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "",
    phone: "",
    role: "นักศึกษา" as UserRole,
    status: "ใช้งาน" as UserStatus,
  });

  /* =====================================================
     FILTER USERS
  ===================================================== */

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.studentId.toLowerCase().includes(keyword) ||
      user.department.toLowerCase().includes(keyword);

    const matchRole =
      roleFilter === "ทั้งหมด" ||
      user.role === roleFilter;

    const matchStatus =
      statusFilter === "ทั้งหมด" ||
      user.status === statusFilter;

    return (
      matchSearch &&
      matchRole &&
      matchStatus
    );
  });

  /* =====================================================
     OPEN ADD FORM
  ===================================================== */

  const openAddForm = () => {
    setEditingUser(null);

    setForm({
      name: "",
      email: "",
      studentId: "",
      department: "",
      phone: "",
      role: "นักศึกษา",
      status: "ใช้งาน",
    });

    setShowForm(true);
  };

  /* =====================================================
     OPEN EDIT FORM
  ===================================================== */

  const openEditForm = (user: User) => {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      department: user.department,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });

    setShowForm(true);
  };

  /* =====================================================
     SAVE USER
  ===================================================== */

  const saveUser = () => {
    if (
      !form.name ||
      !form.email ||
      !form.studentId ||
      !form.department
    ) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    if (editingUser) {
      setUsers((current) =>
        current.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                ...form,
              }
            : user
        )
      );
    } else {
      const newUser: User = {
        id: Date.now(),
        ...form,
        borrowCount: 0,
        createdAt: new Date().toLocaleDateString(
          "th-TH"
        ),
      };

      setUsers((current) => [
        ...current,
        newUser,
      ]);
    }

    setShowForm(false);
    setEditingUser(null);
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const openDeleteModal = (user: User) => {
    setDeleteUser(user);
    setShowDelete(true);
  };

  const confirmDelete = () => {
    if (!deleteUser) return;

    setUsers((current) =>
      current.filter(
        (user) => user.id !== deleteUser.id
      )
    );

    setDeleteUser(null);
    setShowDelete(false);
  };

  /* =====================================================
     TOGGLE USER STATUS
  ===================================================== */

  const toggleStatus = (user: User) => {
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status:
                item.status === "ใช้งาน"
                  ? "ระงับการใช้งาน"
                  : "ใช้งาน",
            }
          : item
      )
    );
  };

  /* =====================================================
     RESET FILTER
  ===================================================== */

  const resetFilter = () => {
    setSearch("");
    setRoleFilter("ทั้งหมด");
    setStatusFilter("ทั้งหมด");
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
              minHeight:
                "calc(100vh - 73px)",
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
                  active
                />


                


                <AdminMenu
                  href="./history"
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
              MAIN CONTENT
          ================================================= */}

          <section className="col-lg-10 px-3 px-lg-4 py-4">


            {/* HEADER */}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

              <div>

                <div className="text-secondary small mb-1">
                  Admin / Users
                </div>

                <h2 className="fw-bold mb-1">
                  จัดการผู้ใช้งาน
                </h2>

                <p className="text-secondary mb-0">
                  จัดการบัญชีผู้ใช้งานและสิทธิ์การใช้งานระบบ
                </p>

              </div>


              <button
                className="btn text-white rounded-pill px-4"
                style={{
                  background: "#6f42c1",
                }}
                onClick={openAddForm}
              >

                <i className="bi bi-person-plus me-2"></i>

                เพิ่มผู้ใช้งาน

              </button>

            </div>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="row g-3 mb-4">

              <UserStat
                icon="bi-people"
                title="ผู้ใช้งานทั้งหมด"
                value={users.length.toString()}
                color="#6f42c1"
              />


              <UserStat
                icon="bi-person-check"
                title="กำลังใช้งาน"
                value={
                  users
                    .filter(
                      (user) =>
                        user.status ===
                        "ใช้งาน"
                    )
                    .length.toString()
                }
                color="#198754"
              />


              <UserStat
                icon="bi-mortarboard"
                title="นักศึกษา"
                value={
                  users
                    .filter(
                      (user) =>
                        user.role ===
                        "นักศึกษา"
                    )
                    .length.toString()
                }
                color="#0d6efd"
              />


              <UserStat
                icon="bi-person-badge"
                title="บุคลากร"
                value={
                  users
                    .filter(
                      (user) =>
                        user.role ===
                        "บุคลากร"
                    )
                    .length.toString()
                }
                color="#fd7e14"
              />

            </div>


            {/* =================================================
                USER TABLE
            ================================================= */}

            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-4">


                {/* FILTER */}

                <div className="row g-3 mb-4">

                  <div className="col-lg-5">

                    <div className="input-group">

                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-search"></i>
                      </span>

                      <input
                        type="text"
                        className="form-control bg-light border-0"
                        placeholder="ค้นหาชื่อ, รหัสนักศึกษา, อีเมล..."
                        value={search}
                        onChange={(e) =>
                          setSearch(
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>


                  <div className="col-lg-2">

                    <select
                      className="form-select"
                      value={roleFilter}
                      onChange={(e) =>
                        setRoleFilter(
                          e.target.value
                        )
                      }
                    >

                      <option>
                        ทั้งหมด
                      </option>

                      <option>
                        นักศึกษา
                      </option>

                      <option>
                        บุคลากร
                      </option>

                      <option>
                        ผู้ดูแลระบบ
                      </option>

                    </select>

                  </div>


                  <div className="col-lg-2">

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
                        ใช้งาน
                      </option>

                      <option>
                        ระงับการใช้งาน
                      </option>

                    </select>

                  </div>


                  <div className="col-lg-3">

                    <button
                      className="btn btn-light w-100"
                      onClick={resetFilter}
                    >

                      <i className="bi bi-arrow-counterclockwise me-2"></i>

                      รีเซ็ตตัวกรอง

                    </button>

                  </div>

                </div>


                {/* TABLE */}

                <div className="table-responsive">

                  <table className="table align-middle">

                    <thead>

                      <tr className="text-secondary">

                        <th>
                          ผู้ใช้งาน
                        </th>

                        <th>
                          รหัส
                        </th>

                        <th>
                          หน่วยงาน / สาขา
                        </th>

                        <th>
                          สิทธิ์
                        </th>

                        <th>
                          การยืม
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

                      {filteredUsers.length > 0 ? (

                        filteredUsers.map(
                          (user) => (

                            <tr key={user.id}>


                              {/* USER */}

                              <td>

                                <div className="d-flex align-items-center gap-3">

                                  <div
                                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                      width: "48px",
                                      height: "48px",
                                      background:
                                        "#eee8ff",
                                      color:
                                        "#6f42c1",
                                    }}
                                  >

                                    <i className="bi bi-person fs-5"></i>

                                  </div>


                                  <div>

                                    <div className="fw-semibold">
                                      {user.name}
                                    </div>

                                    <small className="text-secondary">
                                      {user.email}
                                    </small>

                                  </div>

                                </div>

                              </td>


                              {/* ID */}

                              <td>

                                <span className="fw-semibold">
                                  {user.studentId}
                                </span>

                              </td>


                              {/* DEPARTMENT */}

                              <td>

                                <small>
                                  {user.department}
                                </small>

                              </td>


                              {/* ROLE */}

                              <td>

                                <RoleBadge
                                  role={user.role}
                                />

                              </td>


                              {/* BORROW */}

                              <td>

                                <div className="d-flex align-items-center gap-2">

                                  <i className="bi bi-box-arrow-up-right text-secondary"></i>

                                  <span className="fw-semibold">
                                    {user.borrowCount}
                                  </span>

                                  <small className="text-secondary">
                                    ครั้ง
                                  </small>

                                </div>

                              </td>


                              {/* STATUS */}

                              <td>

                                <button
                                  className={`btn btn-sm rounded-pill border-0 ${
                                    user.status ===
                                    "ใช้งาน"
                                      ? "bg-success-subtle text-success"
                                      : "bg-danger-subtle text-danger"
                                  }`}
                                  onClick={() =>
                                    toggleStatus(
                                      user
                                    )
                                  }
                                  title="คลิกเพื่อเปลี่ยนสถานะ"
                                >

                                  <i
                                    className={`bi ${
                                      user.status ===
                                      "ใช้งาน"
                                        ? "bi-check-circle"
                                        : "bi-slash-circle"
                                    } me-1`}
                                  ></i>

                                  {user.status}

                                </button>

                              </td>


                              {/* ACTION */}

                              <td className="text-end">

                                <div className="d-flex justify-content-end gap-2">

                                  {/* VIEW */}

                                  <button
                                    className="btn btn-light btn-sm rounded-circle"
                                    title="ดูรายละเอียด"
                                    onClick={() => {
                                      setSelectedUser(
                                        user
                                      );
                                      setShowDetail(
                                        true
                                      );
                                    }}
                                  >

                                    <i className="bi bi-eye"></i>

                                  </button>


                                  {/* EDIT */}

                                  <button
                                    className="btn btn-light btn-sm rounded-circle"
                                    title="แก้ไข"
                                    onClick={() =>
                                      openEditForm(
                                        user
                                      )
                                    }
                                  >

                                    <i className="bi bi-pencil"></i>

                                  </button>


                                  {/* DELETE */}

                                  <button
                                    className="btn btn-light btn-sm rounded-circle text-danger"
                                    title="ลบ"
                                    onClick={() =>
                                      openDeleteModal(
                                        user
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
                            colSpan={7}
                            className="text-center py-5"
                          >

                            <i className="bi bi-people fs-1 text-secondary"></i>

                            <div className="fw-semibold mt-3">
                              ไม่พบผู้ใช้งาน
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

                <div className="d-flex justify-content-between mt-3">

                  <small className="text-secondary">

                    แสดง{" "}
                    <strong>
                      {filteredUsers.length}
                    </strong>{" "}
                    จาก{" "}
                    <strong>
                      {users.length}
                    </strong>{" "}
                    ผู้ใช้งาน

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
            background:
              "rgba(0,0,0,0.6)",
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

                    {editingUser
                      ? "แก้ไขผู้ใช้งาน"
                      : "เพิ่มผู้ใช้งาน"}

                  </h5>

                  <small className="text-secondary">

                    {editingUser
                      ? "แก้ไขข้อมูลบัญชีผู้ใช้งาน"
                      : "เพิ่มบัญชีผู้ใช้งานใหม่"}

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


                  {/* NAME */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">

                      ชื่อ–นามสกุล

                      <span className="text-danger">
                        *
                      </span>

                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น สมชาย ใจดี"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                    />

                  </div>


                  {/* EMAIL */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">

                      อีเมล

                      <span className="text-danger">
                        *
                      </span>

                    </label>

                    <input
                      type="email"
                      className="form-control"
                      placeholder="example@cmu.ac.th"
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email:
                            e.target.value,
                        })
                      }
                    />

                  </div>


                  {/* ID */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">

                      รหัสนักศึกษา / รหัสบุคลากร

                      <span className="text-danger">
                        *
                      </span>

                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น 650610001"
                      value={form.studentId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          studentId:
                            e.target.value,
                        })
                      }
                    />

                  </div>


                  {/* PHONE */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      เบอร์โทรศัพท์
                    </label>

                    <input
                      type="tel"
                      className="form-control"
                      placeholder="08x-xxx-xxxx"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone:
                            e.target.value,
                        })
                      }
                    />

                  </div>


                  {/* DEPARTMENT */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">

                      คณะ / สาขาวิชา

                      <span className="text-danger">
                        *
                      </span>

                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น สาขาวิชาสังคมศาสตร์"
                      value={
                        form.department
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          department:
                            e.target.value,
                        })
                      }
                    />

                  </div>


                  {/* ROLE */}

                  <div className="col-md-3">

                    <label className="form-label fw-semibold">
                      สิทธิ์
                    </label>

                    <select
                      className="form-select"
                      value={form.role}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          role: e.target
                            .value as UserRole,
                        })
                      }
                    >

                      <option>
                        นักศึกษา
                      </option>

                      <option>
                        บุคลากร
                      </option>

                      <option>
                        ผู้ดูแลระบบ
                      </option>

                    </select>

                  </div>


                  {/* STATUS */}

                  <div className="col-md-3">

                    <label className="form-label fw-semibold">
                      สถานะ
                    </label>

                    <select
                      className="form-select"
                      value={
                        form.status
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status:
                            e.target
                              .value as UserStatus,
                        })
                      }
                    >

                      <option>
                        ใช้งาน
                      </option>

                      <option>
                        ระงับการใช้งาน
                      </option>

                    </select>

                  </div>


                  {/* PASSWORD NOTE */}

                  <div className="col-12">

                    <div className="alert alert-light border rounded-4 mb-0">

                      <div className="d-flex gap-3">

                        <i className="bi bi-info-circle text-primary fs-5"></i>

                        <div>

                          <div className="fw-semibold">
                            การจัดการรหัสผ่าน
                          </div>

                          <small className="text-secondary">
                            ในระบบจริงควรให้ผู้ใช้งานเข้าสู่ระบบผ่าน
                            CMU Account หรือระบบ Authentication
                            แทนการจัดเก็บรหัสผ่านเอง
                          </small>

                        </div>

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
                    background:
                      "#6f42c1",
                  }}
                  onClick={saveUser}
                >

                  <i className="bi bi-check-lg me-2"></i>

                  {editingUser
                    ? "บันทึกการแก้ไข"
                    : "เพิ่มผู้ใช้งาน"}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {showDetail && selectedUser && (

        <div
          className="modal fade show d-block"
          style={{
            background:
              "rgba(0,0,0,0.6)",
            zIndex: 1060,
          }}
          onClick={() =>
            setShowDetail(false)
          }
        >

          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-content border-0 rounded-4">


              {/* PROFILE HEADER */}

              <div
                className="modal-body p-4"
                style={{
                  background:
                    "linear-gradient(135deg, #f5f0ff, #ffffff)",
                }}
              >

                <div className="d-flex justify-content-between">

                  <span className="badge bg-white text-primary border rounded-pill px-3 py-2">
                    ข้อมูลผู้ใช้งาน
                  </span>

                  <button
                    className="btn-close"
                    onClick={() =>
                      setShowDetail(false)
                    }
                  ></button>

                </div>


                <div className="text-center mt-4">

                  <div
                    className="mx-auto rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "90px",
                      height: "90px",
                      background:
                        "#6f42c1",
                      color: "white",
                    }}
                  >

                    <i className="bi bi-person-fill fs-1"></i>

                  </div>


                  <h4 className="fw-bold mt-3 mb-1">
                    {selectedUser.name}
                  </h4>


                  <div className="text-secondary">
                    {selectedUser.email}
                  </div>


                  <div className="mt-3">

                    <RoleBadge
                      role={
                        selectedUser.role
                      }
                    />

                    <span
                      className={`badge rounded-pill ms-2 px-3 py-2 ${
                        selectedUser.status ===
                        "ใช้งาน"
                          ? "bg-success-subtle text-success"
                          : "bg-danger-subtle text-danger"
                      }`}
                    >

                      <i
                        className={`bi ${
                          selectedUser.status ===
                          "ใช้งาน"
                            ? "bi-check-circle"
                            : "bi-slash-circle"
                        } me-1`}
                      ></i>

                      {selectedUser.status}

                    </span>

                  </div>

                </div>


                {/* INFO */}

                <div className="bg-white rounded-4 p-3 mt-4">

                  <InfoRow
                    icon="bi-person-vcard"
                    title="รหัสผู้ใช้งาน"
                    value={
                      selectedUser.studentId
                    }
                  />


                  <InfoRow
                    icon="bi-building"
                    title="คณะ / สาขา"
                    value={
                      selectedUser.department
                    }
                  />


                  <InfoRow
                    icon="bi-telephone"
                    title="เบอร์โทรศัพท์"
                    value={
                      selectedUser.phone ||
                      "-"
                    }
                  />


                  <InfoRow
                    icon="bi-box-arrow-up-right"
                    title="จำนวนครั้งที่ยืม"
                    value={`${selectedUser.borrowCount} ครั้ง`}
                  />


                  <InfoRow
                    icon="bi-calendar3"
                    title="วันที่สมัคร"
                    value={
                      selectedUser.createdAt
                    }
                    last
                  />

                </div>

              </div>


              <div className="modal-footer border-0">

                <button
                  className="btn btn-light rounded-pill px-4"
                  onClick={() =>
                    setShowDetail(false)
                  }
                >
                  ปิด
                </button>


                <button
                  className="btn text-white rounded-pill px-4"
                  style={{
                    background:
                      "#6f42c1",
                  }}
                  onClick={() => {
                    setShowDetail(
                      false
                    );
                    openEditForm(
                      selectedUser
                    );
                  }}
                >

                  <i className="bi bi-pencil me-2"></i>

                  แก้ไขข้อมูล

                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {showDelete && deleteUser && (

        <div
          className="modal fade show d-block"
          style={{
            background:
              "rgba(0,0,0,0.7)",
            zIndex: 1070,
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
                    background:
                      "#f8d7da",
                    color: "#dc3545",
                  }}
                >

                  <i className="bi bi-trash fs-2"></i>

                </div>


                <h4 className="fw-bold">
                  ยืนยันการลบผู้ใช้งาน?
                </h4>


                <p className="text-secondary mb-1">
                  คุณต้องการลบบัญชี
                </p>


                <div className="fw-bold fs-5">
                  {deleteUser.name}
                </div>


                <small className="text-secondary">
                  {deleteUser.email}
                </small>


                <div className="alert alert-danger border-0 rounded-4 text-start mt-4">

                  <i className="bi bi-exclamation-triangle me-2"></i>

                  การลบผู้ใช้งานจะทำให้ข้อมูลบัญชีหายออกจากระบบ

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
              background:
                "#6f42c1",
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
   USER STAT
===================================================== */

function UserStat({
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
                background:
                  `${color}15`,
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


/* =====================================================
   ROLE BADGE
===================================================== */

function RoleBadge({
  role,
}: {
  role: UserRole;
}) {

  const config = {
    นักศึกษา: {
      icon: "bi-mortarboard",
      className:
        "bg-primary-subtle text-primary",
    },

    บุคลากร: {
      icon: "bi-person-badge",
      className:
        "bg-warning-subtle text-warning-emphasis",
    },

    ผู้ดูแลระบบ: {
      icon: "bi-shield-check",
      className:
        "bg-danger-subtle text-danger",
    },
  };

  const current = config[role];

  return (

    <span
      className={`badge rounded-pill px-3 py-2 ${current.className}`}
    >

      <i
        className={`${current.icon} me-1`}
      ></i>

      {role}

    </span>
  );
}


/* =====================================================
   INFO ROW
===================================================== */

function InfoRow({
  icon,
  title,
  value,
  last = false,
}: {
  icon: string;
  title: string;
  value: string;
  last?: boolean;
}) {

  return (

    <div
      className={`d-flex align-items-center gap-3 py-3 ${
        !last
          ? "border-bottom"
          : ""
      }`}
    >

      <div
        className="rounded-3 d-flex align-items-center justify-content-center"
        style={{
          width: "42px",
          height: "42px",
          background:
            "#f1eef6",
          color: "#6f42c1",
        }}
      >

        <i className={icon}></i>

      </div>


      <div className="flex-grow-1">

        <small className="text-secondary d-block">
          {title}
        </small>

        <div className="fw-semibold">
          {value}
        </div>

      </div>

    </div>
  );
}

