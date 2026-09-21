"use client";

import { useEffect, useMemo, useState } from "react";
import AdminNavbar from "@/app/components/AdminNavbar";
import {
  PageHeader,
  Panel,
  Pill,
  StatCard,
  Toolbar,
  type Tone,
} from "@/app/components/ui";
import Swal from "sweetalert2";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type UserRole = "user" | "admin";

type UserType = "student" | "teacher" | "staff";

const USER_TYPE_LABELS: Record<UserType, string> = {
  student: "นักศึกษา",
  teacher: "อาจารย์",
  staff: "เจ้าหน้าที่/บุคลากร",
};

const USER_TYPE_OPTIONS: UserType[] = [
  "student",
  "teacher",
  "staff",
];

type TypeFilter = "all" | UserType | "admin" | "none";

type User = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  user_type: UserType | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type UserForm = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  userType: UserType | "";
};

function getUserTypeLabel(user: Pick<User, "role" | "user_type">) {
  if (user.role === "admin") return "ผู้ดูแลระบบ";
  return user.user_type ? USER_TYPE_LABELS[user.user_type] : "-";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ทั้งหมด");
  const [typeFilter, setTypeFilter] =
    useState<TypeFilter>("all");

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
    userType: "",
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

      const matchType =
        typeFilter === "all" ||
        (typeFilter === "admin" &&
          user.role === "admin") ||
        (typeFilter === "none" &&
          user.role === "user" &&
          !user.user_type) ||
        (user.role === "user" &&
          user.user_type === typeFilter);

      return matchSearch && matchRole && matchType;
    });
  }, [
    users,
    search,
    roleFilter,
    typeFilter,
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

  const countByType = (type: UserType) =>
    users.filter(
      (user) =>
        user.role === "user" &&
        user.user_type === type
    ).length;

  const studentUsers = countByType("student");
  const teacherUsers = countByType("teacher");
  const staffUsers = countByType("staff");

  const untypedUsers =
    normalUsers -
    studentUsers -
    teacherUsers -
    staffUsers;

  /* =========================================================
     RESET FILTER
  ========================================================= */

  const resetFilter = () => {
    setSearch("");
    setRoleFilter("ทั้งหมด");
    setTypeFilter("all");
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
      userType: "",
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
      userType: user.user_type ?? "",
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
          "กรุณากรอกชื่อผู้ใช้"
        );
      }

      if (!form.email.trim()) {
        throw new Error(
          "กรุณากรอกอีเมล"
        );
      }

      if (
        !editingUser &&
        form.password.length < 6
      ) {
        throw new Error(
          "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
        );
      }

      if (
        editingUser &&
        form.password &&
        form.password.length < 6
      ) {
        throw new Error(
          "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"
        );
      }

      if (
        form.role === "user" &&
        !form.userType
      ) {
        throw new Error(
          "กรุณาเลือกประเภทผู้ใช้"
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

      const userType =
        form.role === "user"
          ? form.userType
          : null;

      const body = editingUser
        ? {
            id: editingUser.id,
            email: form.email,
            password: form.password,
            role: form.role,
            userType,
          }
        : {
            username: form.username,
            email: form.email,
            password: form.password,
            role: form.role,
            userType,
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
    <main className="min-vh-100">

      <AdminNavbar />

      <section className="admin-page-content">

        <div className="ui-page p-0">

          {/* HEADER */}

          <PageHeader
            eyebrow="ผู้ใช้งาน"
            title="จัดการผู้ใช้งาน"
            description="เพิ่ม แก้ไข และกำหนดสิทธิ์บัญชีผู้ใช้งานในระบบ"
            actions={
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={loadUsers}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>

                  {loading
                    ? "กำลังโหลด..."
                    : "รีเฟรชข้อมูล"}
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openCreateModal}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  เพิ่มผู้ใช้งาน
                </button>
              </>
            }
          />

          {/* ERROR */}

          {error && (
            <div className="alert alert-danger us-alert mb-0">

              <div className="d-flex align-items-start gap-3">

                <i className="bi bi-exclamation-triangle fs-5"></i>

                <div>

                  <div className="fw-semibold">
                    ไม่สามารถโหลดข้อมูลผู้ใช้งานได้
                  </div>

                  <div className="small mt-1">
                    {error}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* STAT */}

          <div className="row g-3">

            <div className="col-6 col-md-4 col-xl">
              <StatCard
                icon="bi-people"
                label="ผู้ใช้งานทั้งหมด"
                value={totalUsers}
                tone="purple"
                hint={
                  untypedUsers > 0
                    ? `ยังไม่ระบุประเภท ${untypedUsers} คน`
                    : `ผู้ใช้งานทั่วไป ${normalUsers} คน`
                }
              />
            </div>

            <div className="col-6 col-md-4 col-xl">
              <StatCard
                icon="bi-mortarboard"
                label="นักศึกษา"
                value={studentUsers}
                tone="blue"
              />
            </div>

            <div className="col-6 col-md-4 col-xl">
              <StatCard
                icon="bi-person-video3"
                label="อาจารย์"
                value={teacherUsers}
                tone="emerald"
              />
            </div>

            <div className="col-6 col-md-6 col-xl">
              <StatCard
                icon="bi-briefcase"
                label="เจ้าหน้าที่/บุคลากร"
                value={staffUsers}
                tone="amber"
              />
            </div>

            <div className="col-12 col-md-6 col-xl">
              <StatCard
                icon="bi-shield-check"
                label="ผู้ดูแลระบบ"
                value={adminUsers}
                tone="rose"
              />
            </div>

          </div>

          {/* FILTER */}

          <Toolbar>

            <div className="input-group us-search">

              <span className="input-group-text bg-white">
                <i className="bi bi-search text-secondary"></i>
              </span>

              <input
                type="text"
                className="form-control border-start-0"
                placeholder="ค้นหาชื่อผู้ใช้ อีเมล หรือรหัส..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

            <select
              className="form-select w-auto"
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

            <select
              className="form-select w-auto"
              aria-label="กรองตามประเภทผู้ใช้"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value as TypeFilter
                )
              }
            >

              <option value="all">
                ทุกประเภท
              </option>

              {USER_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {USER_TYPE_LABELS[type]}
                </option>
              ))}

              <option value="admin">
                ผู้ดูแลระบบ
              </option>

              <option value="none">
                ยังไม่ระบุประเภท
              </option>

            </select>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={resetFilter}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i>
              รีเซ็ต
            </button>

          </Toolbar>

          {/* TABLE */}

          <Panel
            flush
            title="รายชื่อผู้ใช้งาน"
            description={
              loading ? undefined : (
                <>
                  แสดง <strong>{filteredUsers.length}</strong>
                  {" "}จาก{" "}
                  <strong>{users.length}</strong>
                  {" "}ผู้ใช้งาน
                </>
              )
            }
          >

            {loading ? (

              <div className="text-center py-5">

                <div
                  className="spinner-border"
                  style={{
                    color: "#6f42c1",
                  }}
                />

                <div className="mt-3 text-secondary">
                  กำลังโหลดข้อมูลจากฐานข้อมูล...
                </div>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table align-middle ui-table us-table">

                  <thead>

                    <tr>
                      <th>รหัส</th>
                      <th>ผู้ใช้งาน</th>
                      <th>อีเมล</th>
                      <th>ประเภทผู้ใช้</th>
                      <th>สิทธิ์</th>
                      <th>วันที่สมัคร</th>
                      <th className="text-end">จัดการ</th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredUsers.length > 0 ? (

                      filteredUsers.map(
                        (user) => (

                          <tr key={user.id}>

                            <td>
                              <Pill tone="neutral">
                                #{user.id}
                              </Pill>
                            </td>

                            <td>

                              <div className="d-flex align-items-center gap-3">

                                <div className="us-avatar tone-purple">
                                  {user.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={user.avatar_url}
                                      alt=""
                                      loading="lazy"
                                    />
                                  ) : (
                                    user.username
                                      .trim()
                                      .charAt(0)
                                      .toUpperCase()
                                  )}
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
                              <UserTypeBadge
                                user={user}
                              />
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
                                  className="btn btn-sm us-action"
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
                                  className="btn btn-sm us-action"
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
                                  className="btn btn-sm us-action danger"
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
                          colSpan={7}
                          className="text-center py-5"
                        >

                          <i className="bi bi-people fs-3 text-secondary"></i>

                          <div className="fw-semibold mt-2">
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

          </Panel>

        </div>

      </section>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {showDetail &&
        selectedUser && (

          <div
            className="modal fade show d-block us-modal-backdrop"
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

              <div className="modal-content us-modal">

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

                    <div className="us-avatar lg tone-purple mx-auto">
                      {selectedUser.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedUser.avatar_url}
                          alt={`รูปโปรไฟล์ของ ${selectedUser.username}`}
                        />
                      ) : (
                        selectedUser.username
                          .trim()
                          .charAt(0)
                          .toUpperCase()
                      )}
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

                  <div className="us-soft px-3 mt-4">

                    <InfoRow
                      icon="bi-hash"
                      title="รหัสผู้ใช้งาน"
                      value={String(
                        selectedUser.id
                      )}
                    />

                    <InfoRow
                      icon="bi-person"
                      title="ชื่อผู้ใช้"
                      value={
                        selectedUser.username
                      }
                    />

                    <InfoRow
                      icon="bi-envelope"
                      title="อีเมล"
                      value={
                        selectedUser.email
                      }
                    />

                    <InfoRow
                      icon="bi-person-badge"
                      title="ประเภทผู้ใช้"
                      value={getUserTypeLabel(
                        selectedUser
                      )}
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

                <div className="modal-footer px-4 py-3">

                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() =>
                      setShowDetail(
                        false
                      )
                    }
                  >
                    ปิด
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-danger px-4"
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
                    className="btn btn-primary px-4"
                    onClick={() =>
                      openEditModal(
                        selectedUser
                      )
                    }
                  >
                    <i className="bi bi-pencil me-2"></i>
                    แก้ไข
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
          className="modal fade show d-block us-modal-backdrop"
          tabIndex={-1}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content us-modal">

              <form onSubmit={handleSubmit}>

                <div className="modal-header px-4 py-3">

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

                <div className="modal-body p-4">

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
                        placeholder="กรอกชื่อผู้ใช้"
                        required
                      />

                    </div>

                    {editingUser && (
                      <small className="text-secondary">
                        ชื่อผู้ใช้ไม่สามารถแก้ไขได้
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
                            ? "รหัสผ่านใหม่"
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

                  {/* USER TYPE */}

                  {form.role === "user" && (

                    <div className="mb-3">

                      <label
                        htmlFor="us-user-type"
                        className="form-label fw-semibold"
                      >
                        ประเภทผู้ใช้
                      </label>

                      <select
                        id="us-user-type"
                        className="form-select"
                        value={form.userType}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            userType:
                              e.target
                                .value as
                                | UserType
                                | "",
                          })
                        }
                        required
                      >

                        <option value="" disabled>
                          เลือกประเภทผู้ใช้
                        </option>

                        {USER_TYPE_OPTIONS.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {USER_TYPE_LABELS[type]}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                  )}

                  {editingUser &&
                    form.role ===
                      "admin" && (

                      <div className="alert alert-warning us-warn small mb-0">

                        <i className="bi bi-exclamation-triangle me-2"></i>

                        บัญชีนี้จะมีสิทธิ์เข้าถึงส่วนจัดการระบบ

                      </div>

                    )}

                </div>

                <div className="modal-footer px-4 py-3">

                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
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
                    className="btn btn-primary px-4"
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

      <style jsx>{`
        .us-search {
          flex: 1 1 240px;
          max-width: 420px;
        }

        .us-table {
          min-width: 940px;
        }

        .us-table > tbody > tr > td {
          background: transparent;
        }

        .us-avatar {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          overflow: hidden;
          font-size: 15px;
          font-weight: 700;
        }

        .us-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .us-avatar.lg {
          width: 72px;
          height: 72px;
          font-size: 28px;
        }

        .us-action {
          width: 32px;
          height: 32px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          background: #ffffff;
          color: #404040;
        }

        .us-action:hover {
          background: #f3efff;
          border-color: #d9ccff;
          color: #6f42c1;
        }

        .us-action.danger {
          color: #e11d48;
        }

        .us-action.danger:hover {
          background: #fff1f2;
          border-color: #fecdd3;
          color: #e11d48;
        }

        .us-alert {
          border: 1px solid #fecdd3;
          border-radius: 12px;
          background: #fff1f2;
          color: #9f1239;
          font-size: 14px;
        }

        .us-warn {
          border: 1px solid #fde68a;
          border-radius: 8px;
          background: #fffbeb;
          color: #92400e;
        }

        .us-modal-backdrop {
          background: rgba(15, 23, 42, 0.45);
        }

        .us-modal {
          border: 1px solid #e4e4e4;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .us-modal .modal-header,
        .us-modal .modal-footer {
          border-color: #e4e4e4;
        }

        .us-soft {
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          background: #fafafa;
        }
      `}</style>

    </main>
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
      <Pill tone="rose">
        <i className="bi bi-shield-check"></i>
        ผู้ดูแลระบบ
      </Pill>
    );
  }

  return (
    <Pill tone="purple">
      <i className="bi bi-person"></i>
      ผู้ใช้งาน
    </Pill>
  );
}

/* =========================================================
   USER TYPE BADGE
========================================================= */

const USER_TYPE_STYLE: Record<
  UserType,
  { tone: Tone; icon: string }
> = {
  student: { tone: "blue", icon: "bi-mortarboard" },
  teacher: { tone: "emerald", icon: "bi-person-video3" },
  staff: { tone: "amber", icon: "bi-briefcase" },
};

function UserTypeBadge({
  user,
}: {
  user: Pick<User, "role" | "user_type">;
}) {
  if (user.role === "admin") {
    return (
      <Pill tone="neutral">
        ผู้ดูแลระบบ
      </Pill>
    );
  }

  if (!user.user_type) {
    return (
      <span className="text-secondary">-</span>
    );
  }

  const style = USER_TYPE_STYLE[user.user_type];

  return (
    <Pill tone={style.tone}>
      <i className={`bi ${style.icon}`}></i>
      {USER_TYPE_LABELS[user.user_type]}
    </Pill>
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
      className="d-flex align-items-center gap-3 py-3"
      style={
        last
          ? undefined
          : { borderBottom: "1px solid #e4e4e4" }
      }
    >

      <div
        className="tone-purple d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
        }}
      >
        <i className={`bi ${icon}`} />
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