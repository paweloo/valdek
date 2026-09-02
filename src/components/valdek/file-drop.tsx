import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FileDrop({
  accept,
  onFile,
  children,
  className,
  label,
}: {
  accept: string;
  onFile: (file: File) => void;
  children?: ReactNode;
  className?: string;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e: DragEvent) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        setOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      className={cn(
        "relative flex min-h-44 w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-card px-6 py-8 text-center shadow-[var(--shadow-border)]",
        over && "bg-accent",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        aria-label={label}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.currentTarget.value = "";
        }}
      />
      <div className="pointer-events-none">{children}</div>
    </div>
  );
}