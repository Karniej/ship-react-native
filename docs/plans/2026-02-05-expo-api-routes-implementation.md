# Expo API Routes Backend Implementation Plan

> Historical planning document: this file was written during the earlier Supabase-to-Expo-API-Routes transition.
> It is not the current source of truth for the repo architecture.
> Use `README.md`, `docs/ARCHITECTURE.md`, and `docs/SETUP_GUIDE.md` for the current backend model.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a setup wizard option allowing users to choose between Supabase (full backend) and Expo API Routes (simple API proxy).

**Architecture:** Build-time configuration via `constants/api.ts` that services check to route calls to either Supabase Edge Functions or Expo API Routes. The setup script sets this value based on user choice.

**Tech Stack:** TypeScript, Expo Router API Routes, OpenAI API, ElevenLabs API, Replicate API

---

## Task 1: Create API Mode Configuration

**Files:**

- Create: `constants/api.ts`

**Step 1: Create the API mode constant file**

```typescript
// constants/api.ts
export type ApiMode = "supabase" | "expo-api-routes";

/**
 * API backend mode - set by setup script
 * - "supabase": Full backend with auth, rate limiting, credits (default)
 * - "expo-api-routes": Simple proxy, premium features gated by RevenueCat
 */
export const API_MODE: ApiMode = "supabase";

/**
 * Base URL for Expo API routes
 * Set this to your deployed server URL in production
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";
```

**Step 2: Commit**

```bash
git add constants/api.ts
git commit -m "feat: add API mode configuration constant"
```

---

## Task 2: Create Chat API Route

**Files:**

- Create: `app/api/chat+api.ts`

**Step 1: Create the chat API route**

```typescript
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
```

**Step 2: Commit**

```bash
git add app/api/chat+api.ts
git commit -m "feat: add chat API route for Expo API Routes mode"
```

---

## Task 3: Create Vision API Route

**Files:**

- Create: `app/api/vision+api.ts`

**Step 1: Create the vision API route**

```typescript
// app/api/vision+api.ts
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface VisionRequest {
  image_base64: string;
  content_type: string;
  model?: string;
  prompt?: string;
  max_tokens?: number;
  detail?: "low" | "high" | "auto";
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
      return Response.json({ success: false, error: "image_base64 is required" }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return Response.json(
        { success: false, error: "OPENAI_API_KEY not configured" },
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
        { success: false, error: `OpenAI API error: ${error}` },
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
    });
  } catch (error) {
    console.error("[API] Vision error:", error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add app/api/vision+api.ts
git commit -m "feat: add vision API route for image analysis"
```

---

## Task 4: Create Transcription API Route

**Files:**

- Create: `app/api/transcribe+api.ts`

**Step 1: Create the transcription API route**

```typescript
// app/api/transcribe+api.ts
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
```

**Step 2: Commit**

```bash
git add app/api/transcribe+api.ts
git commit -m "feat: add transcription API route for Whisper"
```

---

## Task 5: Create Text-to-Speech API Route

**Files:**

- Create: `app/api/text-to-speech+api.ts`

**Step 1: Create the TTS API route**

