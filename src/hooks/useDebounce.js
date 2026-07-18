import { useState, useEffect } from "react";

/**
 * useDebounce — returns a debounced version of a value.
 * Critical for search inputs to avoid re-filtering on every keystroke.
 */
export function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
