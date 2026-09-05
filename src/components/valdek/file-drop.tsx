import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FileDrop({
  accept,
  onFiles,
  children,
  className,
  label,
  multiple = false,
}: {
  accept: string;
  onFiles: (files: File[]) => void;
  children?: ReactNode;
  className?: string;
  label: string;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const take = (list: FileList | null) => {
    if (!list?.length) return;
    const files = Array.from(list);
    onFiles(multiple ? files : files.slice(0, 1));
  };
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
        take(e.dataTransfer.files);
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
        multiple={multiple}
        aria-label={label}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        onChange={(e) => {
          take(e.target.files);
          e.currentTarget.value = "";
        }}
      />
      <div className="pointer-events-none">{children}</div>
    </div>
  );
}