```typescript
// app/api/text-to-speech+api.ts
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const VOICES: Record<string, string> = {
  rachel: "21m00Tcm4TlvDq8ikWAM",
  drew: "29vD33N1CtxCmqQRPOHJ",
  clyde: "2EiwWnXFnvU5JabPnv8n",
  paul: "5Q0t7uMcjvnagumLfvZi",
  domi: "AZnzlk1XvdvUeBnXmlld",
  dave: "CYw3kZ02Hs0563khs1Fj",
  fin: "D38z5RcWu1voky8WS1ja",
  sarah: "EXAVITQu4vr4xnSDxMaL",
  antoni: "ErXwobaYiN019PkySvjV",
  thomas: "GBv7mTt0atIp3Br8iCZE",
  charlie: "IKne3meq5aSn9XLyUdCD",
  george: "JBFqnCBsd6RMkjVDRZzb",
  emily: "LcfcDJNUP1GQjkzn1xUU",
  elli: "MF3mGyEYCl7XYWbV9V6O",
  callum: "N2lVS1w4EtoT3dr4eOWO",
  adam: "pNInz6obpgDQGcFmaJgB",
  nicole: "piTKgcLEGmPE4e6mEKli",
};

interface TTSRequest {
  text: string;
  voice?: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  output_format?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: TTSRequest = await request.json();
    const {
      text,
      voice = "rachel",
      model_id = "eleven_multilingual_v2",
      voice_settings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
        use_speaker_boost: true,
      },
      output_format = "mp3_44100_128",
    } = body;

    if (!text || text.trim().length === 0) {
      return Response.json({ success: false, error: "Text is required" }, { status: 400 });
    }

    if (text.length > 5000) {
      return Response.json(
        { success: false, error: "Text must be less than 5000 characters" },
        { status: 400 }
      );
    }

    if (!ELEVENLABS_API_KEY) {
      return Response.json(
        { success: false, error: "ELEVENLABS_API_KEY not configured" },
        { status: 503 }
      );
    }

    // Resolve voice ID
    const voiceId = VOICES[voice] || voice;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${output_format}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        { success: false, error: `ElevenLabs API error: ${error}` },
        { status: response.status }
      );
    }

    // Return audio as base64
    const audioData = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioData).toString("base64");

    return Response.json({
      success: true,
      audio_base64: base64Audio,
      content_type: "audio/mpeg",
      voice,
      model: model_id,
    });
  } catch (error) {
    console.error("[API] TTS error:", error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add app/api/text-to-speech+api.ts
git commit -m "feat: add text-to-speech API route for ElevenLabs"
```

---

## Task 6: Create Video Generation API Route

**Files:**

- Create: `app/api/video+api.ts`

**Step 1: Create the video API route**

```typescript
// app/api/video+api.ts
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

interface VideoRequest {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  num_outputs?: number;
  negative_prompt?: string;
  guidance_scale?: number;
  num_inference_steps?: number;
  image?: string;
  strength?: number;
}

const MODEL_VERSIONS: Record<string, string> = {
  "flux-schnell": "black-forest-labs/flux-schnell",
  "flux-pro": "black-forest-labs/flux-pro",
  sdxl: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  "sdxl-lightning":
    "bytedance/sdxl-lightning-4step:5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f",
};

export async function POST(request: Request): Promise<Response> {
  try {
    const body: VideoRequest = await request.json();
    const {
      prompt,
      model = "flux-schnell",
      width = 1024,
      height = 1024,
      num_outputs = 1,
      negative_prompt,
      guidance_scale,
      num_inference_steps,
      image,
      strength,
    } = body;

    if (!prompt) {
      return Response.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    if (!REPLICATE_API_TOKEN) {
      return Response.json(
        { success: false, error: "REPLICATE_API_TOKEN not configured" },
        { status: 503 }
      );
    }

    const modelVersion = MODEL_VERSIONS[model] || model;

    // Build input
    const input: Record<string, unknown> = {
      prompt,
      width,
      height,
      num_outputs,
    };

    if (negative_prompt) input.negative_prompt = negative_prompt;
    if (guidance_scale !== undefined) input.guidance_scale = guidance_scale;
    if (num_inference_steps !== undefined) input.num_inference_steps = num_inference_steps;
    if (image) {
      input.image = `data:image/png;base64,${image}`;
      input.strength = strength ?? 0.75;
    }

    // Create prediction
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: modelVersion.includes(":") ? modelVersion.split(":")[1] : undefined,
        model: modelVersion.includes(":") ? undefined : modelVersion,
        input,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      return Response.json(
        { success: false, error: `Replicate API error: ${error}` },
        { status: createResponse.status }
      );
    }

    const prediction = await createResponse.json();

    // Poll for completion (max 60 seconds)
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(prediction.urls.get, {
        headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
      });

      const status = await statusResponse.json();

      if (status.status === "succeeded") {
        const output = Array.isArray(status.output) ? status.output : [status.output];
        return Response.json({
          success: true,
          url: output[0],
          urls: output,
          model,
          prompt,
        });
      }

      if (status.status === "failed") {
        return Response.json(
          { success: false, error: status.error || "Generation failed" },
          { status: 500 }
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    return Response.json({ success: false, error: "Generation timed out" }, { status: 504 });
  } catch (error) {
    console.error("[API] Video error:", error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add app/api/video+api.ts
git commit -m "feat: add video/image generation API route for Replicate"
```

