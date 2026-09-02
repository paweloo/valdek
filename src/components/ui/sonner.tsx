import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-popover text-popover-foreground border-border shadow-[var(--shadow-elevated)]",
        },
      }}
    />
  );
}

export { Toaster };
