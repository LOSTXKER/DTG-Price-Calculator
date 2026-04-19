"use client";

import type { TableRow } from "@/lib/anajak/types";

interface ResultTableProps {
  rows: TableRow[];
}

const COLUMN_HEADERS = [
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

export default function ResultTable({ rows }: ResultTableProps) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="min-w-full text-[12px]">
        <thead>
          <tr className="bg-[var(--fill)] text-[var(--text-secondary)]">
            {COLUMN_HEADERS.map((header) => (
              <th
                key={header}
                className="px-2.5 py-2 text-left font-semibold whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {rows.map((row, i) => (
            <tr
              key={i}
              className="hover:bg-[var(--card-hover)] transition-colors"
            >
              <td className="px-2.5 py-1.5 whitespace-nowrap text-[var(--text-secondary)]">
                {row.date}
              </td>
              <td className="px-2.5 py-1.5 whitespace-nowrap font-medium text-[var(--text-primary)]">
                {row.orderCode}
              </td>
              <td className="px-2.5 py-1.5 whitespace-nowrap text-[var(--text-secondary)] tabular-nums">
                {row.ccUsed}
              </td>
              <td className="px-2.5 py-1.5 whitespace-nowrap text-[var(--text-primary)]">
                {row.shirtName}
              </td>
              <td className="px-2.5 py-1.5 whitespace-nowrap text-[var(--text-secondary)]">
                {row.size}
              </td>
              <td className="px-2.5 py-1.5 whitespace-nowrap text-[var(--text-secondary)]">
                {row.color}
              </td>
              <td className="px-2.5 py-1.5 whitespace-nowrap text-[var(--text-secondary)] tabular-nums">
                {row.quantity}
              </td>
              <td className="px-2.5 py-1.5 whitespace-nowrap text-[var(--text-tertiary)]">
                {row.screenLink || "-"}
              </td>
              <td className="px-2.5 py-1.5 whitespace-nowrap text-[var(--text-tertiary)]">
                {row.status || "-"}
              </td>
              <td className="px-2.5 py-1.5 whitespace-nowrap text-[var(--text-tertiary)]">
                -
              </td>
              <td className="px-2.5 py-1.5 whitespace-nowrap text-[var(--text-tertiary)]">
                {row.image || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
