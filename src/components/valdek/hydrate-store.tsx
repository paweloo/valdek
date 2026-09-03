import { useEffect, type ReactNode } from "react";
import { useValdek } from "@/lib/store";

export function HydrateStore({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        await useValdek.persist.rehydrate();
        const state = useValdek.getState();
        if (!cancelled) state.setHydrated(true);
        if (!useValdek.getState().sourceWorkbookB64) {
          void fetch("/ewidencja-szablon.xlsx")
            .then((res) => (res.ok ? res.arrayBuffer() : null))
            .then((buf) => {
              if (buf && !useValdek.getState().sourceWorkbookB64) {
                useValdek.getState().setSourceWorkbook(buf, "UCZESTNICY.xlsx");
              }
            })
            .catch(() => {
              /* template optional — export fetches it on demand */
            });
        }
      } catch {
        if (!cancelled) useValdek.getState().setHydrated(true);
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);
  return children;
}