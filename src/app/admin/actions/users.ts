"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@prisma/client";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidRole(role: string): role is Role {
  return role === "USER" || role === "ADMIN";
}

/// แอดมินสร้างผู้ใช้ตรงๆ ด้วย email + password — ไม่มีการส่งอีเมลยืนยัน
export async function createUserAction(
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  try {
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const role = String(formData.get("role") ?? "USER");
    const name = String(formData.get("name") ?? "").trim() || null;

    if (!isValidEmail(email)) return { ok: false, error: "อีเมลไม่ถูกต้อง" };
    if (!isValidRole(role)) return { ok: false, error: "Role ไม่ถูกต้อง" };
    if (password.length < 8) {
      return { ok: false, error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
    }

    const existing = await prisma.profile.findUnique({ where: { email } });
    if (existing) return { ok: false, error: "อีเมลนี้มีอยู่แล้วในระบบ" };

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: name ? { name } : undefined,
    });

    if (error || !data.user) {
      return {
        ok: false,
        error: error?.message ?? "สร้างผู้ใช้ไม่สำเร็จ",
      };
    }

    await prisma.profile.create({
      data: {
        id: data.user.id,
        email,
        name,
        role,
        isActive: true,
      },
    });

    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function setRoleAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!id || !isValidRole(role)) return;

  // กันแอดมินถอด role ตัวเอง
  if (id === session.userId && role !== "ADMIN") return;

  await prisma.profile.update({ where: { id }, data: { role } });
  revalidatePath("/admin");
}

export async function setActiveAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";
  if (!id) return;

  // กันแอดมินปิดบัญชีตัวเอง
  if (id === session.userId && !isActive) return;

  await prisma.profile.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin");
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // กันแอดมินลบตัวเอง
  if (id === session.userId) return;

  const supabase = createAdminClient();
  // ลบ auth user ก่อน → onDelete cascade ของ Profile + Quote จะลบตาม
  await supabase.auth.admin.deleteUser(id);
  // เผื่อ cascade ไม่ทำงาน (auth.users ไม่ FK กับ Profile โดยตรงใน Prisma)
  await prisma.profile.deleteMany({ where: { id } });

  revalidatePath("/admin");
}
