import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "@/components/domain/NotificationBell";

export function Topbar({ onMenuClick, title }) {
  // Open the command palette by dispatching a synthetic Cmd+K event
  const openPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true })
    );
  };

  return (
    <header className="sticky top-0 z-20 h-16 glass border-b border-border">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-tint transition-colors"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5 text-ink" />
          </button>
          {title && (
            <h1 className="font-display italic text-xl text-ink leading-none truncate">
              {title}
            </h1>
          )}
        </div>

        <button
          onClick={openPalette}
          className="hidden md:flex items-center gap-2.5 h-9 px-3 w-72 rounded-lg bg-surface-tint border border-border hover:border-border-strong transition-colors text-left"
        >
          <Search className="h-4 w-4 text-ink-3" />
          <span className="text-sm text-ink-3 flex-1">Search…</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 h-5 text-[10px] font-mono text-ink-3 bg-surface border border-border rounded">
            <span>⌘</span>K
          </kbd>
        </button>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
