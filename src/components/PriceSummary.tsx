"use client";

import {
  type CostBreakdown,
  type SideCostBreakdown,
  SIDE_KEYS,
} from "@/lib/calculator";
import type { PricingConfig } from "@/lib/pricing";
import { CardSurface } from "@/components/ui/Card";
import { ChevronDownIcon } from "@/components/icons";

interface PriceSummaryProps {
  breakdown: CostBreakdown;
  isValid: boolean;
  missingFields: string[];
  config: PricingConfig;
}

const SIDE_ROW_LABELS: Record<(typeof SIDE_KEYS)[number]["id"], string> = {
  front: "สกรีนหน้า",
  back: "สกรีนหลัง",
  sleeveLeft: "สกรีนแขนซ้าย",
  sleeveRight: "สกรีนแขนขวา",
};

const SIDE_DETAIL_LABELS: Record<(typeof SIDE_KEYS)[number]["id"], string> = {
  front: "ด้านหน้า",
  back: "ด้านหลัง",
  sleeveLeft: "แขนซ้าย",
  sleeveRight: "แขนขวา",
};

function fmt(amount: number): string {
  return amount.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function Row({
  label,
  value,
  negative,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  if (value === 0) return null;
  return (
    <div className="flex justify-between items-center py-[5px]">
      <span className="text-[14px] text-[var(--text-secondary)]">{label}</span>
      <span
        className={`text-[14px] font-medium tabular-nums ${
          negative ? "text-[var(--green)]" : ""
        }`}
      >
        {negative ? "−" : ""}
        {fmt(Math.abs(value))}
      </span>
    </div>
  );
}

function SideCalc({
  label,
  side,
  config,
}: {
  label: string;
  side: SideCostBreakdown | null;
  config: PricingConfig;
}) {
  if (!side) return null;
  return (
    <div className="py-2.5 border-b border-[var(--border)] last:border-b-0">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[12px] font-semibold text-[var(--text-secondary)]">
          {label}
        </p>
        <p className="text-[13px] font-semibold tabular-nums">
          {fmt(side.finalCost)} ฿
        </p>
      </div>
      <div className="space-y-1 text-[12px] text-[var(--text-tertiary)] leading-relaxed">
        <p>
          หมึกสี {side.colorCCRounded} CC + หมึกขาว {side.whiteCCRounded} CC ={" "}
          <span className="text-[var(--text-secondary)]">รวม {side.totalCC} CC</span>
        </p>
        {side.isSmallDesign ? (
          <p className="text-[var(--orange)]">
            ลายเล็ก (≤ {config.maxInchForMinimum}&quot;) ใช้ราคาเหมา {fmt(config.smallDesignFlatCost)} ฿{" "}
            <span className="text-[var(--text-tertiary)]">
              (แทนการคิดต่อ CC)
            </span>
          </p>
        ) : (
          <p>
            {side.totalCC} CC × {config.costPerCc} ฿/CC ={" "}
            <span className="text-[var(--text-secondary)]">
              {fmt(side.ccBasedCost)} ฿
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function CalculationSummary({
  breakdown,
  config,
}: {
  breakdown: CostBreakdown;
  config: PricingConfig;
}) {
  const enabledSides = SIDE_KEYS.filter(({ id }) => breakdown.sides[id] !== null);
  const sidesCost = enabledSides.reduce(
    (sum, { id }) => sum + (breakdown.sides[id]?.finalCost ?? 0),
    0
  );
  const enabledCount = enabledSides.length;
  const pretreatmentNote =
    enabledCount >= 2
      ? `${enabledCount} ตำแหน่ง`
      : enabledCount === 1
      ? "1 ตำแหน่ง"
      : "";
  const markupPct = Math.round(config.markup * 100);

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2 text-[12px] text-[var(--text-tertiary)] leading-relaxed">
      <p className="font-semibold text-[var(--text-secondary)] mb-1">
        วิธีคำนวณราคารวม
      </p>

      <p>
        <span className="text-[var(--text-secondary)]">ค่าสกรีนรวม</span> ={" "}
        {fmt(sidesCost)} ฿
      </p>

      {breakdown.pretreatment > 0 && (
        <p>
          + Pre-treatment ({pretreatmentNote}) ={" "}
          <span className="text-[var(--text-secondary)]">
            {fmt(breakdown.pretreatment)} ฿
          </span>
        </p>
      )}

      {breakdown.collarLogo > 0 && (
        <p>
          + โลโก้คอ ={" "}
          <span className="text-[var(--text-secondary)]">
            {fmt(breakdown.collarLogo)} ฿
          </span>
        </p>
      )}

      {breakdown.whiteGarmentDiscount > 0 && (
        <p className="text-[var(--green)]">
          − ส่วนลดเสื้อขาว = {fmt(breakdown.whiteGarmentDiscount)} ฿
        </p>
      )}

      <p className="pt-1 border-t border-[var(--border)]">
        <span className="text-[var(--text-secondary)]">ต้นทุนรวม / ตัว</span> ={" "}
        <span className="font-semibold text-[var(--text-primary)] tabular-nums">
          {fmt(breakdown.totalCostPerPiece)} ฿
        </span>
      </p>

      <p>
        × (1 + {config.markup}) → บวก markup {markupPct}% ={" "}
        <span className="text-[var(--text-secondary)]">
          {fmt(breakdown.sellingPriceBeforeMin)} ฿
        </span>
      </p>

      {breakdown.appliedMinSelling && (
        <p className="text-[var(--orange)]">
          ราคาน้อยกว่าขั้นต่ำ {fmt(breakdown.minSellingPrice)} ฿ → ปรับขึ้นเป็น{" "}
          {fmt(breakdown.sellingPricePerPiece)} ฿
        </p>
      )}

      {breakdown.volumeDiscount.rate > 0 && (
        <p className="text-[var(--green)]">
          ลดตามจำนวน {breakdown.volumeDiscount.rate * 100}% (
          {breakdown.volumeDiscount.label}) ={" "}
          {fmt(breakdown.discountedSellingPricePerPiece)} ฿
        </p>
      )}

      <p className="pt-1 border-t border-[var(--border)]">
        <span className="text-[var(--text-secondary)]">ราคาขายสุดท้าย / ตัว</span>{" "}
        ={" "}
        <span className="font-semibold text-[var(--accent)] tabular-nums">
          {fmt(
            breakdown.volumeDiscount.rate > 0
              ? breakdown.discountedSellingPricePerPiece
              : breakdown.sellingPricePerPiece
          )}{" "}
          ฿
        </span>
      </p>

      {breakdown.quantity > 1 && (
        <p>
          × {breakdown.quantity} ตัว ={" "}
          <span className="font-semibold text-[var(--accent)] tabular-nums">
            {fmt(breakdown.totalSellingPrice)} ฿
          </span>
        </p>
      )}
    </div>
  );
}

function EmptyPriceSummary({ missingFields }: { missingFields: string[] }) {
  const hasMissing = missingFields.length > 0;
  return (
    <CardSurface>
      <div className="px-5 pt-6 pb-5 text-center">
        <p className="text-[12px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
          ราคาขาย / ตัว
        </p>
        <p className="text-[42px] font-bold tracking-tight leading-none text-[var(--text-tertiary)]">
          — <span className="text-[20px]">฿</span>
        </p>
        <p className="mt-3 text-[13px] text-[var(--text-tertiary)]">
          {hasMissing ? "กรอกข้อมูลให้ครบเพื่อคำนวณ" : "เลือกสีเสื้อ แล้วเปิดตำแหน่งสกรีน"}
        </p>
      </div>
      {hasMissing && (
        <>
          <div className="mx-5 border-t border-[var(--border)]" />
          <div className="px-5 py-3">
            {missingFields.map((f) => (
              <div key={f} className="flex items-center gap-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] shrink-0" />
                <span className="text-[13px] text-[var(--text-secondary)]">{f}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </CardSurface>
  );
}

export default function PriceSummary({
  breakdown,
  isValid,
  missingFields,
  config,
}: PriceSummaryProps) {
  const markupPct = Math.round(config.markup * 100);
  if (!isValid) return <EmptyPriceSummary missingFields={missingFields} />;

  const hasDiscount = breakdown.volumeDiscount.rate > 0;
  const finalPrice = hasDiscount
    ? breakdown.discountedSellingPricePerPiece
    : breakdown.sellingPricePerPiece;
  const hasAnySide = SIDE_KEYS.some(({ id }) => breakdown.sides[id] !== null);

  return (
    <CardSurface>
      <div className="px-5 pt-6 pb-5 text-center">
        <p className="text-[12px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
          ราคาขาย / ตัว
        </p>
        <p className="text-[42px] font-bold tracking-tight leading-none tabular-nums">
          {fmt(finalPrice)}
          <span className="text-[20px] font-semibold text-[var(--text-tertiary)] ml-1">
            ฿
          </span>
        </p>
        {hasDiscount && (
          <p className="mt-1.5 text-[13px] text-[var(--text-tertiary)]">
            <span className="line-through">{fmt(breakdown.sellingPricePerPiece)} ฿</span>
            <span className="ml-2 text-[var(--green)] font-medium">
              −{breakdown.volumeDiscount.rate * 100}%
            </span>
          </p>
        )}
        {!hasDiscount && breakdown.appliedMinSelling && (
          <p className="mt-1.5 text-[13px] text-[var(--orange)]">
            ขั้นต่ำ {fmt(breakdown.minSellingPrice)} ฿
          </p>
        )}
      </div>

      <div className="mx-5 border-t border-[var(--border)]" />

      <div className="px-5 py-3">
        {SIDE_KEYS.map(({ id }) => (
          <Row
            key={id}
            label={SIDE_ROW_LABELS[id]}
            value={breakdown.sides[id]?.finalCost ?? 0}
          />
        ))}
        <Row label="Pre-treatment" value={breakdown.pretreatment} />
        <Row label="โลโก้คอ" value={breakdown.collarLogo} />
        {breakdown.whiteGarmentDiscount > 0 && (
          <Row label="ส่วนลดเสื้อขาว" value={breakdown.whiteGarmentDiscount} negative />
        )}
      </div>

      <div className="mx-5 border-t border-[var(--border)]" />

      <div className="px-5 py-3">
        <div className="flex justify-between items-center py-[5px]">
          <span className="text-[14px] text-[var(--text-secondary)]">ต้นทุน / ตัว</span>
          <span className="text-[15px] font-semibold tabular-nums">
            {fmt(breakdown.totalCostPerPiece)} ฿
          </span>
        </div>
        <div className="flex justify-between items-center py-[5px]">
          <span className="text-[14px] text-[var(--text-secondary)]">
            ราคาขาย <span className="text-[var(--text-tertiary)]">+{markupPct}%</span>
          </span>
          <span className="text-[15px] font-semibold tabular-nums text-[var(--accent)]">
            {fmt(breakdown.sellingPricePerPiece)} ฿
          </span>
        </div>
      </div>

      {hasDiscount && (
        <>
          <div className="mx-5 border-t border-[var(--border)]" />
          <div className="px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-[var(--green)] bg-[var(--green-bg)] rounded-full px-2.5 py-0.5">
                Promotion
              </span>
              <span className="text-[13px] text-[var(--text-secondary)]">
                {breakdown.volumeDiscount.label}
              </span>
            </div>
          </div>
        </>
      )}

      {breakdown.quantity > 1 && (
        <>
          <div className="mx-5 border-t border-[var(--border)]" />
          <div className="px-5 py-4 bg-[var(--fill)]/60">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[var(--text-secondary)]">
                {breakdown.quantity} ตัว &middot; ต้นทุนรวม
              </span>
              <span className="text-[15px] font-semibold tabular-nums">
                {fmt(breakdown.totalCost)} ฿
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[14px] text-[var(--text-secondary)]">
                {breakdown.quantity} ตัว &middot; ราคาขายรวม
              </span>
              <span className="text-[17px] font-bold tabular-nums text-[var(--accent)]">
                {fmt(breakdown.totalSellingPrice)} ฿
              </span>
            </div>
          </div>
        </>
      )}

      {hasAnySide && (
        <details className="group">
          <summary className="px-5 py-3 border-t border-[var(--border)] text-[13px] text-[var(--accent)] cursor-pointer hover:bg-[var(--card-hover)] transition-colors list-none flex items-center justify-between">
            <span>รายละเอียดการคำนวณ</span>
            <ChevronDownIcon className="w-3 h-3 text-[var(--text-tertiary)] transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-4">
            <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 mt-2">
              ค่าสกรีนแต่ละตำแหน่ง
            </p>
            {SIDE_KEYS.map(({ id }) => (
              <SideCalc
                key={id}
                label={SIDE_DETAIL_LABELS[id]}
                side={breakdown.sides[id]}
                config={config}
              />
            ))}
            <CalculationSummary breakdown={breakdown} config={config} />
          </div>
        </details>
      )}
    </CardSurface>
  );
}
