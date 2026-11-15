import { useState, useEffect, useCallback } from "react";

import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@hooks/useAppTheme";
import { usePostHog } from "posthog-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  OfflineState,
  ScreenHeader,
  CreditsCard,
  ErrorCard,
  GenerationLoadingState,
  GenerationResult,
  SectionLabel,
  SuccessCelebration,
} from "@/components/ui";
import { useI18n } from "@/hooks/useI18n";
import { useNetworkState } from "@/hooks/useNetworkState";
import { useStoreReview } from "@/hooks/useStoreReview";
import { visionService } from "@/services/ai";
import { PostHogAnalytics } from "@/services/PostHogService";
import { useAIStore } from "@/store/useAIStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import { usePremiumStore } from "@/store/usePremiumStore";
import { fileDownload } from "@/utils/fileDownload";
import { haptics } from "@/utils/haptics";

export default function ImageIdentifyScreen() {
  const router = useRouter();
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const posthog = usePostHog();
  const { t } = useI18n();
  const { isOffline } = useNetworkState();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const { isGenerating, isLoading, credits, error, analyzeImage, loadCredits, clearError } =
    useAIStore();

  const { isSubscribed } = usePremiumStore();
  const { cachedCredits } = useOfflineStore();
  const { trackSuccessfulGeneration } = useStoreReview();

  // Spin animation for analyze button loading
  const spinValue = useSharedValue(0);
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value * 360}deg` }],
  }));

  useEffect(() => {
    if (isGenerating) {
      spinValue.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      spinValue.value = withTiming(0, { duration: 300 });
    }
  }, [isGenerating, spinValue]);

  useEffect(() => {
    loadCredits();
    PostHogAnalytics.trackScreenViewed(posthog, "image_identify");

    return () => {
      clearError();
    };
  }, [loadCredits, posthog, clearError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await loadCredits();
    setRefreshing(false);
  }, [loadCredits]);

  const displayCredits = isOffline && credits === null ? cachedCredits : credits;

  const handleSelectImage = async (useCamera: boolean) => {
    haptics.light();

    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        haptics.warning();
        Alert.alert(
          t("common.error"),
          useCamera ? t("imageIdentify.cameraPermission") : t("imageIdentify.galleryPermission")
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Validate image before selecting
        const validation = await visionService.validateImageFile(imageUri);

        if (!validation.valid) {
          haptics.warning();
          Alert.alert(t("common.error"), validation.error || t("errors.generic"));
          return;
        }

        setSelectedImage(imageUri);
        setAnalysis(null);
        clearError();
      }
    } catch (err) {
      haptics.error();
      console.error("Image picker error:", err);
      Alert.alert(t("common.error"), t("errors.generic"));
    }
  };

  const handleAnalyze = async () => {
    if (isOffline) {
      haptics.warning();
      Alert.alert(t("offline.title"), t("offline.message"));
      return;
    }

    if (!selectedImage) {
      haptics.warning();
      Alert.alert(t("common.error"), t("imageIdentify.selectImage"));
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
    setAnalysis(null);

    PostHogAnalytics.trackGenerationStarted(posthog, "vision", "vision", "gpt-4o");

    try {
      const result = await analyzeImage(selectedImage);

      if (result.success && result.analysis) {
        haptics.success();
        setShowCelebration(true);
        setAnalysis(result.analysis);
        PostHogAnalytics.trackGenerationCompleted(posthog, "vision", "vision", "gpt-4o", 1);
        // Track for store review prompt
        trackSuccessfulGeneration();
      } else {
        haptics.error();
        PostHogAnalytics.trackGenerationFailed(
          posthog,
          "vision",
          "vision",
          result.error || "Unknown error"
        );
      }
    } catch (err) {
      haptics.error();
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      PostHogAnalytics.trackGenerationFailed(posthog, "vision", "vision", errorMessage);
    }
  };

  const handleCopyAnalysis = async () => {
    if (!analysis) return;

    setIsCopying(true);
    haptics.light();

    try {
      await Clipboard.setStringAsync(analysis);
      haptics.success();
      Alert.alert(t("common.success"), t("imageIdentify.copied"));
    } catch (err) {
      haptics.error();
      Alert.alert(t("common.error"), t("errors.generic"));
    } finally {
      setIsCopying(false);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedImage) return;

    setIsSavingImage(true);
    haptics.light();

    try {
      const result = await fileDownload.saveToGallery(
        selectedImage,
        `analyzed_image_${Date.now()}`,
        "image"
      );

      if (result.success) {
        haptics.success();
        Alert.alert(t("common.success"), t("imageIdentify.imageSaved"));
      } else {
        haptics.error();
        Alert.alert(t("common.error"), result.error || t("errors.generic"));
      }
    } catch (err) {
      haptics.error();
      Alert.alert(t("common.error"), t("errors.generic"));
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleShareAnalysis = async () => {
    if (!analysis) return;

    haptics.light();

    try {
      await Clipboard.setStringAsync(analysis);
      haptics.success();
      Alert.alert(t("common.success"), t("imageIdentify.copied"));
    } catch (err) {
      haptics.error();
      Alert.alert(t("common.error"), t("errors.generic"));
    }
  };

  if (isOffline) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.background }]} edges={["top"]}>
        <View style={styles.content}>
          <ScreenHeader title={t("imageIdentify.title")} />
        </View>
        <OfflineState onRetry={onRefresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.background }]} edges={["top"]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tc.text} />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <ScreenHeader title={t("imageIdentify.title")} subtitle={t("imageIdentify.subtitle")} />

          {/* Credits */}
          <CreditsCard
            credits={displayCredits}
            isLoading={isLoading}
            label={t("generate.creditsRemaining", {
              count: displayCredits ?? 0,
            })}
          />

          {/* Image Selection */}
          <View style={styles.section}>
            <SectionLabel>{t("imageIdentify.selectImageLabel")}</SectionLabel>

            {selectedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={() => {
                    haptics.light();
                    setSelectedImage(null);
                    setAnalysis(null);
                  }}
                >
                  <Feather name="x" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveImageButton}
                  onPress={handleSaveImage}
                  disabled={isSavingImage}
                >
                  {isSavingImage ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Feather name="download" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageSelectionButtons}>
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    {
                      backgroundColor: tc.surfaceElevated,
                      borderColor: tc.borderSubtle,
                    },
                  ]}
                  onPress={() => handleSelectImage(false)}
                  disabled={isGenerating}
                >
                  <Feather name="image" size={32} color="#2196F3" />
                  <Text style={[styles.selectButtonText, { color: tc.text }]}>
                    {t("imageIdentify.fromGallery")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    {
                      backgroundColor: tc.surfaceElevated,
                      borderColor: tc.borderSubtle,
                    },
                  ]}
                  onPress={() => handleSelectImage(true)}
                  disabled={isGenerating}
                >
                  <Feather name="camera" size={32} color="#2196F3" />
                  <Text style={[styles.selectButtonText, { color: tc.text }]}>
                    {t("imageIdentify.takePhoto")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Error */}
          {error && <ErrorCard message={error} onDismiss={clearError} />}

          {/* Analyze Button */}
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              !isGenerating && (isOffline || !selectedImage) && styles.analyzeButtonDisabled,
            ]}
            onPress={handleAnalyze}
            disabled={isGenerating || !selectedImage || isOffline}
          >
            <Animated.View style={isGenerating ? spinStyle : undefined}>
              <Feather name={isGenerating ? "refresh-cw" : "eye"} size={20} color="#fff" />
            </Animated.View>
            <Text style={styles.analyzeButtonText}>
              {isGenerating ? t("imageIdentify.analyzing") : t("imageIdentify.analyze")}
            </Text>
          </TouchableOpacity>

          {/* Loading */}
          {isGenerating && (
            <GenerationLoadingState
              title={t("imageIdentify.analyzing")}
              subtitle={t("imageIdentify.analyzingTime")}
            />
          )}

          {/* Analysis Result */}
          {analysis && (
            <>
              <GenerationResult title={t("imageIdentify.complete")}>
                <View style={[styles.resultCardInner, { backgroundColor: tc.surfaceElevated }]}>
                  <ScrollView style={styles.analysisScroll} nestedScrollEnabled>
                    <Text style={[styles.resultText, { color: tc.text }]} selectable>
                      {analysis}
                    </Text>
                  </ScrollView>
                </View>
              </GenerationResult>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: tc.surfaceElevated }]}
                  onPress={handleCopyAnalysis}
                  disabled={isCopying}
                >
                  {isCopying ? (
                    <ActivityIndicator size="small" color="#2196F3" />
                  ) : (
                    <Feather name="copy" size={20} color="#2196F3" />
                  )}
                  <Text style={[styles.actionButtonText, { color: "#2196F3" }]}>
                    {t("common.copy")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: tc.surfaceElevated }]}
                  onPress={handleShareAnalysis}
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
      <SuccessCelebration visible={showCelebration} onComplete={() => setShowCelebration(false)} />
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
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  imageSelectionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  selectButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  changeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  saveImageButton: {
    position: "absolute",
    top: 8,
    right: 48,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 12,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  resultCardInner: {
    padding: 16,
    maxHeight: 300,
  },
  analysisScroll: {
    maxHeight: 268,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
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
