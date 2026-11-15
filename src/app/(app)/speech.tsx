import { useState, useEffect, useCallback } from "react";

import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useAudioPlayer, AudioModule } from "expo-audio";
import { useRouter } from "expo-router";

import { BRAND } from "@constants/brand";
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
  SectionLabel,
  SuccessCelebration,
} from "@/components/ui";
import { SPEECH_PROMPTS } from "@/constants/prompts";
import { useI18n } from "@/hooks/useI18n";
import { useNetworkState } from "@/hooks/useNetworkState";
import { useStoreReview } from "@/hooks/useStoreReview";
import { AVAILABLE_VOICES, type ElevenLabsVoice } from "@/services/ai/elevenlabs.service";
import { PostHogAnalytics } from "@/services/PostHogService";
import { useAIStore } from "@/store/useAIStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import { usePremiumStore } from "@/store/usePremiumStore";
import { haptics } from "@/utils/haptics";

export default function SpeechScreen() {
  const router = useRouter();
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const posthog = usePostHog();
  const { t } = useI18n();
  const { isOffline } = useNetworkState();

  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<ElevenLabsVoice>("rachel");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Audio player hook
  const audioPlayer = useAudioPlayer(audioUrl || "");
  const isPlaying = audioPlayer.playing;

  const { isGenerating, isLoading, credits, error, generateSpeech, loadCredits, clearError } =
    useAIStore();

  const { isSubscribed } = usePremiumStore();
  const { cachedCredits } = useOfflineStore();
  const { trackSuccessfulGeneration } = useStoreReview();

  useEffect(() => {
    loadCredits();
    PostHogAnalytics.trackScreenViewed(posthog, "speech");
    // Audio hook handles its own cleanup
  }, [loadCredits, posthog]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await loadCredits();
    setRefreshing(false);
  }, [loadCredits]);

  const displayCredits = isOffline && credits === null ? cachedCredits : credits;

  const handleGenerate = async (inputText: string) => {
    if (isOffline) {
      haptics.warning();
      Alert.alert(t("offline.title"), t("offline.message"));
      return;
    }

    if (!inputText.trim()) {
      haptics.warning();
      Alert.alert(t("common.error"), t("errors.enterText"));
      return;
    }

    if (inputText.length > 5000) {
      haptics.warning();
      Alert.alert(t("common.error"), t("errors.textTooLong"));
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

    setText(inputText);
    haptics.medium();
    clearError();
    setAudioUrl(null);

    PostHogAnalytics.trackGenerationStarted(
      posthog,
      "speech",
      "elevenlabs",
      "eleven_multilingual_v2"
    );

    const result = await generateSpeech(inputText, { voice: selectedVoice });

    if (result.success && result.url) {
      haptics.success();
      setShowCelebration(true);
      setAudioUrl(result.url);
      PostHogAnalytics.trackGenerationCompleted(
        posthog,
        "speech",
        "elevenlabs",
        "eleven_multilingual_v2",
        1
      );
      // Track for store review prompt
      trackSuccessfulGeneration();
    } else {
      haptics.error();
      PostHogAnalytics.trackGenerationFailed(
        posthog,
        "speech",
        "elevenlabs",
        result.error || "Unknown error"
      );
    }
  };

  const handlePlayPause = async () => {
    if (!audioUrl) return;

    haptics.light();

    try {
      // Configure audio mode for playback
      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      if (isPlaying) {
        audioPlayer.pause();
      } else {
        audioPlayer.play();
        PostHogAnalytics.trackFeatureUsed(posthog, "audio_playback", {
          voice: selectedVoice,
        });
      }
    } catch (err) {
      console.error("Audio playback error:", err);
      haptics.error();
      Alert.alert(t("common.error"), t("errors.generic"));
    }
  };

  const handleVoiceSelect = (voiceId: ElevenLabsVoice) => {
    haptics.selection();
    setSelectedVoice(voiceId);
  };

  const VoiceOption = ({ voice }: { voice: (typeof AVAILABLE_VOICES)[0] }) => (
    <TouchableOpacity
      style={[
        styles.voiceOption,
        selectedVoice === voice.id && styles.voiceOptionSelected,
        { backgroundColor: tc.surfaceElevated },
      ]}
      onPress={() => handleVoiceSelect(voice.id)}
    >
      <View style={[styles.voiceIcon, { backgroundColor: tc.borderSubtle }]}>
        <Feather
          name={voice.gender === "female" ? "user" : "user"}
          size={16}
          color={selectedVoice === voice.id ? tc.primary : tc.textSecondary}
        />
      </View>
      <Text
        style={[
          styles.voiceName,
          { color: tc.text },
          selectedVoice === voice.id && styles.voiceNameSelected,
        ]}
      >
        {voice.name}
      </Text>
      {selectedVoice === voice.id && <Feather name="check" size={16} color={tc.primary} />}
    </TouchableOpacity>
  );

  if (isOffline && !audioUrl) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.background }]} edges={["top"]}>
        <View style={styles.content}>
          <ScreenHeader title={t("speech.title")} />
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
            <ScreenHeader title={t("speech.title")} subtitle={t("speech.subtitle")} />

            {/* Credits */}
            <CreditsCard
              credits={displayCredits}
              isLoading={isLoading}
              label={t("generate.creditsRemaining", {
                count: displayCredits ?? 0,
              })}
            />

            {/* Text Input */}
            <View style={styles.section}>
              <SectionLabel>{t("speech.text")}</SectionLabel>
              <PromptInput
                onSubmit={handleGenerate}
                isLoading={isGenerating}
                placeholder={SPEECH_PROMPTS.placeholder}
                examples={SPEECH_PROMPTS.examples}
                maxLength={5000}
                buttonLabel={t("speech.generateSpeech")}
                loadingLabel={t("speech.generating")}
                value={text}
                onValueChange={setText}
                minHeight={150}
              />
            </View>

            {/* Voice Selection */}
            <View style={styles.section}>
              <SectionLabel>{t("speech.voice")}</SectionLabel>
              <View style={styles.voiceGrid}>
                {AVAILABLE_VOICES.slice(0, 12).map((voice) => (
                  <VoiceOption key={voice.id} voice={voice} />
                ))}
              </View>
            </View>

            {/* Error */}
            {error && <ErrorCard message={error} onDismiss={clearError} />}

            {/* Audio Player */}
            {audioUrl && (
              <View style={[styles.playerCard, { backgroundColor: tc.surfaceElevated }]}>
                <View style={styles.playerHeader}>
                  <Feather name="check-circle" size={20} color="#34C759" />
                  <Text style={[styles.playerTitle, { color: tc.text }]}>
                    {t("speech.complete")}
                  </Text>
                </View>

                <View style={styles.playerControls}>
                  <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
                    <Feather name={isPlaying ? "pause" : "play"} size={32} color="#fff" />
                  </TouchableOpacity>
                  <View style={styles.playerInfo}>
                    <Text style={[styles.playerVoice, { color: tc.text }]}>
                      {t("speech.voiceLabel", {
                        voice:
                          AVAILABLE_VOICES.find((v) => v.id === selectedVoice)?.name ||
                          selectedVoice,
                      })}
                    </Text>
                    <Text style={[styles.playerStatus, { color: tc.textSecondary }]}>
                      {isPlaying ? t("speech.playing") : t("speech.tapToPlay")}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Loading */}
            {isGenerating && (
              <GenerationLoadingState
                title={t("speech.generating")}
                subtitle={t("speech.generatingTime")}
              />
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
  voiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  voiceOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  voiceOptionSelected: {
    borderColor: BRAND.colors.primary,
    backgroundColor: "#E3F2FD",
  },
  voiceIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceName: {
    fontSize: 14,
  },
  voiceNameSelected: {
    fontWeight: "600",
    color: BRAND.colors.primary,
  },
  playerCard: {
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  playerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#9C27B0",
    alignItems: "center",
    justifyContent: "center",
  },
  playerInfo: {
    flex: 1,
    gap: 4,
  },
  playerVoice: {
    fontSize: 16,
    fontWeight: "500",
  },
  playerStatus: {
    fontSize: 14,
  },
});