---

## Task 7: Update Environment Example

**Files:**

- Modify: `.env.example`

**Step 1: Add server-side API key placeholders**

Add after the Supabase section:

```bash
# -----------------------------------------------------------------------------
# SERVER-SIDE API KEYS (for Expo API Routes mode)
# -----------------------------------------------------------------------------
# These are used when running in Expo API Routes mode (not Supabase)
# Set these in your deployment environment (EAS, Vercel, Netlify)
# Do NOT prefix with EXPO_PUBLIC_ - these must stay server-side only

# OPENAI_API_KEY=sk-...
# REPLICATE_API_TOKEN=r8_...
# ELEVENLABS_API_KEY=...
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add server-side API key placeholders to env example"
```

---

## Task 8: Update Chat Service

**Files:**

- Modify: `services/ai/chat.service.ts`

**Step 1: Add conditional API mode routing**

Replace the import section and add the conditional logic:

```typescript
import { API_MODE, API_BASE_URL } from "@/constants/api";
import { supabase } from "@/utils/supabase";

// ... keep existing interfaces ...

export const chatService = {
  async sendMessage(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    try {
      if (API_MODE === "supabase") {
        const { data, error } = await supabase.functions.invoke("chat", {
          body: {
            messages,
            model: options.model || "gpt-4o-mini",
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens || 2048,
            system_prompt: options.systemPrompt,
          },
        });

        if (error) {
          throw error;
        }

        return {
          success: true,
          message: data?.message || data?.content,
        };
      } else {
        // Expo API Routes mode
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            model: options.model || "gpt-4o-mini",
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens || 2048,
            system_prompt: options.systemPrompt,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Chat request failed");
        }

        return {
          success: true,
          message: data.message || data.content,
        };
      }
    } catch (error) {
      console.error("Chat service error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send message",
      };
    }
  },

  // ... keep rest of existing methods unchanged ...
```

**Step 2: Commit**

```bash
git add services/ai/chat.service.ts
git commit -m "feat: add API mode routing to chat service"
```

---

## Task 9: Update Vision Service

**Files:**

- Modify: `services/ai/vision.service.ts`

**Step 1: Add conditional API mode routing**

Add import at top:

```typescript
import { API_MODE, API_BASE_URL } from "@/constants/api";
```

Replace the `analyzeImage` method body (starting at line 81) with:

```typescript
  async analyzeImage(
    imageUri: string,
    options: AnalyzeImageOptions = {}
  ): Promise<AnalyzeImageResult> {
    try {
      // Validate image first
      const validation = await this.validateImageFile(imageUri);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Read image as base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64Image) {
        return { success: false, error: "Failed to read image file" };
      }

      // Get file extension for content type
      const extension = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const contentType = this.getContentType(extension);

      if (API_MODE === "supabase") {
        const { data, error } = await supabase.functions.invoke("analyze-image", {
          body: {
            image_base64: base64Image,
            content_type: contentType,
            model: options.model || "gpt-4o",
            prompt: options.prompt || VISION_PROMPTS.defaultAnalysis,
            max_tokens: options.maxTokens || 1000,
            detail: options.detail || "auto",
          },
        });

        if (error) {
          if (error.message?.includes("rate limit")) {
            return { success: false, error: "Rate limit exceeded. Please try again later." };
          }
          if (error.message?.includes("insufficient credits")) {
            return { success: false, error: "Insufficient credits for image analysis." };
          }
          throw error;
        }

        if (!data?.success) {
          return { success: false, error: data?.error || "Image analysis failed" };
        }

        return {
          success: true,
          analysis: data.analysis,
          labels: data.labels,
          objects: data.objects,
          text: data.text,
          model: data.model || options.model || "gpt-4o",
        };
      } else {
        // Expo API Routes mode
        const response = await fetch(`${API_BASE_URL}/api/vision`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_base64: base64Image,
            content_type: contentType,
            model: options.model || "gpt-4o",
            prompt: options.prompt || VISION_PROMPTS.defaultAnalysis,
            max_tokens: options.maxTokens || 1000,
            detail: options.detail || "auto",
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Image analysis failed");
        }

        return {
          success: true,
          analysis: data.analysis,
          labels: data.labels,
          model: data.model || options.model || "gpt-4o",
        };
      }
    } catch (error) {
      console.error("Vision analysis error:", error);

      let errorMessage = "Failed to analyze image";
      if (error instanceof Error) {
        if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }

      return { success: false, error: errorMessage };
    }
  },
```

