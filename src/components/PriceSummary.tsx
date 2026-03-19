"use client";

import { type CostBreakdown } from "@/lib/calculator";

interface PriceSummaryProps {
  breakdown: CostBreakdown;
}

function formatBaht(amount: number): string {
  return amount.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function LineItem({ label, value, highlight, negative }: {
  label: string;
  value: number;
  highlight?: boolean;
  negative?: boolean;
}) {
  if (value === 0) return null;
  return (
    <div className={`flex justify-between items-center py-1.5 ${highlight ? "font-semibold" : ""}`}>
      <span className="text-slate-600 text-sm">{label}</span>
      <span className={`text-sm font-medium tabular-nums ${negative ? "text-green-600" : "text-slate-800"}`}>
        {negative ? "-" : ""}{formatBaht(Math.abs(value))} ฿
      </span>
    </div>
  );
}

function SideDetail({ label, side }: { label: string; side: CostBreakdown["front"] }) {
  if (!side) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <div className="pl-3 border-l-2 border-slate-200 space-y-0.5">
        <div className="flex justify-between text-xs text-slate-500">
          <span>CC สี: {side.colorCCRounded} + CC ขาว: {side.whiteCCRounded} = {side.totalCC} CC</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{side.totalCC} CC × 13 = {formatBaht(side.ccBasedCost)} ฿</span>
        </div>
        {side.isSmallDesign && (
          <div className="flex justify-between text-xs text-amber-600">
            <span>ลายเล็ก ≤ 5 นิ้ว → คิด flat 40 ฿ (ไม่ใช้ CC)</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-medium text-slate-700">
          <span>รวม</span>
          <span>{formatBaht(side.finalCost)} ฿</span>
        </div>
      </div>
    </div>
  );
}

export default function PriceSummary({ breakdown }: PriceSummaryProps) {
  const hasAnySide = breakdown.front || breakdown.back;

  if (!hasAnySide) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
        <div className="text-4xl mb-3">🖨️</div>
        <p className="text-slate-500 text-sm">เปิดด้านหน้าหรือด้านหลังเพื่อเริ่มคำนวณ</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <h3 className="font-semibold text-white text-lg">สรุปราคา</h3>
      </div>

      <div className="p-5 space-y-4">
        <SideDetail label="ด้านหน้า" side={breakdown.front} />
        <SideDetail label="ด้านหลัง" side={breakdown.back} />

        <div className="border-t border-slate-100 pt-3 space-y-0.5">
          <LineItem label="ต้นทุนสกรีนหน้า" value={breakdown.front?.finalCost ?? 0} />
          <LineItem label="ต้นทุนสกรีนหลัง" value={breakdown.back?.finalCost ?? 0} />
          <LineItem label="น้ำยา Pre-treatment" value={breakdown.pretreatment} />
          <LineItem label="โลโก้คอ" value={breakdown.collarLogo} />
          <LineItem label="สกรีนแขนซ้าย" value={breakdown.sleeveLeft} />
          <LineItem label="สกรีนแขนขวา" value={breakdown.sleeveRight} />
          {breakdown.whiteGarmentDiscount > 0 && (
            <LineItem label="ส่วนลดเสื้อขาว" value={breakdown.whiteGarmentDiscount} negative />
          )}
        </div>

        <div className="border-t-2 border-slate-200 pt-3">
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-700 font-semibold">ต้นทุน/ตัว</span>
            <span className="text-lg font-bold text-slate-800 tabular-nums">
              {formatBaht(breakdown.totalCostPerPiece)} ฿
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-blue-700 font-semibold">
              ราคาขาย/ตัว <span className="text-xs font-normal text-blue-500">(+35%)</span>
            </span>
            {breakdown.volumeDiscount.rate > 0 ? (
              <span className="text-sm text-slate-400 line-through tabular-nums">
                {formatBaht(breakdown.sellingPricePerPiece)} ฿
              </span>
            ) : (
              <span className="text-xl font-bold text-blue-700 tabular-nums">
                {formatBaht(breakdown.sellingPricePerPiece)} ฿
              </span>
            )}
          </div>
          {breakdown.volumeDiscount.rate > 0 && (
            <div className="flex justify-between items-center py-1">
              <span className="text-green-700 font-semibold">
                หลังลด <span className="text-xs font-normal text-green-500">(-{breakdown.volumeDiscount.rate * 100}%)</span>
              </span>
              <span className="text-xl font-bold text-green-700 tabular-nums">
                {formatBaht(breakdown.discountedSellingPricePerPiece)} ฿
              </span>
            </div>
          )}
        </div>

        {breakdown.volumeDiscount.rate > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
            <p className="text-sm text-green-700 font-medium">
              Promotion: {breakdown.volumeDiscount.label}
            </p>
            <p className="text-xs text-green-600 mt-0.5">ลดเฉพาะค่าสกรีน แบบเดียวกัน</p>
          </div>
        )}

        {breakdown.quantity > 1 && (
          <div className="bg-blue-50 rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
              {breakdown.quantity} ตัว
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">ต้นทุนรวม</span>
              <span className="font-bold text-slate-800 tabular-nums">
                {formatBaht(breakdown.totalCost)} ฿
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700 font-medium">ราคาขายรวม</span>
              <span className="text-lg font-bold text-blue-700 tabular-nums">
                {formatBaht(breakdown.totalSellingPrice)} ฿
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
