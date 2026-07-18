import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Card — compound component for content blocks.
 *  - <Card>...</Card>
 *  - <Card.Header>, <Card.Body>, <Card.Footer> (optional)
 *  - `hoverable` prop adds lift animation on hover
 *  - `glass` prop applies mirror/backdrop-blur effect
 *  - `interactive` makes it a button-like clickable surface
 */
export function Card({
  children,
  className,
  hoverable = false,
  glass = false,
  elevated = false,
  interactive = false,
  onClick,
  ...rest
}) {
  const baseClasses = cn(
    "relative overflow-hidden rounded-xl transition-all duration-300 ease-smooth",
    glass ? "glass" : elevated ? "surface-card-elev" : "surface-card",
    hoverable && "hover:shadow-lg hover:-translate-y-0.5 hover:border-border-strong",
    interactive && "cursor-pointer focus-visible:ring-2 focus-visible:ring-accent",
    className
  );

  if (interactive) {
    return (
      <motion.div
        role="button"
        tabIndex={0}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={baseClasses}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.(e);
          }
        }}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick} {...rest}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className, ...rest }) {
  return (
    <div className={cn("p-5 pb-3", className)} {...rest}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className, ...rest }) {
  return (
    <div className={cn("p-5", className)} {...rest}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className, ...rest }) {
  return (
    <div className={cn("px-5 py-3 border-t border-border bg-surface-tint/50", className)} {...rest}>
      {children}
    </div>
  );
};
