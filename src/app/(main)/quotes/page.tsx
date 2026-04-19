import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import TopNav from "@/components/TopNav";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface SearchParams {
  q?: string;
  user?: string;
  page?: string;
}

function fmtBaht(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

function fmtDate(d: Date): string {
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireUser("/quotes");
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const user = (sp.user ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(user ? { createdById: user } : {}),
  };

  const [quotes, total, users] = await Promise.all([
    prisma.quote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.quote.count({ where }),
    prisma.profile.findMany({
      orderBy: { email: "asc" },
      select: { id: true, email: true, name: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilter = q !== "" || user !== "";

  function buildHref(overrides: Partial<SearchParams>): string {
    const next = new URLSearchParams();
    const merged = { q, user, page: String(page), ...overrides };
    if (merged.q) next.set("q", merged.q);
    if (merged.user) next.set("user", merged.user);
    if (merged.page && merged.page !== "1") next.set("page", merged.page);
    const qs = next.toString();
    return qs ? `/quotes?${qs}` : "/quotes";
  }

  return (
    <>
      <TopNav />
      <main className="max-w-6xl mx-auto px-5 py-6 space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            ประวัติการคำนวณ
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)]">
            ดูย้อนหลังว่ารายการนี้คำนวณราคาถูกต้องหรือไม่
          </p>
        </div>

        <form
          method="get"
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 flex flex-col sm:flex-row gap-2"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="ค้นหาจากชื่อรายการ / รหัสออเดอร์"
            className="flex-1 rounded-xl bg-[var(--fill)] px-3 py-2 text-[14px] outline-none focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)]"
          />
          <select
            name="user"
            defaultValue={user}
            className="rounded-xl bg-[var(--fill)] px-3 py-2 text-[14px] outline-none focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)] sm:w-56"
          >
            <option value="">ผู้ใช้ทั้งหมด</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name ?? u.email}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 rounded-xl bg-[var(--accent)] text-white text-[13px] font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              ค้นหา
            </button>
            {hasFilter && (
              <Link
                href="/quotes"
                className="px-4 inline-flex items-center rounded-xl bg-[var(--fill)] text-[var(--text-secondary)] text-[13px] font-medium hover:opacity-80 transition-opacity"
              >
                ล้าง
              </Link>
            )}
          </div>
        </form>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {quotes.length === 0 ? (
            <div className="p-8 text-center text-[14px] text-[var(--text-tertiary)]">
              {hasFilter
                ? "ไม่พบรายการที่ค้นหา"
                : "ยังไม่มีการบันทึก — กดปุ่ม “บันทึก” ที่หน้าเครื่องคำนวณเพื่อเก็บประวัติ"}
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {quotes.map((quote) => {
                const breakdown = quote.breakdown as {
                  totalSellingPrice?: number;
                  discountedSellingPricePerPiece?: number;
                  quantity?: number;
                };
                return (
                  <li key={quote.id}>
                    <Link
                      href={`/quotes/${quote.id}`}
                      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[var(--fill)] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-semibold truncate">
                          {quote.name}
                        </div>
                        <div className="text-[12px] text-[var(--text-tertiary)] truncate mt-0.5">
                          {fmtDate(quote.createdAt)} ·{" "}
                          {quote.createdBy.name ?? quote.createdBy.email}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[14px] font-semibold tabular-nums">
                          {fmtBaht(breakdown.totalSellingPrice ?? 0)} ฿
                        </div>
                        <div className="text-[12px] text-[var(--text-tertiary)] tabular-nums">
                          {fmtBaht(
                            breakdown.discountedSellingPricePerPiece ?? 0
                          )}{" "}
                          ฿ × {breakdown.quantity ?? 0} ตัว
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[var(--text-tertiary)]">
              หน้า {page} / {totalPages} · ทั้งหมด {total} รายการ
            </span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={buildHref({ page: String(page - 1) })}
                  className="px-3 py-1.5 rounded-lg bg-[var(--fill)] hover:opacity-80 transition-opacity"
                >
                  ก่อนหน้า
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-[var(--fill)] opacity-40">
                  ก่อนหน้า
                </span>
              )}
              {page < totalPages ? (
                <Link
                  href={buildHref({ page: String(page + 1) })}
                  className="px-3 py-1.5 rounded-lg bg-[var(--fill)] hover:opacity-80 transition-opacity"
                >
                  ถัดไป
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-[var(--fill)] opacity-40">
                  ถัดไป
                </span>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
