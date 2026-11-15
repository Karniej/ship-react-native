import React, { useEffect, useState, useCallback, useRef } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  Platform,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView, type VideoSource } from "expo-video";

import { PremiumConfetti } from "@components/ui";
import { NativeProgress } from "@components/ui/native";
import { BRAND } from "@constants/brand";
import { APP_CONFIG } from "@constants/config";
import { PAYWALL_BENEFITS, PAYWALL_CONFIG } from "@constants/paywall";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@hooks/useAppTheme";
import { useI18n } from "@hooks/useI18n";
import { usePremiumStatus } from "@hooks/usePremiumStatus";
import { PostHogAnalytics } from "@services/PostHogService";
import { useOnboardingStore } from "@store/useOnboardingStore";
import { usePremiumStore } from "@store/usePremiumStore";
import { haptics } from "@utils/haptics";
import { usePostHog } from "posthog-react-native";
import { PurchasesPackage } from "react-native-purchases";
import { SafeAreaView } from "react-native-safe-area-context";

const VISIBLE_BENEFITS_COUNT = 3;
const BENEFIT_ROTATION_INTERVAL = 3000;

// ============================================================================
// PAYWALL VIDEO BACKGROUND
// ============================================================================
// Add cycling background videos to assets/videos/ named paywall-1.mp4..paywall-N.mp4
// then add their require()s to this array. Empty array = plain dark background.
//
// Example:
//   const paywallVideos = [
//     require("../../../assets/videos/paywall-1.mp4"),
//     require("../../../assets/videos/paywall-2.mp4"),
//   ];
const paywallVideos: VideoSource[] = [];

