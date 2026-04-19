import type { PaperSize } from "@/lib/calculator";
import type { PaperSizeConfig } from "@/lib/pricing";
import { ChevronDownIcon } from "@/components/icons";

export function SizeSelect({
  value,
  onChange,
  paperSizes,
}: {
  value: PaperSize;
  onChange: (v: PaperSize) => void;
  paperSizes: PaperSizeConfig[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PaperSize)}
        className="w-full appearance-none rounded-xl bg-[var(--fill)] px-3 py-2.5 text-[14px] transition-shadow focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)] outline-none"
      >
        <option value="">— ขนาดลาย —</option>
        {paperSizes.map((p) => (
          <option key={p.code} value={p.code}>
            {p.label}
          </option>
        ))}
        <option value="custom">กำหนดเอง</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[var(--text-tertiary)]">
        <ChevronDownIcon />
      </div>
    </div>
  );
}
