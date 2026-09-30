import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, telemetryContext } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json({
        reply: "AI copilot is offline because GEMINI_API_KEY is not configured. Use the scenario telemetry, asset assessments, and route guidance shown in the console; verify decisions with local authorities.",
      });
    }

    const systemPrompt = `You are KAI Alert Senior Tactical Operations Director, a high-EQ, authoritative AI disaster management copilot.
You specialize in:
- Cyclonic storm surge physics & coastal risk assessment
- NDRF / SDRF civil emergency rescue protocols & asset dispatching
- Vernacular broadcast message generation (Odia, Hindi, English)
- Evacuation route planning avoiding flooded structures & submerged bridges

Current Real-Time Tactical Telemetry Context:
${JSON.stringify(telemetryContext ?? {}, null, 2)}

Instructions:
- Provide sharp, concise, actionable tactical guidance in natural human language (Hindi, Hinglish, or English).
- Default to simple, clear explanations that anyone can understand.
- Only provide complex formulas when specifically asked for technical/physics breakdown.
- Maintain an empathetic, calm, authoritative disaster response posture.`;

    // Format message history for Gemini API
    const formattedContents = (messages || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Ultrafast verified models array
    const candidateModels = [
      "gemini-2.5-flash-lite",
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
      "gemini-2.5-pro",
    ];

    let replyText = "";
    let lastError = "";

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemPrompt }],
              },
              contents: formattedContents,
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (replyText) break;
        } else {
          lastError = await response.text();
        }
      } catch (err) {
        lastError = String(err);
      }
    }

    if (!replyText) {
      console.error("Gemini API Error across candidates:", lastError.slice(0, 300));
      return NextResponse.json(
        { reply: "AI copilot is unavailable right now. Use the current route and asset status shown in the console, and verify conditions with field teams before dispatch." },
        { status: 200 }
      );
    }

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
