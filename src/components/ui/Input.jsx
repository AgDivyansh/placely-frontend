import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(function Input(
  { className, leftIcon: LeftIcon, rightIcon: RightIcon, label, error, hint, ...rest },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs font-medium text-ink-2 mb-1.5 tracking-tight">
          {label}
        </span>
      )}
      <div
        className={cn(
          "relative flex items-center group rounded-lg border transition-all duration-200 ease-smooth",
          "bg-surface focus-within:border-accent focus-within:shadow-ring",
          error ? "border-danger" : "border-border hover:border-border-strong",
          className
        )}
      >
        {LeftIcon && <LeftIcon className="absolute left-3 h-4 w-4 text-ink-3" />}
        <input
          ref={ref}
          className={cn(
            "flex-1 bg-transparent outline-none px-4 h-10 text-sm placeholder:text-ink-3 text-ink",
            LeftIcon && "pl-10",
            RightIcon && "pr-10"
          )}
          {...rest}
        />
        {RightIcon && <RightIcon className="absolute right-3 h-4 w-4 text-ink-3" />}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </label>
  );
});
