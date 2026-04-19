"use client";

import { useState, useTransition } from "react";
import type { PricingConfig } from "@/lib/pricing";
import { updatePricing } from "../actions";
import {
  FieldLabel,
  SettingsCard,
  btnPrimary,
  inputCls,
} from "./Card";

type FieldKey = keyof Omit<
  PricingConfig,
  "paperSizes" | "volumeTiers" | "addons"
>;

interface FieldDef {
  key: FieldKey;
  label: string;
  hint?: string;
  step?: number;
  suffix?: string;
}

interface FieldGroup {
  title: string;
  description?: string;
  fields: FieldDef[];
}

const GROUPS: FieldGroup[] = [
  {
    title: "ต้นทุนหมึก",
    description: "ราคาที่จ่ายเป็นค่าหมึกในการพิมพ์",
    fields: [
      {
        key: "costPerCc",
        label: "ค่าหมึก ต่อ 1 CC",
        suffix: "บาท",
        step: 0.01,
        hint: "ใช้คำนวณ: จำนวน CC ที่ใช้ × ค่านี้",
      },
      {
        key: "smallDesignFlatCost",
        label: "ค่าพิมพ์ลายเล็ก (เหมา)",
        suffix: "บาท",
        hint: "ลายขนาดเล็กคิดเหมาเป็นราคาเดียว ไม่นับ CC",
      },
      {
        key: "maxInchForMinimum",
        label: "ขนาดสูงสุด ที่ถือว่าเป็น ลายเล็ก",
        suffix: "นิ้ว",
        step: 0.1,
        hint: "ลายไม่เกินขนาดนี้ → ใช้ราคาเหมาด้านบน",
      },
    ],
  },
  {
    title: "ค่าน้ำยา (Pre-treatment) และส่วนลด",
    description: "น้ำยา pretreat ก่อนพิมพ์",
    fields: [
      {
        key: "pretreatmentOnePosition",
        label: "ค่าน้ำยา · สกรีน 1 จุด",
        suffix: "บาท",
        hint: "ถ้าสกรีนแค่ตำแหน่งเดียว",
      },
      {
        key: "pretreatmentMultiPosition",
        label: "ค่าน้ำยา · สกรีน 2 จุดขึ้นไป",
        suffix: "บาท",
        hint: "ถ้าสกรีนตั้งแต่ 2 ตำแหน่งขึ้นไป",
      },
      {
        key: "whiteGarmentDiscount",
        label: "ส่วนลด เสื้อสีขาว",
        suffix: "บาท",
        hint: "หักออกจากต้นทุน เมื่อลูกค้าใช้เสื้อสีขาว",
      },
    ],
  },
  {
    title: "การตั้งราคาขาย",
    description: "บวกกำไร และราคาขั้นต่ำ",
    fields: [
      {
        key: "markup",
        label: "บวกกำไร",
        suffix: "%",
        step: 1,
        hint: "ใส่เป็นเปอร์เซ็นต์ เช่น 35 หมายถึง บวกกำไร 35%",
      },
      {
        key: "minSellingSmall",
        label: "ราคาขายขั้นต่ำ · ลายเล็ก",
        suffix: "บาท",
        hint: "ถ้าคำนวณแล้วได้น้อยกว่านี้ จะดันขึ้นเป็นค่านี้",
      },
      {
        key: "minSellingLarge",
        label: "ราคาขายขั้นต่ำ · ลายใหญ่",
        suffix: "บาท",
        hint: "ใช้แทนค่าด้านบน ถ้าลายใหญ่กว่าเกณฑ์ข้างล่าง",
      },
      {
        key: "largeSizeThreshold",
        label: "ขนาดที่เริ่มถือว่าเป็น ลายใหญ่",
        suffix: "นิ้ว",
        step: 0.1,
        hint: "ลายใหญ่กว่าค่านี้ → ใช้ราคาขั้นต่ำ ลายใหญ่",
      },
    ],
  },
];

function configToFormValue(key: FieldKey, value: number): string {
  if (key === "markup") return String(Math.round(value * 100));
  return String(value);
}

function formValueToConfig(key: FieldKey, raw: string): number {
  const n = Number(raw);
  if (key === "markup") return n / 100;
  return n;
}

export default function PricingForm({ config }: { config: PricingConfig }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = (formData: FormData) => {
    setMsg(null);
    const fixed = new FormData();
    for (const group of GROUPS) {
      for (const f of group.fields) {
        const raw = String(formData.get(f.key) ?? "");
        fixed.append(f.key, String(formValueToConfig(f.key, raw)));
      }
    }
    startTransition(async () => {
      const res = await updatePricing(fixed);
      setMsg(
        res.ok
          ? { ok: true, text: "บันทึกแล้ว ค่าใหม่จะมีผลกับการคำนวณทันที" }
          : { ok: false, text: res.error ?? "เกิดข้อผิดพลาด" }
      );
    });
  };

  return (
    <SettingsCard title="ค่าราคาหลัก" hint="ปรับสูตรคำนวณราคา">
      <form action={handleSubmit} className="space-y-6">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <div className="mb-3">
              <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
                {group.title}
              </h3>
              {group.description && (
                <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                  {group.description}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.fields.map((f) => (
                <FieldLabel key={f.key} label={f.label} hint={f.hint}>
                  <div className="relative mt-1">
                    <input
                      name={f.key}
                      type="number"
                      step={f.step ?? 1}
                      defaultValue={configToFormValue(f.key, config[f.key])}
                      required
                      className={`${inputCls} mt-0 ${
                        f.suffix ? "pr-12" : ""
                      }`}
                    />
                    {f.suffix && (
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[12px] text-[var(--text-tertiary)]">
                        {f.suffix}
                      </span>
                    )}
                  </div>
                </FieldLabel>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2 border-t border-[var(--border)]">
          <button type="submit" disabled={pending} className={btnPrimary}>
            {pending ? "กำลังบันทึก…" : "บันทึกการเปลี่ยนแปลง"}
          </button>
          {msg && (
            <span
              className={`text-[13px] ${
                msg.ok ? "text-[var(--green)]" : "text-[var(--orange)]"
              }`}
            >
              {msg.text}
            </span>
          )}
        </div>
      </form>
    </SettingsCard>
  );
}
