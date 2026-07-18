import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Combobox — a searchable single-select. `options` is [{ value, label }].
 * Filters by label as the user types; calls onChange(value) on select.
 * `footer` renders a pinned action row (e.g. "+ Add new company").
 */
export function Combobox({ options = [], value, onChange, placeholder = "Select…", label, footer }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = options.find((o) => o.value === value);
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div className="block" ref={ref}>
      {label && (
        <span className="block text-xs font-medium text-ink-2 mb-1.5 tracking-tight">{label}</span>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full h-10 px-3 rounded-lg bg-surface border text-sm flex items-center justify-between gap-2 transition-all",
            open ? "border-accent shadow-ring" : "border-border hover:border-border-strong"
          )}
        >
          <span className={cn("truncate", selected ? "text-ink" : "text-ink-3")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-ink-3 shrink-0" />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full rounded-lg bg-surface border border-border shadow-lg overflow-hidden">
            <div className="relative border-b border-border">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full h-10 pl-10 pr-3 bg-transparent outline-none text-sm text-ink placeholder:text-ink-3"
              />
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-xs text-ink-3 text-center">No matches</p>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-sm text-left flex items-center justify-between gap-2 hover:bg-surface-tint transition-colors",
                      o.value === value ? "text-accent" : "text-ink"
                    )}
                  >
                    <span className="truncate">{o.label}</span>
                    {o.value === value && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                ))
              )}
            </div>
            {footer && <div className="border-t border-border">{footer}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
