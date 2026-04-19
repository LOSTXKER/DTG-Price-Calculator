"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { invalidatePricingCache } from "@/lib/pricing";
import { requireAdmin } from "@/lib/auth";

interface ActionResult {
  ok: boolean;
  error?: string;
}

const PRICING_FIELDS = [
  "costPerCc",
  "smallDesignFlatCost",
  "maxInchForMinimum",
  "pretreatmentOnePosition",
  "pretreatmentMultiPosition",
  "whiteGarmentDiscount",
  "markup",
  "minSellingSmall",
  "minSellingLarge",
  "largeSizeThreshold",
] as const;

type PricingField = (typeof PRICING_FIELDS)[number];

function num(formData: FormData, key: string): number {
  const v = Number(formData.get(key));
  if (!Number.isFinite(v)) throw new Error(`ค่า ${key} ไม่ถูกต้อง`);
  return v;
}

function str(formData: FormData, key: string): string {
  const v = String(formData.get(key) ?? "").trim();
  if (!v) throw new Error(`ค่า ${key} ว่าง`);
  return v;
}

function int(formData: FormData, key: string): number {
  const v = parseInt(String(formData.get(key) ?? ""), 10);
  if (!Number.isFinite(v)) throw new Error(`ค่า ${key} ไม่ถูกต้อง`);
  return v;
}

function refresh() {
  invalidatePricingCache();
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function updatePricing(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data: Record<PricingField, number> = {} as Record<
      PricingField,
      number
    >;
    for (const f of PRICING_FIELDS) data[f] = num(formData, f);

    if (data.markup < 0 || data.markup > 5) {
      return { ok: false, error: "Markup ต้องอยู่ระหว่าง 0 - 5 (เช่น 0.35)" };
    }

    await prisma.pricingConfig.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function upsertPaperSize(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  try {
    const idRaw = formData.get("id");
    const id = idRaw ? parseInt(String(idRaw), 10) : null;
    const data = {
      code: str(formData, "code").toUpperCase(),
      label: str(formData, "label"),
      widthInch: num(formData, "widthInch"),
      heightInch: num(formData, "heightInch"),
      sortOrder: int(formData, "sortOrder"),
    };
    if (id) {
      await prisma.paperSize.update({ where: { id }, data });
    } else {
      await prisma.paperSize.create({ data });
    }
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deletePaperSize(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  try {
    const id = int(formData, "id");
    await prisma.paperSize.delete({ where: { id } });
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function upsertTier(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  try {
    const idRaw = formData.get("id");
    const id = idRaw ? parseInt(String(idRaw), 10) : null;
    const data = {
      minQty: int(formData, "minQty"),
      rate: num(formData, "rate"),
      label: str(formData, "label"),
    };
    if (data.rate < 0 || data.rate > 1) {
      return { ok: false, error: "Rate ต้องอยู่ระหว่าง 0 - 1 (เช่น 0.10 = 10%)" };
    }
    if (id) {
      await prisma.volumeTier.update({ where: { id }, data });
    } else {
      await prisma.volumeTier.create({ data });
    }
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteTier(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  try {
    const id = int(formData, "id");
    await prisma.volumeTier.delete({ where: { id } });
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function upsertAddon(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  try {
    const idRaw = formData.get("id");
    const id = idRaw ? parseInt(String(idRaw), 10) : null;
    const data = {
      code: str(formData, "code"),
      label: str(formData, "label"),
      cost: num(formData, "cost"),
      enabled: formData.get("enabled") === "on",
    };
    if (id) {
      await prisma.addon.update({ where: { id }, data });
    } else {
      await prisma.addon.create({ data });
    }
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteAddon(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  try {
    const id = int(formData, "id");
    await prisma.addon.delete({ where: { id } });
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
