"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Html5Qrcode } from "html5-qrcode";

import UserNavbar from "@/app/components/UserNavbar";
import { PageHeader, Panel, Pill } from "@/app/components/ui";
import {
  PhotoPicker,
  photoFailureText,
  releasePhotos,
  uploadPhotos,
  type PickedPhoto,
  type UploadProgress,
} from "@/app/components/BorrowingPhotos";

type ScanAction = "borrow" | "return" | "unavailable";

type ScanResult = {
  action: ScanAction;
  reason: string;
  maxBorrowDays: number;
  equipment: {
    id: number;
    code: string;
    name: string;
    category: string | null;
    location: string | null;
    imageUrl: string | null;
    quantity: number;
    availableQuantity: number;
    status: string;
  };
  borrowing: {
    id: number;
    borrowDate: string;
    dueDate: string;
  } | null;
};

type Phase =
  | "idle"
  | "scanning"
  | "loading"
  | "result"
  | "submitting"
  | "done";

const READER_ID = "qr-reader";
const DEFAULT_BORROW_DAYS = 7;

/* =======================================================
   DATE HELPERS (ยึดวันตามเครื่องผู้ใช้)
======================================================= */

function toInputDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return toInputDate(date);
}

function formatThaiDate(value: string | Date) {
  return new Date(value).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ScanClient() {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [dueDate, setDueDate] = useState(
    addDays(DEFAULT_BORROW_DAYS)
  );
  const [purpose, setPurpose] = useState("");
  const [doneMessage, setDoneMessage] = useState("");
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [uploadProgress, setUploadProgress] =
    useState<UploadProgress | null>(null);
  const [photoWarning, setPhotoWarning] = useState("");

  // ปิดกล้องเมื่อออกจากหน้า
  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner?.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, []);

  /* =====================================================
     CAMERA
  ===================================================== */

  const stopCamera = async () => {
    const scanner = scannerRef.current;

    if (scanner?.isScanning) {
      try {
        await scanner.stop();
      } catch {
        // กล้องปิดไปแล้ว
      }
    }
  };

  const startCamera = async () => {
    setError("");
    setResult(null);

    if (!window.isSecureContext) {
      setError(
        "เบราว์เซอร์อนุญาตให้ใช้กล้องเฉพาะเว็บที่เป็น https หรือ localhost เท่านั้น — ใช้ช่องกรอกรหัสด้านล่างแทนได้"
      );
      return;
    }

    setPhase("scanning");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(READER_ID);
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
        },
        (decodedText) => {
          // หยุดกล้องทันทีที่อ่านได้ แล้วค้นหาครุภัณฑ์
          stopCamera().then(() => lookup(decodedText));
        },
        () => {
          // ยังอ่านไม่เจอในเฟรมนี้ — ไม่ต้องทำอะไร
        }
      );
    } catch (err) {
      console.error("CAMERA ERROR:", err);

      setPhase("idle");
      setError(
        "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้กล้องในเบราว์เซอร์ หรือกรอกรหัสครุภัณฑ์แทน"
      );
    }
  };

  /* =====================================================
     API
  ===================================================== */

  const lookup = async (code: string) => {
    const value = code.trim();

    if (!value) return;

    setPhase("loading");
    setError("");

    try {
      const response = await fetch(
        `/api/scan?code=${encodeURIComponent(value)}`,
        { cache: "no-store" }
      );

      const body = await response.json();

      if (!response.ok || !body.success) {
        throw new Error(
          body.message || "ไม่สามารถค้นหาครุภัณฑ์ได้"
        );
      }

      setResult(body.data);
      setDueDate(addDays(DEFAULT_BORROW_DAYS));
      setPurpose("");
      releasePhotos(photos);
      setPhotos([]);
      setPhotoWarning("");
      setPhase("result");
    } catch (err) {
      setPhase("idle");
      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถค้นหาครุภัณฑ์ได้"
      );
    }
  };

  // อัปโหลดรูปหลังบันทึกยืม/คืนสำเร็จ — ถ้าล้มเหลวยังถือว่าทำรายการสำเร็จ
  const attachPhotos = async (
    borrowingId: number,
    kind: "borrow" | "return"
  ) => {
    if (!photos.length) return;

    if (!Number.isInteger(borrowingId) || borrowingId <= 0) {
      setPhotoWarning(
        "บันทึกรายการสำเร็จ แต่แนบรูปไม่สำเร็จ (ไม่พบรหัสรายการยืม)"
      );
      return;
    }

    const summary = await uploadPhotos(
      borrowingId,
      kind,
      photos,
      setUploadProgress
    );

    setUploadProgress(null);

    const failure = photoFailureText(summary);

    setPhotoWarning(failure ? `บันทึกรายการสำเร็จ ${failure}` : "");

    if (!summary.failed) {
      releasePhotos(photos);
      setPhotos([]);
    }
  };

  const confirmBorrow = async () => {
    if (!result) return;

    setPhase("submitting");
    setError("");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: result.equipment.code,
          dueDate,
          purpose,
        }),
      });

      const body = await response.json();

      if (!response.ok || !body.success) {
        throw new Error(
          body.message || "ไม่สามารถยืมครุภัณฑ์ได้"
        );
      }

      const borrowingId = Number(body.data?.borrowingId);

      await attachPhotos(borrowingId, "borrow");

      setDoneMessage(
        `ยืม ${result.equipment.name} สำเร็จ กำหนดคืน ${formatThaiDate(
          `${dueDate}T00:00:00`
        )}`
      );
      setPhase("done");
    } catch (err) {
      setPhase("result");
      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถยืมครุภัณฑ์ได้"
      );
    }
  };

  const confirmReturn = async () => {
    if (!result?.borrowing) return;

    setPhase("submitting");
    setError("");

    try {
      const response = await fetch(
        `/api/borrowing/${result.borrowing.id}/return`,
        { method: "POST" }
      );

      const body = await response.json();

      if (!response.ok || !body.success) {
        throw new Error(
          body.message || "ไม่สามารถคืนครุภัณฑ์ได้"
        );
      }

      await attachPhotos(result.borrowing.id, "return");

      setDoneMessage(`คืน ${result.equipment.name} สำเร็จ`);
      setPhase("done");
    } catch (err) {
      setPhase("result");
      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถคืนครุภัณฑ์ได้"
      );
    }
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setError("");
    setManualCode("");
    setDoneMessage("");
    releasePhotos(photos);
    setPhotos([]);
    setPhotoWarning("");
    setUploadProgress(null);
  };

  /* =====================================================
     UI
  ===================================================== */

  const busy = phase === "loading" || phase === "submitting";
  const equipment = result?.equipment;
  const overdue =
    result?.borrowing &&
    new Date(result.borrowing.dueDate) < new Date();

  return (
    <>
      <UserNavbar />

      <main className="scan-main">
        <div className="ui-page scan-page">
          <PageHeader
            eyebrow="ยืม–คืนด้วย QR Code"
            title="สแกนครุภัณฑ์"
            description="สแกน QR Code ที่ติดอยู่บนครุภัณฑ์ ระบบจะตรวจสอบให้อัตโนมัติว่าเป็นการยืมหรือการคืน"
          />

          {error && (
            <div className="scan-alert" role="alert">
              <i className="bi bi-exclamation-circle" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= SCANNER ================= */}
          {(phase === "idle" ||
            phase === "scanning" ||
            phase === "loading") && (
            <Panel
              title="กล้องสแกน"
              description="หันกล้องไปที่ QR Code ให้อยู่ในกรอบ"
            >
              <div
                className={`scan-camera ${
                  phase === "scanning" ? "active" : ""
                }`}
              >
                <div id={READER_ID} />

                {phase !== "scanning" && (
                  <div className="scan-camera-placeholder">
                    {phase === "loading" ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        <span>กำลังค้นหาครุภัณฑ์...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-qr-code-scan" />
                        <span>กล้องยังไม่เปิด</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {phase === "scanning" ? (
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mt-3"
                  onClick={() => stopCamera().then(reset)}
                >
                  ปิดกล้อง
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary w-100 mt-3"
                  onClick={startCamera}
                  disabled={busy}
                >
                  <i className="bi bi-camera me-2" />
                  เปิดกล้องเพื่อสแกน
                </button>
              )}

              <form
                className="scan-manual"
                onSubmit={(e) => {
                  e.preventDefault();
                  stopCamera().then(() => lookup(manualCode));
                }}
              >
                <label
                  htmlFor="manual-code"
                  className="scan-manual-label"
                >
                  หรือกรอกรหัสครุภัณฑ์
                </label>

                <div className="d-flex gap-2">
                  <input
                    id="manual-code"
                    className="form-control"
                    placeholder="เช่น SOC-CAM-001"
                    value={manualCode}
                    onChange={(e) =>
                      setManualCode(e.target.value)
                    }
                    disabled={busy}
                  />

                  <button
                    type="submit"
                    className="btn btn-outline-secondary text-nowrap"
                    disabled={busy || !manualCode.trim()}
                  >
                    ค้นหา
                  </button>
                </div>
              </form>
            </Panel>
          )}

          {/* ================= RESULT ================= */}
          {equipment &&
            (phase === "result" || phase === "submitting") && (
              <Panel
                title="ข้อมูลครุภัณฑ์"
                action={
                  result.action === "borrow" ? (
                    <Pill tone="emerald">พร้อมให้ยืม</Pill>
                  ) : result.action === "return" ? (
                    <Pill tone={overdue ? "rose" : "blue"}>
                      {overdue ? "เกินกำหนดคืน" : "คุณกำลังยืมอยู่"}
                    </Pill>
                  ) : (
                    <Pill tone="neutral">ไม่พร้อมให้ยืม</Pill>
                  )
                }
              >
                <div className="scan-equipment">
                  {equipment.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={equipment.imageUrl}
                      alt={equipment.name}
                      className="scan-equipment-image"
                    />
                  ) : (
                    <div className="scan-equipment-icon tone-purple">
                      <i className="bi bi-box-seam" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="scan-equipment-name">
                      {equipment.name}
                    </p>
                    <p className="scan-equipment-meta">
                      {equipment.code}
                      {equipment.category &&
                        ` · ${equipment.category}`}
                    </p>
                  </div>
                </div>

                <dl className="scan-details">
                  <div>
                    <dt>สถานที่เก็บ</dt>
                    <dd>{equipment.location || "-"}</dd>
                  </div>

                  <div>
                    <dt>คงเหลือพร้อมยืม</dt>
                    <dd>
                      {equipment.availableQuantity} /{" "}
                      {equipment.quantity}
                    </dd>
                  </div>

                  {result.borrowing && (
                    <>
                      <div>
                        <dt>วันที่ยืม</dt>
                        <dd>
                          {formatThaiDate(
                            result.borrowing.borrowDate
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt>กำหนดคืน</dt>
                        <dd className={overdue ? "text-danger" : ""}>
                          {formatThaiDate(
                            result.borrowing.dueDate
                          )}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>

                {/* ---------- BORROW ---------- */}
                {result.action === "borrow" && (
                  <div className="scan-form">
                    <div>
                      <label
                        htmlFor="due-date"
                        className="form-label"
                      >
                        กำหนดคืน
                      </label>
                      <input
                        id="due-date"
                        type="date"
                        className="form-control"
                        value={dueDate}
                        min={addDays(0)}
                        max={addDays(result.maxBorrowDays)}
                        onChange={(e) =>
                          setDueDate(e.target.value)
                        }
                        disabled={busy}
                      />
                      <small className="text-secondary">
                        ยืมได้สูงสุด {result.maxBorrowDays} วัน
                      </small>
                    </div>

                    <div>
                      <label
                        htmlFor="purpose"
                        className="form-label"
                      >
                        วัตถุประสงค์ (ไม่บังคับ)
                      </label>
                      <input
                        id="purpose"
                        className="form-control"
                        placeholder="เช่น ใช้ถ่ายภาพกิจกรรมคณะ"
                        value={purpose}
                        onChange={(e) =>
                          setPurpose(e.target.value)
                        }
                        disabled={busy}
                      />
                    </div>

                    <PhotoPicker
                      value={photos}
                      onChange={setPhotos}
                      disabled={busy}
                      progress={uploadProgress}
                    />

                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={confirmBorrow}
                      disabled={busy || !dueDate}
                    >
                      {uploadProgress
                        ? "กำลังอัปโหลดรูป..."
                        : phase === "submitting"
                          ? "กำลังบันทึก..."
                          : "ยืนยันการยืม"}
                    </button>
                  </div>
                )}

                {/* ---------- RETURN ---------- */}
                {result.action === "return" && (
                  <div className="scan-form">
                    <PhotoPicker
                      value={photos}
                      onChange={setPhotos}
                      disabled={busy}
                      progress={uploadProgress}
                    />

                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={confirmReturn}
                      disabled={busy}
                    >
                      {uploadProgress
                        ? "กำลังอัปโหลดรูป..."
                        : phase === "submitting"
                          ? "กำลังบันทึก..."
                          : "ยืนยันการคืน"}
                    </button>
                  </div>
                )}

                {/* ---------- UNAVAILABLE ---------- */}
                {result.action === "unavailable" && (
                  <p className="scan-note">{result.reason}</p>
                )}

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mt-2"
                  onClick={reset}
                  disabled={busy}
                >
                  ยกเลิก / สแกนชิ้นอื่น
                </button>
              </Panel>
            )}

          {/* ================= DONE ================= */}
          {phase === "done" && (
            <Panel>
              <div className="scan-done">
                <div className="scan-done-icon tone-emerald">
                  <i className="bi bi-check-lg" />
                </div>

                <p className="scan-done-title">บันทึกสำเร็จ</p>
                <p className="scan-done-text">{doneMessage}</p>
                <p className="scan-done-text">
                  สถานะครุภัณฑ์ถูกอัปเดตในระบบแล้ว
                </p>

                {photoWarning && (
                  <div className="scan-alert scan-alert-warn mt-2 w-100 text-start">
                    <i className="bi bi-image" />
                    <span>{photoWarning}</span>
                  </div>
                )}

                <div className="d-flex flex-column flex-sm-row gap-2 w-100 mt-2">
                  <button
                    type="button"
                    className="btn btn-primary flex-fill"
                    onClick={reset}
                  >
                    สแกนชิ้นถัดไป
                  </button>

                  <Link
                    href="/borrowing"
                    className="btn btn-outline-secondary flex-fill"
                  >
                    ดูรายการยืมของฉัน
                  </Link>
                </div>
              </div>
            </Panel>
          )}
        </div>
      </main>

      <style jsx global>{`
        .scan-main {
          margin-left: 270px;
          min-height: 100vh;
          padding-top: var(--app-header-height);
          background: var(--shell-bg);
        }

        .scan-page {
          max-width: 560px;
        }

        .scan-alert {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px 14px;
          border: 1px solid #fecdd3;
          border-radius: 12px;
          background: #fff1f2;
          color: #9f1239;
          font-size: 14px;
        }

        .scan-alert-warn {
          border-color: #fde68a;
          background: #fffbeb;
          color: #92400e;
        }

        .scan-camera {
          position: relative;
          overflow: hidden;
          min-height: 280px;
          border: 1px dashed #d4d4d4;
          border-radius: 12px;
          background: #fafafa;
        }

        .scan-camera.active {
          border-style: solid;
          background: #000;
        }

        .scan-camera #${READER_ID} {
          width: 100%;
          border: none !important;
        }

        .scan-camera #${READER_ID} video {
          display: block;
          width: 100% !important;
          border-radius: 12px;
        }

        .scan-camera-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--shell-muted);
          font-size: 14px;
        }

        .scan-camera-placeholder .bi {
          font-size: 36px;
        }

        .scan-manual {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--shell-border);
        }

        .scan-manual-label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--shell-muted);
        }

        .scan-equipment {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .scan-equipment-icon,
        .scan-done-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 20px;
        }

        .scan-equipment-image {
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          border: 1px solid var(--shell-border);
          border-radius: 10px;
          object-fit: cover;
        }

        .scan-equipment-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #171717;
        }

        .scan-equipment-meta {
          margin: 2px 0 0;
          font-size: 12px;
          color: var(--shell-muted);
        }

        .scan-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 16px 0 0;
          padding: 16px 0;
          border-top: 1px solid var(--shell-border);
          border-bottom: 1px solid var(--shell-border);
        }

        .scan-details dt {
          font-size: 12px;
          font-weight: 500;
          color: var(--shell-muted);
        }

        .scan-details dd {
          margin: 2px 0 0;
          font-size: 14px;
          font-weight: 600;
          color: #171717;
        }

        .scan-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 16px;
        }

        .scan-form .form-label {
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 500;
        }

        .scan-note {
          margin: 16px 0 0;
          padding: 10px 12px;
          border-radius: 8px;
          background: #f5f5f5;
          color: #404040;
          font-size: 14px;
        }

        .scan-done {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-align: center;
        }

        .scan-done-icon {
          margin-bottom: 8px;
        }

        .scan-done-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #171717;
        }

        .scan-done-text {
          margin: 0;
          font-size: 14px;
          color: var(--shell-muted);
        }

        @media (max-width: 991.98px) {
          .scan-main {
            margin-left: 0;
          }

          .scan-page {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
}
