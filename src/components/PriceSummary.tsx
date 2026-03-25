"use client";

import { type CostBreakdown } from "@/lib/calculator";

interface PriceSummaryProps {
  breakdown: CostBreakdown;
  isValid: boolean;
  missingFields: string[];
}

function fmt(amount: number): string {
  return amount.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function Row({ label, value, negative }: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  if (value === 0) return null;
  return (
    <div className="flex justify-between items-center py-[5px]">
      <span className="text-[14px] text-[var(--text-secondary)]">{label}</span>
      <span className={`text-[14px] font-medium tabular-nums ${negative ? "text-[var(--green)]" : ""}`}>
        {negative ? "−" : ""}{fmt(Math.abs(value))}
      </span>
    </div>
  );
}

function SideCalc({ label, side }: { label: string; side: CostBreakdown["front"] }) {
  if (!side) return null;
  return (
    <div className="py-2">
      <p className="text-[12px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1">{label}</p>
      <div className="space-y-0.5 text-[12px] text-[var(--text-tertiary)]">
        <p>CC {side.colorCCRounded} + {side.whiteCCRounded} = {side.totalCC}</p>
        {side.isSmallDesign ? (
          <p className="text-[var(--orange)]">≤ 5&quot; → flat 40 ฿</p>
        ) : (
          <p>{side.totalCC} × 13 = {fmt(side.ccBasedCost)} ฿</p>
        )}
      </div>
    </div>
  );
}

export default function PriceSummary({ breakdown, isValid, missingFields }: PriceSummaryProps) {
  if (!isValid) {
    const hasMissing = missingFields.length > 0;
    return (
      <div className="rounded-2xl bg-[var(--card)] shadow-[0_0_0_1px_var(--border),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 pt-6 pb-5 text-center">
          <p className="text-[12px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
            ราคาขาย / ตัว
          </p>
          <p className="text-[42px] font-bold tracking-tight leading-none text-[var(--text-tertiary)]">
            — <span className="text-[20px]">฿</span>
          </p>
          <p className="mt-3 text-[13px] text-[var(--text-tertiary)]">
            {hasMissing ? "กรอกข้อมูลให้ครบเพื่อคำนวณ" : "เลือกสีเสื้อ แล้วกรอก CC หมึก"}
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
      </div>
    );
  }

  const hasDiscount = breakdown.volumeDiscount.rate > 0;
  const finalPrice = hasDiscount ? breakdown.discountedSellingPricePerPiece : breakdown.sellingPricePerPiece;

  return (
    <div className="rounded-2xl bg-[var(--card)] shadow-[0_0_0_1px_var(--border),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-5 pt-6 pb-5 text-center">
        <p className="text-[12px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
          ราคาขาย / ตัว
        </p>
        <p className="text-[42px] font-bold tracking-tight leading-none tabular-nums">
          {fmt(finalPrice)}
          <span className="text-[20px] font-semibold text-[var(--text-tertiary)] ml-1">฿</span>
        </p>
        {hasDiscount && (
          <p className="mt-1.5 text-[13px] text-[var(--text-tertiary)]">
            <span className="line-through">{fmt(breakdown.sellingPricePerPiece)} ฿</span>
            <span className="ml-2 text-[var(--green)] font-medium">−{breakdown.volumeDiscount.rate * 100}%</span>
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
        <Row label="สกรีนหน้า" value={breakdown.front?.finalCost ?? 0} />
        <Row label="สกรีนหลัง" value={breakdown.back?.finalCost ?? 0} />
        <Row label="Pre-treatment" value={breakdown.pretreatment} />
        <Row label="โลโก้คอ" value={breakdown.collarLogo} />
        <Row label="แขนซ้าย" value={breakdown.sleeveLeft} />
        <Row label="แขนขวา" value={breakdown.sleeveRight} />
        {breakdown.whiteGarmentDiscount > 0 && (
          <Row label="ส่วนลดเสื้อขาว" value={breakdown.whiteGarmentDiscount} negative />
        )}
      </div>

      <div className="mx-5 border-t border-[var(--border)]" />

      <div className="px-5 py-3">
        <div className="flex justify-between items-center py-[5px]">
          <span className="text-[14px] text-[var(--text-secondary)]">ต้นทุน / ตัว</span>
          <span className="text-[15px] font-semibold tabular-nums">{fmt(breakdown.totalCostPerPiece)} ฿</span>
        </div>
        <div className="flex justify-between items-center py-[5px]">
          <span className="text-[14px] text-[var(--text-secondary)]">
            ราคาขาย <span className="text-[var(--text-tertiary)]">+35%</span>
          </span>
          <span className="text-[15px] font-semibold tabular-nums text-[var(--accent)]">{fmt(breakdown.sellingPricePerPiece)} ฿</span>
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
              <span className="text-[15px] font-semibold tabular-nums">{fmt(breakdown.totalCost)} ฿</span>
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

      {(breakdown.front || breakdown.back) && (
        <details className="group">
          <summary className="px-5 py-3 border-t border-[var(--border)] text-[13px] text-[var(--accent)] cursor-pointer hover:bg-[var(--card-hover)] transition-colors list-none flex items-center justify-between">
            <span>รายละเอียดการคำนวณ</span>
            <svg className="w-3 h-3 text-[var(--text-tertiary)] transition-transform group-open:rotate-180" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </summary>
          <div className="px-5 pb-4">
            <SideCalc label="ด้านหน้า" side={breakdown.front} />
            <SideCalc label="ด้านหลัง" side={breakdown.back} />
          </div>
        </details>
      )}
    </div>
  );
}
