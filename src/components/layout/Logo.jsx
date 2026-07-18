import { cn } from "@/lib/utils";

export function Logo({ size = "md", showText = true, className }) {
  const sizes = {
    sm: { box: "h-7 w-7", text: "text-base" },
    md: { box: "h-9 w-9", text: "text-lg" },
    lg: { box: "h-12 w-12", text: "text-2xl" },
  };
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative rounded-xl bg-ink flex items-center justify-center shadow-md", s.box)}>
        <svg viewBox="0 0 64 64" className="h-3/5 w-3/5">
          <path
            d="M18 16 L18 48 L24 48 L24 36 L34 36 C40.6 36 46 30.6 46 24 C46 17.4 40.6 12 34 12 L18 12 L18 16 Z M24 18 L34 18 C37.3 18 40 20.7 40 24 C40 27.3 37.3 30 34 30 L24 30 L24 18 Z"
            fill="var(--accent)"
          />
          <circle cx="46" cy="46" r="6" fill="var(--accent)" />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-display italic font-medium tracking-tight text-ink", s.text)}>
          Placely
        </span>
      )}
    </div>
  );
}
