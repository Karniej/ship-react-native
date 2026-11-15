// app/api/chat+api.ts
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. You provide clear, accurate, and concise responses.`;

export async function POST(request: Request): Promise<Response> {
  try {
    const body: ChatRequest = await request.json();
    const {
      messages,
      model = "gpt-4o-mini",
      temperature = 0.7,
      max_tokens = 2048,
      system_prompt,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { success: false, error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return Response.json(
        { success: false, error: "OPENAI_API_KEY not configured" },
        { status: 503 }
      );
    }

    // Build messages with system prompt
    const chatMessages = [
      { role: "system", content: system_prompt || DEFAULT_SYSTEM_PROMPT },
      ...messages.filter((m) => m.role === "user" || m.role === "assistant"),
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        { success: false, error: `OpenAI API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const message = data.choices[0]?.message?.content;

    return Response.json({
      success: true,
      message,
      content: message,
      model: data.model,
      usage: data.usage,
    });
  } catch (error) {
    console.error("[API] Chat error:", error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
