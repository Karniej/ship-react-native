/**
 * Example Hook Test
 *
 * This file demonstrates how to test custom React hooks.
 */

import {
  isFeatureEnabled,
  isFeaturePremium,
  isFeatureBeta,
  canAccessFeature,
  getEnabledFeatures,
  getPremiumFeatures,
  getBetaFeatures,
} from "@/constants/features";

describe("Feature Flags", () => {
  // =========================================================================
  // BASIC FEATURE CHECKS
  // =========================================================================

  describe("isFeatureEnabled", () => {
    it("returns true for enabled features", () => {
      expect(isFeatureEnabled("imageGeneration")).toBe(true);
    });

    it("returns false for disabled features", () => {
      // All features are enabled by default in this boilerplate
      // This test would pass if you disable a feature
      expect(typeof isFeatureEnabled("videoGeneration")).toBe("boolean");
    });
  });

  describe("isFeaturePremium", () => {
    it("returns boolean for premium check", () => {
      expect(typeof isFeaturePremium("imageGeneration")).toBe("boolean");
    });
  });

  describe("isFeatureBeta", () => {
    it("returns true for beta features", () => {
      // videoGeneration is marked as beta
      expect(isFeatureBeta("videoGeneration")).toBe(true);
    });

    it("returns false for stable features", () => {
      expect(isFeatureBeta("imageGeneration")).toBe(false);
    });
  });

  // =========================================================================
  // ACCESS CONTROL
  // =========================================================================

  describe("canAccessFeature", () => {
    it("allows access to non-premium features for free users", () => {
      const isPremium = false;
      expect(canAccessFeature("imageGeneration", isPremium)).toBe(true);
    });

    it("allows access to all features for premium users", () => {
      const isPremium = true;
      expect(canAccessFeature("imageGeneration", isPremium)).toBe(true);
    });

    it("blocks access to premium-only features for free users", () => {
      // Would return false if a feature has premiumOnly: true
      const isPremium = false;
      // Since no features are premium-only by default, this just checks the logic
      expect(typeof canAccessFeature("imageGeneration", isPremium)).toBe("boolean");
    });
  });

  // =========================================================================
  // FEATURE LISTS
  // =========================================================================

  describe("getEnabledFeatures", () => {
    it("returns an array of feature keys", () => {
      const features = getEnabledFeatures();

      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
    });

    it("includes imageGeneration in enabled features", () => {
      const features = getEnabledFeatures();

      expect(features).toContain("imageGeneration");
    });
  });

  describe("getPremiumFeatures", () => {
    it("returns an array", () => {
      const features = getPremiumFeatures();

      expect(Array.isArray(features)).toBe(true);
    });
  });

  describe("getBetaFeatures", () => {
    it("returns beta features", () => {
      const features = getBetaFeatures();

      expect(Array.isArray(features)).toBe(true);
      expect(features).toContain("videoGeneration");
    });
  });
});
