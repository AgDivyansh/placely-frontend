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

/**
 * parseCSV — parse an RFC-4180-ish CSV string into an array of objects keyed
 * by the header row. Handles quoted fields containing commas, quotes, and
 * newlines. Header keys are trimmed; empty trailing lines are ignored.
 */
export function parseCSV(text) {
  const rows = [];
  let field = "";
  let record = [];
  let inQuotes = false;
  const src = text.replace(/\r\n?/g, "\n");

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      record.push(field); field = "";
    } else if (ch === "\n") {
      record.push(field); rows.push(record); field = ""; record = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || record.length > 0) { record.push(field); rows.push(record); }

  const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (nonEmpty.length < 2) return [];
  const headers = nonEmpty[0].map((h) => h.trim());
  return nonEmpty.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
    return obj;
  });
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
