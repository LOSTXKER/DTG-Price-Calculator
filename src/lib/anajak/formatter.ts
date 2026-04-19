import type { TableRow } from "./types";

export function rowsToTSVNoHeaders(rows: TableRow[]): string {
  const lines: string[] = [];

  for (const row of rows) {
    lines.push(
      [
        row.date,
        row.orderCode,
        row.ccUsed,
        row.shirtName,
        row.size,
        row.color,
        row.quantity.toString(),
        row.screenLink,
        row.status,
        "",
        row.image,
      ].join("\t")
    );
  }

  return lines.join("\n");
}
