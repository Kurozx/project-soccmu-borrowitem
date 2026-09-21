"use client";

import { useEffect, useMemo, useState } from "react";
import AdminNavbar from "@/app/components/AdminNavbar";
import Swal from "sweetalert2";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type UserRole = "user" | "admin";

type User = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

type UserForm = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ทั้งหมด");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [form, setForm] = useState<UserForm>({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  /* =========================================================
     LOAD USERS
  ========================================================= */

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/users",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const contentType =
        response.headers.get("content-type");

      const text = await response.text();

      console.log("API STATUS:", response.status);
      console.log(
        "API CONTENT TYPE:",
        contentType
      );

      if (!contentType?.includes("application/json")) {
        throw new Error(
          `API /api/admin/users ไม่ได้ส่ง JSON กลับมา (HTTP ${response.status})`
        );
      }

      const result = JSON.parse(text);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้"
        );
      }

      setUsers(result.data || []);
    } catch (error) {
      console.error(
        "LOAD USERS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredUsers = useMemo(() => {
    const keyword =
      search.toLowerCase().trim();

    return users.filter((user) => {
      const matchSearch =
        user.username
          .toLowerCase()
          .includes(keyword) ||
        user.email
          .toLowerCase()
          .includes(keyword) ||
        String(user.id).includes(keyword);

      const matchRole =
        roleFilter === "ทั้งหมด" ||
        (roleFilter === "ผู้ใช้งาน" &&
          user.role === "user") ||
        (roleFilter === "ผู้ดูแลระบบ" &&
          user.role === "admin");

      return matchSearch && matchRole;
    });
  }, [
    users,
    search,
    roleFilter,
  ]);

  /* =========================================================
     STAT
  ========================================================= */

  const totalUsers = users.length;

  const normalUsers = users.filter(
    (user) => user.role === "user"
  ).length;

  const adminUsers = users.filter(
    (user) => user.role === "admin"
  ).length;

  /* =========================================================
     RESET FILTER
  ========================================================= */

  const resetFilter = () => {
    setSearch("");
    setRoleFilter("ทั้งหมด");
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date: string) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /* =========================================================
     OPEN CREATE
  ========================================================= */

  const openCreateModal = () => {
    setEditingUser(null);

    setForm({
      username: "",
      email: "",
      password: "",
      role: "user",
    });

    setShowForm(true);
  };

  /* =========================================================
     OPEN EDIT
  ========================================================= */

  const openEditModal = (user: User) => {
    setEditingUser(user);

    setForm({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
    });

    setShowDetail(false);
    setShowForm(true);
  };

  /* =========================================================
     CREATE / UPDATE
  ========================================================= */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setSaving(true);

      /* ================================
         VALIDATE
      ================================= */

      if (!form.username.trim()) {
        throw new Error(
          "กรุณากรอก Username"
        );
      }

      if (!form.email.trim()) {
        throw new Error(
          "กรุณากรอก Email"
        );
      }

      if (
        !editingUser &&
        form.password.length < 6
      ) {
        throw new Error(
          "Password ต้องมีอย่างน้อย 6 ตัวอักษร"
        );
      }

      if (
        editingUser &&
        form.password &&
        form.password.length < 6
      ) {
        throw new Error(
          "Password ใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"
        );
      }

      /* ================================
         CONFIRM
      ================================= */

      const confirm = await Swal.fire({
        title: editingUser
          ? "ยืนยันการแก้ไข?"
          : "ยืนยันการเพิ่มผู้ใช้งาน?",
        text: editingUser
          ? "ข้อมูลผู้ใช้งานจะถูกแก้ไขในฐานข้อมูล"
          : "ระบบจะสร้างบัญชีผู้ใช้งานใหม่",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: editingUser
          ? "บันทึกการแก้ไข"
          : "เพิ่มผู้ใช้งาน",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#6f42c1",
      });

      if (!confirm.isConfirmed) {
        return;
      }

      /* ================================
         API
      ================================= */

      const url =
        "/api/admin/users";

      const method = editingUser
        ? "PATCH"
        : "POST";

      const body = editingUser
        ? {
            id: editingUser.id,
            email: form.email,
            password: form.password,
            role: form.role,
          }
        : {
            username: form.username,
            email: form.email,
            password: form.password,
            role: form.role,
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "ไม่สามารถบันทึกข้อมูลได้"
        );
      }

      /* ================================
         SUCCESS
      ================================= */

      setShowForm(false);

      await loadUsers();

      await Swal.fire({
        title: "สำเร็จ",
        text:
          result.message ||
          "บันทึกข้อมูลสำเร็จ",
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#6f42c1",
      });
    } catch (error) {
      console.error(
        "SAVE USER ERROR:",
        error
      );

      Swal.fire({
        title: "ไม่สำเร็จ",
        text:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาด",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#6f42c1",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (
    user: User
  ) => {
    const confirm = await Swal.fire({
      title: "ต้องการลบผู้ใช้งาน?",
      html: `
        <div>
          คุณกำลังจะลบบัญชี
          <strong>${escapeHtml(
            user.username
          )}</strong>
        </div>
        <div class="text-danger mt-2">
          การลบข้อมูลไม่สามารถย้อนกลับได้
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบผู้ใช้งาน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc3545",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/users",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            id: user.id,
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "ไม่สามารถลบผู้ใช้งานได้"
        );
      }

      await loadUsers();

      setShowDetail(false);
      setSelectedUser(null);

      await Swal.fire({
        title: "ลบสำเร็จ",
        text:
          result.message ||
          "ลบผู้ใช้งานเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#6f42c1",
      });
    } catch (error) {
      console.error(
        "DELETE USER ERROR:",
        error
      );

      Swal.fire({
        title: "ไม่สามารถลบได้",
        text:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาด",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#6f42c1",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <main className="bg-light min-vh-100">

      <AdminNavbar />

      <section className="admin-page-content admin-users-page">

        <div className="container-fluid">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="admin-users-header mb-4">

            <div>

              <h2 className="admin-page-title mb-1">
                จัดการผู้ใช้งาน
              </h2>

            </div>

            <div className="d-flex gap-2">

              <button
                type="button"
                className="btn btn-success rounded-pill px-4"
                onClick={openCreateModal}
              >
                <i className="bi bi-person-plus me-2"></i>
                เพิ่มผู้ใช้งาน
              </button>

              <button
                type="button"
                className="btn admin-primary-btn rounded-pill px-4"
                onClick={loadUsers}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>

                {loading
                  ? "กำลังโหลด..."
                  : "รีเฟรชข้อมูล"}
              </button>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="alert alert-danger border-0 rounded-4 shadow-sm mb-4">

              <div className="d-flex align-items-start gap-3">

                <i className="bi bi-exclamation-triangle fs-4"></i>

                <div>

                  <div className="fw-bold">
                    ไม่สามารถโหลดข้อมูลผู้ใช้งานได้
                  </div>

                  <div className="small mt-1">
                    {error}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              STAT
          ================================================= */}

          <div className="row g-3 mb-4">

            <UserStat
              icon="bi-people"
              title="ผู้ใช้งานทั้งหมด"
              value={totalUsers.toString()}
              color="#6f42c1"
            />

            <UserStat
              icon="bi-person-check"
              title="ผู้ใช้งานทั่วไป"
              value={normalUsers.toString()}
              color="#198754"
            />

            <UserStat
              icon="bi-shield-check"
              title="ผู้ดูแลระบบ"
              value={adminUsers.toString()}
              color="#dc3545"
            />

            <UserStat
              icon="bi-database"
              title="ข้อมูลจาก TiDB"
              value={users.length.toString()}
              color="#0d6efd"
            />

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-4">

              {/* FILTER */}

              <div className="row g-3 mb-4">

                <div className="col-lg-7">

                  <div className="input-group">

                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-search"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      placeholder="ค้นหา Username, Email หรือ ID..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <div className="col-lg-3">

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
                      ผู้ใช้งาน
                    </option>

                    <option>
                      ผู้ดูแลระบบ
                    </option>

                  </select>

                </div>

                <div className="col-lg-2">

                  <button
                    type="button"
                    className="btn btn-light w-100"
                    onClick={resetFilter}
                  >

                    <i className="bi bi-arrow-counterclockwise me-2"></i>

                    รีเซ็ต

                  </button>

                </div>

              </div>

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading ? (

                <div className="text-center py-5">

                  <div
                    className="spinner-border"
                    style={{
                      color: "#6f42c1",
                    }}
                  />

                  <div className="mt-3 text-secondary">
                    กำลังโหลดข้อมูลจาก TiDB...
                  </div>

                </div>

              ) : (

                <div className="table-responsive">

                  <table className="table align-middle admin-users-table">

                    <thead>

                      <tr className="text-secondary">

                        <th>ID</th>

                        <th>
                          ผู้ใช้งาน
                        </th>

                        <th>
                          Email
                        </th>

                        <th>
                          สิทธิ์
                        </th>

                        <th>
                          วันที่สมัคร
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

                              <td>

                                <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                                  #{user.id}
                                </span>

                              </td>

                              <td>

                                <div className="d-flex align-items-center gap-3">

                                  <div className="user-avatar">

                                    <i className="bi bi-person fs-5"></i>

                                  </div>

                                  <div>

                                    <div className="fw-semibold">
                                      {user.username}
                                    </div>

                                    <small className="text-secondary">
                                      บัญชีผู้ใช้งาน
                                    </small>

                                  </div>

                                </div>

                              </td>

                              <td>
                                {user.email}
                              </td>

                              <td>

                                <RoleBadge
                                  role={
                                    user.role
                                  }
                                />

                              </td>

                              <td>

                                <small className="text-secondary">
                                  {formatDate(
                                    user.created_at
                                  )}
                                </small>

                              </td>

                              <td className="text-end">

                                <div className="d-flex justify-content-end gap-2">

                                  {/* VIEW */}

                                  <button
                                    type="button"
                                    className="btn btn-light btn-sm rounded-circle user-action-btn"
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
                                    type="button"
                                    className="btn btn-warning btn-sm rounded-circle text-white"
                                    title="แก้ไข"
                                    onClick={() =>
                                      openEditModal(
                                        user
                                      )
                                    }
                                  >

                                    <i className="bi bi-pencil"></i>

                                  </button>

                                  {/* DELETE */}

                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm rounded-circle"
                                    title="ลบ"
                                    onClick={() =>
                                      handleDelete(
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
                            colSpan={6}
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

              )}

              {!loading && (

                <div className="mt-3">

                  <small className="text-secondary">

                    แสดง{" "}

                    <strong>
                      {filteredUsers.length}
                    </strong>

                    {" "}จาก{" "}

                    <strong>
                      {users.length}
                    </strong>

                    {" "}ผู้ใช้งาน

                  </small>

                </div>

              )}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {showDetail &&
        selectedUser && (

          <div
            className="modal fade show d-block admin-users-modal-backdrop"
            tabIndex={-1}
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

                <div className="modal-body p-4">

                  <div className="d-flex justify-content-between align-items-center">

                    <h5 className="fw-bold mb-0">
                      รายละเอียดผู้ใช้งาน
                    </h5>

                    <button
                      type="button"
                      className="btn-close"
                      onClick={() =>
                        setShowDetail(
                          false
                        )
                      }
                    />

                  </div>

                  <div className="text-center mt-4">

                    <div className="user-detail-avatar">

                      <i className="bi bi-person-fill fs-1"></i>

                    </div>

                    <h4 className="fw-bold mt-3 mb-1">
                      {selectedUser.username}
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

                    </div>

                  </div>

                  <div className="bg-light rounded-4 p-3 mt-4">

                    <InfoRow
                      icon="bi-hash"
                      title="รหัสผู้ใช้งาน"
                      value={String(
                        selectedUser.id
                      )}
                    />

                    <InfoRow
                      icon="bi-person"
                      title="Username"
                      value={
                        selectedUser.username
                      }
                    />

                    <InfoRow
                      icon="bi-envelope"
                      title="Email"
                      value={
                        selectedUser.email
                      }
                    />

                    <InfoRow
                      icon="bi-shield-check"
                      title="สิทธิ์"
                      value={
                        selectedUser.role ===
                        "admin"
                          ? "ผู้ดูแลระบบ"
                          : "ผู้ใช้งาน"
                      }
                    />

                    <InfoRow
                      icon="bi-calendar3"
                      title="วันที่สมัคร"
                      value={formatDate(
                        selectedUser.created_at
                      )}
                    />

                    <InfoRow
                      icon="bi-clock-history"
                      title="แก้ไขล่าสุด"
                      value={formatDate(
                        selectedUser.updated_at
                      )}
                      last
                    />

                  </div>

                </div>

                <div className="modal-footer border-0">

                  <button
                    type="button"
                    className="btn btn-warning text-white rounded-pill px-4"
                    onClick={() =>
                      openEditModal(
                        selectedUser
                      )
                    }
                  >

                    <i className="bi bi-pencil me-2"></i>

                    แก้ไข

                  </button>

                  <button
                    type="button"
                    className="btn btn-danger rounded-pill px-4"
                    onClick={() =>
                      handleDelete(
                        selectedUser
                      )
                    }
                  >

                    <i className="bi bi-trash me-2"></i>

                    ลบ

                  </button>

                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() =>
                      setShowDetail(
                        false
                      )
                    }
                  >
                    ปิด
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showForm && (

        <div
          className="modal fade show d-block admin-users-modal-backdrop"
          tabIndex={-1}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content border-0 rounded-4 shadow">

              <form onSubmit={handleSubmit}>

                <div className="modal-header border-0 px-4 pt-4">

                  <div>

                    <h5 className="fw-bold mb-1">

                      {editingUser
                        ? "แก้ไขผู้ใช้งาน"
                        : "เพิ่มผู้ใช้งาน"}

                    </h5>

                    <small className="text-secondary">

                      {editingUser
                        ? `แก้ไขบัญชี ${editingUser.username}`
                        : "สร้างบัญชีผู้ใช้งานใหม่"}

                    </small>

                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() =>
                      setShowForm(
                        false
                      )
                    }
                  />

                </div>

                <div className="modal-body px-4">

                  {/* USERNAME */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Username
                    </label>

                    <div className="input-group">

                      <span className="input-group-text">
                        <i className="bi bi-person"></i>
                      </span>

                      <input
                        type="text"
                        className="form-control"
                        value={
                          form.username
                        }
                        disabled={
                          !!editingUser
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            username:
                              e.target
                                .value,
                          })
                        }
                        placeholder="กรอก Username"
                        required
                      />

                    </div>

                    {editingUser && (
                      <small className="text-secondary">
                        Username ไม่สามารถแก้ไขได้
                      </small>
                    )}

                  </div>

                  {/* EMAIL */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Email
                    </label>

                    <div className="input-group">

                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>

                      <input
                        type="email"
                        className="form-control"
                        value={
                          form.email
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            email:
                              e.target
                                .value,
                          })
                        }
                        placeholder="example@email.com"
                        required
                      />

                    </div>

                  </div>

                  {/* PASSWORD */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">

                      Password

                      {editingUser && (
                        <span className="text-secondary fw-normal">
                          {" "}
                          (เว้นว่างถ้าไม่เปลี่ยน)
                        </span>
                      )}

                    </label>

                    <div className="input-group">

                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>

                      <input
                        type="password"
                        className="form-control"
                        value={
                          form.password
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            password:
                              e.target
                                .value,
                          })
                        }
                        placeholder={
                          editingUser
                            ? "Password ใหม่"
                            : "อย่างน้อย 6 ตัวอักษร"
                        }
                        required={
                          !editingUser
                        }
                      />

                    </div>

                  </div>

                  {/* ROLE */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      สิทธิ์ผู้ใช้งาน
                    </label>

                    <select
                      className="form-select"
                      value={
                        form.role
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          role:
                            e.target
                              .value as UserRole,
                        })
                      }
                    >

                      <option value="user">
                        ผู้ใช้งานทั่วไป
                      </option>

                      <option value="admin">
                        ผู้ดูแลระบบ
                      </option>

                    </select>

                  </div>

                  {editingUser &&
                    form.role ===
                      "admin" && (

                      <div className="alert alert-warning border-0 rounded-3 small">

                        <i className="bi bi-exclamation-triangle me-2"></i>

                        บัญชีนี้จะมีสิทธิ์เข้าถึงส่วนจัดการระบบ

                      </div>

                    )}

                </div>

                <div className="modal-footer border-0 px-4 pb-4">

                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() =>
                      setShowForm(
                        false
                      )
                    }
                    disabled={saving}
                  >
                    ยกเลิก
                  </button>

                  <button
                    type="submit"
                    className="btn admin-primary-btn rounded-pill px-4"
                    disabled={saving}
                  >

                    {saving ? (

                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                        />

                        กำลังบันทึก...

                      </>

                    ) : (

                      <>
                        <i className="bi bi-check-lg me-2"></i>

                        {editingUser
                          ? "บันทึกการแก้ไข"
                          : "เพิ่มผู้ใช้งาน"}

                      </>

                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

/* =========================================================
   USER STAT
========================================================= */

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
    <div className="col-12 col-sm-6 col-xl-3">

      <div className="card border-0 shadow-sm rounded-4 h-100">

        <div className="card-body p-4">

          <div className="d-flex align-items-center gap-3">

            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: "50px",
                height: "50px",
                background: `${color}15`,
                color: color,
              }}
            >

              <i
                className={`bi ${icon} fs-5`}
              />

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

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({
  role,
}: {
  role: UserRole;
}) {
  if (role === "admin") {
    return (
      <span className="badge rounded-pill px-3 py-2 bg-danger-subtle text-danger">

        <i className="bi bi-shield-check me-1"></i>

        ผู้ดูแลระบบ

      </span>
    );
  }

  return (
    <span className="badge rounded-pill px-3 py-2 bg-primary-subtle text-primary">

      <i className="bi bi-person me-1"></i>

      ผู้ใช้งาน

    </span>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

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
        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: "42px",
          height: "42px",
          background: "#eee8ff",
          color: "#6f42c1",
        }}
      >

        <i
          className={`bi ${icon}`}
        />

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

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}