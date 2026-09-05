import type { AmountIssue, Group, Participant, PaymentMatch, Transfer } from "./types";
import { detectMonthsInText, normalizeText } from "./polish";
import { uid } from "./utils";

const TITLE_NOISE = new Set([
  "przelew",
  "przychodzacy",
  "przychodzace",
  "elixir",
  "wplata",
  "tytulem",
  "tytul",
  "zajecia",
  "zajec",
  "miesiac",
  "miesiaca",
  "online",
  "ekspresowy",
  "zwykly",
  "rachunku",
  "rachunek",
  "od",
  "dla",
  "syna",
  "corki",
  "dziecka",
  "syn",
  "corka",
  "za",
  "mkonto",
  "intensive",
  "wplywy",
  "inne",
  "wewnetrzny",
  "mbank",
  "ul",
]);

export function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0),
  );
  for (let i = 0; i <= a.length; i += 1) dp[i]![0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost);
    }
  }
  return dp[a.length]![b.length]!;
}

function similarity(a: string, b: string) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a))
    return Math.min(a.length, b.length) / Math.max(a.length, b.length);
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
}

function tokensOf(text: string) {
  return normalizeText(text)
    .split(" ")
    .filter((t) => t.length > 1 && !TITLE_NOISE.has(t));
}

function groupScore(titleNorm: string, groupName: string, allGroups: Group[]) {
  const groupNorm = normalizeText(groupName);
  if (!groupNorm) return { score: 0, reason: "" };
  const others = allGroups.map((g) => normalizeText(g.name)).filter((n) => n && n !== groupNorm);
  if (titleNorm.includes(groupNorm)) {
    const shadowed = others.some((other) => other.includes(groupNorm) && titleNorm.includes(other));
    if (shadowed) return { score: 0.04, reason: `część nazwy grupy „${groupName}”` };
    return { score: 0.14, reason: `grupa „${groupName}”` };
  }
  const gTokens = groupNorm.split(" ").filter((t) => t.length > 2);
  if (!gTokens.some((t) => titleNorm.includes(t))) return { score: 0, reason: "" };
  const moreSpecific = others.some((other) => {
    if (!other.includes(groupNorm.split(" ")[0] ?? "")) return false;
    return other.length > groupNorm.length && titleNorm.includes(other);
  });
  if (moreSpecific) return { score: 0, reason: "" };
  return { score: 0.05, reason: "część nazwy grupy" };
}

export function scoreParticipant(title: string, participant: Participant, groups: Group[]) {
  const titleNorm = normalizeText(title);
  const first = normalizeText(participant.firstName);
  const last = normalizeText(participant.lastName);
  const group = groups.find((g) => g.id === participant.groupId);
  const reasons: string[] = [];
  let score = 0;
  const full = `${first} ${last}`.trim();
  const reversed = `${last} ${first}`.trim();
  if (full && (titleNorm.includes(full) || titleNorm.includes(reversed))) {
    score += 0.72;
    reasons.push("pełne imię i nazwisko w tytule");
  } else {
    const titleTokens = tokensOf(title);
    let lastBest = 0;
    let firstBest = 0;
    for (const token of titleTokens) {
      lastBest = Math.max(lastBest, similarity(token, last));
      firstBest = Math.max(firstBest, similarity(token, first));
      if (first.length >= 1 && token === first[0]) firstBest = Math.max(firstBest, 0.55);
    }
    if (lastBest >= 0.86) {
      score += 0.5 * lastBest;
      reasons.push(lastBest > 0.97 ? "nazwisko" : "podobne nazwisko");
    }
    if (firstBest >= 0.7) {
      score += 0.22 * firstBest;
      reasons.push(firstBest > 0.95 ? "imię" : "inicjał / podobne imię");
    }
  }
  if (group) {
    const g = groupScore(titleNorm, group.name, groups);
    if (g.score) {
      score += g.score;
      reasons.push(g.reason);
    }
  }
  return { score: Math.min(score, 0.99), reasons };
}

export function amountIssue(expected: number, received: number): AmountIssue {
  const delta = Math.abs(expected - received);
  if (delta <= 1) return "ok";
  if (received < expected) return "partial";
  if (received > expected) return "over";
  return "unexpected";
}

export function matchTransfers(params: {
  transfers: Transfer[];
  participants: Participant[];
  groups: Group[];
  statementMonth: string;
  existing: PaymentMatch[];
}): PaymentMatch[] {
  const { transfers, participants, groups, statementMonth, existing } = params;
  const taken = new Set(
    existing.filter((m) => m.kind === "confirmed" || m.kind === "manual").map((m) => m.transferId),
  );
  const year = Number(statementMonth.slice(0, 4));
  const monthNum = Number(statementMonth.slice(5, 7));
  const seasonYear = monthNum >= 9 ? year : year - 1;
  const next: PaymentMatch[] = existing.filter(
    (m) => m.kind === "confirmed" || m.kind === "manual",
  );
  const active = participants.filter((p) => p.active);
  for (const transfer of transfers) {
    if (
      transfer.ignored ||
      transfer.direction === "out" ||
      taken.has(transfer.id) ||
      transfer.amount <= 0
    )
      continue;
    const scored = active
      .map((p) => {
        const { score, reasons } = scoreParticipant(transfer.title, p, groups);
        return { participant: p, score, reasons };
      })
      .sort((a, b) => b.score - a.score);
    const best = scored[0];
    const second = scored[1];
    if (!best || best.score < 0.48) continue;
    const unique = !second || best.score - second.score >= 0.12 || best.score >= 0.85;
    if (!unique && best.score < 0.78) continue;
    const months = detectMonthsInText(transfer.title, seasonYear);
    const month = months.find((m) => m === statementMonth) ?? months[0] ?? statementMonth;
    // const monthMismatch = months.length > 0 && !months.includes(statementMonth);
    // if (monthMismatch) best.reasons.push(`tytuł wskazuje ${months[0]}`);
    const issue = amountIssue(best.participant.monthlyFee, transfer.amount);
    if (issue === "partial") best.reasons.push("kwota niższa niż stawka");
    if (issue === "over") {
      best.reasons.push(
        transfer.amount >= best.participant.monthlyFee * 1.8
          ? "kwota wygląda na dwa miesiące"
          : "nadpłata",
      );
    }
    const kind: PaymentMatch["kind"] =
      best.score >= 0.78 && unique && issue === "ok" ? "auto" : "suggested"; // best.score >= 0.78 && unique && issue === "ok" && !monthMismatch ? "auto" : "suggested";
    next.push({
      id: uid("match"),
      transferId: transfer.id,
      participantId: best.participant.id,
      month,
      amount: transfer.amount,
      confidence: best.score,
      kind,
      amountIssue: issue,
      reasons: best.reasons,
    });
  }
  return next;
}

export function buildManualMatch(params: {
  transfer: Transfer;
  participant: Participant;
  month: string;
}): PaymentMatch {
  return {
    id: uid("match"),
    transferId: params.transfer.id,
    participantId: params.participant.id,
    month: params.month,
    amount: params.transfer.amount,
    confidence: 1,
    kind: "manual",
    amountIssue: amountIssue(params.participant.monthlyFee, params.transfer.amount),
    reasons: ["dopasowane ręcznie"],
  };
}

export function nameKey(p: Pick<Participant, "firstName" | "lastName">) {
  return normalizeText(`${p.firstName} ${p.lastName}`);
}
