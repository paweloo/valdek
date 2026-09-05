export type Group = {
  id: string;
  name: string;
  defaultFee: number;
};

export type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  groupId: string;
  monthlyFee: number;
  notes: string;
  active: boolean;
};

export type ManualMark = {
  status: "paid" | "unpaid" | "partial";
  amount?: number;
};

export type Statement = {
  id: string;
  fileName: string;
  importedAt: string;
  transferCount: number;
  warning?: string;
};

export type Transfer = {
  id: string;
  statementId: string;
  date: string;
  amount: number;
  title: string;
  sender: string;
  raw: string;
  direction: "in" | "out" | "unknown";
  ignored: boolean;
};

export type MatchKind = "auto" | "confirmed" | "manual" | "suggested";
export type AmountIssue = "ok" | "partial" | "over" | "unexpected";

export type PaymentMatch = {
  id: string;
  transferId: string;
  participantId: string;
  month: string;
  amount: number;
  confidence: number;
  kind: MatchKind;
  amountIssue: AmountIssue;
  reasons: string[];
};

export type ExcelPreview = {
  headers: string[];
  rows: string[][];
  mapping: ExcelMapping;
};

export type NameOrder = "first-last" | "last-first";

export type GroupFlagColumn = {
  column: number;
  name: string;
};

export type ExcelMapping = {
  fullName?: number;
  firstName?: number;
  lastName?: number;
  group?: number;
  groupFlags?: GroupFlagColumn[];
  fee?: number;
  months: Record<string, number>;
  nameOrder?: NameOrder;
};
