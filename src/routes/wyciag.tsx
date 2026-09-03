import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/valdek/app-shell";
import { FileDrop } from "@/components/valdek/file-drop";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { parseBankPdf, buildSamplePdf } from "@/lib/parse-pdf";
import { parseTransfersFromText } from "@/lib/parse-text";
import { DEMO_STATEMENT_LINES } from "@/lib/demo";
import { useValdek } from "@/lib/store";
import { uid, formatPln } from "@/lib/utils";
import { monthLabel } from "@/lib/polish";
import { toast } from "sonner";
import type { Statement, Transfer } from "@/lib/types";

export const Route = createFileRoute("/wyciag")({ component: WyciagPage });

function WyciagPage() {
  const selectedMonth = useValdek((s) => s.selectedMonth);
  const statements = useValdek((s) => s.statements);
  const transfers = useValdek((s) => s.transfers);
  const matches = useValdek((s) => s.matches);
  const addStatement = useValdek((s) => s.addStatement);
  const removeStatement = useValdek((s) => s.removeStatement);
  const ignoreTransfer = useValdek((s) => s.ignoreTransfer);
  const updateTransfer = useValdek((s) => s.updateTransfer);
  const navigate = useNavigate();
  const [paste, setPaste] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSpend, setShowSpend] = useState(false);

  const ingest = (statement: Statement, nextTransfers: Transfer[]) => {
    addStatement(statement, nextTransfers);
    const incoming = nextTransfers.filter((t) => t.direction !== "out" && !t.ignored).length;
    const skipped = nextTransfers.length - incoming;
    toast.success(
      skipped > 0
        ? `Wczytano ${incoming} wpłat, pominięto ${skipped} wydatków kartą`
        : `Wczytano ${incoming} wpłat`,
    );
    void navigate({ to: "/rozliczenie" });
  };

  const onPdf = async (file: File) => {
    setBusy(true);
    try {
      const result = await parseBankPdf(file, file.name, selectedMonth);
      if (result.statement.warning) toast.message(result.statement.warning);
      ingest(result.statement, result.transfers);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się odczytać PDF");
    } finally {
      setBusy(false);
    }
  };

  const onPaste = () => {
    const statementId = uid("st");
    const next = parseTransfersFromText(paste, statementId);
    ingest(
      {
        id: statementId,
        fileName: "wklejony-tekst.txt",
        month: selectedMonth,
        importedAt: new Date().toISOString(),
        transferCount: next.filter((t) => t.direction !== "out" && !t.ignored).length,
      },
      next,
    );
  };

  const loadSample = async () => {
    setBusy(true);
    try {
      const bytes = buildSamplePdf(DEMO_STATEMENT_LINES);
      const result = await parseBankPdf(bytes, "przyklad-lista-operacji.pdf", selectedMonth);
      ingest(result.statement, result.transfers);
    } catch {
      const statementId = uid("st");
      const next = parseTransfersFromText(DEMO_STATEMENT_LINES.join("\n"), statementId);
      ingest(
        {
          id: statementId,
          fileName: "przyklad-lista-operacji.pdf",
          month: selectedMonth,
          importedAt: new Date().toISOString(),
          transferCount: next.filter((t) => t.direction !== "out" && !t.ignored).length,
        },
        next,
      );
    } finally {
      setBusy(false);
    }
  };

  const visible = showSpend
    ? transfers
    : transfers.filter((t) => !t.ignored && t.direction !== "out");
  const hiddenSpend =
    transfers.length - transfers.filter((t) => !t.ignored && t.direction !== "out").length;

  return (
    <AppShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Bank</p>
          <h1 className="font-display mt-1 text-4xl">Wyciąg</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Lista operacji wczytanych z wyciągu PDF z banku
          </p>
        </header>
        <div className="grid gap-4 lg:grid-cols-2">
          <FileDrop accept="application/pdf,.pdf" onFile={onPdf} label="Wgraj PDF z wyciągiem">
            <FileText className="mb-3 size-6 text-muted-foreground" />
            <div className="font-display text-2xl">
              {busy
                ? "Czytam wyciąg…"
                : `Dodaj wyciąg z mBanku w formacie PDF za ${monthLabel(selectedMonth)}`}
            </div>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Aby dodać dokument za inny miesiąc, zmień miesiąc w menu w prawym górnym rogu
            </p>
          </FileDrop>
          <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
            <div className="font-medium">Wklej historię</div>
            <p className="mt-1 mb-3 text-sm text-muted-foreground">
              Gdy PDF jest skanem, skopiuj operacje z bankowości.
            </p>
            <Textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder={"2026-09-02  JULIA ZAJK SENIORZY WRZESIEŃ  10,00 PLN"}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={onPaste} disabled={!paste.trim()}>
                Wczytaj tekst
              </Button>
              <Button variant="secondary" onClick={() => void loadSample()} disabled={busy}>
                Przykładowy wyciąg mBank
              </Button>
            </div>
          </div>
        </div>
        {statements.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-2xl">Wczytane pliki</h2>
            <ul className="grid gap-2">
              {statements.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-card px-4 py-3 shadow-[var(--shadow-border)]"
                >
                  <div>
                    <div className="text-sm font-medium">{s.fileName}</div>
                    <div className="text-xs text-muted-foreground">{monthLabel(s.month)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Usuń wyciąg"
                    onClick={() => removeStatement(s.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section className="overflow-x-auto rounded-xl bg-card shadow-[var(--shadow-border)]">
          <div className="flex items-center justify-between gap-3 px-4 pt-4">
            <h2 className="font-display text-2xl">Operacje</h2>
            {hiddenSpend > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setShowSpend((v) => !v)}>
                {showSpend ? "Ukryj wydatki kartą" : `Pokaż wydatki kartą (${hiddenSpend})`}
              </Button>
            ) : null}
          </div>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-3 py-3 font-medium">Kwota</th>
                <th className="px-3 py-3 font-medium">Tytuł</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => {
                const match = matches.find((m) => m.transferId === t.id);
                return (
                  <tr key={t.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 tabular text-muted-foreground">{t.date}</td>
                    <td className="px-3 py-3 tabular">{formatPln(t.amount)}</td>
                    <td className="px-3 py-3">
                      <input
                        className="h-9 w-full min-w-48 rounded-sm bg-transparent px-1"
                        value={t.title}
                        onChange={(e) => updateTransfer(t.id, { title: e.target.value })}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {t.ignored ? (
                          <Badge variant="outline">pominięty</Badge>
                        ) : match ? (
                          <Badge variant={match.kind === "suggested" ? "warn" : "paid"}>
                            {match.kind === "suggested" ? "do weryfikacji" : "dopasowany"}
                          </Badge>
                        ) : (
                          <Badge variant="unpaid">nierozpoznany</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => ignoreTransfer(t.id, !t.ignored)}
                        >
                          {t.ignored ? "Przywróć" : "Pomiń"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visible.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Jeszcze nie ma wpłat za ten sezon.
            </p>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
