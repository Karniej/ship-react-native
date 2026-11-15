import * as FileSystem from "expo-file-system/legacy";

import { apiCall } from "@/constants/api";

export type TranscriptionModel = "whisper-1" | "whisper-large-v3" | string;

export interface TranscriptionOptions {
  model?: TranscriptionModel;
  language?: string; // ISO 639-1 code (e.g., "en", "es", "fr")
  responseFormat?: "json" | "text" | "srt" | "vtt";
  temperature?: number; // 0-1, higher = more random
}

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  segments?: TranscriptionSegment[];
  language?: string;
  duration?: number;
  model?: string;
  error?: string;
}

export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB limit for most transcription APIs
const SUPPORTED_FORMATS = ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm", "flac", "ogg"];

export const transcriptionService = {
  /**
   * Validate audio file before upload
   */
  async validateAudioFile(fileUri: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (!fileInfo.exists) {
        return { valid: false, error: "File does not exist" };
      }

      // Check file size
      if ("size" in fileInfo && fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
        return {
          valid: false,
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        };
      }

      // Check file extension
      const extension = fileUri.split(".").pop()?.toLowerCase();
      if (!extension || !SUPPORTED_FORMATS.includes(extension)) {
        return {
          valid: false,
          error: `Unsupported format. Supported: ${SUPPORTED_FORMATS.join(", ")}`,
        };
      }

      return { valid: true };
    } catch (error) {
      console.error("File validation error:", error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : "File validation failed",
      };
    }
  },

  /**
   * Transcribe an audio file
   */
  async transcribe(
    fileUri: string,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    try {
      // Validate file first
      const validation = await this.validateAudioFile(fileUri);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Read file as base64
      const base64Audio = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64Audio) {
        return { success: false, error: "Failed to read audio file" };
      }

      // Get file extension for content type
      const extension = fileUri.split(".").pop()?.toLowerCase() || "mp3";
      const contentType = this.getContentType(extension);

      const response = await apiCall("transcribe", {
        method: "POST",
        body: JSON.stringify({
          audio_base64: base64Audio,
          content_type: contentType,
          filename: `audio.${extension}`,
          model: options.model || "whisper-1",
          language: options.language,
          response_format: options.responseFormat || "json",
          temperature: options.temperature,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.error?.includes("rate limit")) {
          return { success: false, error: "Rate limit exceeded. Please try again later." };
        }
        if (data.error?.includes("insufficient credits")) {
          return { success: false, error: "Insufficient credits for transcription." };
        }
        throw new Error(data.error || "Transcription failed");
      }

      return {
        success: true,
        text: data.text,
        segments: data.segments,
        language: data.language,
        duration: data.duration,
        model: data.model || options.model || "whisper-1",
      };
    } catch (error) {
      console.error("Transcription error:", error);

      let errorMessage = "Failed to transcribe audio";
      if (error instanceof Error) {
        if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. Large files may take longer to process.";
        } else {
          errorMessage = error.message;
        }
      }

      return { success: false, error: errorMessage };
    }
  },

  /**
   * Get content type from file extension
   */
  getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      mp3: "audio/mpeg",
      mp4: "audio/mp4",
      mpeg: "audio/mpeg",
      mpga: "audio/mpeg",
      m4a: "audio/m4a",
      wav: "audio/wav",
      webm: "audio/webm",
      flac: "audio/flac",
      ogg: "audio/ogg",
    };
    return contentTypes[extension] || "audio/mpeg";
  },

  /**
   * Get supported audio formats
   */
  getSupportedFormats(): string[] {
    return SUPPORTED_FORMATS;
  },

  /**
   * Get max file size in bytes
   */
  getMaxFileSize(): number {
    return MAX_FILE_SIZE;
  },
};
