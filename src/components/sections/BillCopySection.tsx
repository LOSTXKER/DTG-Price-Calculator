"use client";

import { useMemo, useState } from "react";
import {
  SIDE_KEYS,
  type CostBreakdown,
  type SideId,
} from "@/lib/calculator";
import type { PricingConfig, PaperSizeConfig } from "@/lib/pricing";
import type { SideStates } from "@/lib/state";
import { Card } from "@/components/ui/Card";
import { CheckIcon } from "@/components/icons";

const POSITION_LABEL: Record<SideId, string> = {
  front: "หน้า",
  back: "หลัง",
  sleeveLeft: "แขนเสื้อ",
  sleeveRight: "แขนเสื้อ",
};

function fmtCC(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

function fmtBaht(n: number): string {
  return n.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtInch(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

function getSizeText(
  id: SideId,
  size: string,
  customW: number | undefined,
  customH: number | undefined,
  paperSizes: PaperSizeConfig[]
): string {
  if (size === "") return "—";

  let base = "";
  if (size === "custom") {
    const w = customW ?? 0;
    const h = customH ?? 0;
    base = w > 0 && h > 0 ? `${fmtInch(w)}×${fmtInch(h)} นิ้ว` : "กำหนดเอง";
  } else {
    const ps = paperSizes.find((p) => p.code === size);
    base = ps
      ? `${ps.code} ${fmtInch(ps.widthInch)}×${fmtInch(ps.heightInch)} นิ้ว`
      : size;
  }

  if (id === "sleeveLeft") return `${base} ซ้าย`;
  if (id === "sleeveRight") return `${base} ขวา`;
  return base;
}

interface BillRow {
  id: SideId;
  position: string;
  printSizeFull: string;
  sellingPrice: number;
}

export default function BillCopySection({
  sideStates,
  breakdown,
  config,
}: {
  sideStates: SideStates;
  breakdown: CostBreakdown;
  config: PricingConfig;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rows = useMemo<BillRow[]>(() => {
    const markupMul = 1 + config.markup;
    const discountMul =
      breakdown.volumeDiscount.rate > 0
        ? 1 - breakdown.volumeDiscount.rate
        : 1;

    return SIDE_KEYS.filter(({ id }) => sideStates[id].input.enabled).map(
      ({ id }) => {
        const s = sideStates[id].input;
        const sizeText = getSizeText(
          id,
          s.size,
          s.customWidthInch,
          s.customHeightInch,
          config.paperSizes
        );
        const ccText = `${fmtCC(s.colorCC)}/${fmtCC(s.whiteCC)} CC`;
        const sideCost = breakdown.sides[id]?.finalCost ?? 0;
        const sellingPrice = Math.ceil(sideCost * markupMul * discountMul);
        return {
          id,
          position: POSITION_LABEL[id],
          printSizeFull: `${sizeText} ${ccText}`,
          sellingPrice,
        };
      }
    );
  }, [sideStates, breakdown, config.paperSizes, config.markup]);

  if (rows.length === 0) return null;

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((c) => (c === key ? null : c)), 1200);
  };

  return (
    <Card padding="px-4 py-4">
      <header className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-[var(--text-primary)]">
          ข้อความสำหรับบิล
        </p>
        <p className="text-[11px] text-[var(--text-tertiary)]">
          คลิกเพื่อคัดลอก
        </p>
      </header>

      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.id}
            className="rounded-xl bg-[var(--fill)]/60 p-2.5 space-y-1.5"
          >
            <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              {r.position}
            </p>
            <CopyChip
              text={r.printSizeFull}
              copied={copiedKey === `${r.id}-size`}
              onClick={() => copy(r.printSizeFull, `${r.id}-size`)}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[var(--text-tertiary)]">
                ราคาสกรีน
              </span>
              <CopyChip
                text={fmtBaht(r.sellingPrice)}
                copied={copiedKey === `${r.id}-price`}
                onClick={() => copy(fmtBaht(r.sellingPrice), `${r.id}-price`)}
                compact
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10.5px] text-[var(--text-tertiary)] mt-2.5 leading-relaxed">
        ราคาสกรีน = ราคาขายของตำแหน่งนั้น (รวม markup
        {breakdown.volumeDiscount.rate > 0
          ? ` + ส่วนลด ${Math.round(breakdown.volumeDiscount.rate * 100)}%`
          : ""}
        แล้ว · ยังไม่รวม pre-treatment, โลโก้คอ)
      </p>
    </Card>
  );
}

function CopyChip({
  text,
  copied,
  onClick,
  compact,
}: {
  text: string;
  copied: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="คลิกเพื่อคัดลอก"
      className={`inline-flex items-center justify-between gap-2 rounded-lg text-[12.5px] font-medium tabular-nums transition-all max-w-full ${
        compact ? "px-2 py-0.5" : "w-full px-2.5 py-1.5"
      } ${
        copied
          ? "bg-[var(--green-bg)] text-[var(--green)]"
          : "bg-[var(--card)] text-[var(--text-primary)] hover:bg-[var(--card-hover)] shadow-[0_0_0_1px_var(--border)]"
      }`}
    >
      <span className="truncate">{text}</span>
      {copied ? (
        <CheckIcon width="11" height="11" stroke="currentColor" />
      ) : (
        <CopyIcon />
      )}
    </button>
  );
}

function CopyIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-60 shrink-0"
    >
      <rect
        x="4.5"
        y="4.5"
        width="9"
        height="9"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M11.5 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7.5a1 1 0 0 0 1 1h1"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  );
}
