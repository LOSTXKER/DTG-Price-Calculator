import Link from "next/link";

export type AdminTab = "overview" | "users" | "settings";

const TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: "overview", label: "ภาพรวม", icon: "▦" },
  { id: "users", label: "ผู้ใช้", icon: "◉" },
  { id: "settings", label: "ตั้งค่าราคา", icon: "◐" },
];

export default function PortalNav({ active }: { active: AdminTab }) {
  return (
    <nav className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-1 inline-flex gap-1 mb-5 overflow-x-auto max-w-full">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const href = tab.id === "overview" ? "/admin" : `/admin?tab=${tab.id}`;
        return (
          <Link
            key={tab.id}
            href={href}
            className={`px-3.5 h-8 inline-flex items-center gap-1.5 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap ${
              isActive
                ? "bg-[var(--accent)] text-white shadow-[0_1px_3px_rgba(0,113,227,0.3)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--fill)]"
            }`}
          >
            <span className="text-[10px] opacity-70">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
