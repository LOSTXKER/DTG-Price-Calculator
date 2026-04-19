"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useCurrentUser } from "@/app/(main)/_components/UserContext";
import { logoutAction } from "@/app/login/actions";

interface TopNavProps {
  rightSlot?: React.ReactNode;
}

const TABS = [
  { href: "/", label: "คำนวณราคา" },
  { href: "/quotes", label: "ประวัติ" },
  { href: "/anajak", label: "แปลงออเดอร์ Anajak" },
];

export default function TopNav({ rightSlot }: TopNavProps) {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--header-bg)] border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 min-w-0">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight whitespace-nowrap hover:opacity-80 transition-opacity"
          >
            DTG Calculator
          </Link>
          <nav
            className="hidden sm:flex items-center gap-1 rounded-full bg-[var(--fill)] p-0.5"
            aria-label="หมวดหมู่หลัก"
          >
            {TABS.map((tab) => {
              const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-3 h-7 inline-flex items-center rounded-full text-[12px] font-medium transition-all ${
                    active
                      ? "bg-[var(--seg-active)] text-[var(--text-primary)] shadow-[0_1px_2px_var(--seg-active-shadow)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {rightSlot}
          {user?.isAdmin && (
            <Link
              href="/admin"
              className="text-[13px] text-[var(--text-tertiary)] hover:text-[var(--accent)] font-medium transition-colors"
              title="Admin Portal"
            >
              Admin
            </Link>
          )}
          {user && (
            <span
              className="hidden md:inline text-[12px] text-[var(--text-tertiary)] truncate max-w-[180px]"
              title={user.email}
            >
              {user.email}
            </span>
          )}
          {user && (
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--red)] font-medium transition-colors"
              >
                ออก
              </button>
            </form>
          )}
          <ThemeToggle />
        </div>
      </div>

      <div className="sm:hidden border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-5 py-2 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 h-7 inline-flex items-center rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${
                  active
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--fill)] text-[var(--text-secondary)]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
