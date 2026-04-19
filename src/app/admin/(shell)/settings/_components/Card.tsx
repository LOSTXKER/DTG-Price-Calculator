export function SettingsCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl">
      <header className="px-5 py-4 border-b border-[var(--border)] flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {hint && (
          <span className="text-[12px] text-[var(--text-tertiary)]">{hint}</span>
        )}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function FieldLabel({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      {children}
      {hint && (
        <span className="block mt-1 text-[11px] text-[var(--text-tertiary)]">
          {hint}
        </span>
      )}
    </label>
  );
}

export const inputCls =
  "mt-1 w-full rounded-lg bg-[var(--fill)] px-3 py-2 text-[14px] tabular-nums outline-none focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)]";

export const btnPrimary =
  "rounded-lg bg-[var(--accent)] text-white text-[13px] font-medium px-4 py-2 hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60";

export const btnSecondary =
  "rounded-lg bg-[var(--fill)] text-[var(--text-primary)] text-[13px] font-medium px-4 py-2 hover:bg-[var(--card-hover)] transition-colors";

export const btnDanger =
  "rounded-lg bg-transparent text-[var(--red)] text-[13px] font-medium px-3 py-1.5 hover:bg-[var(--red)]/10 transition-colors";
