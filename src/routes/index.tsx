import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, Scale, X } from "lucide-react";
import { AppShell } from "@/components/valdek/app-shell";
import { StatusBadge } from "@/components/valdek/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useValdek } from "@/lib/store";
import { fullName, monthLabel } from "@/lib/polish";
import { formatPln } from "@/lib/utils";
import { monthStatusFor } from "@/lib/status";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const selectedMonth = useValdek((s) => s.selectedMonth);
  const allParticipants = useValdek((s) => s.participants);
  const groups = useValdek((s) => s.groups);
  const matches = useValdek((s) => s.matches);
  const allTransfers = useValdek((s) => s.transfers);
  const manual = useValdek((s) => s.manual);
  const seedBanner = useValdek((s) => s.seedBanner);
  const dismissSeedBanner = useValdek((s) => s.dismissSeedBanner);
  const seeded = useValdek((s) => s.seeded);
  const participants = allParticipants.filter((p) => p.active);
  const transfers = allTransfers.filter((t) => !t.ignored && t.direction !== "out");
  const statuses = participants.map((p) => ({
    p,
    ...monthStatusFor(p, selectedMonth, matches, manual),
  }));
  const paid = statuses.filter((s) => s.status === "paid" || s.status === "over").length;
  const review = statuses.filter((s) => s.status === "review" || s.status === "partial").length;
  const unpaidPeople = statuses.filter((s) => s.status === "unpaid");
  const expected = participants.reduce((sum, p) => sum + p.monthlyFee, 0);
  const received = statuses.reduce((sum, s) => sum + s.received, 0);
  const unmatched = transfers.filter((t) => !matches.some((m) => m.transferId === t.id));
  const issues = matches.filter((m) => m.kind === "suggested");

  return (
    <AppShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Statystyki</p>
          <h1 className="font-display mt-1 text-4xl md:text-5xl">{monthLabel(selectedMonth)}</h1>
          {/* <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Wgraj ewidencję z Excela i listę operacji z mBanku. Valdek zestawi nazwiska, grupy i
            kwoty — a kwiatki z tytułów zostawi do Twojej decyzji.
          </p> */}
        </header>
        {seedBanner && seeded ? (
          <div className="flex items-start justify-between gap-4 rounded-xl bg-secondary px-4 py-3">
            <p className="text-sm text-muted-foreground">
              To podgląd na Twojej ewidencji. Wgraj Excel i PDF z mBanku.
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              onClick={dismissSeedBanner}
              aria-label="Zamknij"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : null}
        <section className="grid gap-3 sm:grid-cols-3">
          <Stat
            label="Wpłacono"
            value={`${paid} / ${participants.length}`}
            hint={formatPln(received)}
          />
          <Stat label="Należność miesiąca" value={formatPln(expected)} hint="suma stawek" />
          <Stat
            label="Do wyjaśnienia"
            value={String(issues.length + unmatched.length)}
            hint={`${review} osób · ${unmatched.length} przelewów`}
          />
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          <ActionCard
            to="/uczestnicy"
            icon={FileSpreadsheet}
            title="Lista uczestników"
            copy="Excel ewidencji"
          />
          <ActionCard
            to="/wyciag"
            icon={FileText}
            title="Wyciąg z banku"
            copy="Lista operacji z mBanku za miesiąc. Wpłaty przychodzące idą do kasy, zakupy kartą Valdek pomija."
          />
          <ActionCard
            to="/rozliczenie"
            icon={Scale}
            title="Rozliczenie"
            copy="Automatyczne dopasowanie plus ręczne potwierdzenia."
          />
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Bez wpłaty</CardTitle>
              <CardDescription>
                Osoby, których nie ma na wyciągu w {monthLabel(selectedMonth)}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unpaidPeople.length === 0 ? (
                <p className="text-sm text-muted-foreground">Wszyscy z listy mają ślad wpłaty.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {unpaidPeople.slice(0, 8).map(({ p, expected: exp }) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <div className="text-sm font-medium">
                          {fullName(p.firstName, p.lastName)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {groups.find((g) => g.id === p.groupId)?.name}
                        </div>
                      </div>
                      <div className="tabular text-sm text-muted-foreground">{formatPln(exp)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Nierozpoznane przelewy</CardTitle>
              <CardDescription>
                Zła kwota, inny miesiąc, albo tytuł, którego kasa nie jest pewna.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {issues.length === 0 && unmatched.length === 0 ? (
                <p className="text-sm text-muted-foreground">Na razie czysto.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {issues.slice(0, 6).map((m) => {
                    const person = participants.find((p) => p.id === m.participantId);
                    return (
                      <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {person ? fullName(person.firstName, person.lastName) : "?"}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {m.reasons[0]}
                          </div>
                        </div>
                        <StatusBadge
                          status={
                            m.amountIssue === "ok"
                              ? "review"
                              : m.amountIssue === "partial"
                                ? "partial"
                                : "over"
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/rozliczenie">Otwórz rozliczenie</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{label}</div>
      <div className="font-display mt-2 text-3xl tabular">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function ActionCard({
  to,
  icon: Icon,
  title,
  copy,
}: {
  to: "/uczestnicy" | "/wyciag" | "/rozliczenie";
  icon: typeof FileText;
  title: string;
  copy: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-xl bg-card p-5 shadow-[var(--shadow-border)] transition-colors hover:bg-accent"
    >
      <Icon className="size-5 text-muted-foreground" />
      <h2 className="font-display mt-4 text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
    </Link>
  );
}
