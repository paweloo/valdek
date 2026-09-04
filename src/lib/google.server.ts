import { getCookie, setCookie, deleteCookie, getRequest } from "@tanstack/react-start/server";
import { interpretExcelRow } from "./parse-excel";
import { readPinGate } from "./pin.server";
import { parseGoogleSheetUrl } from "./sheets-url";
import { nameKey } from "./match";
import { normalizeText } from "./polish";
import type { ExcelMapping } from "./types";

const AT = "valdek_g_at";
const RT = "valdek_g_rt";
const ST = "valdek_g_state";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

export type SheetPerson = {
  firstName: string;
  lastName: string;
  fee: number;
  groupName: string;
  monthsPaid: Record<string, boolean>;
};

function googleCredentials() {
  const id = String(process.env["GOOGLE_CLIENT_ID"] ?? "").trim();
  const secret = String(process.env["GOOGLE_CLIENT_SECRET"] ?? "").trim();
  if (!id || !secret) return null;
  return { id, secret };
}

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: !import.meta.env.DEV,
    maxAge,
  };
}

export function googleIsConfigured() {
  return googleCredentials() != null;
}

export function googleIsConnected() {
  return Boolean(getCookie(AT) || getCookie(RT));
}

export function publicOrigin(request?: Request | null) {
  const override = String(process.env["GOOGLE_REDIRECT_ORIGIN"] ?? "")
    .trim()
    .replace(/\/$/, "");
  if (override) return override;

  const req = request ?? getRequest() ?? null;
  if (!req) return "";
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const hostHeader = req.headers.get("host")?.split(",")[0]?.trim();
  let host = forwardedHost || hostHeader || url.host;
  if (host.startsWith("0.0.0.0")) host = host.replace(/^0\.0\.0\.0/, "localhost");
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = forwardedProto || url.protocol.replace(":", "") || "http";
  return `${proto}://${host}`;
}

