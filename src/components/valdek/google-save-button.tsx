import { useEffect, useState } from "react";
import { CloudUpload, LogIn, LogOut } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  const [status, setStatus] = useState<{ configured: boolean; connected: boolean; redirectUri: string } | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const connected = Boolean(status?.connected);

  const refreshStatus = () => {
    void getGoogleStatus()
      .then(setStatus)
      .catch(() => setStatus({ configured: false, connected: false, redirectUri: "" }));
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

  const login = () => {
    if (!status?.configured) {
      setSetupOpen(true);
      return;
    }
    window.location.assign("/api/google/start");
  };

  const save = async () => {
    if (!connected) return;
    if (!sourceSheetUrl) {
      toast.error("Najpierw wczytaj listę z Google Sheets.");
      return;
    }
    if (!sourceMapping) {
      toast.error("Brak mapowania kolumn. Wczytaj arkusz jeszcze raz.");
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
          const paid = rows.find((r) => r.lastFirst === `${p.lastName} ${p.firstName}`.trim());
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
    toast.success("Wylogowano z Google");
  };

  const clientRedirect =
    typeof window === "undefined" ? status?.redirectUri ?? "" : `${window.location.origin}/api/google/callback`;
  const redirectUri = status?.redirectUri || clientRedirect;
  const extraRedirects = redirectUri.includes("localhost")
    ? [redirectUri.replace("localhost", "127.0.0.1")]
    : redirectUri.includes("127.0.0.1")
      ? [redirectUri.replace("127.0.0.1", "localhost")]
      : [];

  const saveButton = (
    <Button variant="outline" onClick={() => void save()} disabled={!connected || busy}>
      <CloudUpload />
      Zapisz w Google Sheets
    </Button>
  );

  return (
    <>
      {connected ? (
        saveButton
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{saveButton}</span>
          </TooltipTrigger>
          <TooltipContent>Zaloguj się, żeby zapisać plik</TooltipContent>
        </Tooltip>
      )}
      {connected ? (
        <Button variant="ghost" onClick={() => void disconnect()}>
          <LogOut />
          Wyloguj
        </Button>
      ) : (
        <Button variant="secondary" onClick={login}>
          <LogIn />
          Zaloguj Google
        </Button>
      )}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Połącz Google Sheets</DialogTitle>
            <DialogDescription>
              Błąd <span className="font-mono">redirect_uri_mismatch</span> znaczy, że w Google Cloud nie ma
              dokładnie tego adresu. Wklej go 1:1, bez ukośnika na końcu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">Authorized redirect URI</p>
            <code className="block break-all rounded-md bg-secondary px-3 py-2 text-sm text-foreground">
              {redirectUri || "http://localhost:8080/api/google/callback"}
            </code>
            {extraRedirects.map((uri) => (
              <code key={uri} className="block break-all rounded-md bg-secondary px-3 py-2 text-sm text-foreground">
                {uri}
              </code>
            ))}
          </div>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Google Cloud → APIs & Services → Credentials → Twój OAuth client.</li>
            <li>Authorized redirect URIs → Add URI → wklej adresy powyżej.</li>
            <li>Authorized JavaScript origins: ten sam host, bez ścieżki (np. http://localhost:8080).</li>
            <li>Zapisz i poczekaj chwilę — Google czasem cache’uje stary URI.</li>
          </ol>
          <DialogFooter>
            <Button onClick={() => setSetupOpen(false)}>Rozumiem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
