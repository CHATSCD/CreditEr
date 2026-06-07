import Anthropic from "@anthropic-ai/sdk";
import type { ItemType, StrategyResult } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AiStrategyInput {
  itemType: ItemType;
  creditorName: string;
  amount?: number | null;
  dateReported?: Date | string | null;
  notes?: string | null;
}

export async function getAiStrategy(item: AiStrategyInput): Promise<StrategyResult> {
  const prompt = `You are a U.S. consumer credit law expert specializing in FCRA, FDCPA, and CFPB regulations.

A consumer needs help disputing the following item from their credit report:
- Item Type: ${item.itemType}
- Creditor/Furnisher: ${item.creditorName}
${item.amount != null ? `- Reported Amount: $${item.amount}` : ""}
${item.dateReported ? `- Date Reported: ${new Date(item.dateReported).toLocaleDateString()}` : ""}
${item.notes ? `- Additional Notes: ${item.notes}` : ""}

Analyze this item and recommend the single most effective dispute strategy under current U.S. law (as of 2024).

Respond ONLY with valid JSON in this exact format:
{
  "strategy": "SHORT_STRATEGY_CODE",
  "lawCitation": "Full legal citation (e.g., 15 U.S.C. § 1681i)",
  "letterOutline": "2-3 sentence outline of the dispute argument and requested action"
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      strategy: "AI_GENERAL_DISPUTE",
      lawCitation: "15 U.S.C. § 1681i (FCRA § 611)",
      letterOutline:
        "Dispute this item as inaccurate or unverifiable under FCRA § 611. Request full reinvestigation and deletion of any unverifiable information.",
      source: "ai",
    };
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    strategy: parsed.strategy || "AI_GENERAL_DISPUTE",
    lawCitation: parsed.lawCitation || "15 U.S.C. § 1681i (FCRA § 611)",
    letterOutline: parsed.letterOutline || "",
    source: "ai",
  };
}
