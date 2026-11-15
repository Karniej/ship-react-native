import { apiCall } from "@/constants/api";

export interface GenerateImageOptions {
  model?: "dall-e-2" | "dall-e-3";
  size?: "1024x1024" | "1792x1024" | "1024x1792" | "512x512" | "256x256";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}

export interface GenerateImageResult {
  success: boolean;
  url?: string;
  model?: string;
  prompt?: string;
  error?: string;
}

export const openaiService = {
  async generateImage(
    prompt: string,
    options: GenerateImageOptions = {}
  ): Promise<GenerateImageResult> {
    try {
      const response = await apiCall("generate-image", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          model: options.model || "dall-e-3",
          size: options.size || "1024x1024",
          quality: options.quality || "standard",
          style: options.style || "vivid",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Image generation failed");
      }

      return {
        success: true,
        url: data.url || data.data?.url,
        model: data.model,
        prompt: data.prompt || data.data?.revised_prompt || prompt,
      };
    } catch (error) {
      console.error("OpenAI generateImage error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate image",
      };
    }
  },
};
