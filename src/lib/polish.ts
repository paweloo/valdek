export const PL_MONTHS = [
  "styczeń",
  "luty",
  "marzec",
  "kwiecień",
  "maj",
  "czerwiec",
  "lipiec",
  "sierpień",
  "wrzesień",
  "październik",
  "listopad",
  "grudzień",
] as const;

const MONTH_ALIASES: { month: number; names: string[] }[] = [
  { month: 1, names: ["styczen", "stycznia", "sty"] },
  { month: 2, names: ["luty", "lutego", "lut"] },
  { month: 3, names: ["marzec", "marca", "mar"] },
  { month: 4, names: ["kwiecien", "kwietnia", "kwi"] },
  { month: 5, names: ["maj", "maja"] },
  { month: 6, names: ["czerwiec", "czerwca", "cze"] },
  { month: 7, names: ["lipiec", "lipca", "lip"] },
  { month: 8, names: ["sierpien", "sierpnia", "sie"] },
  { month: 9, names: ["wrzesien", "wrzesnia", "wrz"] },
  { month: 10, names: ["pazdziernik", "pazdziernika", "paz", "pazdz"] },
  { month: 11, names: ["listopad", "listopada", "lis"] },
  { month: 12, names: ["grudzien", "grudnia", "gru"] },
];

const PL_FIRST_NAMES = new Set([
  "adam", "agnieszka", "aleksander", "aleksandra", "alicja", "aneta", "ania", "anna",
  "antoni", "barbara", "bartosz", "beata", "bogdan", "damian", "daniel", "danuta",
  "dariusz", "dawid", "dominik", "dorota", "elzbieta", "emilia", "ewa", "filip",
  "franciszek", "grazyna", "grzegorz", "halina", "hanna", "helena", "ignacy", "igor",
  "irena", "iwona", "jadwiga", "jakub", "jan", "janusz", "jaroslaw", "jerzy",
  "joanna", "jacek", "julia", "justyna", "kacper", "kamil", "karol", "karolina",
  "katarzyna", "kazimierz", "kinga", "konrad", "krystyna", "krzysztof", "lena",
  "leszek", "lidia", "lucja", "lukasz", "magdalena", "maja", "malgorzata", "marek",
  "maria", "marta", "martyna", "marcin", "mariusz", "mateusz", "michal", "mikolaj",
  "monika", "natalia", "nikola", "oliwia", "oliwier", "olga", "patrycja", "patryk",
  "paulina", "pawel", "piotr", "pola", "rafal", "renata", "robert", "ryszard",
  "sebastian", "stanislaw", "stefan", "sylwia", "szymon", "tadeusz", "teresa",
  "tomasz", "urszula", "weronika", "wiktor", "wiktoria", "wojciech", "zbigniew",
  "zenon", "zofia", "zosia", "zygmunt",
]);

export function stripDiacritics(input: string) {
  return input
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeText(input: string) {
  return stripDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  const idx = Number(month) - 1;
  const name = PL_MONTHS[idx] ?? monthKey;
  return `${name} ${year}`;
}

export function monthShort(monthKey: string) {
  const idx = Number(monthKey.slice(5, 7)) - 1;
  const name = PL_MONTHS[idx] ?? monthKey;
  return name.slice(0, 3);
}

export function seasonMonths(startYear: number) {
  const keys: string[] = [];
  for (let m = 9; m <= 12; m += 1) keys.push(`${startYear}-${String(m).padStart(2, "0")}`);
  for (let m = 1; m <= 6; m += 1) keys.push(`${startYear + 1}-${String(m).padStart(2, "0")}`);
  return keys;
}

export function currentSeasonStartYear(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 9 ? year : year - 1;
}

export function currentMonthKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function monthKeyFor(month: number, seasonYear: number) {
  const year = month >= 9 ? seasonYear : seasonYear + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function detectMonthsInText(text: string, fallbackYear: number): string[] {
  const norm = ` ${normalizeText(text)} `;
  const found = new Set<string>();
  for (const entry of MONTH_ALIASES) {
    for (const name of entry.names) {
      if (norm.includes(` ${name} `)) found.add(monthKeyFor(entry.month, fallbackYear));
    }
  }
  return [...found];
}

export function parsePln(raw: string) {
  const cleaned = raw.replace(/\s/g, "").replace(/zł|pln/gi, "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function parseLooseDate(raw: string): string | null {
  const iso = raw.match(/(20\d{2})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = raw.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (!dmy) return null;
  const day = dmy[1].padStart(2, "0");
  const month = dmy[2].padStart(2, "0");
  let year = dmy[3];
  if (year.length === 2) year = `20${year}`;
  return `${year}-${month}-${day}`;
}

export function fullName(first: string, last: string) {
  return `${first} ${last}`.trim();
}

export function splitFullName(name: string, order: "first-last" | "last-first" = "first-last") {
  const parts = name.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  if (order === "last-first") {
    return { lastName: parts[0], firstName: parts.slice(1).join(" ") };
  }
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.at(-1) ?? "" };
}

export function guessNameOrder(names: string[]): "first-last" | "last-first" {
  const parsed = names
    .map((n) => n.trim().split(/\s+/).filter(Boolean))
    .filter((p) => p.length >= 2);
  if (parsed.length === 0) return "last-first";
  const firstTokens = parsed.map((p) => normalizeText(p[0]));
  const lastTokens = parsed.map((p) => normalizeText(p[p.length - 1]));
  const firstDupes = firstTokens.length - new Set(firstTokens).size;
  const lastDupes = lastTokens.length - new Set(lastTokens).size;
  if (firstDupes > lastDupes) return "last-first";
  if (lastDupes > firstDupes) return "first-last";
  let lastFirstVotes = 0;
  let firstLastVotes = 0;
  for (const parts of parsed) {
    const a = normalizeText(parts[0]);
    const b = normalizeText(parts[parts.length - 1]);
    const aFirst = PL_FIRST_NAMES.has(a);
    const bFirst = PL_FIRST_NAMES.has(b);
    if (bFirst && !aFirst) lastFirstVotes += 1;
    if (aFirst && !bFirst) firstLastVotes += 1;
  }
  if (lastFirstVotes > firstLastVotes) return "last-first";
  if (firstLastVotes > lastFirstVotes) return "first-last";
  return "last-first";
}

export function headerLooksLikeMonth(header: string): string | null {
  const norm = normalizeText(header);
  for (const entry of MONTH_ALIASES) {
    if (entry.names.includes(norm) || norm.startsWith(entry.names[0])) {
      return String(entry.month).padStart(2, "0");
    }
  }
  return null;
}
