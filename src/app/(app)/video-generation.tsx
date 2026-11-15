import { useState, useEffect, useCallback } from "react";

import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator, // Keep for button loading states
  StyleSheet,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";

import { NativeSegmentedControl } from "@components/ui/native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@hooks/useAppTheme";
import { usePostHog } from "posthog-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PromptInput } from "@/components/ai/PromptInput";
import {
  OfflineState,
  ScreenHeader,
  CreditsCard,
  ErrorCard,
  GenerationLoadingState,
  GenerationResult,
  SectionLabel,
  ImagePickerButton,
  SuccessCelebration,
} from "@/components/ui";
import { VIDEO_PROMPTS } from "@/constants/prompts";
import { useI18n } from "@/hooks/useI18n";
import { useNetworkState } from "@/hooks/useNetworkState";
import { useStoreReview } from "@/hooks/useStoreReview";
import { PostHogAnalytics } from "@/services/PostHogService";
import { useAIStore } from "@/store/useAIStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import { usePremiumStore } from "@/store/usePremiumStore";
import { fileDownload } from "@/utils/fileDownload";
import { haptics } from "@/utils/haptics";

type AspectRatio = "16:9" | "9:16" | "1:1";

export default function VideoGenerationScreen() {
  const router = useRouter();
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const posthog = usePostHog();
  const { t } = useI18n();
  const { isOffline } = useNetworkState();

  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [startImage, setStartImage] = useState<string | null>(null);
  const [endImage, setEndImage] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const {
    isGenerating,
    isLoading,
    credits,
    currentGeneration,
    error,
    generateVideo,
    loadCredits,
    clearError,
    clearCurrentGeneration,
  } = useAIStore();

  const { isSubscribed } = usePremiumStore();
  const { cachedCredits } = useOfflineStore();
  const { trackSuccessfulGeneration } = useStoreReview();

  // Video player hook
  const videoPlayer = useVideoPlayer(currentGeneration?.url || "", (player) => {
    player.loop = true;
  });

  useEffect(() => {
    loadCredits();
    PostHogAnalytics.trackScreenViewed(posthog, "video_generation");

    return () => {
      clearCurrentGeneration();
      clearError();
    };
  }, [loadCredits, posthog, clearCurrentGeneration, clearError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await loadCredits();
    setRefreshing(false);
  }, [loadCredits]);

  const displayCredits = isOffline && credits === null ? cachedCredits : credits;

  const handleGenerate = async (promptText: string) => {
    if (isOffline) {
      haptics.warning();
      Alert.alert(t("offline.title"), t("offline.message"));
      return;
    }

    if (!promptText.trim()) {
      haptics.warning();
      Alert.alert(t("common.error"), t("videoGeneration.enterPrompt"));
      return;
    }

    if (promptText.length > 1000) {
      haptics.warning();
      Alert.alert(t("common.error"), t("errors.promptTooLong"));
      return;
    }

    // Skip credits check in dev mode
    if (!__DEV__ && displayCredits === 0 && !isSubscribed) {
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

    haptics.medium();
    clearError();
    clearCurrentGeneration();

    PostHogAnalytics.trackGenerationStarted(posthog, "video", "video", "runway-gen3");

    setPrompt(promptText);

    try {
      const result = await generateVideo(promptText, {
        aspectRatio,
        startImage: startImage || undefined,
        endImage: endImage || undefined,
      });

      if (result.success) {
        haptics.success();
        setShowCelebration(true);
        PostHogAnalytics.trackGenerationCompleted(posthog, "video", "video", "runway-gen3", 1);
        // Track for store review prompt
        trackSuccessfulGeneration();
      } else {
        haptics.error();
        PostHogAnalytics.trackGenerationFailed(
          posthog,
          "video",
          "video",
          result.error || "Unknown error"
        );
      }
    } catch (err) {
      haptics.error();
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      PostHogAnalytics.trackGenerationFailed(posthog, "video", "video", errorMessage);
    }
  };

  const handleSaveVideo = async () => {
    if (!currentGeneration?.url) return;

    setIsSaving(true);
    haptics.light();

    try {
      const result = await fileDownload.saveToGallery(
        currentGeneration.url,
        `video_${Date.now()}`,
        "video"
      );

      if (result.success) {
        haptics.success();
        Alert.alert(t("common.success"), t("videoGeneration.savedToGallery"));
      } else {
        haptics.error();
        Alert.alert(t("common.error"), result.error || t("errors.generic"));
      }
    } catch {
      haptics.error();
      Alert.alert(t("common.error"), t("errors.generic"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareVideo = async () => {
    if (!currentGeneration?.url) return;

    haptics.light();

    try {
      await fileDownload.downloadAndShare(currentGeneration.url, `video_${Date.now()}`, "video");
    } catch {
      haptics.error();
      Alert.alert(t("common.error"), t("errors.generic"));
    }
  };

  if (isOffline) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.background }]} edges={["top"]}>
        <View style={styles.content}>
          <ScreenHeader title={t("videoGeneration.title")} />
        </View>
        <OfflineState onRetry={onRefresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.background }]} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tc.text} />
          }
        >
          <View style={styles.content}>
            {/* Header */}
            <ScreenHeader
              title={t("videoGeneration.title")}
              subtitle={t("videoGeneration.subtitle")}
            />

            {/* Credits */}
            <CreditsCard
              credits={displayCredits}
              isLoading={isLoading}
              label={t("generate.creditsRemaining", {
                count: displayCredits ?? 0,
              })}
            />

            {/* Aspect Ratio Selection */}
            <View style={styles.section}>
              <SectionLabel>{t("videoGeneration.aspectRatio")}</SectionLabel>
              <NativeSegmentedControl
                options={[
                  { value: "16:9", label: "16:9" },
                  { value: "9:16", label: "9:16" },
                  { value: "1:1", label: "1:1" },
                ]}
                selectedValue={aspectRatio}
                onValueChange={(value) => {
                  haptics.selection();
                  setAspectRatio(value as AspectRatio);
                }}
              />
            </View>

            {/* Reference Images */}
            <View style={styles.section}>
              <SectionLabel>{t("videoGeneration.referenceImages")}</SectionLabel>
              <Text style={[styles.optionalHint, { color: tc.textSecondary }]}>
                {t("imagePicker.optional")}
              </Text>
              <View style={styles.imagesRow}>
                <View style={styles.imagePickerWrapper}>
                  <ImagePickerButton
                    value={startImage}
                    onValueChange={setStartImage}
                    label={t("videoGeneration.startImage")}
                    placeholder={t("videoGeneration.startImageHint")}
                    disabled={isGenerating}
                    accentColor="#E91E63"
                    previewHeight={120}
                  />
                </View>
                <View style={styles.imagePickerWrapper}>
                  <ImagePickerButton
                    value={endImage}
                    onValueChange={setEndImage}
                    label={t("videoGeneration.endImage")}
                    placeholder={t("videoGeneration.endImageHint")}
                    disabled={isGenerating}
                    accentColor="#E91E63"
                    previewHeight={120}
                  />
                </View>
              </View>
            </View>

            {/* Prompt Input */}
            <View style={styles.section}>
              <SectionLabel>{t("videoGeneration.prompt")}</SectionLabel>
              <PromptInput
                onSubmit={handleGenerate}
                isLoading={isGenerating}
                placeholder={VIDEO_PROMPTS.placeholder}
                examples={VIDEO_PROMPTS.examples}
                styleModifiers={VIDEO_PROMPTS.motionModifiers}
                buttonLabel={t("videoGeneration.generateVideo")}
                loadingLabel={t("videoGeneration.generating")}
                value={prompt}
                onValueChange={setPrompt}
              />
            </View>

            {/* Error */}
            {error && <ErrorCard message={error} onDismiss={clearError} />}

            {/* Loading */}
            {isGenerating && (
              <GenerationLoadingState
                title={t("videoGeneration.generating")}
                subtitle={t("videoGeneration.generatingTime")}
              />
            )}

            {/* Result */}
            {currentGeneration?.url && (
              <>
                <GenerationResult title={t("videoGeneration.complete")}>
                  <VideoView
                    player={videoPlayer}
                    style={styles.video}
                    contentFit="contain"
                    nativeControls
                  />
                </GenerationResult>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: tc.surfaceElevated }]}
                    onPress={handleSaveVideo}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#E91E63" />
                    ) : (
                      <Feather name="download" size={20} color="#E91E63" />
                    )}
                    <Text style={[styles.actionButtonText, { color: "#E91E63" }]}>
                      {t("common.save")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: tc.surfaceElevated }]}
                    onPress={handleShareVideo}
                  >
                    <Feather name="share" size={20} color={tc.primary} />
                    <Text style={[styles.actionButtonText, { color: tc.primary }]}>
                      {t("common.share")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SuccessCelebration visible={showCelebration} onComplete={() => setShowCelebration(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  optionalHint: {
    fontSize: 12,
    marginTop: -4,
  },
  imagesRow: {
    flexDirection: "row",
    gap: 12,
  },
  imagePickerWrapper: {
    flex: 1,
  },
  aspectRatioRow: {
    flexDirection: "row",
    gap: 12,
  },
  aspectRatioButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
  },
  aspectRatioText: {
    fontSize: 14,
    fontWeight: "600",
  },
  video: {
    width: "100%",
    height: 200,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
