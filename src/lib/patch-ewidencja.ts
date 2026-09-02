import JSZip from "jszip";
import { guessMapping } from "./parse-excel";
import { normalizeText } from "./polish";
import type { ExcelMapping, Group, ManualMark, Participant, PaymentMatch } from "./types";

export type EwidencjaPerson = {
  lastFirst: string;
  fee: number;
  groupName: string;
  monthsPaid: Record<string, boolean>;
};

const XML_ESCAPE: Record<string, string> = {
  "&": "&" + "amp;",
  "<": "&" + "lt;",
  ">": "&" + "gt;",
  '"': "&" + "quot;",
};

function escapeXml(s: string) {
  return s.replace(/[&<>"]/g, (ch) => XML_ESCAPE[ch] ?? ch);
}

function unescapeXml(s: string) {
  const amp = String.fromCharCode(38);
  return s
    .replaceAll(amp + "lt;", "<")
    .replaceAll(amp + "gt;", ">")
    .replaceAll(amp + "quot;", '"')
    .replaceAll(amp + "apos;", "'")
    .replaceAll(amp + "amp;", amp);
}

function colLetter(index: number) {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function colIndex(letters: string) {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function parseRows(sheetXml: string) {
  const rows: { num: number; xml: string }[] = [];
  const re = /<row r="(\d+)"[^>]*>[\s\S]*?<\/row>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sheetXml))) {
    rows.push({ num: Number(m[1]), xml: m[0] });
  }
  return rows;
}

function cellXml(rowXml: string, ref: string) {
  const re = new RegExp(`<c r="${ref}"[^/]*/>|<c r="${ref}"[^>]*>[\\s\\S]*?</c>`);
  const m = rowXml.match(re);
  return m?.[0] ?? "";
}

function cellStyle(rowXml: string, ref: string, fallback: string) {
  const xml = cellXml(rowXml, ref);
  const s = xml.match(/\ss="(\d+)"/);
  return s?.[1] ?? fallback;
}

function replaceCell(rowXml: string, ref: string, next: string) {
  const re = new RegExp(`<c r="${ref}"[^/]*/>|<c r="${ref}"[^>]*>[\\s\\S]*?</c>`);
  if (re.test(rowXml)) return rowXml.replace(re, next);
  return rowXml.replace("</row>", `${next}</row>`);
}

function checkboxStyle(sheetXml: string) {
  const m =
    sheetXml.match(/<c r="[A-Z]+\d+"[^>]*\bs="(\d+)"[^>]*\bt="b"/) ??
    sheetXml.match(/<c r="[A-Z]+\d+"[^>]*\bt="b"[^>]*\bs="(\d+)"/);
  return m?.[1] ?? "14";
}

function setNameCell(rowXml: string, col: number, row: number, name: string, strings: string[]) {
  const ref = `${colLetter(col)}${row}`;
  const current = cellText(rowXml, col, row, strings);
  if (current === name) return rowXml;
  const s = cellStyle(rowXml, ref, "9");
  return replaceCell(
    rowXml,
    ref,
    `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(name)}</t></is></c>`,
  );
}

function setNumberCell(rowXml: string, col: number, row: number, value: number) {
  const ref = `${colLetter(col)}${row}`;
  const existing = cellXml(rowXml, ref);
  if (existing && /<v>/.test(existing) && !/\bt="b"/.test(existing) && !/\bt="s"/.test(existing) && !/\bt="inlineStr"/.test(existing)) {
    const current = Number(existing.match(/<v>([\s\S]*?)<\/v>/)?.[1]);
    if (current === value) return rowXml;
    return replaceCell(rowXml, ref, existing.replace(/<v>[\s\S]*?<\/v>/, `<v>${value}</v>`));
  }
  const s = cellStyle(rowXml, ref, "11");
  return replaceCell(rowXml, ref, `<c r="${ref}" s="${s}"><v>${value}</v></c>`);
}

function setBoolCell(rowXml: string, col: number, row: number, value: boolean, style: string) {
  const ref = `${colLetter(col)}${row}`;
  const existing = cellXml(rowXml, ref);
  const v = value ? "1" : "0";
  if (existing && /\bt="b"/.test(existing)) {
    if (existing.includes(`<v>${v}</v>`)) return rowXml;
    if (/<v>/.test(existing)) return replaceCell(rowXml, ref, existing.replace(/<v>[\s\S]*?<\/v>/, `<v>${v}</v>`));
    return replaceCell(rowXml, ref, existing.replace(/\/>$/, `><v>${v}</v></c>`).replace(/<c /, `<c t="b" `));
  }
  const s = cellStyle(rowXml, ref, style);
  return replaceCell(rowXml, ref, `<c r="${ref}" s="${s}" t="b"><v>${v}</v></c>`);
}

function readSharedStrings(xml: string) {
  const out: string[] = [];
  const re = /<si>([\s\S]*?)<\/si>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const texts = [...m[1]!.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => unescapeXml(x[1] ?? ""));
    out.push(texts.join(""));
  }
  return out;
}

