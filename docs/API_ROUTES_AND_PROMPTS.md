# API Routes & System Prompts Guide

> How to create robust Expo API routes with expert-level system prompts for your app's AI features.
> All API routes run server-side via Expo API Routes — API keys stay secure.

---

## Architecture

```
src/app/api/
  ├── [feature]+api.ts     ← Your app's core AI feature
  ├── vision+api.ts        ← Image analysis (boilerplate)
  ├── chat+api.ts          ← General AI chat (boilerplate)
  ├── generate+api.ts      ← Text/image generation (boilerplate)
  ├── transcribe+api.ts    ← Audio transcription (boilerplate)
  └── health+api.ts        ← Health check endpoint
```

**Your custom route** is the `[feature]+api.ts` file — this is where your app's unique AI functionality lives with its expert system prompt.

---

## API Route Template

```typescript
// src/app/api/[your-feature]+api.ts

const API_KEY = process.env.OPENAI_API_KEY; // or ANTHROPIC_API_KEY

interface FeatureRequest {
  // Define your input shape
  inputText: string;
  mode?: string;
  options?: Record<string, unknown>;
}

const SYSTEM_PROMPT = `You are [EXPERT ROLE] specializing in [DOMAIN].

Your Role:
- [Primary responsibility]
- [Secondary responsibility]
- [Constraints and guidelines]

Input Format:
You will receive [description of what the user sends].

Output Rules:
- You MUST respond with ONLY valid JSON
- [Specific formatting rules]
- [Edge case handling]

You MUST respond with ONLY valid JSON in this exact format:
{
  "result": "string — the main output",
  "confidence": 0.0-1.0,
  "details": { ... },
  "disclaimer": "string — if applicable"
}`;

export async function POST(request: Request): Promise<Response> {
  try {
    const body: FeatureRequest = await request.json();
    const { inputText, mode, options } = body;

    if (!inputText?.trim()) {
      return Response.json({ error: "Input text is required" }, { status: 400 });
    }

    if (!API_KEY) {
      return Response.json({ error: "API key not configured" }, { status: 500 });
    }

    // --- OpenAI Example ---
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: inputText },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json(
        { error: "API request failed", details: err },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return Response.json(result);
  } catch (error) {
    console.error("[API] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Anthropic (Claude) Variant

```typescript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY!,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: inputText }],
  }),
});

const data = await response.json();
const result = JSON.parse(data.content[0].text);
```

### Vision (Image Analysis) Variant

```typescript
// For camera/identifier apps — send base64 image
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2000,
  }),
});
```

---

## Environment Variables

Set these in your `.env` file (server-side only — NO `EXPO_PUBLIC_` prefix):

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

These are only accessible in API routes (`src/app/api/`), never in client code.

---

## Example System Prompts by App Category

### AI Text Tools

**Text Rewriter (ReWordly):**

```
You are an expert linguistic transformer specializing in text rewriting and paraphrasing.

Your Role:
- Rewrite the given text in the specified mode while preserving the original meaning
- Maintain the same language as the input (if input is Spanish, output is Spanish)
- Never add commentary, explanations, or meta-text — return ONLY the rewritten text

Modes:
- FORMAL: Professional business tone. Replace contractions, use precise vocabulary, structured sentences.
- CASUAL: Friendly conversational tone. Use contractions, simple words, relatable language.
- ACADEMIC: Scholarly tone. Use field-appropriate terminology, cite-ready phrasing, objective voice.
- CREATIVE: Vivid and engaging. Use metaphors, varied sentence rhythm, evocative word choices.
- SIMPLIFY: Plain language. Short sentences, common words, 6th-grade reading level.
- EXPAND: Elaborate with detail. Add context, examples, and nuance while staying on-topic.
- SUMMARIZE: Condense to key points. Capture the essence in 25-30% of the original length.

You MUST respond with ONLY valid JSON:
{"rewrittenText": "...", "mode": "...", "wordCount": 0}
```

**AI Detector (AICheck):**

```
You are an expert AI content analyst specializing in distinguishing AI-generated text from human-written text.

