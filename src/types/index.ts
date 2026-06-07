export type ItemType =
  | "COLLECTION"
  | "LATE_PAYMENT"
  | "CHARGE_OFF"
  | "HARD_INQUIRY"
  | "BANKRUPTCY"
  | "JUDGMENT"
  | "TAX_LIEN"
  | "FRAUDULENT_ACCOUNT"
  | "DUPLICATE_ACCOUNT"
  | "MEDICAL_DEBT"
  | "STUDENT_LOAN"
  | "OTHER";

export type DisputeStatus =
  | "DRAFT"
  | "SENT"
  | "IN_REVIEW"
  | "RESOLVED"
  | "REJECTED";

export type Bureau = "Equifax" | "Experian" | "TransUnion";

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  COLLECTION: "Collection Account",
  LATE_PAYMENT: "Late Payment",
  CHARGE_OFF: "Charge-Off",
  HARD_INQUIRY: "Hard Inquiry",
  BANKRUPTCY: "Bankruptcy",
  JUDGMENT: "Civil Judgment",
  TAX_LIEN: "Tax Lien",
  FRAUDULENT_ACCOUNT: "Fraudulent / Identity Theft",
  DUPLICATE_ACCOUNT: "Duplicate Account",
  MEDICAL_DEBT: "Medical Debt",
  STUDENT_LOAN: "Student Loan",
  OTHER: "Other",
};

export const STATUS_LABELS: Record<DisputeStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  IN_REVIEW: "In Review",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export const BUREAUS: Bureau[] = ["Equifax", "Experian", "TransUnion"];

export interface StrategyResult {
  strategy: string;
  lawCitation: string;
  letterOutline: string;
  source: "rules" | "ai";
}

export interface CreditItemWithDisputes {
  id: string;
  creditorName: string;
  accountNumber: string | null;
  itemType: string;
  amount: number | null;
  dateReported: string | null;
  dateOpened: string | null;
  bureaus: string[];
  notes: string | null;
  createdAt: string;
  disputes: DisputeRecord[];
}

export interface DisputeRecord {
  id: string;
  creditItemId: string;
  bureau: string;
  strategy: string;
  strategySource: string;
  lawCitation: string | null;
  letterContent: string;
  status: DisputeStatus;
  sentAt: string | null;
  responseAt: string | null;
  resolvedAt: string | null;
  outcome: string | null;
  createdAt: string;
  updatedAt: string;
  creditItem?: CreditItemWithDisputes;
}
