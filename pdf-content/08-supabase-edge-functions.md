# Appendix A: Supabase Edge Functions

Keep your API keys safe by running sensitive code on the server.

---

## Why Edge Functions?

**Never expose API keys in your React Native app.** Anyone can decompile your app and steal them.

Edge Functions run on Supabase's servers, keeping your secrets safe:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Native   │────▶│  Edge Function   │────▶│   OpenAI API    │
│     (Client)    │     │   (Server-side)  │     │                 │
│                 │     │  API key hidden  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## Setup

### 1. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# npm (alternative)
npm install -g supabase
```

### 2. Initialize in Your Project

```bash
supabase init
```

This creates a `supabase/` folder:

```
supabase/
├── config.toml
└── functions/
```

### 3. Create Your First Function

```bash
supabase functions new generate-image
```

---

## Example: AI Image Generation

### Edge Function

```typescript
// supabase/functions/generate-image/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client with user's token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Get request body
    const { prompt } = await req.json();
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    // Call OpenAI API (key is server-side only!)
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "OpenAI API error");
    }

    // Save to database
    const imageUrl = data.data[0].url;

    await supabaseClient.from("generations").insert({
      user_id: user.id,
      prompt,
      result_url: imageUrl,
      type: "image",
    });

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

### Client Code

```typescript
// services/ai.service.ts
import { supabase } from "@/lib/supabase";

export async function generateImage(prompt: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("generate-image", {
    body: { prompt },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.imageUrl;
}
```

```typescript
// In your component
const handleGenerate = async () => {
  try {
    setLoading(true);
    const imageUrl = await generateImage(prompt);
    setImage(imageUrl);
  } catch (error) {
    Alert.alert("Error", error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## Example: Text Generation (Chat)

### Edge Function

```typescript
// supabase/functions/chat/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, model = "gpt-4o-mini" } = await req.json();

    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "OpenAI API error");
    }

    return new Response(
      JSON.stringify({
        message: data.choices[0].message.content,
        usage: data.usage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

---

## Example: Text-to-Speech (ElevenLabs)

### Edge Function

```typescript
// supabase/functions/text-to-speech/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, voiceId = "EXAVITQu4vr4xnSDxMaL" } = await req.json();

    const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || "ElevenLabs API error");
    }

    // Return audio as base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return new Response(JSON.stringify({ audio: base64Audio }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

---

## Setting Secrets

**Never commit API keys to git.** Use Supabase secrets:

```bash
# Set secrets (run once)
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ELEVENLABS_API_KEY=...
supabase secrets set REPLICATE_API_TOKEN=r8_...

# List secrets
supabase secrets list
```

---

## Deploying Functions

### Deploy Single Function

```bash
supabase functions deploy generate-image
```

### Deploy All Functions

```bash
supabase functions deploy
```

### Link to Your Project

```bash
# Link to remote project
supabase link --project-ref your-project-ref

# Deploy to production
supabase functions deploy --project-ref your-project-ref
```

---

## Local Development

### Start Local Supabase

```bash
supabase start
```

### Serve Functions Locally

```bash
supabase functions serve
```

### Test with cURL

```bash
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/generate-image' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"prompt":"a cute cat"}'
```

---

## Rate Limiting

Add rate limiting to protect your API costs:

```typescript
// supabase/functions/_shared/rateLimit.ts
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}
```

```typescript
// In your function
import { checkRateLimit } from "../_shared/rateLimit.ts";

// After auth check
if (!checkRateLimit(user.id, 10, 60000)) {
  throw new Error("Rate limit exceeded. Please try again later.");
}
```

---

## Credit System

Check user credits before expensive operations:

```typescript
// In your Edge Function
async function checkAndDeductCredits(
  supabase: SupabaseClient,
  userId: string,
  creditsNeeded: number
): Promise<boolean> {
  // Get current credits
  const { data: user } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", userId)
    .single();

  if (!user || user.credits < creditsNeeded) {
    return false;
  }

  // Deduct credits
  await supabase
    .from("user_credits")
    .update({ credits: user.credits - creditsNeeded })
    .eq("user_id", userId);

  return true;
}

// Usage
const hasCredits = await checkAndDeductCredits(supabaseClient, user.id, 1);
if (!hasCredits) {
  throw new Error("Insufficient credits. Please upgrade your plan.");
}
```

---

## Common Errors

| Error                 | Cause                 | Fix                 |
| --------------------- | --------------------- | ------------------- |
| `FunctionsRelayError` | Function crashed      | Check function logs |
| `FunctionsHttpError`  | Non-2xx response      | Check error message |
| `CORS error`          | Missing headers       | Add corsHeaders     |
| `Unauthorized`        | Invalid/missing token | Check auth header   |

### View Logs

```bash
# Local
supabase functions logs generate-image

# Production (in dashboard)
# Supabase Dashboard → Edge Functions → Logs
```

---

## Best Practices

1. **Always validate input** - Never trust client data
2. **Always check authentication** - Verify user tokens
3. **Use environment variables** - Never hardcode keys
4. **Add rate limiting** - Protect against abuse
5. **Log errors** - But never log sensitive data
6. **Return meaningful errors** - Help debugging
7. **Set reasonable timeouts** - Edge functions have 60s limit

---

**Official Docs:** [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
