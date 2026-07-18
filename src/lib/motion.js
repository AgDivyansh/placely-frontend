/**
 * MOTION TOKENS
 * ============================================================
 * A single source of truth for all animation timing and easing.
 *
 * Design philosophy — "not too punchy, not too silent":
 *   - Durations are short (0.2s–0.5s). Long animations feel sluggish.
 *   - Easing is gentle (custom cubic-bezier), never bouncy-by-default.
 *   - Movement is small (4–12px). Big movement is distracting.
 *   - Spring physics only where a tactile feel helps (buttons, toggles).
 *
 * Every animated component imports from here so nothing feels random.
 * ============================================================
 */

// ---- Easing curves ----
// A smooth "ease-out-expo"-ish curve — decelerates naturally, feels premium.
export const EASE_SMOOTH = [0.22, 1, 0.36, 1];
// A softer ease for larger content blocks.
export const EASE_GENTLE = [0.25, 0.46, 0.45, 0.94];

// ---- Durations (seconds) ----
export const DURATION = {
  fast: 0.2, // micro-interactions (icon nudge, small fades)
  base: 0.35, // most transitions (page, card, reveal)
  slow: 0.5, // larger content, count-ups
};

// ---- Spring presets (for tactile, physical feedback) ----
export const SPRING_SOFT = { type: "spring", stiffness: 260, damping: 24 };
export const SPRING_SNAPPY = { type: "spring", stiffness: 400, damping: 28 };

// ============================================================
// REUSABLE VARIANTS
// ============================================================

/** Fade + tiny rise. The workhorse for content appearing. */
export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_SMOOTH },
  },
};

/** Simple fade — for overlays, backdrops. */
export const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.fast, ease: EASE_SMOOTH } },
};

/** Scale + fade — for modals, popovers, things that "pop" gently. */
export const popIn = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_SNAPPY,
  },
};

/**
 * Stagger container — children animate in sequence.
 * Pair with `staggerItem` on each child.
 * The 0.06s gap is deliberately small: enough to feel orchestrated,
 * not so much that the list feels slow to fill.
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_SMOOTH },
  },
};

/** Slide in from the right — for toasts, side panels. */
export const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: SPRING_SNAPPY },
  exit: { opacity: 0, x: 24, transition: { duration: DURATION.fast } },
};

/**
 * Standard viewport config for scroll-reveal.
 * `once: true` — animate only the first time (never re-trigger on scroll up).
 * `amount: 0.2` — trigger when 20% of the element is visible.
 * `margin` — start slightly before it fully enters, so it's not jarring.
 */
export const REVEAL_VIEWPORT = { once: true, amount: 0.2, margin: "0px 0px -80px 0px" };
