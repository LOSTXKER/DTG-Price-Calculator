import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../login/actions";

export const dynamic = "force-dynamic";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--header-bg)] border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-base font-semibold tracking-tight hover:text-[var(--accent)] transition-colors"
            >
              DTG Calculator
            </Link>
            <span className="text-[13px] text-[var(--text-tertiary)] hidden sm:inline">
              Admin Console
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/settings"
              className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)] font-medium transition-colors"
            >
              Settings
            </Link>
            <Link
              href="/"
              className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)] font-medium transition-colors"
            >
              ดูหน้าผู้ใช้
            </Link>
            <span className="text-[12px] text-[var(--text-tertiary)] hidden md:inline">
              {user.email}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-[13px] text-[var(--red)] hover:opacity-80 font-medium transition-colors"
              >
                ออก
              </button>
            </form>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-6 pb-24">{children}</main>
    </div>
  );
}
