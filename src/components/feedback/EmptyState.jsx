import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("text-center py-16 px-4", className)}>
      {Icon && (
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-tint border border-border mb-4">
          <Icon className="h-6 w-6 text-ink-3" />
        </div>
      )}
      <h3 className="font-display italic text-xl text-ink">{title}</h3>
      {description && <p className="mt-2 text-sm text-ink-2 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn("skeleton h-4 w-full", className)} />;
}