**Step 2: Commit**

```bash
git add services/ai/vision.service.ts
git commit -m "feat: add API mode routing to vision service"
```

---

## Task 10: Update Transcription Service

**Files:**

- Modify: `services/ai/transcription.service.ts`

**Step 1: Add conditional API mode routing**

Add import at top:

```typescript
import { API_MODE, API_BASE_URL } from "@/constants/api";
```

Replace the `transcribe` method body (starting at line 76) with:

```typescript
  async transcribe(
    fileUri: string,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    try {
      // Validate file first
      const validation = await this.validateAudioFile(fileUri);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Read file as base64
      const base64Audio = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64Audio) {
        return { success: false, error: "Failed to read audio file" };
      }

      // Get file extension for content type
      const extension = fileUri.split(".").pop()?.toLowerCase() || "mp3";
      const contentType = this.getContentType(extension);

      if (API_MODE === "supabase") {
        const { data, error } = await supabase.functions.invoke("transcribe-audio", {
          body: {
            audio_base64: base64Audio,
            content_type: contentType,
            filename: `audio.${extension}`,
            model: options.model || "whisper-1",
            language: options.language,
            response_format: options.responseFormat || "json",
            temperature: options.temperature,
          },
        });

        if (error) {
          if (error.message?.includes("rate limit")) {
            return { success: false, error: "Rate limit exceeded. Please try again later." };
          }
          if (error.message?.includes("insufficient credits")) {
            return { success: false, error: "Insufficient credits for transcription." };
          }
          throw error;
        }

        if (!data?.success) {
          return { success: false, error: data?.error || "Transcription failed" };
        }

        return {
          success: true,
          text: data.text,
          segments: data.segments,
          language: data.language,
          duration: data.duration,
          model: data.model || options.model || "whisper-1",
        };
      } else {
        // Expo API Routes mode
        const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio_base64: base64Audio,
            content_type: contentType,
            filename: `audio.${extension}`,
            model: options.model || "whisper-1",
            language: options.language,
            response_format: options.responseFormat || "json",
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Transcription failed");
        }

        return {
          success: true,
          text: data.text,
          language: data.language,
          duration: data.duration,
          model: data.model || options.model || "whisper-1",
        };
      }
    } catch (error) {
      console.error("Transcription error:", error);

      let errorMessage = "Failed to transcribe audio";
      if (error instanceof Error) {
        if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. Large files may take longer to process.";
        } else {
          errorMessage = error.message;
        }
      }

      return { success: false, error: errorMessage };
    }
  },
```

**Step 2: Commit**

```bash
git add services/ai/transcription.service.ts
git commit -m "feat: add API mode routing to transcription service"
```

---

## Task 11: Update ElevenLabs Service

**Files:**

- Modify: `services/ai/elevenlabs.service.ts`

**Step 1: Add conditional API mode routing**

Add import at top:

```typescript
import { API_MODE, API_BASE_URL } from "@/constants/api";
```

Replace the `textToSpeech` method:

