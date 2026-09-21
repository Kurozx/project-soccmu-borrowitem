"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import NotificationBell from "./NotificationBell";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export type ShellMenuItem = {
  label: string;
  icon: string;
  href: string;
  exact?: boolean;
};

type AppShellProps = {
  homeHref: string;
  subtitle: string;
  sectionLabel: string;
  menuItems: ShellMenuItem[];
  footerLinks?: ShellMenuItem[];
  userName: string;
  roleLabel: string;
  avatarUrl?: string | null;
  sidebarWidth: number;
  loggingOut?: boolean;
  onLogout: () => void;
};

export default function AppShell({
  homeHref,
  subtitle,
  sectionLabel,
  menuItems,
  footerLinks = [],
  userName,
  roleLabel,
  avatarUrl = null,
  sidebarWidth,
  loggingOut = false,
  onLogout,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: ShellMenuItem) =>
    item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href);

  const currentItem = menuItems.find(isActive);
  // ยังโหลดชื่อจากฐานข้อมูลไม่เสร็จ → แสดงช่องว่างแทน ไม่ใช้ชื่อชั่วคราว
  const loadingUser = !userName;
  const initial = userName.trim().charAt(0).toUpperCase();

  const renderLink = (item: ShellMenuItem) => (
    <Link
      key={item.href}
      href={item.href}
      className={`app-nav-link ${isActive(item) ? "active" : ""}`}
      onClick={() => setMobileOpen(false)}
    >
      <i className={`bi ${item.icon}`} />
      <span>{item.label}</span>
    </Link>
  );

  return (
    <div
      className="app-shell"
      style={
        {
          "--app-sidebar-width": `${sidebarWidth}px`,
        } as React.CSSProperties
      }
    >
      {/* ================= SIDEBAR ================= */}
      <aside className={`app-sidebar ${mobileOpen ? "open" : ""}`}>
        <Link href={homeHref} className="app-brand">
          <div className="app-brand-logo">CMU</div>

          <div className="app-brand-text">
            <p>ระบบยืม–คืนครุภัณฑ์</p>
            <small>{subtitle}</small>
          </div>
        </Link>

        <nav className="app-nav">
          <p className="app-nav-section">{sectionLabel}</p>

          {menuItems.map(renderLink)}

          {footerLinks.length > 0 && (
            <div className="app-nav-footer">
              {footerLinks.map(renderLink)}
            </div>
          )}
        </nav>

        <div className="app-sidebar-user">
          <div className="app-sidebar-user-card">
            <div className="app-sidebar-user-text">
              {loadingUser ? (
                <UserSkeleton />
              ) : (
                <>
                  <p>{userName}</p>
                  <small>{roleLabel}</small>
                </>
              )}
            </div>

            <button
              type="button"
              className="app-icon-btn"
              onClick={onLogout}
              disabled={loggingOut}
              aria-label="ออกจากระบบ"
              title="ออกจากระบบ"
            >
              <i
                className={`bi ${
                  loggingOut
                    ? "bi-hourglass-split"
                    : "bi-box-arrow-right"
                }`}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileOpen && (
        <div
          className="app-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= TOP HEADER ================= */}
      <header className="app-header">
        <button
          type="button"
          className="app-icon-btn app-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="เปิดเมนู"
        >
          <i className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"}`} />
        </button>

        <div className="app-scope-pill">
          <span>หน้า</span>
          <strong>{currentItem?.label ?? "ระบบยืม–คืนครุภัณฑ์"}</strong>
        </div>

        <div className="app-header-right">
          {!loadingUser && (
            <NotificationBell
              storageKey={`notif-read:${roleLabel}:${userName}`}
            />
          )}

          <UserMenu
            userName={userName}
            roleLabel={roleLabel}
            initial={initial}
            avatarUrl={avatarUrl}
            loading={loadingUser}
            loggingOut={loggingOut}
            onLogout={onLogout}
          />
        </div>
      </header>
    </div>
  );
}

function UserSkeleton() {
  return (
    <span className="app-user-skeleton" aria-label="กำลังโหลด">
      <span />
      <span />
    </span>
  );
}

// รูปโปรไฟล์ (ถ้ามี) หรืออักษรแรกของชื่อ
function AvatarContent({
  initial,
  avatarUrl,
}: {
  initial: string;
  avatarUrl: string | null;
}) {
  if (!avatarUrl) return <>{initial}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUrl} alt="" className="app-avatar-img" />
  );
}

/* =========================================================
   USER MENU (กดที่ชื่อ → ข้อมูลส่วนตัว / ออกจากระบบ)
========================================================= */

function UserMenu({
  userName,
  roleLabel,
  initial,
  avatarUrl,
  loading,
  loggingOut,
  onLogout,
}: {
  userName: string;
  roleLabel: string;
  initial: string;
  avatarUrl: string | null;
  loading: boolean;
  loggingOut: boolean;
  onLogout: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // ปิดเมื่อคลิกนอกเมนู / กด Esc
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

  return (
    <div className="app-user-menu" ref={rootRef}>
      <button
        type="button"
        className="app-user-chip"
        onClick={() => setOpen(!open)}
        disabled={loading}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className={`app-avatar ${loading ? "skeleton" : ""}`}>
          {!loading && <AvatarContent initial={initial} avatarUrl={avatarUrl} />}
        </span>

        <span className="app-user-chip-text">
          {loading ? (
            <UserSkeleton />
          ) : (
            <>
              <p>{userName}</p>
              <small>{roleLabel}</small>
            </>
          )}
        </span>

        {!loading && (
          <i className={`bi bi-chevron-${open ? "up" : "down"} app-user-caret`} />
        )}
      </button>

      {open && (
        <div className="app-user-dropdown" role="menu">
          <div className="app-user-dropdown-head">
            <span className="app-avatar">
              <AvatarContent initial={initial} avatarUrl={avatarUrl} />
            </span>
            <span>
              <strong>{userName}</strong>
              <small>{roleLabel}</small>
            </span>
          </div>

          <Link
            href="/profile"
            className="app-user-dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <i className="bi bi-person" />
            ข้อมูลส่วนตัว
          </Link>

          <button
            type="button"
            className="app-user-dropdown-item danger"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            disabled={loggingOut}
          >
            <i className="bi bi-box-arrow-right" />
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}
