import { cn } from "@/lib/utils";

// `onDark` pins the mark to fixed light colors for use on a permanently dark
// surface (the auth panel), where the theme-following `text-ink` would vanish.
export function Logo({ size = "md", showText = true, onDark = false, className }) {
  const sizes = {
    sm: { box: "h-7 w-7", text: "text-base" },
    md: { box: "h-9 w-9", text: "text-lg" },
    lg: { box: "h-12 w-12", text: "text-2xl" },
  };
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn("relative rounded-xl flex items-center justify-center shadow-md", s.box, !onDark && "bg-ink")}
        style={onDark ? { backgroundColor: "rgba(245,241,232,0.1)", border: "1px solid rgba(245,241,232,0.16)" } : undefined}
      >
        <svg viewBox="0 0 64 64" className="h-3/5 w-3/5">
          <path
            d="M18 16 L18 48 L24 48 L24 36 L34 36 C40.6 36 46 30.6 46 24 C46 17.4 40.6 12 34 12 L18 12 L18 16 Z M24 18 L34 18 C37.3 18 40 20.7 40 24 C40 27.3 37.3 30 34 30 L24 30 L24 18 Z"
            fill="var(--accent)"
          />
          <circle cx="46" cy="46" r="6" fill="var(--accent)" />
        </svg>
      </div>
      {showText && (
        <span
          className={cn("font-display italic font-medium tracking-tight", s.text, !onDark && "text-ink")}
          style={onDark ? { color: "#F5F1E8" } : undefined}
        >
          Placely
        </span>
      )}
    </div>
  );
}
