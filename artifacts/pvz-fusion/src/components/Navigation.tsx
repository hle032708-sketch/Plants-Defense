import { Link } from "wouter";
import { Gamepad2, Menu, LogIn, LogOut, Settings, Shield } from "lucide-react";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "./Sidebar";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";

export function Navigation() {
  const { t, language, setLanguage } = useLanguage();
  const { data: user } = useGetMe();
  const { mutate: logout } = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        window.location.href = "/";
      }
    }
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-lg flex items-center">
      <div className="flex items-center w-full px-4 gap-3">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-border bg-sidebar">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarContent onNavigate={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="p-1.5 rounded-lg bg-primary/20 ring-1 ring-primary/30">
            <Gamepad2 className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display font-bold tracking-tight">
            PvZ <span className="text-primary text-shadow">Hub</span>
          </span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 rounded-xl">
                <span className="uppercase text-xs font-bold">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => setLanguage("vi")} className="text-sm cursor-pointer">
                🇻🇳 Tiếng Việt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("en")} className="text-sm cursor-pointer">
                🇺🇸 English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-border mx-1" />

          {!user ? (
            <Link href="/login">
              <Button size="sm" className="h-9 px-4 rounded-xl gap-2 glow-green text-xs font-bold">
                <LogIn className="h-4 w-4" />
                {t("nav.login")}
              </Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs truncate max-w-[100px]">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user.role === "ADMIN" && (
                  <Link href="/admin">
                    <DropdownMenuItem className="cursor-pointer gap-2 text-primary font-medium">
                      <Shield className="h-4 w-4" />
                      {t("nav.admin")}
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
