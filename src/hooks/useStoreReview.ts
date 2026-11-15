import { useCallback, useEffect } from "react";

import { Platform } from "react-native";

import * as StoreReview from "expo-store-review";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Store Review Configuration
 *
 * Customize when the review prompt appears:
 * - MIN_GENERATIONS: Minimum successful AI generations before prompting
 * - MIN_SESSIONS: Minimum app sessions before prompting
 * - MIN_DAYS_SINCE_INSTALL: Days since first use before prompting
 * - DAYS_BETWEEN_PROMPTS: Minimum days between review prompts
 */
const REVIEW_CONFIG = {
  MIN_GENERATIONS: 3, // User has generated at least 3 successful outputs
  MIN_SESSIONS: 3, // User has opened the app at least 3 times
  MIN_DAYS_SINCE_INSTALL: 3, // At least 3 days since first use
  DAYS_BETWEEN_PROMPTS: 60, // Don't prompt more than once every 60 days
};

interface StoreReviewState {
  // Tracking metrics
  successfulGenerations: number;
  appSessions: number;
  firstUseDate: string | null;
  lastPromptDate: string | null;
  hasRated: boolean;
  promptCount: number;

  // Actions
  incrementGenerations: () => void;
  incrementSessions: () => void;
  markAsRated: () => void;
  recordPrompt: () => void;
  resetReviewState: () => void;
}

export const useStoreReviewStore = create<StoreReviewState>()(
  persist(
    (set, get) => ({
      successfulGenerations: 0,
      appSessions: 0,
      firstUseDate: null,
      lastPromptDate: null,
      hasRated: false,
      promptCount: 0,

      incrementGenerations: () => {
        set((state) => ({
          successfulGenerations: state.successfulGenerations + 1,
        }));
      },

      incrementSessions: () => {
        const { firstUseDate } = get();
        set((state) => ({
          appSessions: state.appSessions + 1,
          firstUseDate: firstUseDate || new Date().toISOString(),
        }));
      },

      markAsRated: () => {
        set({ hasRated: true });
      },

      recordPrompt: () => {
        set((state) => ({
          lastPromptDate: new Date().toISOString(),
          promptCount: state.promptCount + 1,
        }));
      },

      resetReviewState: () => {
        set({
          successfulGenerations: 0,
          appSessions: 0,
          firstUseDate: null,
          lastPromptDate: null,
          hasRated: false,
          promptCount: 0,
        });
      },
    }),
    {
      name: "store-review-state",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/**
 * Hook for managing App Store / Play Store review prompts
 *
 * Usage:
 * ```tsx
 * const { trackSuccessfulGeneration, checkAndPromptReview } = useStoreReview();
 *
 * // After a successful AI generation
 * trackSuccessfulGeneration();
 *
 * // Or check if we should prompt (e.g., after completing onboarding)
 * await checkAndPromptReview();
 * ```
 */
export function useStoreReview() {
  const {
    successfulGenerations,
    appSessions,
    firstUseDate,
    lastPromptDate,
    hasRated,
    incrementGenerations,
    incrementSessions,
    recordPrompt,
  } = useStoreReviewStore();

  // Track app session on mount
  useEffect(() => {
    incrementSessions();
  }, []);

  /**
   * Check if all conditions are met to show review prompt
   */
  const shouldPromptReview = useCallback((): boolean => {
    // Never prompt if user has already rated
    if (hasRated) {
      return false;
    }

    // Check minimum generations
    if (successfulGenerations < REVIEW_CONFIG.MIN_GENERATIONS) {
      return false;
    }

    // Check minimum sessions
    if (appSessions < REVIEW_CONFIG.MIN_SESSIONS) {
      return false;
    }

    // Check days since install
    if (firstUseDate) {
      const daysSinceInstall = getDaysSince(firstUseDate);
      if (daysSinceInstall < REVIEW_CONFIG.MIN_DAYS_SINCE_INSTALL) {
        return false;
      }
    }

    // Check days since last prompt
    if (lastPromptDate) {
      const daysSinceLastPrompt = getDaysSince(lastPromptDate);
      if (daysSinceLastPrompt < REVIEW_CONFIG.DAYS_BETWEEN_PROMPTS) {
        return false;
      }
    }

    return true;
  }, [hasRated, successfulGenerations, appSessions, firstUseDate, lastPromptDate]);

  /**
   * Track a successful AI generation
   * Automatically checks if we should prompt for review
   */
  const trackSuccessfulGeneration = useCallback(async () => {
    incrementGenerations();

    // Check if we should prompt after this generation
    // Add a small delay for better UX (let user see their result first)
    setTimeout(async () => {
      if (shouldPromptReview()) {
        await promptForReview();
      }
    }, 2000);
  }, [incrementGenerations, shouldPromptReview]);

  /**
   * Manually check and prompt for review
   * Use this at strategic moments like after completing onboarding
   */
  const checkAndPromptReview = useCallback(async (): Promise<boolean> => {
    if (shouldPromptReview()) {
      return await promptForReview();
    }
    return false;
  }, [shouldPromptReview]);

  /**
   * Request the store review dialog
   */
  const promptForReview = useCallback(async (): Promise<boolean> => {
    try {
      // Check if store review is available
      const isAvailable = await StoreReview.isAvailableAsync();

      if (!isAvailable) {
        console.log("[StoreReview] Not available on this device/platform");
        return false;
      }

      // Check if we have the required action (iOS-specific check)
      if (Platform.OS === "ios") {
        const hasAction = await StoreReview.hasAction();
        if (!hasAction) {
          console.log("[StoreReview] No action available (iOS limit reached)");
          return false;
        }
      }

      // Show the review prompt
      await StoreReview.requestReview();

      // Record that we prompted
      recordPrompt();

      console.log("[StoreReview] Review prompt shown successfully");
      return true;
    } catch (error) {
      console.error("[StoreReview] Error requesting review:", error);
      return false;
    }
  }, [recordPrompt]);

  /**
   * Get current review eligibility status (useful for debugging)
   */
  const getReviewStatus = useCallback(() => {
    return {
      successfulGenerations,
      appSessions,
      firstUseDate,
      lastPromptDate,
      hasRated,
      isEligible: shouldPromptReview(),
      config: REVIEW_CONFIG,
    };
  }, [
    successfulGenerations,
    appSessions,
    firstUseDate,
    lastPromptDate,
    hasRated,
    shouldPromptReview,
  ]);

  return {
    // Actions
    trackSuccessfulGeneration,
    checkAndPromptReview,
    promptForReview,

    // Status
    getReviewStatus,
    isEligible: shouldPromptReview(),

    // Raw values (for UI if needed)
    successfulGenerations,
    appSessions,
  };
}

/**
 * Helper to calculate days since a date
 */
function getDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
