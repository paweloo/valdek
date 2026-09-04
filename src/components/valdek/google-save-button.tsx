import { useEffect, useState } from "react";
import { CloudUpload, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { disconnectGoogle, getGoogleStatus, saveGoogleSheet } from "@/lib/google";
import { peopleFromState } from "@/lib/patch-ewidencja";
import { seasonMonths } from "@/lib/polish";
import { useValdek } from "@/lib/store";

export function GoogleSaveButton() {
  const participants = useValdek((s) => s.participants);
  const groups = useValdek((s) => s.groups);
  const matches = useValdek((s) => s.matches);
  const manual = useValdek((s) => s.manual);
  const seasonStartYear = useValdek((s) => s.seasonStartYear);
  const sourceSheetUrl = useValdek((s) => s.sourceSheetUrl);
  const sourceMapping = useValdek((s) => s.sourceMapping);
  const [status, setStatus] = useState<{ configured: boolean; connected: boolean } | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const refreshStatus = () => {
    void getGoogleStatus()
      .then(setStatus)
      .catch(() => setStatus({ configured: false, connected: false }));
  };

  useEffect(() => {
    refreshStatus();
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("google");
    if (flag === "ok") toast.success("Połączono konto Google");
    if (flag === "denied") toast.error("Logowanie Google zostało przerwane");
    if (flag === "setup") setSetupOpen(true);
    if (flag) {
      const url = new URL(window.location.href);
      url.searchParams.delete("google");
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  const save = async () => {
    if (!sourceSheetUrl) {
      toast.error("Najpierw wczytaj listę z Google Sheets.");
      return;
    }
    if (!sourceMapping) {
      toast.error("Brak mapowania kolumn. Wczytaj arkusz jeszcze raz.");
      return;
    }
    if (!status?.configured) {
      setSetupOpen(true);
      return;
    }
    if (!status.connected) {
      window.location.assign("/api/google/start");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const months = seasonMonths(seasonStartYear);
      const rows = peopleFromState({ participants, groups, matches, manual, seasonMonths: months });
      const people = participants
        .filter((p) => p.active)
        .map((p) => {
          const groupName = groups.find((g) => g.id === p.groupId)?.name ?? "";
          const paid = rows.find(
            (r) => r.lastFirst === `${p.lastName} ${p.firstName}`.trim(),
          );
          return {
            firstName: p.firstName,
            lastName: p.lastName,
            fee: p.monthlyFee,
            groupName,
            monthsPaid: paid?.monthsPaid ?? {},
          };
        });
      const result = await saveGoogleSheet({
        data: { url: sourceSheetUrl, mapping: sourceMapping, people },
      });
      if (!result.ok) {
        if (result.error.includes("Zaloguj")) window.location.assign("/api/google/start");
        else toast.error(result.error);
        return;
      }
      toast.success(`Zapisano ${result.updated} osób w Google Sheets`);
    } catch {
      toast.error("Nie udało się zapisać arkusza.");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    await disconnectGoogle();
    setStatus((s) => (s ? { ...s, connected: false } : s));
    toast.success("Rozłączono Google");
  };

  return (
    <>
      <Button variant="outline" onClick={() => void save()} disabled={busy}>
        <CloudUpload />
        {status?.connected ? "Zapisz do arkusza" : "Zaloguj Google i zapisz"}
      </Button>
      {status?.connected ? (
        <Button variant="ghost" size="icon" aria-label="Rozłącz Google" onClick={() => void disconnect()}>
          <LogOut />
        </Button>
      ) : null}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Połącz Google Sheets</DialogTitle>
            <DialogDescription>
              Żeby Valdek zapisywał zmiany w arkuszu, potrzebuje logowania Google z dostępem do
              arkuszy. Ustaw to raz w projekcie Google Cloud i w Vercel.
            </DialogDescription>
          </DialogHeader>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>W Google Cloud włącz Google Sheets API.</li>
            <li>Utwórz identyfikator klienta OAuth (aplikacja internetowa).</li>
            <li>
              Authorized redirect URI: adres Valdka + <span className="font-mono text-foreground">/api/google/callback</span>
            </li>
            <li>
              W Vercel dodaj <span className="font-mono text-foreground">GOOGLE_CLIENT_ID</span> i{" "}
              <span className="font-mono text-foreground">GOOGLE_CLIENT_SECRET</span>.
            </li>
          </ol>
          <DialogFooter>
            <Button onClick={() => setSetupOpen(false)}>Rozumiem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
