import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import {
  type CalculatorInput,
  type CostBreakdown,
  SIDE_KEYS,
  getMaxDimensionInch,
} from "@/lib/calculator";
import type { PricingConfig } from "@/lib/pricing";
import TopNav from "@/components/TopNav";
import PriceSummary from "@/components/PriceSummary";
import { Card, CardSurface } from "@/components/ui/Card";
import { deleteQuoteAction } from "../actions";

export const dynamic = "force-dynamic";

const SIDE_LABELS: Record<(typeof SIDE_KEYS)[number]["id"], string> = {
  front: "ด้านหน้า",
  back: "ด้านหลัง",
  sleeveLeft: "แขนซ้าย",
  sleeveRight: "แขนขวา",
};

function fmtDate(d: Date): string {
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sizeLabel(
  size: string,
  customW: number | undefined,
  customH: number | undefined,
  config: PricingConfig
): string {
  if (size === "custom") {
    const w = customW ?? 0;
    const h = customH ?? 0;
    return `กำหนดเอง ${w} × ${h}"`;
  }
  const found = config.paperSizes.find((p) => p.code === size);
  return found?.label ?? size;
}

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, email: true, name: true } },
    },
  });
  if (!quote) notFound();

  const input = quote.input as unknown as CalculatorInput;
  const breakdown = quote.breakdown as unknown as CostBreakdown;
  const config = quote.configSnapshot as unknown as PricingConfig;

  const isOwner = quote.createdById === session.userId;
  const canDelete = isOwner || session.profile.role === "ADMIN";

  return (
    <>
      <TopNav
        rightSlot={
          <Link
            href="/quotes"
            className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors"
          >
            ← กลับรายการ
          </Link>
        }
      />

      <main className="max-w-6xl mx-auto px-5 py-6 space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold tracking-tight break-words">
                {quote.name}
              </h1>
              <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
                บันทึกเมื่อ {fmtDate(quote.createdAt)} โดย{" "}
                {quote.createdBy.name ?? quote.createdBy.email}
              </p>
            </div>
            {canDelete && (
              <form action={deleteQuoteAction}>
                <input type="hidden" name="id" value={quote.id} />
                <button
                  type="submit"
                  className="text-[13px] text-[var(--red)] hover:opacity-80 font-medium transition-colors"
                >
                  ลบรายการนี้
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 min-w-0 space-y-3">
            <Card>
              <SectionHeader
                title="รายละเอียดที่ใช้คำนวณ"
                note="ค่า input ตอนกดบันทึก"
              />
              <div className="space-y-2 text-[13px]">
                <Row
                  label="สีเสื้อ"
                  value={input.isWhiteGarment ? "เสื้อสีขาว" : "เสื้อสีเข้ม"}
                />
                <Row label="จำนวน" value={`${input.quantity} ตัว`} />
                <Row
                  label="โลโก้คอ"
                  value={input.addons.collarLogo ? "เพิ่ม" : "ไม่เพิ่ม"}
                />
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2.5">
                <p className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  ตำแหน่งสกรีน
                </p>
                {SIDE_KEYS.filter(({ id }) => input.sides[id].enabled).length ===
                0 ? (
                  <p className="text-[13px] text-[var(--text-tertiary)]">
                    ไม่มีตำแหน่งที่เปิดใช้
                  </p>
                ) : (
                  SIDE_KEYS.filter(({ id }) => input.sides[id].enabled).map(
                    ({ id }) => {
                      const side = input.sides[id];
                      const maxInch = getMaxDimensionInch(side, config);
                      return (
                        <div
                          key={id}
                          className="rounded-xl bg-[var(--fill)] px-3 py-2.5"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[13px] font-semibold">
                              {SIDE_LABELS[id]}
                            </p>
                            <p className="text-[12px] text-[var(--text-tertiary)] tabular-nums">
                              max {maxInch}&quot;
                            </p>
                          </div>
                          <div className="text-[12px] text-[var(--text-tertiary)] space-y-0.5">
                            <p>
                              ขนาด:{" "}
                              <span className="text-[var(--text-secondary)]">
                                {sizeLabel(
                                  side.size,
                                  side.customWidthInch,
                                  side.customHeightInch,
                                  config
                                )}
                              </span>
                            </p>
                            <p>
                              หมึก: สี {side.colorCC} CC + ขาว {side.whiteCC} CC
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </Card>

            <Card>
              <SectionHeader
                title="ค่า config ตอนคำนวณ"
                note="ใช้ตรวจย้อนหลังว่าใช้ค่าใดในการคิดราคา"
              />
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
                <Row label="ต้นทุนหมึก" value={`${config.costPerCc} ฿/CC`} />
                <Row
                  label="Markup"
                  value={`${Math.round(config.markup * 100)}%`}
                />
                <Row
                  label="Pre-treat 1 ตำแหน่ง"
                  value={`${config.pretreatmentOnePosition} ฿`}
                />
                <Row
                  label="Pre-treat 2+ ตำแหน่ง"
                  value={`${config.pretreatmentMultiPosition} ฿`}
                />
                <Row
                  label="ส่วนลดเสื้อขาว"
                  value={`${config.whiteGarmentDiscount} ฿`}
                />
                <Row
                  label="ราคาเหมาลายเล็ก"
                  value={`${config.smallDesignFlatCost} ฿ (≤ ${config.maxInchForMinimum}")`}
                />
                <Row
                  label="ขั้นต่ำเล็ก"
                  value={`${config.minSellingSmall} ฿`}
                />
                <Row
                  label="ขั้นต่ำใหญ่"
                  value={`${config.minSellingLarge} ฿ (> ${config.largeSizeThreshold}")`}
                />
              </div>
            </Card>
          </div>

          <div className="lg:w-[360px] shrink-0 space-y-3">
            <PriceSummary
              breakdown={breakdown}
              isValid={true}
              missingFields={[]}
              config={config}
            />
            <CardSurface>
              <div className="px-4 py-3 text-[12px] text-[var(--text-tertiary)]">
                ราคาและรายละเอียดด้านบนคำนวณจาก snapshot ตอนกดบันทึก
                ไม่เปลี่ยนตามการแก้ค่า config ในภายหลัง
              </div>
            </CardSurface>
          </div>
        </div>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[var(--text-tertiary)]">{label}</span>
      <span className="text-[var(--text-primary)] font-medium tabular-nums text-right">
        {value}
      </span>
    </div>
  );
}

function SectionHeader({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-[14px] font-medium text-[var(--text-primary)]">
        {title}
      </p>
      {note && (
        <p className="text-[11px] text-[var(--text-tertiary)]">{note}</p>
      )}
    </div>
  );
}
