/**
 * Transcription API route
 * POST /api/transcribe
 *
 * Server-side proxy for audio transcription requests using OpenAI Whisper.
 * Keeps API keys secure on the server.
 *
 * Example usage from client:
 * ```ts
 * const response = await fetch('/api/transcribe', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     audio_base64: '<base64-encoded-audio>',
 *     content_type: 'audio/wav',
 *     filename: 'recording.wav'
 *   })
 * });
 * const result = await response.json();
 * ```
 */

// Note: These secrets are only available on the server
// They should be set in your deployment environment, not in .env with EXPO_PUBLIC_ prefix
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface TranscribeRequest {
  audio_base64: string;
  content_type: string;
  filename: string;
  model?: string;
  language?: string;
  response_format?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: TranscribeRequest = await request.json();
    const {
      audio_base64,
      content_type,
      filename,
      model = "whisper-1",
      language,
      response_format = "json",
    } = body;

    if (!audio_base64) {
      return Response.json({ success: false, error: "audio_base64 is required" }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return Response.json(
        { success: false, error: "OPENAI_API_KEY not configured" },
        { status: 503 }
      );
    }

    // Convert base64 to blob
    const binaryString = atob(audio_base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const audioBlob = new Blob([bytes], { type: content_type });

    // Create form data
    const formData = new FormData();
    formData.append("file", audioBlob, filename);
    formData.append("model", model);
    formData.append("response_format", response_format);
    if (language) {
      formData.append("language", language);
    }

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        { success: false, error: `OpenAI API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json({
      success: true,
      text: data.text,
      language: data.language,
      duration: data.duration,
      model,
    });
  } catch (error) {
    console.error("[API] Transcribe error:", error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
