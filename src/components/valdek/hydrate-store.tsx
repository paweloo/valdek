import { useEffect, useState, type ReactNode } from "react";
import { useValdek } from "@/lib/store";

export function HydrateStore({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        await useValdek.persist.rehydrate();
        const state = useValdek.getState();
        if (!state.seeded && state.participants.length === 0) {
          state.seedDemo();
        }
        state.setHydrated(true);
      } catch {
        try {
          useValdek.getState().seedDemo();
        } catch {
          /* keep empty store */
        }
      }
      if (!cancelled) setReady(true);
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="font-display text-4xl text-foreground">Valdek</div>
          <div className="text-sm">Otwieranie kasy…</div>
        </div>
      </div>
    );
  }

  return children;
}
