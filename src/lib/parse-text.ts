import type { Transfer } from "./types";
import { parseLooseDate, parsePln, normalizeText } from "./polish";
import { uid } from "./utils";

const AMOUNT_RE = /(?<!\d)(-?\d{1,3}(?:[ .]\d{3})*,\d{2}|-?\d+,\d{2}|-?\d+\.\d{2})(?:\s*(?:PLN|zł|ZL))?/gi;
const DATE_RE = /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}-\d{2}-\d{2})/;
const ISO_LINE = /^(20\d{2}-\d{2}-\d{2})\b/;
const OUT_HINTS = [
  "obciazenie", "wyplata", "przelew wychodzacy", "zakup przy uzyciu karty",
  "zakup e commerce", "blik zakup", "transakcja nierozliczona",
];
const IN_HINTS = [
  "przychodzacy", "przychodzące", "wplata", "uznanie",
  "przelew przychodzacy", "przelew wewnetrzny przychodzacy", "wplywy",
];

export function reconstructLines(items: { str: string; x: number; y: number }[]) {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { y: number; parts: { x: number; str: string }[] }[] = [];
  for (const item of sorted) {
    if (!item.str.trim()) continue;
    const line = lines.find((l) => Math.abs(l.y - item.y) <= 3.2);
    if (line) line.parts.push({ x: item.x, str: item.str });
    else lines.push({ y: item.y, parts: [{ x: item.x, str: item.str }] });
  }
  return lines.map((l) =>
    l.parts.sort((a, b) => a.x - b.x).map((p) => p.str).join(" ").replace(/\s+/g, " ").trim(),
  );
}

function amountsIn(line: string) {
  const out: { raw: string; value: number; index: number }[] = [];
  const re = new RegExp(AMOUNT_RE.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const raw = m[1];
    if (raw.replace(/\D/g, "").length > 8) continue;
    const value = parsePln(raw);
    if (value == null || Math.abs(value) >= 100000) continue;
    out.push({ raw, value, index: m.index });
  }
  return out;
}

function classifyDirection(text: string, amount: number): Transfer["direction"] {
  const n = normalizeText(text);
  if (amount < 0 || OUT_HINTS.some((h) => n.includes(normalizeText(h)))) return "out";
  if (IN_HINTS.some((h) => n.includes(normalizeText(h)))) return "in";
  return amount > 0 ? "in" : "unknown";
}

export function cleanTransferTitle(block: string) {
  return block
    .replace(DATE_RE, " ")
    .replace(AMOUNT_RE, " ")
    .replace(/\bPLN\b|\bzł\b/gi, " ")
    .replace(/\bmKonto Intensive\b/gi, " ")
    .replace(/\b\d{4}\s*\.\.\.\s*\d{4}\b/g, " ")
    .replace(/\b\d{26}\b/g, " ")
    .replace(/\bUL\.?\s*\S.{0,48}?\d{2}-\d{3}\s+\S+/gi, " ")
    .replace(/\bPRZELEW WEWNĘTRZNY PRZYCHODZĄCY\b/gi, " ")
    .replace(/\bPRZELEW WEWNĘTRZNY\b/gi, " ")
    .replace(/\bPRZYCHODZ[ĄA]CY\b/gi, " ")
    .replace(/\btransakcja nierozliczona\b/gi, " ")
    .replace(/\bZAKUP PRZY UŻYCIU KARTY(?:\s*[–-]\s*INTERNET|\s+W KRAJU)?\b/gi, " ")
    .replace(/\bBLIK ZAKUP E-COMMERCE\b/gi, " ")
    .replace(
      /\b(Wpływy - inne|Wpływy|Wydatki|Zwierzęta|Sport i hobby|Akcesoria i wyposażenie|wyposażenie|Serwis i części|Kategoria|Rachunek)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .replace(/^[,.\-–]+|[,.\-–]+$/g, "")
    .trim();
}

export function detectStatementMonth(text: string): string | null {
  const period = text.match(/za okres od\s+(20\d{2})-(\d{2})-\d{2}/i);
  if (period) return `${period[1]}-${period[2]}`;
  const firstIso = text.match(/\b(20\d{2})-(0[1-9]|1[0-2])-\d{2}\b/);
  if (firstIso) return `${firstIso[1]}-${firstIso[2]}`;
  return null;
}

function looksLikeMbankOrIsoTable(lines: string[]) {
  const blob = normalizeText(lines.slice(0, 40).join(" "));
  const isoOps = lines.filter((l) => ISO_LINE.test(l)).length;
  if (blob.includes("mbank") || blob.includes("opis operacji") || blob.includes("mkonto")) return isoOps > 0;
  return isoOps >= 2;
}

function parseIsoTable(lines: string[], statementId: string): Transfer[] {
  const groups: { date: string; lines: string[] }[] = [];
  for (const line of lines) {
    const m = line.match(ISO_LINE);
    if (m) groups.push({ date: m[1], lines: [line] });
    else if (groups.length) {
      if (/^strona/i.test(line)) continue;
      groups[groups.length - 1]!.lines.push(line);
    }
  }
  const transfers: Transfer[] = [];
  for (const group of groups) {
    const block = group.lines.join(" ");
    const amounts = amountsIn(block).filter((a) => Math.abs(a.value) >= 0.01);
    if (!amounts.length) continue;
    const amount = amounts[amounts.length - 1]!.value;
    const direction = classifyDirection(block, amount);
    transfers.push({
      id: uid("tr"),
      statementId,
      date: group.date,
      amount: Math.abs(amount),
      title: cleanTransferTitle(block) || "Przelew bez tytułu",
      sender: "",
      raw: block,
      direction,
      ignored: direction === "out",
    });
  }
  return transfers;
}

export function parseTransfersFromText(text: string, statementId: string): Transfer[] {
  const rawLines = text.split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (looksLikeMbankOrIsoTable(rawLines)) return parseIsoTable(rawLines, statementId);
  const transfers: Transfer[] = [];
  let buffer: string[] = [];
  let currentDate: string | null = null;
  const flush = () => {
    if (!buffer.length) return;
    const block = buffer.join(" ");
    const amounts = amountsIn(block);
    const date = currentDate ?? parseLooseDate(block);
    const meaningful = amounts.filter((a) => Math.abs(a.value) >= 1 && Math.abs(a.value) < 100000);
    buffer = [];
    if (!date || !meaningful.length) return;
    const amount = meaningful[meaningful.length - 1]!.value;
    const direction = classifyDirection(block, amount);
    transfers.push({
      id: uid("tr"),
      statementId,
      date,
      amount: Math.abs(amount),
      title: cleanTransferTitle(block) || "Przelew bez tytułu",
      sender: "",
      raw: block,
      direction,
      ignored: direction === "out",
    });
  };
  for (const line of rawLines) {
    const date = parseLooseDate(line);
    const hasAmount = amountsIn(line).length > 0;
    const startsWithDate = /^(20\d{2}-\d{2}-\d{2}|\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b/.test(line);
    if (date && (hasAmount || startsWithDate)) {
      flush();
      currentDate = date;
      buffer = [line];
      if (hasAmount) flush();
      continue;
    }
    if (buffer.length) {
      buffer.push(line);
      if (hasAmount) flush();
    }
  }
  flush();
  return transfers;
}
