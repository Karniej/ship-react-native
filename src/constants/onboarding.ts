/**
 * ONBOARDING CONFIGURATION
 *
 * Customize your onboarding experience here.
 * 3 slides recommended — short, punchy, benefit-focused.
 * Each slide: icon + title + description. No inputs, no pickers.
 */

import { Feather } from "@expo/vector-icons";

import { BRAND } from "./brand";

export interface OnboardingSlide {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor?: string;
  gradient?: [string, string];
  titleKey: string;
  descriptionKey: string;
  image?: number; // require() returns number — use for custom images
}

export interface OnboardingConfig {
  showSkipButton: boolean;
  showProgressDots: boolean;
  showProgressBar: boolean;
  autoAdvanceMs: number;
  animationDuration: number;
  buttonStyle: "solid" | "outline" | "gradient";
  finalButtonKey: string;
  nextButtonKey: string;
  skipButtonKey: string;
}

// ============================================================================
// ONBOARDING SLIDES — Customize these for your app
// ============================================================================
// Tips:
// - 3 slides is the sweet spot. Don't bore users.
// - Lead with the core benefit, not a feature list.
// - Short titles (3-5 words). Short descriptions (1 sentence).
// - Icons: use Feather icons that represent the benefit.
// - Gradients: use BRAND.gradients for brand consistency.

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "welcome",
    icon: "zap",
    iconColor: "#fff",
    gradient: BRAND.gradients.primary,
    titleKey: "onboarding.slide1.title",
    descriptionKey: "onboarding.slide1.description",
  },
  {
    id: "feature",
    icon: "star",
    iconColor: "#fff",
    gradient: BRAND.gradients.primary,
    titleKey: "onboarding.slide2.title",
    descriptionKey: "onboarding.slide2.description",
  },
  {
    id: "start",
    icon: "arrow-right",
    iconColor: "#fff",
    gradient: BRAND.gradients.primary,
    titleKey: "onboarding.slide3.title",
    descriptionKey: "onboarding.slide3.description",
  },
];

// ============================================================================
// ONBOARDING CONFIGURATION
// ============================================================================

export const ONBOARDING_CONFIG: OnboardingConfig = {
  showSkipButton: false,
  showProgressDots: true,
  showProgressBar: false,
  autoAdvanceMs: 0,
  animationDuration: 300,
  buttonStyle: "solid",
  finalButtonKey: "onboarding.getStarted",
  nextButtonKey: "onboarding.next",
  skipButtonKey: "onboarding.skip",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getSlideById(id: string): OnboardingSlide | undefined {
  return ONBOARDING_SLIDES.find((slide) => slide.id === id);
}

export function getTotalSlides(): number {
  return ONBOARDING_SLIDES.length;
}

export function isLastSlide(index: number): boolean {
  return index === ONBOARDING_SLIDES.length - 1;
}

export function getProgress(currentIndex: number): number {
  return ((currentIndex + 1) / ONBOARDING_SLIDES.length) * 100;
}