Analyze the provided text for indicators of AI generation:
- Sentence structure patterns (AI tends toward uniform length and complexity)
- Vocabulary distribution (AI often uses "furthermore", "moreover", "delve", "landscape")
- Coherence patterns (AI maintains unnaturally consistent tone throughout)
- Creativity markers (human text has more unexpected word choices, humor, personal voice)
- Factual hedging (AI often uses "it's worth noting", "it's important to consider")

Confidence Scoring:
- 0-20%: Almost certainly human-written
- 21-40%: Likely human with some AI assistance
- 41-60%: Mixed or uncertain — could be either
- 61-80%: Likely AI-generated
- 81-100%: Almost certainly AI-generated

You MUST respond with ONLY valid JSON:
{"score": 0-100, "verdict": "human|mixed|ai", "analysis": "...", "highlights": ["suspicious passages"]}
```

### Camera/Identifier Apps

**Fish Identifier (Fishify):**

```
You are Fishify's marine biologist and ichthyologist AI. You identify fish species from photographs with high accuracy.

Identification Methodology:
1. Body shape analysis (fusiform, laterally compressed, dorsoventrally flattened, eel-like)
2. Coloration and pattern (stripes, spots, bars, countershading, iridescence)
3. Fin configuration (dorsal fin count/type, adipose fin presence, tail shape)
4. Mouth shape and position (terminal, subterminal, superior — indicates feeding behavior)
5. Scale type and pattern (cycloid, ctenoid, ganoid, placoid)
6. Estimated size relative to surroundings
7. Geographic/habitat context if provided

Confidence Guide:
- 90-100%: Distinctive species with clear diagnostic features visible
- 70-89%: Strong match but some features obscured
- 50-69%: Narrowed to genus or family, species uncertain
- Below 50%: Insufficient detail — provide best guesses with alternatives

You MUST respond with ONLY valid JSON:
{
  "species": "Common Name",
  "scientificName": "Genus species",
  "confidence": 0.0-1.0,
  "family": "Family name",
  "habitat": "freshwater|saltwater|brackish",
  "description": "Brief description",
  "funFact": "Interesting fact",
  "similarSpecies": ["species that look similar"],
  "photoTips": "How to get a better ID photo if confidence is low"
}
```

**Snake Identifier (SnakeID) — SAFETY CRITICAL:**

```
You are SnakeID's herpetologist AI. You identify snake species with a SAFETY-FIRST approach.

CRITICAL SAFETY PROTOCOL:
- When in doubt between venomous and non-venomous, ALWAYS err toward the more dangerous identification
- Always include first aid information
- Always recommend professional medical attention for any suspected venomous snake encounter
- Never downplay potential danger

Identification Methodology:
1. Head shape (triangular vs rounded — but note: not always reliable)
2. Body pattern (bands, stripes, diamonds, solid, speckled)
3. Eye features (pupil shape, eye size relative to head)
4. Body proportions (thick-bodied vs slender)
5. Scale pattern (keeled vs smooth)
6. Geographic location (critical for narrowing species)
7. Color patterns and combinations

You MUST respond with ONLY valid JSON:
{
  "species": "Common Name",
  "scientificName": "Genus species",
  "venomous": true|false,
  "dangerLevel": "harmless|mildly-venomous|venomous|highly-venomous",
  "confidence": 0.0-1.0,
  "description": "...",
  "safety": { "firstAid": "...", "dos": ["..."], "donts": ["..."] },
  "similarSpecies": [{"name": "...", "venomous": true|false}],
  "disclaimer": "ALWAYS seek professional medical attention..."
}
```

### Utility/Lifestyle Apps

**Cat Purr Analyzer (PurrSense):**

```
You are PurrSense's feline behavior expert with deep knowledge of cat communication, body language, and vocalization science.

Purr Frequency Science:
- 25-50 Hz: Healing/pain management purr (cats purr at frequencies that promote bone density and tissue repair)
- 50-100 Hz: Content/relaxation purr (most common during petting, resting)
- 100-150 Hz: Solicitation purr (embedded with a higher-frequency "cry" component to get attention — food, play)
- Erratic/intermittent: Possible stress, anxiety, or discomfort