function cellText(rowXml: string, col: number, row: number, strings: string[]) {
  const ref = `${colLetter(col)}${row}`;
  const xml = cellXml(rowXml, ref);
  if (!xml) return "";
  if (/\bt="inlineStr"/.test(xml)) {
    return [...xml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => unescapeXml(x[1] ?? "")).join("");
  }
  const v = xml.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? "";
  if (/\bt="s"/.test(xml)) return strings[Number(v)] ?? "";
  if (/\bt="b"/.test(xml)) return v === "1" ? "TRUE" : "FALSE";
  return v;
}

function maxColInRow(rowXml: string, row: number) {
  let max = 0;
  const re = new RegExp(`r="([A-Z]+)${row}"`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(rowXml))) max = Math.max(max, colIndex(m[1]!));
  return max;
}

function groupFlagOn(personGroupName: string, flagName: string) {
  const wanted = normalizeText(flagName);
  return personGroupName
    .split(/\s*\+\s*/)
    .map((part) => normalizeText(part))
    .some((part) => part === wanted);
}

function applyPerson(
  rowXml: string,
  rowNum: number,
  person: EwidencjaPerson,
  mapping: ExcelMapping,
  strings: string[],
  boolStyle: string,
) {
  let xml = rowXml;
  const nameCol = mapping.fullName ?? 0;
  xml = setNameCell(xml, nameCol, rowNum, person.lastFirst, strings);
  if (mapping.fee != null) xml = setNumberCell(xml, mapping.fee, rowNum, person.fee);
  for (const flag of mapping.groupFlags ?? []) {
    xml = setBoolCell(xml, flag.column, rowNum, groupFlagOn(person.groupName, flag.name), boolStyle);
  }
  for (const [month, col] of Object.entries(mapping.months)) {
    xml = setBoolCell(xml, col, rowNum, Boolean(person.monthsPaid[month]), boolStyle);
  }
  return xml;
}

function clearPerson(rowXml: string, rowNum: number, mapping: ExcelMapping, boolStyle: string) {
  let xml = rowXml;
  const nameCol = mapping.fullName ?? 0;
  const ref = `${colLetter(nameCol)}${rowNum}`;
  const s = cellStyle(xml, ref, "6");
  xml = replaceCell(xml, ref, `<c r="${ref}" s="${s}"/>`);
  if (mapping.fee != null) {
    const fref = `${colLetter(mapping.fee)}${rowNum}`;
    xml = replaceCell(xml, fref, `<c r="${fref}" s="${cellStyle(xml, fref, "13")}"/>`);
  }
  for (const flag of mapping.groupFlags ?? []) xml = setBoolCell(xml, flag.column, rowNum, false, boolStyle);
  for (const col of Object.values(mapping.months)) xml = setBoolCell(xml, col, rowNum, false, boolStyle);
  return xml;
}

function retargetRow(xml: string, from: number, to: number) {
  return xml
    .replace(new RegExp(`(<row r=")${from}"`), `$1${to}"`)
    .replace(new RegExp(`r="([A-Z]+)${from}"`, "g"), `r="$1${to}"`);
}

function matrixFromSheet(sheetXml: string, strings: string[]) {
  const xmlRows = parseRows(sheetXml);
  let maxCol = 0;
  for (const r of xmlRows) maxCol = Math.max(maxCol, maxColInRow(r.xml, r.num));
  const lines = xmlRows.map((r) => ({
    num: r.num,
    xml: r.xml,
    cells: Array.from({ length: maxCol + 1 }, (_, c) => cellText(r.xml, c, r.num, strings)),
  }));
  const nonempty = lines.filter((line) => line.cells.some((c) => c.trim().length > 0));
  const headerLine = nonempty[0];
  if (!headerLine) throw new Error("Brak wiersza nagłówków w arkuszu.");
  const dataLines = nonempty.filter((line) => line.num > headerLine.num);
  return {
    maxCol,
    xmlRows,
    headerLine,
    dataLines,
    headers: headerLine.cells,
    rows: dataLines.map((line) => line.cells),
  };
}

async function sheetPathFor(zip: JSZip) {
  const workbook = await zip.file("xl/workbook.xml")?.async("string");
  const rels = await zip.file("xl/_rels/workbook.xml.rels")?.async("string");
  if (workbook && rels) {
    const sheets = [...workbook.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?>/g)];
    const relMap = new Map(
      [...rels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"|Target="([^"]+)"[^>]*Id="([^"]+)"/g)].map((m) => [
        m[1] ?? m[4] ?? "",
        m[2] ?? m[3] ?? "",
      ]),
    );
    const preferred =
      sheets.find((s) => normalizeText(s[1] ?? "") === "ewidencja") ??
      sheets.find((s) => /ewidenc/i.test(s[1] ?? "")) ??
      sheets[0];
    if (preferred) {
      let target = relMap.get(preferred[2] ?? "") ?? "worksheets/sheet1.xml";
      if (target.startsWith("/")) target = target.slice(1);
      if (!target.startsWith("xl/")) target = `xl/${target}`;
      if (zip.file(target)) return target;
    }
  }
  const fallback = Object.keys(zip.files).find((p) => /xl\/worksheets\/sheet\d+\.xml$/.test(p));
  if (!fallback) throw new Error("Brak arkusza w pliku Excel.");
  return fallback;
}

