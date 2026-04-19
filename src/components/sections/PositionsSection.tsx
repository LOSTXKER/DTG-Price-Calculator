import { type CostBreakdown, SIDE_KEYS, type SideId } from "@/lib/calculator";
import type { PricingConfig } from "@/lib/pricing";
import { type SideState, type SideStates } from "@/lib/state";
import { Section } from "@/components/ui/Card";
import { NumInput } from "@/components/ui/NumInput";
import { SizeSelect } from "@/components/ui/SizeSelect";
import { CheckIcon, CloseIcon } from "@/components/icons";

const ccInputClass =
  "rounded-xl bg-[var(--fill)] px-3 py-2.5 text-[14px] tabular-nums transition-shadow focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)] outline-none w-full";

function PositionChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all ${
        active
          ? "bg-[var(--accent)] text-white shadow-[0_1px_3px_rgba(0,113,227,0.3)]"
          : "bg-[var(--fill)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)]"
      }`}
    >
      {active && <CheckIcon width="11" height="11" stroke="white" />}
      {label}
    </button>
  );
}

function PositionRow({
  label,
  state,
  onChange,
  priceBadge,
  onRemove,
  paperSizes,
}: {
  label: string;
  state: SideState;
  onChange: (next: SideState) => void;
  priceBadge?: number;
  onRemove: () => void;
  paperSizes: PricingConfig["paperSizes"];
}) {
  const updateInput = (patch: Partial<SideState["input"]>) =>
    onChange({ ...state, input: { ...state.input, ...patch } });

  const setColorCC = (raw: string, num: number) =>
    onChange({ ...state, ccColorStr: raw, input: { ...state.input, colorCC: num } });

  const setWhiteCC = (raw: string, num: number) =>
    onChange({ ...state, ccWhiteStr: raw, input: { ...state.input, whiteCC: num } });

  return (
    <div className="rounded-xl bg-[var(--fill)]/50 p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[var(--text-secondary)]">{label}</span>
          {priceBadge != null && priceBadge > 0 && (
            <span className="text-[11px] tabular-nums text-[var(--text-tertiary)] bg-[var(--card)] rounded-full px-2 py-0.5">
              ≈ {priceBadge.toLocaleString("th-TH")} ฿
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] p-1 -m-1 transition-colors"
          aria-label="ลบตำแหน่งนี้"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <FieldGroup label="ขนาดลาย" hint="กระดาษ A หรือกำหนดเอง">
          <SizeSelect
            value={state.input.size}
            onChange={(v) => updateInput({ size: v })}
            paperSizes={paperSizes}
          />
        </FieldGroup>
        <FieldGroup label="หมึกสี" hint="หน่วย: CC (มิลลิลิตร)">
          <NumInputWithUnit
            value={state.ccColorStr}
            onValueChange={setColorCC}
            unit="CC"
            placeholder="0.00"
          />
        </FieldGroup>
        <FieldGroup label="หมึกขาว" hint="หน่วย: CC (มิลลิลิตร)">
          <NumInputWithUnit
            value={state.ccWhiteStr}
            onValueChange={setWhiteCC}
            unit="CC"
            placeholder="0.00"
          />
        </FieldGroup>
      </div>

      {state.input.size === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="กว้าง">
            <NumInputWithUnit
              value={state.input.customWidthInch?.toString() ?? ""}
              onValueChange={(_, num) => updateInput({ customWidthInch: num })}
              unit='นิ้ว'
              step={0.1}
              placeholder="0.0"
            />
          </FieldGroup>
          <FieldGroup label="ยาว">
            <NumInputWithUnit
              value={state.input.customHeightInch?.toString() ?? ""}
              onValueChange={(_, num) => updateInput({ customHeightInch: num })}
              unit='นิ้ว'
              step={0.1}
              placeholder="0.0"
            />
          </FieldGroup>
        </div>
      )}
    </div>
  );
}

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1 px-0.5">
        <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </span>
        {hint && (
          <span className="text-[10px] text-[var(--text-tertiary)] hidden sm:inline">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function NumInputWithUnit({
  value,
  onValueChange,
  unit,
  placeholder,
  step = 0.01,
}: {
  value: string;
  onValueChange: (raw: string, num: number) => void;
  unit: string;
  placeholder?: string;
  step?: number;
}) {
  return (
    <div className="relative">
      <NumInput
        value={value}
        onValueChange={onValueChange}
        min={0}
        step={step}
        placeholder={placeholder}
        className={`${ccInputClass} pr-10`}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[12px] font-medium text-[var(--text-tertiary)]">
        {unit}
      </span>
    </div>
  );
}

export default function PositionsSection({
  sideStates,
  onTogglePosition,
  onChangeSide,
  breakdown,
  config,
}: {
  sideStates: SideStates;
  onTogglePosition: (id: SideId) => void;
  onChangeSide: (id: SideId, next: SideState) => void;
  breakdown: CostBreakdown;
  config: PricingConfig;
}) {
  const enabledSides = SIDE_KEYS.filter((m) => sideStates[m.id].input.enabled);

  return (
    <Section
      num="2"
      title="ตำแหน่งที่ต้องการสกรีน"
      hint={enabledSides.length > 0 ? `${enabledSides.length} ตำแหน่ง` : undefined}
    >
      <div className="flex flex-wrap gap-2 mb-3">
        {SIDE_KEYS.map((m) => (
          <PositionChip
            key={m.id}
            label={m.label}
            active={sideStates[m.id].input.enabled}
            onClick={() => onTogglePosition(m.id)}
          />
        ))}
      </div>

      {enabledSides.length === 0 ? (
        <p className="text-[13px] text-[var(--text-tertiary)] py-2">
          เลือกตำแหน่งด้านบนเพื่อกรอกขนาดลายและ CC หมึก
        </p>
      ) : (
        <div className="space-y-2">
          {enabledSides.map((m) => (
            <PositionRow
              key={m.id}
              label={m.label}
              state={sideStates[m.id]}
              onChange={(next) => onChangeSide(m.id, next)}
              priceBadge={breakdown.sides[m.id]?.finalCost}
              onRemove={() => onTogglePosition(m.id)}
              paperSizes={config.paperSizes}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
