"use client";

import { useState } from "react";
import { type CalculatorInput, type CostBreakdown } from "@/lib/calculator";
import type { PricingConfig } from "@/lib/pricing";
import type { SideStates } from "@/lib/state";
import PriceSummary from "@/components/PriceSummary";
import BillCopySection from "@/components/sections/BillCopySection";
import SaveQuoteButton from "@/app/_components/SaveQuoteButton";
import { CloseIcon } from "@/components/icons";

export default function PriceSummaryMobileBar({
  breakdown,
  isValid,
  missingFields,
  config,
  input,
  sideStates,
}: {
  breakdown: CostBreakdown;
  isValid: boolean;
  missingFields: string[];
  config: PricingConfig;
  input?: CalculatorInput;
  sideStates?: SideStates;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const hasDiscount = breakdown.volumeDiscount.rate > 0;
  const finalPrice = hasDiscount
    ? breakdown.discountedSellingPricePerPiece
    : breakdown.sellingPricePerPiece;

  return (
    <>
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--card)]/95 backdrop-blur-lg border-t border-[var(--border)] px-4 py-2.5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex-1 min-w-0 text-left"
        >
          <p className="text-[10.5px] text-[var(--text-tertiary)] uppercase tracking-wider leading-none">
            ราคาขาย / ตัว
          </p>
          <p className="text-[20px] font-bold tabular-nums leading-tight mt-0.5">
            {isValid ? finalPrice.toLocaleString("th-TH") : "—"}
            <span className="text-[13px] font-semibold text-[var(--text-tertiary)] ml-0.5">
              ฿
            </span>
            <span className="ml-2 text-[11px] text-[var(--accent)] font-medium">
              ดูสรุป →
            </span>
          </p>
        </button>

        {isValid && input ? (
          <SaveQuoteButton
            input={input}
            variant="mobile"
            pricePreview={{
              perPiece: finalPrice,
              quantity: breakdown.quantity,
              total: breakdown.totalSellingPrice,
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[var(--fill)] text-[var(--text-secondary)] text-[13px] font-medium shrink-0"
          >
            ดูรายละเอียด
          </button>
        )}
      </div>

      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />
          <div className="relative bg-[var(--card)] rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-4 pb-2 bg-[var(--card)] border-b border-[var(--border)]">
              <p className="text-[15px] font-semibold">สรุปราคา</p>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--fill)] flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--card-hover)] transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <PriceSummary
                breakdown={breakdown}
                isValid={isValid}
                missingFields={missingFields}
                config={config}
                input={input}
              />
              {isValid && sideStates && (
                <BillCopySection
                  sideStates={sideStates}
                  breakdown={breakdown}
                  config={config}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
