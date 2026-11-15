# Expo API Routes Backend Option

> Historical planning document: this file was written during the earlier Supabase-to-Expo-API-Routes transition.
> It is not the current source of truth for the repo architecture.
> Use `README.md`, `docs/ARCHITECTURE.md`, and `docs/SETUP_GUIDE.md` for the current backend model.

## Overview

Add a setup wizard option allowing users to choose between two backend modes:

1. **Supabase (Full)** - Current setup with auth, database, rate limiting, credits
2. **Expo API Routes (Simple Proxy)** - API key proxy, premium features gated by RevenueCat

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Setup Wizard                            │
│                                                             │
│  Step 6: Backend Mode                                       │
│                                                             │
│  1. Supabase (Recommended)                                  │
│     - Full auth, database, rate limiting, credits           │
│                                                             │
│  2. Expo API Routes (Simple Proxy)                          │
│     - Just hides API keys server-side                       │
│     - Premium features gated by RevenueCat on client        │
│     - Deploy to EAS Hosting, Vercel, or Netlify             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Design Decisions

| Decision              | Choice                              | Rationale                             |
| --------------------- | ----------------------------------- | ------------------------------------- |
| Deployment options    | User chooses (EAS, Vercel, Netlify) | Flexibility for different preferences |
| AI services supported | All 6 services                      | Full parity with Supabase mode        |
| Switching mechanism   | Build-time config                   | Simpler, no runtime overhead          |
| Supabase files        | Keep in place                       | Easy to switch later if needed        |
| Premium gating        | Client-side RevenueCat only         | Simplest for proxy-only use case      |

## Files to Create

### 1. `constants/api.ts`

```ts
export type ApiMode = "supabase" | "expo-api-routes";
export const API_MODE: ApiMode = "supabase"; // Set by setup script
```

### 2. API Routes (`app/api/`)

| File                    | Purpose                       |
| ----------------------- | ----------------------------- |
| `chat+api.ts`           | Chat completions (OpenAI GPT) |
| `vision+api.ts`         | Image analysis (GPT-4 Vision) |
| `transcribe+api.ts`     | Audio transcription (Whisper) |
| `text-to-speech+api.ts` | TTS (ElevenLabs)              |
| `video+api.ts`          | Video generation (Replicate)  |

Existing files:

- `health+api.ts` - No changes needed
- `generate+api.ts` - Already handles image generation

### 3. Environment Variables (Server-side)

Add to `.env.example`:

```
# Server-side only (for Expo API Routes mode)
# Set these in your deployment environment, NOT with EXPO_PUBLIC_ prefix
# OPENAI_API_KEY=sk-...
# REPLICATE_API_TOKEN=r8_...
# ELEVENLABS_API_KEY=...
```

## Files to Modify

### 1. `scripts/setup.js`

Add new step between current Step 5 (Authentication) and Step 6 (Supabase):

```
Step 6/13: Backend Mode

  1. Supabase (Recommended)
  2. Expo API Routes (Simple Proxy)
```

If Expo API Routes selected, ask deployment platform:

```
  1. EAS Hosting (Recommended)
  2. Vercel
  3. Netlify
  4. Other / Decide later
```

Skip Supabase configuration step if Expo API Routes selected.

### 2. Service Files

Pattern for each service:

```ts
import { API_MODE } from "@/constants/api";
import { supabase } from "@/utils/supabase";

async function callService(params) {
  if (API_MODE === "supabase") {
    return supabase.functions.invoke("function-name", { body: params });
  } else {
    const response = await fetch("/api/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return response.json();
  }
}
```

Services to update:

- `services/ai/chat.service.ts`
- `services/ai/openai.service.ts`
- `services/ai/vision.service.ts`
- `services/ai/transcription.service.ts`
- `services/ai/tts.service.ts`
- `services/ai/replicate.service.ts`

### 3. Setup Summary Output

Add to final summary:

```
Backend:     ${backendMode === 'supabase' ? 'Supabase' : 'Expo API Routes'}
${backendMode === 'expo-api-routes' ? `Deploy to: ${deploymentPlatform}` : ''}
```

## Deployment Instructions

Show at end of setup based on platform choice:

### EAS Hosting

```
1. npm install -g eas-cli
2. npx eas deploy
3. Set env vars in EAS dashboard
```

### Vercel

```
1. npm install -g vercel
2. vercel
3. vercel env add OPENAI_API_KEY
```

### Netlify

```
1. npm install -g netlify-cli
2. netlify deploy --prod
3. Set env vars in dashboard
```

## Implementation Order

1. Create `constants/api.ts`
2. Create all new API route files
3. Update `.env.example`
4. Modify setup script (add backend mode step)
5. Update all service files with conditional logic
6. Test both modes
