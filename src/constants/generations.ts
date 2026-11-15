/**
 * ============================================================================
 * GENERATIONS & CREDITS CONFIGURATION
 * ============================================================================
 *
 * This file controls how the AI generation system works, including:
 * - Credit costs for each generation type
 * - Free tier limits
 * - Development mode settings
 * - Model configurations
 *
 * QUICK START FOR DEVELOPERS:
 * ---------------------------
 * 1. Set DEV_MODE.enabled = true for unlimited generations during development
 * 2. Customize CREDIT_COSTS in convex/lib/creditCosts.ts to match your pricing model
 * 3. Adjust FREE_TIER settings for your free users
 * 4. Configure MODELS for your AI providers
 *
 * HOW CREDITS WORK:
 * -----------------
 * - Each user starts with FREE_TIER.initialCredits
 * - Each generation type costs a specific number of credits (see CREDIT_COSTS)
 * - Premium subscribers get unlimited generations (bypass credit system)
 * - In development mode, all credit checks are bypassed
 *
 * DATABASE REQUIREMENTS:
 * ----------------------
 * In Convex mode, this system uses the 'userCredits' table:
 * - userId: string
 * - creditsRemaining: number
 * - creditsUsedTotal: number
 * - lastRefillAt: number (timestamp)
 *
 * See /convex/schema.ts for the table schema.
 */

import { CREDIT_COSTS, getCreditCost as getBaseCreditCost } from "../../convex/lib/creditCosts";

// ============================================================================
// DEVELOPMENT MODE
// ============================================================================

/**
 * Development mode configuration
 *
 * When enabled, this bypasses all credit checks and gives unlimited generations.
 * IMPORTANT: Make sure to disable this in production!
 *
 * You can also use environment variables:
 * - Set EXPO_PUBLIC_DEV_MODE=true in your .env file
 */
export const DEV_MODE = {
  /**
   * Enable/disable development mode
   *
   * When true:
   * - All credit checks are bypassed
   * - Users have unlimited generations
   * - Useful for testing without worrying about credits
   *
   * Set to false for production!
   */
  enabled: __DEV__ || process.env.EXPO_PUBLIC_DEV_MODE === "true",

  /**
   * Show a banner in the app when dev mode is active
   * Helps remind you that credits are bypassed
   */
  showDevBanner: true,

  /**
   * Log generation attempts to console in dev mode
   */
  logGenerations: true,
};

// ============================================================================
// CREDIT COSTS
// ============================================================================

/**
 * Cost in credits for each generation type
 *
 * The table itself lives in `convex/lib/creditCosts.ts` — the single source
 * of truth shared by the Convex actions (which check and charge these
 * amounts) and this client config (which uses them for cost previews and
 * `canGenerate()` checks). Edit costs there, not here.
 */
export { CREDIT_COSTS };

// ============================================================================
// FREE TIER CONFIGURATION
// ============================================================================

/**
 * Free tier settings for non-premium users
 */
export const FREE_TIER = {
  /**
   * Number of credits new users receive when they sign up
   */
  initialCredits: 10,

  /**
   * Daily credit refill amount (0 to disable)
   * Users get this many credits added each day, up to maxCredits
   */
  dailyRefill: 0,

  /**
   * Maximum credits a free user can accumulate
   * Prevents hoarding if daily refills are enabled
   */
  maxCredits: 50,

  /**
   * Whether to show upgrade prompts when credits are low
   */
  showUpgradePrompts: true,

  /**
   * Credit threshold to show "low credits" warning
   */
  lowCreditsThreshold: 3,

  /**
   * Whether free users can use all models or just basic ones
   */
  restrictModels: false,

  /**
   * Models restricted from free users (if restrictModels is true)
   */
  restrictedModels: ["dall-e-3", "runway-gen3", "claude-3-opus"],
};

// ============================================================================
// PREMIUM CONFIGURATION
// ============================================================================

/**
 * Premium subscriber settings
 */
export const PREMIUM = {
  /**
   * Premium users bypass all credit checks
   */
  unlimitedGenerations: true,

  /**
   * Access to all models including premium ones
   */
  allModelsAccess: true,

  /**
   * Priority processing (passed to backend)
   */
  priorityProcessing: true,

  /**
   * Higher rate limits for premium users
   */
  rateLimit: {
    requestsPerMinute: 30,
    requestsPerHour: 500,
  },
};

// ============================================================================
// MODEL CONFIGURATIONS
// ============================================================================

/**
 * Available AI models and their configurations
 *
 * This defines all models available in the app.
 * Models can be enabled/disabled and marked as premium-only.
 */
