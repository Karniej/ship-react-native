/** @format */

import React from "react";

export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle?: string;
  type: "welcome" | "input" | "selection" | "permission" | "completion";
  component?: React.ComponentType<any>;
  validation?: (data: any) => boolean;
  optional?: boolean;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "welcome",
    title: "Welcome to Your App",
    subtitle: "Get started with your personalized experience",
    type: "welcome",
  },
  {
    id: "name",
    title: "What should we call you?",
    type: "input",
    validation: (data) => data.name && data.name.trim().length > 0,
  },
  {
    id: "preferences",
    title: "Set your preferences",
    type: "selection",
  },
  {
    id: "notifications",
    title: "Enable notifications",
    type: "permission",
    optional: true,
  },
  {
    id: "completion",
    title: "You're all set!",
    subtitle: "Start exploring your new app",
    type: "completion",
  },
];

export const getOnboardingProgress = (currentIndex: number): number => {
  return (currentIndex + 1) / onboardingSlides.length;
};

export const validateOnboardingStep = (stepId: string, data: any): boolean => {
  const slide = onboardingSlides.find((s) => s.id === stepId);
  if (!slide?.validation) return true;
  return slide.validation(data);
};

export const isStepOptional = (stepId: string): boolean => {
  const slide = onboardingSlides.find((s) => s.id === stepId);
  return slide?.optional || false;
};
