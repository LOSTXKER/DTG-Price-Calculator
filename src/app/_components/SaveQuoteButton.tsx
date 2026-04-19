"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CalculatorInput } from "@/lib/calculator";
import { saveQuoteAction } from "@/app/(main)/quotes/actions";

interface SaveQuoteButtonProps {
  input: CalculatorInput;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "mobile";
  pricePreview?: {
    perPiece: number;
    quantity: number;
    total: number;
  };
}

function fmt(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

export default function SaveQuoteButton({
  input,
  disabled,
  variant = "primary",
  pricePreview,
}: SaveQuoteButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    if (!open) {
      setError(null);
      setName("");
    }
  }, [open]);

  const handleSave = () => {
    setError(null);
    if (!name.trim()) {
      setError("กรอกรหัสออเดอร์ก่อนบันทึก");
      inputRef.current?.focus();
      return;
    }
    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("input", JSON.stringify(input));
    startTransition(async () => {
      const res = await saveQuoteAction(fd);
      if (!res.ok) {
        setError(res.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setOpen(false);
      router.push(`/quotes/${res.id}`);
      router.refresh();
    });
  };

  const triggerProps = {
    onClick: () => setOpen(true),
    disabled,
    title: disabled ? "กรอกข้อมูลให้ครบก่อน จึงบันทึกได้" : "บันทึกการคำนวณนี้",
  };

  return (
    <>
      {variant === "primary" && (
        <button
          {...triggerProps}
          className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[var(--accent)] text-white text-[14px] font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-[0_1px_3px_rgba(0,113,227,0.3)] hover:shadow-[0_2px_8px_rgba(0,113,227,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <SaveIcon />
          บันทึกการคำนวณ
        </button>
      )}

      {variant === "mobile" && (
        <button
          {...triggerProps}
          className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-[var(--accent)] text-white text-[13px] font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <SaveIcon />
          บันทึก
        </button>
      )}

      {variant === "ghost" && (
        <button
          {...triggerProps}
          className="text-[13px] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          บันทึก
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-5"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-[17px] font-semibold tracking-tight">
                บันทึกการคำนวณ
              </h2>
              <p className="text-[12.5px] text-[var(--text-tertiary)] mt-1 leading-relaxed">
                ใส่รหัสออเดอร์เพื่อบันทึก จะได้กลับมาดูย้อนหลังได้ว่าคำนวณราคาแบบไหน
              </p>
            </div>

            {pricePreview && (
              <div className="mx-5 mb-4 px-4 py-3 rounded-xl bg-[var(--fill)] flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">
                    กำลังจะบันทึก
                  </p>
                  <p className="text-[13px] font-semibold mt-0.5">
                    {fmt(pricePreview.perPiece)} ฿/ตัว ×{" "}
                    {pricePreview.quantity} ตัว
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">
                    รวม
                  </p>
                  <p className="text-[18px] font-bold tabular-nums text-[var(--accent)] leading-tight">
                    {fmt(pricePreview.total)} ฿
                  </p>
                </div>
              </div>
            )}

            <div className="px-5 pb-5 space-y-3">
              <label className="block">
                <span className="text-[13px] font-semibold text-[var(--text-primary)] flex items-center gap-1">
                  รหัสออเดอร์ / ชื่อรายการ
                  <span className="text-[var(--orange)]">*</span>
                </span>
                <input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape" && !pending) setOpen(false);
                  }}
                  placeholder="เช่น ANJ-2026-001 หรือ ลูกค้าA"
                  maxLength={120}
                  className="mt-1.5 w-full rounded-xl bg-[var(--fill)] px-3.5 py-3 text-[15px] outline-none focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)] placeholder:text-[var(--text-tertiary)]"
                />
                <span className="block mt-1.5 text-[11.5px] text-[var(--text-tertiary)]">
                  ใส่อะไรก็ได้ที่ทำให้คุณจำได้ ใช้ค้นหาได้ในหน้าประวัติ
                </span>
              </label>

              {error && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--orange)]/10">
                  <span className="text-[var(--orange)] text-[13px]">⚠</span>
                  <p className="text-[12.5px] text-[var(--orange)] font-medium">
                    {error}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="flex-1 rounded-xl bg-[var(--fill)] text-[var(--text-primary)] font-medium py-3 text-[13px] hover:opacity-80 transition-opacity disabled:opacity-60"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  disabled={pending}
                  className="flex-[1.4] rounded-xl bg-[var(--accent)] text-white font-semibold py-3 text-[13px] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60"
                >
                  {pending ? "กำลังบันทึก…" : "บันทึกรายการ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SaveIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 3h8.5L13 4.5V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3z" />
      <path d="M5 3v3.5h6V3" />
      <path d="M5 14v-4h6v4" />
    </svg>
  );
}
