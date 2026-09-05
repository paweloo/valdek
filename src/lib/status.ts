import type { ManualMark, MatchKind, Participant, PaymentMatch } from "./types";

export type MonthStatus = "paid" | "partial" | "over" | "unpaid" | "review";
export type TransferBucket = "unmatched" | "review" | "booked";

export function isPendingKind(kind: MatchKind) {
  return kind === "suggested" || kind === "manual";
}

export function bucketForMatches(related: PaymentMatch[]): TransferBucket {
  if (related.length === 0) return "unmatched";
  if (related.some((m) => isPendingKind(m.kind))) return "review";
  return "booked";
}

export function monthStatusFor(
  participant: Participant,
  month: string,
  matches: PaymentMatch[],
  manual: Record<string, Record<string, ManualMark>>,
): { status: MonthStatus; received: number; expected: number } {
  const expected = participant.monthlyFee;
  const mark = manual[participant.id]?.[month];
  const related = matches.filter((m) => m.participantId === participant.id && m.month === month);
  const received = related.reduce((sum, m) => sum + m.amount, 0);
  const prior =
    mark?.status === "paid" ? (mark.amount ?? expected) : mark?.status === "partial" ? (mark.amount ?? 0) : 0;
  const total = prior + received;

  if (mark?.status === "unpaid" && received <= 0) return { status: "unpaid", received: 0, expected };
  if (mark?.status === "paid" && received <= 1) {
    return { status: "paid", received: prior || expected, expected };
  }
  if (received <= 0) {
    if (mark?.status === "partial") return { status: "partial", received: prior, expected };
    if (mark?.status === "paid") return { status: "paid", received: prior || expected, expected };
    return { status: "unpaid", received: 0, expected };
  }
  if (mark?.status === "paid") return { status: "over", received: total, expected };
  if (related.some((m) => isPendingKind(m.kind))) return { status: "review", received: total, expected };
  if (Math.abs(total - expected) <= 1) return { status: "paid", received: total, expected };
  if (total < expected) return { status: "partial", received: total, expected };
  return { status: "over", received: total, expected };
}

export const STATUS_LABEL: Record<MonthStatus, string> = {
  paid: "opłacone",
  partial: "częściowo",
  over: "nadpłata",
  unpaid: "brak wpłaty",
  review: "do weryfikacji",
};
