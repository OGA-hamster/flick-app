export async function POST(req) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server is missing the Groq API key." }),
        { status: 500 }
      );
    }

    const recent = messages.slice(-20);
    const conversationText = recent
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const systemPrompt = `You analyze a user's recent conversation with a habit-building app's AI assistant and produce a short, supportive "mindset" snapshot for their profile.

Rules:
- Base this only on what the user actually wrote. Do not invent details.
- Never use clinical or diagnostic language (no mental health conditions or labels like "depressed" or "anxious").
- Keep the tone encouraging and non-judgmental, like a supportive friend, not a therapist.
- If there isn't enough info, use tag "Just getting started" and a generic encouraging note.
- Focus only on habits, motivation, and consistency toward goals.

Respond ONLY with valid JSON, nothing else:
{"tag": "2-4 word phrase", "note": "one encouraging sentence with a gentle suggestion"}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: conversationText || "(no conversation yet)" },
          ],
          temperature: 0.4,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || "Something went wrong." }),
        { status: response.status }
      );
    }

    let raw = data.choices?.[0]?.message?.content || "{}";
    raw = raw.trim().replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      parsed = {
        tag: "Just getting started",
        note: "Keep checking in daily — patterns will show up here soon.",
      };
    }

    const tag = (parsed.tag || "Just getting started").slice(0, 40);
    const note = (parsed.note || "").slice(0, 200);

    return new Response(JSON.stringify({ tag, note }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected server error." }),
      { status: 500 }
    );
  }
}