import { Section } from "@/components/ui/Card";
import { type GarmentColor } from "@/lib/state";
import type { PricingConfig } from "@/lib/pricing";

function ColorPill({
  active,
  onClick,
  swatch,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  swatch: string;
  label: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
        active
          ? "bg-[var(--seg-active)] shadow-[0_0_0_1.5px_var(--accent),0_1px_3px_var(--seg-active-shadow)]"
          : "bg-[var(--fill)] hover:bg-[var(--card-hover)]"
      }`}
    >
      <span
        className="w-5 h-5 rounded-full shrink-0"
        style={{ background: swatch, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)" }}
      />
      <div className="text-left min-w-0">
        <p className="text-[14px] font-medium leading-tight">{label}</p>
        {desc && (
          <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5">{desc}</p>
        )}
      </div>
    </button>
  );
}

export default function GarmentColorSection({
  value,
  onChange,
  config,
}: {
  value: GarmentColor;
  onChange: (v: GarmentColor) => void;
  config: PricingConfig;
}) {
  return (
    <Section
      num="1"
      title="เลือกสีเสื้อ"
      hint={
        value === "white"
          ? `ส่วนลด −${config.whiteGarmentDiscount} ฿`
          : undefined
      }
    >
      <div className="flex gap-2">
        <ColorPill
          active={value === "white"}
          onClick={() => onChange("white")}
          swatch="#ffffff"
          label="เสื้อขาว"
          desc="ไม่ใช้หมึกขาว"
        />
        <ColorPill
          active={value === "dark"}
          onClick={() => onChange("dark")}
          swatch="#1c1c1e"
          label="เสื้อสี / ดำ"
          desc="ต้อง pretreatment"
        />
      </div>
    </Section>
  );
}
