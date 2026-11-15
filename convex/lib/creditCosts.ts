/**
 * Credit cost table — single source of truth.
 *
 * The server is authoritative: every Convex action in `convex/ai/*` uses
 * `getCreditCost()` for its pre-flight balance check and passes the same
 * value as `creditsToUse` to `internal.credits.useCreditAndLog`, so the
 * amount checked is always the amount charged.
 *
 * The client config (`src/constants/generations.ts`) re-exports this table,
 * so cost previews and `canGenerate()` on the client always match what the
 * server deducts. Edit costs HERE, not in the client file.
 *
 * This module must stay dependency-free (no `_generated` imports, no React
 * Native globals) — it is bundled by both Convex and Metro.
 */

/**
 * Cost in credits for each generation type, keyed by model id.
 * Unknown models fall back to the type's `default`.
 */
export const CREDIT_COSTS = {
  /** Image generation costs */
  image: {
    /** OpenAI DALL-E 3 - highest quality */
    "dall-e-3": 2,
    /** OpenAI DALL-E 2 - faster, lower cost */
    "dall-e-2": 1,
    /** Replicate Flux Schnell - fast generation */
    "flux-schnell": 1,
    /** Replicate Flux Pro - premium quality */
    "flux-pro": 2,
    /** Replicate SDXL - high quality */
    sdxl: 2,
    /** Replicate SDXL Lightning - fast 4-step generation */
    "sdxl-lightning": 1,
    /** Default cost for unknown models */
    default: 1,
  },

  /** Video generation costs (higher due to compute requirements) */
  video: {
    /** Runway Gen-3 */
    "runway-gen3": 5,
    /** Pika Labs */
    pika: 4,
    /** Stable Video Diffusion */
    "stable-video": 3,
    /** Default cost for unknown models */
    default: 4,
  },

  /** Text-to-speech costs */
  speech: {
    /** ElevenLabs - high quality voices */
    elevenlabs: 1,
    /** Default cost for unknown providers */
    default: 1,
  },

  /** Audio transcription costs */
  transcription: {
    /** OpenAI Whisper */
    "whisper-1": 1,
    /** Whisper Large v3 */
    "whisper-large-v3": 2,
    /** Default cost for unknown models */
    default: 1,
  },

  /** Vision/Image analysis costs */
  vision: {
    /** GPT-4 Vision */
    "gpt-4-vision": 2,
    /** GPT-4o (multimodal) */
    "gpt-4o": 1,
    /** Claude 3 Opus */
    "claude-3-opus": 3,
    /** Default cost for unknown models */
    default: 1,
  },

  /** Chat completion costs */
  chat: {
    /** Default cost for all chat models */
    default: 1,
  },
};

export type CreditCostType = keyof typeof CREDIT_COSTS;

/**
 * Pure cost lookup: the credit cost for a generation type + model.
 * No dev-mode logic here — server actions always charge the real cost;
 * the client wrapper in `src/constants/generations.ts` layers DEV_MODE on top.
 */
export function getCreditCost(type: CreditCostType, model?: string): number {
  const typeCosts = CREDIT_COSTS[type];
  if (!typeCosts) return 1;

  if (model && model in typeCosts) {
    return typeCosts[model as keyof typeof typeCosts] as number;
  }

  return typeCosts.default;
}
