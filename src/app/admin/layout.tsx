import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--header-bg)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin"
              className="text-base font-semibold tracking-tight hover:opacity-80 transition-opacity"
            >
              Admin Portal
            </Link>
            <span className="hidden sm:inline text-[12px] text-[var(--text-tertiary)] border-l border-[var(--border)] pl-3">
              DTG Calculator
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)] font-medium transition-colors"
            >
              ดูหน้าผู้ใช้
            </Link>
            <span
              className="hidden md:inline text-[12px] text-[var(--text-tertiary)] truncate max-w-[180px]"
              title={session.email}
            >
              {session.email}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--red)] font-medium transition-colors"
              >
                ออก
              </button>
            </form>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6 pb-24">{children}</main>
    </div>
  );
}
