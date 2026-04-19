"use client";

import { useMemo, useState } from "react";
import {
  SIDE_KEYS,
  type CostBreakdown,
  type SideId,
} from "@/lib/calculator";
import type { PricingConfig, PaperSizeConfig } from "@/lib/pricing";
import type { SideStates } from "@/lib/state";
import { Section } from "@/components/ui/Card";
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
  sizeText: string;
  ccText: string;
  printSizeFull: string;
  cost: number;
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
        return {
          id,
          position: POSITION_LABEL[id],
          sizeText,
          ccText,
          printSizeFull: `${sizeText} ${ccText}`,
          cost: breakdown.sides[id]?.finalCost ?? 0,
        };
      }
    );
  }, [sideStates, breakdown, config.paperSizes]);

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

  const copyAllAsTSV = () => {
    const header = ["ตำแหน่ง", "ขนาดพิมพ์", "ค่าสกรีน (ต่อหน่วย)"].join("\t");
    const body = rows
      .map((r) => [r.position, r.printSizeFull, fmtBaht(r.cost)].join("\t"))
      .join("\n");
    copy(`${header}\n${body}`, "__all");
  };

  return (
    <Section
      num="4"
      title="ข้อความสำหรับบิล"
      hint="คลิกขนาดพิมพ์ / ค่าสกรีน เพื่อคัดลอก"
    >
      <div className="space-y-3">
        {/* Desktop / tablet table */}
        <div className="hidden sm:block overflow-x-auto -mx-1 px-1">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                <th className="text-left pb-2 pr-3 font-semibold">ตำแหน่ง</th>
                <th className="text-left pb-2 pr-3 font-semibold">ขนาดพิมพ์</th>
                <th className="text-right pb-2 pl-3 font-semibold">
                  ค่าสกรีน (ต่อหน่วย)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-[var(--border)] align-middle"
                >
                  <td className="py-2 pr-3">
                    <span className="text-[13px] text-[var(--text-primary)]">
                      {r.position}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <CopyChip
                      text={r.printSizeFull}
                      copied={copiedKey === `${r.id}-size`}
                      onClick={() => copy(r.printSizeFull, `${r.id}-size`)}
                      mono
                    />
                  </td>
                  <td className="py-2 pl-3 text-right">
                    <CopyChip
                      text={fmtBaht(r.cost)}
                      copied={copiedKey === `${r.id}-cost`}
                      onClick={() => copy(fmtBaht(r.cost), `${r.id}-cost`)}
                      mono
                      align="right"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked */}
        <div className="sm:hidden space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-xl bg-[var(--fill)]/50 p-3 space-y-1.5"
            >
              <MobileFieldStatic label="ตำแหน่ง" value={r.position} />
              <MobileFieldCopy
                label="ขนาดพิมพ์"
                value={r.printSizeFull}
                copied={copiedKey === `${r.id}-size`}
                onClick={() => copy(r.printSizeFull, `${r.id}-size`)}
              />
              <MobileFieldCopy
                label="ค่าสกรีน (ต่อหน่วย)"
                value={fmtBaht(r.cost)}
                copied={copiedKey === `${r.id}-cost`}
                onClick={() => copy(fmtBaht(r.cost), `${r.id}-cost`)}
              />
            </div>
          ))}
        </div>

        <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-[var(--text-tertiary)]">
            ค่าสกรีน = ต้นทุนสกรีนของตำแหน่งนั้น (ก่อน pre-treatment, markup)
          </p>
          <button
            type="button"
            onClick={copyAllAsTSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-[13px] font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            {copiedKey === "__all" ? (
              <>
                <CheckIcon stroke="white" />
                คัดลอกทั้งตารางแล้ว
              </>
            ) : (
              "คัดลอกทั้งตาราง (วางใน Excel ได้)"
            )}
          </button>
        </div>
      </div>
    </Section>
  );
}

function CopyChip({
  text,
  copied,
  onClick,
  mono,
  align = "left",
}: {
  text: string;
  copied: boolean;
  onClick: () => void;
  mono?: boolean;
  align?: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="คลิกเพื่อคัดลอก"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium transition-all max-w-full ${
        copied
          ? "bg-[var(--green-bg)] text-[var(--green)]"
          : "bg-[var(--fill)] text-[var(--text-primary)] hover:bg-[var(--card-hover)]"
      } ${mono ? "tabular-nums" : ""} ${align === "right" ? "ml-auto" : ""}`}
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

function MobileFieldCopy({
  label,
  value,
  copied,
  onClick,
}: {
  label: string;
  value: string;
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-[var(--text-tertiary)] shrink-0">
        {label}
      </span>
      <CopyChip text={value} copied={copied} onClick={onClick} mono />
    </div>
  );
}

function MobileFieldStatic({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-[var(--text-tertiary)] shrink-0">
        {label}
      </span>
      <span className="text-[13px] text-[var(--text-primary)]">{value}</span>
    </div>
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
      className="opacity-60"
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
