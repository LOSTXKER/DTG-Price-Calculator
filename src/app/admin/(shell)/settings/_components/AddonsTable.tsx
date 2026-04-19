"use client";

import { useState, useTransition } from "react";
import type { AddonConfig } from "@/lib/pricing";
import { upsertAddon, deleteAddon } from "../actions";
import {
  SettingsCard,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputCls,
} from "./Card";

interface Draft {
  id: number | null;
  code: string;
  label: string;
  cost: string;
  enabled: boolean;
}

const toDraft = (a: AddonConfig): Draft => ({
  id: a.id,
  code: a.code,
  label: a.label,
  cost: String(a.cost),
  enabled: a.enabled,
});

const empty = (): Draft => ({
  id: null,
  code: "",
  label: "",
  cost: "0",
  enabled: true,
});

export default function AddonsTable({ items }: { items: AddonConfig[] }) {
  const [drafts, setDrafts] = useState<Draft[]>(() => items.map(toDraft));
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const update = <K extends keyof Draft>(i: number, key: K, val: Draft[K]) =>
    setDrafts((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [key]: val } : r))
    );

  const save = (i: number) => {
    setMsg(null);
    const d = drafts[i];
    const fd = new FormData();
    if (d.id) fd.append("id", String(d.id));
    fd.append("code", d.code);
    fd.append("label", d.label);
    fd.append("cost", d.cost);
    if (d.enabled) fd.append("enabled", "on");
    startTransition(async () => {
      const res = await upsertAddon(fd);
      setMsg(res.ok ? "บันทึกแล้ว" : res.error ?? "เกิดข้อผิดพลาด");
    });
  };

  const remove = (i: number) => {
    const d = drafts[i];
    if (!d.id) {
      setDrafts((p) => p.filter((_, idx) => idx !== i));
      return;
    }
    if (!confirm(`ลบบริการเสริม "${d.label || d.code}"?`)) return;
    const fd = new FormData();
    fd.append("id", String(d.id));
    startTransition(async () => {
      const res = await deleteAddon(fd);
      if (res.ok) {
        setDrafts((p) => p.filter((_, idx) => idx !== i));
        setMsg("ลบแล้ว");
      } else {
        setMsg(res.error ?? "ลบไม่สำเร็จ");
      }
    });
  };

  return (
    <SettingsCard title="บริการเสริม" hint="add-on ที่ลูกค้าเลือกเพิ่มได้">
      <p className="text-[12px] text-[var(--text-tertiary)] mb-3">
        <b>รหัส</b> ใช้เชื่อมกับโปรแกรม (ห้ามแก้ของเดิมที่มีอยู่ เช่น{" "}
        <code className="bg-[var(--fill)] px-1 rounded">collarLogo</code>) ·{" "}
        <b>ชื่อ</b> = สิ่งที่ลูกค้าเห็น · ปิด <b>เปิดใช้</b> เพื่อซ่อนชั่วคราว
      </p>

      <div className="space-y-2">
        <div className="hidden sm:grid grid-cols-[140px_1fr_110px_80px_auto] gap-2 px-1 text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          <span>รหัส</span>
          <span>ชื่อที่แสดง</span>
          <span>ราคา (บาท)</span>
          <span>เปิดใช้</span>
          <span></span>
        </div>

        {drafts.map((d, i) => (
          <div
            key={d.id ?? `new-${i}`}
            className="grid grid-cols-2 sm:grid-cols-[140px_1fr_110px_80px_auto] gap-2 items-center"
          >
            <input
              value={d.code}
              onChange={(e) => update(i, "code", e.target.value)}
              placeholder="collarLogo"
              className={`${inputCls} mt-0 font-mono text-[12px]`}
            />
            <input
              value={d.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="โลโก้คอ"
              className={`${inputCls} mt-0`}
            />
            <div className="relative">
              <input
                type="number"
                step={1}
                value={d.cost}
                onChange={(e) => update(i, "cost", e.target.value)}
                className={`${inputCls} mt-0 pr-12`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[12px] text-[var(--text-tertiary)]">
                บาท
              </span>
            </div>
            <label className="flex items-center justify-center h-9 rounded-lg bg-[var(--fill)] cursor-pointer">
              <input
                type="checkbox"
                checked={d.enabled}
                onChange={(e) => update(i, "enabled", e.target.checked)}
              />
            </label>
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
            + เพิ่มบริการเสริม
          </button>
          {msg && (
            <span className="text-[13px] text-[var(--text-secondary)]">{msg}</span>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}
