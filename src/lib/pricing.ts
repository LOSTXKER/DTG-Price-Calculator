import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";

export const PRICING_CACHE_TAG = "pricing";

export interface PaperSizeConfig {
  id: number;
  code: string;
  label: string;
  widthInch: number;
  heightInch: number;
  sortOrder: number;
}

export interface VolumeTierConfig {
  id: number;
  minQty: number;
  rate: number;
  label: string;
}

export interface AddonConfig {
  id: number;
  code: string;
  label: string;
  cost: number;
  enabled: boolean;
}

export interface PricingConfig {
  costPerCc: number;
  smallDesignFlatCost: number;
  maxInchForMinimum: number;
  pretreatmentOnePosition: number;
  pretreatmentMultiPosition: number;
  whiteGarmentDiscount: number;
  markup: number;
  minSellingSmall: number;
  minSellingLarge: number;
  largeSizeThreshold: number;
  paperSizes: PaperSizeConfig[];
  volumeTiers: VolumeTierConfig[];
  addons: AddonConfig[];
}

const FALLBACK_CONFIG: PricingConfig = {
  costPerCc: 13,
  smallDesignFlatCost: 40,
  maxInchForMinimum: 5,
  pretreatmentOnePosition: 40,
  pretreatmentMultiPosition: 70,
  whiteGarmentDiscount: 40,
  markup: 0.35,
  minSellingSmall: 100,
  minSellingLarge: 150,
  largeSizeThreshold: 8,
  paperSizes: [
    { id: 1, code: "A7", label: 'A7 (3 × 4")', widthInch: 3, heightInch: 4, sortOrder: 1 },
    { id: 2, code: "A6", label: 'A6 (4 × 6")', widthInch: 4, heightInch: 6, sortOrder: 2 },
    { id: 3, code: "A5", label: 'A5 (6 × 8")', widthInch: 6, heightInch: 8, sortOrder: 3 },
    { id: 4, code: "A4", label: 'A4 (8 × 12")', widthInch: 8, heightInch: 12, sortOrder: 4 },
    { id: 5, code: "A3", label: 'A3 (12 × 16")', widthInch: 12, heightInch: 16, sortOrder: 5 },
    { id: 6, code: "A2", label: 'A2 (16 × 21")', widthInch: 16, heightInch: 21, sortOrder: 6 },
  ],
  volumeTiers: [
    { id: 1, minQty: 100, rate: 0.15, label: "100 ตัวขึ้นไป ลด 15%" },
    { id: 2, minQty: 50, rate: 0.1, label: "50 ตัวขึ้นไป ลด 10%" },
    { id: 3, minQty: 30, rate: 0.05, label: "30 ตัวขึ้นไป ลด 5%" },
  ],
  addons: [{ id: 1, code: "collarLogo", label: "โลโก้คอ", cost: 30, enabled: true }],
};

async function fetchConfig(): Promise<PricingConfig> {
  try {
    const [pricing, paperSizes, volumeTiers, addons] = await Promise.all([
      prisma.pricingConfig.findUnique({ where: { id: 1 } }),
      prisma.paperSize.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.volumeTier.findMany({ orderBy: { minQty: "desc" } }),
      prisma.addon.findMany({ orderBy: { id: "asc" } }),
    ]);

    if (!pricing) return FALLBACK_CONFIG;

    return {
      costPerCc: pricing.costPerCc,
      smallDesignFlatCost: pricing.smallDesignFlatCost,
      maxInchForMinimum: pricing.maxInchForMinimum,
      pretreatmentOnePosition: pricing.pretreatmentOnePosition,
      pretreatmentMultiPosition: pricing.pretreatmentMultiPosition,
      whiteGarmentDiscount: pricing.whiteGarmentDiscount,
      markup: pricing.markup,
      minSellingSmall: pricing.minSellingSmall,
      minSellingLarge: pricing.minSellingLarge,
      largeSizeThreshold: pricing.largeSizeThreshold,
      paperSizes,
      volumeTiers,
      addons,
    };
  } catch (err) {
    console.warn("[pricing] failed to load from DB, using fallback:", err);
    return FALLBACK_CONFIG;
  }
}

const cachedFetch = unstable_cache(fetchConfig, ["pricing-config"], {
  tags: [PRICING_CACHE_TAG],
});

export async function loadPricingConfig(): Promise<PricingConfig> {
  return cachedFetch();
}

export function invalidatePricingCache() {
  revalidateTag(PRICING_CACHE_TAG);
}

export const DEFAULT_PRICING_CONFIG = FALLBACK_CONFIG;
