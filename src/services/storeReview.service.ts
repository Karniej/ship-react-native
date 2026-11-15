import * as StoreReview from "expo-store-review";

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  LAST_REVIEW_PROMPT: "@store_review:last_prompt",
  REVIEW_PROMPT_COUNT: "@store_review:prompt_count",
  GENERATION_COUNT: "@store_review:generation_count",
  APP_OPENS: "@store_review:app_opens",
  FIRST_OPEN_DATE: "@store_review:first_open",
  HAS_RATED: "@store_review:has_rated",
};

interface ReviewConfig {
  // Minimum number of successful generations before prompting
  minGenerations: number;
  // Minimum number of app opens before prompting
  minAppOpens: number;
  // Minimum days since first open before prompting
  minDaysSinceFirstOpen: number;
  // Minimum days between review prompts
  minDaysBetweenPrompts: number;
  // Maximum number of times to prompt for review
  maxPromptCount: number;
}

const DEFAULT_CONFIG: ReviewConfig = {
  minGenerations: 3,
  minAppOpens: 5,
  minDaysSinceFirstOpen: 3,
  minDaysBetweenPrompts: 30,
  maxPromptCount: 3,
};

class StoreReviewService {
  private config: ReviewConfig;

  constructor(config: Partial<ReviewConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Track app open - call this on app launch
   */
  async trackAppOpen(): Promise<void> {
    try {
      // Track first open date
      const firstOpen = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_OPEN_DATE);
      if (!firstOpen) {
        await AsyncStorage.setItem(STORAGE_KEYS.FIRST_OPEN_DATE, new Date().toISOString());
      }

      // Increment app opens
      const opens = await this.getAppOpens();
      await AsyncStorage.setItem(STORAGE_KEYS.APP_OPENS, String(opens + 1));
    } catch (error) {
      console.error("[StoreReview] Error tracking app open:", error);
    }
  }

  /**
   * Track successful generation - call after AI generation completes
   */
  async trackGeneration(): Promise<void> {
    try {
      const count = await this.getGenerationCount();
      await AsyncStorage.setItem(STORAGE_KEYS.GENERATION_COUNT, String(count + 1));

      // Check if we should prompt after this generation
      await this.maybePromptReview("generation");
    } catch (error) {
      console.error("[StoreReview] Error tracking generation:", error);
    }
  }

  /**
   * Check conditions and maybe prompt for review
   */
  async maybePromptReview(trigger: "generation" | "manual" | "milestone"): Promise<boolean> {
    try {
      // Check if user has already rated
      const hasRated = await AsyncStorage.getItem(STORAGE_KEYS.HAS_RATED);
      if (hasRated === "true") {
        return false;
      }

      // Check if review is available on this device
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) {
        console.log("[StoreReview] Not available on this device");
        return false;
      }

      // Check prompt count limit
      const promptCount = await this.getPromptCount();
      if (promptCount >= this.config.maxPromptCount) {
        return false;
      }

      // Check time between prompts
      const lastPrompt = await AsyncStorage.getItem(STORAGE_KEYS.LAST_REVIEW_PROMPT);
      if (lastPrompt) {
        const daysSinceLastPrompt = this.daysBetween(new Date(lastPrompt), new Date());
        if (daysSinceLastPrompt < this.config.minDaysBetweenPrompts) {
          return false;
        }
      }

      // Check minimum conditions
      const meetsConditions = await this.checkMinimumConditions();
      if (!meetsConditions) {
        return false;
      }

      // All conditions met - request review
      await this.requestReview();
      console.log(`[StoreReview] Review prompted (trigger: ${trigger})`);
      return true;
    } catch (error) {
      console.error("[StoreReview] Error in maybePromptReview:", error);
      return false;
    }
  }

  /**
   * Force request review (use sparingly)
   */
  async requestReview(): Promise<void> {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) {
        console.warn("[StoreReview] Not available");
        return;
      }

      await StoreReview.requestReview();

      // Update tracking
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_REVIEW_PROMPT, new Date().toISOString());
      const promptCount = await this.getPromptCount();
      await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_PROMPT_COUNT, String(promptCount + 1));
    } catch (error) {
      console.error("[StoreReview] Error requesting review:", error);
    }
  }

  /**
   * Mark that user has rated the app
   * Call this if you detect the user has left a review
   */
  async markAsRated(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_RATED, "true");
  }

  /**
   * Check if review dialog is available
   */
  async isAvailable(): Promise<boolean> {
    return StoreReview.isAvailableAsync();
  }

  /**
   * Check if we have the store URL for manual fallback
   */
  async hasStoreUrl(): Promise<boolean> {
    return StoreReview.hasAction();
  }

  /**
   * Open app store page directly (fallback)
   */
  async openStorePage(): Promise<void> {
    const hasAction = await StoreReview.hasAction();
    if (hasAction) {
      await StoreReview.requestReview();
    }
  }

  /**
   * Get statistics for debugging
   */
  async getStats(): Promise<{
    appOpens: number;
    generationCount: number;
    promptCount: number;
    daysSinceFirstOpen: number;
    daysSinceLastPrompt: number | null;
    hasRated: boolean;
    isAvailable: boolean;
  }> {
    const [appOpens, generationCount, promptCount, firstOpen, lastPrompt, hasRated, isAvailable] =
      await Promise.all([
        this.getAppOpens(),
        this.getGenerationCount(),
        this.getPromptCount(),
        AsyncStorage.getItem(STORAGE_KEYS.FIRST_OPEN_DATE),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_REVIEW_PROMPT),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_RATED),
        StoreReview.isAvailableAsync(),
      ]);

    return {
      appOpens,
      generationCount,
      promptCount,
      daysSinceFirstOpen: firstOpen ? this.daysBetween(new Date(firstOpen), new Date()) : 0,
      daysSinceLastPrompt: lastPrompt ? this.daysBetween(new Date(lastPrompt), new Date()) : null,
      hasRated: hasRated === "true",
      isAvailable,
    };
  }

  /**
   * Reset all tracking data (for testing)
   */
  async reset(): Promise<void> {
    await Promise.all(Object.values(STORAGE_KEYS).map((key) => AsyncStorage.removeItem(key)));
  }

  // Private helpers

  private async getAppOpens(): Promise<number> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.APP_OPENS);
    return value ? parseInt(value, 10) : 0;
  }

  private async getGenerationCount(): Promise<number> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.GENERATION_COUNT);
    return value ? parseInt(value, 10) : 0;
  }

  private async getPromptCount(): Promise<number> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_PROMPT_COUNT);
    return value ? parseInt(value, 10) : 0;
  }

  private async checkMinimumConditions(): Promise<boolean> {
    const [appOpens, generationCount, firstOpen] = await Promise.all([
      this.getAppOpens(),
      this.getGenerationCount(),
      AsyncStorage.getItem(STORAGE_KEYS.FIRST_OPEN_DATE),
    ]);

    // Check generation count
    if (generationCount < this.config.minGenerations) {
      return false;
    }

    // Check app opens
    if (appOpens < this.config.minAppOpens) {
      return false;
    }

    // Check days since first open
    if (firstOpen) {
      const daysSinceFirstOpen = this.daysBetween(new Date(firstOpen), new Date());
      if (daysSinceFirstOpen < this.config.minDaysSinceFirstOpen) {
        return false;
      }
    }

    return true;
  }

  private daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.floor(Math.abs(date2.getTime() - date1.getTime()) / oneDay);
  }
}

// Export singleton with default config
export const storeReviewService = new StoreReviewService();

// Export class for custom configuration
export { StoreReviewService };
