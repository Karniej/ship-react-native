import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getCreditCost } from "../lib/creditCosts";

// ElevenLabs voice IDs mapping
const VOICE_IDS: Record<string, string> = {
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
  charlotte: "XB0fDUnXU5powFXDhCwa",
  matilda: "XrExE9yKIg1WjnnlVkGX",
  matthew: "Yko7PKs6NytG4IXzRBaV",
  james: "ZQe5CZNOzWyzPSCn5a3c",
  adam: "pNInz6obpgDQGcFmaJgB",
  nicole: "piTKgcLEGmPE4e6mEKli",
};

export const textToSpeech = action({
  args: {
    text: v.string(),
    voice: v.optional(v.string()),
    modelId: v.optional(v.string()),
    voiceSettings: v.optional(
      v.object({
        stability: v.optional(v.number()),
        similarityBoost: v.optional(v.number()),
        style: v.optional(v.number()),
        useSpeakerBoost: v.optional(v.boolean()),
      })
    ),
    outputFormat: v.optional(
      v.union(
        v.literal("mp3_44100_128"),
        v.literal("mp3_22050_32"),
        v.literal("pcm_16000"),
        v.literal("pcm_22050"),
        v.literal("pcm_24000"),
        v.literal("pcm_44100")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Validate text
    if (!args.text || args.text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    if (args.text.length > 5000) {
      throw new Error("Text is too long (max 5,000 characters)");
    }

    const creditsRequired = getCreditCost("speech", "elevenlabs");

    // Check rate limit
    const rateLimit = await ctx.runQuery(internal.rateLimits.checkRateLimit, {
      userId,
      endpoint: "ai:generate",
    });

    if (rateLimit.isLimited) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.`
      );
    }

    // Check credits against the actual cost that will be charged
    const credits = await ctx.runQuery(internal.credits.getCreditsInternal, { userId });
    if (!credits || credits.creditsRemaining < creditsRequired) {
      throw new Error(`Insufficient credits (requires ${creditsRequired})`);
    }

    // Record rate limit hit
    await ctx.runMutation(internal.rateLimits.recordRequest, {
      userId,
      endpoint: "ai:generate",
    });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    const voice = args.voice || "rachel";
    const voiceId = VOICE_IDS[voice] || voice;
    const modelId = args.modelId || "eleven_multilingual_v2";

    const voiceSettings = {
      stability: args.voiceSettings?.stability ?? 0.5,
      similarity_boost: args.voiceSettings?.similarityBoost ?? 0.75,
      style: args.voiceSettings?.style ?? 0,
      use_speaker_boost: args.voiceSettings?.useSpeakerBoost ?? true,
    };

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: args.text,
        model_id: modelId,
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    // Convert audio to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    // Log generation and deduct credits (only after the provider call succeeded)
    await ctx.runMutation(internal.credits.useCreditAndLog, {
      userId,
      provider: "elevenlabs",
      model: modelId,
      prompt: args.text.substring(0, 200),
      outputData: { voice, format: args.outputFormat || "mp3_44100_128" },
      contentType: "audio",
      creditsToUse: creditsRequired,
    });

    return {
      success: true,
      audioBase64: base64Audio,
      contentType: "audio/mpeg",
      voice,
      model: modelId,
    };
  },
});

// List available voices
export const getAvailableVoices = action({
  args: {},
  handler: async () => {
    return [
      { id: "rachel", name: "Rachel", gender: "female" },
      { id: "drew", name: "Drew", gender: "male" },
      { id: "clyde", name: "Clyde", gender: "male" },
      { id: "paul", name: "Paul", gender: "male" },
      { id: "domi", name: "Domi", gender: "female" },
      { id: "dave", name: "Dave", gender: "male" },
      { id: "fin", name: "Fin", gender: "male" },
      { id: "sarah", name: "Sarah", gender: "female" },
      { id: "antoni", name: "Antoni", gender: "male" },
      { id: "thomas", name: "Thomas", gender: "male" },
      { id: "charlie", name: "Charlie", gender: "male" },
      { id: "george", name: "George", gender: "male" },
      { id: "emily", name: "Emily", gender: "female" },
      { id: "elli", name: "Elli", gender: "female" },
      { id: "callum", name: "Callum", gender: "male" },
      { id: "charlotte", name: "Charlotte", gender: "female" },
      { id: "matilda", name: "Matilda", gender: "female" },
      { id: "matthew", name: "Matthew", gender: "male" },
      { id: "james", name: "James", gender: "male" },
      { id: "adam", name: "Adam", gender: "male" },
      { id: "nicole", name: "Nicole", gender: "female" },
    ];
  },
});
