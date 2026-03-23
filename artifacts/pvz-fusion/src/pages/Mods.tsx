import { useState, useMemo } from "react";
import { Download, Search, Gamepad2, FileText, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useGetMods } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/SectionHeader";
import { MediaCard } from "@/components/MediaCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Mod } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Mods() {
  const { t } = useLanguage();
  const { data: mods, isLoading } = useGetMods();
  const [query, setQuery] = useState("");
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);

  const filteredMods = useMemo(() => {
    if (!mods) return [];
    const q = query.toLowerCase();
    return mods.filter(m => 
      m.title.toLowerCase().includes(q) || 
      m.description.toLowerCase().includes(q)
    );
  }, [mods, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <SectionHeader
        eyebrow="DOWNLOADS"
        title={t("mods.title")}
        description={t("mods.subtitle")}
        right={
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("mods.search")}
              className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        }
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-card/40 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : filteredMods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMods.map(mod => (
              <MediaCard
                key={mod.id}
                title={mod.title}
                subtitle={mod.description}
                imageUrl={mod.imageUrl}
                tone="primary"
                badges={
                  <Badge variant="secondary" className="bg-primary/90 text-white border-none font-bold shadow-lg">
                    v{mod.version}
                  </Badge>
                }
                onClick={() => setSelectedMod(mod)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/20">
            <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground">No mods found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedMod} onOpenChange={(o) => !o && setSelectedMod(null)}>
        <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden gap-0">
          {selectedMod && (
            <>
              <div className="relative h-64 bg-muted w-full">
                <img src={selectedMod.imageUrl} alt={selectedMod.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <Badge className="absolute top-4 left-4 bg-primary text-white border-none shadow-lg">
                  Version {selectedMod.version}
                </Badge>
              </div>
              <div className="p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-3xl font-display text-foreground">{selectedMod.title}</DialogTitle>
                  <DialogDescription className="text-base text-muted-foreground mt-2">
                    {selectedMod.description}
                  </DialogDescription>
                </DialogHeader>

                {selectedMod.changelog && (
                  <div className="mt-6 mb-8">
                    <h4 className="text-sm font-gaming text-muted-foreground mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> CHANGELOG
                    </h4>
                    <ScrollArea className="h-32 rounded-lg border border-border bg-background/50 p-4">
                      <pre className="text-sm text-foreground/80 font-sans whitespace-pre-wrap">
                        {selectedMod.changelog}
                      </pre>
                    </ScrollArea>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                  <Button variant="ghost" onClick={() => setSelectedMod(null)}>
                    {t("common.close")}
                  </Button>
                  <Button asChild className="glow-green gap-2 px-6">
                    <a href={selectedMod.fileUrl} target="_blank" rel="noreferrer">
                      <Download className="w-4 h-4" />
                      {t("common.download")}
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
