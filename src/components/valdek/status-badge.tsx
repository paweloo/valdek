import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, type MonthStatus } from "@/lib/status";

const VARIANT: Record<MonthStatus, "paid" | "unpaid" | "warn" | "secondary"> = {
  paid: "paid",
  unpaid: "unpaid",
  partial: "warn",
  over: "warn",
  review: "secondary",
};

export function StatusBadge({ status }: { status: MonthStatus }) {
  return <Badge variant={VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}