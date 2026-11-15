/**
 * ============================================================================
 * LOGIN SCREEN
 * ============================================================================
 *
 * Social authentication screen with Google and Apple sign-in options.
 * Appears after the paywall in the onboarding flow.
 */

import { useState, useEffect, useRef } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { Feather } from "@expo/vector-icons";
import { usePostHog } from "posthog-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BRAND } from "@/constants/brand";
import { FEATURES } from "@/constants/features";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useI18n } from "@/hooks/useI18n";
import { PostHogAnalytics } from "@/services/PostHogService";
import { useAuthStore } from "@/store/useAuthStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { haptics } from "@/utils/haptics";

export default function LoginScreen() {
  const router = useRouter();
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const posthog = usePostHog();
  const { t } = useI18n();

  const { signInWithGoogle, signInWithApple, isLoading, isAuthenticated } = useAuthStore();
  const { markAuthScreenSeen } = useOnboardingStore();

  const [authInProgress, setAuthInProgress] = useState<"google" | "apple" | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const buttonsFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    PostHogAnalytics.trackScreenViewed(posthog, "login");
    runEntranceAnimation();
  }, [posthog]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      markAuthScreenSeen();
      router.replace("/(app)/(tabs)");
    }
  }, [isAuthenticated, markAuthScreenSeen, router]);

  const runEntranceAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          damping: 8,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonsFade, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGoogleSignIn = async () => {
    haptics.medium();
    setAuthInProgress("google");

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        haptics.error();
        Alert.alert(t("common.error"), t("auth.error.googleFailed"));
        posthog?.capture("auth_failed", {
          provider: "google",
          error: error.message,
        });
      } else {
        haptics.success();
        posthog?.capture("auth_success", {
          provider: "google",
        });
      }
    } catch {
      haptics.error();
      Alert.alert(t("common.error"), t("auth.error.generic"));
    } finally {
      setAuthInProgress(null);
    }
  };

  const handleAppleSignIn = async () => {
    haptics.medium();
    setAuthInProgress("apple");

    try {
      const { error } = await signInWithApple();

      if (error) {
        haptics.error();
        Alert.alert(t("common.error"), t("auth.error.appleFailed"));
        posthog?.capture("auth_failed", {
          provider: "apple",
          error: error.message,
        });
      } else {
        haptics.success();
        posthog?.capture("auth_success", {
          provider: "apple",
        });
      }
    } catch {
      haptics.error();
      Alert.alert(t("common.error"), t("auth.error.generic"));
    } finally {
      setAuthInProgress(null);
    }
  };

  const handleSkip = () => {
    haptics.light();
    posthog?.capture("auth_skipped");
    markAuthScreenSeen();
    router.replace("/(app)/(tabs)");
  };

  const isAuthRequired = FEATURES.socialAuth?.required ?? false;
  const showGoogleButton = FEATURES.socialAuth?.googleEnabled ?? true;
  const showAppleButton = FEATURES.socialAuth?.appleEnabled ?? true;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingHorizontal: sp["2xl"],
          },
        ]}
      >
        {/* Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: iconScale }], marginBottom: sp["2xl"] },
          ]}
        >
          <LinearGradient
            colors={BRAND.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Feather name="user" size={48} color="#fff" />
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Text style={[styles.title, { color: tc.text, marginBottom: sp.sm }]}>
          {t("auth.title")}
        </Text>

        {/* Subtitle */}
        <Text
          style={[
            styles.subtitle,
            { color: tc.textSecondary, paddingHorizontal: sp.lg, marginBottom: 40 },
          ]}
        >
          {t("auth.subtitle")}
        </Text>

        {/* Auth Buttons */}
        <Animated.View style={[styles.buttonsContainer, { opacity: buttonsFade, gap: sp.md }]}>
          {showGoogleButton && (
            <TouchableOpacity
              style={[
                styles.authButton,
                styles.googleButton,
                { backgroundColor: "#fff", borderRadius: br.lg, borderColor: tc.borderSubtle },
              ]}
              onPress={handleGoogleSignIn}
              disabled={isLoading || authInProgress !== null}
              activeOpacity={0.8}
            >
              {authInProgress === "google" ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <>
                  <View style={styles.googleIconContainer}>
                    <Text style={styles.googleIcon}>G</Text>
                  </View>
                  <Text style={[styles.googleButtonText, { color: tc.text }]}>
                    {t("auth.continueWithGoogle")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {showAppleButton && (
            <TouchableOpacity
              style={[
                styles.authButton,
                styles.appleButton,
                { backgroundColor: isDark ? "#fff" : "#000", borderRadius: br.lg },
              ]}
              onPress={handleAppleSignIn}
              disabled={isLoading || authInProgress !== null}
              activeOpacity={0.8}
            >
              {authInProgress === "apple" ? (
                <ActivityIndicator size="small" color={isDark ? "#000" : "#fff"} />
              ) : (
                <>
                  <Text style={[styles.appleIconText, { color: isDark ? "#000" : "#fff" }]}>
                    {"\uF8FF"}
                  </Text>
                  <Text style={[styles.appleButtonText, { color: isDark ? "#000" : "#fff" }]}>
                    {t("auth.continueWithApple")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Skip Button (only if auth is not required) */}
          {!isAuthRequired && (
            <TouchableOpacity
              style={[styles.skipButton, { marginTop: sp.sm, gap: sp.xs }]}
              onPress={handleSkip}
              disabled={isLoading || authInProgress !== null}
            >
              <Text style={[styles.skipText, { color: tc.textSecondary }]}>
                {t("auth.skipForNow")}
              </Text>
              <Feather name="arrow-right" size={16} color={tc.textSecondary} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>

      {/* Footer - Terms */}
      <View style={[styles.footer, { paddingHorizontal: sp["2xl"], paddingBottom: sp["2xl"] }]}>
        <Text style={[styles.termsText, { color: tc.textTertiary }]}>
          {t("auth.termsNotice")}{" "}
          <Text
            style={[styles.termsLink, { color: tc.primary }]}
            onPress={() => router.push("/terms")}
          >
            {t("auth.termsLink")}
          </Text>{" "}
          {t("auth.and")}{" "}
          <Text
            style={[styles.termsLink, { color: tc.primary }]}
            onPress={() => router.push("/privacy")}
          >
            {t("auth.privacyLink")}
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {},
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  buttonsContainer: {
    width: "100%",
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    borderWidth: 1,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4285F4",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  appleButton: {},
  appleIconText: {
    fontSize: 22,
    marginRight: 8,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {},
  termsText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: "500",
  },
});
