import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  right,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-white/5 pb-6", className)}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          {eyebrow && (
            <div className="text-xs font-gaming text-primary tracking-widest uppercase">
              {eyebrow}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
              {description}
            </p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </div>
  );
}
