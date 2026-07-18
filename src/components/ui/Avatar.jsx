import { cn } from "@/lib/utils";
import { initials as getInitials } from "@/lib/utils";

const SIZES = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-base", xl: "h-20 w-20 text-lg" };

export function Avatar({ name, src, size = "md", color, className }) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0 shadow-sm",
        SIZES[size],
        className
      )}
      style={{ background: color || "#5B85E0" }}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
