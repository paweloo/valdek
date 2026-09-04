const SHEET_ID = /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/;
const GID = /(?:[?#&]gid=)(\d+)/;

export function parseGoogleSheetUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "docs.google.com" && host !== "sheets.google.com") return null;
  const id = url.pathname.match(SHEET_ID)?.[1];
  if (!id) return null;
  const gid = `${url.search}${url.hash}`.match(GID)?.[1] ?? null;
  return { id, gid };
}
