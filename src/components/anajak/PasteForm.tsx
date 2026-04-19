"use client";

import { useState } from "react";

interface PasteFormProps {
  onParse: (text: string) => void;
  error: string | null;
  loading?: boolean;
}

const PLACEHOLDER = `รหัสคำสั่งซื้อ​: E31

-- รายการสินค้าที่ 1 : เสื้อดำ --
รายการสกรีน
สกรีน DTG ด้านหน้า (14 นิ้ว 1/9 CC) : 150.00 บาท
สกรีน DTG ด้านหลัง (14 นิ้ว 1/7 CC) : 150.00 บาท
ค่าสกรีนต่อตัว 300.00 บาท

รายการเสื้อ:
Anajak Combed 30 (ดำ L) : 120.00 x 7 ตัว
...`;

export default function PasteForm({ onParse, error, loading }: PasteFormProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onParse(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="anajak-order-text"
          className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5"
        >
          วางข้อความคำสั่งซื้อจาก Anajak
        </label>
        <textarea
          id="anajak-order-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={10}
          className="w-full rounded-xl bg-[var(--fill)] border border-[var(--border)] px-3.5 py-2.5 text-[13px] text-[var(--text-primary)]
                     focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20
                     focus:outline-none transition-colors resize-y
                     placeholder:text-[var(--text-tertiary)] font-mono"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-[var(--red)]/10 border border-[var(--red)]/30 px-3.5 py-2.5 text-[12px] text-[var(--red)]">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white
                     hover:bg-[var(--accent-hover)]
                     disabled:bg-[var(--fill)] disabled:text-[var(--text-tertiary)] disabled:cursor-not-allowed
                     transition-colors inline-flex items-center gap-2"
        >
          {loading && (
            <svg
              className="animate-spin h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {loading ? "กำลังแปลง..." : "แปลงข้อมูล"}
        </button>
        <button
          type="button"
          onClick={() => setText("")}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)]
                     hover:bg-[var(--card-hover)] transition-colors"
        >
          ล้าง
        </button>
      </div>
    </form>
  );
}
