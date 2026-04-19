"use client";

import { useCallback, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import TopNav from "@/components/TopNav";
import PasteForm from "@/components/anajak/PasteForm";
import DateInput from "@/components/anajak/DateInput";
import ResultTable from "@/components/anajak/ResultTable";
import CopyButton from "@/components/anajak/CopyButton";
import { rowsToTSVNoHeaders } from "@/lib/anajak/formatter";
import { getThaiDateString } from "@/lib/anajak/date-utils";
import type { TableRow } from "@/lib/anajak/types";

interface GeminiRow {
  orderCode: string;
  ccUsed: string;
  shirtName: string;
  size: string;
  color: string;
  quantity: number;
}

interface GeminiResponse {
  orderCode: string;
  rows: GeminiRow[];
  shippingCost: number;
  grandTotal: number;
  trackingLink: string;
  error?: string;
}

interface OrderMeta {
  orderCode: string;
  shippingCost: number;
  grandTotal: number;
}

export default function AnajakClient() {
  const [date, setDate] = useState(getThaiDateString());
  const [rows, setRows] = useState<TableRow[]>([]);
  const [orderMeta, setOrderMeta] = useState<OrderMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastGeminiRows, setLastGeminiRows] = useState<GeminiRow[]>([]);

  const buildTableRows = useCallback(
    (geminiRows: GeminiRow[], dateStr: string): TableRow[] =>
      geminiRows.map((r, i) => ({
        date: i === 0 ? dateStr : "",
        orderCode: r.orderCode,
        ccUsed: r.ccUsed,
        shirtName: r.shirtName,
        size: r.size,
        color: r.color,
        quantity: r.quantity,
        screenLink: "",
        status: "",
        price: 0,
        image: "",
      })),
    []
  );

  const handleParse = useCallback(
    async (text: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/anajak/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const data: GeminiResponse = await res.json();

        if (!res.ok || data.error) {
          setError(data.error ?? "เกิดข้อผิดพลาดจาก API");
          return;
        }

        setLastGeminiRows(data.rows);
        setRows(buildTableRows(data.rows, date));
        setOrderMeta({
          orderCode: data.orderCode,
          shippingCost: data.shippingCost,
          grandTotal: data.grandTotal,
        });
      } catch {
        setError("ไม่สามารถเชื่อมต่อ API ได้ กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    },
    [date, buildTableRows]
  );

  const handleDateChange = useCallback(
    (newDate: string) => {
      setDate(newDate);
      if (lastGeminiRows.length > 0) {
        setRows(buildTableRows(lastGeminiRows, newDate));
      }
    },
    [lastGeminiRows, buildTableRows]
  );

  const handleCopyTSV = useCallback(async () => {
    const tsv = rowsToTSVNoHeaders(rows);
    await navigator.clipboard.writeText(tsv);
  }, [rows]);

  const handleDownloadExcel = useCallback(() => {
    const headers = [
      "วัน/เดือน/ปี",
      "รหัสออเดอร์",
      "CC สี/ขาว",
      "เสื้อ",
      "ไซส์",
      "สี",
      "จำนวน",
      "ลิ้งลายสกรีน",
      "สถานะ",
      "ราคา",
      "รูป",
    ];

    const data = rows.map((row) => [
      row.date,
      row.orderCode,
      row.ccUsed,
      row.shirtName,
      row.size,
      row.color,
      row.quantity,
      row.screenLink,
      row.status,
      "",
      row.image,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `order-${orderMeta?.orderCode ?? "export"}.xlsx`);
  }, [rows, orderMeta]);

  const handleClear = useCallback(() => {
    setRows([]);
    setOrderMeta(null);
    setLastGeminiRows([]);
    setError(null);
  }, []);

  const totalQty = useMemo(
    () => rows.reduce((sum, r) => sum + (r.quantity || 0), 0),
    [rows]
  );

  const hasResult = rows.length > 0 && orderMeta !== null;

  return (
    <>
      <TopNav
        rightSlot={
          hasResult ? (
            <button
              onClick={handleClear}
              className="text-[13px] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors"
            >
              ล้างผลลัพธ์
            </button>
          ) : null
        }
      />

      <main className="max-w-6xl mx-auto px-5 py-6 pb-12">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              แปลงออเดอร์ Anajak
            </h1>
            <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
              วางข้อความคำสั่งซื้อ → แปลงเป็นตารางพร้อมส่งเข้า Google Sheet
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto px-2.5 h-6 rounded-full bg-[var(--fill)] text-[11px] font-medium text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
            Powered by Gemini
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
          <section className="rounded-2xl bg-[var(--card)] shadow-[0_0_0_1px_var(--border),0_2px_8px_rgba(0,0,0,0.04)] px-5 py-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">
                ข้อความออเดอร์
              </h2>
              <DateInput value={date} onChange={handleDateChange} />
            </div>

            <PasteForm onParse={handleParse} error={error} loading={loading} />
          </section>

          <aside className="lg:sticky lg:top-20 space-y-3">
            <div className="rounded-2xl bg-[var(--card)] shadow-[0_0_0_1px_var(--border),0_2px_8px_rgba(0,0,0,0.04)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-[var(--text-primary)] mb-3">
                สรุปออเดอร์
              </h2>

              {!hasResult ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--fill)] flex items-center justify-center mx-auto mb-3">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[var(--text-tertiary)]"
                    >
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                      <path d="M9 13h6M9 17h4" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-[var(--text-secondary)]">
                    ยังไม่มีผลลัพธ์
                  </p>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                    วางข้อความออเดอร์แล้วกดแปลงข้อมูล
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Stat
                    label="รหัสออเดอร์"
                    value={orderMeta.orderCode}
                    mono
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <MiniStat label="แถวข้อมูล" value={rows.length.toString()} />
                    <MiniStat label="จำนวนรวม" value={totalQty.toString()} />
                  </div>
                  <div className="border-t border-[var(--border)] pt-3 space-y-1.5">
                    <Row
                      label="ค่าจัดส่ง"
                      value={`${orderMeta.shippingCost.toFixed(2)} ฿`}
                    />
                    <Row
                      label="ยอดรวม"
                      value={`${orderMeta.grandTotal.toFixed(2)} ฿`}
                      strong
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <CopyButton
                      label="คัดลอกตาราง (TSV)"
                      onClick={handleCopyTSV}
                      variant="primary"
                    />
                    <CopyButton
                      label="ดาวน์โหลด Excel"
                      onClick={handleDownloadExcel}
                      variant="secondary"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-[var(--fill)]/60 border border-dashed border-[var(--border)] px-4 py-3">
              <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">
                Tip
              </p>
              <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">
                คัดลอกข้อความทั้งหมดจากแชต Anajak ตั้งแต่ &quot;รหัสคำสั่งซื้อ&quot; ลงมา
                แล้ววางในช่องด้านซ้าย
              </p>
            </div>
          </aside>
        </div>

        {hasResult && (
          <section className="mt-5 rounded-2xl bg-[var(--card)] shadow-[0_0_0_1px_var(--border),0_2px_8px_rgba(0,0,0,0.04)] px-5 py-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">
                  ตารางผลลัพธ์
                </h2>
                <span className="text-[11px] px-2 h-5 inline-flex items-center rounded-full bg-[var(--fill)] text-[var(--text-secondary)] tabular-nums">
                  {rows.length} แถว
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] hidden sm:block">
                เลื่อนแนวนอนเพื่อดูคอลัมน์เพิ่มเติม
              </p>
            </div>

            <ResultTable rows={rows} />
          </section>
        )}
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] text-[var(--text-tertiary)] mb-0.5">{label}</p>
      <p
        className={`text-[15px] font-semibold text-[var(--text-primary)] ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--fill)] px-3 py-2">
      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">
        {label}
      </p>
      <p className="text-[15px] font-semibold text-[var(--text-primary)] tabular-nums mt-0.5">
        {value}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span
        className={`tabular-nums ${
          strong
            ? "text-[var(--text-primary)] font-semibold"
            : "text-[var(--text-secondary)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
