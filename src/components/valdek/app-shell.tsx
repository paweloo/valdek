import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, FileText, Scale, Menu, ShieldCheck } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useValdek } from "@/lib/store";
import { monthLabel, seasonMonths } from "@/lib/polish";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Pulpit", icon: LayoutDashboard },
  { to: "/uczestnicy", label: "Uczestnicy", icon: Users },
  { to: "/wyciag", label: "Wyciąg", icon: FileText },
  { to: "/rozliczenie", label: "Rozliczenie", icon: Scale },
] as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-md bg-primary font-display text-xl leading-none text-primary-foreground">
        V
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-2xl">Valdek</span>
        <span className="mt-1 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Kasa teatralna
        </span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MonthSelect() {
  const seasonStartYear = useValdek((s) => s.seasonStartYear);
  const selectedMonth = useValdek((s) => s.selectedMonth);
  const setMonth = useValdek((s) => s.setMonth);
  const months = seasonMonths(seasonStartYear);
  return (
    <Select value={selectedMonth} onValueChange={setMonth}>
      <SelectTrigger className="h-11 w-full min-w-44 md:w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {months.map((m) => (
          <SelectItem key={m} value={m}>
            {monthLabel(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-[1440px]">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-sidebar p-5 md:flex">
          <Brand />
          <div className="curtain-rule my-6" />
          <NavLinks />
          <div className="mt-auto rounded-lg bg-secondary p-3">
            <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              Pliki i wpłaty zostają na tym komputerze. Nic nie wychodzi do sieci.
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-8">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <Brand />
                </SheetHeader>
                <NavLinks />
              </SheetContent>
            </Sheet>
            <div className="md:hidden">
              <Brand />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <MonthSelect />
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>

      <nav className="fixed right-0 bottom-0 left-0 z-40 grid grid-cols-4 border-t border-border bg-sidebar md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px]",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
