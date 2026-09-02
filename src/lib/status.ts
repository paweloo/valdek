import type { ManualMark, Participant, PaymentMatch } from "./types";
import { receivedFor } from "./store";

export type MonthStatus = "paid" | "partial" | "over" | "unpaid" | "review";
export type TransferBucket = "unmatched" | "review" | "booked";

export function bucketForMatches(related: PaymentMatch[]): TransferBucket {
  if (related.length === 0) return "unmatched";
  if (related.some((m) => m.kind === "suggested")) return "review";
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
  const received = receivedFor(participant.id, month, matches);
  if (mark?.status === "paid") return { status: "paid", received: mark.amount ?? received ?? expected, expected };
  if (mark?.status === "unpaid") return { status: "unpaid", received: 0, expected };
  if (mark?.status === "partial") return { status: "partial", received: mark.amount ?? received, expected };
  if (received <= 0) return { status: "unpaid", received, expected };
  const related = matches.filter((m) => m.participantId === participant.id && m.month === month);
  if (related.some((m) => m.kind === "suggested")) return { status: "review", received, expected };
  if (Math.abs(received - expected) <= 1) return { status: "paid", received, expected };
  if (received < expected) return { status: "partial", received, expected };
  return { status: "over", received, expected };
}

export const STATUS_LABEL: Record<MonthStatus, string> = {
  paid: "opłacone",
  partial: "częściowo",
  over: "nadpłata",
  unpaid: "brak wpłaty",
  review: "do weryfikacji",
};