export async function patchEwidencjaWorkbook(source: ArrayBuffer | Uint8Array, people: EwidencjaPerson[], seasonYear: number) {
  const bytes = source instanceof Uint8Array ? source : new Uint8Array(source);
  const zip = await JSZip.loadAsync(bytes);
  const sheetPath = await sheetPathFor(zip);
  const sheetXml = await zip.file(sheetPath)!.async("string");
  const sstFile = zip.file("xl/sharedStrings.xml");
  const strings = sstFile ? readSharedStrings(await sstFile.async("string")) : [];
  const boolStyle = checkboxStyle(sheetXml);

  const parsed = matrixFromSheet(sheetXml, strings);
  const mapping = guessMapping(parsed.headers, seasonYear, parsed.rows);
  const nameCol = mapping.fullName ?? 0;
  const xmlRows = parsed.xmlRows;
  const dataRows = parsed.dataLines.filter((r) => (r.cells[nameCol] ?? "").trim().length > 0);
  const checkboxRow = xmlRows.find((r) => /t="b"/.test(r.xml));
  const template = dataRows[0] ?? checkboxRow ?? xmlRows.find((r) => r.num > parsed.headerLine.num);
  if (!template) throw new Error("Nie umiem znaleźć wiersza z uczestnikiem do skopiowania.");
  const dataStart = template.num;

  const used = new Set<number>();
  const replacements = new Map<number, string>();
  const extraRows: { num: number; xml: string }[] = [];

  for (const person of people) {
    const key = normalizeText(person.lastFirst);
    const existing = dataRows.find((r) => !used.has(r.num) && normalizeText(r.cells[nameCol] ?? "") === key);
    if (existing) {
      used.add(existing.num);
      replacements.set(existing.num, applyPerson(existing.xml, existing.num, person, mapping, strings, boolStyle));
      continue;
    }
    const empty = xmlRows.find(
      (r) => r.num >= dataStart && !used.has(r.num) && !dataRows.some((d) => d.num === r.num),
    );
    const sourceXml = "xml" in template ? template.xml : "";
    const sourceNum = "num" in template ? template.num : 3;
    if (empty) {
      used.add(empty.num);
      const cloned = retargetRow(sourceXml, sourceNum, empty.num);
      replacements.set(empty.num, applyPerson(cloned, empty.num, person, mapping, strings, boolStyle));
      continue;
    }
    const lastNum = Math.max(0, ...xmlRows.map((r) => r.num), ...extraRows.map((r) => r.num));
    const nextNum = lastNum + 1;
    const cloned = retargetRow(sourceXml, sourceNum, nextNum);
    const applied = applyPerson(cloned, nextNum, person, mapping, strings, boolStyle);
    extraRows.push({ num: nextNum, xml: applied });
    used.add(nextNum);
  }

  for (const row of dataRows) {
    if (used.has(row.num)) continue;
    replacements.set(row.num, clearPerson(row.xml, row.num, mapping, boolStyle));
  }

  let nextSheet = sheetXml;
  for (const row of xmlRows) {
    const updated = replacements.get(row.num);
    if (updated && updated !== row.xml) nextSheet = nextSheet.replace(row.xml, updated);
  }
  if (extraRows.length) {
    const block = extraRows.map((r) => r.xml).join("");
    nextSheet = nextSheet.replace("</sheetData>", `${block}</sheetData>`);
  }

  if (extraRows.length) {
    const maxRow = Math.max(...parseRows(nextSheet).map((r) => r.num));
    const dim = sheetXml.match(/<dimension ref="([A-Z]+\d+):([A-Z]+)\d+"\/>/);
    const start = dim?.[1] ?? "A1";
    const endCol = dim?.[2] ?? colLetter(parsed.maxCol);
    nextSheet = nextSheet.replace(/<dimension ref="[^"]+"\/>/, `<dimension ref="${start}:${endCol}${maxRow}"/>`);
  }

  zip.file(sheetPath, nextSheet);
  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    compression: "DEFLATE",
  });
}

export function peopleFromState(params: {
  participants: Participant[];
  groups: Group[];
  matches: PaymentMatch[];
  manual: Record<string, Record<string, ManualMark>>;
  seasonMonths: string[];
}): EwidencjaPerson[] {
  return params.participants
    .filter((p) => p.active)
    .map((p) => {
      const group = params.groups.find((g) => g.id === p.groupId)?.name ?? "";
      const monthsPaid: Record<string, boolean> = {};
      for (const month of params.seasonMonths) {
        const received = params.matches
          .filter((m) => m.participantId === p.id && m.month === month && m.kind !== "suggested")
          .reduce((sum, m) => sum + m.amount, 0);
        const mark = params.manual[p.id]?.[month];
        monthsPaid[month] = mark?.status === "paid" || mark?.status === "partial" || received > 0;
      }
      return {
        lastFirst: `${p.lastName} ${p.firstName}`.trim(),
        fee: p.monthlyFee,
        groupName: group,
        monthsPaid,
      };
    });
}
