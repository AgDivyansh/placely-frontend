import { useEffect } from "react";
import { useTheme } from "@/store/hooks";

/**
 * ThemeApplier — syncs the Redux theme state to the html[data-theme]
 * attribute, which all CSS variables in tokens.css resolve against.
 *
 * Mounted once near the top of the tree.
 */
export function ThemeApplier() {
  const { theme } = useTheme();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return null;
}
