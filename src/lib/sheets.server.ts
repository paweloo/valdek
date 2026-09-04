import { parseGoogleSheetUrl } from "./sheets-url";
import { readPinGate } from "./pin.server";
import { bufferToB64 } from "./utils";

const MAX_BYTES = 5 * 1024 * 1024;
const XLSX_MAGIC = [0x50, 0x4b, 0x03, 0x04];

function looksLikeXlsx(bytes: Uint8Array) {
  return XLSX_MAGIC.every((b, i) => bytes[i] === b);
}

function looksLikeHtml(bytes: Uint8Array) {
  const head = new TextDecoder("utf-8", { fatal: false }).decode(bytes.slice(0, 160)).toLowerCase();
  return head.includes("<html") || head.includes("<!doctype") || head.includes("accounts.google");
}

export async function downloadGoogleSheet(rawUrl: string) {
  const gate = readPinGate();
  if (gate.required && !gate.unlocked) {
    return { ok: false as const, error: "Najpierw wpisz PIN." };
  }
  const parsed = parseGoogleSheetUrl(rawUrl);
  if (!parsed) {
    return { ok: false as const, error: "To nie wygląda na link do Google Sheets." };
  }
  const exportUrl = new URL(`https://docs.google.com/spreadsheets/d/${parsed.id}/export`);
  exportUrl.searchParams.set("format", "xlsx");
  if (parsed.gid) exportUrl.searchParams.set("gid", parsed.gid);

  let res: Response;
  try {
    res = await fetch(exportUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream" },
    });
  } catch {
    return { ok: false as const, error: "Nie udało się pobrać arkusza. Sprawdź łącze." };
  }

  const finalHost = (() => {
    try {
      return new URL(res.url).hostname;
    } catch {
      return "";
    }
  })();
  if (finalHost && !finalHost.endsWith("google.com") && !finalHost.endsWith("googleusercontent.com")) {
    return { ok: false as const, error: "Nie udało się pobrać arkusza." };
  }
  if (!res.ok) {
    return {
      ok: false as const,
      error:
        "Arkusz jest prywatny. W Google Sheets: Udostępnij → Ogólny dostęp → Każdy, kto ma link → Czytający.",
    };
  }

  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) {
    return { ok: false as const, error: "Arkusz jest pusty albo za duży." };
  }
  if (looksLikeHtml(buf) || !looksLikeXlsx(buf)) {
    return {
      ok: false as const,
      error:
        "Arkusz jest prywatny. W Google Sheets: Udostępnij → Ogólny dostęp → Każdy, kto ma link → Czytający.",
    };
  }

  const fileName = "UCZESTNICY.xlsx";
  return { ok: true as const, b64: bufferToB64(buf.buffer), fileName };
}
