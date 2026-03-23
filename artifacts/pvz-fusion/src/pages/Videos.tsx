import { useState, useMemo } from "react";
import { Video, Search, PlayCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useGetVideos } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/SectionHeader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function Videos() {
  const { t } = useLanguage();
  const { data: videos, isLoading } = useGetVideos();
  const [query, setQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!videos) return [];
    return videos.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));
  }, [videos, query]);

  // Extract youtube ID for embed
  const getEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const v = urlObj.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <SectionHeader
        eyebrow="MEDIA"
        title={t("videos.title")}
        description={t("videos.subtitle")}
        right={
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("videos.search")}
              className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all"
            />
          </div>
        }
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="aspect-video rounded-2xl bg-card/40 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(video => (
              <div 
                key={video.id} 
                className="group rounded-2xl overflow-hidden border border-border bg-card/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/10 transition-all cursor-pointer"
                onClick={() => setActiveVideo(video.youtubeUrl)}
              >
                <div className="aspect-video relative bg-black overflow-hidden">
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-accent/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6 ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">{video.title}</h3>
                  {video.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/20">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground">No videos found</h3>
          </div>
        )}
      </div>

      <Dialog open={!!activeVideo} onOpenChange={(o) => !o && setActiveVideo(null)}>
        <DialogContent className="max-w-4xl bg-black border-border p-0 overflow-hidden sm:rounded-2xl">
          <DialogTitle className="sr-only">Watch Video</DialogTitle>
          {activeVideo && (
            <div className="aspect-video w-full">
              <iframe
                src={getEmbedUrl(activeVideo)}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
