import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, REVEAL_VIEWPORT, DURATION, EASE_SMOOTH } from "@/lib/motion";

/**
 * Reveal — fades + rises content into view as the user scrolls to it.
 *
 * Why: gives long pages a sense of life and draws the eye down the page
 * without being distracting. Each section arrives calmly instead of all
 * at once. Animates only once (never re-triggers on scroll-up).
 *
 * Accessibility: if the user prefers reduced motion, we render statically —
 * no transform, no delay — so nothing moves.
 *
 * @param {number} delay - optional stagger when placing several in a row
 */
export function Reveal({ children, delay = 0, className, as = "div" }) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] || motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={REVEAL_VIEWPORT}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION.base, ease: EASE_SMOOTH, delay },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}