export function googleCallbackUrl(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/google/callback`;
}

export function googleAuthUrl(origin: string, state: string) {
  const creds = googleCredentials();
  if (!creds) return null;
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", creds.id);
  url.searchParams.set("redirect_uri", `${origin}/api/google/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

export function newOAuthState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function setOAuthState(state: string) {
  setCookie(ST, state, cookieOpts(600));
}

export function readOAuthState() {
  return getCookie(ST) ?? "";
}

export function clearOAuthState() {
  deleteCookie(ST, { path: "/" });
}

export async function exchangeGoogleCode(origin: string, code: string) {
  const creds = googleCredentials();
  if (!creds) return { ok: false as const, error: "Brak GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET." };
  const body = new URLSearchParams({
    code,
    client_id: creds.id,
    client_secret: creds.secret,
    redirect_uri: `${origin}/api/google/callback`,
    grant_type: "authorization_code",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!res.ok || !json.access_token) {
    return { ok: false as const, error: "Google nie oddał tokenu. Sprawdź dane logowania." };
  }
  return {
    ok: true as const,
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    expiresIn: json.expires_in ?? 3600,
  };
}

async function refreshAccessToken() {
  const creds = googleCredentials();
  const refresh = getCookie(RT);
  if (!creds || !refresh) return null;
  const body = new URLSearchParams({
    client_id: creds.id,
    client_secret: creds.secret,
    refresh_token: refresh,
    grant_type: "refresh_token",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!res.ok || !json.access_token) return null;
  setCookie(AT, json.access_token, cookieOpts(Math.max(60, (json.expires_in ?? 3600) - 60)));
  return json.access_token;
}

async function accessToken() {
  return getCookie(AT) || (await refreshAccessToken());
}

export function disconnectGoogle() {
  deleteCookie(AT, { path: "/" });
  deleteCookie(RT, { path: "/" });
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

function quoteSheet(title: string) {
  return `'${title.replace(/'/g, "''")}'`;
}

function displayName(person: SheetPerson, mapping: ExcelMapping) {
  return mapping.nameOrder === "first-last"
    ? `${person.firstName} ${person.lastName}`.trim()
    : `${person.lastName} ${person.firstName}`.trim();
}

function groupFlagOn(personGroupName: string, flagName: string) {
  const wanted = normalizeText(flagName);
  return personGroupName
    .split(/\s*\+\s*/)
    .map((part) => normalizeText(part))
    .some((part) => part === wanted);
}

async function sheetsFetch(token: string, url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
}

export async function writeGoogleSheet(input: {
  url: string;
  mapping: ExcelMapping;
  people: SheetPerson[];
}) {
  const gate = readPinGate();
  if (gate.required && !gate.unlocked) return { ok: false as const, error: "Najpierw wpisz PIN." };
  const parsed = parseGoogleSheetUrl(input.url);
  if (!parsed) return { ok: false as const, error: "Brak linku do Google Sheets." };
  let token = await accessToken();
  if (!token) return { ok: false as const, error: "Zaloguj się kontem Google, które ma ten arkusz." };

  const loadMeta = (access: string) =>
    sheetsFetch(access, `https://sheets.googleapis.com/v4/spreadsheets/${parsed.id}?fields=sheets.properties`);

  let meta = await loadMeta(token);
  if (meta.status === 401) {
    token = await refreshAccessToken();
    if (!token) return { ok: false as const, error: "Sesja Google wygasła. Zaloguj się ponownie." };
    meta = await loadMeta(token);
  }
  if (!meta.ok) {
    return { ok: false as const, error: "Nie mam dostępu do arkusza. Zaloguj się kontem właściciela." };
  }
  const body = (await meta.json()) as {
    sheets?: { properties?: { sheetId?: number; title?: string } }[];
  };
  const sheets = body.sheets ?? [];
  const gid = parsed.gid ? Number(parsed.gid) : null;
  const props =
    (gid != null ? sheets.find((s) => s.properties?.sheetId === gid)?.properties : null) ??
    sheets[0]?.properties;
  const title = props?.title;
  if (!title) return { ok: false as const, error: "Nie znalazłem karty w arkuszu." };

  const valuesRes = await sheetsFetch(
    token!,
    `https://sheets.googleapis.com/v4/spreadsheets/${parsed.id}/values/${encodeURIComponent(quoteSheet(title))}`,
  );
  if (!valuesRes.ok) return { ok: false as const, error: "Nie udało się odczytać arkusza." };
  const grid = ((await valuesRes.json()) as { values?: string[][] }).values ?? [];
  if (!grid.length) return { ok: false as const, error: "Arkusz jest pusty — najpierw wczytaj go do Valdka." };

  const headerRow = grid.findIndex((row) => row.some((c) => String(c ?? "").trim()));
  if (headerRow < 0) return { ok: false as const, error: "Brak nagłówków w arkuszu." };

  const mapping = input.mapping;
  const updates: { range: string; values: (string | number | boolean)[][] }[] = [];
  const push = (col: number | undefined, rowIndex: number, value: string | number | boolean) => {
    if (col == null) return;
    const a1 = `${quoteSheet(title)}!${colLetter(col)}${rowIndex + 1}`;
    updates.push({ range: a1, values: [[value]] });
  };
  const writePerson = (rowIndex: number, person: SheetPerson) => {
    push(mapping.fullName, rowIndex, displayName(person, mapping));
    push(mapping.firstName, rowIndex, person.firstName);
    push(mapping.lastName, rowIndex, person.lastName);
    push(mapping.group, rowIndex, person.groupName);
    push(mapping.fee, rowIndex, person.fee);
    for (const flag of mapping.groupFlags ?? []) {
      push(flag.column, rowIndex, groupFlagOn(person.groupName, flag.name));
    }
    for (const [month, col] of Object.entries(mapping.months ?? {})) {
      push(col, rowIndex, Boolean(person.monthsPaid[month]));
    }
  };
  const remaining = new Map(input.people.map((p) => [nameKey(p), p]));

  for (let i = headerRow + 1; i < grid.length; i += 1) {
    const parsedRow = interpretExcelRow(grid[i] ?? [], mapping);
    if (!parsedRow) continue;
    const key = nameKey(parsedRow);
    const person = remaining.get(key);
    if (!person) continue;
    remaining.delete(key);
    writePerson(i, person);
  }

  let nextRow = grid.length;
  for (const person of remaining.values()) {
    writePerson(nextRow, person);
    nextRow += 1;
  }

  if (!updates.length) return { ok: false as const, error: "Nie ma nic do zapisania." };

  const saveRes = await sheetsFetch(
    token!,
    `https://sheets.googleapis.com/v4/spreadsheets/${parsed.id}/values:batchUpdate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valueInputOption: "USER_ENTERED", data: updates }),
    },
  );
  if (!saveRes.ok) {
    return { ok: false as const, error: "Google odrzuciło zapis. Sprawdź uprawnienia do arkusza." };
  }
  return { ok: true as const, updated: input.people.length };
}
