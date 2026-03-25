import { useState, useRef } from "react";
import { Shield, Plus, Edit2, Trash2, Upload, Link as LinkIcon, X } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import {
  useGetMe, useGetMods, useCreateMod, useUpdateMod, useDeleteMod,
  useGetFusions, useCreateFusion, useUpdateFusion, useDeleteFusion,
  useGetVideos, useCreateVideo, useUpdateVideo, useDeleteVideo,
  useGetCategories, useCreateCategory, useDeleteCategory
} from "@workspace/api-client-react";
import { SectionHeader } from "@/components/SectionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const modSchema = z.object({
  title: z.string().min(1),
  version: z.string().min(1),
  description: z.string().min(1),
  changelog: z.string().optional(),
  imageUrl: z.string().optional(),
  fileUrl: z.string().optional(),
});

const fusionSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  recipe: z.string().min(1),
  ability: z.string().min(1),
  imageUrl: z.string().optional(),
  fileUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

const videoSchema = z.object({
  title: z.string().min(1),
  youtubeUrl: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  description: z.string().optional(),
});

function ImageInput({ value, onChange, label = "Image" }: {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"url" | "file">("url");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      onChange(data.url);
      toast({ title: "Uploaded", description: "Image uploaded successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex rounded-lg overflow-hidden border border-border text-xs">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-3 py-1 flex items-center gap-1 transition-colors ${mode === "url" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
          >
            <LinkIcon className="w-3 h-3" /> URL
          </button>
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-3 py-1 flex items-center gap-1 transition-colors ${mode === "file" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
          >
            <Upload className="w-3 h-3" /> Upload
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <div className="relative">
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://..."
            className="pr-8"
          />
          {value && (
            <button type="button" onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2 border-dashed"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Choose image from device"}
          </Button>
        </div>
      )}

      {value && (
        <div className="mt-1 rounded-lg overflow-hidden border border-border h-24 bg-muted/20">
          <img src={value} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { data: user } = useGetMe();

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Shield className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <SectionHeader
        eyebrow="DASHBOARD"
        title="Admin Console"
        description="Manage your database of mods, fusions, videos, and categories."
      />

      <Tabs defaultValue="mods" className="mt-8">
        <TabsList className="bg-card/50 border border-border rounded-xl p-1 mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="mods" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Mods</TabsTrigger>
          <TabsTrigger value="fusions" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Fusions</TabsTrigger>
          <TabsTrigger value="videos" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Videos</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="mods"><AdminModsTab /></TabsContent>
        <TabsContent value="fusions"><AdminFusionsTab /></TabsContent>
        <TabsContent value="videos"><AdminVideosTab /></TabsContent>
        <TabsContent value="categories"><AdminCategoriesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function AdminModsTab() {
  const { data: mods } = useGetMods();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const createMod = useCreateMod({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/mods"] }); setDialogOpen(false); toast({ title: "Mod Created" }); } } });
  const updateMod = useUpdateMod({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/mods"] }); setDialogOpen(false); toast({ title: "Mod Updated" }); } } });
  const deleteMod = useDeleteMod({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/mods"] }); toast({ title: "Mod Deleted" }); } } });

  const form = useForm<z.infer<typeof modSchema>>({
    resolver: zodResolver(modSchema),
    defaultValues: { title: "", version: "", description: "", changelog: "", imageUrl: "", fileUrl: "" },
  });

  const openNew = () => { setEditingId(null); form.reset({ title: "", version: "", description: "", changelog: "", imageUrl: "", fileUrl: "" }); setDialogOpen(true); };
  const openEdit = (mod: any) => { setEditingId(mod.id); form.reset({ ...mod, imageUrl: mod.imageUrl ?? "", fileUrl: mod.fileUrl ?? "" }); setDialogOpen(true); };
  const onSubmit = (values: z.infer<typeof modSchema>) => {
    if (editingId) updateMod.mutate({ id: editingId, data: values as any });
    else createMod.mutate({ data: values as any });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="w-4 h-4" /> Add Mod</Button>
      </div>
      <AdminTable
        headers={["Title", "Version"]}
        rows={mods?.map(m => ({ id: m.id, cells: [m.title, m.version], raw: m })) ?? []}
        onEdit={openEdit}
        onDelete={id => confirm("Delete this mod?") && deleteMod.mutate({ id })}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Mod" : "New Mod"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="version" render={({ field }) => (<FormItem><FormLabel>Version</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              </div>
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormControl><ImageInput label="Image" value={field.value ?? ""} onChange={field.onChange} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="fileUrl" render={({ field }) => (<FormItem><FormLabel>Download URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="changelog" render={({ field }) => (<FormItem><FormLabel>Changelog</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
              <div className="flex justify-end pt-2"><Button type="submit" disabled={createMod.isPending || updateMod.isPending}>Save</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminFusionsTab() {
  const { data: fusions } = useGetFusions();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const createOp = useCreateFusion({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/fusions"] }); setDialogOpen(false); toast({ title: "Fusion Created" }); } } });
  const updateOp = useUpdateFusion({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/fusions"] }); setDialogOpen(false); toast({ title: "Fusion Updated" }); } } });
  const deleteOp = useDeleteFusion({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/fusions"] }); toast({ title: "Fusion Deleted" }); } } });

  const form = useForm<z.infer<typeof fusionSchema>>({
    resolver: zodResolver(fusionSchema),
    defaultValues: { name: "", type: "Plant", recipe: "", ability: "", imageUrl: "", fileUrl: "", videoUrl: "" },
  });

  const openNew = () => { setEditingId(null); form.reset({ name: "", type: "Plant", recipe: "", ability: "", imageUrl: "", fileUrl: "", videoUrl: "" }); setDialogOpen(true); };
  const openEdit = (item: any) => { setEditingId(item.id); form.reset({ ...item, imageUrl: item.imageUrl ?? "", fileUrl: item.fileUrl ?? "", videoUrl: item.videoUrl ?? "" }); setDialogOpen(true); };
  const onSubmit = (v: any) => editingId ? updateOp.mutate({ id: editingId, data: v }) : createOp.mutate({ data: v });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2 bg-primary"><Plus className="w-4 h-4" /> Add Fusion</Button>
      </div>
      <AdminTable
        headers={["Name", "Type"]}
        rows={fusions?.map(f => ({ id: f.id, cells: [f.name, f.type], raw: f })) ?? []}
        onEdit={openEdit}
        onDelete={id => confirm("Delete?") && deleteOp.mutate({ id })}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Fusion</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="Plant">Plant</SelectItem><SelectItem value="Zombie">Zombie</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormControl><ImageInput label="Image" value={field.value ?? ""} onChange={field.onChange} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="recipe" render={({ field }) => (<FormItem><FormLabel>Recipe</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="ability" render={({ field }) => (<FormItem><FormLabel>Ability</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
              <div className="flex justify-end pt-2"><Button type="submit">Save</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminVideosTab() {
  const { data: videos } = useGetVideos();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const createOp = useCreateVideo({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/videos"] }); setDialogOpen(false); toast({ title: "Video Added" }); } } });
  const updateOp = useUpdateVideo({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/videos"] }); setDialogOpen(false); toast({ title: "Video Updated" }); } } });
  const deleteOp = useDeleteVideo({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/videos"] }); toast({ title: "Video Deleted" }); } } });

  const form = useForm<z.infer<typeof videoSchema>>({
    resolver: zodResolver(videoSchema),
    defaultValues: { title: "", youtubeUrl: "", thumbnailUrl: "", description: "" },
  });

  const openNew = () => { setEditingId(null); form.reset({ title: "", youtubeUrl: "", thumbnailUrl: "", description: "" }); setDialogOpen(true); };
  const openEdit = (item: any) => { setEditingId(item.id); form.reset({ ...item, thumbnailUrl: item.thumbnailUrl ?? "", description: item.description ?? "" }); setDialogOpen(true); };
  const onSubmit = (v: any) => editingId ? updateOp.mutate({ id: editingId, data: v }) : createOp.mutate({ data: v });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2 bg-primary"><Plus className="w-4 h-4" /> Add Video</Button>
      </div>
      <AdminTable
        headers={["Title", "YouTube URL"]}
        rows={videos?.map(v => ({ id: v.id, cells: [v.title, v.youtubeUrl], raw: v })) ?? []}
        onEdit={openEdit}
        onDelete={id => confirm("Delete?") && deleteOp.mutate({ id })}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Video</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="youtubeUrl" render={({ field }) => (<FormItem><FormLabel>YouTube URL</FormLabel><FormControl><Input placeholder="https://youtube.com/watch?v=..." {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="thumbnailUrl" render={({ field }) => (
                <FormItem><FormControl><ImageInput label="Thumbnail" value={field.value ?? ""} onChange={field.onChange} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
              <div className="flex justify-end pt-2"><Button type="submit">Save</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminCategoriesTab() {
  const { data: categories } = useGetCategories();
  const { toast } = useToast();
  const createOp = useCreateCategory({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/categories"] }); toast({ title: "Category Created" }); } } });
  const deleteOp = useDeleteCategory({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/categories"] }); toast({ title: "Category Deleted" }); } } });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => {
          const name = prompt("Category Name:");
          if (name) createOp.mutate({ data: { name, slug: name.toLowerCase().replace(/\s+/g, "-"), imageUrl: "", linkUrl: "" } });
        }} className="gap-2 bg-primary"><Plus className="w-4 h-4" /> Add Category</Button>
      </div>
      <div className="bg-card/40 border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-card/80 border-b border-border text-muted-foreground">
            <tr><th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Slug</th><th className="px-4 py-3 font-semibold text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {categories?.map(c => (
              <tr key={c.id} className="hover:bg-background/50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">/category/{c.slug}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => confirm("Delete?") && deleteOp.mutate({ id: c.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {(!categories || categories.length === 0) && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No categories found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminTable({ headers, rows, onEdit, onDelete }: {
  headers: string[];
  rows: { id: number; cells: string[]; raw: any }[];
  onEdit: (raw: any) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="bg-card/40 border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-card/80 border-b border-border text-muted-foreground">
          <tr>
            {headers.map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-background/50">
              {row.cells.map((cell, i) => (
                <td key={i} className={`px-4 py-3 ${i === 0 ? "font-medium" : "text-muted-foreground"} max-w-[200px] truncate`}>{cell}</td>
              ))}
              <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                <Button variant="ghost" size="icon" onClick={() => onEdit(row.raw)}><Edit2 className="w-4 h-4 text-primary" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={headers.length + 1} className="px-4 py-8 text-center text-muted-foreground">No items found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
