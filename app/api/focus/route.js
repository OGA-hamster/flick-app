export async function POST(req) {
  try {
    const { answer } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server is missing the Groq API key." }),
        { status: 500 }
      );
    }

    if (!answer || !answer.trim()) {
      return new Response(
        JSON.stringify({ error: "Please tell us what you're doing today." }),
        { status: 400 }
      );
    }

    const systemPrompt = `You create ONE short, specific, doable "dare" (a small task) for a habit-building app called Flick, based on what the user says they're doing today.

Rules:
- The dare should directly relate to what they said (their work, workout, study session, etc.)
- Keep it small, realistic, and completable in a few minutes to an hour
- Encouraging, casual, Gen Z tone — not corporate or preachy
- One sentence only, no explanations
- No emojis at the start

Respond ONLY with the dare text, nothing else — no quotes, no JSON, just the sentence.`;

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
            { role: "user", content: `Today I'm doing: ${answer.trim()}` },
          ],
          temperature: 0.7,
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

    const task =
      data.choices?.[0]?.message?.content?.trim() ||
      "Take 5 minutes to plan out your top priority for today.";

    return new Response(JSON.stringify({ task: task.slice(0, 200) }), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected server error." }),
      { status: 500 }
    );
  }
}