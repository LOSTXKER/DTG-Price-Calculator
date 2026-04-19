"use client";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DateInput({ value, onChange }: DateInputProps) {
  return (
    <div className="flex items-center gap-2.5">
      <label
        htmlFor="anajak-date-input"
        className="text-[12px] font-medium text-[var(--text-secondary)] shrink-0"
      >
        วันที่:
      </label>
      <input
        id="anajak-date-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl bg-[var(--fill)] border border-[var(--border)] px-3 py-1.5 text-[13px] text-[var(--text-primary)]
                   focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20
                   focus:outline-none transition-colors w-44"
        placeholder="14 มีนาคม 69"
      />
    </div>
  );
}
