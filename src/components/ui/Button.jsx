import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Button — the foundational interactive primitive.
 *
 * Variants:
 *  - primary  : accent-filled CTA
 *  - secondary: surface with border
 *  - ghost    : transparent, hover-fill
 *  - danger   : red, destructive actions
 *  - link     : looks like text, no padding
 *
 * Sizes: sm | md | lg
 *
 * Engineering notes:
 *  - forwardRef so it can be focused programmatically
 *  - motion.button under the hood for subtle press animation
 *  - `as` prop lets us render as anchor for navigation
 */
const VARIANTS = {
  primary: "bg-accent text-white hover:bg-accent-strong shadow-md hover:shadow-glow",
  secondary: "bg-surface border border-border text-ink hover:bg-surface-tint hover:border-border-strong shadow-sm",
  ghost: "bg-transparent text-ink-2 hover:bg-surface-tint hover:text-ink",
  danger: "bg-danger text-white hover:bg-danger/90 shadow-md",
  link: "bg-transparent text-accent hover:text-accent-strong p-0 underline-offset-4 hover:underline",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "h-10 w-10 p-0 rounded-lg",
  iconSm: "h-8 w-8 p-0 rounded-md",
};

export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    className,
    children,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    loading = false,
    disabled,
    type = "button",
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      whileHover={isDisabled ? undefined : { y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "inline-flex items-center justify-center font-medium tracking-tight",
        "transition-all duration-200 ease-smooth",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:y-0",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
          <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {!loading && LeftIcon && <LeftIcon className="h-4 w-4" />}
      {children}
      {!loading && RightIcon && <RightIcon className="h-4 w-4" />}
    </motion.button>
  );
});
