"use client";

import { useMemo, useState } from "react";
import { calculate, type AddonsInput, type SideId } from "@/lib/calculator";
import type { PricingConfig } from "@/lib/pricing";
import {
  type GarmentColor,
  type SideState,
  type SideStates,
  initialSideStates,
  toCalculatorInput,
  SLEEVE_DEFAULT_SIZE,
} from "@/lib/state";
import { hasUserTouched, validateInputs } from "@/lib/validation";
import PriceSummary from "@/components/PriceSummary";
import PriceSummaryMobileBar from "@/components/PriceSummaryMobileBar";
import TopNav from "@/components/TopNav";
import GarmentColorSection from "@/components/sections/GarmentColorSection";
import PositionsSection from "@/components/sections/PositionsSection";
import AddonsSection from "@/components/sections/AddonsSection";
import BillCopySection from "@/components/sections/BillCopySection";

export default function HomeClient({ config }: { config: PricingConfig }) {
  const [garmentColor, setGarmentColor] = useState<GarmentColor>(null);
  const [sideStates, setSideStates] = useState<SideStates>(initialSideStates);
  const [addons, setAddons] = useState<AddonsInput>({ collarLogo: false });
  const [quantity, setQuantity] = useState(1);

  const togglePosition = (id: SideId) =>
    setSideStates((prev) => {
      const wasEnabled = prev[id].input.enabled;
      const nextEnabled = !wasEnabled;
      const isSleeve = id === "sleeveLeft" || id === "sleeveRight";
      const nextSize =
        nextEnabled && isSleeve && prev[id].input.size === ""
          ? SLEEVE_DEFAULT_SIZE
          : prev[id].input.size;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          input: { ...prev[id].input, enabled: nextEnabled, size: nextSize },
        },
      };
    });

  const updateSide = (id: SideId, next: SideState) =>
    setSideStates((prev) => ({ ...prev, [id]: next }));

  const input = useMemo(
    () => toCalculatorInput(garmentColor, sideStates, addons, quantity),
    [garmentColor, sideStates, addons, quantity]
  );

  const breakdown = useMemo(() => calculate(input, config), [input, config]);

  const hasTouched = hasUserTouched(garmentColor, sideStates, addons.collarLogo);
  const { isValid, missingFields } = validateInputs(garmentColor, sideStates, hasTouched);

  const handleReset = () => {
    setGarmentColor(null);
    setSideStates(initialSideStates);
    setAddons({ collarLogo: false });
    setQuantity(1);
  };

  return (
    <>
      <TopNav
        rightSlot={
          <button
            onClick={handleReset}
            className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors"
          >
            รีเซ็ต
          </button>
        }
      />

      <main className="max-w-6xl mx-auto px-5 py-5 pb-28 lg:pb-6">
        <div className="mb-5 flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 rounded-full px-2 py-0.5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                ใหม่
              </span>
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight leading-tight">
              สร้างรายการคำนวณราคา
            </h1>
            <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
              กรอกข้อมูล 3 ขั้นตอน · บันทึกพร้อมรหัสออเดอร์ เพื่อกลับมาดูย้อนหลังได้
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 min-w-0 space-y-3">
            <GarmentColorSection
              value={garmentColor}
              onChange={setGarmentColor}
              config={config}
            />

            <PositionsSection
              sideStates={sideStates}
              onTogglePosition={togglePosition}
              onChangeSide={updateSide}
              breakdown={breakdown}
              config={config}
            />

            <AddonsSection
              addons={addons}
              onAddons={setAddons}
              quantity={quantity}
              onQuantity={setQuantity}
              config={config}
            />
          </div>

          <div className="hidden lg:block lg:w-[360px] shrink-0">
            <div className="lg:sticky lg:top-20 space-y-3">
              <PriceSummary
                breakdown={breakdown}
                isValid={isValid}
                missingFields={missingFields}
                config={config}
                input={input}
              />
              {isValid && (
                <BillCopySection
                  sideStates={sideStates}
                  breakdown={breakdown}
                  config={config}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <PriceSummaryMobileBar
        breakdown={breakdown}
        isValid={isValid}
        missingFields={missingFields}
        config={config}
        input={input}
        sideStates={sideStates}
      />
    </>
  );
}
