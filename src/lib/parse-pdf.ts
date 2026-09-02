import { parseTransfersFromText, reconstructLines } from "./parse-text";
import { uid } from "./utils";
import type { Statement, Transfer } from "./types";

export type PdfParseResult = {
  statement: Statement;
  transfers: Transfer[];
  text: string;
};

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
}

export async function parseBankPdf(
  file: File | ArrayBuffer | Uint8Array,
  fileName: string,
  month: string,
): Promise<PdfParseResult> {
  const pdfjs = await loadPdfjs();
  const data =
    file instanceof File ? await file.arrayBuffer() : file instanceof Uint8Array ? file : new Uint8Array(file);
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const statementId = uid("st");
  const allLines: string[] = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = content.items
      .map((item) => {
        if (!("str" in item) || !("transform" in item)) return null;
        const transform = item.transform as number[];
        return { str: String(item.str), x: transform[4] ?? 0, y: transform[5] ?? 0 };
      })
      .filter((x): x is { str: string; x: number; y: number } => x != null);
    allLines.push(...reconstructLines(items));
  }
  const text = allLines.join("\n");
  const transfers = parseTransfersFromText(text, statementId);
  const incoming = transfers.filter((t) => t.direction !== "out" && !t.ignored);
  const letters = text.replace(/\s/g, "").length;
  const warning =
    letters < 40
      ? "Ten PDF wygląda na skan bez warstwy tekstu. Poproś bank o PDF z tekstem albo wklej historię ręcznie."
      : transfers.length === 0
        ? "Nie udało się rozpoznać przelewów. Sprawdź, czy to wyciąg z operacjami, albo wklej tekst."
        : incoming.length === 0 && transfers.length > 0
          ? "Na wyciągu są głównie wydatki. Wpłaty przychodzące Valdek weźmie do rozliczenia, zakupy kartą pomija."
          : undefined;
  return {
    statement: {
      id: statementId,
      fileName,
      month,
      importedAt: new Date().toISOString(),
      transferCount: incoming.length,
      warning,
    },
    transfers,
    text,
  };
}

export function buildSamplePdf(lines: string[]) {
  const leading = 12;
  const commands = ["BT", "/F1 9 Tf", "36 800 Td"];
  lines.forEach((line, i) => {
    const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    if (i === 0) commands.push(`(${escaped}) Tj`);
    else commands.push(`0 -${leading} Td (${escaped}) Tj`);
  });
  commands.push("ET");
  const stream = commands.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj",
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(body.length);
    body += `${obj}\n`;
  }
  const xrefStart = body.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  body += `${xref}trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new TextEncoder().encode(body);
}
