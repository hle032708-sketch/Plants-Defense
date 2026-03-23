import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  tone?: "primary" | "secondary" | "accent";
  badges?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MediaCard({
  title,
  subtitle,
  imageUrl,
  tone = "primary",
  badges,
  actions,
  onClick,
  className,
}: MediaCardProps) {
  const accentColor = {
    primary: "group-hover:shadow-[0_15px_40px_-20px_hsl(var(--primary)/0.5)] group-hover:border-primary/30",
    secondary: "group-hover:shadow-[0_15px_40px_-20px_hsl(var(--secondary)/0.45)] group-hover:border-secondary/30",
    accent: "group-hover:shadow-[0_15px_40px_-20px_hsl(var(--accent)/0.5)] group-hover:border-accent/30",
  }[tone];

  const getImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1616010515328-98e3fb58b9f0?w=600&h=400&fit=crop"; // placeholder retro pattern
    if (url.startsWith("/objects/")) return `/api${url}`;
    if (url.startsWith("/uploads/")) return `/api${url}`;
    return url;
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl glass-card",
        "transition-all duration-300 ease-out hover:-translate-y-1",
        accentColor,
        className
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn("absolute inset-0 z-10", onClick ? "cursor-pointer" : "cursor-default")}
      />

      <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-muted/30">
        <img
          src={getImageUrl(imageUrl)}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />

        {badges && (
          <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
            {badges}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base text-foreground leading-snug truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="relative z-20 shrink-0 pt-0.5">{actions}</div>
          )}
        </div>
      </div>
    </div>
  );
}
