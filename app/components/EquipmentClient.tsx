"use client";

import { useEffect, useMemo, useState } from "react";
import UserNavbar from "@/app/components/UserNavbar";
import {
  PageHeader,
  Panel,
  Pill,
  StatCard,
  Toolbar,
  type Tone,
} from "@/app/components/ui";
import {
  listImages,
  type StoredImage,
} from "@/lib/client-images";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

/* =========================================================
   TYPES
========================================================= */

type EquipmentStatus =
  | "available"
  | "borrowed"
  | "maintenance"
  | "inactive"
  | "damaged"
  | "lost";

type HistoryStatus =
  | "รออนุมัติ"
  | "กำลังยืม"
  | "เกินกำหนด"
  | "คืนแล้ว"
  | "ยกเลิก";

type HistoryEntry = {
  id: number;
  borrower: string;
  borrowDate: string | null;
  dueDate: string | null;
  returnDate: string | null;
  rawStatus: string;
  status: HistoryStatus;
};

type HistoryState =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; history: HistoryEntry[] };

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
  categoryImageUrl: string | null;
};

// รูปที่แสดงบนการ์ด: รูปครุภัณฑ์ → รูปหมวดหมู่ → (ไม่มี = ใช้ไอคอน)
function coverImage(item: EquipmentItem) {
  return item.imageUrl || item.categoryImageUrl || null;
}

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

    // ไม่พร้อมใช้งาน = ปิดใช้งาน + ชำรุด + สูญหาย
    const inactive =
      items
        .filter(
          (item) =>
            item.status === "inactive" ||
            item.status === "damaged" ||
            item.status === "lost"
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
        <div className="ui-page">

          {/* ============================================
              HEADER
          ============================================ */}

          <PageHeader
            eyebrow="ครุภัณฑ์"
            title="ครุภัณฑ์"
            description="รายการครุภัณฑ์ทั้งหมดในระบบ"
            actions={
              <div className="equipment-count">
                พบ{" "}
                <strong className="text-dark">
                  {filteredItems.length}
                </strong>{" "}
                รายการ
              </div>
            }
          />

          {/* ============================================
              STATISTICS
          ============================================ */}

          <div className="row g-3">

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-box-seam"
                label="ครุภัณฑ์ทั้งหมด"
                value={statistics.total.toLocaleString()}
                tone="purple"
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-check-circle"
                label="พร้อมใช้งาน"
                value={statistics.available.toLocaleString()}
                tone="emerald"
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-arrow-up-right-circle"
                label="ถูกยืม"
                value={statistics.borrowed.toLocaleString()}
                tone="amber"
              />
            </div>

            <div className="col-6 col-xl">
              <StatCard
                icon="bi-tools"
                label="ซ่อมบำรุง"
                value={statistics.maintenance.toLocaleString()}
                tone="rose"
              />
            </div>

            <div className="col-12 col-xl">
              <StatCard
                icon="bi-x-circle"
                label="ไม่พร้อมใช้งาน"
                value={statistics.inactive.toLocaleString()}
                hint="รวมชำรุด / สูญหาย"
                tone="neutral"
              />
            </div>

          </div>

          {/* ============================================
              SEARCH / FILTER
          ============================================ */}

          <Toolbar>

            {/* SEARCH */}

            <div className="equipment-search">
              <i className="bi bi-search" />

              <input
                type="text"
                className="form-control"
                placeholder="ค้นหาชื่อ รหัส หรือสถานที่..."
                aria-label="ค้นหาครุภัณฑ์"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>

            {/* CATEGORY */}

            <select
              className="form-select equipment-filter"
              aria-label="ประเภท"
              title="ประเภท"
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
                    {item === "ทั้งหมด"
                      ? "ทุกประเภท"
                      : item}
                  </option>
                )
              )}
            </select>

            {/* STATUS */}

            <select
              className="form-select equipment-filter"
              aria-label="สถานะ"
              title="สถานะ"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
            >

              <option value="ทั้งหมด">
                ทุกสถานะ
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

              <option value="damaged">
                ชำรุด
              </option>

              <option value="lost">
                สูญหาย
              </option>

            </select>

            {/* RESET */}

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary equipment-reset"
              onClick={
                resetFilter
              }
              title="ล้างตัวกรอง"
            >
              <i className="bi bi-arrow-clockwise me-1" />
              ล้าง
            </button>

          </Toolbar>

          {/* ============================================
              EQUIPMENT LIST
          ============================================ */}

          {filteredItems.length ===
          0 ? (
            <Panel>

              <div className="text-center py-5">

                <div className="equipment-empty-icon mx-auto mb-3">
                  <i className="bi bi-search" />
                </div>

                <p className="fw-semibold mb-1">
                  ไม่พบครุภัณฑ์
                </p>

                <p className="text-secondary small mb-3">
                  ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                </p>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary equipment-reset"
                  onClick={
                    resetFilter
                  }
                >
                  ล้างตัวกรอง
                </button>

              </div>

            </Panel>
          ) : (
            <div className="row g-3">

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
          key={selectedItem.id}
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
          background: #fafafa;
        }

        .equipment-count {
          font-size: 14px;
          color: #737373;
        }

        .equipment-search {
          position: relative;
          flex: 1 1 260px;
          min-width: 200px;
        }

        .equipment-search i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #a3a3a3;
          font-size: 14px;
          pointer-events: none;
        }

        .equipment-search .form-control {
          padding-left: 34px;
        }

        .equipment-filter {
          width: auto;
          flex: 0 1 200px;
          min-width: 150px;
        }

        .equipment-reset {
          height: 36px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .equipment-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          color: #737373;
          font-size: 20px;
        }

        .equipment-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid #e4e4e4;
          border-radius: 12px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
          cursor: pointer;
        }

        .equipment-card:hover {
          border-color: #d4d4d4;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .equipment-image {
          height: 180px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .equipment-card .equipment-image {
          border-bottom: 1px solid #e4e4e4;
        }

        .equipment-modal-image {
          border: 1px solid #e4e4e4;
          border-radius: 12px;
        }

        .equipment-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .equipment-gallery-main {
          position: relative;
          height: 240px;
          background: #ffffff;
        }

        .equipment-gallery-main img {
          object-fit: contain;
        }

        .equipment-gallery-count {
          position: absolute;
          right: 8px;
          bottom: 8px;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(23, 23, 23, 0.7);
          color: #ffffff;
          font-size: 12px;
        }

        .equipment-gallery-thumbs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .equipment-gallery-thumb {
          width: 52px;
          height: 52px;
          padding: 0;
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          overflow: hidden;
          background: #fafafa;
          opacity: 0.7;
        }

        .equipment-gallery-thumb.active,
        .equipment-gallery-thumb:hover {
          border-color: #6f42c1;
          opacity: 1;
        }

        .equipment-gallery-thumb.active {
          box-shadow: 0 0 0 2px #e9e0ff;
        }

        .equipment-gallery-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .equipment-placeholder {
          font-size: 44px;
          color: #a3a3a3;
        }

        .equipment-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 16px;
        }

        .equipment-code {
          font-size: 12px;
          color: #6f42c1;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .equipment-name {
          font-size: 15px;
          font-weight: 600;
          color: #171717;
          margin: 4px 0 6px;
        }

        .equipment-description {
          color: #737373;
          font-size: 13px;
          min-height: 38px;
        }

        .equipment-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin: 12px 0 14px;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
        }

        .equipment-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #525252;
        }

        .equipment-info i {
          color: #a3a3a3;
        }

        .equipment-detail-btn {
          margin-top: auto;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #6f42c1;
          border-color: #d9ccf2;
        }

        .equipment-detail-btn:hover,
        .equipment-detail-btn:focus {
          background: #6f42c1;
          border-color: #6f42c1;
          color: #ffffff;
        }

        .equipment-modal-info-icon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          color: #525252;
          font-size: 14px;
        }

        .equipment-availability {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid transparent;
        }

        .equipment-availability > i {
          font-size: 22px;
        }

        .equipment-availability.tone-emerald {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #047857;
        }

        .equipment-availability.tone-amber {
          background: #fffbeb;
          border-color: #fde68a;
          color: #b45309;
        }

        .equipment-availability.tone-rose {
          background: #fff1f2;
          border-color: #fecdd3;
          color: #be123c;
        }

        .equipment-availability.tone-neutral {
          background: #f5f5f5;
          border-color: #e4e4e4;
          color: #404040;
        }

        .equipment-history {
          max-height: 320px;
          overflow-y: auto;
        }

        .equipment-history table {
          font-size: 13px;
        }

        .equipment-history th {
          font-size: 12px;
          font-weight: 600;
          color: #737373;
          white-space: nowrap;
          background: #fafafa;
          position: sticky;
          top: 0;
        }

        .equipment-history td {
          white-space: nowrap;
        }

        @media (max-width: 991.98px) {

          .equipment-main {
            margin-left: 0;
            padding-top: 64px;
          }

        }

        @media (max-width: 575.98px) {

          .equipment-filter {
            flex: 1 1 140px;
          }

        }

      `}</style>
    </>
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

        {coverImage(item) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage(item) as string}
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

        <div className="equipment-meta">

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

        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary equipment-detail-btn w-100"
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
      tone: Tone;
    }
  > = {
    available: {
      text: "พร้อมใช้งาน",
      tone: "emerald",
    },

    borrowed: {
      text: "ถูกยืม",
      tone: "amber",
    },

    maintenance: {
      text: "ซ่อมบำรุง",
      tone: "rose",
    },

    inactive: {
      text: "ไม่พร้อมใช้งาน",
      tone: "neutral",
    },

    damaged: {
      text: "ชำรุด",
      tone: "rose",
    },

    lost: {
      text: "สูญหาย",
      tone: "neutral",
    },
  };

  const current =
    config[status] ?? {
      text: status,
      tone: "neutral" as Tone,
    };

  return (
    <Pill tone={current.tone}>
      {current.text}
    </Pill>
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
  const [history, setHistory] =
    useState<HistoryState>({
      state: "loading",
    });

  // โหลดประวัติเมื่อเปิด modal (setState อยู่ใน promise callback เท่านั้น)
  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/equipment/${item.id}/history`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        const body = await res.json().catch(() => null);

        if (!res.ok || !body?.success) {
          setHistory({
            state: "error",
            message:
              body?.message ||
              "ไม่สามารถโหลดประวัติการยืม–คืนได้",
          });
          return;
        }

        setHistory({
          state: "ready",
          history: body.data.history as HistoryEntry[],
        });
      })
      .catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setHistory({
          state: "error",
          message:
            "ไม่สามารถโหลดประวัติการยืม–คืนได้",
        });
      });

    return () => controller.abort();
  }, [item.id]);

  const current = getAvailability(item);

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

        <div className="modal-content border-0 rounded-3 overflow-hidden">

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

                <EquipmentGallery item={item} />

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

                <div
                  className={`equipment-availability tone-${current.tone}`}
                >
                  <i className={`bi ${current.icon}`} />

                  <div className="flex-grow-1">
                    <div className="small opacity-75">
                      สถานะปัจจุบัน
                    </div>

                    <div className="fw-bold">
                      {current.text}
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="small opacity-75">
                      คงเหลือ
                    </div>

                    <div className="fw-bold">
                      {item.availableQuantity} / {item.quantity}
                    </div>
                  </div>
                </div>

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

            {/* HISTORY */}

            <Panel
              className="mt-4"
              title="ประวัติการยืม–คืน"
              description="ใครยืม เมื่อไร และกำหนดคืน (ล่าสุด 50 รายการ)"
              flush
            >
              <HistoryList history={history} />
            </Panel>

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
   GALLERY (รูปหลัก + รูปย่อที่คลิกได้)
