import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExcelMapping, NameOrder } from "@/lib/types";
import { guessMapping, interpretExcelRow, readSpreadsheet } from "@/lib/parse-excel";
import { useValdek } from "@/lib/store";
import { fullName } from "@/lib/polish";
import { formatPln } from "@/lib/utils";
import { toast } from "sonner";

const NONE = "__none__";

export function ExcelImportDialog({
  open,
  onOpenChange,
  file,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
}) {
  const seasonStartYear = useValdek((s) => s.seasonStartYear);
  const seedBanner = useValdek((s) => s.seedBanner);
  const importRows = useValdek((s) => s.importRows);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ExcelMapping>({ months: {} });
  const [mode, setMode] = useState<"merge" | "replace">("replace");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open || !file) {
      setReady(false);
      return;
    }
    let cancelled = false;
    void readSpreadsheet(file)
      .then((parsed) => {
        if (cancelled) return;
        setHeaders(parsed.headers);
        setRows(parsed.rows);
        setMapping(guessMapping(parsed.headers, seasonStartYear, parsed.rows));
        setMode(seedBanner ? "replace" : "merge");
        setReady(true);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Nie udało się odczytać Excela");
        onOpenChange(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file, open, seasonStartYear, onOpenChange, seedBanner]);

  const setField = (key: "fullName" | "firstName" | "lastName" | "group" | "fee", value: string) => {
    setMapping((m) => ({
      ...m,
      [key]: value === NONE ? undefined : Number(value),
    }));
  };

  const apply = () => {
    const count = importRows(rows, mapping, mode);
    toast.success(`Wczytano ${count} osób`);
    setReady(false);
    onOpenChange(false);
  };

  const colOptions = headers.map((h, i) => ({ value: String(i), label: h || `Kolumna ${i + 1}` }));
  const preview = rows
    .map((row) => interpretExcelRow(row, mapping))
    .filter((p): p is NonNullable<typeof p> => p != null)
    .slice(0, 4);
  const groupNames = mapping.groupFlags?.map((g) => g.name) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mapowanie kolumn</DialogTitle>
          <DialogDescription>
            Valdek czyta listę z grupami jako kolumny TAK/NIE i miesiącami. Popraw, jeśli nagłówki są inne.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <MapSelect
            label="Imię i nazwisko (jedna kolumna)"
            value={mapping.fullName}
            options={colOptions}
            onChange={(v) => setField("fullName", v)}
          />
          <div className="grid gap-2">
            <Label>Kolejność w kolumnie</Label>
            <Select
              value={mapping.nameOrder ?? "last-first"}
              onValueChange={(v) => setMapping((m) => ({ ...m, nameOrder: v as NameOrder }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-first">Nazwisko Imię (Zajk Julia)</SelectItem>
                <SelectItem value="first-last">Imię Nazwisko (Julia Zajk)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MapSelect
            label="Imię"
            value={mapping.firstName}
            options={colOptions}
            onChange={(v) => setField("firstName", v)}
          />
          <MapSelect
            label="Nazwisko"
            value={mapping.lastName}
            options={colOptions}
            onChange={(v) => setField("lastName", v)}
          />
          <MapSelect
            label="Grupa (jedna kolumna)"
            value={mapping.group}
            options={colOptions}
            onChange={(v) => setField("group", v)}
          />
          <MapSelect
            label="Stawka"
            value={mapping.fee}
            options={colOptions}
            onChange={(v) => setField("fee", v)}
          />
          <div className="grid gap-2">
            <Label>Jak wczytać</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as "merge" | "replace")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="replace">Zastąp całą listę</SelectItem>
                <SelectItem value="merge">Scal z obecną listą</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {groupNames.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            Grupy z kolumn TAK/NIE: {groupNames.join(" · ")}
          </p>
        ) : null}
        <div className="overflow-x-auto rounded-lg bg-secondary p-3">
          {preview.length ? (
            <ul className="text-sm">
              {preview.map((p, i) => (
                <li key={`${p.lastName}-${p.firstName}-${i}`} className="flex justify-between gap-3 py-1">
                  <span>
                    {fullName(p.firstName, p.lastName)}
                    <span className="text-muted-foreground"> · {p.groupName}</span>
                  </span>
                  <span className="tabular text-muted-foreground">{formatPln(p.fee)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nie widzę osób w tym arkuszu.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={apply} disabled={!ready || preview.length === 0}>
            Wczytaj listę
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MapSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: number;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select value={value == null ? NONE : String(value)} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>— pomiń —</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
