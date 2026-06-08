import OpenAI from "openai";
import type { ItemType, StrategyResult } from "@/types";

function getClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY ?? "placeholder",
    baseURL: "https://api.deepseek.com/v1",
  });
}

interface AiStrategyInput {
  itemType: ItemType;
  creditorName: string;
  amount?: number | null;
  dateReported?: Date | string | null;
  notes?: string | null;
}

export async function getAiStrategy(item: AiStrategyInput): Promise<StrategyResult> {
  const response = await getClient().chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 512,
    messages: [
      {
        role: "system",
        content:
          "You are a U.S. consumer credit law expert specializing in FCRA, FDCPA, and CFPB regulations. Respond only with valid JSON — no markdown, no explanation.",
      },
      {
        role: "user",
        content: `A consumer needs help disputing the following item from their credit report:
- Item Type: ${item.itemType}
- Creditor/Furnisher: ${item.creditorName}
${item.amount != null ? `- Reported Amount: $${item.amount}` : ""}
${item.dateReported ? `- Date Reported: ${new Date(item.dateReported).toLocaleDateString()}` : ""}
${item.notes ? `- Additional Notes: ${item.notes}` : ""}

Recommend the single most effective dispute strategy under current U.S. law (2024).

Respond ONLY with this JSON:
{
  "strategy": "SHORT_STRATEGY_CODE",
  "lawCitation": "Full legal citation (e.g., 15 U.S.C. § 1681i)",
  "letterOutline": "2-3 sentence outline of the dispute argument and requested action"
}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "";
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
