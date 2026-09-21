"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import AdminNavbar from "@/app/components/AdminNavbar";
import { PageHeader, Panel, Pill } from "@/app/components/ui";

type EquipmentOption = {
  id: number;
  equipment_code: string;
  name: string;
  category_name: string | null;
  location: string | null;
  status: string;
};

// QR ของครุภัณฑ์ = รหัสครุภัณฑ์ (equipment_code)
// หน้า /scan อ่านค่านี้แล้วค้นหาครุภัณฑ์จากฐานข้อมูล
export default function AdminQrPage() {
  const [items, setItems] = useState<EquipmentOption[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/equipment", { cache: "no-store" })
      .then((response) => response.json())
      .then((body) => {
        if (!body.success) {
          throw new Error(body.message);
        }

        const rows = body.data as EquipmentOption[];

        setItems(rows);
        setSelectedId(rows[0]?.id ?? null);
      })
      .catch((err) =>
        setError(
          err instanceof Error && err.message
            ? err.message
            : "ไม่สามารถโหลดรายการครุภัณฑ์ได้"
        )
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const value = keyword.trim().toLowerCase();

    if (!value) return items;

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(value) ||
        item.equipment_code.toLowerCase().includes(value)
    );
  }, [items, keyword]);

  const selected = items.find((item) => item.id === selectedId);

  return (
    <main className="min-vh-100">
      <AdminNavbar />

      <section className="admin-page-content">
        <div className="ui-page p-0">
          <PageHeader
            eyebrow="QR Code ครุภัณฑ์"
            title="QR Code สำหรับสแกนยืม–คืน"
            description="เลือกครุภัณฑ์เพื่อแสดง QR Code แล้วพิมพ์ไปติดบนตัวครุภัณฑ์ ผู้ใช้สแกนด้วยหน้า “สแกน QR ยืม–คืน” ได้ทันที"
          />

          {error && (
            <div className="alert alert-danger mb-0">{error}</div>
          )}

          <div className="row g-3">
            {/* ================= LIST ================= */}
            <div className="col-lg-5 qr-no-print">
              <Panel
                flush
                title="รายการครุภัณฑ์"
                description={
                  loading
                    ? "กำลังโหลด..."
                    : `${filtered.length} รายการ`
                }
              >
                <div className="p-3 border-bottom">
                  <input
                    className="form-control"
                    placeholder="ค้นหาชื่อหรือรหัสครุภัณฑ์..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>

                <div className="qr-list">
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`qr-list-item ${
                        item.id === selectedId ? "active" : ""
                      }`}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <span className="fw-semibold">{item.name}</span>
                      <small>{item.equipment_code}</small>
                    </button>
                  ))}

                  {!loading && filtered.length === 0 && (
                    <div className="text-center text-secondary small py-4">
                      ไม่พบครุภัณฑ์
                    </div>
                  )}
                </div>
              </Panel>
            </div>

            {/* ================= QR ================= */}
            <div className="col-lg-7">
              <Panel
                title="QR Code"
                action={
                  selected && (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary qr-no-print"
                      onClick={() => window.print()}
                    >
                      <i className="bi bi-printer me-2" />
                      พิมพ์
                    </button>
                  )
                }
              >
                {selected ? (
                  <div className="qr-label">
                    <QRCodeCanvas
                      value={selected.equipment_code}
                      size={220}
                      marginSize={2}
                    />

                    <p className="qr-label-name">{selected.name}</p>
                    <p className="qr-label-code">
                      {selected.equipment_code}
                    </p>

                    <div className="d-flex gap-2 justify-content-center flex-wrap qr-no-print">
                      {selected.category_name && (
                        <Pill tone="neutral">
                          {selected.category_name}
                        </Pill>
                      )}
                      {selected.location && (
                        <Pill tone="neutral">
                          <i className="bi bi-geo-alt" />
                          {selected.location}
                        </Pill>
                      )}
                    </div>

                    <p className="qr-label-footer">
                      ระบบยืม–คืนครุภัณฑ์ คณะสังคมศาสตร์ มช.
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-secondary small py-5">
                    {loading ? "กำลังโหลด..." : "เลือกครุภัณฑ์จากรายการ"}
                  </div>
                )}
              </Panel>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .qr-list {
          max-height: 520px;
          overflow-y: auto;
        }

        .qr-list-item {
          display: flex;
          flex-direction: column;
          width: 100%;
          padding: 10px 20px;
          border: none;
          border-bottom: 1px solid #f0f0f0;
          background: #ffffff;
          text-align: left;
          font-size: 14px;
        }

        .qr-list-item small {
          color: var(--shell-muted);
        }

        .qr-list-item:hover {
          background: #fafafa;
        }

        .qr-list-item.active {
          background: var(--primary-light);
          box-shadow: inset 3px 0 0 var(--primary);
        }

        .qr-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 16px 0;
          text-align: center;
        }

        .qr-label canvas {
          border: 1px solid var(--shell-border);
          border-radius: 8px;
        }

        .qr-label-name {
          margin: 8px 0 0;
          font-size: 18px;
          font-weight: 700;
          color: #171717;
        }

        .qr-label-code {
          margin: 0;
          font-family: var(--font-geist-mono), monospace;
          font-size: 14px;
          color: #404040;
        }

        .qr-label-footer {
          margin: 8px 0 0;
          font-size: 11px;
          color: var(--shell-muted);
        }

        /* พิมพ์เฉพาะป้าย QR */
        @media print {
          .app-sidebar,
          .app-header,
          .ui-page-header,
          .qr-no-print {
            display: none !important;
          }

          .admin-page-content {
            margin: 0 !important;
            padding: 0 !important;
          }

          .ui-panel {
            border: none !important;
            box-shadow: none !important;
          }

          .ui-panel-head {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