```typescript
  async textToSpeech(text: string, options: TextToSpeechOptions = {}): Promise<TextToSpeechResult> {
    try {
      if (API_MODE === "supabase") {
        const { data, error } = await supabase.functions.invoke("text-to-speech", {
          body: {
            text,
            voice: options.voice || "rachel",
            model_id: options.model_id || "eleven_multilingual_v2",
            voice_settings: options.voice_settings || {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0,
              use_speaker_boost: true,
            },
            output_format: options.output_format || "mp3_44100_128",
          },
        });

        if (error) {
          throw error;
        }

        return data as TextToSpeechResult;
      } else {
        // Expo API Routes mode
        const response = await fetch(`${API_BASE_URL}/api/text-to-speech`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voice: options.voice || "rachel",
            model_id: options.model_id || "eleven_multilingual_v2",
            voice_settings: options.voice_settings || {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0,
              use_speaker_boost: true,
            },
            output_format: options.output_format || "mp3_44100_128",
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Text-to-speech failed");
        }

        return data as TextToSpeechResult;
      }
    } catch (error) {
      console.error("ElevenLabs textToSpeech error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate speech",
      };
    }
  },
```

**Step 2: Commit**

```bash
git add services/ai/elevenlabs.service.ts
git commit -m "feat: add API mode routing to elevenlabs service"
```

---

## Task 12: Update OpenAI Service

**Files:**

- Modify: `services/ai/openai.service.ts`

**Step 1: Add conditional API mode routing**

Replace the entire file:

```typescript
import { API_MODE, API_BASE_URL } from "@/constants/api";
import { supabase } from "@/utils/supabase";

export interface GenerateImageOptions {
  model?: "dall-e-2" | "dall-e-3";
  size?: "1024x1024" | "1792x1024" | "1024x1792" | "512x512" | "256x256";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}

export interface GenerateImageResult {
  success: boolean;
  url?: string;
  model?: string;
  prompt?: string;
  error?: string;
}

export const openaiService = {
  async generateImage(
    prompt: string,
    options: GenerateImageOptions = {}
  ): Promise<GenerateImageResult> {
    try {
      if (API_MODE === "supabase") {
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: {
            prompt,
            model: options.model || "dall-e-3",
            size: options.size || "1024x1024",
            quality: options.quality || "standard",
            style: options.style || "vivid",
          },
        });

        if (error) {
          throw error;
        }

        return data as GenerateImageResult;
      } else {
        // Expo API Routes mode - use existing generate endpoint
        const response = await fetch(`${API_BASE_URL}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "image",
            prompt,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Image generation failed");
        }

        return {
          success: true,
          url: data.data?.url,
          prompt: data.data?.revised_prompt || prompt,
        };
      }
    } catch (error) {
      console.error("OpenAI generateImage error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate image",
      };
    }
  },
};
```

**Step 2: Commit**

```bash
git add services/ai/openai.service.ts
git commit -m "feat: add API mode routing to openai service"
```

---

## Task 13: Update Replicate Service

**Files:**

- Modify: `services/ai/replicate.service.ts`

**Step 1: Add conditional API mode routing**

Add import at top:

```typescript
import { API_MODE, API_BASE_URL } from "@/constants/api";
```

Replace the `generate` method:

```typescript
  async generate(
    prompt: string,
    options: ReplicateGenerateOptions = {}
  ): Promise<ReplicateGenerateResult> {
    try {
      // Convert image to base64 if provided (for img2img)
      let imageBase64: string | null = null;
      if (options.image) {
        imageBase64 = await this.imageToBase64(options.image);
        if (!imageBase64) {
          return { success: false, error: "Failed to process input image" };
        }
      }

      // Build request body
      const requestBody: Record<string, unknown> = {
        prompt,
        model: options.model || "flux-schnell",
        width: options.width || 1024,
        height: options.height || 1024,
        num_outputs: options.num_outputs || 1,
      };

      if (options.negative_prompt) {
        requestBody.negative_prompt = options.negative_prompt;
      }
      if (options.guidance_scale !== undefined) {
        requestBody.guidance_scale = options.guidance_scale;
      }
      if (options.num_inference_steps !== undefined) {
        requestBody.num_inference_steps = options.num_inference_steps;
      }
      if (imageBase64) {
        requestBody.image = imageBase64;
        requestBody.strength = options.strength ?? 0.75;
      }

      if (API_MODE === "supabase") {
        const { data, error } = await supabase.functions.invoke("replicate-generate", {
          body: requestBody,
        });

        if (error) {
          throw error;
        }

        return data as ReplicateGenerateResult;
      } else {
        // Expo API Routes mode
        const response = await fetch(`${API_BASE_URL}/api/video`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Generation failed");
        }

        return data as ReplicateGenerateResult;
      }
    } catch (error) {
      console.error("Replicate generate error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate image",
      };
    }
  },
