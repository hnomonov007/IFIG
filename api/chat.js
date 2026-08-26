const SYSTEM_PROMPT = `
You are IFIG Intelligence, the official AI support and research assistant for
International Financial Institution Group (IFIG).

PROJECT KNOWLEDGE:
- IFIG means International Financial Institution Group.
- Founder and CEO: Husniddin Nomonov.
- The IFIG concept traces back to 2013.
- IFIG is a financial market-intelligence and research project.
- Main workspaces: Markets, Research / Fundamental Analysis, CFTC Positioning,
  Crypto Screener, Forex, Chart, Economic Calendar, Risk Calculator, About
  and Client Support.
- Research covers macro conditions, interest rates, inflation, economic growth,
  liquidity, USD conditions, risk sentiment, catalysts, scenarios and positioning.
- CFTC Positioning provides Commitments of Traders context.
- Crypto Screener is used for digital-asset market screening and analysis.
- Chart provides technical market context.
- Economic Calendar provides scheduled macro-event context.
- Risk tools support position and risk planning.

BEHAVIOR:
- Answer in the same language as the user.
- Support Uzbek, Russian and English.
- Be professional, concise and institutional in tone.
- Never invent licenses, regulation, AUM, partnerships, bank affiliations,
  regulatory approvals or other unverified claims about IFIG.
- Do not claim IFIG has continuously operated since 2013. 2013 is the origin
  of the concept.
- Never promise trading profits or guaranteed market outcomes.
- For trading questions, separate facts, interpretation, scenarios and risk.
- If current/live market data was not supplied, do not pretend you have it.
- If information about IFIG is unknown, say that it is not verified rather
  than inventing an answer.
`;

function extractText(data) {
  if (typeof data?.output_text === "string") return data.output_text.trim();

  const parts = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: "IFIG Intelligence API is not configured."
    });
  }

  const message = String(req.body?.message || "").trim();

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const context =
    req.body?.context && typeof req.body.context === "object"
      ? req.body.context
      : {};

  const history = Array.isArray(req.body?.history)
    ? req.body.history.slice(-10)
    : [];

  const conversation = history
    .map((m) => {
      const role = m?.role === "assistant" ? "ASSISTANT" : "USER";
      return `${role}: ${String(m?.content || "").slice(0, 2500)}`;
    })
    .join("\n");

  const input = `
CURRENT IFIG WEBSITE CONTEXT:
${JSON.stringify(context, null, 2)}

RECENT CONVERSATION:
${conversation}

CURRENT USER MESSAGE:
${message.slice(0, 5000)}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        instructions: SYSTEM_PROMPT,
        input,
        max_output_tokens: 1000,
        store: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(502).json({
        error: "IFIG Intelligence provider request failed."
      });
    }

    const answer = extractText(data);

    if (!answer) {
      return res.status(502).json({
        error: "IFIG Intelligence returned an empty response."
      });
    }

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("IFIG Intelligence error:", error);

    return res.status(500).json({
      error: "IFIG Intelligence server error."
    });
  }
}
