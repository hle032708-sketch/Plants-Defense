import { useEffect, useState } from "react";
import { Wrench, ExternalLink, RefreshCw } from "lucide-react";

type Server = { id: number; name: string; url: string };

export default function Maintenance() {
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    fetch("/api/servers", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setServers)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative grid h-24 w-24 place-items-center rounded-full border border-primary/30 bg-card/60 backdrop-blur-sm shadow-[0_0_40px_rgba(34,197,94,0.15)]">
              <Wrench className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
            Web đang <span className="text-primary">bảo trì</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Hãy quay lại sau hoặc thử các server khác bên dưới.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </button>

        {servers.length > 0 && (
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-5 text-left space-y-3">
            <p className="text-xs font-gaming text-primary tracking-widest uppercase">Server khác</p>
            <div className="space-y-2">
              {servers.map(sv => (
                <a
                  key={sv.id}
                  href={sv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-4 py-3 hover:border-primary/40 hover:bg-card/60 transition-all group"
                >
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{sv.name}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
