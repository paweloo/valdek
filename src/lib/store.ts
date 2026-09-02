import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  ExcelMapping,
  Group,
  ManualMark,
  Participant,
  PaymentMatch,
  Statement,
  Transfer,
} from "./types";
import { matchTransfers, nameKey, buildManualMatch } from "./match";
import { demoSnapshot } from "./demo";
import { currentMonthKey, currentSeasonStartYear } from "./polish";
import { interpretExcelRow, isPaidCell } from "./parse-excel";
import { bufferToB64, uid } from "./utils";

type ValdekState = {
  seasonStartYear: number;
  selectedMonth: string;
  groups: Group[];
  participants: Participant[];
  statements: Statement[];
  transfers: Transfer[];
  matches: PaymentMatch[];
  manual: Record<string, Record<string, ManualMark>>;
  sourceWorkbookB64: string | null;
  sourceFileName: string;
  seeded: boolean;
  seedBanner: boolean;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setSourceWorkbook: (buf: ArrayBuffer, fileName: string) => void;
  seedDemo: () => void;
  resetAll: () => void;
  dismissSeedBanner: () => void;
  setMonth: (month: string) => void;
  setSeasonStartYear: (year: number) => void;
  addGroup: (name: string, defaultFee: number) => string;
  updateGroup: (id: string, patch: Partial<Group>) => void;
  removeGroup: (id: string) => void;
  addParticipant: (draft: Omit<Participant, "id">) => void;
  updateParticipant: (id: string, patch: Partial<Participant>) => void;
  removeParticipant: (id: string) => void;
  importRows: (rows: string[][], mapping: ExcelMapping, mode: "replace" | "merge") => number;
  addStatement: (statement: Statement, transfers: Transfer[]) => void;
  removeStatement: (id: string) => void;
  updateTransfer: (id: string, patch: Partial<Transfer>) => void;
  ignoreTransfer: (id: string, ignored: boolean) => void;
  rematch: () => void;
  assignTransfer: (transferId: string, participantId: string, month?: string, confirm?: boolean) => void;
  unmatchTransfer: (transferId: string) => void;
  confirmMatch: (transferId: string) => void;
  splitTwoMonths: (transferId: string) => void;
  setManual: (participantId: string, month: string, mark: ManualMark | null) => void;
};

function emptyState() {
  const year = currentSeasonStartYear();
  return {
    seasonStartYear: year,
    selectedMonth: currentMonthKey(),
    groups: [] as Group[],
    participants: [] as Participant[],
    statements: [] as Statement[],
    transfers: [] as Transfer[],
    matches: [] as PaymentMatch[],
    manual: {} as Record<string, Record<string, ManualMark>>,
    sourceWorkbookB64: null as string | null,
    sourceFileName: "UCZESTNICY.xlsx",
    seeded: false,
    seedBanner: false,
  };
}

function initialState() {
  return demoSnapshot();
}

