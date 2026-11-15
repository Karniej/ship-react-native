/**
 * AI Identification API route
 * POST /api/identify
 *
 * Server-side OpenAI vision proxy for identifying objects from photos.
 * Each app customizes SYSTEM_PROMPT and the response shape for its domain
 * (fish, plants, mushrooms, rocks, breeds, fonts, etc.).
 *
 * Example request body:
 *   { "image_base64": "...", "content_type": "image/jpeg" }
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface IdentifyRequest {
  image_base64: string;
  content_type?: string;
}

interface IdentifyResponse {
  success: boolean;
  result?: {
    name: string;
    confidence: number;
    description: string;
    details: string;
    funFact: string;
  };
  error?: string;
}

// CUSTOMIZE THIS PROMPT FOR YOUR APP'S DOMAIN
const SYSTEM_PROMPT = `You are an expert identification assistant. Analyze the photo and identify the subject.

You MUST respond with ONLY valid JSON — no markdown, no code blocks, no extra text:
{
  "name": "Common Name (Scientific/Technical Name if applicable)",
  "confidence": 0.95,
  "description": "A 2-3 sentence description including key identifying features",
  "details": "Relevant facts: size, habitat, range, characteristics",
  "funFact": "An interesting, memorable fact about this subject"
}

Confidence Scoring:
- 0.90-1.00: Clearly identifiable, distinctive features visible
- 0.70-0.89: Likely this but some features unclear
- 0.50-0.69: Reasonable guess but image quality limits certainty
- Below 0.50: Uncertain — best guess

If you cannot identify the subject, return:
{
  "name": "Unknown",
  "confidence": 0,
  "description": "Could not identify the subject. Try a clearer photo with good lighting.",
  "details": "N/A",
  "funFact": "Tip: Side-profile photos with the subject centered work best for identification."
}`;

export async function POST(request: Request): Promise<Response> {
  try {
    const body: IdentifyRequest = await request.json();
    const { image_base64, content_type } = body;

    if (!image_base64) {
      return Response.json(
        { success: false, error: "image_base64 is required" } as IdentifyResponse,
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY || OPENAI_API_KEY === "your_openai_key_here") {
      return Response.json({
        success: true,
        result: {
          name: "Mock Result",
          confidence: 0.92,
          description:
            "This is a mock identification response. Set OPENAI_API_KEY in your environment to enable real identification.",
          details: "N/A",
          funFact: "Mock data is great for UI testing without burning API credits!",
        },
      } as IdentifyResponse);
    }

    const mimeType = content_type || "image/jpeg";
    const dataUri = `data:${mimeType};base64,${image_base64}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 1500,
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify the subject in this image." },
              { type: "image_url", image_url: { url: dataUri } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[API] OpenAI error:", error);
      return Response.json(
        { success: false, error: `OpenAI API error: ${response.status}` } as IdentifyResponse,
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json(
        { success: false, error: "No response from OpenAI" } as IdentifyResponse,
        { status: 500 }
      );
    }

    try {
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      if (!cleanContent.endsWith("}")) {
        console.error("[API] Truncated JSON from OpenAI:", cleanContent);
        throw new Error("Response appears truncated (no closing brace)");
      }

      const result = JSON.parse(cleanContent);
      return Response.json({
        success: true,
        result: {
          name: result.name || "Unknown",
          confidence: typeof result.confidence === "number" ? result.confidence : 0,
          description: result.description || "",
          details: result.details || "Unknown",
          funFact: result.funFact || "",
        },
      } as IdentifyResponse);
    } catch {
      return Response.json({
        success: true,
        result: {
          name: "Unknown",
          confidence: 0,
          description: content || "Could not parse identification result",
          details: "Unknown",
          funFact: "",
        },
      } as IdentifyResponse);
    }
  } catch (error) {
    console.error("[API] Identification error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      } as IdentifyResponse,
      { status: 500 }
    );
  }
}
