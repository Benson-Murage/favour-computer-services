import { cn } from "@/lib/utils";
import { conditionLabel } from "@/lib/format";

export function ConditionBadge({
  condition,
  className,
}: {
  condition: string;
  className?: string;
}) {
  const isNew = condition === "new";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        isNew
          ? "bg-foreground text-background"
          : "bg-[color:var(--warning)]/15 text-[color:var(--foreground)] ring-1 ring-[color:var(--warning)]/40",
        className,
      )}
    >
      {conditionLabel(condition)}
    </span>
  );
}
