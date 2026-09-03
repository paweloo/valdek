import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";
import { getPinGate, submitPin } from "@/lib/pin";
import { cn } from "@/lib/utils";

const DIGITS = 6;

export function PinGate({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getPinGate()
      .then((status) => {
        if (!cancelled) setLocked(status.required && !status.unlocked);
      })
      .catch(() => {
        if (!cancelled) setLocked(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (locked === null) {
    return <div className="min-h-dvh bg-background" />;
  }
  if (!locked) return children;
  return <PinScreen onUnlock={() => setLocked(false)} />;
}

function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState<string[]>(Array.from({ length: DIGITS }, () => ""));
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const writeAt = (index: number, value: string) => {
    setError(false);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      if (value && index < DIGITS - 1) queueMicrotask(() => refs.current[index + 1]?.focus());
      if (value && next.every((d) => d.length === 1)) queueMicrotask(() => void unlock(next.join("")));
      return next;
    });
  };

  const unlock = async (pin: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await submitPin({ data: { pin } });
      if (result.ok) onUnlock();
      else fail();
    } catch {
      fail();
    } finally {
      setBusy(false);
    }
  };

  const fail = () => {
    setError(true);
    setDigits(Array.from({ length: DIGITS }, () => ""));
    requestAnimationFrame(() => refs.current[0]?.focus());
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      setDigits((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = "";
        } else if (index > 0) {
          next[index - 1] = "";
          queueMicrotask(() => refs.current[index - 1]?.focus());
        }
        return next;
      });
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < DIGITS - 1) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGITS);
    if (!pasted) return;
    const next = Array.from({ length: DIGITS }, (_, i) => pasted[i] ?? "");
    setDigits(next);
    setError(false);
    const last = Math.min(pasted.length, DIGITS) - 1;
    refs.current[last]?.focus();
    if (pasted.length === DIGITS) void unlock(pasted);
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col items-center">
        <span className="flex size-12 items-center justify-center rounded-md bg-primary font-display text-3xl leading-none text-primary-foreground">
          V
        </span>
        <h1 className="font-display mt-5 text-5xl">Valdek</h1>
        <p className="mt-2 text-sm text-muted-foreground">Wpisz kod kasy, żeby otworzyć ewidencję.</p>
        <div
          className={cn("mt-8 flex w-full justify-center gap-2", error && "animate-pulse")}
          role="group"
          aria-label="Kod PIN, sześć cyfr"
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                refs.current[index] = node;
              }}
              value={digit}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Cyfra ${index + 1}`}
              maxLength={1}
              disabled={busy}
              onPaste={onPaste}
              onKeyDown={(event) => onKeyDown(index, event)}
              onChange={(event) => {
                const char = event.target.value.replace(/\D/g, "").slice(-1);
                writeAt(index, char);
              }}
              className={cn(
                "h-16 w-11 rounded-md bg-card text-center font-mono text-3xl tabular-nums shadow-[var(--shadow-border)] outline-none transition-[box-shadow] md:h-20 md:w-14",
                "focus-visible:ring-2 focus-visible:ring-ring/70",
                error && "shadow-[0_0_0_1px_var(--color-unpaid)]",
              )}
            />
          ))}
        </div>
        <p className="mt-4 h-5 text-sm text-unpaid">{error ? "Nie ten kod. Spróbuj jeszcze raz." : ""}</p>
      </div>
    </div>
  );
}
