import type { ItemType, StrategyResult } from "@/types";

interface ItemData {
  itemType: ItemType;
  amount?: number | null;
  dateReported?: Date | string | null;
  notes?: string | null;
}

const SEVEN_YEARS_MS = 7 * 365.25 * 24 * 60 * 60 * 1000;
const TEN_YEARS_MS = 10 * 365.25 * 24 * 60 * 60 * 1000;

function isOlderThan(date: Date | string | null | undefined, ms: number): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return Date.now() - d.getTime() > ms;
}

export function selectStrategy(item: ItemData): StrategyResult | null {
  const { itemType, amount, dateReported, notes } = item;

  // Identity theft / fraudulent — highest priority
  if (itemType === "FRAUDULENT_ACCOUNT") {
    return {
      strategy: "FCRA_605B_IDENTITY_THEFT",
      lawCitation: "15 U.S.C. § 1681c-2 (FCRA § 605B)",
      letterOutline:
        "Request immediate block of fraudulent tradeline under FCRA § 605B. Include copy of identity theft report. Demand deletion within 4 business days.",
      source: "rules",
    };
  }

  // Outdated bankruptcy (>10 years)
  if (itemType === "BANKRUPTCY" && isOlderThan(dateReported, TEN_YEARS_MS)) {
    return {
      strategy: "FCRA_605_OUTDATED_BANKRUPTCY",
      lawCitation: "15 U.S.C. § 1681c(a)(1) (FCRA § 605(a)(1))",
      letterOutline:
        "Demand removal of bankruptcy exceeding the 10-year reporting limit under FCRA § 605(a)(1).",
      source: "rules",
    };
  }

  // Outdated item (>7 years)
  if (isOlderThan(dateReported, SEVEN_YEARS_MS)) {
    return {
      strategy: "FCRA_605_OUTDATED",
      lawCitation: "15 U.S.C. § 1681c(a) (FCRA § 605(a))",
      letterOutline:
        "Demand removal of negative item that has exceeded the 7-year maximum reporting period under FCRA § 605(a).",
      source: "rules",
    };
  }

  // Medical debt under $500 (CFPB 2023 rule — cannot be reported)
  if (itemType === "MEDICAL_DEBT" && amount != null && amount < 500) {
    return {
      strategy: "CFPB_MEDICAL_SMALL",
      lawCitation: "CFPB Rule 2023 / 15 U.S.C. § 1681s-2",
      letterOutline:
        "Demand immediate deletion of medical debt under $500. Per CFPB guidance effective 2023, medical debts under $500 are prohibited from consumer credit reports.",
      source: "rules",
    };
  }

  // Duplicate account
  if (itemType === "DUPLICATE_ACCOUNT") {
    return {
      strategy: "FCRA_611_DUPLICATE",
      lawCitation: "15 U.S.C. § 1681i (FCRA § 611)",
      letterOutline:
        "Dispute duplicate tradeline as inaccurate under FCRA § 611. Request reinvestigation and removal of the duplicate entry.",
      source: "rules",
    };
  }

  // Collection account — FDCPA validation + FCRA verification
  if (itemType === "COLLECTION") {
    return {
      strategy: "FDCPA_809_VALIDATION",
      lawCitation: "15 U.S.C. § 1692g (FDCPA § 809) + 15 U.S.C. § 1681g (FCRA § 609)",
      letterOutline:
        "Demand debt validation under FDCPA § 809. Simultaneously request verification of account information under FCRA § 609. Collector must cease collection and reporting until validation is provided.",
      source: "rules",
    };
  }

  // Hard inquiry — challenge authorization
  if (itemType === "HARD_INQUIRY") {
    return {
      strategy: "FCRA_604_INQUIRY",
      lawCitation: "15 U.S.C. § 1681b (FCRA § 604)",
      letterOutline:
        "Challenge unauthorized hard inquiry. Demand bureau verify written permissible purpose from inquiring party under FCRA § 604. Request deletion if authorization cannot be verified.",
      source: "rules",
    };
  }

  // Charge-off — dispute inaccuracies
  if (itemType === "CHARGE_OFF") {
    return {
      strategy: "FCRA_611_INACCURATE",
      lawCitation: "15 U.S.C. § 1681i (FCRA § 611)",
      letterOutline:
        "Dispute inaccurate charge-off reporting under FCRA § 611. Request full reinvestigation of account status, balance, and dates. Any unverifiable information must be deleted.",
      source: "rules",
    };
  }

  // Late payment — goodwill deletion request
  if (itemType === "LATE_PAYMENT") {
    return {
      strategy: "GOODWILL_DELETION",
      lawCitation: "15 U.S.C. § 1681i (FCRA § 611) / Goodwill",
      letterOutline:
        "Request goodwill deletion of late payment. Highlight positive account history, explain circumstances of the late payment, and ask creditor to exercise goodwill in removing the negative mark.",
      source: "rules",
    };
  }

  // Tax lien — largely removed post-2018 NCAP agreement
  if (itemType === "TAX_LIEN") {
    return {
      strategy: "NCAP_TAX_LIEN",
      lawCitation: "NCAP Agreement 2017 / 15 U.S.C. § 1681i (FCRA § 611)",
      letterOutline:
        "Demand removal of tax lien under the National Consumer Assistance Plan (NCAP) agreement. Since July 2017, all tax liens must be removed from consumer credit reports per the agreement between the bureaus and state AGs.",
      source: "rules",
    };
  }

  // Judgment — most civil judgments removed post-NCAP
  if (itemType === "JUDGMENT") {
    return {
      strategy: "NCAP_JUDGMENT",
      lawCitation: "NCAP Agreement 2017 / 15 U.S.C. § 1681i (FCRA § 611)",
      letterOutline:
        "Demand removal of civil judgment. Under the 2017 NCAP agreement, civil judgments must be removed from consumer credit reports as the bureaus agreed to stop reporting them.",
      source: "rules",
    };
  }

  // Student loan — challenge for accuracy / income-driven payment issues
  if (itemType === "STUDENT_LOAN") {
    return {
      strategy: "FCRA_611_STUDENT_LOAN",
      lawCitation: "15 U.S.C. § 1681i (FCRA § 611) + 20 U.S.C. § 1087e",
      letterOutline:
        "Dispute inaccurate student loan reporting. Verify servicer information, payment history accuracy, and loan status. Request reinvestigation under FCRA § 611.",
      source: "rules",
    };
  }

  // Medical debt general — dispute under CFPB / FCRA
  if (itemType === "MEDICAL_DEBT") {
    return {
      strategy: "CFPB_MEDICAL_DISPUTE",
      lawCitation: "15 U.S.C. § 1681i (FCRA § 611) + CFPB Guidance 2023",
      letterOutline:
        "Dispute medical debt reporting. Under CFPB 2023 guidance, medical debt has reduced impact and may be challenged for accuracy of amount, insurance payment application, and billing errors.",
      source: "rules",
    };
  }

  // No rule matched — signal AI fallback needed
  return null;
}
