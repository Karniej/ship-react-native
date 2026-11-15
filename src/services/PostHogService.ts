/** @format */

import { PostHog } from "posthog-react-native";

export const PostHogAnalytics = {
  // Onboarding Events
  trackOnboardingStarted: (posthog: PostHog) => {
    posthog?.capture("onboarding_started", {
      timestamp: new Date().toISOString(),
    });
  },

  trackOnboardingStepCompleted: (posthog: PostHog, stepNumber: number, stepId: string) => {
    posthog?.capture("onboarding_step_completed", {
      step_number: stepNumber,
      step_id: stepId,
      timestamp: new Date().toISOString(),
    });
  },

  trackOnboardingCompleted: (posthog: PostHog, userData?: { name?: string; theme?: string }) => {
    posthog?.capture("onboarding_completed", {
      timestamp: new Date().toISOString(),
      user_name: userData?.name || null,
      theme_preference: userData?.theme || null,
    });
  },

  // Premium Events
  trackPremiumScreenViewed: (posthog: PostHog) => {
    posthog?.capture("premium_screen_viewed", {
      timestamp: new Date().toISOString(),
    });
  },

  trackPurchaseStarted: (posthog: PostHog, productId: string) => {
    posthog?.capture("purchase_started", {
      product_id: productId,
      timestamp: new Date().toISOString(),
    });
  },

  trackPurchaseCompleted: (posthog: PostHog, productId: string, revenue: number) => {
    posthog?.capture("purchase_completed", {
      product_id: productId,
      revenue,
      timestamp: new Date().toISOString(),
    });
  },

  trackPurchaseFailed: (posthog: PostHog, productId: string, error: string) => {
    posthog?.capture("purchase_failed", {
      product_id: productId,
      error,
      timestamp: new Date().toISOString(),
    });
  },

  trackRestorePurchases: (posthog: PostHog, success: boolean) => {
    posthog?.capture("restore_purchases", {
      success,
      timestamp: new Date().toISOString(),
    });
  },

  // Generation Events
  trackGenerationStarted: (
    posthog: PostHog,
    type: "image" | "speech" | "video" | "transcription" | "vision" | "chat",
    provider: string,
    model: string
  ) => {
    posthog?.capture("generation_started", {
      type,
      provider,
      model,
      timestamp: new Date().toISOString(),
    });
  },

  trackGenerationCompleted: (
    posthog: PostHog,
    type: "image" | "speech" | "video" | "transcription" | "vision" | "chat",
    provider: string,
    model: string,
    creditsUsed: number
  ) => {
    posthog?.capture("generation_completed", {
      type,
      provider,
      model,
      credits_used: creditsUsed,
      timestamp: new Date().toISOString(),
    });
  },

  trackGenerationFailed: (
    posthog: PostHog,
    type: "image" | "speech" | "video" | "transcription" | "vision" | "chat",
    provider: string,
    error: string
  ) => {
    posthog?.capture("generation_failed", {
      type,
      provider,
      error,
      timestamp: new Date().toISOString(),
    });
  },

  // Credit Events
  trackCreditsLow: (posthog: PostHog, creditsRemaining: number) => {
    posthog?.capture("credits_low", {
      credits_remaining: creditsRemaining,
      timestamp: new Date().toISOString(),
    });
  },

  trackCreditsExhausted: (posthog: PostHog) => {
    posthog?.capture("credits_exhausted", {
      timestamp: new Date().toISOString(),
    });
  },

  // User Events
  trackUserCreated: (posthog: PostHog, userId: string) => {
    posthog?.capture("user_created", {
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  },

  trackUserSignedIn: (posthog: PostHog, userId: string) => {
    posthog?.capture("user_signed_in", {
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  },

  trackUserSignedOut: (posthog: PostHog) => {
    posthog?.capture("user_signed_out", {
      timestamp: new Date().toISOString(),
    });
  },

  trackProfileUpdated: (posthog: PostHog, fields: string[]) => {
    posthog?.capture("profile_updated", {
      fields_updated: fields,
      timestamp: new Date().toISOString(),
    });
  },

  trackSettingsChanged: (posthog: PostHog, setting: string, value: any) => {
    posthog?.capture("settings_changed", {
      setting,
      value,
      timestamp: new Date().toISOString(),
    });
  },

  // App Events
  trackScreenViewed: (posthog: PostHog, screenName: string) => {
    posthog?.capture("screen_viewed", {
      screen_name: screenName,
      timestamp: new Date().toISOString(),
    });
  },

  trackButtonPressed: (posthog: PostHog, buttonName: string, context?: string) => {
    posthog?.capture("button_pressed", {
      button_name: buttonName,
      context: context || null,
      timestamp: new Date().toISOString(),
    });
  },

  trackFeatureUsed: (posthog: PostHog, featureName: string, properties?: Record<string, any>) => {
    posthog?.capture("feature_used", {
      feature_name: featureName,
      ...properties,
      timestamp: new Date().toISOString(),
    });
  },

  // Quick Action Events
  trackQuickAction: (posthog: PostHog, action: string) => {
    posthog?.capture("quick_action_tapped", {
      action,
      timestamp: new Date().toISOString(),
    });
  },

  // Error Events
  trackError: (posthog: PostHog, error: string, context?: any) => {
    posthog?.capture("error_occurred", {
      error,
      context,
      timestamp: new Date().toISOString(),
    });
  },

  // Custom Events
  trackCustomEvent: (posthog: PostHog, eventName: string, properties?: Record<string, any>) => {
    posthog?.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  },

  // User Properties
  setUserProperties: (posthog: PostHog, properties: Record<string, any>) => {
    try {
      posthog?.identify(undefined as any, properties);
    } catch {}
  },

  identifyUser: (posthog: PostHog, userId: string, properties?: Record<string, any>) => {
    posthog?.identify(userId, properties);
  },
};
