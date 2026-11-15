import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import Replicate from "replicate";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getCreditCost } from "../lib/creditCosts";

// Video model identifiers
const VIDEO_MODELS = {
  "runway-gen3":
    "tencent/hunyuan-video:847dfa8b01e739637fc76f480ede0c1d76408e1d694b830b5dfb8e547bf98405",
  pika: "pika-labs/pika:0c2f62a1b50daae20ab34d1f0bfbd90f5d5c5e8f3ef49870ac8293d0c0e1d9a3",
  "stable-video":
    "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
} as const;

export const generateVideo = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    duration: v.optional(v.number()),
    aspectRatio: v.optional(v.union(v.literal("16:9"), v.literal("9:16"), v.literal("1:1"))),
    fps: v.optional(v.number()),
    startImage: v.optional(v.string()), // Base64
    endImage: v.optional(v.string()), // Base64
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Validate prompt
    if (!args.prompt || args.prompt.trim().length === 0) {
      throw new Error("Prompt cannot be empty");
    }

    if (args.prompt.length > 1000) {
      throw new Error("Prompt exceeds maximum length of 1000 characters");
    }

    const modelKey = (args.model || "runway-gen3") as keyof typeof VIDEO_MODELS;
    const modelId = VIDEO_MODELS[modelKey] || args.model || VIDEO_MODELS["runway-gen3"];
    const creditsRequired = getCreditCost("video", modelKey);

    // Check rate limit (stricter for video)
    const rateLimit = await ctx.runQuery(internal.rateLimits.checkRateLimit, {
      userId,
      endpoint: "ai:video",
    });

    if (rateLimit.isLimited) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.`
      );
    }

    // Check credits against the actual cost that will be charged (video uses more credits)
    const credits = await ctx.runQuery(internal.credits.getCreditsInternal, { userId });
    if (!credits || credits.creditsRemaining < creditsRequired) {
      throw new Error(`Insufficient credits (video requires ${creditsRequired} credits)`);
    }

    // Record rate limit hit
    await ctx.runMutation(internal.rateLimits.recordRequest, {
      userId,
      endpoint: "ai:video",
    });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Build input
    const input: Record<string, unknown> = {
      prompt: args.prompt.trim(),
    };

    // Add duration if supported
    if (args.duration) {
      input.video_length = args.duration;
    }

    // Add aspect ratio if supported
    if (args.aspectRatio) {
      input.aspect_ratio = args.aspectRatio;
    }

    // Add FPS if supported
    if (args.fps) {
      input.fps = args.fps;
    }

    // Add start/end images for image-to-video
    if (args.startImage) {
      input.image = `data:image/png;base64,${args.startImage}`;
    }

    if (args.endImage) {
      input.end_image = `data:image/png;base64,${args.endImage}`;
    }

    const output = await replicate.run(modelId as `${string}/${string}`, { input });

    // Handle different output formats
    let videoUrl: string;

    if (typeof output === "string") {
      videoUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      videoUrl = output[0];
    } else if (typeof output === "object" && output !== null && "video" in output) {
      videoUrl = (output as { video: string }).video;
    } else {
      throw new Error("Video generation failed - unexpected output format");
    }

    // Log generation and deduct credits
    await ctx.runMutation(internal.credits.useCreditAndLog, {
      userId,
      provider: "video",
      model: modelKey,
      prompt: args.prompt,
      outputUrl: videoUrl,
      outputData: {
        duration: args.duration || 4,
        aspectRatio: args.aspectRatio || "16:9",
      },
      contentType: "video",
      creditsToUse: creditsRequired,
    });

    return {
      success: true,
      url: videoUrl,
      model: modelKey,
      prompt: args.prompt,
      duration: args.duration || 4,
    };
  },
});

export const checkVideoStatus = action({
  args: {
    jobId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    try {
      const prediction = await replicate.predictions.get(args.jobId);

      if (prediction.status === "succeeded") {
        const output = prediction.output;
        const videoUrl =
          typeof output === "string"
            ? output
            : Array.isArray(output)
              ? output[0]
              : (output as { video?: string })?.video;

        return {
          success: true,
          status: "completed",
          url: videoUrl,
        };
      } else if (prediction.status === "failed") {
        return {
          success: false,
          status: "failed",
          error: prediction.error || "Video generation failed",
        };
      } else {
        return {
          success: true,
          status: prediction.status,
        };
      }
    } catch (error) {
      return {
        success: false,
        status: "error",
        error: error instanceof Error ? error.message : "Failed to check status",
      };
    }
  },
});
