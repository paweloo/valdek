import * as XLSX from "xlsx";
import type { ExcelMapping, ExcelPreview, GroupFlagColumn, NameOrder } from "./types";
import { guessNameOrder, headerLooksLikeMonth, monthKeyFor, normalizeText, splitFullName } from "./polish";

const NAME_HEADERS = ["imie i nazwisko", "imię i nazwisko", "uczestnik", "osoba", "nazwa", "name", "participant"];
const FIRST_HEADERS = ["imie", "imię", "first", "firstname"];
const LAST_HEADERS = ["nazwisko", "last", "lastname"];
const GROUP_HEADERS = ["grupa", "zajecia", "zajęcia", "group", "pracownia", "sekcja"];
const FEE_HEADERS = ["kwota", "oplata", "opłata", "stawka", "fee", "naleznosc", "należność", "pln", "miesiecznie", "miesięcznie"];
const NON_GROUP_HEADERS = new Set(["regulamin", "zgoda", "rodo", "uwagi", "notes", "email", "e mail", "mail", "e-mail", "telefon", "tel", "adres", "pesel", "lp", "nr", "id"]);
const TRUE_CELLS = new Set(["tak", "ok", "wplacono", "yes", "x", "v", "true", "prawda", "1"]);
const FALSE_CELLS = new Set(["nie", "brak", "0", "n", "no", "false", "falsz"]);

function cell(v: unknown) {
  if (v == null) return "";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).trim();
}

function findHeader(headers: string[], aliases: string[]) {
  return headers.findIndex((h) => aliases.includes(normalizeText(h)));
}

export function isTruthyCell(value: string) {
  return TRUE_CELLS.has(normalizeText(value));
}

export function isFalsyCell(value: string) {
  return FALSE_CELLS.has(normalizeText(value));
}

export function isBooleanCell(value: string) {
  if (!value) return false;
  return isTruthyCell(value) || isFalsyCell(value);
}

export function isPaidCell(value: string) {
  const n = normalizeText(value);
  if (!n) return { paid: false, amount: null as number | null };
  if (FALSE_CELLS.has(n)) return { paid: false, amount: 0 };
  if (TRUE_CELLS.has(n)) return { paid: true, amount: null };
  const amount = Number(n.replace(",", ".").replace(/\s/g, ""));
  if (Number.isFinite(amount) && amount > 0) return { paid: true, amount };
  return { paid: false, amount: null };
}

function isHeadcountCell(value: string) {
  if (isBooleanCell(value)) return false;
  return /^\d{1,4}$/.test(value.trim());
}

function namedRows(rows: string[][], mapping: ExcelMapping) {
  const nameIdx = mapping.fullName ?? mapping.lastName ?? mapping.firstName ?? 0;
  return rows.filter((row) => (row[nameIdx] ?? "").trim().length > 0);
}

function columnLooksBoolean(rows: string[][], index: number) {
  const values = rows.map((r) => r[index] ?? "").filter((v) => v.length > 0 && !isHeadcountCell(v));
  if (values.length === 0) return false;
  return values.every((v) => isBooleanCell(v));
}

function detectGroupFlags(headers: string[], rows: string[][], mapping: ExcelMapping): GroupFlagColumn[] {
  const used = new Set<number>();
  for (const idx of [mapping.fullName, mapping.firstName, mapping.lastName, mapping.group, mapping.fee]) {
    if (idx != null) used.add(idx);
  }
  for (const idx of Object.values(mapping.months)) used.add(idx);
  const peopleRows = namedRows(rows, mapping);
  const flags: GroupFlagColumn[] = [];
  headers.forEach((header, i) => {
    if (used.has(i)) return;
    const name = header.replace(/\s+/g, " ").trim();
    if (!name) return;
    const norm = normalizeText(name);
    if (NON_GROUP_HEADERS.has(norm)) return;
    if (headerLooksLikeMonth(name)) return;
    if (!columnLooksBoolean(peopleRows.length ? peopleRows : rows, i)) return;
    flags.push({ column: i, name });
  });
  return flags;
}

export function guessMapping(headers: string[], seasonYear: number, rows: string[][] = []): ExcelMapping {
  const mapping: ExcelMapping = { months: {} };
  const first = findHeader(headers, FIRST_HEADERS);
  const last = findHeader(headers, LAST_HEADERS);
  const full = findHeader(headers, NAME_HEADERS);
  const group = findHeader(headers, GROUP_HEADERS);
  const fee = findHeader(headers, FEE_HEADERS);
  if (first >= 0) mapping.firstName = first;
  if (last >= 0) mapping.lastName = last;
  if (full >= 0 && first < 0) mapping.fullName = full;
  if (group >= 0) mapping.group = group;
  if (fee >= 0) mapping.fee = fee;
  headers.forEach((h, i) => {
    const month = headerLooksLikeMonth(h);
    if (!month) return;
    const key = month.includes("-") ? month : monthKeyFor(Number(month), seasonYear);
    mapping.months[key] = i;
  });
  if (mapping.firstName == null && mapping.fullName == null) mapping.fullName = 0;
  if (rows.length) {
    mapping.groupFlags = detectGroupFlags(headers, rows, mapping);
    if (mapping.fullName != null) {
      const names = namedRows(rows, mapping).map((r) => r[mapping.fullName!] ?? "").filter(Boolean);
      mapping.nameOrder = guessNameOrder(names);
    }
  }
  return mapping;
}

export function interpretExcelRow(row: string[], mapping: ExcelMapping) {
  const first = mapping.firstName != null ? row[mapping.firstName] ?? "" : "";
  const last = mapping.lastName != null ? row[mapping.lastName] ?? "" : "";
  const full = mapping.fullName != null ? row[mapping.fullName] ?? "" : "";
  const order: NameOrder = mapping.nameOrder ?? "last-first";
  const names = first || last ? { firstName: first.trim(), lastName: last.trim() } : splitFullName(full, order);
  if (!names.firstName && !names.lastName) return null;
  let groupName = "";
  if (mapping.groupFlags?.length) {
    const hits = mapping.groupFlags.filter((g) => isTruthyCell(row[g.column] ?? "")).map((g) => g.name);
    groupName = hits.join(" + ");
  }
  if (!groupName && mapping.group != null) groupName = (row[mapping.group] ?? "").trim();
  if (!groupName) groupName = "Bez grupy";
  const feeRaw = mapping.fee != null ? row[mapping.fee] ?? "" : "";
  const fee = Number(String(feeRaw).replace(",", ".").replace(/\s/g, "")) || 0;
  return { ...names, groupName, fee };
}

export async function readSpreadsheet(file: File) {
  const buf = await file.arrayBuffer();
  return readSpreadsheetBuffer(buf);
}

export function readSpreadsheetBuffer(buf: ArrayBuffer | Uint8Array) {
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  if (!sheet) throw new Error("Pusty plik Excel.");
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" }) as unknown[][];
  const cleaned = matrix.map((row) => row.map(cell)).filter((row) => row.some((c) => c.length > 0));
  if (!cleaned.length) throw new Error("Nie znaleziono wierszy w arkuszu.");
  return { sheetName, headers: cleaned[0], rows: cleaned.slice(1) };
}

export function previewSpreadsheet(headers: string[], rows: string[][], seasonYear: number): ExcelPreview {
  return { headers, rows: rows.slice(0, 8), mapping: guessMapping(headers, seasonYear, rows) };
}
