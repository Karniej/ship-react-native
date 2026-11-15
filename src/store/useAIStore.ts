import { create } from "zustand";

import { API_MODE } from "@/constants/api";
import { DEV_MODE, logGeneration } from "@/constants/generations";
import {
  openaiService,
  replicateService,
  elevenlabsService,
  videoService,
  transcriptionService,
  visionService,
} from "@/services/ai";
import type { TextToSpeechOptions } from "@/services/ai/elevenlabs.service";
import type { GenerateImageOptions } from "@/services/ai/openai.service";
import type { ReplicateGenerateOptions } from "@/services/ai/replicate.service";
import type {
  TranscriptionOptions,
  TranscriptionSegment,
} from "@/services/ai/transcription.service";
import type { GenerateVideoOptions } from "@/services/ai/video.service";
import type { AnalyzeImageOptions } from "@/services/ai/vision.service";

// Generation type for the store (simplified from database type)
interface Generation {
  id: string;
  userId: string;
  provider: string;
  model: string;
  prompt?: string;
  outputUrl?: string;
  outputData?: unknown;
  creditsUsed: number;
  contentType: string;
  createdAt?: number;
}

type Provider = "openai" | "replicate" | "elevenlabs" | "video" | "transcription" | "vision";

interface AIState {
  isGenerating: boolean;
  isLoading: boolean;
  generations: Generation[];
  credits: number;
  currentGeneration: {
    url?: string;
    prompt?: string;
    provider?: Provider;
    model?: string;
    text?: string; // For transcription results
    analysis?: string; // For vision results
  } | null;
  error: string | null;
  isDevMode: boolean;

  // Actions
  generateImage: (
    prompt: string,
    provider: "openai" | "replicate",
    options?: GenerateImageOptions | ReplicateGenerateOptions
  ) => Promise<{ success: boolean; url?: string; error?: string }>;

  generateSpeech: (
    text: string,
    options?: TextToSpeechOptions
  ) => Promise<{ success: boolean; url?: string; error?: string }>;

  generateVideo: (
    prompt: string,
    options?: GenerateVideoOptions
  ) => Promise<{ success: boolean; url?: string; error?: string }>;

  transcribeAudio: (
    fileUri: string,
    options?: TranscriptionOptions
  ) => Promise<{
    success: boolean;
    text?: string;
    segments?: TranscriptionSegment[];
    error?: string;
  }>;

  analyzeImage: (
    imageUri: string,
    options?: AnalyzeImageOptions
  ) => Promise<{ success: boolean; analysis?: string; error?: string }>;

  loadGenerations: () => Promise<void>;
  loadCredits: () => Promise<void>;
  clearCurrentGeneration: () => void;
  clearError: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  isGenerating: false,
  isLoading: false,
  generations: [],
  credits: 0,
  currentGeneration: null,
  error: null,
  isDevMode: DEV_MODE.enabled,