```

**Step 2: Commit**

```bash
git add services/ai/replicate.service.ts
git commit -m "feat: add API mode routing to replicate service"
```

---

## Task 14: Update Video Service

**Files:**

- Modify: `services/ai/video.service.ts`

**Step 1: Add conditional API mode routing**

Add import at top:

```typescript
import { API_MODE, API_BASE_URL } from "@/constants/api";
```

Replace the `generateVideo` method with API mode check (around line 43-146). The logic remains the same but adds an `else` branch for Expo API Routes mode:

After the existing Supabase call block, add the else branch:

```typescript
      } else {
        // Expo API Routes mode
        const response = await fetch(`${API_BASE_URL}/api/video`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Video generation failed");
        }

        return {
          success: true,
          url: data.url,
          model: data.model || options.model || "runway-gen3",
          prompt,
          duration: data.duration || options.duration || 4,
        };
      }
```

**Step 2: Commit**

```bash
git add services/ai/video.service.ts
git commit -m "feat: add API mode routing to video service"
```

---

## Task 15: Update Setup Script - Backend Mode Step

**Files:**

- Modify: `scripts/setup.js`

**Step 1: Add backend mode to setup summary**

After line 160 (after `revenuecat: false,`), add:

```javascript
  backendMode: "supabase",
  deploymentPlatform: null,
```

**Step 2: Add new Step 6 - Backend Mode**

Insert a new step after Step 5 (Authentication) around line 562. Renumber subsequent steps (current 6-12 become 7-13).

Add this new step:

```javascript
// =========================================================================
// STEP 6: Backend Mode
// =========================================================================
log.title("🔌 Step 6/13: Backend Mode");
console.log(`${colors.dim}Choose how your app communicates with AI services${colors.reset}\n`);

console.log(`
  ${colors.cyan}1.${colors.reset} Supabase (Recommended)
     Full backend with auth, database, rate limiting, and credits.
     Best for apps with user accounts, usage tracking, monetization.

  ${colors.cyan}2.${colors.reset} Expo API Routes (Simple Proxy)
     Lightweight server-side proxy that just hides API keys.
     Premium features gated by RevenueCat subscription on client.
     Best for simple apps, quick prototypes, RevenueCat-only monetization.
`);

const backendChoice = await question("Select option (1-2) [1]: ");
const backendMode = backendChoice === "2" ? "expo-api-routes" : "supabase";
setupSummary.backendMode = backendMode;

// Update constants/api.ts
const apiConfigPath = path.join(rootDir, "constants", "api.ts");
if (fs.existsSync(apiConfigPath)) {
  let apiContent = fs.readFileSync(apiConfigPath, "utf8");
  apiContent = apiContent.replace(
    /export const API_MODE: ApiMode = "[^"]+"/,
    `export const API_MODE: ApiMode = "${backendMode}"`
  );
  fs.writeFileSync(apiConfigPath, apiContent);
}

log.success(`Backend mode: ${backendMode}`);

