import { CircleHelp } from "lucide-react";
import { useState } from "react";
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

const STEPS = [
  {
    title: "Uczestnicy",
    body: "Kliknij „Wczytaj z Google Sheets” i wklej link do arkusza. Pamiętaj, aby najpierw wybrać odpowiednią zakładkę w Google Sheets przed skopiowaniem listy, którą chcesz wczytać - Valdek pobierze dane tylko z aktywnego arkusza.",
  },
  {
    title: "Uprawnienia arkusza",
    body: "Arkusz musi być odczytywalny przez aplikację. W Google Sheets: Udostępnij → Ogólny dostęp → Każdy, kto ma link → Czytający.",
  },
  {
    title: "Wyciąg",
    body: "Wgraj PDF z historią operacji z banku. Na razie obsługiwany jest tylko mBank. Możesz dodać kilka wyciągów na raz.",
  },
  {
    title: "Rozliczenie",
    body: "Zaakceptuj dopasowane przelewy, przypisz nierozpoznane do właściwej osoby i miesiąca albo pomiń operację, jeśli nie dotyczy zajęć.",
  },
  {
    title: "Zapis zmian",
    body: "Po rozliczeniu wpłat możesz zapisać zaktualizowaną listę z powrotem do tego samego arkusza. Aby to zrobić, przejdź do zakładki „Uczestnicy” i wybierz „Zapisz w Google Sheets”. Ta funkcja wymaga zalogowania się poprzez kliknięcie „Zaloguj się w Google”.",
  },
] as const;

export function HelpButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Instrukcja obsługi"
            onClick={() => setOpen(true)}
          >
            <CircleHelp />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Jak korzystać z Valdka</TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Jak korzystać z Valdka</DialogTitle>
            <DialogDescription>
              Krótka instrukcja od wczytania listy uczestników, przez wyciąg z banku, po zapis zmian
              w arkuszu.
            </DialogDescription>
          </DialogHeader>
          <ol className="grid gap-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Rozumiem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
