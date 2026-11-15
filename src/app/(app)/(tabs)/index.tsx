import { useEffect, useState, useCallback, memo, useMemo } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter, Link } from "expo-router";

import { GlassCard } from "@components/ui/design";
import { Skeleton, SkeletonCard } from "@components/ui/Skeleton";
import { BRAND } from "@constants/brand";
import { isFeatureEnabled, isFeatureBeta } from "@constants/features";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@hooks/useAppTheme";
import { useI18n } from "@hooks/useI18n";
import { useNetworkState } from "@hooks/useNetworkState";
import { PostHogAnalytics } from "@services/PostHogService";
import { useAIStore } from "@store/useAIStore";
import { useAuthStore } from "@store/useAuthStore";
import { useOfflineStore } from "@store/useOfflineStore";
import { usePremiumStore } from "@store/usePremiumStore";
import { haptics } from "@utils/haptics";
import { usePostHog } from "posthog-react-native";
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  useAnimatedStyle,
  Easing as ReanimatedEasing,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface QuickActionProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  route?: string;
  color?: string;
  isBeta?: boolean;
  index: number;
}

const QuickAction = memo(function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
  route,
  color = BRAND.colors.primary,
  isBeta = false,
  index,
}: QuickActionProps) {
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const scaleAnim = useSharedValue(0.8);
  const opacityAnim = useSharedValue(0);
  const translateYAnim = useSharedValue(30);

  useEffect(() => {
    const staggerDelay = index * 80; // Stagger delay

    opacityAnim.value = withDelay(staggerDelay, withTiming(1, { duration: 300 }));
    scaleAnim.value = withDelay(staggerDelay, withSpring(1, { damping: 12, stiffness: 100 }));
    translateYAnim.value = withDelay(
      staggerDelay,
      withTiming(0, {
        duration: 300,
        easing: ReanimatedEasing.out(ReanimatedEasing.ease),
      })
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacityAnim.value,
    transform: [{ scale: scaleAnim.value }, { translateY: translateYAnim.value }],
  }));

  const handlePress = () => {
    // Press animation
    scaleAnim.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );

    onPress();
  };

  const cardContent = (
    <View style={styles.quickActionHeader}>
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={[styles.quickActionIcon, { borderRadius: br.lg }]}
      >
        <Feather name={icon} size={24} color="#fff" />
      </LinearGradient>
      {isBeta && (
        <View style={[styles.betaBadge, { borderRadius: br.md }]}>
          <Text style={styles.betaBadgeText}>BETA</Text>
        </View>
      )}
    </View>
  );

  // iOS: Use Apple Zoom transition for smooth navigation animation (iOS 18+)
  if (Platform.OS === "ios" && route) {
    return (
      <Animated.View style={[styles.quickActionContainer, animatedStyle]}>
        <Link href={route as any} asChild>
          <TouchableOpacity
            style={[
              styles.quickAction,
              { backgroundColor: tc.surfaceElevated, padding: sp.lg, borderRadius: br.xl, gap: 10 },
            ]}
            onPress={handlePress}
            activeOpacity={0.9}
          >
            <Link.Trigger withAppleZoom>{cardContent}</Link.Trigger>
            <Text style={[styles.quickActionTitle, { color: tc.text }]}>{title}</Text>
            <Text style={[styles.quickActionSubtitle, { color: tc.textSecondary }]}>
              {subtitle}
            </Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  }

  // Android/Web: Standard touch navigation
  return (
    <Animated.View style={[styles.quickActionContainer, animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.quickAction,
          { backgroundColor: tc.surfaceElevated, padding: sp.lg, borderRadius: br.xl, gap: 10 },
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {cardContent}
        <Text style={[styles.quickActionTitle, { color: tc.text }]}>{title}</Text>
        <Text style={[styles.quickActionSubtitle, { color: tc.textSecondary }]}>{subtitle}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Animated Recent Item
interface RecentItemProps {
  gen: any;
  index: number;
}

const RecentItem = memo(function RecentItem({ gen, index }: RecentItemProps) {
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const opacityAnim = useSharedValue(0);
  const translateXAnim = useSharedValue(-20);

  useEffect(() => {
    const staggerDelay = 400 + index * 100;

    opacityAnim.value = withDelay(staggerDelay, withTiming(1, { duration: 300 }));
    translateXAnim.value = withDelay(
      staggerDelay,
      withTiming(0, {
        duration: 300,
        easing: ReanimatedEasing.out(ReanimatedEasing.ease),
      })
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacityAnim.value,
    transform: [{ translateX: translateXAnim.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={[
          styles.recentItem,
          { backgroundColor: tc.surfaceElevated, padding: 14, borderRadius: br.lg, gap: sp.md },
        ]}
      >
        <View
          style={[styles.recentItemIcon, { backgroundColor: tc.accentTintBg, borderRadius: br.lg }]}
        >
          <Feather
            name={gen.provider === "elevenlabs" ? "mic" : "image"}
            size={20}
            color={tc.primary}
          />
        </View>
        <View style={styles.recentItemContent}>
          <Text style={[styles.recentItemTitle, { color: tc.text }]} numberOfLines={1}>
            {gen.prompt}
          </Text>
          <Text style={[styles.recentItemMeta, { color: tc.textSecondary }]}>
            {gen.model} • {new Date(gen.created_at).toLocaleDateString()}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={tc.textTertiary} />
      </View>
    </Animated.View>
  );
});

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const posthog = usePostHog();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const credits = useAIStore((s) => s.credits);
  const generations = useAIStore((s) => s.generations);
  const loadGenerations = useAIStore((s) => s.loadGenerations);
  const loadCredits = useAIStore((s) => s.loadCredits);
  const isLoading = useAIStore((s) => s.isLoading);
  const isSubscribed = usePremiumStore((s) => s.isSubscribed);
  const { isOffline } = useNetworkState();
  const cachedGenerations = useOfflineStore((s) => s.cachedGenerations);
  const cachedCredits = useOfflineStore((s) => s.cachedCredits);
  const setCachedGenerations = useOfflineStore((s) => s.setCachedGenerations);
  const setCachedCredits = useOfflineStore((s) => s.setCachedCredits);
  const [refreshing, setRefreshing] = useState(false);

  // Header animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const creditsScale = useSharedValue(0.9);
  const creditsOpacity = useSharedValue(0);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const creditsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: creditsOpacity.value,
    transform: [{ scale: creditsScale.value }],
  }));

  const loadData = useCallback(async () => {
    await Promise.all([loadGenerations(), loadCredits()]);
  }, [loadGenerations, loadCredits]);

  useEffect(() => {
    loadData();
    PostHogAnalytics.trackScreenViewed(posthog, "home");

    // Run entrance animations (simultaneous assignments are inherently parallel in reanimated)
    headerOpacity.value = withTiming(1, { duration: 400 });
    headerTranslateY.value = withTiming(0, {
      duration: 400,
      easing: ReanimatedEasing.out(ReanimatedEasing.ease),
    });
    creditsOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    creditsScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 100 }));
  }, [loadData, posthog]);

  // Cache data for offline use
  useEffect(() => {
    if (generations.length > 0) {
      setCachedGenerations(generations);
    }
    if (credits !== null) {
      setCachedCredits(credits);
    }
  }, [generations, credits, setCachedGenerations, setCachedCredits]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Track low credits warning
  useEffect(() => {
    if (credits > 0 && credits <= 3) {
      PostHogAnalytics.trackCreditsLow(posthog, credits);
    }
  }, [credits, posthog]);

  // Build list of enabled features for indexing (must be before early return)
  const enabledFeatures = useMemo(() => {
    const features: {
      key: string;
      icon: keyof typeof Feather.glyphMap;
      title: string;
      subtitle: string;
      action: string;
      route: string;
      color: string;
    }[] = [];
    if (isFeatureEnabled("imageGeneration"))
      features.push({
        key: "imageGeneration",
        icon: "image" as const,
        title: t("home.imageGeneration"),
        subtitle: t("home.createAiArt"),
        action: "generate_image",
        route: "/(app)/generate",
        color: "#4CAF50",
      });
    if (isFeatureEnabled("videoGeneration"))
      features.push({
        key: "videoGeneration",
        icon: "video" as const,
        title: t("home.videoGeneration"),
        subtitle: t("home.createAiVideo"),
        action: "generate_video",
        route: "/(app)/video-generation",
        color: "#E91E63",
      });
    if (isFeatureEnabled("textToSpeech"))
      features.push({
        key: "textToSpeech",
        icon: "mic" as const,
        title: t("home.audioGeneration"),
        subtitle: t("home.convertText"),
        action: "text_to_speech",
        route: "/(app)/speech",
        color: "#9C27B0",
      });
    if (isFeatureEnabled("transcription"))
      features.push({
        key: "transcription",
        icon: "file-text" as const,
        title: t("home.audioTranscription"),
        subtitle: t("home.transcribeAudio"),
        action: "transcription",
        route: "/(app)/transcription",
        color: "#FF5722",
      });
    if (isFeatureEnabled("imageIdentification"))
      features.push({
        key: "imageIdentification",
        icon: "eye" as const,
        title: t("home.imageIdentification"),
        subtitle: t("home.analyzeImages"),
        action: "image_identify",
        route: "/(app)/image-identify",
        color: "#2196F3",
      });
    if (isFeatureEnabled("aiChat"))
      features.push({
        key: "aiChat",
        icon: "message-circle" as const,
        title: t("home.chat"),
        subtitle: t("home.chatWithAi"),
        action: "chat",
        route: "/(app)/chat",
        color: "#00BCD4",
      });
    return features;
  }, [t]);

  const handleQuickAction = (action: string, route: string) => {
    haptics.medium();
    PostHogAnalytics.trackQuickAction(posthog, action);

    // Check if premium is required for generation (skip in dev mode)
    const displayCredits = isOffline ? cachedCredits : credits;
    if (
      !__DEV__ &&
      (action === "generate_image" || action === "text_to_speech") &&
      displayCredits === 0 &&
      !isSubscribed
    ) {
      haptics.warning();
      Alert.alert(t("errors.noCredits"), t("errors.noCreditsUpgrade"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("home.upgrade"),
          onPress: () => router.push("/(app)/premium"),
        },
      ]);
      PostHogAnalytics.trackCreditsExhausted(posthog);
      return;
    }

    router.push(route as any);
  };

  // Use cached data when offline
  const displayGenerations =
    isOffline && generations.length === 0 ? cachedGenerations : generations;
  const displayCredits = isOffline && credits === null ? cachedCredits : credits;
  const recentGenerations = displayGenerations.slice(0, 3);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.background }]} edges={["top"]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tc.text} />
        }
      >
        <View style={[styles.content, { padding: sp.lg, gap: sp["2xl"], paddingBottom: 120 }]}>
          {/* Offline Banner */}
          {isOffline && (
            <View style={[styles.offlineBanner, { padding: sp.md, borderRadius: br.lg }]}>
              <Feather name="wifi-off" size={16} color="#F57C00" />
              <Text style={styles.offlineBannerText}>{t("offline.cachedData")}</Text>
            </View>
          )}

          {/* Header */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <View>
              <Text style={[styles.greeting, { color: tc.text }]}>
                {user?.name ? t("home.greeting", { name: user.name }) : t("home.greetingDefault")}
              </Text>
              <Text style={[styles.subGreeting, { color: tc.textSecondary }]}>
                {t("home.whatToCreate")}
              </Text>
            </View>
            {!user?.isPremium && (
              <TouchableOpacity
                style={[
                  styles.premiumBadge,
                  { backgroundColor: isDark ? "#4a3800" : "#FFF8E1", borderRadius: br["2xl"] },
                ]}
                onPress={() => {
                  haptics.light();
                  router.push("/(app)/premium");
                }}
              >
                <Feather name="star" size={16} color="#FFD700" />
                <Text style={[styles.premiumBadgeText, { color: isDark ? "#FFD700" : "#F57C00" }]}>
                  {t("home.upgrade")}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Credits Card */}
          <Animated.View style={creditsAnimatedStyle}>
            {isLoading ? (
              <View
                style={[
                  styles.creditsCard,
                  { backgroundColor: tc.accentTintBg, padding: sp.lg, borderRadius: br.xl },
                ]}
              >
                <View style={[styles.creditsInfo, { gap: sp.md }]}>
                  <Skeleton width={24} height={24} borderRadius={12} />
                  <View style={styles.creditsText}>
                    <Skeleton width={100} height={20} />
                    <Skeleton width={140} height={14} style={{ marginTop: 4 }} />
                  </View>
                </View>
              </View>
            ) : (
              <LinearGradient
                colors={isDark ? ["#1a365d", "#1e3a5f"] : ["#E3F2FD", "#BBDEFB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.creditsCard, { padding: sp.lg, borderRadius: br.xl }]}
              >
                <View style={[styles.creditsInfo, { gap: sp.md }]}>
                  <View style={styles.creditsIconContainer}>
                    <Feather name="zap" size={24} color={tc.primary} />
                  </View>
                  <View style={styles.creditsText}>
                    <Text style={[styles.creditsCount, { color: isDark ? "#90CAF9" : "#1565C0" }]}>
                      {t("home.credits", { count: displayCredits ?? 0 })}
                    </Text>
                    <Text style={[styles.creditsLabel, { color: isDark ? "#64B5F6" : "#1976D2" }]}>
                      {t("home.creditsAvailable")}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.addCreditsButton, { borderRadius: br.lg }]}
                  onPress={() => {
                    haptics.light();
                    router.push("/(app)/premium");
                  }}
                >
                  <LinearGradient
                    colors={BRAND.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.addCreditsGradient,
                      { paddingHorizontal: sp.lg, paddingVertical: 10 },
                    ]}
                  >
                    <Text style={styles.addCreditsText}>{t("home.getMore")}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </Animated.View>

          {/* AI Features */}
          <View style={[styles.section, { gap: sp.md }]}>
            <Text style={[styles.sectionTitle, { color: tc.text }]}>{t("home.aiFeatures")}</Text>
            <View style={[styles.quickActionsGrid, { gap: sp.md }]}>
              {enabledFeatures.map((feature, index) => (
                <QuickAction
                  key={feature.key}
                  icon={feature.icon}
                  title={feature.title}
                  subtitle={feature.subtitle}
                  onPress={() => handleQuickAction(feature.action, feature.route)}
                  route={feature.route}
                  color={feature.color}
                  isBeta={isFeatureBeta(feature.key as any)}
                  index={index}
                />
              ))}
            </View>
          </View>

          {/* Recent Generations */}
          {isLoading ? (
            <View style={[styles.section, { gap: sp.md }]}>
              <Text style={[styles.sectionTitle, { color: tc.text }]}>
                {t("home.recentCreations")}
              </Text>
              <View style={styles.recentList}>
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} style={{ marginBottom: 8 }} />
                ))}
              </View>
            </View>
          ) : recentGenerations.length > 0 ? (
            <View style={[styles.section, { gap: sp.md }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: tc.text }]}>
                  {t("home.recentCreations")}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    router.push("/(app)/generations");
                  }}
                >
                  <Text style={[styles.seeAllText, { color: tc.primary }]}>{t("home.seeAll")}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recentList}>
                {recentGenerations.map((gen, index) => (
                  <RecentItem key={gen.id} gen={gen} index={index} />
                ))}
              </View>
            </View>
          ) : (
            /* Getting Started (for new users) */
            <View style={[styles.section, { gap: sp.md }]}>
              <Text style={[styles.sectionTitle, { color: tc.text }]}>
                {t("home.gettingStarted")}
              </Text>
              <GlassCard padding={28}>
                <View style={[styles.gettingStartedInner, { gap: 14 }]}>
                  <LinearGradient
                    colors={BRAND.gradients.primary}
                    style={[styles.gettingStartedIcon, { borderRadius: br["2xl"] }]}
                  >
                    <Feather name="star" size={32} color="#fff" />
                  </LinearGradient>
                  <Text style={[styles.gettingStartedTitle, { color: tc.text }]}>
                    {t("home.createFirstGeneration")}
                  </Text>
                  <Text style={[styles.gettingStartedText, { color: tc.textSecondary }]}>
                    {t("home.createFirstGenerationDesc")}
                  </Text>
                  <TouchableOpacity
                    style={[styles.gettingStartedButton, { borderRadius: br.lg, marginTop: sp.sm }]}
                    onPress={() => {
                      haptics.medium();
                      router.push("/(app)/generate");
                    }}
                  >
                    <LinearGradient
                      colors={BRAND.gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.gettingStartedButtonGradient,
                        { gap: sp.sm, paddingHorizontal: sp["2xl"], paddingVertical: 14 },
                      ]}
                    >
                      <Text style={styles.gettingStartedButtonText}>{t("home.startCreating")}</Text>
                      <Feather name="arrow-right" size={18} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {},
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF3E0",
  },
  offlineBannerText: {
    color: "#E65100",
    fontSize: 14,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 0.37,
  },
  subGreeting: {
    fontSize: 15,
    marginTop: 4,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  creditsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creditsInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  creditsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,122,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  creditsText: {
    gap: 2,
  },
  creditsCount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  creditsLabel: {
    fontSize: 14,
  },
  addCreditsButton: {
    overflow: "hidden",
  },
  addCreditsGradient: {},
  addCreditsText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  section: {},
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  quickActionContainer: {
    width: "47%",
  },
  quickAction: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  betaBadge: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  betaBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  quickActionTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  quickActionSubtitle: {
    fontSize: 13,
  },
  recentList: {
    gap: 10,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  recentItemIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  recentItemContent: {
    flex: 1,
    gap: 2,
  },
  recentItemTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  recentItemMeta: {
    fontSize: 13,
  },
  gettingStartedInner: {
    alignItems: "center",
  },
  gettingStartedIcon: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  gettingStartedTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  gettingStartedText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  gettingStartedButton: {
    overflow: "hidden",
  },
  gettingStartedButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
  },
  gettingStartedButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
