"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { loadPricingConfig } from "@/lib/pricing";
import {
  calculate,
  SIDE_KEYS,
  type CalculatorInput,
  type SideId,
} from "@/lib/calculator";

export interface SaveQuoteResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function isCalculatorInput(value: unknown): value is CalculatorInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.isWhiteGarment !== "boolean") return false;
  if (typeof v.quantity !== "number") return false;
  if (!v.sides || typeof v.sides !== "object") return false;
  if (!v.addons || typeof v.addons !== "object") return false;
  const sides = v.sides as Record<string, unknown>;
  for (const { id } of SIDE_KEYS) {
    const s = sides[id as SideId];
    if (!s || typeof s !== "object") return false;
  }
  return true;
}

/// บันทึกการคำนวณ — recompute breakdown ฝั่ง server ด้วย config ปัจจุบัน
/// เพื่อความถูกต้อง (ไม่เชื่อ breakdown ที่ส่งมาจาก client)
export async function saveQuoteAction(
  formData: FormData
): Promise<SaveQuoteResult> {
  const session = await requireUser();
  try {
    const name = String(formData.get("name") ?? "").trim();
    const inputRaw = String(formData.get("input") ?? "");

    if (!name) return { ok: false, error: "กรอกชื่อรายการ/รหัสออเดอร์" };
    if (name.length > 120)
      return { ok: false, error: "ชื่อรายการยาวเกิน 120 ตัวอักษร" };

    let parsed: unknown;
    try {
      parsed = JSON.parse(inputRaw);
    } catch {
      return { ok: false, error: "ข้อมูลการคำนวณไม่ถูกต้อง" };
    }

    if (!isCalculatorInput(parsed)) {
      return { ok: false, error: "ข้อมูลการคำนวณไม่ครบถ้วน" };
    }

    const config = await loadPricingConfig();
    const breakdown = calculate(parsed, config);

    const quote = await prisma.quote.create({
      data: {
        name,
        input: parsed as object,
        breakdown: breakdown as unknown as object,
        configSnapshot: config as unknown as object,
        createdById: session.userId,
      },
      select: { id: true },
    });

    revalidatePath("/quotes");
    return { ok: true, id: quote.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteQuoteAction(formData: FormData): Promise<void> {
  const session = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // เจ้าของ + ADMIN ลบได้
  const quote = await prisma.quote.findUnique({
    where: { id },
    select: { createdById: true },
  });
  if (!quote) return;
  const isOwner = quote.createdById === session.userId;
  const isAdmin = session.profile.role === "ADMIN";
  if (!isOwner && !isAdmin) return;

  await prisma.quote.delete({ where: { id } });
  revalidatePath("/quotes");
  redirect("/quotes");
}
