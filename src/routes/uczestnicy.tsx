import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Trash2, Upload, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/valdek/app-shell";
import { ExcelImportDialog } from "@/components/valdek/excel-import-dialog";
import { ParticipantDialog } from "@/components/valdek/participant-dialog";
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
import { patchEwidencjaWorkbook, peopleFromState } from "@/lib/patch-ewidencja";
import { b64ToBuffer, downloadBlob, formatPln } from "@/lib/utils";
import { fullName, monthShort, normalizeText, seasonMonths } from "@/lib/polish";
import { useValdek } from "@/lib/store";
import { monthStatusFor } from "@/lib/status";
import type { Participant } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/uczestnicy")({ component: UczestnicyPage });

function UczestnicyPage() {
  const participants = useValdek((s) => s.participants);
  const groups = useValdek((s) => s.groups);
  const matches = useValdek((s) => s.matches);
  const manual = useValdek((s) => s.manual);
  const selectedMonth = useValdek((s) => s.selectedMonth);
  const seasonStartYear = useValdek((s) => s.seasonStartYear);
  const updateParticipant = useValdek((s) => s.updateParticipant);
  const removeParticipant = useValdek((s) => s.removeParticipant);
  const setManual = useValdek((s) => s.setManual);
  const resetAll = useValdek((s) => s.resetAll);
  const seedDemo = useValdek((s) => s.seedDemo);
  const sourceWorkbookB64 = useValdek((s) => s.sourceWorkbookB64);
  const sourceFileName = useValdek((s) => s.sourceFileName);
  const [query, setQuery] = useState("");
  const [groupId, setGroupId] = useState("all");
  const [editing, setEditing] = useState<Participant | null | undefined>(undefined);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  const months = seasonMonths(seasonStartYear);
  const filtered = useMemo(() => {
    const q = normalizeText(query);
    return participants.filter((p) => {
      if (groupId !== "all" && p.groupId !== groupId) return false;
      if (!q) return true;
      const g = groups.find((x) => x.id === p.groupId)?.name ?? "";
      return normalizeText(`${p.firstName} ${p.lastName} ${g} ${p.notes}`).includes(q);
    });
  }, [participants, query, groupId, groups]);

  const exportList = async () => {
    try {
      let source: ArrayBuffer | null = sourceWorkbookB64 ? b64ToBuffer(sourceWorkbookB64) : null;
      if (!source) {
        const res = await fetch("/ewidencja-szablon.xlsx");
        if (!res.ok) throw new Error("Brak szablonu ewidencji");
        source = await res.arrayBuffer();
      }
      const people = peopleFromState({
        participants,
        groups,
        matches,
        manual,
        seasonMonths: months,
      });
      const blob = await patchEwidencjaWorkbook(source, people, seasonStartYear);
      downloadBlob(blob, sourceFileName || "UCZESTNICY.xlsx");
      toast.success("Pobieranie zaktualizowanego pliku Excel");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się zapisać Excela");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Lista</p>
            <h1 className="font-display mt-1 text-4xl">Uczestnicy</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Ewidencja uczestników i ich wpłat
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void exportList()}>
              <Download /> Zapisz Excel
            </Button>
            <label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setExcelFile(f);
                  e.currentTarget.value = "";
                }}
              />
              <Button variant="secondary" asChild>
                <span className="cursor-pointer">
                  <Upload /> Wgraj Excel
                </span>
              </Button>
            </label>
            <Button onClick={() => setEditing(null)}>
              <Plus /> Dodaj osobę
            </Button>
          </div>
        </header>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Szukaj nazwiska albo grupy"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={groupId} onValueChange={setGroupId}>
            <SelectTrigger className="sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie grupy</SelectItem>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto rounded-xl bg-card shadow-[var(--shadow-border)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                <th className="sticky left-0 bg-card px-4 py-3 font-medium">Uczestnik</th>
                <th className="px-3 py-3 font-medium">Grupa</th>
                <th className="px-3 py-3 font-medium">Stawka</th>
                {months.map((m) => (
                  <th key={m} className="px-2 py-3 text-center font-medium">
                    {monthShort(m)}
                  </th>
                ))}
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const st = monthStatusFor(p, selectedMonth, matches, manual);
                return (
                  <tr key={p.id} className="border-b border-border/70 last:border-0">
                    <td className="sticky left-0 bg-card px-4 py-2">
                      <button className="text-left font-medium" onClick={() => setEditing(p)}>
                        {fullName(p.firstName, p.lastName)}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {groups.find((g) => g.id === p.groupId)?.name}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="h-9 w-20 rounded-sm bg-transparent px-1 tabular"
                        value={p.monthlyFee}
                        onChange={(e) =>
                          updateParticipant(p.id, { monthlyFee: Number(e.target.value) || 0 })
                        }
                      />
                    </td>
                    {months.map((m) => {
                      const cell = monthStatusFor(p, m, matches, manual);
                      const mark =
                        cell.status === "paid" || cell.status === "over"
                          ? "paid"
                          : cell.status === "unpaid"
                            ? null
                            : cell.status;
                      return (
                        <td key={m} className="px-2 py-2 text-center">
                          <button
                            className="text-xs text-muted-foreground"
                            onClick={() =>
                              setManual(
                                p.id,
                                m,
                                mark === "paid"
                                  ? { status: "unpaid" }
                                  : { status: "paid", amount: p.monthlyFee },
                              )
                            }
                          >
                            {cell.status === "unpaid" ? "—" : cell.status === "paid" ? "✓" : "?"}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2 justify-between">
                        <StatusBadge status={st.status} />
                        <Button variant="ghost" size="sm" onClick={() => removeParticipant(p.id)}>
                          <Trash2 className="size-4" /> Usuń
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground justify-between items-center">
          <span>
            {filtered.length} osób · {formatPln(filtered.reduce((s, p) => s + p.monthlyFee, 0))}{" "}
            należności w widoku
          </span>
          {/* <Button variant="ghost" size="sm" onClick={() => seedDemo()}>
            Przykładowe dane
          </Button> */}
          <Button variant="ghost" size="sm" onClick={() => resetAll()}>
            Wyczyść dane
          </Button>
        </div>
      </div>
      <ExcelImportDialog
        open={Boolean(excelFile)}
        onOpenChange={(o) => !o && setExcelFile(null)}
        file={excelFile}
      />
      <ParticipantDialog
        open={editing !== undefined}
        onOpenChange={(o) => !o && setEditing(undefined)}
        participant={editing}
      />
    </AppShell>
  );
}
