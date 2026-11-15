# Convex AI Functions Guide

This guide documents the Convex Actions used for AI processing in the Ship React Native boilerplate.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Available Functions](#available-functions)
- [Creating New Functions](#creating-new-functions)
- [Environment Variables](#environment-variables)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Deployment](#deployment)

## Overview

Convex Actions provide server-side AI processing with:

- Type-safe function definitions
- Automatic TypeScript code generation
- Real-time logs and debugging
- Pay-per-use pricing
- Built-in authentication context

## Setup

### Prerequisites

```bash
# Install Convex
npm install convex @convex-dev/auth

# Initialize Convex project
npx convex init

# Start development server
npx convex dev
```

### Local Development

```bash
# Start Convex dev server (keep running)
npx convex dev

# In another terminal, start your app
npm start
```

The Convex dev server:

- Syncs functions to the cloud
- Generates TypeScript types
- Shows real-time logs
- Hot reloads on changes

## Available Functions

### 1. imageGeneration.generateImage

Generates images using OpenAI DALL-E.

**Location:** `convex/ai/imageGeneration.ts`

**Arguments:**

```typescript
{
  prompt: string;        // Required: Image description
  model?: string;        // Optional: "dall-e-3" (default) or "dall-e-2"
  size?: string;         // Optional: "1024x1024", "1024x1792", "1792x1024"
  quality?: string;      // Optional: "standard" or "hd"
  style?: string;        // Optional: "vivid" or "natural"
}
```

**Response:**

```typescript
{
  success: boolean;
  url?: string;          // Generated image URL
  model?: string;        // Model used
  error?: string;        // Error message if failed
}
```

**Example:**

```typescript
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

function GenerateImage() {
  const generateImage = useAction(api.ai.imageGeneration.generateImage);

  const handleGenerate = async () => {
    const result = await generateImage({
      prompt: "A futuristic city at sunset, cyberpunk style",
      model: "dall-e-3",
      quality: "hd",
    });

    if (result.success) {
      console.log("Image URL:", result.url);
    }
  };
}
```

---

### 2. replicate.generate

Generates images using Replicate (Flux, SDXL, etc.).

**Location:** `convex/ai/replicate.ts`

**Arguments:**

```typescript
{
  prompt: string;              // Required: Image description
  model?: string;              // Optional: "flux-schnell", "flux-pro", "sdxl"
  negative_prompt?: string;    // Optional: What to avoid
  width?: number;              // Optional: Image width (default: 1024)
  height?: number;             // Optional: Image height (default: 1024)
  num_outputs?: number;        // Optional: Number of images (default: 1)
  guidance_scale?: number;     // Optional: Prompt adherence (default: 7.5)
}
```

**Response:**

```typescript
{
  success: boolean;
  url?: string;          // First generated image URL
  urls?: string[];       // All generated image URLs
  model?: string;
  error?: string;
}
```

**Example:**

```typescript
const generateWithFlux = useAction(api.ai.replicate.generateWithFlux);

const result = await generateWithFlux({
  prompt: "A serene Japanese garden",
});
```

---

### 3. textToSpeech.textToSpeech

Converts text to speech using ElevenLabs.

**Location:** `convex/ai/textToSpeech.ts`

**Arguments:**

```typescript
{
  text: string;               // Required: Text to convert (max 5000 chars)
  voiceId?: string;           // Optional: ElevenLabs voice ID
  modelId?: string;           // Optional: Model to use
  voiceSettings?: {
    stability?: number;       // 0-1
    similarityBoost?: number; // 0-1
  };
}
```

**Response:**

```typescript
{
  success: boolean;
  audioUrl?: string;     // Audio file URL
  model?: string;
  voice?: string;
  error?: string;
}
```

**Example:**

```typescript
const textToSpeech = useAction(api.ai.textToSpeech.textToSpeech);

const result = await textToSpeech({
  text: "Hello, welcome to our AI application!",
  voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
});
```

---

### 4. video.generateVideo

Generates videos from text prompts or images.

**Location:** `convex/ai/video.ts`

**Arguments:**

```typescript
{
  prompt: string;              // Required: Video description
  model?: string;              // Optional: "runway-gen3", "pika", "stable-video"
  duration?: number;           // Optional: Duration in seconds (default: 4)
  aspectRatio?: string;        // Optional: "16:9", "9:16", "1:1"
}
```

**Response:**

```typescript
{
  success: boolean;
  url?: string;          // Video URL (or prediction ID if async)
  predictionId?: string; // For checking status
  model?: string;
  error?: string;
}
```

**Example:**

```typescript
const generateVideo = useAction(api.ai.video.generateVideo);

const result = await generateVideo({
  prompt: "A timelapse of clouds moving over mountains",
  aspectRatio: "16:9",
  duration: 4,
});
```

---

### 5. transcription.transcribe

Transcribes audio files using OpenAI Whisper.

**Location:** `convex/ai/transcription.ts`

**Arguments:**

```typescript
{
  audioUrl: string;            // Required: URL to audio file
  model?: string;              // Optional: "whisper-1"
  language?: string;           // Optional: ISO 639-1 code (e.g., "en", "es")
}
```

**Response:**

```typescript
{
  success: boolean;
  text?: string;         // Transcribed text
  language?: string;
  duration?: number;
  error?: string;
}
```

---

### 6. vision.analyzeImage

Analyzes images using GPT-4 Vision.

**Location:** `convex/ai/vision.ts`

**Arguments:**

```typescript
{
  imageUrl: string;            // Required: URL to image
  prompt?: string;             // Optional: Custom analysis prompt
  detail?: string;             // Optional: "low" or "high"
}
```

**Response:**

```typescript
{
  success: boolean;
  analysis?: string;     // Analysis result
  model?: string;
  error?: string;
}
```

---

### 7. chat.chat

AI chat using OpenAI GPT models.

**Location:** `convex/ai/chat.ts`

**Arguments:**

```typescript
{
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  model?: string;              // Optional: "gpt-4o", "gpt-4-turbo"
  temperature?: number;        // Optional: 0-2
  maxTokens?: number;          // Optional: Max response length
}
```

**Response:**

```typescript
{
  success: boolean;
  message?: string;      // AI response
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}
```

---

## Creating New Functions

### 1. Create Function File

```typescript
// convex/ai/myNewFunction.ts
import { action } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

export const myNewAction = action({
  args: {
    prompt: v.string(),
    options: v.optional(
      v.object({
        setting1: v.optional(v.string()),
        setting2: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check credits
    const credits = await ctx.runQuery(internal.credits.getCreditsInternal, { userId });
    if (!credits || credits.creditsRemaining < 1) {
      throw new Error("Insufficient credits");
    }

    try {
      // Your AI logic here
      const apiKey = process.env.MY_API_KEY;
      const response = await fetch("https://api.example.com/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: args.prompt }),
      });

      const data = await response.json();

      // Deduct credit and log generation
      await ctx.runMutation(internal.credits.useCreditAndLog, {
        userId,
        provider: "example",
        model: "example-model",
        prompt: args.prompt,
        outputUrl: data.url,
        contentType: "image",
      });

      return {
        success: true,
        url: data.url,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
```

### 2. Export in Index (Optional)

If you want a cleaner import path:

```typescript
// convex/ai/index.ts
export { generateImage } from "./imageGeneration";
export { generate, generateWithFlux } from "./replicate";
export { textToSpeech } from "./textToSpeech";
export { myNewAction } from "./myNewFunction";
```

### 3. Use in Client

```typescript
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

const myAction = useAction(api.ai.myNewFunction.myNewAction);

const result = await myAction({
  prompt: "My prompt",
  options: { setting1: "value" },
});
```

## Environment Variables

Set environment variables in the Convex Dashboard:

1. Go to your project at [dashboard.convex.dev](https://dashboard.convex.dev)
2. Navigate to Settings > Environment Variables
3. Add your secrets:

| Variable              | Description                   |
| --------------------- | ----------------------------- |
| `OPENAI_API_KEY`      | OpenAI API key                |
| `REPLICATE_API_TOKEN` | Replicate API token           |
| `ELEVENLABS_API_KEY`  | ElevenLabs API key            |
| `RUNWAY_API_KEY`      | Runway ML API key (for video) |

Access in actions:

```typescript
const apiKey = process.env.OPENAI_API_KEY;
```

**Note:** Environment variables are only available in Actions (not Queries or Mutations).

## Error Handling

### Standard Error Pattern

```typescript
export const myAction = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    try {
      // Validate
      if (!args.prompt.trim()) {
        return { success: false, error: "Prompt is required" };
      }

      // Check auth
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        return { success: false, error: "Unauthorized" };
      }

      // Check credits
      const credits = await ctx.runQuery(internal.credits.getCreditsInternal, { userId });
      if (!credits || credits.creditsRemaining < 1) {
        return { success: false, error: "Insufficient credits" };
      }

      // API call
      const result = await callExternalApi(args.prompt);

      return { success: true, data: result };
    } catch (error) {
      console.error("Action error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
```

### Client-Side Handling

```typescript
const generateImage = useAction(api.ai.imageGeneration.generateImage);

try {
  const result = await generateImage({ prompt });

  if (!result.success) {
    // Business logic error
    Alert.alert("Error", result.error || "Generation failed");
    return;
  }

  // Success
  setImageUrl(result.url);
} catch (error) {
  // Network or Convex error
  Alert.alert("Error", "Failed to connect to server");
}
```

## Rate Limiting

Rate limiting is handled at the database level:

```typescript
// convex/rateLimits.ts
export const checkRateLimit = internalMutation({
  args: {
    userId: v.string(),
    endpoint: v.string(),
    limit: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowStart = now - args.windowMs;

    // Count recent requests
    const recentRequests = await ctx.db
      .query("rateLimits")
      .withIndex("by_userId_endpoint", (q) =>
        q.eq("userId", args.userId).eq("endpoint", args.endpoint)
      )
      .filter((q) => q.gte(q.field("timestamp"), windowStart))
      .collect();

    if (recentRequests.length >= args.limit) {
      return { allowed: false, retryAfter: args.windowMs };
    }

    // Log this request
    await ctx.db.insert("rateLimits", {
      userId: args.userId,
      endpoint: args.endpoint,
      timestamp: now,
    });

    return { allowed: true };
  },
});
```

Use in actions:

```typescript
const rateLimit = await ctx.runMutation(internal.rateLimits.checkRateLimit, {
  userId,
  endpoint: "generateImage",
  limit: 10,
  windowMs: 60000, // 1 minute
});

if (!rateLimit.allowed) {
  return { success: false, error: "Rate limit exceeded" };
}
```

## Deployment

### Development

```bash
npx convex dev
```

Changes are automatically synced to your development deployment.

### Production

```bash
npx convex deploy
```

This:

1. Validates your schema and functions
2. Deploys to your production environment
3. Runs any pending migrations

### Environment-Specific Deployment

```bash
# Deploy to production
npx convex deploy --prod

# Deploy to a specific project
npx convex deploy --project your-project-name
```

### View Logs

In the Convex Dashboard:

1. Go to your project
2. Click "Logs" in the sidebar
3. Filter by function name or log level

Or use the CLI:

```bash
npx convex logs
```

## Cost Optimization

1. **Validate input** before making API calls
2. **Cache results** when appropriate (store URLs, not regenerate)
3. **Use appropriate model sizes** (DALL-E 2 for drafts, DALL-E 3 for final)
4. **Implement rate limiting** to prevent abuse
5. **Monitor usage** in the Convex dashboard

## Hooks for Easy Usage

Use the pre-built hooks in `src/hooks/useConvexAI.ts`:

```typescript
import {
  useGenerateImage,
  useTextToSpeech,
  useTranscribe,
  useAnalyzeImage,
  useGenerateVideo,
  useChat,
  useCredits,
} from "@/hooks/useConvexAI";

function MyComponent() {
  const generateImage = useGenerateImage();
  const credits = useCredits();

  // Use directly
  const result = await generateImage({
    prompt: "A sunset",
    model: "dall-e-3",
  });
}
```

---

For more information:

- [Convex Documentation](https://docs.convex.dev/)
- [Convex Actions](https://docs.convex.dev/functions/actions)
- [OpenAI API](https://platform.openai.com/docs)
- [Replicate API](https://replicate.com/docs)
- [ElevenLabs API](https://elevenlabs.io/docs)
