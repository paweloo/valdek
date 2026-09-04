import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchGoogleSheet } from "@/lib/sheets";
import { useValdek } from "@/lib/store";
import { b64ToBuffer } from "@/lib/utils";

export function SheetsImportDialog({
  open,
  onOpenChange,
  onFile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFile: (file: File) => void;
}) {
  const savedUrl = useValdek((s) => s.sourceSheetUrl);
  const setSourceSheetUrl = useValdek((s) => s.setSourceSheetUrl);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setUrl(savedUrl ?? "");
  }, [open, savedUrl]);

  const load = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await fetchGoogleSheet({ data: { url } });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const file = new File([new Uint8Array(b64ToBuffer(result.b64))], result.fileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      setSourceSheetUrl(url.trim());
      onOpenChange(false);
      onFile(file);
    } catch {
      toast.error("Nie udało się pobrać arkusza.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google Sheets</DialogTitle>
          <DialogDescription>Wklej link do arkusza z listą uczestników</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="sheet-url">Link do arkusza</Label>
          <Input
            id="sheet-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/…"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void load();
              }
            }}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            W arkuszu: Udostępnij → Ogólny dostęp → Każdy, kto ma link → Czytający. Bez tego Google
            nie będzie w stanie odczytać pliku.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={() => void load()} disabled={busy || url.trim().length < 8}>
            {busy
              ? "Pobieranie…"
              : savedUrl && url.trim() === savedUrl
                ? "Odśwież listę"
                : "Wczytaj arkusz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
