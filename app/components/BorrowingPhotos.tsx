"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Pill } from "@/app/components/ui";
import {
  ACCEPT_IMAGES,
  deleteImage,
  listImages,
  uploadImage,
  type BorrowingKind,
  type StoredImage,
} from "@/lib/client-images";

// =========================================================
// รูปหลักฐานสภาพครุภัณฑ์ตอนยืม / ตอนคืน (owner_type = borrowing)
//   PhotoPicker      — เลือก/ถ่ายรูปไว้ก่อน (ยังไม่อัปโหลด)
//   uploadPhotos     — อัปโหลดรูปที่เลือกไว้หลังบันทึกยืม/คืนสำเร็จ
//   BorrowingPhotos  — แสดงรูป 2 กลุ่ม + เพิ่ม/ลบรูป
// =========================================================

export const MAX_BORROWING_PHOTOS = 3;

const KIND_LABEL: Record<BorrowingKind, string> = {
  borrow: "รูปตอนยืม",
  return: "รูปตอนคืน",
};

export type PickedPhoto = {
  id: string;
  file: File;
  url: string;
};

let pickedSeq = 0;

// คืนหน่วยความจำของ preview (เรียกเมื่อไม่ใช้รูปที่เลือกไว้แล้ว)
export function releasePhotos(photos: PickedPhoto[]) {
  photos.forEach((photo) => URL.revokeObjectURL(photo.url));
}

export type UploadProgress = { done: number; total: number };

export type UploadSummary = {
  uploaded: number;
  failed: number;
  error: string;
};

