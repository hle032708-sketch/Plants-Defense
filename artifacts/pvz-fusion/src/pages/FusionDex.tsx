import { useState, useMemo } from "react";
import { Sparkles, Search, Zap, Leaf } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useGetFusions } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/SectionHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Fusion } from "@workspace/api-client-react/src/generated/api.schemas";

export default function FusionDex() {
  const { t } = useLanguage();
  const { data: fusions, isLoading } = useGetFusions();
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Plant" | "Zombie">("All");
  const [selectedFusion, setSelectedFusion] = useState<Fusion | null>(null);

  const filtered = useMemo(() => {
    if (!fusions) return [];
    return fusions.filter(f => {
      const matchQ = f.name.toLowerCase().includes(query.toLowerCase()) || f.recipe.toLowerCase().includes(query.toLowerCase());
      const matchT = filterType === "All" || f.type.toLowerCase() === filterType.toLowerCase();
      return matchQ && matchT;
    });
  }, [fusions, query, filterType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <SectionHeader
        eyebrow="DATABASE"
        title={t("dex.title")}
        description={t("dex.subtitle")}
        right={
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex p-1 bg-card/50 border border-border rounded-xl">
              {["All", "Plant", "Zombie"].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                    filterType === type ? "bg-secondary text-secondary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {type === "All" ? t("dex.filter.all") : type === "Plant" ? t("dex.filter.plant") : t("dex.filter.zombie")}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("dex.search")}
                className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border rounded-xl text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all h-full"
              />
            </div>
          </div>
        }
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-card/40 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filtered.map(fusion => (
              <div
                key={fusion.id}
                onClick={() => setSelectedFusion(fusion)}
                className="group cursor-pointer relative bg-card/40 border border-border rounded-2xl p-4 flex flex-col items-center text-center hover:bg-secondary/10 hover:border-secondary/50 transition-all hover-elevate overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/90 z-0" />
                <div className="relative z-10 w-24 h-24 mb-4 drop-shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                  <img src={fusion.imageUrl} alt={fusion.name} className="w-full h-full object-contain" />
                </div>
                <div className="relative z-10 mt-auto w-full">
                  <h3 className="font-bold text-foreground text-sm leading-tight mb-1">{fusion.name}</h3>
                  <Badge variant="outline" className={cn(
                    "text-[10px] px-2 py-0 uppercase border-white/10",
                    fusion.type.toLowerCase() === 'plant' ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                  )}>
                    {fusion.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/20">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground">No fusions found</h3>
          </div>
        )}
      </div>

      <Dialog open={!!selectedFusion} onOpenChange={(o) => !o && setSelectedFusion(null)}>
        <DialogContent className="max-w-md bg-card border-border sm:rounded-3xl p-0 overflow-hidden">
          {selectedFusion && (
            <div className="flex flex-col">
              <div className="relative h-48 bg-gradient-to-br from-secondary/20 to-background flex items-center justify-center p-6 border-b border-border">
                <img src={selectedFusion.imageUrl} alt={selectedFusion.name} className="h-full w-auto object-contain drop-shadow-2xl" />
              </div>
              <div className="p-6">
                <DialogHeader className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={cn(
                      "uppercase font-bold tracking-wider",
                      selectedFusion.type.toLowerCase() === 'plant' ? "bg-primary/10 text-primary border-primary/20" : "bg-accent/10 text-accent border-accent/20"
                    )}>
                      {selectedFusion.type}
                    </Badge>
                  </div>
                  <DialogTitle className="text-3xl font-display">{selectedFusion.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="wiki-panel">
                    <div className="wiki-section-title text-xs !py-1.5 bg-background">
                      <Leaf className="w-3 h-3 text-primary" /> RECIPE
                    </div>
                    <div className="wiki-section-body py-2 px-3 text-sm text-foreground/90 font-medium">
                      {selectedFusion.recipe}
                    </div>
                  </div>
                  
                  <div className="wiki-panel">
                    <div className="wiki-section-title secondary text-xs !py-1.5 bg-background">
                      <Zap className="w-3 h-3 text-secondary" /> ABILITY
                    </div>
                    <div className="wiki-section-body py-3 px-4 text-sm text-muted-foreground leading-relaxed">
                      {selectedFusion.ability}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setSelectedFusion(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
