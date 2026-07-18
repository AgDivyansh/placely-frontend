import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { AnimatePresence } from "framer-motion";

import { store, persistor } from "@/store";
import { ToastProvider } from "@/context/ToastContext";
import { TwoStepProvider } from "@/context/TwoStepContext";
import { AppRouter } from "@/routes/AppRouter";
import { Preloader } from "@/components/feedback/Preloader";
import { ToastViewport } from "@/components/feedback/ToastViewport";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { ThemeApplier } from "@/components/layout/ThemeApplier";
import { CommandPalette } from "@/components/CommandPalette";
import { DataBootstrap } from "@/components/DataBootstrap";

/**
 * App — composition root.
 *
 * Provider stack (outer → inner):
 *   1. ErrorBoundary  — catches render errors anywhere below
 *   2. Provider       — Redux store
 *   3. PersistGate    — waits for redux-persist rehydration
 *   4. ToastProvider  — transient UI notifications (kept as Context)
 *   5. BrowserRouter  — needs everything above
 *   6. ThemeApplier   — syncs Redux theme to html[data-theme]
 *   7. AppRouter      — routes
 *   8. CommandPalette — global ⌘K (mounted once)
 *
 * The Preloader runs for 900 ms on cold load to hide the font flash
 * and create a branded first impression.
 */
export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<Preloader />} persistor={persistor}>
          <ToastProvider>
            <TwoStepProvider>
              <BrowserRouter>
                <ThemeApplier />
                <DataBootstrap />
                <AnimatePresence>{booting && <Preloader key="preloader" />}</AnimatePresence>
                {!booting && (
                  <>
                    <AppRouter />
                    <CommandPalette />
                    <ToastViewport />
                  </>
                )}
              </BrowserRouter>
            </TwoStepProvider>
          </ToastProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}
