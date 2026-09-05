import type { Group, Participant, PaymentMatch, Statement, Transfer } from "./types";

export const DEMO_MONTH = "2026-09";

export function demoGroups(): Group[] {
  return [
    { id: "g-seniorzy", name: "SENIORZY", defaultFee: 210 },
    { id: "g-seniorzy-ii", name: "SENIORZY II", defaultFee: 220 },
    { id: "g-taniec", name: "TANIEC SENIORZY", defaultFee: 220 },
  ];
}

export function demoParticipants(): Participant[] {
  return [
    { id: "p-pawel", firstName: "Paweł", lastName: "Zajk", groupId: "g-seniorzy", monthlyFee: 210, notes: "", active: true },
    { id: "p-julia", firstName: "Julia", lastName: "Zajk", groupId: "g-seniorzy-ii", monthlyFee: 220, notes: "", active: true },
  ];
}

export const DEMO_STATEMENT_LINES = [
  "mBank S.A. Bankowość Detaliczna",
  "Lista operacji za okres od 2026-09-01 do 2026-09-02",
  "Operacje",
  "Data operacji Opis operacji Rachunek Kategoria Kwota",
  "2026-09-02 JULIA ZAJK, JULIA ZAJK SENIORZY WRZESIEŃ mKonto Intensive Wpływy - inne 10,00 PLN",
  "PRZELEW WEWNĘTRZNY PRZYCHODZĄCY",
  "2026-09-02 PRZYCHOD. DLA ZWIERZAT SC mKonto Intensive Zwierzęta -93,00 PLN",
  "ZAKUP PRZY UŻYCIU KARTY W KRAJU",
];

export function demoStatement(): Statement {
  return {
    id: "st-demo",
    fileName: "lista_operacji_wrzesien.pdf",
    importedAt: "2026-09-02T18:00:00.000Z",
    transferCount: 1,
  };
}

export function demoTransfers(statementId = "st-demo"): Transfer[] {
  return [
    {
      id: "tr-julia",
      statementId,
      date: "2026-09-02",
      amount: 10,
      title: "JULIA ZAJK, JULIA ZAJK SENIORZY WRZESIEŃ",
      sender: "",
      raw: "2026-09-02 10.00 JULIA ZAJK SENIORZY WRZESIEŃ",
      direction: "in",
      ignored: false,
    },
    {
      id: "tr-card",
      statementId,
      date: "2026-09-02",
      amount: 93,
      title: "PRZYCHOD. DLA ZWIERZAT SC ZAKUP PRZY UŻYCIU KARTY W KRAJU",
      sender: "",
      raw: "",
      direction: "out",
      ignored: true,
    },
  ];
}

export function demoMatches(): PaymentMatch[] {
  return [
    {
      id: "match-julia",
      transferId: "tr-julia",
      participantId: "p-julia",
      month: DEMO_MONTH,
      amount: 10,
      confidence: 0.86,
      kind: "suggested",
      amountIssue: "partial",
      reasons: ["pełne imię i nazwisko w tytule", "grupa „SENIORZY II”", "kwota niższa niż stawka"],
    },
  ];
}

export function demoSnapshot() {
  return {
    seasonStartYear: 2026,
    selectedMonth: DEMO_MONTH,
    groups: demoGroups(),
    participants: demoParticipants(),
    statements: [demoStatement()],
    transfers: demoTransfers(),
    matches: demoMatches(),
    manual: {} as Record<string, Record<string, { status: "paid" | "unpaid" | "partial"; amount?: number }>>,
    sourceWorkbookB64: null as string | null,
    sourceFileName: "UCZESTNICY.xlsx",
    seeded: true,
    seedBanner: true,
  };
}