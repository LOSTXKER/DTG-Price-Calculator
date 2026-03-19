"use client";

import { type AddonsInput } from "@/lib/calculator";

interface AddonsFormProps {
  isWhiteGarment: boolean;
  onWhiteGarmentChange: (value: boolean) => void;
  value: AddonsInput;
  onChange: (value: AddonsInput) => void;
  quantity: number;
  onQuantityChange: (value: number) => void;
}

export default function AddonsForm({
  isWhiteGarment,
  onWhiteGarmentChange,
  value,
  onChange,
  quantity,
  onQuantityChange,
}: AddonsFormProps) {
  const update = (patch: Partial<AddonsInput>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-700 text-lg">ตัวเลือกเพิ่มเติม</h3>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">สีเสื้อ</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onWhiteGarmentChange(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition ${
                isWhiteGarment
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="inline-block w-4 h-4 rounded-full border-2 border-slate-300 bg-white mr-2 align-middle" />
              เสื้อขาว
            </button>
            <button
              type="button"
              onClick={() => onWhiteGarmentChange(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition ${
                !isWhiteGarment
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="inline-block w-4 h-4 rounded-full border-2 border-slate-400 bg-slate-700 mr-2 align-middle" />
              เสื้อสี / เสื้อดำ
            </button>
          </div>
          {isWhiteGarment && (
            <p className="mt-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-1.5">
              ส่วนลดเสื้อขาว: -40 บาท/ตัว
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">Add-ons</label>
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={value.collarLogo}
                onChange={(e) => update({ collarLogo: e.target.checked })}
                className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">
                โลโก้คอ <span className="text-slate-400">(+30 บาท)</span>
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={value.sleeveLeft}
                onChange={(e) => update({ sleeveLeft: e.target.checked })}
                className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">
                สกรีนแขนซ้าย <span className="text-slate-400">(+70 บาท)</span>
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={value.sleeveRight}
                onChange={(e) => update({ sleeveRight: e.target.checked })}
                className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">
                สกรีนแขนขวา <span className="text-slate-400">(+70 บาท)</span>
              </span>
            </label>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <label className="block text-sm font-medium text-slate-600 mb-1.5">จำนวน (ตัว)</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-600 text-lg font-bold hover:bg-slate-50 transition flex items-center justify-center"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-600 text-lg font-bold hover:bg-slate-50 transition flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
