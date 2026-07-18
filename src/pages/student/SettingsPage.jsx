import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Bell, Smartphone, Mail, MessageSquare, Moon, Sun, Type,
  Volume2, Globe, AlertTriangle, Bookmark,
} from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useToast } from "@/context/ToastContext";
import { useBookmarks, useTheme } from "@/store/hooks";
import {
  selectSettings, updateNotifications, setDensity,
  setReducedMotion, setSoundEnabled, resetSettings,
} from "@/store/slices/settingsSlice";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const { theme, toggle: toggleTheme } = useTheme();
  const { clearAll: clearBookmarks, jobIds: bookmarked } = useBookmarks();
  const toast = useToast();

  const onNotifChange = (key, value) => {
    dispatch(updateNotifications({ [key]: value }));
    toast.success("Preference saved");
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="display-heading text-3xl text-ink">Settings</h1>
          <p className="text-sm text-ink-2 mt-1">
            Notifications, appearance, and account preferences.
          </p>
        </div>

        {/* Notifications */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-ink flex items-center gap-2">
              <Bell className="h-4 w-4 text-ink-2" />
              Notifications
            </h2>
            <p className="text-xs text-ink-3 mt-0.5">Choose how Placely reaches you</p>
          </Card.Header>
          <div className="divide-y divide-border">
            <ToggleRow
              icon={Mail}
              label="Email notifications"
              hint="Job matches, status changes, weekly digest"
              checked={settings.notifications.email}
              onChange={(v) => onNotifChange("email", v)}
            />
            <ToggleRow
              icon={MessageSquare}
              label="SMS alerts"
              hint="Critical updates only — OAs, interviews"
              checked={settings.notifications.sms}
              onChange={(v) => onNotifChange("sms", v)}
            />
            <ToggleRow
              icon={Smartphone}
              label="Push notifications"
              hint="Browser & mobile app"
              checked={settings.notifications.push}
              onChange={(v) => onNotifChange("push", v)}
            />
            <div className="px-5 py-3.5 flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-surface-tint flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4 text-ink-2" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">Email digest frequency</p>
                <p className="text-xs text-ink-3 mt-0.5">Roundup of new jobs and updates</p>
              </div>
              <select
                value={settings.notifications.digest}
                onChange={(e) => onNotifChange("digest", e.target.value)}
                className="h-9 px-3 rounded-lg bg-surface border border-border text-sm focus:border-accent focus:outline-none"
              >
                <option value="off">Off</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-ink flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-4 w-4 text-ink-2" /> : <Sun className="h-4 w-4 text-ink-2" />}
              Appearance
            </h2>
          </Card.Header>
          <div className="divide-y divide-border">
            <div className="px-5 py-3.5 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">Theme</p>
                <p className="text-xs text-ink-3 mt-0.5">Currently using {theme} mode</p>
              </div>
              <Button variant="secondary" size="sm" onClick={toggleTheme}>
                Switch to {theme === "light" ? "dark" : "light"}
              </Button>
            </div>
            <div className="px-5 py-3.5 flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-surface-tint flex items-center justify-center shrink-0">
                <Type className="h-4 w-4 text-ink-2" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">Density</p>
                <p className="text-xs text-ink-3 mt-0.5">Comfortable or compact spacing</p>
              </div>
              <Segmented
                value={settings.density}
                onChange={(v) => dispatch(setDensity(v))}
                options={[
                  { value: "comfortable", label: "Comfortable" },
                  { value: "compact", label: "Compact" },
                ]}
              />
            </div>
            <ToggleRow
              icon={Volume2}
              label="Sound effects"
              hint="Subtle clicks on key actions"
              checked={settings.soundEnabled}
              onChange={(v) => dispatch(setSoundEnabled(v))}
            />
            <ToggleRow
              icon={Globe}
              label="Reduced motion"
              hint="Disable animations and transitions"
              checked={settings.reducedMotion}
              onChange={(v) => dispatch(setReducedMotion(v))}
            />
          </div>
        </Card>

        {/* Data & privacy */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-ink">Data &amp; privacy</h2>
          </Card.Header>
          <div className="divide-y divide-border">
            <div className="px-5 py-3.5 flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-surface-tint flex items-center justify-center shrink-0">
                <Bookmark className="h-4 w-4 text-ink-2" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">Saved jobs</p>
                <p className="text-xs text-ink-3 mt-0.5">{bookmarked.length} bookmarked</p>
              </div>
              <Button variant="secondary" size="sm" onClick={clearBookmarks} disabled={bookmarked.length === 0}>
                Clear all
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="border-danger/20">
          <Card.Header>
            <h2 className="font-semibold text-ink flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-danger" />
              Danger zone
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">Reset all preferences</p>
                <p className="text-xs text-ink-3 mt-0.5">
                  Restores notifications, density, and motion to defaults.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  dispatch(resetSettings());
                  toast.warning("Settings reset", "All preferences restored to defaults");
                }}
              >
                Reset
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </PageTransition>
  );
}

function ToggleRow({ icon: Icon, label, hint, checked, onChange }) {
  return (
    <div className="px-5 py-3.5 flex items-center gap-4">
      <div className="h-8 w-8 rounded-lg bg-surface-tint flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-ink-2" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {hint && <p className="text-xs text-ink-3 mt-0.5">{hint}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors duration-200",
        checked ? "bg-accent" : "bg-border-strong"
      )}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow-sm"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="inline-flex bg-surface-tint rounded-lg p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-7 px-3 rounded-md text-xs font-medium transition-all",
            value === o.value ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink-2"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
