import { useState } from "react";
import { Shield, Plus, Edit2, Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { 
  useGetMe, useGetMods, useCreateMod, useUpdateMod, useDeleteMod,
  useGetFusions, useCreateFusion, useUpdateFusion, useDeleteFusion,
  useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory
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

// Forms Schemas
const modSchema = z.object({
  title: z.string().min(1),
  version: z.string().min(1),
  description: z.string().min(1),
  changelog: z.string().optional(),
  imageUrl: z.string().min(1),
  fileUrl: z.string().min(1)
});

const fusionSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  recipe: z.string().min(1),
  ability: z.string().min(1),
  imageUrl: z.string().min(1),
  fileUrl: z.string().optional(),
  videoUrl: z.string().optional()
});

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  imageUrl: z.string().optional(),
  linkUrl: z.string().optional()
});

export default function Admin() {
  const { t } = useLanguage();
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
        <TabsList className="bg-card/50 border border-border rounded-xl p-1 mb-6">
          <TabsTrigger value="mods" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Mods</TabsTrigger>
          <TabsTrigger value="fusions" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Fusions</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mods">
          <AdminModsTab />
        </TabsContent>
        <TabsContent value="fusions">
          <AdminFusionsTab />
        </TabsContent>
        <TabsContent value="categories">
          <AdminCategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminModsTab() {
  const { data: mods } = useGetMods();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const createMod = useCreateMod({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/mods"] });
        setDialogOpen(false);
        toast({ title: "Mod Created" });
      }
    }
  });

  const updateMod = useUpdateMod({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/mods"] });
        setDialogOpen(false);
        toast({ title: "Mod Updated" });
      }
    }
  });

  const deleteMod = useDeleteMod({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/mods"] });
        toast({ title: "Mod Deleted" });
      }
    }
  });

  const form = useForm<z.infer<typeof modSchema>>({
    resolver: zodResolver(modSchema),
    defaultValues: { title: "", version: "", description: "", changelog: "", imageUrl: "", fileUrl: "" }
  });

  const openNew = () => {
    setEditingId(null);
    form.reset({ title: "", version: "", description: "", changelog: "", imageUrl: "", fileUrl: "" });
    setDialogOpen(true);
  };

  const openEdit = (mod: any) => {
    setEditingId(mod.id);
    form.reset(mod);
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof modSchema>) => {
    if (editingId) updateMod.mutate({ id: editingId, data: values });
    else createMod.mutate({ data: values });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Mod
        </Button>
      </div>

      <div className="bg-card/40 border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-card/80 border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Version</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {mods?.map(m => (
              <tr key={m.id} className="hover:bg-background/50">
                <td className="px-4 py-3 font-medium">{m.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.version}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Edit2 className="w-4 h-4 text-primary" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm("Delete this mod?")) deleteMod.mutate({ id: m.id });
                  }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {(!mods || mods.length === 0) && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No mods found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl bg-card border-border">
          <DialogHeader><DialogTitle>{editingId ? "Edit Mod" : "New Mod"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({field}) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="version" render={({field}) => (
                  <FormItem><FormLabel>Version</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="imageUrl" render={({field}) => (
                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="fileUrl" render={({field}) => (
                <FormItem><FormLabel>Download URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({field}) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="changelog" render={({field}) => (
                <FormItem><FormLabel>Changelog</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
              )} />
              <div className="flex justify-end pt-4"><Button type="submit" disabled={createMod.isPending || updateMod.isPending}>Save</Button></div>
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

  const createOp = useCreateFusion({ onSuccess: () => { queryClient.invalidateQueries({queryKey:["/api/fusions"]}); setDialogOpen(false); } });
  const updateOp = useUpdateFusion({ onSuccess: () => { queryClient.invalidateQueries({queryKey:["/api/fusions"]}); setDialogOpen(false); } });
  const deleteOp = useDeleteFusion({ onSuccess: () => queryClient.invalidateQueries({queryKey:["/api/fusions"]}) });

  const form = useForm<z.infer<typeof fusionSchema>>({
    resolver: zodResolver(fusionSchema),
    defaultValues: { name: "", type: "Plant", recipe: "", ability: "", imageUrl: "", fileUrl: "", videoUrl: "" }
  });

  const openNew = () => { setEditingId(null); form.reset({ name: "", type: "Plant", recipe: "", ability: "", imageUrl: "", fileUrl: "", videoUrl: "" }); setDialogOpen(true); };
  const openEdit = (item: any) => { setEditingId(item.id); form.reset(item); setDialogOpen(true); };
  const onSubmit = (v: any) => editingId ? updateOp.mutate({ id: editingId, data: v }) : createOp.mutate({ data: v });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2 bg-primary"><Plus className="w-4 h-4"/> Add Fusion</Button>
      </div>
      <div className="bg-card/40 border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-card/80 border-b border-border text-muted-foreground">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {fusions?.map(f => (
              <tr key={f.id}>
                <td className="px-4 py-3">{f.name}</td><td className="px-4 py-3">{f.type}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Edit2 className="w-4 h-4 text-primary" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => confirm("Delete?") && deleteOp.mutate({ id: f.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border"><DialogHeader><DialogTitle>{editingId?"Edit":"New"} Fusion</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({field}) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="type" render={({field}) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="Plant">Plant</SelectItem><SelectItem value="Zombie">Zombie</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="imageUrl" render={({field}) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="recipe" render={({field}) => (<FormItem><FormLabel>Recipe</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="ability" render={({field}) => (<FormItem><FormLabel>Ability</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
              <div className="flex justify-end pt-4"><Button type="submit">Save</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminCategoriesTab() {
  const { data: categories } = useGetCategories();
  const createOp = useCreateCategory({ onSuccess: () => queryClient.invalidateQueries({queryKey:["/api/categories"]}) });
  const deleteOp = useDeleteCategory({ onSuccess: () => queryClient.invalidateQueries({queryKey:["/api/categories"]}) });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => {
          const name = prompt("Category Name:");
          if (name) createOp.mutate({ data: { name, slug: name.toLowerCase().replace(/\s+/g, '-'), imageUrl: "", linkUrl: "" } });
        }} className="gap-2 bg-primary"><Plus className="w-4 h-4"/> Add Category</Button>
      </div>
      <div className="bg-card/40 border border-border rounded-xl p-4">
        {categories?.map(c => (
          <div key={c.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
            <span className="font-medium">{c.name} <span className="text-muted-foreground text-sm ml-2">(/category/{c.slug})</span></span>
            <Button variant="ghost" size="icon" onClick={() => confirm("Delete?") && deleteOp.mutate({ id: c.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
