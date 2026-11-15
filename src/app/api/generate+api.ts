/**
 * AI Generation API route
 * POST /api/generate
 *
 * Server-side proxy for AI generation requests.
 * Keeps API keys secure on the server.
 *
 * Example usage from client:
 * ```ts
 * const response = await fetch('/api/generate', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ type: 'text', prompt: 'Hello world' })
 * });
 * const result = await response.json();
 * ```
 */

// Note: These secrets are only available on the server
// They should be set in your deployment environment, not in .env with EXPO_PUBLIC_ prefix
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface GenerateRequest {
  type: "text" | "image";
  prompt: string;
  model?: string;
}

interface GenerateResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: GenerateRequest = await request.json();
    const { type, prompt, model } = body;

    // Validate request
    if (!prompt) {
      return Response.json({ success: false, error: "Prompt is required" } as GenerateResponse, {
        status: 400,
      });
    }

    // Check API key is configured
    if (!OPENAI_API_KEY) {
      return Response.json(
        {
          success: false,
          error: "API not configured. Set OPENAI_API_KEY in server environment.",
        } as GenerateResponse,
        { status: 503 }
      );
    }

    // Handle different generation types
    switch (type) {
      case "text":
        return handleTextGeneration(prompt, model);
      case "image":
        return handleImageGeneration(prompt);
      default:
        return Response.json(
          {
            success: false,
            error: "Invalid generation type",
          } as GenerateResponse,
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API] Generate error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      } as GenerateResponse,
      { status: 500 }
    );
  }
}

async function handleTextGeneration(prompt: string, model = "gpt-4o-mini"): Promise<Response> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return Response.json(
      {
        success: false,
        error: `OpenAI API error: ${error}`,
      } as GenerateResponse,
      { status: response.status }
    );
  }

  const data = await response.json();
  return Response.json({
    success: true,
    data: {
      text: data.choices[0]?.message?.content,
      model: data.model,
      usage: data.usage,
    },
  } as GenerateResponse);
}

async function handleImageGeneration(prompt: string): Promise<Response> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return Response.json(
      {
        success: false,
        error: `OpenAI API error: ${error}`,
      } as GenerateResponse,
      { status: response.status }
    );
  }

  const data = await response.json();
  return Response.json({
    success: true,
    data: {
      url: data.data[0]?.url,
      revised_prompt: data.data[0]?.revised_prompt,
    },
  } as GenerateResponse);
}