========================================================= */

function EquipmentGallery({
  item,
}: {
  item: EquipmentItem;
}) {
  // null = กำลังโหลด
  const [images, setImages] =
    useState<StoredImage[] | null>(null);
  const [active, setActive] = useState(0);

  // setState อยู่ใน promise callback เท่านั้น
  useEffect(() => {
    let cancelled = false;

    listImages({
      ownerType: "equipment",
      ownerId: item.id,
    })
      .then((data) => {
        if (!cancelled) setImages(data);
      })
      .catch(() => {
        if (!cancelled) setImages([]);
      });

    return () => {
      cancelled = true;
    };
  }, [item.id]);

  const urls =
    images && images.length > 0
      ? images.map((image) => image.url)
      : [coverImage(item)].filter(
          (url): url is string => Boolean(url)
        );

  const index = Math.min(active, Math.max(0, urls.length - 1));
  const main = urls[index];

  return (
    <div>
      <div className="equipment-image equipment-modal-image equipment-gallery-main">
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={main}
            alt={item.name}
          />
        ) : (
          <i
            className={`bi ${getEquipmentIcon(
              item.category
            )} equipment-placeholder`}
          />
        )}

        {urls.length > 1 && (
          <span className="equipment-gallery-count">
            {index + 1} / {urls.length}
          </span>
        )}
      </div>

      {urls.length > 1 && (
        <div className="equipment-gallery-thumbs">
          {urls.map((url, i) => (
            <button
              key={url}
              type="button"
              className={`equipment-gallery-thumb ${
                i === index ? "active" : ""
              }`}
              onClick={() => setActive(i)}
              aria-label={`ดูรูปที่ ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}

      {images === null && (
        <div className="small text-secondary mt-2">
          <span className="spinner-border spinner-border-sm me-2" />
          กำลังโหลดรูปภาพ...
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CURRENT AVAILABILITY
========================================================= */

function getAvailability(item: EquipmentItem): {
  text: string;
  tone: Tone;
  icon: string;
} {
  switch (item.status) {
    case "maintenance":
      return { text: "อยู่ระหว่างซ่อมบำรุง", tone: "rose", icon: "bi-tools" };
    case "damaged":
      return { text: "ชำรุด – งดให้ยืม", tone: "rose", icon: "bi-exclamation-triangle" };
    case "lost":
      return { text: "สูญหาย – งดให้ยืม", tone: "neutral", icon: "bi-question-circle" };
    case "inactive":
      return { text: "ปิดการใช้งาน", tone: "neutral", icon: "bi-x-circle" };
  }

  if (item.availableQuantity <= 0) {
    return { text: "ถูกยืมครบแล้ว", tone: "amber", icon: "bi-hourglass-split" };
  }

  return { text: "พร้อมยืม", tone: "emerald", icon: "bi-check-circle" };
}

/* =========================================================
   HISTORY LIST
========================================================= */

const HISTORY_TONES: Record<HistoryStatus, Tone> = {
  กำลังยืม: "blue",
  เกินกำหนด: "rose",
  คืนแล้ว: "emerald",
  รออนุมัติ: "amber",
  ยกเลิก: "neutral",
};

function formatDateTime(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function HistoryList({
  history,
}: {
  history: HistoryState;
}) {
  if (history.state === "loading") {
    return (
      <div className="text-center text-secondary small py-4">
        <span className="spinner-border spinner-border-sm me-2" />
        กำลังโหลดประวัติ...
      </div>
    );
  }

  if (history.state === "error") {
    return (
      <div className="text-center text-danger small py-4">
        <i className="bi bi-exclamation-circle me-2" />
        {history.message}
      </div>
    );
  }

  if (history.history.length === 0) {
    return (
      <div className="text-center text-secondary small py-4">
        <i className="bi bi-clock-history me-2" />
        ยังไม่มีประวัติการยืม–คืน
      </div>
    );
  }

  return (
    <div className="table-responsive equipment-history">
      <table className="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th>ผู้ยืม</th>
            <th>วันเวลาที่ยืม</th>
            <th>กำหนดคืน</th>
            <th>วันที่คืน</th>
            <th>สถานะ</th>
          </tr>
        </thead>

        <tbody>
          {history.history.map((row) => (
            <tr key={row.id}>
              <td className="fw-semibold">
                {row.borrower}
              </td>
              <td>{formatDateTime(row.borrowDate)}</td>
              <td>{formatDateTime(row.dueDate)}</td>
              <td>{formatDateTime(row.returnDate)}</td>
              <td>
                <Pill tone={HISTORY_TONES[row.status] ?? "neutral"}>
                  {row.status}
                </Pill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    <div className="d-flex align-items-center gap-3 mb-2">

      <div className="equipment-modal-info-icon">
        <i
          className={`bi ${icon}`}
        />
      </div>

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