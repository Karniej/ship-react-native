/**
 * ============================================================================
 * PAYWALL CONFIGURATION
 * ============================================================================
 *
 * Customize your paywall/premium screen here.
 * Edit benefits, pricing display, and free trial settings.
 *
 * To customize:
 * 1. Edit PAYWALL_BENEFITS array to list your premium features
 * 2. Configure FREE_TRIAL_CONFIG for trial behavior
 * 3. Adjust PAYWALL_CONFIG for display options
 */

import { Feather } from "@expo/vector-icons";

import { BRAND } from "./brand";

// ============================================================================
// TYPES
// ============================================================================

export interface PaywallBenefit {
  /** Unique identifier */
  id: string;
  /** Icon name from Feather icons */
  icon: keyof typeof Feather.glyphMap;
  /** Icon color */
  iconColor?: string;
  /** Benefit title i18n key */
  titleKey: string;
  /** Benefit description i18n key (optional) */
  descriptionKey?: string;
  /** Is this a highlight/featured benefit */
  highlighted?: boolean;
}

export interface FreeTrialConfig {
  /** Enable free trial UI when available */
  enabled: boolean;
  /** Show trial length badge */
  showTrialBadge: boolean;
  /** Trial badge style */
  badgeStyle: "pill" | "banner" | "subtle";
  /** Emphasize "Start Free Trial" over regular subscribe */
  emphasizeTrial: boolean;
  /** Show countdown/urgency messaging */
  showUrgency: boolean;
  /** Trial CTA button i18n key */
  trialButtonKey: string;
  /** Regular subscribe button i18n key */
  subscribeButtonKey: string;
}

export interface PaywallConfig {
  /** Header title i18n key */
  headerTitleKey: string;
  /** Header subtitle i18n key */
  headerSubtitleKey: string;
  /** Show feature comparison */
  showComparison: boolean;
  /** Show money-back guarantee */
  showGuarantee: boolean;
  /** Guarantee text i18n key */
  guaranteeKey: string;
  /** Show restore purchases link */
  showRestorePurchases: boolean;
  /** Restore purchases text i18n key */
  restoreKey: string;
  /** Show terms/privacy links */
  showLegalLinks: boolean;
  /** Animation style for benefits list */
  benefitAnimation: "fade" | "slide" | "scale" | "none";
  /** Stagger delay for benefit animations (ms) */
  benefitStaggerDelay: number;
  /** Header gradient colors */
  headerGradient: [string, string];
  /** Close button position */
  closeButtonPosition: "left" | "right";
}

// ============================================================================
// PAYWALL BENEFITS
// ============================================================================
// Edit these benefits to match your premium features.
// Order matters - benefits are displayed in this order.

export const PAYWALL_BENEFITS: PaywallBenefit[] = [
  {
    id: "unlimited",
    icon: "zap",
    iconColor: BRAND.colors.accent,
    titleKey: "premium.benefit.unlimited.title",
    descriptionKey: "premium.benefit.unlimited.description",
    highlighted: true,
  },
  {
    id: "quality",
    icon: "award",
    iconColor: BRAND.colors.primary,
    titleKey: "premium.benefit.quality.title",
    descriptionKey: "premium.benefit.quality.description",
  },
  {
    id: "priority",
    icon: "clock",
    iconColor: BRAND.featureColors.videoGeneration,
    titleKey: "premium.benefit.priority.title",
    descriptionKey: "premium.benefit.priority.description",
  },
  {
    id: "exclusive",
    icon: "star",
    iconColor: "#FFD700",
    titleKey: "premium.benefit.exclusive.title",
    descriptionKey: "premium.benefit.exclusive.description",
  },
  {
    id: "noAds",
    icon: "x-circle",
    iconColor: BRAND.colors.success,
    titleKey: "premium.benefit.noAds.title",
    descriptionKey: "premium.benefit.noAds.description",
  },
  {
    id: "support",
    icon: "headphones",
    iconColor: BRAND.colors.secondary,
    titleKey: "premium.benefit.support.title",
    descriptionKey: "premium.benefit.support.description",
  },
];

// ============================================================================
// FREE TRIAL CONFIGURATION
// ============================================================================
// Configure how free trials are displayed and promoted.

export const FREE_TRIAL_CONFIG: FreeTrialConfig = {
  enabled: true,
  showTrialBadge: true,
  badgeStyle: "pill",
  emphasizeTrial: true,
  showUrgency: false,
  trialButtonKey: "premium.startFreeTrial",
  subscribeButtonKey: "premium.subscribe",
};

// ============================================================================
// PAYWALL CONFIGURATION
// ============================================================================

export const PAYWALL_CONFIG: PaywallConfig = {
  headerTitleKey: "premium.title",
  headerSubtitleKey: "premium.subtitle",
  showComparison: false,
  showGuarantee: true,
  guaranteeKey: "premium.guarantee",
  showRestorePurchases: true,
  restoreKey: "premium.restore",
  showLegalLinks: true,
  benefitAnimation: "slide",
  benefitStaggerDelay: 100,
  headerGradient: BRAND.gradients.premium,
  closeButtonPosition: "left",
};

// ============================================================================
// SUBSCRIPTION PLANS DISPLAY
// ============================================================================
// Configure how subscription plans are displayed.

export interface PlanDisplayConfig {
  /** Show savings percentage for longer plans */
  showSavings: boolean;
  /** Highlight recommended plan */
  highlightRecommended: boolean;
  /** Recommended plan identifier (matches RevenueCat product ID) */
  recommendedPlanId: string;
  /** Show per-month price for annual plans */
  showMonthlyEquivalent: boolean;
  /** Plan card style */
  cardStyle: "bordered" | "elevated" | "flat";
  /** Popular badge i18n key */
  popularBadgeKey: string;
}

export const PLAN_DISPLAY_CONFIG: PlanDisplayConfig = {
  showSavings: true,
  highlightRecommended: true,
  recommendedPlanId: "yearly",
  showMonthlyEquivalent: true,
  cardStyle: "bordered",
  popularBadgeKey: "premium.popular",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get highlighted benefits only
 */
export function getHighlightedBenefits(): PaywallBenefit[] {
  return PAYWALL_BENEFITS.filter((b) => b.highlighted);
}

/**
 * Get benefit by ID
 */
export function getBenefitById(id: string): PaywallBenefit | undefined {
  return PAYWALL_BENEFITS.find((b) => b.id === id);
}

/**
 * Check if free trial should be shown based on config and offering
 */
export function shouldShowFreeTrial(hasTrialAvailable: boolean): boolean {
  return FREE_TRIAL_CONFIG.enabled && hasTrialAvailable;
}

/**
 * Get the appropriate CTA button text key
 */
export function getCtaButtonKey(hasTrialAvailable: boolean): string {
  if (shouldShowFreeTrial(hasTrialAvailable)) {
    return FREE_TRIAL_CONFIG.trialButtonKey;
  }
  return FREE_TRIAL_CONFIG.subscribeButtonKey;
}
