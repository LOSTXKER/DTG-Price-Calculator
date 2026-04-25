import type { PricingConfig } from "@/lib/pricing";

export type PaperSize = "" | "custom" | string;

export type SideId = "front" | "back" | "sleeveLeft" | "sleeveRight";

export interface SideMeta {
  id: SideId;
  label: string;
  allowSmallFlat: boolean;
}

export const SIDE_KEYS: SideMeta[] = [
  { id: "front", label: "หน้า", allowSmallFlat: true },
  { id: "back", label: "หลัง", allowSmallFlat: true },
  { id: "sleeveLeft", label: "แขนซ้าย", allowSmallFlat: false },
  { id: "sleeveRight", label: "แขนขวา", allowSmallFlat: false },
];

export interface PrintSideInput {
  enabled: boolean;
  colorCC: number;
  whiteCC: number;
  size: PaperSize;
  customWidthInch?: number;
  customHeightInch?: number;
}

export interface AddonsInput {
  collarLogo: boolean;
}

export interface CalculatorInput {
  isWhiteGarment: boolean;
  sides: Record<SideId, PrintSideInput>;
  addons: AddonsInput;
  quantity: number;
}

export interface SideCostBreakdown {
  colorCCRounded: number;
  whiteCCRounded: number;
  totalCC: number;
  ccBasedCost: number;
  isSmallDesign: boolean;
  finalCost: number;
}

export interface VolumeDiscount {
  rate: number;
  label: string;
}

export interface CostBreakdown {
  sides: Record<SideId, SideCostBreakdown | null>;
  pretreatment: number;
  collarLogo: number;
  whiteGarmentDiscount: number;
  totalCostPerPiece: number;
  sellingPriceBeforeMin: number;
  minSellingPrice: number;
  appliedMinSelling: boolean;
  sellingPricePerPiece: number;
  volumeDiscount: VolumeDiscount;
  discountedSellingPricePerPiece: number;
  quantity: number;
  totalCost: number;
  totalSellingPrice: number;
}

function getVolumeDiscount(
  quantity: number,
  config: PricingConfig
): VolumeDiscount {
  const sorted = [...config.volumeTiers].sort((a, b) => b.minQty - a.minQty);
  for (const tier of sorted) {
    if (quantity >= tier.minQty) {
      return { rate: tier.rate, label: tier.label };
    }
  }
  return { rate: 0, label: "" };
}

export function getMaxDimensionInch(
  side: PrintSideInput,
  config: PricingConfig
): number {
  if (side.size === "") return 0;
  if (side.size === "custom") {
    return Math.max(side.customWidthInch ?? 0, side.customHeightInch ?? 0);
  }
  const info = config.paperSizes.find((p) => p.code === side.size);
  if (!info) return 0;
  return Math.max(info.widthInch, info.heightInch);
}

function getMinSellingPrice(
  sides: Record<SideId, PrintSideInput>,
  config: PricingConfig
): number {
  let maxInch = 0;
  for (const { id } of SIDE_KEYS) {
    const s = sides[id];
    if (s.enabled) maxInch = Math.max(maxInch, getMaxDimensionInch(s, config));
  }
  if (maxInch === 0) return 0;
  return maxInch > config.largeSizeThreshold
    ? config.minSellingLarge
    : config.minSellingSmall;
}

function calculateSideCost(
  side: PrintSideInput,
  allowSmallFlat: boolean,
  config: PricingConfig
): SideCostBreakdown {
  const colorCCRounded = Math.ceil(side.colorCC);
  const whiteCCRounded = Math.ceil(side.whiteCC);
  const totalCC = colorCCRounded + whiteCCRounded;
  const ccBasedCost = totalCC * config.costPerCc;

  const maxInch = getMaxDimensionInch(side, config);
  const isSmall =
    allowSmallFlat && maxInch > 0 && maxInch <= config.maxInchForMinimum;
  const finalCost = isSmall ? config.smallDesignFlatCost : ccBasedCost;

  return {
    colorCCRounded,
    whiteCCRounded,
    totalCC,
    ccBasedCost,
    isSmallDesign: isSmall,
    finalCost,
  };
}

export function calculate(
  input: CalculatorInput,
  config: PricingConfig
): CostBreakdown {
  const sides = Object.fromEntries(
    SIDE_KEYS.map(({ id, allowSmallFlat }) => [
      id,
      input.sides[id].enabled
        ? calculateSideCost(input.sides[id], allowSmallFlat, config)
        : null,
    ])
  ) as Record<SideId, SideCostBreakdown | null>;

  const enabledCount = SIDE_KEYS.filter(({ id }) => sides[id] !== null).length;
  let pretreatment = 0;
  if (enabledCount >= 2) pretreatment = config.pretreatmentMultiPosition;
  else if (enabledCount === 1) pretreatment = config.pretreatmentOnePosition;

  const collarLogoAddon = config.addons.find((a) => a.code === "collarLogo");
  const collarLogoCost = collarLogoAddon?.enabled ? collarLogoAddon.cost : 0;
  const collarLogo = input.addons.collarLogo ? collarLogoCost : 0;

  const whiteGarmentDiscount = input.isWhiteGarment
    ? config.whiteGarmentDiscount
    : 0;

  const sidesCost = SIDE_KEYS.reduce(
    (sum, { id }) => sum + (sides[id]?.finalCost ?? 0),
    0
  );

  const totalCostPerPiece =
    sidesCost + pretreatment + collarLogo - whiteGarmentDiscount;

  const sellingPriceBeforeMin = Math.ceil((totalCostPerPiece * (1 + config.markup)) / 10) * 10;

  const minSellingPrice = getMinSellingPrice(input.sides, config);
  const appliedMinSelling = sellingPriceBeforeMin < minSellingPrice;
  const sellingPricePerPiece = Math.max(sellingPriceBeforeMin, minSellingPrice);

  const quantity = Math.max(1, input.quantity);
  const volumeDiscount = getVolumeDiscount(quantity, config);
  const discountedSellingPricePerPiece =
    volumeDiscount.rate > 0
      ? Math.ceil((sellingPricePerPiece * (1 - volumeDiscount.rate)) / 10) * 10
      : sellingPricePerPiece;

  return {
    sides,
    pretreatment,
    collarLogo,
    whiteGarmentDiscount,
    totalCostPerPiece,
    sellingPriceBeforeMin,
    minSellingPrice,
    appliedMinSelling,
    sellingPricePerPiece,
    quantity,
    totalCost: totalCostPerPiece * quantity,
    volumeDiscount,
    discountedSellingPricePerPiece,
    totalSellingPrice: discountedSellingPricePerPiece * quantity,
  };
}
