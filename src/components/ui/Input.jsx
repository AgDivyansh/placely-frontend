import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(function Input(
  { className, leftIcon: LeftIcon, rightIcon: RightIcon, label, error, hint, type = "text", ...rest },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  // Password inputs get an eye toggle; the toggle takes the right slot so a
  // stray rightIcon can't collide with it.
  const hasRightSlot = isPassword || RightIcon;

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
          type={inputType}
          className={cn(
            "flex-1 bg-transparent outline-none px-4 h-10 text-sm placeholder:text-ink-3 text-ink",
            LeftIcon && "pl-10",
            hasRightSlot && "pr-10"
          )}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword((v) => !v);
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 text-ink-3 hover:text-ink transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : (
          RightIcon && <RightIcon className="absolute right-3 h-4 w-4 text-ink-3" />
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </label>
  );
});
