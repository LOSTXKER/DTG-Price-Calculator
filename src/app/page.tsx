"use client";

import { useState, useMemo } from "react";
import {
  type PaperSize,
  type PrintSideInput,
  type AddonsInput,
  type CalculatorInput,
  PAPER_SIZES,
  calculate,
} from "@/lib/calculator";
import PriceSummary from "@/components/PriceSummary";
import ThemeToggle from "@/components/ThemeToggle";

type SideMode = "front" | "back" | "both";
type GarmentColor = "white" | "dark" | null;

const defaultSide: PrintSideInput = {
  enabled: false,
  colorCC: 0,
  whiteCC: 0,
  size: "",
  customWidthInch: 0,
  customHeightInch: 0,
};

const sideModes: { value: SideMode; label: string }[] = [
  { value: "front", label: "หน้า" },
  { value: "back", label: "หลัง" },
  { value: "both", label: "หน้า + หลัง" },
];

function NumInput({ value, onValueChange, min, step, placeholder, className }: {
  value: string;
  onValueChange: (raw: string, num: number) => void;
  min?: number;
  step?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      min={min}
      step={step}
      value={value}
      onChange={(e) => {
        const raw = e.target.value;
        const num = parseFloat(raw);
        onValueChange(raw, isNaN(num) ? 0 : Math.max(0, num));
      }}
      className={className}
      placeholder={placeholder}
    />
  );
}

function CCFields({ label, value, onChange, colorStr, whiteStr, onColorStr, onWhiteStr }: {
  label?: string;
  value: PrintSideInput;
  onChange: (v: PrintSideInput) => void;
  colorStr: string;
  whiteStr: string;
  onColorStr: (s: string) => void;
  onWhiteStr: (s: string) => void;
}) {
  const update = (patch: Partial<PrintSideInput>) => onChange({ ...value, ...patch });
  const inputCls = "w-full rounded-xl bg-[var(--fill)] px-4 py-3 text-[15px] tabular-nums transition-shadow focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)]";

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-[13px] font-medium text-[var(--text-secondary)]">{label}</p>
      )}
      <div>
        <p className="text-[13px] text-[var(--text-tertiary)] mb-1.5">ขนาดลาย</p>
        <div className="relative">
          <select
            value={value.size}
            onChange={(e) => update({ size: e.target.value as PaperSize })}
            className="w-full appearance-none rounded-xl bg-[var(--fill)] px-4 py-3 text-[15px] transition-shadow focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)]"
          >
            <option value="">— เลือกขนาดลาย —</option>
            {(Object.keys(PAPER_SIZES) as Array<Exclude<PaperSize, "" | "custom">>).map((key) => (
              <option key={key} value={key}>{PAPER_SIZES[key].label}</option>
            ))}
            <option value="custom">กำหนดเอง</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-tertiary)]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>

      {value.size === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[13px] text-[var(--text-tertiary)] mb-1.5">กว้าง (นิ้ว)</p>
            <input type="number" min={0} step={0.1} value={value.customWidthInch ?? ""} onChange={(e) => update({ customWidthInch: parseFloat(e.target.value) || 0 })} className={inputCls} placeholder="8" />
          </div>
          <div>
            <p className="text-[13px] text-[var(--text-tertiary)] mb-1.5">ยาว (นิ้ว)</p>
            <input type="number" min={0} step={0.1} value={value.customHeightInch ?? ""} onChange={(e) => update({ customHeightInch: parseFloat(e.target.value) || 0 })} className={inputCls} placeholder="12" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[13px] text-[var(--text-tertiary)] mb-1.5">CC หมึกสี</p>
          <NumInput value={colorStr} onValueChange={(raw, num) => { onColorStr(raw); update({ colorCC: num }); }} min={0} step={0.01} placeholder="0.00" className={inputCls} />
        </div>
        <div>
          <p className="text-[13px] text-[var(--text-tertiary)] mb-1.5">CC หมึกขาว</p>
          <NumInput value={whiteStr} onValueChange={(raw, num) => { onWhiteStr(raw); update({ whiteCC: num }); }} min={0} step={0.01} placeholder="0.00" className={inputCls} />
        </div>
      </div>
    </div>
  );
}

