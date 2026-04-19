import type { ReactNode } from "react";

const cardClass =
  "rounded-2xl bg-[var(--card)] shadow-[0_0_0_1px_var(--border),0_2px_8px_rgba(0,0,0,0.04)]";

export function Card({
  children,
  className = "",
  padding = "px-5 py-4",
}: {
  children: ReactNode;
  className?: string;
  padding?: string;
}) {
  return <div className={`${cardClass} ${padding} ${className}`.trim()}>{children}</div>;
}

export function CardSurface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${cardClass} overflow-hidden ${className}`.trim()}>{children}</div>;
}

export function SectionLabel({
  num,
  title,
  hint,
}: {
  num: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-[var(--fill)] text-[12px] font-semibold text-[var(--text-secondary)] flex items-center justify-center tabular-nums">
          {num}
        </span>
        <p className="text-[14px] font-medium text-[var(--text-primary)]">{title}</p>
      </div>
      {hint && <p className="text-[11px] text-[var(--text-tertiary)]">{hint}</p>}
    </div>
  );
}

export function Section({
  num,
  title,
  hint,
  children,
}: {
  num: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <SectionLabel num={num} title={title} hint={hint} />
      {children}
    </Card>
  );
}
