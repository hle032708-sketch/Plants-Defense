import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-card/40 p-8",
        "shadow-[0_28px_90px_-70px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      <div className="absolute -top-20 right-0 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-black/30 ring-1 ring-white/10">
            {icon}
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</div>
          </div>
        </div>
        {action ? <div className="w-full sm:w-auto">{action}</div> : null}
      </div>
    </div>
  );
}
