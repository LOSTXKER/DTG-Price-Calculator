export type PaperSize = "A7" | "A6" | "A5" | "A4" | "A3" | "A2" | "custom";

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
  sleeveLeft: boolean;
  sleeveRight: boolean;
}

export interface CalculatorInput {
  isWhiteGarment: boolean;
  front: PrintSideInput;
  back: PrintSideInput;
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
  front: SideCostBreakdown | null;
  back: SideCostBreakdown | null;
  pretreatment: number;
  collarLogo: number;
  sleeveLeft: number;
  sleeveRight: number;
  whiteGarmentDiscount: number;
  totalCostPerPiece: number;
  sellingPricePerPiece: number;
  volumeDiscount: VolumeDiscount;
  discountedSellingPricePerPiece: number;
  quantity: number;
  totalCost: number;
  totalSellingPrice: number;
}

const COST_PER_CC = 13;
const SMALL_DESIGN_FLAT_COST = 40;
const MAX_INCH_FOR_MINIMUM = 5;
const PRETREATMENT_FRONT_ONLY = 40;
const PRETREATMENT_FRONT_AND_BACK = 70;
const COLLAR_LOGO_COST = 30;
const SLEEVE_COST = 70;
const WHITE_GARMENT_DISCOUNT = 40;
const MARKUP = 0.35;

const VOLUME_DISCOUNT_TIERS: { minQty: number; rate: number; label: string }[] = [
  { minQty: 100, rate: 0.15, label: "100 ตัวขึ้นไป ลด 15%" },
  { minQty: 50, rate: 0.10, label: "50 ตัวขึ้นไป ลด 10%" },
  { minQty: 30, rate: 0.05, label: "30 ตัวขึ้นไป ลด 5%" },
];

function getVolumeDiscount(quantity: number): VolumeDiscount {
  for (const tier of VOLUME_DISCOUNT_TIERS) {
    if (quantity >= tier.minQty) {
      return { rate: tier.rate, label: tier.label };
    }
  }
  return { rate: 0, label: "" };
}

export const PAPER_SIZES: Record<
  Exclude<PaperSize, "custom">,
  { widthInch: number; heightInch: number; label: string }
> = {
  A7: { widthInch: 3, heightInch: 4, label: 'A7 (3 × 4")' },
  A6: { widthInch: 4, heightInch: 6, label: 'A6 (4 × 6")' },
  A5: { widthInch: 6, heightInch: 8, label: 'A5 (6 × 8")' },
  A4: { widthInch: 8, heightInch: 12, label: 'A4 (8 × 12")' },
  A3: { widthInch: 12, heightInch: 16, label: 'A3 (12 × 16")' },
  A2: { widthInch: 16, heightInch: 21, label: 'A2 (16 × 21")' },
};

function getMaxDimensionInch(side: PrintSideInput): number {
  if (side.size === "custom") {
    return Math.max(side.customWidthInch ?? 0, side.customHeightInch ?? 0);
  }
  const info = PAPER_SIZES[side.size];
  return Math.max(info.widthInch, info.heightInch);
}

function calculateSideCost(side: PrintSideInput): SideCostBreakdown {
  const colorCCRounded = Math.ceil(side.colorCC);
  const whiteCCRounded = Math.ceil(side.whiteCC);
  const totalCC = colorCCRounded + whiteCCRounded;
  const ccBasedCost = totalCC * COST_PER_CC;

  const maxInch = getMaxDimensionInch(side);
  const isSmall = maxInch > 0 && maxInch <= MAX_INCH_FOR_MINIMUM;
  const finalCost = isSmall ? SMALL_DESIGN_FLAT_COST : ccBasedCost;

  return {
    colorCCRounded,
    whiteCCRounded,
    totalCC,
    ccBasedCost,
    isSmallDesign: isSmall,
    finalCost,
  };
}

export function calculate(input: CalculatorInput): CostBreakdown {
  const front = input.front.enabled ? calculateSideCost(input.front) : null;
  const back = input.back.enabled ? calculateSideCost(input.back) : null;

  const hasFront = front !== null;
  const hasBack = back !== null;

  let pretreatment = 0;
  if (hasFront && hasBack) {
    pretreatment = PRETREATMENT_FRONT_AND_BACK;
  } else if (hasFront || hasBack) {
    pretreatment = PRETREATMENT_FRONT_ONLY;
  }

  const collarLogo = input.addons.collarLogo ? COLLAR_LOGO_COST : 0;
  const sleeveLeft = input.addons.sleeveLeft ? SLEEVE_COST : 0;
  const sleeveRight = input.addons.sleeveRight ? SLEEVE_COST : 0;

  const whiteGarmentDiscount = input.isWhiteGarment ? WHITE_GARMENT_DISCOUNT : 0;

  const totalCostPerPiece =
    (front?.finalCost ?? 0) +
    (back?.finalCost ?? 0) +
    pretreatment +
    collarLogo +
    sleeveLeft +
    sleeveRight -
    whiteGarmentDiscount;

  const sellingPricePerPiece = Math.ceil(totalCostPerPiece * (1 + MARKUP));

  const quantity = Math.max(1, input.quantity);
  const volumeDiscount = getVolumeDiscount(quantity);
  const discountedSellingPricePerPiece =
    volumeDiscount.rate > 0
      ? Math.ceil(sellingPricePerPiece * (1 - volumeDiscount.rate))
      : sellingPricePerPiece;

  return {
    front,
    back,
    pretreatment,
    collarLogo,
    sleeveLeft,
    sleeveRight,
    whiteGarmentDiscount,
    totalCostPerPiece,
    sellingPricePerPiece,
    volumeDiscount,
    discountedSellingPricePerPiece,
    quantity,
    totalCost: totalCostPerPiece * quantity,
    totalSellingPrice: discountedSellingPricePerPiece * quantity,
  };
}
