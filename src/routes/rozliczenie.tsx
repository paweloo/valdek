import { createFileRoute } from "@tanstack/react-router";
import { Ban, Check, Split, Unlink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/valdek/app-shell";
import { StatusBadge } from "@/components/valdek/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useValdek } from "@/lib/store";
import {
  detectMonthsInText,
  fullName,
  monthLabel,
  normalizeText,
  seasonMonths,
} from "@/lib/polish";
import { formatPln } from "@/lib/utils";
import { bucketForMatches, monthStatusFor } from "@/lib/status";
import type { Group, PaymentMatch, Transfer } from "@/lib/types";

export const Route = createFileRoute("/rozliczenie")({ component: RozliczeniePage });

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  groupId: string;
  monthlyFee: number;
};

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
  const ignoreTransfer = useValdek((s) => s.ignoreTransfer);
  const [query, setQuery] = useState("");
  const participants = allParticipants.filter((p) => p.active);
  const visibleTransfers = transfers.filter((t) => !t.ignored && t.direction !== "out");
  const unmatched = visibleTransfers.filter(
    (t) => bucketForMatches(matches.filter((m) => m.transferId === t.id)) === "unmatched",
  );
  const review = visibleTransfers.filter(
    (t) => bucketForMatches(matches.filter((m) => m.transferId === t.id)) === "review",
  );
  const confirmed = visibleTransfers.filter(
    (t) => bucketForMatches(matches.filter((m) => m.transferId === t.id)) === "booked",
  );
  const people = useMemo(() => {
    const q = normalizeText(query);
    return participants.filter((p) => {
      const g = groups.find((x) => x.id === p.groupId)?.name ?? "";
      return !q || normalizeText(`${p.firstName} ${p.lastName} ${g}`).includes(q);
    });
  }, [participants, groups, query]);
  const months = seasonMonths(seasonStartYear);

  return (
    <AppShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Kasa</p>
            <h1 className="font-display mt-1 text-4xl">Rozliczenie</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Potwierdź pewne dopasowania, przypisz ręcznie nierozpoznane przelewy.
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
              months={months}
              selectedMonth={selectedMonth}
              seasonStartYear={seasonStartYear}
              participants={people}
              groups={groups}
              matches={matches}
              onAssign={assignTransfer}
              onConfirm={confirmMatch}
              onIgnore={(id) => ignoreTransfer(id, true)}
            />
            <TransferGroup
              title="Do potwierdzenia"
              empty="Brak przelewów wymagających weryfikacji."
              items={review}
              months={months}
              selectedMonth={selectedMonth}
              seasonStartYear={seasonStartYear}
              participants={people}
              groups={groups}
              matches={matches}
              onAssign={assignTransfer}
              onConfirm={confirmMatch}
              onUnmatch={unmatchTransfer}
              onSplit={splitTwoMonths}
              onIgnore={(id) => ignoreTransfer(id, true)}
            />
            <TransferGroup
              title="Zaksięgowane"
              empty="Jeszcze nikt nie został pewnie dopasowany."
              items={confirmed}
              months={months}
              selectedMonth={selectedMonth}
              seasonStartYear={seasonStartYear}
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
                      <div className="truncate text-sm font-medium">
                        {fullName(p.firstName, p.lastName)}
                      </div>
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
  seasonStartYear,
  participants,
  groups,
  matches,
  onAssign,
  onConfirm,
  onUnmatch,
  onSplit,
  onIgnore,
}: {
  title: string;
  empty: string;
  items: Transfer[];
  months: string[];
  selectedMonth: string;
  seasonStartYear: number;
  participants: Person[];
  groups: Pick<Group, "id" | "name">[];
  matches: PaymentMatch[];
  onAssign?: (transferId: string, participantId: string, month?: string, confirm?: boolean) => void;
  onConfirm?: (transferId: string) => void;
  onUnmatch?: (transferId: string) => void;
  onSplit?: (transferId: string) => void;
  onIgnore?: (transferId: string) => void;
}) {
  return (
    <section>
      <h2 className="font-display mb-3 text-2xl">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((t) => (
            <TransferCard
              key={t.id}
              transfer={t}
              related={matches.filter((m) => m.transferId === t.id)}
              months={months}
              selectedMonth={selectedMonth}
              seasonStartYear={seasonStartYear}
              participants={participants}
              groups={groups}
              onAssign={onAssign}
              onConfirm={onConfirm}
              onUnmatch={onUnmatch}
              onSplit={onSplit}
              onIgnore={onIgnore}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function TransferCard({
  transfer,
  related,
  months,
  selectedMonth,
  seasonStartYear,
  participants,
  groups,
  onAssign,
  onConfirm,
  onUnmatch,
  onSplit,
  onIgnore,
}: {
  transfer: Transfer;
  related: PaymentMatch[];
  months: string[];
  selectedMonth: string;
  seasonStartYear: number;
  participants: Person[];
  groups: Pick<Group, "id" | "name">[];
  onAssign?: (transferId: string, participantId: string, month?: string, confirm?: boolean) => void;
  onConfirm?: (transferId: string) => void;
  onUnmatch?: (transferId: string) => void;
  onSplit?: (transferId: string) => void;
  onIgnore?: (transferId: string) => void;
}) {
  const primary = related[0];
  const titleMonth = detectMonthsInText(transfer.title, seasonStartYear)[0];
  const [draftPerson, setDraftPerson] = useState(primary?.participantId ?? "");
  const [draftMonth, setDraftMonth] = useState(primary?.month ?? titleMonth ?? selectedMonth);

  useEffect(() => {
    setDraftPerson(primary?.participantId ?? "");
    setDraftMonth(primary?.month ?? titleMonth ?? selectedMonth);
  }, [primary?.participantId, primary?.month, titleMonth, selectedMonth]);

  const personId = draftPerson || primary?.participantId || "";
  const month = draftMonth || primary?.month || selectedMonth;
  const person = participants.find((p) => p.id === (primary?.participantId ?? personId));
  const amountStatus =
    primary && primary.amountIssue !== "ok"
      ? primary.amountIssue === "partial"
        ? ("partial" as const)
        : ("over" as const)
      : null;

  const pickPerson = (id: string) => {
    if (id === "__none") return;
    setDraftPerson(id);
    if (primary) onAssign?.(transfer.id, id, month);
  };

  const pickMonth = (next: string) => {
    setDraftMonth(next);
    if (primary) onAssign?.(transfer.id, primary.participantId, next);
  };

  const confirm = () => {
    if (!personId) return;
    if (onAssign) onAssign(transfer.id, personId, month, true);
    else onConfirm?.(transfer.id);
  };

  return (
    <li className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="tabular text-lg">{formatPln(transfer.amount)}</span>
            <span className="text-xs text-muted-foreground">{transfer.date}</span>
            {amountStatus ? <StatusBadge status={amountStatus} /> : null}
          </div>
          <p className="mt-1 text-sm">{transfer.title}</p>
          {primary ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {person ? fullName(person.firstName, person.lastName) : "osoba spoza filtra"} ·{" "}
              {monthLabel(primary.month)} · {Math.round(primary.confidence * 100)}% ·{" "}
              {primary.reasons.join(" · ")}
            </p>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-col gap-2 md:w-72">
          {onAssign ? (
            <Select value={personId || "__none"} onValueChange={pickPerson}>
              <SelectTrigger>
                <SelectValue placeholder="Przypisz do osoby" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none" disabled>
                  Przypisz do osoby
                </SelectItem>
                {participants.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {fullName(p.firstName, p.lastName)} ·{" "}
                    {groups.find((g) => g.id === p.groupId)?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {onAssign ? (
            <Select value={month} onValueChange={pickMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Miesiąc" />
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
            {onConfirm || onAssign ? (
              <Button type="button" size="sm" disabled={!personId} onClick={confirm}>
                <Check /> Potwierdź
              </Button>
            ) : null}
            {onSplit && primary && primary.amountIssue === "over" ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => onSplit(transfer.id)}
              >
                <Split /> Dwa miesiące
              </Button>
            ) : null}
            {onUnmatch && primary ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onUnmatch(transfer.id)}
              >
                <Unlink /> Odłącz
              </Button>
            ) : null}
            {onIgnore ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => onIgnore(transfer.id)}>
                <Ban /> Pomiń
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
