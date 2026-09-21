"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  tone: string;
  icon: string;
  title: string;
  message: string;
  href: string;
  createdAt: string;
};

// ตรวจแจ้งเตือนใหม่ทุก 30 วินาที
const REFRESH_MS = 30000;
const MAX_READ_IDS = 300;

function loadReadIds(key: string) {
  try {
    const raw = window.localStorage.getItem(key);

    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

function saveReadIds(key: string, ids: Set<string>) {
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify([...ids].slice(-MAX_READ_IDS))
    );
  } catch {
    // เบราว์เซอร์ไม่อนุญาต localStorage — ไม่เป็นไร
  }
}

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();

  // เวลาที่ยังไม่มาถึง (เช่น กำหนดคืน) แสดงเป็นวันที่
  if (diff < 0) {
    return new Date(value).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
  }

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;

  return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

export default function NotificationBell({
  storageKey,
}: {
  storageKey: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set()
  );
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) throw new Error();

      const body = await response.json();

      setItems(body.data ?? []);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  // โหลดครั้งแรก + ตรวจซ้ำเป็นระยะ
  useEffect(() => {
    const first = setTimeout(() => {
      setReadIds(loadReadIds(storageKey));
      load();
    }, 0);

    const timer = setInterval(load, REFRESH_MS);

    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [load, storageKey]);

  // ปิดเมื่อคลิกนอกกล่อง / กด Esc
  useEffect(() => {
    if (!open) return;

    const onClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markRead = (ids: string[]) => {
    setReadIds((current) => {
      const next = new Set(current);
      ids.forEach((id) => next.add(id));
      saveReadIds(storageKey, next);

      return next;
    });
  };

  const unread = items.filter((item) => !readIds.has(item.id));

  return (
    <div className="notif" ref={rootRef}>
      <button
        type="button"
        className="notif-btn"
        aria-label={`การแจ้งเตือน ${unread.length} รายการใหม่`}
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (!open) load();
        }}
      >
        <i className="bi bi-bell" />

        {unread.length > 0 && (
          <span className="notif-badge">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-panel" role="dialog" aria-label="การแจ้งเตือน">
          <div className="notif-head">
            <p>การแจ้งเตือน</p>

            {unread.length > 0 && (
              <button
                type="button"
                onClick={() => markRead(items.map((item) => item.id))}
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>

          <div className="notif-list">
            {error && (
              <p className="notif-empty">
                โหลดการแจ้งเตือนไม่สำเร็จ
              </p>
            )}

            {!error && items.length === 0 && (
              <p className="notif-empty">
                <i className="bi bi-bell-slash" />
                ไม่มีการแจ้งเตือน
              </p>
            )}

            {items.map((item) => {
              const isUnread = !readIds.has(item.id);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`notif-item ${isUnread ? "unread" : ""}`}
                  onClick={() => {
                    markRead([item.id]);
                    setOpen(false);
                  }}
                >
                  <span className={`notif-icon tone-${item.tone}`}>
                    <i className={`bi ${item.icon}`} />
                  </span>

                  <span className="notif-body">
                    <span className="notif-title">{item.title}</span>
                    <span className="notif-message">{item.message}</span>
                    <span className="notif-time">
                      {timeAgo(item.createdAt)}
                    </span>
                  </span>

                  {isUnread && <span className="notif-dot" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