export const useValdek = create<ValdekState>()(
  persist(
    (set, get) => ({
      ...initialState(),
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setSourceWorkbook: (buf, fileName) =>
        set({ sourceWorkbookB64: bufferToB64(buf), sourceFileName: fileName || "UCZESTNICY.xlsx" }),
      seedDemo: () => set({ ...demoSnapshot(), hydrated: true }),
      resetAll: () => set({ ...emptyState(), hydrated: true, seeded: true, seedBanner: false }),
      dismissSeedBanner: () => set({ seedBanner: false }),
      setMonth: (month) => set({ selectedMonth: month }),
      setSeasonStartYear: (year) => set({ seasonStartYear: year }),
      addGroup: (name, defaultFee) => {
        const id = uid("g");
        set({ groups: [...get().groups, { id, name, defaultFee }] });
        return id;
      },
      updateGroup: (id, patch) =>
        set({ groups: get().groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) }),
      removeGroup: (id) => {
        const leftover = get().groups.find((g) => g.id !== id);
        set({
          groups: get().groups.filter((g) => g.id !== id),
          participants: get().participants.map((p) =>
            p.groupId === id && leftover ? { ...p, groupId: leftover.id } : p,
          ),
        });
      },
      addParticipant: (draft) =>
        set({ participants: [...get().participants, { ...draft, id: uid("p") }] }),
      updateParticipant: (id, patch) =>
        set({
          participants: get().participants.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }),
      removeParticipant: (id) =>
        set({
          participants: get().participants.filter((p) => p.id !== id),
          matches: get().matches.filter((m) => m.participantId !== id),
        }),
      importRows: (rows, mapping, mode) => {
        const wipingDemo = get().seedBanner;
        let groups = mode === "replace" || wipingDemo ? [] : [...get().groups];
        const ensureGroup = (name: string, fee: number) => {
          const existing = groups.find((g) => g.name.toLowerCase() === name.toLowerCase());
          if (existing) return existing.id;
          const id = uid("g");
          groups = [...groups, { id, name, defaultFee: fee || 0 }];
          return id;
        };
        const imported: Participant[] = [];
        for (const row of rows) {
          const parsed = interpretExcelRow(row, mapping);
          if (!parsed) continue;
          const groupId = ensureGroup(parsed.groupName || "Bez grupy", parsed.fee);
          imported.push({
            id: uid("p"),
            firstName: parsed.firstName,
            lastName: parsed.lastName,
            groupId,
            monthlyFee: parsed.fee,
            notes: "",
            active: true,
          });
        }
        let participants = mode === "replace" || wipingDemo ? imported : [...get().participants];
        if (mode === "merge" && !wipingDemo) {
          const index = new Map(participants.map((p) => [nameKey(p), p]));
          for (const row of imported) {
            const key = nameKey(row);
            const prev = index.get(key);
            if (prev) {
              participants = participants.map((p) =>
                p.id === prev.id ? { ...p, groupId: row.groupId, monthlyFee: row.monthlyFee || p.monthlyFee } : p,
              );
            } else {
              participants = [...participants, row];
              index.set(key, row);
            }
          }
        }
        const manual = wipingDemo || mode === "replace" ? ({} as ValdekState["manual"]) : { ...get().manual };
        if (mapping.months && Object.keys(mapping.months).length) {
          for (const row of rows) {
            const parsed = interpretExcelRow(row, mapping);
            if (!parsed) continue;
            const person = participants.find((p) => nameKey(p) === nameKey(parsed));
            if (!person) continue;
            for (const [month, col] of Object.entries(mapping.months)) {
              const cell = row[col] ?? "";
              const paid = isPaidCell(cell);
              if (!cell) continue;
              manual[person.id] = manual[person.id] ?? {};
              if (paid.paid) {
                manual[person.id]![month] = {
                  status: paid.amount && paid.amount < (person.monthlyFee || paid.amount) ? "partial" : "paid",
                  amount: paid.amount ?? person.monthlyFee,
                };
              }
            }
          }
        }
        const extra = wipingDemo
          ? { statements: [] as Statement[], transfers: [] as Transfer[], matches: [] as PaymentMatch[] }
          : {};
        set({ groups, participants, manual, seeded: true, seedBanner: false, ...extra });
        get().rematch();
        return imported.length;
      },
      addStatement: (statement, transfers) => {
        const replacedIds = new Set(
          get()
            .statements.filter(
              (s) => s.id === statement.id || s.month === statement.month || s.fileName === statement.fileName,
            )
            .map((s) => s.id),
        );
        set({
          statements: [...get().statements.filter((s) => !replacedIds.has(s.id)), statement],
          transfers: [...get().transfers.filter((t) => !replacedIds.has(t.statementId)), ...transfers],
          selectedMonth: statement.month || get().selectedMonth,
          seeded: true,
          seedBanner: false,
        });
        get().rematch();
      },
      removeStatement: (id) => {
        const transferIds = new Set(get().transfers.filter((t) => t.statementId === id).map((t) => t.id));
        set({
          statements: get().statements.filter((s) => s.id !== id),
          transfers: get().transfers.filter((t) => t.statementId !== id),
          matches: get().matches.filter((m) => !transferIds.has(m.transferId)),
        });
      },
      updateTransfer: (id, patch) => {
        set({ transfers: get().transfers.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
        get().rematch();
      },
      ignoreTransfer: (id, ignored) => {
        set({
          transfers: get().transfers.map((t) => (t.id === id ? { ...t, ignored } : t)),
          matches: ignored ? get().matches.filter((m) => m.transferId !== id) : get().matches,
        });
        if (!ignored) get().rematch();
      },
      rematch: () => {
        const { transfers, participants, groups, selectedMonth, matches } = get();
        set({
          matches: matchTransfers({ transfers, participants, groups, statementMonth: selectedMonth, existing: matches }),
        });
      },
      assignTransfer: (transferId, participantId, month, confirm) => {
        const transfer = get().transfers.find((t) => t.id === transferId);
        const participant = get().participants.find((p) => p.id === participantId);
        if (!transfer || !participant) return;
        const next = buildManualMatch({ transfer, participant, month: month ?? get().selectedMonth });
        if (confirm) next.kind = "confirmed";
        set({ matches: [...get().matches.filter((m) => m.transferId !== transferId), next] });
      },
      unmatchTransfer: (transferId) =>
        set({ matches: get().matches.filter((m) => m.transferId !== transferId) }),
      confirmMatch: (transferId) =>
        set({
          matches: get().matches.map((m) => (m.transferId === transferId ? { ...m, kind: "confirmed" } : m)),
        }),
      splitTwoMonths: (transferId) => {
        const match = get().matches.find((m) => m.transferId === transferId);
        const transfer = get().transfers.find((t) => t.id === transferId);
        const person = get().participants.find((p) => p.id === match?.participantId);
        if (!match || !transfer || !person) return;
        const fee = person.monthlyFee || transfer.amount / 2;
        const [y, m] = match.month.split("-").map(Number);
        const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
        const first: PaymentMatch = { ...match, id: uid("match"), amount: fee, amountIssue: "ok", kind: "confirmed", reasons: ["rozliczone jako dwa miesiące"] };
        const second: PaymentMatch = { ...match, id: uid("match"), month: nextMonth, amount: transfer.amount - fee, amountIssue: "ok", kind: "confirmed", reasons: ["druga rata z tej samej wpłaty"] };
        set({ matches: [...get().matches.filter((m) => m.transferId !== transferId), first, second] });
      },
      setManual: (participantId, month, mark) => {
        const manual = { ...get().manual };
        const current = { ...(manual[participantId] ?? {}) };
        if (!mark) delete current[month];
        else current[month] = mark;
        manual[participantId] = current;
        set({ manual });
      },
    }),
    {
      name: "valdek-store-v3",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        seasonStartYear: state.seasonStartYear,
        selectedMonth: state.selectedMonth,
        groups: state.groups,
        participants: state.participants,
        statements: state.statements,
        transfers: state.transfers,
        matches: state.matches,
        manual: state.manual,
        sourceWorkbookB64: state.sourceWorkbookB64,
        sourceFileName: state.sourceFileName,
        seeded: state.seeded,
        seedBanner: state.seedBanner,
      }),
    },
  ),
);

export function receivedFor(participantId: string, month: string, matches: PaymentMatch[]) {
  return matches
    .filter((m) => m.participantId === participantId && m.month === month)
    .reduce((sum, m) => sum + m.amount, 0);
}
