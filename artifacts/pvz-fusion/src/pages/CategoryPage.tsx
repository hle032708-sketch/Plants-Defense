import { useParams } from "wouter";
import { useGetCategories, useGetCategoryItems } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/SectionHeader";
import { Layers } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { MediaCard } from "@/components/MediaCard";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories } = useGetCategories();
  
  const category = categories?.find(c => c.slug === slug);
  const { data: items, isLoading } = useGetCategoryItems(category?.id ?? 0, { query: { enabled: !!category?.id } as any });

  if (!category && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {category && (
        <SectionHeader
          eyebrow="CATEGORY"
          title={category.name}
          description={category.linkUrl && (
            <a href={category.linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              External Link →
            </a>
          )}
        />
      )}

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-card/40 animate-pulse border border-border/50" />)}
          </div>
        ) : !items || items.length === 0 ? (
          <EmptyState
            icon={<Layers className="w-8 h-8 text-primary" />}
            title="No items found"
            description="This category is currently empty."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <MediaCard
                key={item.id}
                title={item.title}
                subtitle={item.description || undefined}
                imageUrl={item.imageUrl || ""}
                tone="primary"
                actions={
                  item.linkUrl && (
                    <a href={item.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-bold">
                      VISIT
                    </a>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
