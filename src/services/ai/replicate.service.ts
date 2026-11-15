import * as FileSystem from "expo-file-system/legacy";

import { API_MODE, API_BASE_URL } from "@/constants/api";

export type ReplicateModel = "flux-schnell" | "flux-pro" | "sdxl" | "sdxl-lightning" | string;

export interface ReplicateGenerateOptions {
  model?: ReplicateModel;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_outputs?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  /** Input image URI for image-to-image generation */
  image?: string;
  /** Strength of transformation (0-1, lower = closer to original) */
  strength?: number;
}

export interface ReplicateGenerateResult {
  success: boolean;
  url?: string;
  urls?: string[];
  model?: string;
  prompt?: string;
  error?: string;
}

export const replicateService = {
  /**
   * Convert a local image URI to base64
   */
  async imageToBase64(uri: string): Promise<string | null> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  },

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

      if (API_MODE === "convex") {
        // In Convex mode, use the Convex hooks (useReplicateGenerate) instead
        // This service method is kept for backwards compatibility
        console.warn("Use useReplicateGenerate hook in Convex mode for better integration");
        // Fall through to Expo API Routes as fallback
      }

      // Expo API Routes mode
      const response = await fetch(`${API_BASE_URL}/api/replicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Generation failed");
      }

      return data as ReplicateGenerateResult;
    } catch (error) {
      console.error("Replicate generate error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate image",
      };
    }
  },

  // Convenience methods for specific models
  async generateWithFlux(
    prompt: string,
    options: Omit<ReplicateGenerateOptions, "model"> = {}
  ): Promise<ReplicateGenerateResult> {
    return this.generate(prompt, { ...options, model: "flux-schnell" });
  },

  async generateWithSDXL(
    prompt: string,
    options: Omit<ReplicateGenerateOptions, "model"> = {}
  ): Promise<ReplicateGenerateResult> {
    return this.generate(prompt, { ...options, model: "sdxl" });
  },
};
