/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        elev: "var(--surface-elev)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        "accent-strong": "var(--accent-strong)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(11, 13, 23, 0.04), 0 1px 3px rgba(11, 13, 23, 0.06)",
        md: "0 2px 6px -1px rgba(11, 13, 23, 0.06), 0 4px 12px -2px rgba(11, 13, 23, 0.08)",
        lg: "0 8px 24px -6px rgba(11, 13, 23, 0.08), 0 20px 40px -12px rgba(11, 13, 23, 0.10)",
        xl: "0 24px 48px -12px rgba(11, 13, 23, 0.18)",
        glow: "0 0 0 4px var(--accent-soft), 0 16px 40px -10px var(--accent-shadow)",
        inner: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        ring: "0 0 0 3px var(--accent-soft)",
      },
      borderRadius: {
        DEFAULT: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out both",
        "fade-up": "fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in-right": "slideInRight 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.4s linear infinite",
        pulse: "pulse 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: 0, transform: "translateX(20px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
