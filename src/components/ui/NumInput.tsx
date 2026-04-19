export const numInputBaseClass =
  "w-full rounded-xl bg-[var(--fill)] px-3 py-2.5 text-[14px] tabular-nums transition-shadow focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)] outline-none";

export function NumInput({
  value,
  onValueChange,
  min,
  step,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (raw: string, num: number) => void;
  min?: number;
  step?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      min={min}
      step={step}
      value={value}
      onChange={(e) => {
        const raw = e.target.value;
        const num = parseFloat(raw);
        onValueChange(raw, isNaN(num) ? 0 : Math.max(0, num));
      }}
      className={className ?? numInputBaseClass}
      placeholder={placeholder}
    />
  );
}
