import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && isAdminEmail(user.email)) {
    redirect(next && next.startsWith("/admin") ? next : "/admin/settings");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold tracking-tight">เข้าสู่ระบบผู้ดูแล</h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
            DTG Calculator · Admin Console
          </p>
        </div>

        <LoginForm
          next={next ?? "/admin/settings"}
          initialError={
            error === "forbidden" ? "บัญชีนี้ไม่มีสิทธิ์เข้าหน้า admin" : undefined
          }
        />
      </div>
    </div>
  );
}
