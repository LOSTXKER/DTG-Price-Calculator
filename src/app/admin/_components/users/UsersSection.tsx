import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import CreateUserForm from "./CreateUserForm";
import RoleSelect from "./RoleSelect";
import DeleteUserButton from "./DeleteUserButton";
import { setActiveAction } from "@/app/admin/actions/users";

function fmtDate(d: Date): string {
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function UsersSection() {
  const session = await requireAdmin();

  const [profiles, quoteCounts] = await Promise.all([
    prisma.profile.findMany({ orderBy: [{ role: "asc" }, { email: "asc" }] }),
    prisma.quote.groupBy({ by: ["createdById"], _count: { _all: true } }),
  ]);

  const countMap = new Map(
    quoteCounts.map((c) => [c.createdById, c._count._all])
  );

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">จัดการผู้ใช้</h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
            สร้างบัญชี เปลี่ยน role ระงับ/ลบผู้ใช้ · ทั้งหมด {profiles.length} คน
          </p>
        </div>
        <CreateUserForm />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--fill)] text-[12px] text-[var(--text-tertiary)] uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">อีเมล</th>
                <th className="text-left px-4 py-2.5 font-medium">ชื่อ</th>
                <th className="text-left px-4 py-2.5 font-medium">Role</th>
                <th className="text-left px-4 py-2.5 font-medium">สถานะ</th>
                <th className="text-right px-4 py-2.5 font-medium">บันทึก</th>
                <th className="text-left px-4 py-2.5 font-medium">เพิ่มเมื่อ</th>
                <th className="text-right px-4 py-2.5 font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {profiles.map((p) => {
                const isSelf = p.id === session.userId;
                const quoteCount = countMap.get(p.id) ?? 0;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 font-medium">
                      {p.email}
                      {isSelf && (
                        <span className="ml-1.5 text-[11px] text-[var(--text-tertiary)]">
                          (คุณ)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                      {p.name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <RoleSelect id={p.id} role={p.role} disabled={isSelf} />
                    </td>
                    <td className="px-4 py-2.5">
                      {p.isActive ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--green-bg)] text-[var(--green)] text-[11px] font-semibold">
                          ใช้งาน
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--fill)] text-[var(--text-tertiary)] text-[11px] font-semibold">
                          ระงับ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">
                      {quoteCount}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text-tertiary)]">
                      {fmtDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-3">
                        <form action={setActiveAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={(!p.isActive).toString()}
                          />
                          <button
                            type="submit"
                            disabled={isSelf}
                            className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--accent)] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {p.isActive ? "ระงับ" : "เปิด"}
                          </button>
                        </form>
                        <DeleteUserButton
                          id={p.id}
                          email={p.email}
                          disabled={isSelf}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