export default function PremiumScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { t } = useI18n();
  const { colors: tc } = useAppTheme();
  const { markPremiumScreenSeen } = useOnboardingStore();
  const { refresh: refreshPremiumStatus } = usePremiumStatus();
  const [showConfetti, setShowConfetti] = useState(false);
  const {
    isLoading,
    offerings,
    selectedOffering,
    error,
    loadOfferings,
    purchasePackage,
    setSelectedOffering,
    restorePurchases,
  } = usePremiumStore();

  const hasVideo = paywallVideos.length > 0;
  const [videoIndex, setVideoIndex] = useState(0);
  const currentVideo = hasVideo ? paywallVideos[videoIndex % paywallVideos.length] : null;

  // Video player setup — cycles through paywallVideos when each finishes
  const player = useVideoPlayer(currentVideo, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  // Cycle to next video when current one ends
  useEffect(() => {
    if (!hasVideo) return;
    const sub = player.addListener("playToEnd", () => {
      setVideoIndex((prev) => (prev + 1) % paywallVideos.length);
    });
    return () => sub.remove();
  }, [player, hasVideo]);

  useEffect(() => {
    loadOfferings();
    PostHogAnalytics.trackPremiumScreenViewed(posthog);
  }, [loadOfferings, posthog]);

  const handleClose = useCallback(() => {
    // Hard paywall — no dismiss. Only called after successful purchase.
    markPremiumScreenSeen();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(tabs)");
    }
  }, [router, markPremiumScreenSeen]);

  const handlePurchase = useCallback(async () => {
    if (!selectedOffering) return;
    haptics.medium();
    PostHogAnalytics.trackPurchaseStarted(posthog, selectedOffering.identifier);
    try {
      await purchasePackage(selectedOffering);
      haptics.success();
      setShowConfetti(true);
      PostHogAnalytics.trackPurchaseCompleted(
        posthog,
        selectedOffering.identifier,
        selectedOffering.product?.price || 0
      );
      // Refresh premium status so the hard-paywall guard sees the new entitlement
      await refreshPremiumStatus();
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err) {
      haptics.error();
      PostHogAnalytics.trackPurchaseFailed(
        posthog,
        selectedOffering.identifier,
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  }, [selectedOffering, posthog, purchasePackage, handleClose, refreshPremiumStatus]);

  const handleRestorePurchases = useCallback(async () => {
    haptics.medium();
    try {
      const result = await restorePurchases();

      if (result === "restored") {
        haptics.success();
        PostHogAnalytics.trackRestorePurchases(posthog, true);
        await refreshPremiumStatus();
        handleClose();
        return;
      }

      // Restore completed but there is no active entitlement — tell the
      // user explicitly instead of closing the paywall (Apple reviewers
      // tap Restore first and expect a visible response).
      haptics.warning();
      PostHogAnalytics.trackRestorePurchases(posthog, false);
      Alert.alert(t("premium.restoreNoPurchasesTitle"), t("premium.restoreNoPurchasesMessage"));
    } catch {
      // The restore call itself failed (network, store account, ...)
      haptics.error();
      PostHogAnalytics.trackRestorePurchases(posthog, false);
      Alert.alert(t("premium.restoreFailedTitle"), t("premium.restoreFailedMessage"));
    }
  }, [restorePurchases, posthog, refreshPremiumStatus, handleClose, t]);

  const handleSelectOffering = useCallback(
    (offering: PurchasesPackage) => {
      haptics.selection();
      setSelectedOffering(offering);
    },
    [setSelectedOffering]
  );

  // Determine if selected plan has a free trial
  const hasFreeTrial = selectedOffering?.product?.introPrice != null;

  // Animated benefit rotation
  const [benefitIndex, setBenefitIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (PAYWALL_BENEFITS.length <= VISIBLE_BENEFITS_COUNT) return;

    const interval = setInterval(() => {
      // Fade out + slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Increment index
        setBenefitIndex((prev) => (prev + 1) % PAYWALL_BENEFITS.length);
        // Reset slide position for entry
        slideAnim.setValue(10);
        // Fade in + slide into place
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, BENEFIT_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [fadeAnim, slideAnim]);

  const getVisibleBenefits = () => {
    const visible: typeof PAYWALL_BENEFITS = [];
    for (let i = 0; i < VISIBLE_BENEFITS_COUNT; i++) {
      visible.push(PAYWALL_BENEFITS[(benefitIndex + i) % PAYWALL_BENEFITS.length]);
    }
    return visible;
  };

  // Get plan label text
  const getPlanPeriodLabel = (pack: PurchasesPackage) => {
    if (pack.packageType === APP_CONFIG.SUBSCRIPTION_TYPES.YEARLY) {
      return t("premium.yearly");
    }
    if (pack.packageType === APP_CONFIG.SUBSCRIPTION_TYPES.WEEKLY) {
      return t("premium.weekly");
    }
    return t("premium.monthly");
  };

  const getPeriodKey = (pack: PurchasesPackage) => {
    if (pack.packageType === APP_CONFIG.SUBSCRIPTION_TYPES.YEARLY) return t("premium.year");
    if (pack.packageType === APP_CONFIG.SUBSCRIPTION_TYPES.WEEKLY) return t("premium.week");
    return t("premium.month");
  };

  const getPriceLabel = (pack: PurchasesPackage) => {
    return `${pack.product.priceString}/${getPeriodKey(pack)}`;
  };

  const getTrialInfoText = () => {
    if (!selectedOffering) return "";
    const price = selectedOffering.product.priceString;
    const period = getPeriodKey(selectedOffering);

    if (hasFreeTrial && selectedOffering.product.introPrice) {
      const intro: any = selectedOffering.product.introPrice;
      const units = intro.periodNumberOfUnits ?? intro.numberOfPeriods ?? 1;
      const unit = (intro.periodUnit ?? intro.subscriptionPeriod ?? "DAY").toUpperCase();
      // Convert to days for display
      let trialDays = units;
      if (unit === "WEEK") trialDays = units * 7;
      else if (unit === "MONTH") trialDays = units * 30;
      else if (unit === "YEAR") trialDays = units * 365;
      return `${trialDays} days free, then ${price} per ${period}`;
    }
    return `${price} per ${period}`;
  };

  const yearlyPack = offerings.find((o) => o.packageType === APP_CONFIG.SUBSCRIPTION_TYPES.YEARLY);
  const weeklyPack = offerings.find(
    (o) =>
      o.packageType === APP_CONFIG.SUBSCRIPTION_TYPES.WEEKLY ||
      o.packageType === APP_CONFIG.SUBSCRIPTION_TYPES.MONTHLY
  );

  // ---- Color helpers: video mode = always white, no video = theme-aware ----
  const textColor = hasVideo ? "#FFFFFF" : tc.text;
  const textSecondary = hasVideo ? "rgba(255,255,255,0.75)" : tc.textSecondary;
  const textTertiary = hasVideo ? "rgba(255,255,255,0.4)" : tc.textTertiary;
  const trialInfoColor = hasVideo ? "rgba(255,255,255,0.6)" : tc.textSecondary;
  const benefitIconBg = hasVideo ? "rgba(255,255,255,0.12)" : tc.accentTintBg;
  const benefitIconColor = hasVideo ? "#FFFFFF" : tc.primary;
  const planCardBg = hasVideo ? "rgba(255,255,255,0.08)" : tc.surfaceElevated;
  const planCardBorderDefault = hasVideo ? "rgba(255,255,255,0.15)" : tc.borderSubtle;
  const planCardBorderSelected = BRAND.colors.primary;
  const bgColor = hasVideo ? "#000000" : tc.background;

  if (isLoading && offerings.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: tc.background }]}>
        <NativeProgress color={tc.primary} />
      </View>
    );
  }

  const renderPlanCard = (pack: PurchasesPackage, isYearly: boolean) => {
    const isSelected = selectedOffering?.identifier === pack.identifier;
    const hasTrial = pack.product?.introPrice != null;
    const intro: any = pack.product?.introPrice;
    const units = intro?.periodNumberOfUnits ?? intro?.numberOfPeriods ?? 1;
    const unit = (intro?.periodUnit ?? intro?.subscriptionPeriod ?? "DAY").toUpperCase();
    let trialDays = units;
    if (unit === "WEEK") trialDays = units * 7;
    else if (unit === "MONTH") trialDays = units * 30;
    else if (unit === "YEAR") trialDays = units * 365;
    const trialLabel = trialDays === 7 ? "1 week free" : `${trialDays} days free`;
    return (
      <TouchableOpacity
        key={pack.identifier}
        style={[
          styles.planCard,
          {
            backgroundColor: planCardBg,
            borderColor: isSelected ? planCardBorderSelected : planCardBorderDefault,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleSelectOffering(pack)}
        activeOpacity={0.7}
      >
        {isYearly && (
          <View style={[styles.bestValueBadge, { backgroundColor: BRAND.colors.primary }]}>
            <Text style={[styles.bestValueText, { color: "#FFFFFF" }]}>BEST VALUE</Text>
          </View>
        )}
        <View style={styles.planCardContent}>
          <View>
            <Text style={[styles.planName, { color: textColor }]}>{getPlanPeriodLabel(pack)}</Text>
            {hasTrial && (
              <Text style={[styles.planTrialLabel, { color: BRAND.colors.primary }]}>
                {trialLabel}
              </Text>
            )}
          </View>
          <Text style={[styles.planPrice, { color: textColor }]}>{getPriceLabel(pack)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Background video — fills entire screen */}
      {hasVideo && (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          nativeControls={false}
          contentFit="cover"
          allowsPictureInPicture={false}
        />
      )}

      {/* Base dark tint — uniform dimming so bright videos stay readable */}
      {hasVideo && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.3)" }]} />
      )}

      {/* Dark gradient overlay — matches onboarding for consistency */}
      {hasVideo && (
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.0)",
            "rgba(0,0,0,0.0)",
            "rgba(0,0,0,0.5)",
            "rgba(0,0,0,0.92)",
            "rgba(0,0,0,1.0)",
          ]}
          locations={[0, 0.25, 0.45, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Confetti on top of everything */}
      <PremiumConfetti active={showConfetti} />

      {/* Dev skip button — only in development */}
      {__DEV__ && (
        <SafeAreaView edges={["top"]} style={styles.devSkipContainer}>
          <TouchableOpacity
            onPress={() => {
              markPremiumScreenSeen();
              router.replace("/(app)/(tabs)");
            }}
            style={styles.devSkipButton}
          >
            <Text style={styles.devSkipText}>Skip (Dev)</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      {/* Content */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Headline */}
          <Text style={[styles.headline, hasVideo && styles.headlineVideo, { color: textColor }]}>
            {t(PAYWALL_CONFIG.headerTitleKey)}
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            {t(PAYWALL_CONFIG.headerSubtitleKey)}
          </Text>

          {/* Benefits list — animated rotation, fixed height to prevent layout jumps */}
          <View style={styles.benefitsContainer}>
            <Animated.View
              style={[
                styles.benefitsList,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {getVisibleBenefits().map((benefit) => (
                <View key={benefit.id} style={styles.benefitItem}>
                  <View style={[styles.benefitIconCircle, { backgroundColor: benefitIconBg }]}>
                    <Feather name={benefit.icon} size={18} color={benefitIconColor} />
                  </View>
                  <View style={styles.benefitTextContainer}>
                    <Text style={[styles.benefitTitle, { color: textColor }]}>
                      {t(benefit.titleKey)}
                    </Text>
                    {benefit.descriptionKey && (
                      <Text style={[styles.benefitDescription, { color: textSecondary }]}>
                        {t(benefit.descriptionKey)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </Animated.View>
          </View>

          {/* Plan cards */}
          {offerings.length > 0 && (
            <View style={styles.plansContainer}>
              {yearlyPack && renderPlanCard(yearlyPack, true)}
              {weeklyPack && renderPlanCard(weeklyPack, false)}
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* CTA button */}
          <TouchableOpacity
            style={[
              styles.ctaButton,
              { backgroundColor: BRAND.colors.primary },
              (!selectedOffering || isLoading) && styles.disabledButton,
            ]}
            onPress={handlePurchase}
            disabled={!selectedOffering || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.ctaText, { color: "#FFFFFF" }]}>
                {hasFreeTrial ? "No Payment Now" : "Subscribe Now"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Trial info */}
          {selectedOffering && (
            <Text style={[styles.trialInfo, { color: trialInfoColor }]}>{getTrialInfoText()}</Text>
          )}

          {/* Security footer */}
          <View style={styles.securityRow}>
            <Feather name="lock" size={12} color={textTertiary} />
            <Text style={[styles.securityText, { color: textTertiary }]}>
              {Platform.OS === "android"
                ? t("premium.securedByGoogle")
                : t("premium.securedByApple")}
            </Text>
          </View>

          {/* Footer links */}
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push("/terms")}>
              <Text style={[styles.footerLinkText, { color: textTertiary }]}>
                {t("common.termsOfService")}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.footerDot, { color: textTertiary }]}>{" \u00B7 "}</Text>
            <TouchableOpacity onPress={handleRestorePurchases} disabled={isLoading}>
              <Text style={[styles.footerLinkText, { color: textTertiary }]}>
                {t(PAYWALL_CONFIG.restoreKey)}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.footerDot, { color: textTertiary }]}>{" \u00B7 "}</Text>
            <TouchableOpacity onPress={() => router.push("/privacy")}>
              <Text style={[styles.footerLinkText, { color: textTertiary }]}>
                {t("common.privacyPolicy")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // Dev skip button
  devSkipContainer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    zIndex: 100,
  },
  devSkipButton: {
    backgroundColor: "rgba(255,150,0,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 16,
    marginTop: 4,
  },
  devSkipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  // Headline
  headline: {
    fontSize: 26,
    fontFamily: "Inter_800ExtraBold",
    textAlign: "center",
    marginBottom: 4,
  },
  headlineVideo: {
    fontSize: 30,
  },
  // Subtitle
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  // Benefits
  benefitsContainer: {
    height: 160,
    overflow: "hidden",
    marginBottom: 16,
  },
  benefitsList: {
    gap: 10,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  benefitIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  benefitDescription: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
    lineHeight: 18,
  },
  // Plan cards
  plansContainer: {
    gap: 10,
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    position: "relative",
    overflow: "visible",
  },
  planCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  planPrice: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  planTrialLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginTop: 2,
  },
  bestValueBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    left: "50%",
    transform: [{ translateX: -45 }],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1,
  },
  bestValueText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  // Error
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  // CTA
  ctaButton: {
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Trial info
  trialInfo: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
  },
  // Security
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  securityText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  // Footer links
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  footerLinkText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  footerDot: {
    fontSize: 12,
  },
});