export const MODELS = {
  image: [
    {
      id: "dall-e-3",
      name: "DALL-E 3",
      provider: "openai",
      description: "Highest quality, best prompt understanding",
      premium: false,
      enabled: true,
    },
    {
      id: "dall-e-2",
      name: "DALL-E 2",
      provider: "openai",
      description: "Fast generation, good quality",
      premium: false,
      enabled: true,
    },
    {
      id: "flux-schnell",
      name: "Flux Schnell",
      provider: "replicate",
      description: "Very fast, good for iteration",
      premium: false,
      enabled: true,
    },
    {
      id: "sdxl",
      name: "Stable Diffusion XL",
      provider: "replicate",
      description: "Highly customizable, artistic styles",
      premium: false,
      enabled: true,
    },
  ],

  video: [
    {
      id: "runway-gen3",
      name: "Runway Gen-3",
      provider: "runway",
      description: "State-of-the-art video generation",
      premium: true,
      enabled: true,
    },
    {
      id: "pika",
      name: "Pika Labs",
      provider: "pika",
      description: "Creative video generation",
      premium: false,
      enabled: true,
    },
    {
      id: "stable-video",
      name: "Stable Video",
      provider: "stability",
      description: "Image-to-video generation",
      premium: false,
      enabled: true,
    },
  ],

  speech: [
    {
      id: "eleven_multilingual_v2",
      name: "ElevenLabs Multilingual",
      provider: "elevenlabs",
      description: "Natural multilingual voices",
      premium: false,
      enabled: true,
    },
  ],

  transcription: [
    {
      id: "whisper-1",
      name: "Whisper",
      provider: "openai",
      description: "Fast and accurate transcription",
      premium: false,
      enabled: true,
    },
    {
      id: "whisper-large-v3",
      name: "Whisper Large v3",
      provider: "openai",
      description: "Highest accuracy transcription",
      premium: true,
      enabled: true,
    },
  ],

  vision: [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      provider: "openai",
      description: "Fast multimodal analysis",
      premium: false,
      enabled: true,
    },
    {
      id: "gpt-4-vision",
      name: "GPT-4 Vision",
      provider: "openai",
      description: "Detailed image analysis",
      premium: false,
      enabled: true,
    },
    {
      id: "claude-3-opus",
      name: "Claude 3 Opus",
      provider: "anthropic",
      description: "Advanced reasoning and analysis",
      premium: true,
      enabled: true,
    },
  ],
};

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Rate limiting configuration to prevent abuse
 */
export const RATE_LIMITS = {
  /** Requests per minute for free users */
  freeUserRPM: 5,

  /** Requests per hour for free users */
  freeUserRPH: 30,

  /** Requests per minute for premium users */
  premiumUserRPM: 30,

  /** Requests per hour for premium users */
  premiumUserRPH: 500,

  /** Cooldown period after hitting rate limit (seconds) */
  cooldownPeriod: 60,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the credit cost for a specific generation type and model
 */
export function getCreditCost(type: keyof typeof CREDIT_COSTS, model?: string): number {
  if (DEV_MODE.enabled) return 0;
  return getBaseCreditCost(type, model);
}

/**
 * Check if a user can generate (has enough credits or is premium)
 */
export function canGenerate(
  credits: number,
  isPremium: boolean,
  type: keyof typeof CREDIT_COSTS,
  model?: string
): { allowed: boolean; reason?: string; cost: number } {
  // Dev mode bypasses all checks
  if (DEV_MODE.enabled) {
    return { allowed: true, cost: 0 };
  }

  // Premium users always allowed
  if (isPremium && PREMIUM.unlimitedGenerations) {
    return { allowed: true, cost: 0 };
  }

  const cost = getCreditCost(type, model);

  if (credits >= cost) {
    return { allowed: true, cost };
  }

  return {
    allowed: false,
    reason: `Not enough credits. Need ${cost}, have ${credits}.`,
    cost,
  };
}

/**
 * Check if a model is available for a user
 */
export function isModelAvailable(
  modelId: string,
  type: keyof typeof MODELS,
  isPremium: boolean
): boolean {
  // Dev mode allows all models
  if (DEV_MODE.enabled) return true;

  // Premium users can access all models
  if (isPremium && PREMIUM.allModelsAccess) return true;

  const models = MODELS[type];
  const model = models.find((m) => m.id === modelId);

  if (!model) return false;
  if (!model.enabled) return false;
  if (model.premium && !isPremium) return false;

  // Check restricted models for free users
  if (FREE_TIER.restrictModels && FREE_TIER.restrictedModels.includes(modelId)) {
    return false;
  }

  return true;
}

/**
 * Get available models for a generation type
 */
export function getAvailableModels(
  type: keyof typeof MODELS,
  isPremium: boolean
): typeof MODELS.image {
  const allModels = MODELS[type];

  // Dev mode or premium: return all enabled models
  if (DEV_MODE.enabled || (isPremium && PREMIUM.allModelsAccess)) {
    return allModels.filter((m) => m.enabled);
  }

  // Free users: filter out premium-only and restricted models
  return allModels.filter((m) => {
    if (!m.enabled) return false;
    if (m.premium) return false;
    if (FREE_TIER.restrictModels && FREE_TIER.restrictedModels.includes(m.id)) {
      return false;
    }
    return true;
  });
}

/**
 * Log generation in dev mode
 */
export function logGeneration(type: string, model: string, prompt: string): void {
  if (DEV_MODE.enabled && DEV_MODE.logGenerations) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🧪 DEV MODE GENERATION                                      ║
╠══════════════════════════════════════════════════════════════╣
║  Type: ${type.padEnd(54)}║
║  Model: ${model.padEnd(53)}║
║  Prompt: ${prompt.substring(0, 50).padEnd(52)}║
║  Credits: BYPASSED (Dev Mode)                                ║
╚══════════════════════════════════════════════════════════════╝
    `);
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type GenerationType = keyof typeof CREDIT_COSTS;
export type ImageModel = (typeof MODELS.image)[number]["id"];
export type VideoModel = (typeof MODELS.video)[number]["id"];
export type SpeechModel = (typeof MODELS.speech)[number]["id"];
export type TranscriptionModel = (typeof MODELS.transcription)[number]["id"];
export type VisionModel = (typeof MODELS.vision)[number]["id"];
