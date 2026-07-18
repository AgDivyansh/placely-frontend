import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

/**
 * ToastProvider — global notification dispatcher.
 * The actual rendering happens in <ToastViewport />.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const item = { id, kind: "info", duration: 3500, ...toast };
    setToasts((prev) => [...prev, item]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, item.duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title, body) => push({ kind: "success", title, body }),
    error: (title, body) => push({ kind: "error", title, body }),
    info: (title, body) => push({ kind: "info", title, body }),
    warning: (title, body) => push({ kind: "warning", title, body }),
  };

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
};

export const useToastState = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastState must be used within ToastProvider");
  return ctx;
};
