"use client";

import { useState, useMemo } from "react";
import { type PrintSideInput, type AddonsInput, type CalculatorInput, calculate } from "@/lib/calculator";
import PrintSideForm from "@/components/PrintSideForm";
import AddonsForm from "@/components/AddonsForm";
import PriceSummary from "@/components/PriceSummary";

const defaultSide: PrintSideInput = {
  enabled: false,
  colorCC: 0,
  whiteCC: 0,
  size: "A4",
  customWidthInch: 0,
  customHeightInch: 0,
};

const defaultAddons: AddonsInput = {
  collarLogo: false,
  sleeveLeft: false,
  sleeveRight: false,
};

export default function Home() {
  const [isWhiteGarment, setIsWhiteGarment] = useState(false);
  const [front, setFront] = useState<PrintSideInput>({ ...defaultSide, enabled: true });
  const [back, setBack] = useState<PrintSideInput>(defaultSide);
  const [addons, setAddons] = useState<AddonsInput>(defaultAddons);
  const [quantity, setQuantity] = useState(1);

  const input: CalculatorInput = useMemo(
    () => ({ isWhiteGarment, front, back, addons, quantity }),
    [isWhiteGarment, front, back, addons, quantity]
  );

  const breakdown = useMemo(() => calculate(input), [input]);

  const handleReset = () => {
    setIsWhiteGarment(false);
    setFront({ ...defaultSide, enabled: true });
    setBack(defaultSide);
    setAddons(defaultAddons);
    setQuantity(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">DTG Price Calculator</h1>
              <p className="text-blue-200 text-sm mt-0.5">Brother GTX Pro Bulk</p>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-blue-200 hover:text-white border border-blue-500 hover:border-blue-300 rounded-lg px-3 py-1.5 transition"
            >
              รีเซ็ต
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            <PrintSideForm label="ด้านหน้า" value={front} onChange={setFront} />
            <PrintSideForm label="ด้านหลัง" value={back} onChange={setBack} />
            <AddonsForm
              isWhiteGarment={isWhiteGarment}
              onWhiteGarmentChange={setIsWhiteGarment}
              value={addons}
              onChange={setAddons}
              quantity={quantity}
              onQuantityChange={setQuantity}
            />
          </div>

          <div className="lg:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-6">
              <PriceSummary breakdown={breakdown} />
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-slate-400">
        DTG Price Calculator &middot; สูตร: CC × 13 ฿ + Markup 35%
      </footer>
    </div>
  );
}
