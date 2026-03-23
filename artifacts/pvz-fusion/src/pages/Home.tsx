import { Link } from "wouter";
import { Gamepad2, Sparkles, Video, ArrowRight, Activity, Download } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useGetMods, useGetFusions, useGetVideos } from "@workspace/api-client-react";

export default function Home() {
  const { t } = useLanguage();
  const { data: mods } = useGetMods();
  const { data: fusions } = useGetFusions();
  const { data: videos } = useGetVideos();

  const recentMods = mods?.slice(0, 3) || [];
  const featuredFusions = fusions?.slice(0, 4) || [];
  const recentVideos = videos?.slice(0, 3) || [];

  return (
    <div className="pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden h-[340px] md:h-[400px] border-b border-border">
        {/* landing page hero scenic dark gaming garden pixel art style */}
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="PvZ Fusion Hub Hero"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 hero-grid opacity-30" />

        <div className="relative h-full flex flex-col justify-center px-6 md:px-12 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 rounded-full px-3 py-1.5 w-fit mb-4 backdrop-blur-md">
            <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-xs font-gaming text-primary tracking-widest">COMMUNITY WIKI</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-shadow text-white leading-tight mb-3">
            PvZ Fusion <span className="text-primary">Hub</span>
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-6">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/mods">
              <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all glow-green hover:-translate-y-0.5">
                <Download className="h-4 w-4" />
                {t("hero.cta.mods")}
              </button>
            </Link>
            <Link href="/dex">
              <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 backdrop-blur-md px-6 py-3 text-sm font-bold text-foreground hover:bg-card hover:border-primary/50 transition-all hover:-translate-y-0.5">
                <Sparkles className="h-4 w-4 text-secondary" />
                {t("hero.cta.dex")}
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* Latest Mods Section */}
        <section className="wiki-panel">
          <div className="wiki-section-title">
            <Gamepad2 className="w-5 h-5 text-primary" />
            <span className="uppercase">{t("mods.title")}</span>
          </div>
          <div className="wiki-section-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentMods.map((mod) => (
                <div key={mod.id} className="flex gap-4 p-3 rounded-lg border border-border bg-background/50 hover:border-primary/30 transition-colors">
                  <div className="h-16 w-16 rounded-md overflow-hidden shrink-0 bg-muted">
                    <img src={mod.imageUrl} alt={mod.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{mod.title}</h4>
                    <p className="text-xs text-muted-foreground">v{mod.version}</p>
                    <Link href="/mods" className="text-xs text-primary hover:underline mt-1">
                      Download →
                    </Link>
                  </div>
                </div>
              ))}
              {recentMods.length === 0 && <p className="text-muted-foreground text-sm">No mods yet.</p>}
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/mods" className="text-sm text-primary flex items-center gap-1 hover:underline font-medium">
                View all mods <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Fusions */}
        <section className="wiki-panel">
          <div className="wiki-section-title secondary">
            <Sparkles className="w-5 h-5 text-secondary" />
            <span className="uppercase">{t("dex.title")}</span>
          </div>
          <div className="wiki-section-body">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featuredFusions.map((fusion) => (
                <div key={fusion.id} className="flex flex-col items-center p-4 rounded-lg border border-border bg-background/50 text-center hover:bg-card/80 transition-colors hover-elevate">
                  <div className="h-20 w-20 mb-3 drop-shadow-lg">
                    <img src={fusion.imageUrl} alt={fusion.name} className="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{fusion.name}</h4>
                  <span className="text-[10px] uppercase font-bold text-secondary tracking-wider mt-1 bg-secondary/10 px-2 py-0.5 rounded-full">
                    {fusion.type}
                  </span>
                </div>
              ))}
              {featuredFusions.length === 0 && <p className="text-muted-foreground text-sm col-span-full">No fusions documented yet.</p>}
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/dex" className="text-sm text-secondary flex items-center gap-1 hover:underline font-medium">
                Open FusionDex <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Videos */}
        <section className="wiki-panel">
          <div className="wiki-section-title accent">
            <Video className="w-5 h-5 text-accent" />
            <span className="uppercase">{t("videos.title")}</span>
          </div>
          <div className="wiki-section-body">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentVideos.map((video) => (
                <div key={video.id} className="rounded-lg overflow-hidden border border-border bg-background hover-elevate group">
                  <div className="aspect-video relative bg-muted">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-accent/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-110 transition-transform">
                        <div className="ml-1 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm line-clamp-2">{video.title}</h4>
                  </div>
                </div>
              ))}
              {recentVideos.length === 0 && <p className="text-muted-foreground text-sm col-span-full">No videos available.</p>}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
