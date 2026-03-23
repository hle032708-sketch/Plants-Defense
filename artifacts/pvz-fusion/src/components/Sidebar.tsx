import { Link, useLocation } from "wouter";
import { Gamepad2, Sparkles, Video, Home, Layers, Shield, LogIn, UserPlus } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useGetMe, useGetCategories } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

function NavItem({ href, icon: Icon, label, active, onClick }: any) {
  return (
    <Link href={href} onClick={onClick}>
      <span className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
        active 
          ? "bg-primary/20 text-primary glow-on-hover" 
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      )}>
        <Icon className={cn("w-4 h-4", active ? "text-primary" : "opacity-70")} />
        {label}
      </span>
    </Link>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const { data: user } = useGetMe();
  const { data: categories } = useGetCategories();

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-4">
      <Link href="/" onClick={onNavigate}>
        <div className="flex items-center gap-3 mb-8 px-2 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-tight tracking-wide text-foreground">
              PvZ <span className="text-primary text-shadow">Fusion</span>
            </div>
            <div className="text-[10px] font-gaming text-muted-foreground tracking-widest">WIKI HUB</div>
          </div>
        </div>
      </Link>

      <div className="space-y-6 flex-1">
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-gaming tracking-widest text-muted-foreground mb-2">
            MAIN MENU
          </div>
          <NavItem href="/" icon={Home} label={t("nav.home")} active={location === "/"} onClick={onNavigate} />
          <NavItem href="/mods" icon={Gamepad2} label={t("nav.mods")} active={location === "/mods"} onClick={onNavigate} />
          <NavItem href="/dex" icon={Sparkles} label={t("nav.dex")} active={location === "/dex"} onClick={onNavigate} />
          <NavItem href="/videos" icon={Video} label={t("nav.videos")} active={location === "/videos"} onClick={onNavigate} />
        </div>

        {categories && categories.length > 0 && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-gaming tracking-widest text-muted-foreground mb-2">
              {t("nav.categories").toUpperCase()}
            </div>
            {categories.map((cat) => (
              <NavItem 
                key={cat.id} 
                href={`/category/${cat.slug}`} 
                icon={Layers} 
                label={cat.name} 
                active={location === `/category/${cat.slug}`} 
                onClick={onNavigate} 
              />
            ))}
          </div>
        )}

        <div className="space-y-1">
          <div className="px-3 text-[10px] font-gaming tracking-widest text-muted-foreground mb-2">
            ACCOUNT
          </div>
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <NavItem href="/admin" icon={Shield} label={t("nav.admin")} active={location === "/admin"} onClick={onNavigate} />
              )}
            </>
          ) : (
            <>
              <NavItem href="/login" icon={LogIn} label={t("nav.login")} active={location === "/login"} onClick={onNavigate} />
              <NavItem href="/register" icon={UserPlus} label="Register" active={location === "/register"} onClick={onNavigate} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-sidebar backdrop-blur-xl">
      <SidebarContent />
    </aside>
  );
}
