/**
 * Generation Types
 *
 * Shared types for AI generations used across the app.
 * These types are compatible with both Convex mode and Expo API Routes mode.
 */

export type ContentType = "image" | "video" | "audio" | "text";

export type Provider = "openai" | "replicate" | "elevenlabs" | "video" | "transcription" | "vision";

export interface Generation {
  id: string;
  userId: string;
  user_id?: string; // Legacy field name (snake_case)
  provider: Provider | string;
  model: string;
  prompt?: string;
  inputData?: unknown;
  input_data?: unknown; // Legacy field name (snake_case)
  outputUrl?: string;
  output_url?: string; // Legacy field name (snake_case)
  outputData?: unknown;
  output_data?: unknown; // Legacy field name (snake_case)
  creditsUsed: number;
  credits_used?: number; // Legacy field name (snake_case)
  contentType: ContentType | string;
  content_type?: ContentType | string; // Legacy field name (snake_case)
  createdAt?: number | string;
  created_at?: string; // Legacy field name (snake_case)
}

/**
 * Get the content type based on the provider
 */
export function getContentType(provider: string): ContentType {
  switch (provider) {
    case "openai":
    case "replicate":
      return "image";
    case "video":
      return "video";
    case "elevenlabs":
      return "audio";
    case "transcription":
    case "vision":
    default:
      return "text";
  }
}

/**
 * Get the display URL from a generation (handles both field naming conventions)
 */
export function getGenerationUrl(generation: Generation): string | undefined {
  return generation.outputUrl || generation.output_url;
}

/**
 * Get the created date from a generation (handles both field naming conventions)
 */
export function getGenerationDate(generation: Generation): Date {
  const timestamp = generation.createdAt || generation.created_at;
  if (typeof timestamp === "number") {
    return new Date(timestamp);
  }
  return new Date(timestamp || Date.now());
}

/**
 * Get the icon name for a content type
 */
export function getContentTypeIcon(contentType: ContentType): string {
  switch (contentType) {
    case "image":
      return "image";
    case "video":
      return "video";
    case "audio":
      return "music";
    case "text":
    default:
      return "file-text";
  }
}
