/**
 * Vision API route
 * POST /api/vision
 *
 * Server-side proxy for image analysis requests using GPT-4 Vision.
 * Keeps API keys secure on the server.
 *
 * Example usage from client:
 * ```ts
 * const response = await fetch('/api/vision', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     image_base64: 'base64EncodedImageData',
 *     content_type: 'image/jpeg',
 *     prompt: 'What is in this image?'
 *   })
 * });
 * const result = await response.json();
 * ```
 */

// Note: These secrets are only available on the server
// They should be set in your deployment environment, not in .env with EXPO_PUBLIC_ prefix
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface VisionRequest {
  image_base64: string;
  content_type: string;
  model?: string;
  prompt?: string;
  max_tokens?: number;
  detail?: "low" | "high" | "auto";
}

interface VisionResponse {
  success: boolean;
  analysis?: string;
  labels?: string[];
  model?: string;
  error?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: VisionRequest = await request.json();
    const {
      image_base64,
      content_type,
      model = "gpt-4o",
      prompt = "Describe this image in detail.",
      max_tokens = 1000,
      detail = "auto",
    } = body;

    if (!image_base64) {
      return Response.json(
        { success: false, error: "image_base64 is required" } as VisionResponse,
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return Response.json(
        {
          success: false,
          error: "OPENAI_API_KEY not configured",
        } as VisionResponse,
        { status: 503 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${content_type};base64,${image_base64}`,
                  detail,
                },
              },
            ],
          },
        ],
        max_tokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        {
          success: false,
          error: `OpenAI API error: ${error}`,
        } as VisionResponse,
        { status: response.status }
      );
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content;

    // Extract labels from analysis (simple extraction)
    const labelMatches = analysis?.match(/(?:objects?|items?|elements?):\s*([^.]+)/gi) || [];
    const labels = labelMatches
      .flatMap((match: string) => match.split(/[,;]/))
      .map((label: string) => label.replace(/^.*?:\s*/, "").trim())
      .filter((label: string) => label.length > 0 && label.length < 50);

    return Response.json({
      success: true,
      analysis,
      labels: labels.slice(0, 10),
      model: data.model,
    } as VisionResponse);
  } catch (error) {
    console.error("[API] Vision error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      } as VisionResponse,
      { status: 500 }
    );
  }
}
