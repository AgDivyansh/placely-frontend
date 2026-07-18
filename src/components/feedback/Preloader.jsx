import { motion } from "framer-motion";

/**
 * Preloader — shown during initial app boot.
 * Branded animation: logomark builds in, tagline fades, progress bar fills.
 */
export function Preloader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg dot-grid">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <svg viewBox="0 0 64 64" className="h-20 w-20">
          <rect width="64" height="64" rx="14" className="fill-ink" />
          <motion.path
            d="M18 16 L18 48 L24 48 L24 36 L34 36 C40.6 36 46 30.6 46 24 C46 17.4 40.6 12 34 12 L18 12 L18 16 Z M24 18 L34 18 C37.3 18 40 20.7 40 24 C40 27.3 37.3 30 34 30 L24 30 L24 18 Z"
            fill="var(--accent)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.circle
            cx="46"
            cy="46"
            r="6"
            fill="var(--accent)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.7, ease: "backOut" }}
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="font-display italic text-2xl text-ink">Placely</p>
        <p className="mt-1 text-xs text-ink-3 tracking-widest uppercase">Placement, reimagined</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 w-56 h-1 rounded-full bg-border overflow-hidden"
      >
        <motion.div
          className="h-full bg-accent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
