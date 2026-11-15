import * as FileSystem from "expo-file-system/legacy";

import { apiCall } from "@/constants/api";
import { VISION_PROMPTS } from "@/constants/prompts";

export type VisionModel = "gpt-4-vision" | "gpt-4o" | "claude-3-opus" | string;

export interface AnalyzeImageOptions {
  model?: VisionModel;
  prompt?: string; // Custom question about the image
  maxTokens?: number;
  detail?: "low" | "high" | "auto";
}

export interface AnalyzeImageResult {
  success: boolean;
  analysis?: string;
  labels?: string[];
  objects?: DetectedObject[];
  text?: string; // OCR result if text is detected
  model?: string;
  error?: string;
}

export interface DetectedObject {
  label: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const SUPPORTED_FORMATS = ["jpg", "jpeg", "png", "gif", "webp"];

export const visionService = {
  /**
   * Validate image file before processing
   */
  async validateImageFile(imageUri: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);

      if (!fileInfo.exists) {
        return { valid: false, error: "Image file does not exist" };
      }

      // Check file size
      if ("size" in fileInfo && fileInfo.size && fileInfo.size > MAX_IMAGE_SIZE) {
        return {
          valid: false,
          error: `Image too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
        };
      }

      // Check file extension
      const extension = imageUri.split(".").pop()?.toLowerCase();
      if (!extension || !SUPPORTED_FORMATS.includes(extension)) {
        return {
          valid: false,
          error: `Unsupported format. Supported: ${SUPPORTED_FORMATS.join(", ")}`,
        };
      }

      return { valid: true };
    } catch (error) {
      console.error("Image validation error:", error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Image validation failed",
      };
    }
  },

  /**
   * Analyze an image using AI vision
   */
  async analyzeImage(
    imageUri: string,
    options: AnalyzeImageOptions = {}
  ): Promise<AnalyzeImageResult> {
    try {
      // Validate image first
      const validation = await this.validateImageFile(imageUri);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Read image as base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64Image) {
        return { success: false, error: "Failed to read image file" };
      }

      // Get file extension for content type
      const extension = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const contentType = this.getContentType(extension);

      const response = await apiCall("vision", {
        method: "POST",
        body: JSON.stringify({
          image_base64: base64Image,
          content_type: contentType,
          model: options.model || "gpt-4o",
          prompt: options.prompt || VISION_PROMPTS.defaultAnalysis,
          max_tokens: options.maxTokens || 1000,
          detail: options.detail || "auto",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.error?.includes("rate limit")) {
          return { success: false, error: "Rate limit exceeded. Please try again later." };
        }
        if (data.error?.includes("insufficient credits")) {
          return { success: false, error: "Insufficient credits for image analysis." };
        }
        throw new Error(data.error || "Image analysis failed");
      }

      return {
        success: true,
        analysis: data.analysis,
        labels: data.labels,
        objects: data.objects,
        text: data.text,
        model: data.model || options.model || "gpt-4o",
      };
    } catch (error) {
      console.error("Vision analysis error:", error);

      let errorMessage = "Failed to analyze image";
      if (error instanceof Error) {
        if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }

      return { success: false, error: errorMessage };
    }
  },

  /**
   * Identify objects in an image
   */
  async identifyObjects(
    imageUri: string,
    options: Omit<AnalyzeImageOptions, "prompt"> = {}
  ): Promise<AnalyzeImageResult> {
    return this.analyzeImage(imageUri, {
      ...options,
      prompt: VISION_PROMPTS.objectIdentification,
    });
  },

  /**
   * Extract text from an image (OCR)
   */
  async extractText(
    imageUri: string,
    options: Omit<AnalyzeImageOptions, "prompt"> = {}
  ): Promise<AnalyzeImageResult> {
    return this.analyzeImage(imageUri, {
      ...options,
      prompt: VISION_PROMPTS.textExtraction,
    });
  },

  /**
   * Describe an image for accessibility
   */
  async describeForAccessibility(
    imageUri: string,
    options: Omit<AnalyzeImageOptions, "prompt"> = {}
  ): Promise<AnalyzeImageResult> {
    return this.analyzeImage(imageUri, {
      ...options,
      prompt: VISION_PROMPTS.accessibilityDescription,
    });
  },

  /**
   * Get content type from file extension
   */
  getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };
    return contentTypes[extension] || "image/jpeg";
  },

  /**
   * Get supported image formats
   */
  getSupportedFormats(): string[] {
    return SUPPORTED_FORMATS;
  },

  /**
   * Get max image size in bytes
   */
  getMaxImageSize(): number {
    return MAX_IMAGE_SIZE;
  },
};
