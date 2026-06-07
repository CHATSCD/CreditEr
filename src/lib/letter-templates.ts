interface LetterVars {
  consumerName: string;
  consumerAddress: string;
  date: string;
  bureau: string;
  bureauAddress: string;
  creditorName: string;
  accountNumber: string;
  amount?: string;
  dateReported?: string;
  outline: string;
  lawCitation: string;
  strategy: string;
}

const BUREAU_ADDRESSES: Record<string, string> = {
  Equifax:
    "Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374",
  Experian:
    "Experian\nP.O. Box 4500\nAllen, TX 75013",
  TransUnion:
    "TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016",
};

const STRATEGY_INTROS: Record<string, string> = {
  FCRA_605B_IDENTITY_THEFT: `I am writing to dispute a fraudulent account that was opened as a result of identity theft. I did not open, authorize, or benefit from this account in any way. Pursuant to 15 U.S.C. § 1681c-2 (FCRA § 605B), I am requesting that you block this fraudulent information from my credit file within 4 business days of receiving this notice.`,

  FCRA_605_OUTDATED_BANKRUPTCY: `I am writing to dispute a bankruptcy that appears on my credit report. This item has exceeded the maximum 10-year reporting period established by the Fair Credit Reporting Act. Pursuant to 15 U.S.C. § 1681c(a)(1), negative bankruptcy information must be removed from consumer credit reports after 10 years from the date of filing.`,

  FCRA_605_OUTDATED: `I am writing to dispute a negative item that has exceeded the maximum 7-year reporting period established by the Fair Credit Reporting Act. Pursuant to 15 U.S.C. § 1681c(a), most negative credit information must be removed from consumer credit reports after 7 years from the date of first delinquency.`,

  CFPB_MEDICAL_SMALL: `I am writing to dispute a medical debt appearing on my credit report. Pursuant to Consumer Financial Protection Bureau (CFPB) rules effective 2023, medical debts under $500 are prohibited from appearing on consumer credit reports. This item falls below the $500 threshold and must be removed immediately.`,

  FDCPA_809_VALIDATION: `I am writing to dispute a collection account that appears on my credit report. Pursuant to 15 U.S.C. § 1692g (FDCPA § 809), I am hereby requesting validation of this debt within 30 days. Additionally, under 15 U.S.C. § 1681g (FCRA § 609), I am requesting verification of the accuracy of this account. The collection agency must cease all collection activity and reporting until proper validation is provided.`,

  FCRA_604_INQUIRY: `I am writing to dispute an unauthorized hard inquiry that appears on my credit report. Pursuant to 15 U.S.C. § 1681b (FCRA § 604), a hard inquiry may only be placed with a permissible purpose and with the consumer's written authorization. I do not recall authorizing this inquiry, and I am requesting that you verify the written authorization from the inquiring party and delete this inquiry if authorization cannot be confirmed.`,

  FCRA_611_INACCURATE: `I am writing to dispute inaccurate information appearing on my credit report. Pursuant to 15 U.S.C. § 1681i (FCRA § 611), I am requesting a thorough reinvestigation of this account. The information reported is inaccurate, and any information that cannot be verified must be promptly deleted from my credit file.`,

  FCRA_611_DUPLICATE: `I am writing to dispute a duplicate account entry that appears on my credit report. Pursuant to 15 U.S.C. § 1681i (FCRA § 611), reporting the same account multiple times constitutes inaccurate information. I am requesting that you investigate and remove the duplicate entry immediately.`,

  GOODWILL_DELETION: `I am writing to respectfully request a goodwill adjustment to remove a late payment from my credit report. I have been a responsible account holder, and the late payment was an isolated incident due to circumstances beyond my control. I am requesting that you exercise goodwill in removing this negative mark, which would allow my credit report to more accurately reflect my overall creditworthiness.`,

  NCAP_TAX_LIEN: `I am writing to dispute a tax lien appearing on my credit report. Under the National Consumer Assistance Plan (NCAP) agreement entered into by the three major credit bureaus in 2017, civil tax liens must be removed from consumer credit reports. I am requesting immediate removal of this item in compliance with the NCAP agreement.`,

  NCAP_JUDGMENT: `I am writing to dispute a civil judgment appearing on my credit report. Under the National Consumer Assistance Plan (NCAP) agreement entered into by the three major credit bureaus in 2017, civil judgments must be removed from consumer credit reports. I am requesting immediate removal of this item in compliance with the NCAP agreement.`,

  FCRA_611_STUDENT_LOAN: `I am writing to dispute inaccurate student loan information appearing on my credit report. Pursuant to 15 U.S.C. § 1681i (FCRA § 611), I am requesting a thorough reinvestigation of this account, including the servicer information, payment history, and current loan status.`,

  CFPB_MEDICAL_DISPUTE: `I am writing to dispute a medical debt appearing on my credit report. Per recent CFPB guidance and regulations, medical debt reporting is subject to enhanced accuracy requirements. I am requesting a complete reinvestigation of this item, including verification that insurance payments have been properly applied and that the reported amount is accurate.`,
};

export function generateLetter(
  strategy: string,
  bureau: string,
  vars: Partial<LetterVars> & { creditorName: string; accountNumber: string; lawCitation: string; outline: string }
): string {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const consumerName = vars.consumerName || "[YOUR FULL NAME]";
  const consumerAddress =
    vars.consumerAddress ||
    "[YOUR ADDRESS]\n[CITY, STATE ZIP]";
  const bureauAddress = BUREAU_ADDRESSES[bureau] || `${bureau}\n[BUREAU ADDRESS]`;
  const intro = STRATEGY_INTROS[strategy] || vars.outline;

  const accountSection = vars.accountNumber && vars.accountNumber !== "N/A"
    ? `Account Number: ${vars.accountNumber}`
    : "";
  const amountSection = vars.amount ? `\nReported Amount: ${vars.amount}` : "";
  const dateSection = vars.dateReported
    ? `\nDate Reported: ${vars.dateReported}`
    : "";

  return `${consumerName}
${consumerAddress}

${today}

${bureauAddress}

Re: Formal Credit Report Dispute
Creditor/Account: ${vars.creditorName}
${accountSection}${amountSection}${dateSection}

To Whom It May Concern:

${intro}

Account Details Being Disputed:
• Creditor/Furnisher: ${vars.creditorName}
${accountSection ? `• ${accountSection}` : ""}${amountSection ? `\n• Reported Amount: ${vars.amount}` : ""}${dateSection ? `\n• Date Reported: ${vars.dateReported}` : ""}

Legal Basis: ${vars.lawCitation}

Pursuant to the Fair Credit Reporting Act, I am requesting that you:

1. Conduct a thorough reinvestigation of this account within 30 days as required by 15 U.S.C. § 1681i.
2. Forward this dispute to the furnisher of this information for verification.
3. Provide me with written results of the reinvestigation.
4. Delete or correct any information that cannot be verified.
5. Send me an updated copy of my credit report reflecting any changes made.

Please be advised that failure to conduct a reasonable investigation and delete unverifiable or inaccurate information may expose the credit bureau and/or furnisher to civil liability under 15 U.S.C. § 1681n (willful noncompliance) or 15 U.S.C. § 1681o (negligent noncompliance).

I am retaining a copy of this letter for my records. Please acknowledge receipt and provide the results of your investigation within 30 days.

Sincerely,

${consumerName}

Enclosures:
• Copy of government-issued ID
• Copy of Social Security card (last 4 digits only)
• Proof of address
• Supporting documentation for this dispute

---
This letter was generated by CreditEr. Consult with a consumer law attorney for legal advice.`;
}
