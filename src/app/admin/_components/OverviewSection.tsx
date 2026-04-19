import Link from "next/link";
import { prisma } from "@/lib/db";

function fmtBaht(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

function fmtDate(d: Date): string {
  return d.toLocaleString("th-TH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OverviewSection() {
  const [userCount, activeUserCount, adminCount, quoteCount, recentQuotes] =
    await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { isActive: true } }),
      prisma.profile.count({ where: { role: "ADMIN" } }),
      prisma.quote.count(),
      prisma.quote.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          createdBy: { select: { email: true, name: true } },
        },
      }),
    ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">ภาพรวมระบบ</h1>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
          สรุปการใช้งานทั้งหมดในระบบ
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="ผู้ใช้ทั้งหมด" value={userCount} sub={`${activeUserCount} ใช้งาน`} />
        <Stat label="แอดมิน" value={adminCount} />
        <Stat label="บันทึกการคำนวณ" value={quoteCount} />
        <Stat
          label="ล่าสุด"
          value={recentQuotes[0] ? fmtDate(recentQuotes[0].createdAt) : "—"}
          isText
        />
      </div>

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <header className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-[14px] font-semibold">การคำนวณล่าสุด</h2>
          <Link
            href="/quotes"
            className="text-[12px] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors"
          >
            ดูทั้งหมด →
          </Link>
        </header>

        {recentQuotes.length === 0 ? (
          <p className="px-5 py-6 text-[13px] text-[var(--text-tertiary)] text-center">
            ยังไม่มีการบันทึก
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {recentQuotes.map((q) => {
              const breakdown = q.breakdown as { totalSellingPrice?: number };
              return (
                <li key={q.id}>
                  <Link
                    href={`/quotes/${q.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-2.5 hover:bg-[var(--fill)] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold truncate">
                        {q.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-tertiary)] truncate">
                        {fmtDate(q.createdAt)} ·{" "}
                        {q.createdBy.name ?? q.createdBy.email}
                      </div>
                    </div>
                    <div className="text-[13px] font-semibold tabular-nums shrink-0">
                      {fmtBaht(breakdown.totalSellingPrice ?? 0)} ฿
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  isText,
}: {
  label: string;
  value: number | string;
  sub?: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-3">
      <p className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`mt-1 font-bold tabular-nums tracking-tight ${
          isText ? "text-[14px]" : "text-[24px]"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{sub}</p>
      )}
    </div>
  );
}
