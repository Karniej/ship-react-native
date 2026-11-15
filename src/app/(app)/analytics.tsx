import React, { useEffect, useState, useMemo, useCallback } from "react";

import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";

import { useRouter } from "expo-router";

import { GlassCard } from "@components/ui/design";
import { NativeProgress } from "@components/ui/native";
import { BRAND } from "@constants/brand";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@hooks/useAppTheme";
import { usePostHog } from "posthog-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/hooks/useI18n";
import { PostHogAnalytics } from "@/services/PostHogService";
import { useAIStore } from "@/store/useAIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { getGenerationDate } from "@/types/generation.types";
import { haptics } from "@/utils/haptics";

export default function AnalyticsScreen() {
  const router = useRouter();
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const posthog = usePostHog();
  const { t } = useI18n();
  const { generations, loadGenerations, credits } = useAIStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    PostHogAnalytics.trackScreenViewed(posthog, "analytics");
    loadGenerations().finally(() => setIsLoading(false));
  }, [posthog, loadGenerations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await loadGenerations();
    setRefreshing(false);
  }, [loadGenerations]);

  const analyticsData = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeekGenerations = generations.filter((g) => getGenerationDate(g) >= weekAgo);
    const lastWeekGenerations = generations.filter((g) => {
      const date = getGenerationDate(g);
      return date >= new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && date < weekAgo;
    });

    const weeklyGrowth =
      lastWeekGenerations.length > 0
        ? ((thisWeekGenerations.length - lastWeekGenerations.length) / lastWeekGenerations.length) *
          100
        : thisWeekGenerations.length > 0
          ? 100
          : 0;

    const imageGenerations = generations.filter((g) => g.provider !== "elevenlabs").length;
    const speechGenerations = generations.filter((g) => g.provider === "elevenlabs").length;
    const totalGenerations = generations.length;

    const imageUsage =
      totalGenerations > 0 ? Math.round((imageGenerations / totalGenerations) * 100) : 0;
    const speechUsage =
      totalGenerations > 0 ? Math.round((speechGenerations / totalGenerations) * 100) : 0;

    const modelCounts: Record<string, number> = {};
    generations.forEach((g) => {
      modelCounts[g.model] = (modelCounts[g.model] || 0) + 1;
    });

    const topModels = Object.entries(modelCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([model, count]) => ({
        name: model.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        usage: totalGenerations > 0 ? Math.round((count / totalGenerations) * 100) : 0,
        trend: "up" as const,
      }));

    return {
      totalGenerations,
      thisWeekGenerations: thisWeekGenerations.length,
      weeklyGrowth: Math.round(weeklyGrowth * 10) / 10,
      creditsRemaining: credits,
      topFeatures: [
        {
          name: t("home.generateImage"),
          usage: imageUsage,
          trend: (imageUsage > 50 ? "up" : "down") as "up" | "down",
        },
        {
          name: t("home.textToSpeech"),
          usage: speechUsage,
          trend: (speechUsage > 0 ? "up" : "down") as "up" | "down",
        },
        ...topModels.slice(0, 2),
      ],
      userEngagement: [
        {
          metric: t("analytics.totalGenerations"),
          value: totalGenerations.toString(),
          change: `+${thisWeekGenerations.length} ${t("analytics.thisWeek").toLowerCase()}`,
        },
        {
          metric: t("analytics.imageGenerations"),
          value: imageGenerations.toString(),
          change: t("analytics.ofTotal", { percent: imageUsage }),
        },
        {
          metric: t("analytics.speechGenerations"),
          value: speechGenerations.toString(),
          change: t("analytics.ofTotal", { percent: speechUsage }),
        },
        {
          metric: t("analytics.creditsRemaining"),
          value: credits.toString(),
          change: user?.isPremium ? t("analytics.premium") : t("analytics.freeTier"),
        },
      ],
    };
  }, [generations, credits, user?.isPremium, t]);

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: keyof typeof Feather.glyphMap;
    trend?: "up" | "down";
  }) => (
    <GlassCard padding={sp.md} style={[styles.metricCard]}>
      <View style={styles.metricCardContent}>
        <View style={[styles.metricInfo, { gap: sp.xs }]}>
          <Text style={[styles.metricTitle, { color: tc.textSecondary }]}>{title}</Text>
          <Text style={[styles.metricValue, { color: tc.text }]}>{value}</Text>
          {subtitle && (
            <View style={styles.trendRow}>
              <Feather
                name={trend === "up" ? "trending-up" : "trending-down"}
                size={12}
                color={trend === "up" ? "#4CAF50" : "#F44336"}
              />
              <Text style={[styles.trendText, { color: trend === "up" ? "#4CAF50" : "#F44336" }]}>
                {subtitle}
              </Text>
            </View>
          )}
        </View>
        <Feather name={icon} size={24} color={tc.primary} />
      </View>
    </GlassCard>
  );

  const FeatureCard = ({
    name,
    usage,
    trend,
  }: {
    name: string;
    usage: number;
    trend: "up" | "down";
  }) => (
    <View style={[styles.featureCard, { backgroundColor: tc.surfaceElevated }]}>
      <View style={styles.featureHeader}>
        <Text style={[styles.featureName, { color: tc.text }]}>{name}</Text>
        <View style={styles.trendRow}>
          <Feather
            name={trend === "up" ? "trending-up" : "trending-down"}
            size={14}
            color={trend === "up" ? "#4CAF50" : "#F44336"}
          />
          <Text style={[styles.featureUsage, { color: tc.textSecondary }]}>{usage}%</Text>
        </View>
      </View>
      <View style={[styles.progressBar, { backgroundColor: tc.borderSubtle }]}>
        <View style={[styles.progressFill, { width: `${usage}%` }]} />
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: tc.background }]} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <NativeProgress color={tc.primary} />
          <Text style={[styles.loadingText, { color: tc.textSecondary }]}>
            {t("common.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            haptics.light();
            router.back();
          }}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={tc.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tc.text }]}>{t("analytics.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tc.text} />
        }
      >
        <View style={styles.content}>
          {/* Key Metrics */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tc.text }]}>
              {t("analytics.yourStats")}
            </Text>
            <View style={styles.metricsRow}>
              <MetricCard
                title={t("analytics.totalGenerations")}
                value={analyticsData.totalGenerations}
                subtitle={`+${analyticsData.thisWeekGenerations} ${t("analytics.thisWeek").toLowerCase()}`}
                icon="activity"
                trend="up"
              />
              <MetricCard
                title={t("analytics.thisWeek")}
                value={analyticsData.thisWeekGenerations}
                subtitle={
                  analyticsData.weeklyGrowth >= 0
                    ? `+${analyticsData.weeklyGrowth}%`
                    : `${analyticsData.weeklyGrowth}%`
                }
                icon="calendar"
                trend={analyticsData.weeklyGrowth >= 0 ? "up" : "down"}
              />
            </View>
            <View style={styles.metricsRow}>
              <MetricCard
                title={t("analytics.credits")}
                value={analyticsData.creditsRemaining}
                subtitle={user?.isPremium ? t("analytics.unlimited") : t("analytics.remaining")}
                icon="zap"
                trend="up"
              />
              <MetricCard
                title={t("analytics.growth")}
                value={
                  analyticsData.weeklyGrowth >= 0
                    ? `+${analyticsData.weeklyGrowth}%`
                    : `${analyticsData.weeklyGrowth}%`
                }
                subtitle={t("analytics.weekOverWeek")}
                icon="trending-up"
                trend={analyticsData.weeklyGrowth >= 0 ? "up" : "down"}
              />
            </View>
          </View>

          {/* User Engagement */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tc.text }]}>
              {t("analytics.generationBreakdown")}
            </Text>
            <View style={[styles.card, { backgroundColor: tc.surfaceElevated }]}>
              {analyticsData.userEngagement.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.engagementRow,
                    index < analyticsData.userEngagement.length - 1 && styles.engagementRowBorder,
                    {
                      borderBottomColor: tc.borderSubtle,
                    },
                  ]}
                >
                  <Text style={[styles.engagementMetric, { color: tc.textSecondary }]}>
                    {item.metric}
                  </Text>
                  <View style={styles.engagementValues}>
                    <Text style={[styles.engagementValue, { color: tc.text }]}>{item.value}</Text>
                    <Text style={[styles.engagementChange, { color: "#4CAF50" }]}>
                      {item.change}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Feature Usage */}
          {analyticsData.topFeatures.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: tc.text }]}>
                {t("analytics.featureUsage")}
              </Text>
              {analyticsData.topFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  name={feature.name}
                  usage={feature.usage}
                  trend={feature.trend}
                />
              ))}
            </View>
          )}

          {/* Insights */}
          <View style={[styles.card, { backgroundColor: tc.surfaceElevated }]}>
            <View style={styles.insightsHeader}>
              <Feather name="sun" size={20} color="#4facfe" />
              <Text style={[styles.insightsTitle, { color: tc.text }]}>
                {t("analytics.insights")}
              </Text>
            </View>
            <View style={styles.insightsList}>
              {analyticsData.totalGenerations === 0 ? (
                <Text style={[styles.insightItem, { color: tc.textSecondary }]}>
                  {t("analytics.noGenerationsYet")}
                </Text>
              ) : (
                <>
                  <Text style={[styles.insightItem, { color: tc.textSecondary }]}>
                    {t("analytics.generationsTotal", {
                      count: analyticsData.totalGenerations,
                    })}
                  </Text>
                  {analyticsData.thisWeekGenerations > 0 && (
                    <Text style={[styles.insightItem, { color: tc.textSecondary }]}>
                      {t("analytics.generationsThisWeek", {
                        count: analyticsData.thisWeekGenerations,
                      })}
                    </Text>
                  )}
                  {credits <= 3 && !user?.isPremium && (
                    <Text style={[styles.insightItem, { color: "#FF9800" }]}>
                      {t("analytics.lowCredits")}
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricInfo: {
    flex: 1,
    gap: 4,
  },
  metricTitle: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 11,
  },
  featureCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  featureName: {
    fontSize: 16,
    fontWeight: "600",
  },
  featureUsage: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BRAND.colors.primary,
    borderRadius: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  engagementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  engagementRowBorder: {
    borderBottomWidth: 1,
  },
  engagementMetric: {
    fontSize: 14,
  },
  engagementValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  engagementValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  engagementChange: {
    fontSize: 12,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  insightsList: {
    gap: 8,
  },
  insightItem: {
    fontSize: 14,
  },
});