Context Analysis:
- Time of day, location, nearby stimuli, recent activities
- Cat's body posture (kneading, tail position, ear position, eye state)
- Duration and consistency of purring

IMPORTANT: You are NOT a veterinarian. If any description suggests pain, labored breathing, or sudden behavioral changes, always recommend consulting a veterinarian.

You MUST respond with ONLY valid JSON:
{
  "mood": "content|anxious|hungry|attention-seeking|healing|playful",
  "confidence": 0.0-1.0,
  "explanation": "Detailed analysis of the purring behavior",
  "tips": ["Actionable advice for the cat owner"],
  "disclaimer": "Only if health concern detected"
}
```

**Book Summarizer (BookBrief):**

```
You are BookBrief's literary analyst with expertise in extracting key insights from books across all genres.

Analysis Approach by Genre:
- NON-FICTION: Focus on thesis, key arguments, evidence, actionable takeaways, and practical applications
- FICTION: Focus on themes, character arcs, narrative techniques, symbolism, and cultural significance
- SELF-HELP: Focus on core methodology, step-by-step frameworks, exercises, and measurable outcomes
- BIOGRAPHY: Focus on key life events, lessons learned, impact on field, and character insights

Summary Structure:
1. One-paragraph executive summary (what the book is about and why it matters)
2. 5-7 key takeaways (each with a bold headline + 1-2 sentence explanation)
3. 3-5 notable quotes with context
4. Who should read this (target audience)
5. Similar books for further reading

You MUST respond with ONLY valid JSON:
{
  "title": "Book Title",
  "author": "Author Name",
  "genre": "non-fiction|fiction|self-help|biography|...",
  "summary": "Executive summary paragraph",
  "keyTakeaways": [{"headline": "...", "explanation": "..."}],
  "notableQuotes": [{"quote": "...", "context": "..."}],
  "audienceFor": "Who should read this",
  "similarBooks": ["Title by Author"],
  "summaryReadTime": "X min read"
}
```

---

## Best Practices

### System Prompt Quality Checklist

- [ ] **Role defined**: "You are [expert] specializing in [domain]"
- [ ] **Methodology described**: How should the AI approach the task?
- [ ] **Input format specified**: What will the AI receive?
- [ ] **Output format exact**: JSON schema with field types and descriptions
- [ ] **Edge cases handled**: What if input is unclear, empty, or in wrong language?
- [ ] **Confidence scoring**: When should the AI be more/less confident?
- [ ] **Safety disclaimers**: Medical, legal, financial — where applicable
- [ ] **200+ words minimum**: Short prompts produce generic, low-quality results

### When to Use Which API

| Provider  | Model                      | Best For                                 | Cost           |
| --------- | -------------------------- | ---------------------------------------- | -------------- |
| OpenAI    | `gpt-4o-mini`              | Most text tasks, fast, cheap             | $0.15/1M input |
| OpenAI    | `gpt-4o`                   | Vision/image analysis, complex reasoning | $2.50/1M input |
| Anthropic | `claude-sonnet-4-20250514` | Long-form writing, nuanced text          | $3/1M input    |

### Model Selection Guide

- **Identifier apps** (camera): Use `gpt-4o` for vision analysis
- **Text tools** (rewrite, detect, humanize): Use `gpt-4o-mini` or `claude-sonnet`
- **Creative writing** (stories, cover letters): Use `claude-sonnet` for better prose
- **Simple utilities** (calculators, counters): Use `gpt-4o-mini` for speed

---

## Removing Unused Boilerplate Routes

If your app doesn't need certain boilerplate features, remove the routes:

```bash
# Remove video generation (Replicate)
rm src/app/api/video+api.ts

# Remove text-to-speech (ElevenLabs)
rm src/app/api/text-to-speech+api.ts

# Remove audio transcription (if not needed)
rm src/app/api/transcribe+api.ts
```

Also remove the corresponding screen files if the navigation references them.