// If Expo API Routes selected, ask about deployment platform
if (backendMode === "expo-api-routes") {
  console.log(`
Where will you deploy your API routes?

  ${colors.cyan}1.${colors.reset} EAS Hosting (Recommended for Expo apps)
  ${colors.cyan}2.${colors.reset} Vercel
  ${colors.cyan}3.${colors.reset} Netlify
  ${colors.cyan}4.${colors.reset} Other / Decide later
`);

  const deployChoice = await question("Select option (1-4) [1]: ");
  const deploymentPlatforms = { 1: "eas", 2: "vercel", 3: "netlify", 4: "other" };
  setupSummary.deploymentPlatform = deploymentPlatforms[deployChoice] || "eas";
  log.info(`Deployment target: ${setupSummary.deploymentPlatform}`);
}
```

**Step 3: Modify Supabase step to be conditional**

Wrap the Supabase configuration step (current Step 6, becomes Step 7) with a condition:

```javascript
// =========================================================================
// STEP 7: Supabase Configuration (skip if using Expo API Routes)
// =========================================================================
if (setupSummary.backendMode === "supabase") {
  log.title("🗄️  Step 7/13: Supabase Configuration");
  // ... rest of existing Supabase step code ...
} else {
  log.skip("Supabase configuration (using Expo API Routes)");
}
```

**Step 4: Update final summary**

In the final summary section (around line 950), add backend mode display:

After the "Configuration Summary:" section, add:

```javascript
  Backend:        ${setupSummary.backendMode === "supabase" ? "Supabase" : "Expo API Routes"}${setupSummary.backendMode === "expo-api-routes" ? ` (deploy to ${setupSummary.deploymentPlatform})` : ""}
```

**Step 5: Add deployment instructions for Expo API Routes mode**

Before the final "Happy coding!" message, add:

```javascript
// Show deployment instructions for Expo API Routes mode
if (setupSummary.backendMode === "expo-api-routes") {
  const deployInstructions = {
    eas: `
${colors.cyan}Deployment: EAS Hosting${colors.reset}

  1. Install EAS CLI (if not already):
     npm install -g eas-cli

  2. Deploy your API routes:
     npx eas deploy

  3. Set environment variables in EAS dashboard:
     - OPENAI_API_KEY
     - REPLICATE_API_TOKEN (if using video/image gen)
     - ELEVENLABS_API_KEY (if using TTS)

  Docs: https://docs.expo.dev/eas/hosting/
`,
    vercel: `
${colors.cyan}Deployment: Vercel${colors.reset}

  1. Install Vercel CLI:
     npm install -g vercel

  2. Deploy:
     vercel

  3. Set environment variables:
     vercel env add OPENAI_API_KEY
     vercel env add REPLICATE_API_TOKEN
     vercel env add ELEVENLABS_API_KEY

  Docs: https://vercel.com/docs
`,
    netlify: `
${colors.cyan}Deployment: Netlify${colors.reset}

  1. Install Netlify CLI:
     npm install -g netlify-cli

  2. Deploy:
     netlify deploy --prod

  3. Set environment variables in Netlify dashboard:
     Site settings → Environment variables

  Docs: https://docs.netlify.com
`,
    other: `
${colors.cyan}Deployment: Custom${colors.reset}

  Set these environment variables on your server:
  - OPENAI_API_KEY
  - REPLICATE_API_TOKEN (if using video/image gen)
  - ELEVENLABS_API_KEY (if using TTS)

  Then deploy using your preferred method.
`,
  };

  console.log(deployInstructions[setupSummary.deploymentPlatform] || deployInstructions.other);
}
```

**Step 6: Commit**

```bash
git add scripts/setup.js
git commit -m "feat: add backend mode selection to setup script"
```

---

## Task 16: Final Verification

**Step 1: Run linter**

```bash
npm run lint
```

**Step 2: Run type check**

```bash
npm run type-check
```

**Step 3: Test setup script**

```bash
npm run setup
```

Verify:

- Backend mode step appears
- Selecting "Expo API Routes" shows deployment options
- Supabase step is skipped when using Expo API Routes
- Summary shows correct backend mode

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Expo API Routes backend option implementation"
```
