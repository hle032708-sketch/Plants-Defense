export function Footer() {
  return (
    <footer className="border-t border-border bg-background/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <p className="text-sm text-muted-foreground font-display">
            © {new Date().getFullYear()} PvZ Fusion Hub. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Not affiliated with PopCap Games or EA. Community driven wiki.
          </p>
        </div>
        <div className="text-[10px] font-gaming text-primary/50 tracking-widest">
          VERSION 1.0
        </div>
      </div>
    </footer>
  );
}
