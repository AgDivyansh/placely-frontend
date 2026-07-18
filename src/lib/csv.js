/**
 * CSV utilities.
 *
 * Engineering:
 *  - Handles commas and quotes inside fields by wrapping in double quotes
 *    and doubling internal quotes (RFC 4180 compliant)
 *  - Triggers download via a hidden <a> element + revokeObjectURL cleanup
 */
const csvEscape = (val) => {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export function toCSV(rows, columns) {
  // columns: array of { key, label }
  const header = columns.map((c) => csvEscape(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => csvEscape(row[c.key])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

export function downloadCSV(filename, csvString) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
