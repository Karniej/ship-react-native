import { useState, useEffect, useCallback, useRef } from "react";

import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";

import { useAudioRecorder, useAudioPlayer, AudioModule, RecordingPresets } from "expo-audio";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
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
import { transcriptionService } from "@/services/ai";
import { PostHogAnalytics } from "@/services/PostHogService";
import { useAIStore } from "@/store/useAIStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import { usePremiumStore } from "@/store/usePremiumStore";
import { fileDownload } from "@/utils/fileDownload";
import { haptics } from "@/utils/haptics";

export default function TranscriptionScreen() {
  const router = useRouter();
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const posthog = usePostHog();
  const { t } = useI18n();
  const { isOffline } = useNetworkState();

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
    size?: number;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Audio hooks from expo-audio
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioPlayer = useAudioPlayer(selectedFile?.uri || "");

  // Playback state - derived from player
  const isPlaying = audioPlayer.playing;

  const { isGenerating, isLoading, credits, error, transcribeAudio, loadCredits, clearError } =
    useAIStore();

  const { isSubscribed } = usePremiumStore();
  const { cachedCredits } = useOfflineStore();
  const { trackSuccessfulGeneration } = useStoreReview();

  // Spin animation for transcribe button loading
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
    PostHogAnalytics.trackScreenViewed(posthog, "transcription");

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

  // Cleanup timer on unmount (audio hooks handle their own cleanup)
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      // Request permissions
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        haptics.warning();
        Alert.alert(t("common.error"), t("transcription.microphonePermission"));
        return;
      }

      // Configure audio mode
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // Prepare and start recording
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      setIsRecording(true);
      setRecordingDuration(0);
      setSelectedFile(null);
      setTranscription(null);
      clearError();

      haptics.medium();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      haptics.error();
      console.error("Failed to start recording:", err);
      Alert.alert(t("common.error"), t("errors.generic"));
    }
  };

  const stopRecording = async () => {
    try {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop recording
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      // Reset audio mode
      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
      });

      if (uri) {
        setSelectedFile({
          name: `Recording_${new Date().toISOString().slice(0, 19).replace(/[:-]/g, "")}.m4a`,
          uri,
        });
        haptics.success();
      }

      setIsRecording(false);
    } catch (err) {
      haptics.error();
      console.error("Failed to stop recording:", err);
      Alert.alert(t("common.error"), t("errors.generic"));
      setIsRecording(false);
    }
  };

  const playAudio = async () => {
    if (!selectedFile?.uri) return;

    try {
      // Toggle playback
      if (isPlaying) {
        audioPlayer.pause();
        return;
      }

      // Configure audio mode for playback
      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      // Play from start
      audioPlayer.seekTo(0);
      audioPlayer.play();
      haptics.light();
    } catch (err) {
      haptics.error();
      console.error("Failed to play audio:", err);
      Alert.alert(t("common.error"), t("errors.generic"));
    }
  };

  const handleSelectFile = async () => {
    haptics.light();

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];

        // Validate file before selecting
        const validation = await transcriptionService.validateAudioFile(file.uri);

        if (!validation.valid) {
          haptics.warning();
          Alert.alert(t("common.error"), validation.error || t("errors.generic"));
          return;
        }

        setSelectedFile({
          name: file.name,
          uri: file.uri,
          size: file.size,
        });
        setTranscription(null);
        clearError();
      }
    } catch (err) {
      haptics.error();
      console.error("Document picker error:", err);
      Alert.alert(t("common.error"), t("errors.generic"));
    }
  };

  const handleTranscribe = async () => {
    if (isOffline) {
      haptics.warning();
      Alert.alert(t("offline.title"), t("offline.message"));
      return;
    }

    if (!selectedFile) {
      haptics.warning();
      Alert.alert(t("common.error"), t("transcription.selectFile"));
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
    setTranscription(null);

    PostHogAnalytics.trackGenerationStarted(posthog, "transcription", "transcription", "whisper-1");

    try {
      const result = await transcribeAudio(selectedFile.uri);

      if (result.success && result.text) {
        haptics.success();
        setShowCelebration(true);
        setTranscription(result.text);
        PostHogAnalytics.trackGenerationCompleted(
          posthog,
          "transcription",
          "transcription",
          "whisper-1",
          1
        );
        // Track for store review prompt
        trackSuccessfulGeneration();
      } else {
        haptics.error();
        PostHogAnalytics.trackGenerationFailed(
          posthog,
          "transcription",
          "transcription",
          result.error || "Unknown error"
        );
      }
    } catch (err) {
      haptics.error();
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      PostHogAnalytics.trackGenerationFailed(
        posthog,
        "transcription",
        "transcription",
        errorMessage
      );
    }
  };

  const handleCopyTranscription = async () => {
    if (!transcription) return;

    setIsCopying(true);
    haptics.light();

    try {
      await Clipboard.setStringAsync(transcription);
      haptics.success();
      Alert.alert(t("common.success"), t("transcription.copied"));
    } catch (err) {
      haptics.error();
      Alert.alert(t("common.error"), t("errors.generic"));
    } finally {
      setIsCopying(false);
    }
  };

  const handleSaveTranscription = async () => {
    if (!transcription) return;

    haptics.light();

    try {
      // Create a text file with the transcription
      const blob = new Blob([transcription], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const result = await fileDownload.download({
        url,
        filename: `transcription_${Date.now()}`,
        fileType: "document",
        showShareSheet: true,
      });

      if (result.success) {
        haptics.success();
      } else {
        // Fallback: just copy to clipboard
        await Clipboard.setStringAsync(transcription);
        haptics.success();
        Alert.alert(t("common.success"), t("transcription.copied"));
      }

      URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: copy to clipboard
      try {
        await Clipboard.setStringAsync(transcription);
        haptics.success();
        Alert.alert(t("common.success"), t("transcription.copied"));
      } catch {
        haptics.error();
        Alert.alert(t("common.error"), t("errors.generic"));
      }
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isOffline) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.background }]} edges={["top"]}>
        <View style={styles.content}>
          <ScreenHeader title={t("transcription.title")} />
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
          <ScreenHeader title={t("transcription.title")} subtitle={t("transcription.subtitle")} />

          {/* Credits */}
          <CreditsCard
            credits={displayCredits}
            isLoading={isLoading}
            label={t("generate.creditsRemaining", {
              count: displayCredits ?? 0,
            })}
          />

          {/* Recording Section */}
          <View style={styles.section}>
            <SectionLabel>{t("transcription.recordAudio")}</SectionLabel>
            <View
              style={[
                styles.recordingContainer,
                {
                  backgroundColor: tc.surfaceElevated,
                  borderColor: isRecording ? "#FF5722" : tc.borderSubtle,
                },
              ]}
            >
              {isRecording ? (
                <>
                  <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>{t("transcription.recording")}</Text>
                  </View>
                  <Text style={[styles.recordingTimer, { color: tc.text }]}>
                    {formatDuration(recordingDuration)}
                  </Text>
                  <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                    <Feather name="square" size={24} color="#fff" />
                    <Text style={styles.stopButtonText}>{t("transcription.stopRecording")}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Feather name="mic" size={32} color="#FF5722" />
                  <Text style={[styles.recordingHint, { color: tc.textSecondary }]}>
                    {t("transcription.tapToRecord")}
                  </Text>
                  <TouchableOpacity
                    style={styles.recordButton}
                    onPress={startRecording}
                    disabled={isGenerating}
                  >
                    <Feather name="mic" size={20} color="#fff" />
                    <Text style={styles.recordButtonText}>{t("transcription.startRecording")}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: tc.borderSubtle }]} />
            <Text style={[styles.dividerText, { color: tc.textTertiary }]}>
              {t("transcription.orSelectFile")}
            </Text>
            <View style={[styles.divider, { backgroundColor: tc.borderSubtle }]} />
          </View>

          {/* File Selection */}
          <View style={styles.section}>
            <SectionLabel>{t("transcription.audioFile")}</SectionLabel>
            <TouchableOpacity
              style={[
                styles.fileSelector,
                {
                  backgroundColor: tc.surfaceElevated,
                  borderColor: selectedFile ? "#FF5722" : tc.borderSubtle,
                },
              ]}
              onPress={handleSelectFile}
              disabled={isGenerating || isRecording}
            >
              <Feather
                name={selectedFile ? "file" : "upload"}
                size={32}
                color={selectedFile ? "#FF5722" : tc.textTertiary}
              />
              <Text style={[styles.fileSelectorText, { color: tc.text }]} numberOfLines={2}>
                {selectedFile ? selectedFile.name : t("transcription.tapToSelect")}
              </Text>
              {selectedFile?.size ? (
                <Text style={[styles.fileSelectorHint, { color: tc.textTertiary }]}>
                  {formatFileSize(selectedFile.size)}
                </Text>
              ) : (
                <Text style={[styles.fileSelectorHint, { color: tc.textTertiary }]}>
                  {t("transcription.supportedFormats")}
                </Text>
              )}
            </TouchableOpacity>

            {selectedFile && (
              <View style={styles.fileActions}>
                <TouchableOpacity
                  style={[styles.playButton, { backgroundColor: tc.surfaceElevated }]}
                  onPress={playAudio}
                  disabled={isRecording}
                >
                  <Feather name={isPlaying ? "square" : "play"} size={18} color="#FF5722" />
                  <Text style={styles.playButtonText}>
                    {isPlaying ? t("transcription.stopPlayback") : t("transcription.playAudio")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearFileButton}
                  onPress={() => {
                    haptics.light();
                    if (isPlaying) {
                      audioPlayer.pause();
                    }
                    setSelectedFile(null);
                    setTranscription(null);
                  }}
                >
                  <Feather name="x" size={16} color={tc.textTertiary} />
                  <Text style={[styles.clearFileText, { color: tc.textTertiary }]}>
                    {t("transcription.clearFile")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Error */}
          {error && <ErrorCard message={error} onDismiss={clearError} />}

          {/* Transcribe Button */}
          <TouchableOpacity
            style={[
              styles.transcribeButton,
              !isGenerating && (isOffline || !selectedFile) && styles.transcribeButtonDisabled,
            ]}
            onPress={handleTranscribe}
            disabled={isGenerating || !selectedFile || isOffline}
          >
            <Animated.View style={isGenerating ? spinStyle : undefined}>
              <Feather name={isGenerating ? "refresh-cw" : "file-text"} size={20} color="#fff" />
            </Animated.View>
            <Text style={styles.transcribeButtonText}>
              {isGenerating ? t("transcription.transcribing") : t("transcription.transcribe")}
            </Text>
          </TouchableOpacity>

          {/* Loading */}
          {isGenerating && (
            <GenerationLoadingState
              title={t("transcription.transcribing")}
              subtitle={t("transcription.transcribingTime")}
            />
          )}

          {/* Transcription Result */}
          {transcription && (
            <>
              <GenerationResult title={t("transcription.complete")}>
                <View style={[styles.resultCardInner, { backgroundColor: tc.surfaceElevated }]}>
                  <ScrollView style={styles.transcriptionScroll} nestedScrollEnabled>
                    <Text style={[styles.resultText, { color: tc.text }]} selectable>
                      {transcription}
                    </Text>
                  </ScrollView>
                </View>
              </GenerationResult>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: tc.surfaceElevated }]}
                  onPress={handleCopyTranscription}
                  disabled={isCopying}
                >
                  {isCopying ? (
                    <ActivityIndicator size="small" color="#FF5722" />
                  ) : (
                    <Feather name="copy" size={20} color="#FF5722" />
                  )}
                  <Text style={[styles.actionButtonText, { color: "#FF5722" }]}>
                    {t("common.copy")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: tc.surfaceElevated }]}
                  onPress={handleSaveTranscription}
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
  fileSelector: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 32,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
  },
  fileSelectorText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  fileSelectorHint: {
    fontSize: 12,
    textAlign: "center",
  },
  clearFileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
  },
  clearFileText: {
    fontSize: 14,
  },
  fileActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF5722",
  },
  transcribeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF5722",
    paddingVertical: 16,
    borderRadius: 12,
  },
  transcribeButtonDisabled: {
    opacity: 0.6,
  },
  transcribeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  resultCardInner: {
    padding: 16,
    maxHeight: 300,
  },
  transcriptionScroll: {
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
  // Recording styles
  recordingContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF5722",
  },
  recordingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF5722",
  },
  recordingTimer: {
    fontSize: 48,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  recordingHint: {
    fontSize: 14,
    textAlign: "center",
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF5722",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 8,
  },
  recordButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#D32F2F",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  stopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
});