  generateImage: async (prompt, provider, options = {}) => {
    const model = (options as GenerateImageOptions)?.model || "dall-e-3";

    // Log generation attempt in dev mode
    logGeneration("image", model, prompt);

    set({ isGenerating: true, error: null, currentGeneration: null });

    try {
      let result;

      if (provider === "openai") {
        result = await openaiService.generateImage(prompt, options as GenerateImageOptions);
      } else {
        result = await replicateService.generate(prompt, options as ReplicateGenerateOptions);
      }

      if (!result.success) {
        set({
          isGenerating: false,
          error: result.error || "Generation failed",
        });
        return { success: false, error: result.error };
      }

      set({
        isGenerating: false,
        currentGeneration: {
          url: result.url,
          prompt,
          provider,
          model: result.model,
        },
      });

      // Refresh generations and credits (skip credit deduction in dev mode)
      get().loadGenerations();
      if (!DEV_MODE.enabled) {
        get().loadCredits();
      }

      return { success: true, url: result.url };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Generation failed";
      set({ isGenerating: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  generateSpeech: async (text, options = {}) => {
    // Log generation attempt in dev mode
    logGeneration("speech", "elevenlabs", text.substring(0, 50));

    set({ isGenerating: true, error: null, currentGeneration: null });

    try {
      const result = await elevenlabsService.textToSpeech(text, options);

      if (!result.success) {
        set({
          isGenerating: false,
          error: result.error || "Generation failed",
        });
        return { success: false, error: result.error };
      }

      set({
        isGenerating: false,
        currentGeneration: {
          url: result.url,
          prompt: text.substring(0, 100),
          provider: "elevenlabs",
          model: result.model,
        },
      });

      // Refresh generations and credits (skip credit deduction in dev mode)
      get().loadGenerations();
      if (!DEV_MODE.enabled) {
        get().loadCredits();
      }

      return { success: true, url: result.url };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Generation failed";
      set({ isGenerating: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  generateVideo: async (prompt, options = {}) => {
    // Log generation attempt in dev mode
    logGeneration("video", "runway-gen3", prompt);

    set({ isGenerating: true, error: null, currentGeneration: null });

    try {
      const result = await videoService.generateVideo(prompt, options);

      if (!result.success) {
        set({
          isGenerating: false,
          error: result.error || "Video generation failed",
        });
        return { success: false, error: result.error };
      }

      set({
        isGenerating: false,
        currentGeneration: {
          url: result.url,
          prompt,
          provider: "video",
          model: result.model,
        },
      });

      // Refresh generations and credits (skip credit deduction in dev mode)
      get().loadGenerations();
      if (!DEV_MODE.enabled) {
        get().loadCredits();
      }

      return { success: true, url: result.url };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Video generation failed";
      set({ isGenerating: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  transcribeAudio: async (fileUri, options = {}) => {
    // Log generation attempt in dev mode
    logGeneration("transcription", "whisper-1", fileUri);

    set({ isGenerating: true, error: null, currentGeneration: null });

    try {
      const result = await transcriptionService.transcribe(fileUri, options);

      if (!result.success) {
        set({
          isGenerating: false,
          error: result.error || "Transcription failed",
        });
        return { success: false, error: result.error };
      }

      set({
        isGenerating: false,
        currentGeneration: {
          text: result.text,
          provider: "transcription",
          model: result.model,
        },
      });

      // Refresh credits (skip credit deduction in dev mode)
      if (!DEV_MODE.enabled) {
        get().loadCredits();
      }

      return { success: true, text: result.text, segments: result.segments };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Transcription failed";
      set({ isGenerating: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  analyzeImage: async (imageUri, options = {}) => {
    // Log generation attempt in dev mode
    logGeneration("vision", "gpt-4o", imageUri);

    set({ isGenerating: true, error: null, currentGeneration: null });

    try {
      const result = await visionService.analyzeImage(imageUri, options);

      if (!result.success) {
        set({
          isGenerating: false,
          error: result.error || "Image analysis failed",
        });
        return { success: false, error: result.error };
      }

      set({
        isGenerating: false,
        currentGeneration: {
          analysis: result.analysis,
          provider: "vision",
          model: result.model,
        },
      });

      // Refresh credits (skip credit deduction in dev mode)
      if (!DEV_MODE.enabled) {
        get().loadCredits();
      }

      return { success: true, analysis: result.analysis };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Image analysis failed";
      set({ isGenerating: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  loadGenerations: async () => {
    // In Convex mode, use reactive queries (useQuery) instead
    if (API_MODE === "convex") {
      console.warn("[AI Store] Use useQuery(api.generations.listUserGenerations) in Convex mode");
      set({ isLoading: false });
      return;
    }

    // Expo API Routes mode - generations are managed client-side or via API
    set({ isLoading: true });
    try {
      // In Expo API Routes mode, generations are typically not persisted
      // unless you've set up your own storage solution
      set({ generations: [], isLoading: false });
    } catch (error: any) {
      if (__DEV__) {
        console.warn("[AI Store] Failed to load generations:", error?.message);
      }
      set({ generations: [], isLoading: false });
    }
  },

  loadCredits: async () => {
    // In Convex mode, use reactive queries (useQuery) instead
    if (API_MODE === "convex") {
      console.warn("[AI Store] Use useQuery(api.credits.getCurrentCredits) in Convex mode");
      return;
    }

    // Expo API Routes mode - credits are managed via RevenueCat/premium status
    // Set default credits for dev/demo mode
    set({ credits: __DEV__ ? 50 : 0 });
  },

  clearCurrentGeneration: () => {
    set({ currentGeneration: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
