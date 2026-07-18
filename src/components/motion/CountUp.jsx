import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { EASE_SMOOTH } from "@/lib/motion";

/**
 * CountUp — animates a number counting up to its target value.
 *
 * Why: a static "1,080" is inert. Watching it climb to 1,080 makes a
 * dashboard feel alive and draws the eye to the metric — the single
 * best "premium" touch on a stats page. Kept short (0.9s) so it never
 * feels like you're waiting.
 *
 * Accessibility: reduced-motion users see the final number immediately.
 *
 * @param {number} value  - target number
 * @param {number} duration - seconds (default 0.9)
 * @param {string} prefix - e.g. "₹"
 * @param {string} suffix - e.g. "%", " LPA"
 * @param {number} decimals - decimal places to show
 */
export function CountUp({ value, duration = 0.9, prefix = "", suffix = "", decimals = 0, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    let raf;
    const start = performance.now();
    const from = 0;
    const to = Number(value) || 0;

    // Cubic-bezier easing sampled manually for a smooth deceleration
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setDisplay(to);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString("en-IN");

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
