import { type AddonsInput } from "@/lib/calculator";
import type { PricingConfig } from "@/lib/pricing";
import { Section } from "@/components/ui/Card";
import { CheckIcon } from "@/components/icons";

function AddonRow({
  checked,
  onChange,
  label,
  detail,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between py-3"
    >
      <span className="text-[15px]">{label}</span>
      <div className="flex items-center gap-2.5">
        <span className="text-[13px] text-[var(--text-tertiary)]">{detail}</span>
        <div
          className={`w-[22px] h-[22px] rounded-md flex items-center justify-center transition-colors ${
            checked
              ? "bg-[var(--accent)]"
              : "bg-[var(--checkbox-off)] shadow-[inset_0_0_0_1.5px_var(--checkbox-off-border)]"
          }`}
        >
          {checked && <CheckIcon stroke="white" />}
        </div>
      </div>
    </button>
  );
}

function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-9 h-9 rounded-l-xl bg-[var(--fill)] text-[var(--text-secondary)] text-lg font-medium hover:bg-[var(--qty-hover)] transition-colors flex items-center justify-center active:bg-[var(--qty-active)]"
      >
        −
      </button>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
        className="w-14 h-9 text-center bg-[var(--fill)] text-[15px] tabular-nums border-x border-[var(--qty-border)] outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 rounded-r-xl bg-[var(--fill)] text-[var(--text-secondary)] text-lg font-medium hover:bg-[var(--qty-hover)] transition-colors flex items-center justify-center active:bg-[var(--qty-active)]"
      >
        +
      </button>
    </div>
  );
}

export default function AddonsSection({
  addons,
  onAddons,
  quantity,
  onQuantity,
  config,
}: {
  addons: AddonsInput;
  onAddons: (next: AddonsInput) => void;
  quantity: number;
  onQuantity: (n: number) => void;
  config: PricingConfig;
}) {
  const collarLogo = config.addons.find((a) => a.code === "collarLogo");

  return (
    <Section num="3" title="Add-on และจำนวน">
      {collarLogo?.enabled && (
        <AddonRow
          checked={addons.collarLogo}
          onChange={(v) => onAddons({ ...addons, collarLogo: v })}
          label={collarLogo.label}
          detail={`+${collarLogo.cost} ฿`}
        />
      )}

      <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-[14px] font-medium text-[var(--text-secondary)]">จำนวน</span>
        <QuantityStepper value={quantity} onChange={onQuantity} />
      </div>
    </Section>
  );
}
