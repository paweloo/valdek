import { createFileRoute } from "@tanstack/react-router";
import { Check, Link2, Split, Unlink } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/valdek/app-shell";
import { StatusBadge } from "@/components/valdek/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useValdek } from "@/lib/store";
import { fullName, monthLabel, normalizeText, seasonMonths } from "@/lib/polish";
import { formatPln } from "@/lib/utils";
import { bucketForMatches, monthStatusFor } from "@/lib/status";
import type { Transfer } from "@/lib/types";

export const Route = createFileRoute("/rozliczenie")({ component: RozliczeniePage });

function RozliczeniePage() {
  const selectedMonth = useValdek((s) => s.selectedMonth);
  const seasonStartYear = useValdek((s) => s.seasonStartYear);
  const allParticipants = useValdek((s) => s.participants);
  const groups = useValdek((s) => s.groups);
  const transfers = useValdek((s) => s.transfers);
  const matches = useValdek((s) => s.matches);
  const manual = useValdek((s) => s.manual);
  const assignTransfer = useValdek((s) => s.assignTransfer);
  const confirmMatch = useValdek((s) => s.confirmMatch);
  const unmatchTransfer = useValdek((s) => s.unmatchTransfer);
  const splitTwoMonths = useValdek((s) => s.splitTwoMonths);
  const [query, setQuery] = useState("");

  const participants = allParticipants.filter((p) => p.active);

  const visibleTransfers = transfers.filter((t) => !t.ignored && t.direction !== "out");
  const unmatched = visibleTransfers.filter((t) => bucketForMatches(matches.filter((m) => m.transferId === t.id)) === "unmatched");
  const review = visibleTransfers.filter((t) => bucketForMatches(matches.filter((m) => m.transferId === t.id)) === "review");
  const confirmed = visibleTransfers.filter((t) => bucketForMatches(matches.filter((m) => m.transferId === t.id)) === "booked");

  const people = useMemo(() => {
    const q = normalizeText(query);
    return participants.filter((p) => {
      const g = groups.find((x) => x.id === p.groupId)?.name ?? "";
      return !q || normalizeText(`${p.firstName} ${p.lastName} ${g}`).includes(q);
    });
  }, [participants, groups, query]);

  return (
    <AppShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Kasa</p>
            <h1 className="font-display mt-1 text-4xl">Rozliczenie</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Po lewej przelewy, po prawej lista. Potwierdź pewne dopasowania, przypisz kwiatki ręcznie, pomiń składki i obce wpłaty.
            </p>
          </div>
          <Input
            className="lg:max-w-72"
            placeholder="Filtruj uczestników"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </header>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-6">
            <TransferGroup
              title="Do wyjaśnienia"
              empty="Brak nierozpoznanych przelewów."
              items={unmatched}
              months={seasonMonths(seasonStartYear)}
              selectedMonth={selectedMonth}
              participants={people}
              groups={groups}
              matches={matches}
              onAssign={assignTransfer}
            />
            <TransferGroup
              title="Do potwierdzenia"
              empty="Nic nie czeka na Twoje oko."
              items={review}
              months={seasonMonths(seasonStartYear)}
              selectedMonth={selectedMonth}
              participants={people}
              groups={groups}
              matches={matches}
              onAssign={assignTransfer}
              onConfirm={confirmMatch}
              onUnmatch={unmatchTransfer}
              onSplit={splitTwoMonths}
            />
            <TransferGroup
              title="Zaksięgowane"
              empty="Jeszcze nikt nie został pewnie dopasowany."
              items={confirmed}
              months={seasonMonths(seasonStartYear)}
              selectedMonth={selectedMonth}
              participants={people}
              groups={groups}
              matches={matches}
              onUnmatch={unmatchTransfer}
            />
          </div>

          <aside className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)] xl:sticky xl:top-24 xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto">
            <h2 className="font-display text-2xl">Lista miesiąca</h2>
            <ul className="mt-3 divide-y divide-border">
              {people.map((p) => {
                const st = monthStatusFor(p, selectedMonth, matches, manual);
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{fullName(p.firstName, p.lastName)}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {groups.find((g) => g.id === p.groupId)?.name} · {formatPln(p.monthlyFee)}
                      </div>
                    </div>
                    <StatusBadge status={st.status} />
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function TransferGroup({
  title,
  empty,
  items,
  months,
  selectedMonth,
  participants,
  groups,
  matches,
  onAssign,
  onConfirm,
  onUnmatch,
  onSplit,
}: {
  title: string;
  empty: string;
  items: Transfer[];
  months: string[];
  selectedMonth: string;
  participants: { id: string; firstName: string; lastName: string; groupId: string; monthlyFee: number }[];
  groups: { id: string; name: string }[];
  matches: ReturnType<typeof useValdek.getState>["matches"];
  onAssign?: (transferId: string, participantId: string, month?: string) => void;
  onConfirm?: (transferId: string) => void;
  onUnmatch?: (transferId: string) => void;
  onSplit?: (transferId: string) => void;
}) {
  return (
    <section>
      <h2 className="font-display mb-3 text-2xl">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((t) => {
            const related = matches.filter((m) => m.transferId === t.id);
            const primary = related[0];
            const person = participants.find((p) => p.id === primary?.participantId);
            const amountStatus =
              primary && primary.amountIssue !== "ok"
                ? primary.amountIssue === "partial"
                  ? ("partial" as const)
                  : ("over" as const)
                : null;
            return (
              <li key={t.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="tabular text-lg">{formatPln(t.amount)}</span>
                      <span className="text-xs text-muted-foreground">{t.date}</span>
                      {amountStatus ? <StatusBadge status={amountStatus} /> : null}
                    </div>
                    <p className="mt-1 text-sm">{t.title}</p>
                    {primary ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {person ? fullName(person.firstName, person.lastName) : "osoba spoza filtra"} · {monthLabel(primary.month)} · {Math.round(primary.confidence * 100)}% · {primary.reasons.join(" · ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-col gap-2 md:w-72">
                    {onAssign ? (
                      <Select
                        value={primary?.participantId ?? "__none"}
                        onValueChange={(id) => {
                          if (id === "__none") return;
                          onAssign(t.id, id, primary?.month ?? selectedMonth);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Przypisz do osoby" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none" disabled>
                            Przypisz do osoby
                          </SelectItem>
                          {participants.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {fullName(p.firstName, p.lastName)} · {groups.find((g) => g.id === p.groupId)?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                    {onAssign && primary ? (
                      <Select value={primary.month} onValueChange={(m) => onAssign(t.id, primary.participantId, m)}>
                        <SelectTrigger>
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
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {onConfirm && primary ? (
                        <Button type="button" size="sm" onClick={() => onConfirm(t.id)}>
                          <Check /> Potwierdź
                        </Button>
                      ) : null}
                      {onSplit && primary && primary.amountIssue === "over" ? (
                        <Button type="button" size="sm" variant="secondary" onClick={() => onSplit(t.id)}>
                          <Split /> Dwa miesiące
                        </Button>
                      ) : null}
                      {onUnmatch && primary ? (
                        <Button type="button" size="sm" variant="ghost" onClick={() => onUnmatch(t.id)}>
                          <Unlink /> Odłącz
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Link2 className="size-3" /> przypisz z listy
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
