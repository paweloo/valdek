import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { guessMapping, interpretExcelRow, readSpreadsheetBuffer } from "./parse-excel.ts";
import { detectStatementMonth, parseTransfersFromText } from "./parse-text.ts";
import { matchTransfers } from "./match.ts";
import { buildWorkbook, buildTemplateWorkbook } from "./export-excel.ts";
import { guessNameOrder, splitFullName } from "./polish.ts";
import type { Group, Participant } from "./types.ts";
import * as XLSX from "xlsx";

const MBANK_LINES = `
mBank S.A. Bankowość Detaliczna
PAWEŁ ZAJK
Lista operacji za okres od 2026-09-01 do 2026-09-02
dla rachunków:
mKonto Intensive - 76114020040000370276631594
Waluta Wpływy Wydatki
PLN 10,00 -224,98
Operacje
Data operacji Opis operacji Rachunek Kategoria Kwota
2026-09-02 JULIA ZAJK, JULIA ZAJK SENIORZY WRZESIEŃ mKonto Intensive Wpływy - inne 10,00 PLN
UL.SAMBORA 2B 81-235 GDYNIA PRZELEW WEWNĘTRZNY 7611 ... 1594
PRZYCHODZĄCY
42114020040000340278599416
2026-09-02 PRZYCHOD. DLA ZWIERZAT SC mKonto Intensive Zwierzęta -93,00 PLN
ZAKUP PRZY UŻYCIU KARTY W KRAJU 7611 ... 1594
transakcja nierozliczona
2026-09-01 TESLA POLAND SP. Z O. O. mKonto Intensive Serwis i części -34,99 PLN
ZAKUP PRZY UŻYCIU KARTY - INTERNET 7611 ... 1594
2026-09-01 Leroy Merlin mKonto Intensive Akcesoria i -52,49 PLN
ZAKUP PRZY UŻYCIU KARTY W KRAJU 7611 ... 1594 wyposażenie
2026-09-01 ACTIVE FLOW ARENA mKonto Intensive Sport i hobby -4,50 PLN
ZAKUP PRZY UŻYCIU KARTY W KRAJU 7611 ... 1594
2026-09-01 HTTPS://APP.FITSSEY.COM/A mKonto Intensive Sport i hobby -40,00 PLN
BLIK ZAKUP E-COMMERCE 7611 ... 1594
Strona : 1 / 1
`.trim();

describe("excel ewidencja", () => {
  it("reads UCZESTNICY as last-first with group flag columns", () => {
    const file = path.resolve("/workspace/attachments/UCZESTNICY (2).xlsx");
    const buf = fs.readFileSync(file);
    const { headers, rows } = readSpreadsheetBuffer(buf);
    const mapping = guessMapping(headers, 2026, rows);
    assert.equal(mapping.fullName, 0);
    assert.equal(mapping.fee, 2);
    assert.equal(mapping.nameOrder, "last-first");
    assert.ok(mapping.groupFlags?.some((g) => g.name === "SENIORZY"));
    assert.ok(mapping.groupFlags?.some((g) => g.name === "SENIORZY II"));
    assert.ok(mapping.groupFlags?.some((g) => g.name === "TANIEC SENIORZY"));
    assert.equal(mapping.groupFlags?.some((g) => g.name === "REGULAMIN"), false);
    assert.ok(mapping.months["2026-09"] != null);

    const people = rows.map((r) => interpretExcelRow(r, mapping)).filter(Boolean);
    assert.equal(people.length, 2);
    const pawel = people.find((p) => p?.firstName === "Paweł");
    const julia = people.find((p) => p?.firstName === "Julia");
    assert.equal(pawel?.lastName, "Zajk");
    assert.equal(pawel?.groupName, "SENIORZY");
    assert.equal(pawel?.fee, 210);
    assert.equal(julia?.lastName, "Zajk");
    assert.equal(julia?.groupName, "SENIORZY II");
    assert.equal(julia?.fee, 220);
  });

  it("round-trips ewidencja export back to last-first flags", () => {
    const groups: Group[] = [
      { id: "g1", name: "SENIORZY", defaultFee: 210 },
      { id: "g2", name: "SENIORZY II", defaultFee: 220 },
    ];
    const participants: Participant[] = [
      { id: "p1", firstName: "Paweł", lastName: "Zajk", groupId: "g1", monthlyFee: 210, notes: "", active: true },
      { id: "p2", firstName: "Julia", lastName: "Zajk", groupId: "g2", monthlyFee: 220, notes: "", active: true },
    ];
    const wb = buildWorkbook({
      seasonStartYear: 2026,
      groups,
      participants,
      matches: [],
      transfers: [],
    });
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
    const { headers, rows } = readSpreadsheetBuffer(out);
    const mapping = guessMapping(headers, 2026, rows);
    const people = rows.map((r) => interpretExcelRow(r, mapping)).filter(Boolean);
    assert.equal(mapping.nameOrder, "last-first");
    assert.equal(people.find((p) => p?.firstName === "Julia")?.groupName, "SENIORZY II");
    const tmpl = buildTemplateWorkbook(2026);
    assert.ok(tmpl.SheetNames.includes("Ewidencja"));
  });
});

