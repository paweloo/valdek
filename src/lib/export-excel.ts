import * as XLSX from "xlsx";
import type { Group, Participant, PaymentMatch, Transfer } from "./types";
import { fullName, monthLabel, PL_MONTHS, seasonMonths } from "./polish";
import { formatPln } from "./utils";

function paymentReceived(
  participantId: string,
  month: string,
  matches: PaymentMatch[],
  transfers: Transfer[],
) {
  return matches
    .filter((m) => m.participantId === participantId && m.month === month)
    .reduce((sum, m) => {
      const t = transfers.find((x) => x.id === m.transferId);
      if (!t || t.ignored) return sum;
      return sum + m.amount;
    }, 0);
}

function monthHeader(monthKey: string) {
  const idx = Number(monthKey.slice(5, 7)) - 1;
  return (PL_MONTHS[idx] ?? monthKey).toUpperCase();
}

export function buildWorkbook(params: {
  seasonStartYear: number;
  groups: Group[];
  participants: Participant[];
  matches: PaymentMatch[];
  transfers: Transfer[];
}) {
  const months = seasonMonths(params.seasonStartYear);
  const groupNames = params.groups.map((g) => g.name);
  const headers = [
    "IMIĘ I NAZWISKO",
    "KWOTA",
    "REGULAMIN",
    ...groupNames,
    ...months.map(monthHeader),
  ];
  const listRows = params.participants.map((p) => {
    const group = params.groups.find((g) => g.id === p.groupId)?.name ?? "";
    const row: (string | number | boolean)[] = [
      `${p.lastName} ${p.firstName}`.trim(),
      p.monthlyFee,
      false,
      ...groupNames.map((name) => name === group),
      ...months.map((month) => paymentReceived(p.id, month, params.matches, params.transfers) > 0),
    ];
    return row;
  });

  const detailRows = params.transfers
    .filter((t) => !t.ignored)
    .map((t) => {
      const match = params.matches.find((m) => m.transferId === t.id);
      const person = params.participants.find((p) => p.id === match?.participantId);
      return {
        Data: t.date,
        Kwota: t.amount,
        Tytuł: t.title,
        Uczestnik: person ? fullName(person.firstName, person.lastName) : "",
        Miesiąc: match ? monthLabel(match.month) : "",
        Status: match
          ? match.kind === "suggested"
            ? "do weryfikacji"
            : match.amountIssue === "ok"
              ? "ok"
              : match.amountIssue
          : "nierozpoznany",
        Pewność: match ? Math.round(match.confidence * 100) : "",
        Uwagi: match?.reasons.join("; ") ?? "",
      };
    });

  const wb = XLSX.utils.book_new();
  const ewidencja = XLSX.utils.aoa_to_sheet([headers, ...listRows]);
  XLSX.utils.book_append_sheet(wb, ewidencja, "Ewidencja");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailRows), "Wyciąg");
  return wb;
}

export function workbookToBlob(wb: XLSX.WorkBook) {
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function buildTemplateWorkbook(seasonStartYear: number) {
  const months = seasonMonths(seasonStartYear);
  const groups = ["SENIORZY", "SENIORZY II", "TANIEC SENIORZY"];
  const headers = ["IMIĘ I NAZWISKO", "KWOTA", "REGULAMIN", ...groups, ...months.map(monthHeader)];
  const sample = [
    ["Zajk Paweł", 210, false, true, false, false, ...months.map(() => false)],
    ["Zajk Julia", 220, false, false, true, false, ...months.map(() => false)],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ewidencja");
  return wb;
}

export function paymentSummaryLine(received: number, expected: number) {
  if (received <= 0) return "brak wpłaty";
  if (Math.abs(received - expected) <= 1) return formatPln(received);
  return `${formatPln(received)} / ${formatPln(expected)}`;
}
