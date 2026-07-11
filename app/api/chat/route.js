export async function POST(req) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server is missing the Gemini API key." }),
        { status: 500 }
      );
    }

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [
              {
                text: "You are a helpful, friendly assistant inside the Flick app, a micro-accountability app for building habits and staying on track with goals. You can help with anything the user asks, not just app-related questions. Keep responses clear, warm, and concise.",
              },
            ],
          },
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

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't come up with a response.";

    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected server error." }),
      { status: 500 }
    );
  }
}
