import { redirect } from "next/navigation";
import type { Profile, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export type { Profile, Role };

export interface AuthSession {
  userId: string;
  email: string;
  profile: Profile;
}

/// อ่าน auth user + profile จาก DB
/// - ถ้ายังไม่มี profile (เพิ่งสมัคร/invite) → สร้าง USER อัตโนมัติ
/// - ถ้า profile.isActive = false → return null (ถือว่า unauthenticated)
export async function getCurrentSession(): Promise<AuthSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return null;

  const profile = await prisma.profile.upsert({
    where: { id: user.id },
    update: { email: user.email },
    create: {
      id: user.id,
      email: user.email,
      role: "USER",
      isActive: true,
    },
  });

  if (!profile.isActive) return null;

  return { userId: user.id, email: user.email, profile };
}

export async function requireUser(redirectTo?: string): Promise<AuthSession> {
  const session = await getCurrentSession();
  if (!session) {
    const url = redirectTo
      ? `/login?next=${encodeURIComponent(redirectTo)}`
      : "/login";
    redirect(url);
  }
  return session;
}

export async function requireAdmin(redirectTo?: string): Promise<AuthSession> {
  const session = await requireUser(redirectTo);
  if (session.profile.role !== "ADMIN") {
    redirect("/?error=forbidden");
  }
  return session;
}