describe("names", () => {
  it("guesses last-first for Zajk family list", () => {
    assert.equal(guessNameOrder(["Zajk Paweł", "Zajk Julia"]), "last-first");
    assert.deepEqual(splitFullName("Zajk Julia", "last-first"), {
      firstName: "Julia",
      lastName: "Zajk",
    });
  });
  it("guesses first-last when first names lead", () => {
    assert.equal(guessNameOrder(["Anna Nowak", "Marek Nowak"]), "first-last");
  });
});

describe("mbank lista operacji", () => {
  it("keeps the incoming Julia transfer and ignores card spend", () => {
    assert.equal(detectStatementMonth(MBANK_LINES), "2026-09");
    const transfers = parseTransfersFromText(MBANK_LINES, "st-1");
    const incoming = transfers.filter((t) => t.direction === "in" && !t.ignored);
    const outgoing = transfers.filter((t) => t.direction === "out" || t.ignored);
    assert.equal(incoming.length, 1);
    assert.ok(outgoing.length >= 4);
    assert.equal(incoming[0].amount, 10);
    assert.match(incoming[0].title, /JULIA ZAJK/i);
    assert.match(incoming[0].title, /SENIORZY/i);
    assert.match(incoming[0].title, /WRZESIEŃ|WRZESIEN/i);
    assert.doesNotMatch(incoming[0].title, /4211402004/);
    assert.doesNotMatch(incoming[0].title, /SAMBORA/i);
    assert.doesNotMatch(incoming[0].title, /PRZYCHODZ/i);
    assert.equal(incoming[0].date, "2026-09-02");
  });

  it("matches Julia Zajk despite last-first excel and first-last title", () => {
    const groups: Group[] = [
      { id: "g1", name: "SENIORZY", defaultFee: 210 },
      { id: "g2", name: "SENIORZY II", defaultFee: 220 },
    ];
    const participants: Participant[] = [
      { id: "p1", firstName: "Paweł", lastName: "Zajk", groupId: "g1", monthlyFee: 210, notes: "", active: true },
      { id: "p2", firstName: "Julia", lastName: "Zajk", groupId: "g2", monthlyFee: 220, notes: "", active: true },
    ];
    const transfers = parseTransfersFromText(MBANK_LINES, "st-1").filter((t) => !t.ignored);
    const matches = matchTransfers({
      transfers,
      participants,
      groups,
      statementMonth: "2026-09",
      existing: [],
    });
    assert.equal(matches.length, 1);
    assert.equal(matches[0].participantId, "p2");
    assert.equal(matches[0].amountIssue, "partial");
    assert.equal(matches[0].month, "2026-09");
  });
});