function AddonRow({ checked, onChange, label, detail }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  detail: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="w-full flex items-center justify-between py-3">
      <span className="text-[15px]">{label}</span>
      <div className="flex items-center gap-2.5">
        <span className="text-[13px] text-[var(--text-tertiary)]">{detail}</span>
        <div className={`w-[22px] h-[22px] rounded-md flex items-center justify-center transition-colors ${checked ? "bg-[var(--accent)]" : "bg-[var(--checkbox-off)] shadow-[inset_0_0_0_1.5px_var(--checkbox-off-border)]"}`}>
          {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5L5 9L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
      </div>
    </button>
  );
}

export default function Home() {
  const [sideMode, setSideMode] = useState<SideMode>("front");
  const [garmentColor, setGarmentColor] = useState<GarmentColor>(null);
  const [front, setFront] = useState<PrintSideInput>({ ...defaultSide, enabled: true });
  const [back, setBack] = useState<PrintSideInput>({ ...defaultSide });
  const [addons, setAddons] = useState<AddonsInput>({ collarLogo: false, sleeveLeft: false, sleeveRight: false });
  const [quantity, setQuantity] = useState(1);

  const [frontColorStr, setFrontColorStr] = useState("");
  const [frontWhiteStr, setFrontWhiteStr] = useState("");
  const [backColorStr, setBackColorStr] = useState("");
  const [backWhiteStr, setBackWhiteStr] = useState("");

  const frontEnabled = sideMode === "front" || sideMode === "both";
  const backEnabled = sideMode === "back" || sideMode === "both";
  const isWhiteGarment = garmentColor === "white";

  const hasTouched = garmentColor !== null || frontColorStr !== "" || frontWhiteStr !== "" || backColorStr !== "" || backWhiteStr !== "" || front.size !== "" || back.size !== "";
  const frontCCOk = !frontEnabled || frontColorStr !== "" || frontWhiteStr !== "";
  const backCCOk = !backEnabled || backColorStr !== "" || backWhiteStr !== "";
  const frontSizeOk = !frontEnabled || front.size !== "";
  const backSizeOk = !backEnabled || back.size !== "";
  const isValid = garmentColor !== null && frontCCOk && backCCOk && frontSizeOk && backSizeOk;

  const missingFields: string[] = [];
  if (hasTouched) {
    if (garmentColor === null) missingFields.push("สีเสื้อ");
    if (frontEnabled && !frontSizeOk) missingFields.push(sideMode === "both" ? "ขนาดลาย (หน้า)" : "ขนาดลาย");
    if (backEnabled && !backSizeOk) missingFields.push(sideMode === "both" ? "ขนาดลาย (หลัง)" : "ขนาดลาย");
    if (frontEnabled && !frontCCOk) missingFields.push(sideMode === "both" ? "CC หมึก (หน้า)" : "CC หมึก");
    if (backEnabled && !backCCOk) missingFields.push(sideMode === "both" ? "CC หมึก (หลัง)" : "CC หมึก");
  }

  const input: CalculatorInput = useMemo(
    () => ({
      isWhiteGarment,
      front: { ...front, enabled: frontEnabled },
      back: { ...back, enabled: backEnabled },
      addons,
      quantity,
    }),
    [isWhiteGarment, front, frontEnabled, back, backEnabled, addons, quantity]
  );

  const breakdown = useMemo(() => calculate(input), [input]);

  const handleReset = () => {
    setSideMode("front");
    setGarmentColor(null);
    setFront({ ...defaultSide, enabled: true });
    setBack({ ...defaultSide });
    setFrontColorStr(""); setFrontWhiteStr("");
    setBackColorStr(""); setBackWhiteStr("");
    setAddons({ collarLogo: false, sleeveLeft: false, sleeveRight: false });
    setQuantity(1);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--header-bg)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-base font-semibold tracking-tight">DTG Calculator</h1>
            <span className="text-xs text-[var(--text-tertiary)] hidden sm:inline">Brother GTX Pro Bulk</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="text-[13px] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">รีเซ็ต</button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6">
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Main form card */}
            <div className="rounded-2xl bg-[var(--card)] shadow-[0_0_0_1px_var(--border),0_2px_8px_rgba(0,0,0,0.04)]">
              {/* Side mode tabs */}
              <div className="p-4 pb-0">
                <p className="text-[13px] text-[var(--text-tertiary)] mb-2">ตำแหน่งสกรีน</p>
                <div className="flex rounded-xl bg-[var(--fill)] p-1 gap-1">
                  {sideModes.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setSideMode(m.value)}
                      className={`flex-1 py-2.5 rounded-[10px] text-[14px] font-medium transition-all ${
                        sideMode === m.value
                          ? "bg-[var(--seg-active)] shadow-[0_1px_3px_var(--seg-active-shadow)] text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Garment color */}
              <div className="p-4 pb-0">
                <p className="text-[13px] text-[var(--text-tertiary)] mb-2">สีเสื้อ</p>
                <div className="relative">
                  <select
                    value={garmentColor ?? ""}
                    onChange={(e) => setGarmentColor(e.target.value === "" ? null : e.target.value as GarmentColor)}
                    className="w-full appearance-none rounded-xl bg-[var(--fill)] px-4 py-3 text-[15px] transition-shadow focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)]"
                  >
                    <option value="">— เลือกสีเสื้อ —</option>
                    <option value="white">เสื้อขาว</option>
                    <option value="dark">เสื้อสี / ดำ</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-tertiary)]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                {garmentColor === "white" && (
                  <p className="mt-2 text-[12px] text-[var(--green)]">ส่วนลดเสื้อขาว -40 ฿</p>
                )}
              </div>

              {/* CC fields */}
              <div className="p-4">
                {frontEnabled && (
                  <CCFields
                    label={sideMode === "both" ? "ด้านหน้า" : undefined}
                    value={front}
                    onChange={setFront}
                    colorStr={frontColorStr}
                    whiteStr={frontWhiteStr}
                    onColorStr={setFrontColorStr}
                    onWhiteStr={setFrontWhiteStr}
                  />
                )}
                {sideMode === "both" && <div className="my-4 border-t border-[var(--border)]" />}
                {backEnabled && (
                  <CCFields
                    label={sideMode === "both" ? "ด้านหลัง" : undefined}
                    value={back}
                    onChange={setBack}
                    colorStr={backColorStr}
                    whiteStr={backWhiteStr}
                    onColorStr={setBackColorStr}
                    onWhiteStr={setBackWhiteStr}
                  />
                )}
              </div>
            </div>

            {/* Addons + quantity card */}
            <div className="rounded-2xl bg-[var(--card)] shadow-[0_0_0_1px_var(--border),0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="px-5 pt-4">
                <p className="text-[13px] text-[var(--text-tertiary)] mb-0.5">ตำแหน่งเพิ่มเติม</p>
                <div className="divide-y divide-[var(--border)]">
                  <AddonRow checked={addons.collarLogo} onChange={(v) => setAddons({ ...addons, collarLogo: v })} label="โลโก้คอ" detail="+30 ฿" />
                  <AddonRow checked={addons.sleeveLeft} onChange={(v) => setAddons({ ...addons, sleeveLeft: v })} label="สกรีนแขนซ้าย" detail="+70 ฿" />
                  <AddonRow checked={addons.sleeveRight} onChange={(v) => setAddons({ ...addons, sleeveRight: v })} label="สกรีนแขนขวา" detail="+70 ฿" />
                </div>
              </div>

              <div className="px-5 py-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[var(--text-tertiary)]">จำนวน</span>
                  <div className="flex items-center">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-l-xl bg-[var(--fill)] text-[var(--text-secondary)] text-lg font-medium hover:bg-[var(--qty-hover)] transition-colors flex items-center justify-center active:bg-[var(--qty-active)]">−</button>
                    <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-14 h-9 text-center bg-[var(--fill)] text-[15px] tabular-nums border-x border-[var(--qty-border)]" />
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-r-xl bg-[var(--fill)] text-[var(--text-secondary)] text-lg font-medium hover:bg-[var(--qty-hover)] transition-colors flex items-center justify-center active:bg-[var(--qty-active)]">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price summary */}
          <div className="lg:w-[360px] shrink-0">
            <div className="lg:sticky lg:top-20">
              <PriceSummary breakdown={breakdown} isValid={isValid} missingFields={missingFields} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