// อัปโหลดทีละรูป — ไม่ throw (ให้ผู้เรียกแจ้งผลเองว่ารูปไหนไม่สำเร็จ)
export async function uploadPhotos(
  borrowingId: number,
  kind: BorrowingKind,
  photos: { file: File }[],
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadSummary> {
  const summary: UploadSummary = { uploaded: 0, failed: 0, error: "" };

  for (let i = 0; i < photos.length; i++) {
    onProgress?.({ done: i, total: photos.length });

    try {
      await uploadImage({
        file: photos[i].file,
        ownerType: "borrowing",
        ownerId: borrowingId,
        kind,
      });
      summary.uploaded++;
    } catch (err) {
      summary.failed++;
      summary.error =
        err instanceof Error ? err.message : "อัปโหลดรูปไม่สำเร็จ";
    }
  }

  onProgress?.({ done: photos.length, total: photos.length });

  return summary;
}

// ข้อความสรุปเมื่ออัปโหลดรูปไม่สำเร็จบางส่วน ("" = สำเร็จทั้งหมด)
export function photoFailureText(summary: UploadSummary) {
  if (!summary.failed) return "";

  return `แต่แนบรูปไม่สำเร็จ ${summary.failed} รูป (${summary.error}) — เพิ่มรูปภายหลังได้ที่หน้ารายละเอียดรายการ`;
}

/* =========================================================
   PhotoPicker
========================================================= */

export function PhotoPicker({
  value,
  onChange,
  max = MAX_BORROWING_PHOTOS,
  disabled = false,
  label = "ถ่ายรูป / แนบรูปสภาพครุภัณฑ์ (ไม่บังคับ, สูงสุด 3 รูป)",
  progress,
}: {
  value: PickedPhoto[];
  onChange: (photos: PickedPhoto[]) => void;
  max?: number;
  disabled?: boolean;
  label?: string;
  progress?: UploadProgress | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [warning, setWarning] = useState("");

  const addFiles = (list: FileList | null) => {
    const files = Array.from(list || []).filter((file) =>
      ACCEPT_IMAGES.split(",").includes(file.type)
    );

    const room = max - value.length;
    const accepted = files.slice(0, Math.max(0, room));

    setWarning(
      files.length < (list?.length || 0)
        ? "รองรับเฉพาะไฟล์ PNG, JPG หรือ WEBP"
        : files.length > accepted.length
          ? `แนบได้สูงสุด ${max} รูป`
          : ""
    );

    if (!accepted.length) return;

    onChange([
      ...value,
      ...accepted.map((file) => ({
        id: `p${++pickedSeq}`,
        file,
        url: URL.createObjectURL(file),
      })),
    ]);
  };

  const remove = (id: string) => {
    const target = value.find((photo) => photo.id === id);

    if (target) URL.revokeObjectURL(target.url);

    onChange(value.filter((photo) => photo.id !== id));
  };

  return (
    <div className="bp-picker">
      <div className="bp-picker-head">
        <span className="bp-picker-label">{label}</span>
        <span className="bp-picker-count">
          {value.length}/{max}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_IMAGES}
        capture="environment"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="bp-grid">
        {value.map((photo) => (
          <div key={photo.id} className="bp-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="รูปที่เลือก" />

            {!disabled && (
              <button
                type="button"
                className="bp-thumb-remove"
                aria-label="นำรูปออก"
                onClick={() => remove(photo.id)}
              >
                <i className="bi bi-x" />
              </button>
            )}
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            className="bp-add"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <i className="bi bi-camera" />
            <span>ถ่าย/เลือกรูป</span>
          </button>
        )}
      </div>

      {progress && progress.total > 0 && (
        <p className="bp-status">
          <span className="spinner-border spinner-border-sm me-2" />
          กำลังอัปโหลดรูป {Math.min(progress.done + 1, progress.total)}/
          {progress.total}...
        </p>
      )}

      {warning && <p className="bp-warning">{warning}</p>}

      <PhotoStyles />
    </div>
  );
}

/* =========================================================
   BorrowingPhotos — viewer (+ uploader / delete)
========================================================= */

type ListedImage = StoredImage & { canDelete?: boolean };

type Loaded = {
  key: string;
  images: ListedImage[];
  error: string;
};

export default function BorrowingPhotos({
  borrowingId,
  uploadKinds = [],
  allowDelete = false,
  title = "รูปภาพสภาพครุภัณฑ์",
  className = "",
}: {
  borrowingId: number;
  // kind ที่อนุญาตให้เพิ่มรูปในหน้านี้
  uploadKinds?: BorrowingKind[];
  allowDelete?: boolean;
  title?: string;
  className?: string;
}) {
  const [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [busyKind, setBusyKind] = useState<BorrowingKind | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [lightbox, setLightbox] = useState<ListedImage | null>(null);

  const inputRefs = {
    borrow: useRef<HTMLInputElement>(null),
    return: useRef<HTMLInputElement>(null),
  };

  const key = `${borrowingId}:${version}`;

  useEffect(() => {
    let cancelled = false;

    listImages({ ownerType: "borrowing", ownerId: borrowingId })
      .then((images) => {
        if (!cancelled) setLoaded({ key, images, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setLoaded({
            key,
            images: [],
            error:
              err instanceof Error ? err.message : "ไม่สามารถโหลดรูปภาพได้",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [borrowingId, key]);

  const current = loaded && loaded.key === key ? loaded : null;
  // ระหว่างโหลดใหม่ (หลังอัปโหลด/ลบ) ยังแสดงรูปชุดเดิมไว้ก่อน
  const images =
    current?.images ??
    (loaded?.key.startsWith(`${borrowingId}:`) ? loaded.images : null);

  const upload = async (kind: BorrowingKind, list: FileList | null) => {
    const existing = (images || []).filter((img) => img.kind === kind);
    const room = MAX_BORROWING_PHOTOS - existing.length;
    const files = Array.from(list || []).slice(0, Math.max(0, room));

    if (!files.length) {
      setMessage(`แนบ${KIND_LABEL[kind]}ได้สูงสุด ${MAX_BORROWING_PHOTOS} รูป`);
      return;
    }

    setMessage("");
    setBusyKind(kind);

    const summary = await uploadPhotos(
      borrowingId,
      kind,
      files.map((file) => ({ file })),
      setProgress
    );

    setBusyKind(null);
    setProgress(null);

    if (summary.failed) {
      setMessage(
        `อัปโหลดไม่สำเร็จ ${summary.failed} รูป: ${summary.error}`
      );
    } else if ((list?.length || 0) > files.length) {
      setMessage(`แนบได้สูงสุด ${MAX_BORROWING_PHOTOS} รูปต่อกลุ่ม`);
    }

    setVersion((v) => v + 1);
  };

  const remove = async (image: ListedImage) => {
    if (!window.confirm("ต้องการลบรูปนี้ใช่หรือไม่?")) return;

    setDeletingId(image.id);
    setMessage("");

    try {
      await deleteImage(image.id);
      setVersion((v) => v + 1);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "ลบรูปไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  };

  const kinds: BorrowingKind[] = ["borrow", "return"];

  return (
    <div className={`bp-viewer ${className}`}>
      <div className="bp-viewer-head">
        <strong>
          <i className="bi bi-images me-2" />
          {title}
        </strong>

        {!current && images && (
          <span className="spinner-border spinner-border-sm text-secondary" />
        )}
      </div>

      {!images ? (
        <p className="bp-status">
          <span className="spinner-border spinner-border-sm me-2" />
          กำลังโหลดรูปภาพ...
        </p>
      ) : current?.error ? (
        <p className="bp-warning">{current.error}</p>
      ) : (
        kinds.map((kind) => {
          const group = images.filter((img) => img.kind === kind);
          const canAdd =
            uploadKinds.includes(kind) &&
            group.length < MAX_BORROWING_PHOTOS;
          const busy = busyKind === kind;

          return (
            <div key={kind} className="bp-group">
              <div className="bp-group-head">
                <span>{KIND_LABEL[kind]}</span>
                <Pill tone={group.length ? "purple" : "neutral"}>
                  {group.length}/{MAX_BORROWING_PHOTOS}
                </Pill>
              </div>

              <input
                ref={inputRefs[kind]}
                type="file"
                accept={ACCEPT_IMAGES}
                capture="environment"
                multiple
                hidden
                onChange={(e) => {
                  const files = e.target.files;
                  upload(kind, files).finally(() => {
                    e.target.value = "";
                  });
                }}
              />

              <div className="bp-grid">
                {group.map((image) => (
                  <div key={image.id} className="bp-thumb">
                    <button
                      type="button"
                      className="bp-thumb-open"
                      onClick={() => setLightbox(image)}
                      aria-label="ดูรูปขนาดเต็ม"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={KIND_LABEL[kind]}
                        loading="lazy"
                      />
                    </button>

                    {allowDelete && image.canDelete !== false && (
                      <button
                        type="button"
                        className="bp-thumb-remove"
                        aria-label="ลบรูป"
                        disabled={deletingId === image.id}
                        onClick={() => remove(image)}
                      >
                        {deletingId === image.id ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <i className="bi bi-trash3" />
                        )}
                      </button>
                    )}
                  </div>
                ))}

                {canAdd && (
                  <button
                    type="button"
                    className="bp-add"
                    disabled={busyKind !== null}
                    onClick={() => inputRefs[kind].current?.click()}
                  >
                    {busy ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        <span>
                          {progress
                            ? `${Math.min(progress.done + 1, progress.total)}/${progress.total}`
                            : "..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-camera" />
                        <span>เพิ่มรูป</span>
                      </>
                    )}
                  </button>
                )}

                {!group.length && !canAdd && (
                  <p className="bp-empty">ไม่มีรูป</p>
                )}
              </div>
            </div>
          );
        })
      )}

      {message && <p className="bp-warning">{message}</p>}

      {lightbox &&
        createPortal(
        <div
          className="bp-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            e.stopPropagation();
            setLightbox(null);
          }}
        >
          <div className="bp-lightbox-bar">
            <span>
              {KIND_LABEL[lightbox.kind as BorrowingKind] || "รูปภาพ"} ·{" "}
              {new Date(lightbox.createdAt).toLocaleString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            <div className="d-flex gap-2">
              <a
                href={lightbox.url}
                target="_blank"
                rel="noreferrer"
                className="bp-lightbox-btn"
                onClick={(e) => e.stopPropagation()}
                aria-label="เปิดในแท็บใหม่"
              >
                <i className="bi bi-box-arrow-up-right" />
              </a>

              <button
                type="button"
                className="bp-lightbox-btn"
                aria-label="ปิด"
                onClick={() => setLightbox(null)}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt="รูปขนาดเต็ม"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
          document.body
        )}

      <PhotoStyles />
    </div>
  );
}

/* =========================================================
   styles (global, prefix bp-)
========================================================= */

function PhotoStyles() {
  return (
    <style jsx global>{`
      .bp-picker,
      .bp-viewer {
        display: flex;
        flex-direction: column;
        gap: 10px;
        text-align: left;
      }

      .bp-viewer {
        margin-top: 16px;
        padding: 14px;
        border: 1px solid var(--shell-border, #e4e4e4);
        border-radius: 12px;
        background: #fff;
      }

      .bp-viewer-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: #171717;
      }

      .bp-picker-head,
      .bp-group-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 13px;
        font-weight: 500;
        color: #404040;
      }

      .bp-picker-count {
        font-size: 12px;
        color: var(--shell-muted, #737373);
      }

      .bp-group + .bp-group {
        padding-top: 10px;
        border-top: 1px dashed var(--shell-border, #e4e4e4);
      }

      .bp-group-head {
        margin-bottom: 8px;
      }

      .bp-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .bp-thumb {
        position: relative;
        width: 76px;
        height: 76px;
        flex-shrink: 0;
        overflow: hidden;
        border: 1px solid var(--shell-border, #e4e4e4);
        border-radius: 10px;
        background: #f5f5f5;
      }

      .bp-thumb img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .bp-thumb-open {
        width: 100%;
        height: 100%;
        padding: 0;
        border: none;
        background: none;
        cursor: zoom-in;
      }

      .bp-thumb-remove {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        border-radius: 999px;
        background: rgba(23, 23, 23, 0.72);
        color: #fff;
        font-size: 13px;
      }

      .bp-thumb-remove .spinner-border {
        width: 12px;
        height: 12px;
      }

      .bp-add {
        width: 76px;
        height: 76px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        padding: 4px;
        border: 1px dashed #c4c4c4;
        border-radius: 10px;
        background: #fafafa;
        color: #525252;
        font-size: 11px;
        line-height: 1.2;
      }

      .bp-add .bi {
        font-size: 20px;
      }

      .bp-add:hover:not(:disabled) {
        border-color: #6f42c1;
        color: #6f42c1;
      }

      .bp-add:disabled {
        opacity: 0.6;
      }

      .bp-empty {
        margin: 0;
        font-size: 13px;
        color: var(--shell-muted, #737373);
      }

      .bp-status,
      .bp-warning {
        display: flex;
        align-items: center;
        margin: 0;
        font-size: 12px;
        color: var(--shell-muted, #737373);
      }

      .bp-warning {
        color: #b45309;
      }

      .bp-lightbox {
        position: fixed;
        inset: 0;
        z-index: 5000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 56px 16px 16px;
        background: rgba(0, 0, 0, 0.85);
        cursor: zoom-out;
      }

      .bp-lightbox img {
        max-width: 100%;
        max-height: 100%;
        border-radius: 8px;
        object-fit: contain;
        cursor: default;
      }

      .bp-lightbox-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 10px 16px;
        color: #fff;
        font-size: 13px;
      }

      .bp-lightbox-btn {
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
        text-decoration: none;
      }

      .bp-lightbox-btn:hover {
        background: rgba(255, 255, 255, 0.28);
        color: #fff;
      }
    `}</style>
  );
}
