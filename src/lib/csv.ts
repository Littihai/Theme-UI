/**
 * Download rows as a CSV file that Excel opens correctly: a byte-order mark first (without it Thai text shows
 * as mojibake), quotes around anything with a comma, quote or line break.
 */
export function downloadCsv(filename: string, head: string[], rows: unknown[][]) {
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "\uFEFF" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
