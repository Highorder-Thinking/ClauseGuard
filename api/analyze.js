// Vercel serverless function: /api/analyze
// Keeps the Gemini API key private on the server. The browser never sees it.
// Set GEMINI_API_KEY as an environment variable in your Vercel project settings.

const SYSTEM_PROMPT = `You are an expert legal document analyst specializing in identifying clauses that could disadvantage a signer in contracts, agreements, and terms of service.

You will be given the raw text of a document. Analyze it and identify clauses that are risky, unfair, ambiguous, or could cause harm to the person signing it.

For each risky clause you find, extract:
- "clause_excerpt": a short direct quote from the document (max 20 words) that identifies the exact clause
- "category": one of ["Financial", "Liability", "Termination", "Privacy", "Legal Rights", "Obligations", "Other"]
- "risk_level": one of ["high", "medium", "low"]
- "plain_language_explanation": 1-2 sentences explaining what this clause means in simple, jargon-free language
- "why_it_matters": 1 sentence on the concrete real-world consequence for the signer if this clause is enforced

Also provide:
- "overall_risk_score": an integer from 0-100 (0 = completely safe, 100 = extremely risky), based on the number and severity of risky clauses found
- "summary": a 2-3 sentence plain-language overview of the document's overall risk profile
- "document_type": your best guess at what kind of document this is (e.g. "Rental Agreement", "Freelance Contract", "App Terms of Service")

Rules:
- Only flag clauses that are genuinely risky or unusual — do not flag standard, fair, boilerplate terms just to pad the list.
- If the document has no significant risky clauses, return an empty array for "risky_clauses" and a low overall_risk_score.
- Be specific and concrete in explanations — avoid vague statements like "this could be risky."
- Do not give legal advice or tell the user what to do — only explain and inform.
- Respond ONLY with valid JSON matching the schema below. No markdown formatting, no code fences, no preamble, no explanation outside the JSON.

Schema:
{
  "document_type": string,
  "overall_risk_score": number,
  "summary": string,
  "risky_clauses": [
    {
      "clause_excerpt": string,
      "category": string,
      "risk_level": string,
      "plain_language_explanation": string,
      "why_it_matters": string
    }
  ]
}`;

const MODEL = "gemini-3.6-flash";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server isn't configured with a Gemini API key yet. Set GEMINI_API_KEY in your deployment's environment variables." });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== "string" || text.trim().length < 40) {
    return res.status(400).json({ error: "Not enough document text to analyze." });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  try {
    const geminiResp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          { role: "user", parts: [{ text: `Analyze the following document text for risky clauses:\n\n---\n${text}\n---` }] }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000,
          responseMimeType: "application/json"
        }
      })
    });

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      console.error("Gemini API error:", geminiResp.status, errText);
      return res.status(502).json({ error: "The AI service couldn't process this document right now. Try again in a moment." });
    }

    const data = await geminiResp.json();
    const candidate = data.candidates && data.candidates[0];
    const textPart = candidate && candidate.content && candidate.content.parts && candidate.content.parts.find(p => p.text);

    if (!textPart) {
      return res.status(502).json({ error: "The AI service returned an empty response. Try again." });
    }

    let clean = textPart.text.trim();
    clean = clean.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      return res.status(502).json({ error: "Couldn't parse the analysis. Try again." });
    }

    return res.status(200).json(parsed);
  } catch (e) {
    console.error("Analyze handler error:", e);
    return res.status(500).json({ error: "Something went wrong on our end. Try again." });
  }
}
