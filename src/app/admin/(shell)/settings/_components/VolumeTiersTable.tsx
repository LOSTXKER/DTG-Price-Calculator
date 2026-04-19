"use client";

import { useState, useTransition } from "react";
import type { VolumeTierConfig } from "@/lib/pricing";
import { upsertTier, deleteTier } from "../actions";
import {
  SettingsCard,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputCls,
} from "./Card";

interface Draft {
  id: number | null;
  minQty: string;
  ratePct: string;
  label: string;
}

const toDraft = (t: VolumeTierConfig): Draft => ({
  id: t.id,
  minQty: String(t.minQty),
  ratePct: String(Math.round(t.rate * 100)),
  label: t.label,
});

const empty = (): Draft => ({ id: null, minQty: "", ratePct: "", label: "" });

export default function VolumeTiersTable({
  items,
}: {
  items: VolumeTierConfig[];
}) {
  const [drafts, setDrafts] = useState<Draft[]>(() => items.map(toDraft));
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const update = (i: number, field: keyof Draft, val: string) =>
    setDrafts((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r))
    );

  const save = (i: number) => {
    setMsg(null);
    const d = drafts[i];
    const fd = new FormData();
    if (d.id) fd.append("id", String(d.id));
    fd.append("minQty", d.minQty);
    fd.append("rate", String((Number(d.ratePct) || 0) / 100));
    fd.append("label", d.label);
    startTransition(async () => {
      const res = await upsertTier(fd);
      setMsg(res.ok ? "บันทึกแล้ว" : res.error ?? "เกิดข้อผิดพลาด");
    });
  };

  const remove = (i: number) => {
    const d = drafts[i];
    if (!d.id) {
      setDrafts((p) => p.filter((_, idx) => idx !== i));
      return;
    }
    if (!confirm(`ลบส่วนลด "ตั้งแต่ ${d.minQty} ตัว"?`)) return;
    const fd = new FormData();
    fd.append("id", String(d.id));
    startTransition(async () => {
      const res = await deleteTier(fd);
      if (res.ok) {
        setDrafts((p) => p.filter((_, idx) => idx !== i));
        setMsg("ลบแล้ว");
      } else {
        setMsg(res.error ?? "ลบไม่สำเร็จ");
      }
    });
  };

  return (
    <SettingsCard
      title="ส่วนลดตามจำนวน"
      hint="สั่งเยอะ ลดเยอะ"
    >
      <p className="text-[12px] text-[var(--text-tertiary)] mb-3">
        ตัวอย่าง: ตั้งแต่ 50 ตัวขึ้นไป ลด 10% — ส่วนลดจะใช้ tier ที่จำนวนสูงสุดที่ผ่านเกณฑ์
      </p>

      <div className="space-y-2">
        <div className="hidden sm:grid grid-cols-[110px_110px_1fr_auto] gap-2 px-1 text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          <span>ตั้งแต่ (ตัว)</span>
          <span>ลด (%)</span>
          <span>คำอธิบาย ที่จะแสดงในใบเสนอราคา</span>
          <span></span>
        </div>

        {drafts.map((d, i) => (
          <div
            key={d.id ?? `new-${i}`}
            className="grid grid-cols-2 sm:grid-cols-[110px_110px_1fr_auto] gap-2 items-center"
          >
            <div className="relative">
              <input
                type="number"
                value={d.minQty}
                onChange={(e) => update(i, "minQty", e.target.value)}
                placeholder="50"
                className={`${inputCls} mt-0 pr-10`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[12px] text-[var(--text-tertiary)]">
                ตัว
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step={1}
                value={d.ratePct}
                onChange={(e) => update(i, "ratePct", e.target.value)}
                placeholder="10"
                className={`${inputCls} mt-0 pr-8`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[12px] text-[var(--text-tertiary)]">
                %
              </span>
            </div>
            <input
              value={d.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="50 ตัวขึ้นไป ลด 10%"
              className={`${inputCls} mt-0`}
            />
            <div className="flex gap-1 justify-end col-span-2 sm:col-span-1">
              <button
                onClick={() => save(i)}
                disabled={pending}
                className={btnPrimary}
              >
                บันทึก
              </button>
              <button
                onClick={() => remove(i)}
                disabled={pending}
                className={btnDanger}
              >
                ลบ
              </button>
            </div>
          </div>
        ))}

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => setDrafts((p) => [...p, empty()])}
            className={btnSecondary}
          >
            + เพิ่มขั้นส่วนลด
          </button>
          {msg && (
            <span className="text-[13px] text-[var(--text-secondary)]">{msg}</span>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}
