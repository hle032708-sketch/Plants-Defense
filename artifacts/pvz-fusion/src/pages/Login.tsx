import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useLogin } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate: login, isPending } = useLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(["/api/user"], data);
        toast({ title: t("login.success"), description: t("login.welcome") });
        window.location.href = "/";
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err.message || "Failed to login" });
      }
    }
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login({ data: values });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl glass-card border-t-primary/30">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-4 ring-1 ring-primary/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">{t("login.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("login.subtitle")}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" className="bg-background/50 border-border h-12 rounded-xl focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="bg-background/50 border-border h-12 rounded-xl focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full h-12 text-base font-bold rounded-xl glow-green mt-2">
              {isPending ? "Logging in..." : t("login.submit")}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account? <Link href="/register" className="text-primary hover:underline font-medium">Register here</Link>
        </div>
      </div>
    </div>
  );
}
