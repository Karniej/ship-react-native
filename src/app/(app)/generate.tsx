import { useState, useEffect, useCallback } from "react";

import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useRouter, Stack } from "expo-router";

import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@hooks/useAppTheme";
import { usePostHog } from "posthog-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ModelPicker, getProviderFromModel, type ImageModel } from "@/components/ai/ModelPicker";
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
import { IMAGE_PROMPTS } from "@/constants/prompts";
import { useI18n } from "@/hooks/useI18n";
import { useNetworkState } from "@/hooks/useNetworkState";
import { useStoreReview } from "@/hooks/useStoreReview";
import { PostHogAnalytics } from "@/services/PostHogService";
import { useAIStore } from "@/store/useAIStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import { usePremiumStore } from "@/store/usePremiumStore";
import { fileDownload } from "@/utils/fileDownload";
import { haptics } from "@/utils/haptics";

export default function GenerateScreen() {
  const router = useRouter();
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const posthog = usePostHog();
  const { t } = useI18n();
  const { isOffline } = useNetworkState();
  const [selectedModel, setSelectedModel] = useState<ImageModel>("dall-e-3");
  const [refreshing, setRefreshing] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [imageStrength, setImageStrength] = useState(0.75);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    isGenerating,
    isLoading,
    credits,
    currentGeneration,
    error,
    generateImage,
    loadCredits,
    clearCurrentGeneration,
    clearError,
  } = useAIStore();

  const { isSubscribed } = usePremiumStore();
  const { cachedCredits } = useOfflineStore();
  const { trackSuccessfulGeneration } = useStoreReview();

  useEffect(() => {
    loadCredits();
    PostHogAnalytics.trackScreenViewed(posthog, "generate");
  }, [loadCredits, posthog]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await loadCredits();
    setRefreshing(false);
  }, [loadCredits]);

  const displayCredits = isOffline && credits === null ? cachedCredits : credits;

  const handleGenerate = async (prompt: string) => {
    if (isOffline) {
      haptics.warning();
      Alert.alert(t("offline.title"), t("offline.message"));
      return;
    }

    // Check credits (skip in dev mode)
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

    const provider = getProviderFromModel(selectedModel);

    // Build options based on provider
    // Note: Image-to-image is only supported by Replicate models
    const options =
      provider === "openai"
        ? { model: selectedModel as "dall-e-3" }
        : {
            model: selectedModel,
            image: referenceImage || undefined,
            strength: referenceImage ? imageStrength : undefined,
          };

    PostHogAnalytics.trackGenerationStarted(posthog, "image", provider, selectedModel);

    const result = await generateImage(prompt, provider, options);

    if (result.success) {
      haptics.success();
      setShowCelebration(true);
      PostHogAnalytics.trackGenerationCompleted(posthog, "image", provider, selectedModel, 1);
      // Track for store review prompt
      trackSuccessfulGeneration();
    } else {
      haptics.error();
      PostHogAnalytics.trackGenerationFailed(
        posthog,
        "image",
        provider,
        result.error || "Unknown error"
      );
    }
  };

  const handleModelChange = (model: ImageModel) => {
    haptics.selection();
    setSelectedModel(model);
  };

  const handleSaveImage = async () => {
    if (!currentGeneration?.url) return;

    setIsSaving(true);
    haptics.light();

    try {
      const result = await fileDownload.saveToGallery(
        currentGeneration.url,
        `image_${Date.now()}`,
        "image"
      );

      if (result.success) {
        haptics.success();
        Alert.alert(t("common.success"), t("generate.savedToGallery"));
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

  const handleShareImage = async () => {
    if (!currentGeneration?.url) return;

    haptics.light();

    try {
      await fileDownload.downloadAndShare(currentGeneration.url, `image_${Date.now()}`, "image");
    } catch {
      haptics.error();
      Alert.alert(t("common.error"), t("errors.generic"));
    }
  };

  if (isOffline && !currentGeneration) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.background }]} edges={["top"]}>
        <View style={styles.content}>
          <ScreenHeader title={t("generate.title")} />
        </View>
        <OfflineState onRetry={onRefresh} />
      </SafeAreaView>
    );
  }

  return (
    <>
      {/* iOS: Bottom toolbar with liquid glass effect (iOS 26+) */}
      {Platform.OS === "ios" && currentGeneration?.url && (
        <Stack.Toolbar placement="bottom">
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Button icon="square.and.arrow.down" onPress={handleSaveImage} />
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Button icon="square.and.arrow.up" onPress={handleShareImage} />
          <Stack.Toolbar.Spacer />
        </Stack.Toolbar>
      )}

      <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.background }]} edges={["top"]}>
        {/* Success Celebration */}
        <SuccessCelebration
          visible={showCelebration}
          onComplete={() => setShowCelebration(false)}
        />

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tc.text} />
            }
          >
            {/* Header */}
            <ScreenHeader
              title={t("generate.title")}
              subtitle={t("generate.createImages")}
              rightAction={
                <TouchableOpacity
                  style={[styles.historyButton, { borderColor: tc.borderSubtle }]}
                  onPress={() => {
                    haptics.light();
                    router.push("/(app)/generations");
                  }}
                >
                  <Feather name="clock" size={18} color={tc.primary} />
                </TouchableOpacity>
              }
            />

            {/* Credits */}
            <CreditsCard
              credits={displayCredits}
              isLoading={isLoading}
              label={t("generate.creditsRemaining", {
                count: displayCredits ?? 0,
              })}
            />

            {/* Model Picker */}
            <ModelPicker value={selectedModel} onValueChange={handleModelChange} />

            {/* Reference Image (only for Replicate models - img2img) */}
            {getProviderFromModel(selectedModel) === "replicate" && (
              <View style={styles.referenceImageSection}>
                <ImagePickerButton
                  value={referenceImage}
                  onValueChange={setReferenceImage}
                  label={`${t("generate.referenceImage")} ${t("imagePicker.optional")}`}
                  placeholder={t("generate.referenceImageHint")}
                  disabled={isGenerating}
                  accentColor={tc.primary}
                  previewHeight={150}
                  showCamera={false}
                />
                {referenceImage && (
                  <View style={styles.strengthSection}>
                    <View style={styles.strengthLabelRow}>
                      <Text style={[styles.strengthLabel, { color: tc.text }]}>
                        {t("generate.strength")}
                      </Text>
                      <Text style={[styles.strengthValue, { color: tc.textSecondary }]}>
                        {Math.round(imageStrength * 100)}%
                      </Text>
                    </View>
                    <View style={styles.strengthSlider}>
                      <Text style={[styles.strengthHint, { color: tc.textTertiary }]}>
                        {t("generate.strengthLow")}
                      </Text>
                      <View style={styles.strengthButtons}>
                        {[0.25, 0.5, 0.75, 1.0].map((value) => (
                          <TouchableOpacity
                            key={value}
                            style={[
                              styles.strengthButton,
                              {
                                backgroundColor:
                                  imageStrength === value ? tc.primary : tc.surfaceElevated,
                                borderColor: imageStrength === value ? tc.primary : tc.border,
                              },
                            ]}
                            onPress={() => {
                              haptics.selection();
                              setImageStrength(value);
                            }}
                          >
                            <Text
                              style={[
                                styles.strengthButtonText,
                                {
                                  color: imageStrength === value ? "#fff" : tc.text,
                                },
                              ]}
                            >
                              {Math.round(value * 100)}%
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text style={[styles.strengthHint, { color: tc.textTertiary }]}>
                        {t("generate.strengthHigh")}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Prompt Input */}
            <View style={styles.promptSection}>
              <SectionLabel>{t("generate.prompt")}</SectionLabel>
              <PromptInput
                onSubmit={handleGenerate}
                isLoading={isGenerating}
                placeholder={IMAGE_PROMPTS.placeholder}
                examples={IMAGE_PROMPTS.examples}
                styleModifiers={IMAGE_PROMPTS.styleModifiers}
                buttonLabel={t("generate.title")}
                loadingLabel={t("generate.generating")}
              />
            </View>

            {/* Error */}
            {error && <ErrorCard message={error} onDismiss={clearError} />}

            {/* Loading */}
            {isGenerating && (
              <GenerationLoadingState
                title={t("generate.generating")}
                subtitle={t("generate.generatingTime")}
              />
            )}

            {/* Result */}
            {currentGeneration?.url && (
              <GenerationResult title={t("generate.complete")}>
                <Image source={{ uri: currentGeneration.url }} style={styles.resultImage} />
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultModel, { color: tc.textSecondary }]}>
                    {t("generate.model", {
                      model: currentGeneration.model || "",
                    })}
                  </Text>
                  {currentGeneration.prompt && (
                    <Text style={[styles.resultPrompt, { color: tc.text }]} numberOfLines={2}>
                      {currentGeneration.prompt}
                    </Text>
                  )}
                </View>
              </GenerationResult>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
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
  historyButton: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  promptSection: {
    gap: 8,
  },
  resultImage: {
    width: "100%",
    height: 300,
  },
  resultInfo: {
    padding: 12,
    gap: 4,
  },
  resultModel: {
    fontSize: 12,
  },
  resultPrompt: {
    fontSize: 14,
  },
  referenceImageSection: {
    gap: 12,
  },
  strengthSection: {
    gap: 8,
  },
  strengthLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  strengthLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  strengthValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  strengthSlider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  strengthHint: {
    fontSize: 11,
  },
  strengthButtons: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  strengthButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  strengthButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
