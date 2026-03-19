"use client";

import { type PaperSize, type PrintSideInput, PAPER_SIZES } from "@/lib/calculator";

interface PrintSideFormProps {
  label: string;
  value: PrintSideInput;
  onChange: (value: PrintSideInput) => void;
}

export default function PrintSideForm({ label, value, onChange }: PrintSideFormProps) {
  const update = (patch: Partial<PrintSideInput>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-700 text-lg">{label}</h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          <span className="ms-2 text-sm text-slate-600">{value.enabled ? "เปิด" : "ปิด"}</span>
        </label>
      </div>

      {value.enabled && (
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">ขนาดลาย</label>
            <select
              value={value.size}
              onChange={(e) => update({ size: e.target.value as PaperSize })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            >
              {(Object.keys(PAPER_SIZES) as Array<Exclude<PaperSize, "custom">>).map((key) => (
                <option key={key} value={key}>
                  {PAPER_SIZES[key].label}
                </option>
              ))}
              <option value="custom">กำหนดเอง</option>
            </select>
          </div>

          {value.size === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  กว้าง (นิ้ว)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={value.customWidthInch ?? ""}
                  onChange={(e) => update({ customWidthInch: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  placeholder="เช่น 8.3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  ยาว (นิ้ว)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={value.customHeightInch ?? ""}
                  onChange={(e) => update({ customHeightInch: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  placeholder="เช่น 11.7"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                CC หมึกสี
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={value.colorCC || ""}
                onChange={(e) => update({ colorCC: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                CC หมึกขาว
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={value.whiteCC || ""}
                onChange={(e) => update({ whiteCC: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
