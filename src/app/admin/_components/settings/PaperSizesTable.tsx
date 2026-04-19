"use client";

import { useState, useTransition } from "react";
import type { PaperSizeConfig } from "@/lib/pricing";
import { upsertPaperSize, deletePaperSize } from "@/app/admin/actions/settings";
import {
  SettingsCard,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputCls,
} from "./Card";

interface RowDraft {
  id: number | null;
  code: string;
  label: string;
  widthInch: string;
  heightInch: string;
  sortOrder: string;
}

const empty = (sortOrder: number): RowDraft => ({
  id: null,
  code: "",
  label: "",
  widthInch: "",
  heightInch: "",
  sortOrder: String(sortOrder),
});

function toDraft(p: PaperSizeConfig): RowDraft {
  return {
    id: p.id,
    code: p.code,
    label: p.label,
    widthInch: String(p.widthInch),
    heightInch: String(p.heightInch),
    sortOrder: String(p.sortOrder),
  };
}

export default function PaperSizesTable({
  items,
}: {
  items: PaperSizeConfig[];
}) {
  const [drafts, setDrafts] = useState<RowDraft[]>(() => items.map(toDraft));
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const updateField = (i: number, field: keyof RowDraft, val: string) => {
    setDrafts((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r))
    );
  };

  const addRow = () => {
    const nextOrder =
      drafts.length > 0
        ? Math.max(...drafts.map((d) => Number(d.sortOrder) || 0)) + 1
        : 1;
    setDrafts((prev) => [...prev, empty(nextOrder)]);
  };

  const save = (i: number) => {
    setMsg(null);
    const d = drafts[i];
    const fd = new FormData();
    if (d.id) fd.append("id", String(d.id));
    fd.append("code", d.code);
    fd.append("label", d.label);
    fd.append("widthInch", d.widthInch);
    fd.append("heightInch", d.heightInch);
    fd.append("sortOrder", d.sortOrder);

    startTransition(async () => {
      const res = await upsertPaperSize(fd);
      setMsg(res.ok ? "บันทึกแล้ว" : res.error ?? "เกิดข้อผิดพลาด");
    });
  };

  const remove = (i: number) => {
    const d = drafts[i];
    if (!d.id) {
      setDrafts((prev) => prev.filter((_, idx) => idx !== i));
      return;
    }
    if (!confirm(`ลบขนาด "${d.code}"?`)) return;
    const fd = new FormData();
    fd.append("id", String(d.id));
    startTransition(async () => {
      const res = await deletePaperSize(fd);
      if (res.ok) {
        setDrafts((prev) => prev.filter((_, idx) => idx !== i));
        setMsg("ลบแล้ว");
      } else {
        setMsg(res.error ?? "ลบไม่สำเร็จ");
      }
    });
  };

  return (
    <SettingsCard
      title="ขนาดลายมาตรฐาน"
      hint="ขนาดที่ลูกค้าเลือกได้ในหน้าคำนวณ"
    >
      <p className="text-[12px] text-[var(--text-tertiary)] mb-3">
        <b>ชื่อย่อ</b> = ตัวย่อภายในระบบ (เช่น A4) · <b>ชื่อแสดง</b> = สิ่งที่ลูกค้าเห็น · <b>ลำดับ</b>{" "}
        = ตัวเลขน้อย ขึ้นก่อนในรายการเลือก
      </p>

      <div className="space-y-2">
        <div className="hidden sm:grid grid-cols-[80px_1fr_90px_90px_70px_auto] gap-2 px-1 text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          <span>ชื่อย่อ</span>
          <span>ชื่อที่แสดงให้ลูกค้า</span>
          <span>กว้าง (นิ้ว)</span>
          <span>ยาว (นิ้ว)</span>
          <span>ลำดับ</span>
          <span></span>
        </div>

        {drafts.map((d, i) => (
          <div
            key={d.id ?? `new-${i}`}
            className="grid grid-cols-2 sm:grid-cols-[80px_1fr_90px_90px_70px_auto] gap-2 items-center"
          >
            <input
              value={d.code}
              onChange={(e) => updateField(i, "code", e.target.value)}
              placeholder="A7"
              className={`${inputCls} mt-0`}
            />
            <input
              value={d.label}
              onChange={(e) => updateField(i, "label", e.target.value)}
              placeholder='A7 (3 × 4")'
              className={`${inputCls} mt-0`}
            />
            <input
              type="number"
              step={0.1}
              value={d.widthInch}
              onChange={(e) => updateField(i, "widthInch", e.target.value)}
              className={`${inputCls} mt-0`}
            />
            <input
              type="number"
              step={0.1}
              value={d.heightInch}
              onChange={(e) => updateField(i, "heightInch", e.target.value)}
              className={`${inputCls} mt-0`}
            />
            <input
              type="number"
              value={d.sortOrder}
              onChange={(e) => updateField(i, "sortOrder", e.target.value)}
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
          <button onClick={addRow} className={btnSecondary}>
            + เพิ่มขนาดใหม่
          </button>
          {msg && (
            <span className="text-[13px] text-[var(--text-secondary)]">{msg}</span>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}
