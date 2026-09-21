import type { ReactNode } from "react";

// =========================================================
// Shared UI primitives (styles live in app/globals.css, "UI KIT")
// =========================================================

export type Tone =
  | "purple"
  | "emerald"
  | "blue"
  | "amber"
  | "rose"
  | "neutral";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="ui-page-header">
      <div className="ui-page-header-text">
        {eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}
        <h1 className="ui-title">{title}</h1>
        {description && (
          <p className="ui-description">{description}</p>
        )}
      </div>

      {actions && (
        <div className="ui-page-header-actions">{actions}</div>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tone = "purple",
  hint,
}: {
  label: ReactNode;
  value: ReactNode;
  icon: string;
  tone?: Tone;
  hint?: ReactNode;
}) {
  return (
    <div className="ui-stat">
      <div className="ui-stat-top">
        <div className="ui-stat-text">
          <p className="ui-stat-label">{label}</p>
          <p className="ui-stat-value">{value}</p>
        </div>

        <div className={`ui-stat-icon tone-${tone}`}>
          <i className={`bi ${icon}`} />
        </div>
      </div>

      {hint && <div className="ui-stat-hint">{hint}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  flush = false,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <div className={`ui-panel ${flush ? "flush" : ""} ${className}`}>
      {(title || action) && (
        <div className="ui-panel-head">
          <div>
            {title && <p className="ui-panel-title">{title}</p>}
            {description && (
              <p className="ui-panel-desc">{description}</p>
            )}
          </div>

          {action}
        </div>
      )}

      {children}
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="ui-toolbar">{children}</div>;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="ui-segmented">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === value ? "active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return <span className={`ui-pill tone-${tone}`}>{children}</span>;
}
