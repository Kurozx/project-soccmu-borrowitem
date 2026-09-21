"use client";

import { useMemo, useState } from "react";
import UserNavbar from "@/app/components/UserNavbar";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

/* =========================================================
   TYPES
========================================================= */

type EquipmentStatus =
  | "available"
  | "borrowed"
  | "maintenance"
  | "inactive";

type EquipmentItem = {
  id: number;
  equipmentCode: string;
  name: string;
  category: string;
  description: string;
  location: string;
  quantity: number;
  availableQuantity: number;
  status: EquipmentStatus;
  imageUrl: string | null;
};

/*
  สำคัญมาก

  EquipmentClient ต้องประกาศ Props
  เพื่อรับ items จาก page.tsx
*/
type EquipmentClientProps = {
  items: EquipmentItem[];
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function EquipmentClient({
  items,
}: EquipmentClientProps) {
  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("ทั้งหมด");

  const [status, setStatus] =
    useState("ทั้งหมด");

  const [selectedItem, setSelectedItem] =
    useState<EquipmentItem | null>(null);

  /* =====================================================
     CATEGORY LIST
  ===================================================== */

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        items.map(
          (item) => item.category
        )
      )
    );

    return [
      "ทั้งหมด",
      ...uniqueCategories,
    ];
  }, [items]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredItems = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return items.filter((item) => {
      const matchSearch =
        keyword === "" ||
        item.name
          .toLowerCase()
          .includes(keyword) ||
        item.equipmentCode
          .toLowerCase()
          .includes(keyword) ||
        item.category
          .toLowerCase()
          .includes(keyword) ||
        item.location
          .toLowerCase()
          .includes(keyword);

      const matchCategory =
        category === "ทั้งหมด" ||
        item.category === category;

      const matchStatus =
        status === "ทั้งหมด" ||
        item.status === status;

      return (
        matchSearch &&
        matchCategory &&
        matchStatus
      );
    });
  }, [
    items,
    search,
    category,
    status,
  ]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const statistics = useMemo(() => {
    const total = items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );

    const available = items.reduce(
      (sum, item) =>
        sum + item.availableQuantity,
      0
    );

    const borrowed = items.reduce(
      (sum, item) =>
        sum +
        Math.max(
          0,
          item.quantity -
            item.availableQuantity
        ),
      0
    );

    const maintenance =
      items
        .filter(
          (item) =>
            item.status ===
            "maintenance"
        )
        .reduce(
          (sum, item) =>
            sum + item.quantity,
          0
        );

    const inactive =
      items
        .filter(
          (item) =>
            item.status ===
            "inactive"
        )
        .reduce(
          (sum, item) =>
            sum + item.quantity,
          0
        );

    return {
      total,
      available,
      borrowed,
      maintenance,
      inactive,
    };
  }, [items]);

  /* =====================================================
     RESET
  ===================================================== */

  const resetFilter = () => {
    setSearch("");
    setCategory("ทั้งหมด");
    setStatus("ทั้งหมด");
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <UserNavbar />

      <main className="equipment-main">
        <div className="container-fluid px-4 py-4">

          {/* ============================================
              HEADER
          ============================================ */}

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

            <div>
              <h2 className="fw-bold mb-1">
                ครุภัณฑ์
              </h2>

              <p className="text-secondary mb-0">
                รายการครุภัณฑ์ทั้งหมดในระบบ
              </p>
            </div>

            <div className="text-secondary">
              พบ{" "}
              <strong className="text-dark">
                {filteredItems.length}
              </strong>{" "}
              รายการ
            </div>

          </div>

          {/* ============================================
              STATISTICS
          ============================================ */}

          <div className="row g-3 mb-4">

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-box-seam"
                title="ครุภัณฑ์ทั้งหมด"
                value={
                  statistics.total
                }
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-check-circle"
                title="พร้อมใช้งาน"
                value={
                  statistics.available
                }
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-arrow-up-right-circle"
                title="ถูกยืม"
                value={
                  statistics.borrowed
                }
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-tools"
                title="ซ่อมบำรุง"
                value={
                  statistics.maintenance
                }
              />
            </div>

            <div className="col-12 col-xl">
              <StatCard
                icon="bi-x-circle"
                title="ไม่พร้อมใช้งาน"
                value={
                  statistics.inactive
                }
              />
            </div>

          </div>

          {/* ============================================
              SEARCH / FILTER
          ============================================ */}

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">

              <div className="row g-3">

                {/* SEARCH */}

                <div className="col-lg-5">

                  <label className="form-label fw-semibold">
                    ค้นหาครุภัณฑ์
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-white">
                      <i className="bi bi-search" />
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหาชื่อ รหัส หรือสถานที่..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                {/* CATEGORY */}

                <div className="col-lg-3">

                  <label className="form-label fw-semibold">
                    ประเภท
                  </label>

                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                  >
                    {categories.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>

                </div>

                {/* STATUS */}

                <div className="col-lg-3">

                  <label className="form-label fw-semibold">
                    สถานะ
                  </label>

                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                  >

                    <option value="ทั้งหมด">
                      ทั้งหมด
                    </option>

                    <option value="available">
                      พร้อมใช้งาน
                    </option>

                    <option value="borrowed">
                      ถูกยืม
                    </option>

                    <option value="maintenance">
                      ซ่อมบำรุง
                    </option>

                    <option value="inactive">
                      ไม่พร้อมใช้งาน
                    </option>

                  </select>

                </div>

                {/* RESET */}

                <div className="col-lg-1 d-flex align-items-end">

                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={
                      resetFilter
                    }
                    title="ล้างตัวกรอง"
                  >
                    <i className="bi bi-arrow-clockwise" />
                  </button>

                </div>

              </div>

            </div>
          </div>

          {/* ============================================
              EQUIPMENT LIST
          ============================================ */}

          {filteredItems.length ===
          0 ? (
            <div className="card border-0 shadow-sm">

              <div className="card-body text-center py-5">

                <i className="bi bi-search display-4 text-secondary" />

                <h5 className="mt-3">
                  ไม่พบครุภัณฑ์
                </h5>

                <p className="text-secondary mb-3">
                  ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                </p>

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={
                    resetFilter
                  }
                >
                  ล้างตัวกรอง
                </button>

              </div>

            </div>
          ) : (
            <div className="row g-4">

              {filteredItems.map(
                (item) => (
                  <div
                    className="col-md-6 col-xl-4"
                    key={item.id}
                  >
                    <EquipmentCard
                      item={item}
                      onClick={() =>
                        setSelectedItem(
                          item
                        )
                      }
                    />
                  </div>
                )
              )}

            </div>
          )}

        </div>
      </main>

      {/* ================================================
          DETAIL MODAL
      ================================================= */}

      {selectedItem && (
        <EquipmentModal
          item={selectedItem}
          onClose={() =>
            setSelectedItem(null)
          }
        />
      )}

      {/* ================================================
          CSS
      ================================================= */}

      <style jsx global>{`

        .equipment-main {
          margin-left: 270px;
          min-height: 100vh;
          background: #f7f7fb;
        }

        .equipment-stat-card {
          background: #ffffff;
          border: 0;
          border-radius: 16px;
          padding: 20px;
          height: 100%;
          box-shadow:
            0 4px 18px
            rgba(0, 0, 0, 0.05);
        }

        .equipment-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0eaff;
          color: #6f42c1;
          font-size: 22px;
        }

        .equipment-card {
          height: 100%;
          border: 0;
          border-radius: 18px;
          overflow: hidden;
          background: #ffffff;
          box-shadow:
            0 4px 18px
            rgba(0, 0, 0, 0.06);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
          cursor: pointer;
        }

        .equipment-card:hover {
          transform:
            translateY(-4px);

          box-shadow:
            0 10px 28px
            rgba(0, 0, 0, 0.1);
        }

        .equipment-image {
          height: 190px;
          background: #f3f1f8;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .equipment-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .equipment-placeholder {
          font-size: 55px;
          color: #6f42c1;
        }

        .equipment-card-body {
          padding: 20px;
        }

        .equipment-code {
          font-size: 13px;
          color: #6f42c1;
          font-weight: 600;
        }

        .equipment-name {
          font-size: 18px;
          font-weight: 700;
          margin:
            5px 0 10px;
        }

        .equipment-description {
          color: #6c757d;
          font-size: 14px;
          min-height: 42px;
        }

        .equipment-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #555;
          margin-top: 8px;
        }

        .equipment-info i {
          color: #6f42c1;
        }

        .equipment-status {
          padding:
            6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        @media (max-width: 991.98px) {

          .equipment-main {
            margin-left: 0;
            padding-top: 64px;
          }

        }

      `}</style>
    </>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) {
  return (
    <div className="equipment-stat-card">

      <div className="d-flex align-items-center gap-3">

        <div className="equipment-icon">
          <i
            className={`bi ${icon}`}
          />
        </div>

        <div>

          <div className="text-secondary small">
            {title}
          </div>

          <div className="fs-4 fw-bold">
            {value.toLocaleString()}
          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   EQUIPMENT CARD
========================================================= */

function EquipmentCard({
  item,
  onClick,
}: {
  item: EquipmentItem;
  onClick: () => void;
}) {
  return (
    <div
      className="equipment-card"
      onClick={onClick}
    >

      {/* IMAGE */}

      <div className="equipment-image">

        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
          />
        ) : (
          <i
            className={`bi ${getEquipmentIcon(
              item.category
            )} equipment-placeholder`}
          />
        )}

      </div>

      {/* BODY */}

      <div className="equipment-card-body">

        <div className="d-flex justify-content-between align-items-start gap-2">

          <div className="equipment-code">
            {item.equipmentCode}
          </div>

          <StatusBadge
            status={item.status}
          />

        </div>

        <div className="equipment-name">
          {item.name}
        </div>

        <div className="equipment-description">
          {item.description}
        </div>

        <div className="equipment-info">

          <i className="bi bi-tag" />

          <span>
            {item.category}
          </span>

        </div>

        <div className="equipment-info">

          <i className="bi bi-geo-alt" />

          <span>
            {item.location}
          </span>

        </div>

        <div className="equipment-info">

          <i className="bi bi-box" />

          <span>
            คงเหลือ{" "}
            <strong>
              {item.availableQuantity}
            </strong>{" "}
            / {item.quantity}
          </span>

        </div>

        <button
          type="button"
          className="btn btn-outline-primary w-100 mt-3"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <i className="bi bi-eye me-2" />
          ดูรายละเอียด
        </button>

      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: EquipmentStatus;
}) {
  const config: Record<
    EquipmentStatus,
    {
      text: string;
      className: string;
    }
  > = {
    available: {
      text: "พร้อมใช้งาน",
      className:
        "bg-success-subtle text-success",
    },

    borrowed: {
      text: "ถูกยืม",
      className:
        "bg-warning-subtle text-warning-emphasis",
    },

    maintenance: {
      text: "ซ่อมบำรุง",
      className:
        "bg-danger-subtle text-danger",
    },

    inactive: {
      text: "ไม่พร้อมใช้งาน",
      className:
        "bg-secondary-subtle text-secondary",
    },
  };

  const current =
    config[status];

  return (
    <span
      className={`equipment-status ${current.className}`}
    >
      {current.text}
    </span>
  );
}

/* =========================================================
   MODAL
========================================================= */

function EquipmentModal({
  item,
  onClose,
}: {
  item: EquipmentItem;
  onClose: () => void;
}) {
  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{
        backgroundColor:
          "rgba(0,0,0,0.55)",
        zIndex: 2000,
      }}
      onClick={onClose}
    >

      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

          {/* HEADER */}

          <div className="modal-header">

            <h5 className="modal-title fw-bold">
              รายละเอียดครุภัณฑ์
            </h5>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            />

          </div>

          {/* BODY */}

          <div className="modal-body">

            <div className="row g-4">

              <div className="col-md-5">

                <div className="equipment-image rounded-4">

                  {item.imageUrl ? (
                    <img
                      src={
                        item.imageUrl
                      }
                      alt={
                        item.name
                      }
                    />
                  ) : (
                    <i
                      className={`bi ${getEquipmentIcon(
                        item.category
                      )} equipment-placeholder`}
                    />
                  )}

                </div>

              </div>

              <div className="col-md-7">

                <div className="equipment-code mb-2">
                  {
                    item.equipmentCode
                  }
                </div>

                <h4 className="fw-bold mb-3">
                  {item.name}
                </h4>

                <StatusBadge
                  status={
                    item.status
                  }
                />

                <hr />

                <InfoRow
                  icon="bi-tag"
                  label="ประเภท"
                  value={
                    item.category
                  }
                />

                <InfoRow
                  icon="bi-geo-alt"
                  label="สถานที่"
                  value={
                    item.location
                  }
                />

                <InfoRow
                  icon="bi-box"
                  label="จำนวนทั้งหมด"
                  value={`${item.quantity} รายการ`}
                />

                <InfoRow
                  icon="bi-check-circle"
                  label="จำนวนที่พร้อมใช้งาน"
                  value={`${item.availableQuantity} รายการ`}
                />

                <div className="mt-3">

                  <div className="fw-semibold mb-1">
                    รายละเอียด
                  </div>

                  <div className="text-secondary">
                    {
                      item.description
                    }
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="modal-footer">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              ปิด
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="d-flex gap-3 mb-3">

      <i
        className={`bi ${icon} text-primary fs-5`}
      />

      <div>

        <div className="small text-secondary">
          {label}
        </div>

        <div className="fw-semibold">
          {value}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   EQUIPMENT ICON
========================================================= */

function getEquipmentIcon(
  category: string
) {
  const text =
    category.toLowerCase();

  if (
    text.includes("computer") ||
    text.includes("คอม") ||
    text.includes("โน้ตบุ๊ก") ||
    text.includes("laptop")
  ) {
    return "bi-laptop";
  }

  if (
    text.includes("projector") ||
    text.includes("โปรเจค")
  ) {
    return "bi-projector";
  }

  if (
    text.includes("camera") ||
    text.includes("กล้อง")
  ) {
    return "bi-camera";
  }

  if (
    text.includes("audio") ||
    text.includes("เสียง") ||
    text.includes("ลำโพง")
  ) {
    return "bi-speaker";
  }

  if (
    text.includes("network") ||
    text.includes("เครือข่าย")
  ) {
    return "bi-router";
  }

  return "bi-box-seam";
}