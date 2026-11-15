import * as FileSystem from "expo-file-system/legacy";

import { API_MODE, API_BASE_URL } from "@/constants/api";

export type VideoModel = "runway-gen3" | "pika" | "stable-video" | string;

export interface GenerateVideoOptions {
  model?: VideoModel;
  duration?: number; // in seconds
  aspectRatio?: "16:9" | "9:16" | "1:1";
  fps?: number;
  /** Start frame image URI (for image-to-video) */
  startImage?: string;
  /** End frame image URI (for interpolation between frames) */
  endImage?: string;
}

export interface GenerateVideoResult {
  success: boolean;
  url?: string;
  model?: string;
  prompt?: string;
  duration?: number;
  error?: string;
}

export const videoService = {
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

  async generateVideo(
    prompt: string,
    options: GenerateVideoOptions = {}
  ): Promise<GenerateVideoResult> {
    try {
      // Validate input
      if (!prompt || typeof prompt !== "string") {
        return { success: false, error: "Invalid prompt provided" };
      }

      if (prompt.length > 1000) {
        return {
          success: false,
          error: "Prompt exceeds maximum length of 1000 characters",
        };
      }

      // Convert images to base64 if provided
      let startImageBase64: string | null = null;
      let endImageBase64: string | null = null;

      if (options.startImage) {
        startImageBase64 = await this.imageToBase64(options.startImage);
        if (!startImageBase64) {
          return { success: false, error: "Failed to process start image" };
        }
      }

      if (options.endImage) {
        endImageBase64 = await this.imageToBase64(options.endImage);
        if (!endImageBase64) {
          return { success: false, error: "Failed to process end image" };
        }
      }

      // Build request body - only include image fields if images are provided
      const requestBody: Record<string, unknown> = {
        prompt: prompt.trim(),
        model: options.model || "runway-gen3",
        duration: options.duration || 4,
        aspect_ratio: options.aspectRatio || "16:9",
        fps: options.fps || 24,
      };

      // Only add image fields if images are provided (text-to-video vs image-to-video)
      if (startImageBase64) {
        requestBody.start_image = startImageBase64;
      }
      if (endImageBase64) {
        requestBody.end_image = endImageBase64;
      }

      if (API_MODE === "convex") {
        // In Convex mode, use the Convex hooks (useGenerateVideo) instead
        // This service method is kept for backwards compatibility
        console.warn("Use useGenerateVideo hook in Convex mode for better integration");
        // Fall through to Expo API Routes as fallback
      }

      // Expo API Routes mode
      const response = await fetch(`${API_BASE_URL}/api/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!data.success) {
        // Handle specific error types
        if (data.error?.includes("rate limit")) {
          return {
            success: false,
            error: "Rate limit exceeded. Please try again later.",
          };
        }
        if (data.error?.includes("insufficient credits")) {
          return {
            success: false,
            error: "Insufficient credits for video generation.",
          };
        }
        throw new Error(data.error || "Video generation failed");
      }

      return {
        success: true,
        url: data.url,
        model: data.model || options.model || "runway-gen3",
        prompt,
        duration: data.duration || options.duration || 4,
      };
    } catch (error) {
      console.error("Video generation error:", error);

      // Provide user-friendly error messages
      let errorMessage = "Failed to generate video";
      if (error instanceof Error) {
        if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. Video generation takes time, please try again.";
        } else {
          errorMessage = error.message;
        }
      }

      return { success: false, error: errorMessage };
    }
  },

  /**
   * Check the status of a video generation job (for async processing)
   */
  async checkVideoStatus(jobId: string): Promise<GenerateVideoResult> {
    try {
      if (API_MODE === "convex") {
        // In Convex mode, video status is tracked via reactive queries
        console.warn("Use Convex reactive queries to track video status in Convex mode");
      }

      // Expo API Routes mode
      const response = await fetch(`${API_BASE_URL}/api/video/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to check video status");
      }

      return data as GenerateVideoResult;
    } catch (error) {
      console.error("Check video status error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to check video status",
      };
    }
  },
};
