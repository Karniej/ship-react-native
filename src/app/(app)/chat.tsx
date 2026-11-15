import { useState, useEffect, useCallback, useRef } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, // Keep for button loading states
  StyleSheet,
  Alert,
} from "react-native";

import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";

import { NativeProgress } from "@components/ui/native";
import { BRAND } from "@constants/brand";
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

import { OfflineState, ScreenHeader } from "@/components/ui";
import { useI18n } from "@/hooks/useI18n";
import { useNetworkState } from "@/hooks/useNetworkState";
import { chatService, CHAT_MODELS, type ChatMessage, type ChatModel } from "@/services/ai";
import { PostHogAnalytics } from "@/services/PostHogService";
import { useAIStore } from "@/store/useAIStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import { usePremiumStore } from "@/store/usePremiumStore";
import { haptics } from "@/utils/haptics";

interface DisplayMessage extends ChatMessage {
  id: string;
  timestamp: Date;
}

export default function ChatScreen() {
  const router = useRouter();
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const posthog = usePostHog();
  const { t } = useI18n();
  const { isOffline } = useNetworkState();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ChatModel>("gpt-4o-mini");
  const [showModelPicker, setShowModelPicker] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const { credits, loadCredits, transcribeAudio } = useAIStore();
  const { isSubscribed } = usePremiumStore();
  const { cachedCredits } = useOfflineStore();

  // Spin animation for send button loading
  const spinValue = useSharedValue(0);
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value * 360}deg` }],
  }));

  useEffect(() => {
    if (isLoading) {
      spinValue.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      spinValue.value = withTiming(0, { duration: 300 });
    }
  }, [isLoading, spinValue]);

  useEffect(() => {
    loadCredits();
    PostHogAnalytics.trackScreenViewed(posthog, "chat");
  }, [loadCredits, posthog]);

  const displayCredits = isOffline && credits === null ? cachedCredits : credits;

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (isOffline) {
      haptics.warning();
      Alert.alert(t("offline.title"), t("offline.message"));
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

    const validation = chatService.validateMessage(inputText);
    if (!validation.valid) {
      haptics.warning();
      Alert.alert(t("common.error"), validation.error);
      return;
    }

    haptics.medium();

    const userMessage: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    scrollToBottom();

    PostHogAnalytics.trackGenerationStarted(posthog, "chat", "chat", selectedModel);

    try {
      // Build conversation history for context
      const conversationHistory: ChatMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      conversationHistory.push({ role: "user", content: userMessage.content });

      const result = await chatService.sendMessage(conversationHistory, {
        model: selectedModel,
      });

      if (result.success && result.message) {
        haptics.success();
        const assistantMessage: DisplayMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        PostHogAnalytics.trackGenerationCompleted(posthog, "chat", "chat", selectedModel, 1);
      } else {
        haptics.error();
        Alert.alert(t("common.error"), result.error || t("errors.generic"));
        PostHogAnalytics.trackGenerationFailed(
          posthog,
          "chat",
          "chat",
          result.error || "Unknown error"
        );
      }
    } catch (error) {
      haptics.error();
      Alert.alert(t("common.error"), t("errors.generic"));
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      PostHogAnalytics.trackGenerationFailed(posthog, "chat", "chat", errorMessage);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleCopyMessage = async (content: string) => {
    haptics.light();
    try {
      await Clipboard.setStringAsync(content);
      haptics.success();
    } catch {
      haptics.error();
    }
  };

  const handleClearChat = () => {
    haptics.medium();
    Alert.alert(t("chat.clearChat"), t("chat.clearChatConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.clear"),
        style: "destructive",
        onPress: () => {
          setMessages([]);
          haptics.success();
        },
      },
    ]);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        haptics.warning();
        Alert.alert(t("common.error"), t("transcription.microphonePermission"));
        return;
      }

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      setIsRecording(true);
      haptics.medium();
    } catch (err) {
      haptics.error();
      console.error("Failed to start recording:", err);
      Alert.alert(t("common.error"), t("errors.generic"));
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
      });

      setIsRecording(false);

      if (uri) {
        setIsTranscribing(true);
        haptics.light();

        const result = await transcribeAudio(uri);

        if (result.success && result.text) {
          const transcribedText = result.text;
          setInputText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
          haptics.success();
        } else {
          haptics.error();
          Alert.alert(t("common.error"), result.error || t("errors.generic"));
        }

        setIsTranscribing(false);
      }
    } catch (err) {
      haptics.error();
      console.error("Failed to stop recording:", err);
      Alert.alert(t("common.error"), t("errors.generic"));
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  // Audio hook handles its own cleanup

  const renderMessage = ({ item }: { item: DisplayMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser
              ? styles.userBubble
              : [styles.assistantBubble, { backgroundColor: tc.surfaceElevated }],
          ]}
        >
          <Text
            style={[styles.messageText, isUser ? styles.userMessageText : { color: tc.text }]}
            selectable
          >
            {item.content}
          </Text>
        </View>
        {!isUser && (
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopyMessage(item.content)}
          >
            <Feather name="copy" size={14} color={tc.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isOffline) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: tc.background }]}
        edges={["top", "bottom"]}
      >
        <View style={styles.offlineHeader}>
          <ScreenHeader title={t("chat.title")} />
        </View>
        <OfflineState onRetry={loadCredits} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: tc.background }]}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
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
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: tc.text }]}>{t("chat.title")}</Text>
            <TouchableOpacity
              style={styles.modelSelector}
              onPress={() => {
                haptics.light();
                setShowModelPicker(!showModelPicker);
              }}
            >
              <Text style={[styles.modelText, { color: tc.textSecondary }]}>
                {CHAT_MODELS.find((m) => m.id === selectedModel)?.name}
              </Text>
              <Feather
                name={showModelPicker ? "chevron-up" : "chevron-down"}
                size={14}
                color={tc.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleClearChat}
            style={styles.clearButton}
            disabled={messages.length === 0}
          >
            <Feather name="trash-2" size={20} color={messages.length === 0 ? "#ccc" : tc.text} />
          </TouchableOpacity>
        </View>

        {/* Model Picker Dropdown */}
        {showModelPicker && (
          <View style={[styles.modelDropdown, { backgroundColor: tc.surfaceElevated }]}>
            {CHAT_MODELS.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelOption,
                  selectedModel === model.id && styles.modelOptionSelected,
                ]}
                onPress={() => {
                  haptics.light();
                  setSelectedModel(model.id);
                  setShowModelPicker(false);
                }}
              >
                <View>
                  <Text
                    style={[
                      styles.modelOptionName,
                      { color: tc.text },
                      selectedModel === model.id && styles.modelOptionNameSelected,
                    ]}
                  >
                    {model.name}
                  </Text>
                  <Text style={[styles.modelOptionDesc, { color: tc.textSecondary }]}>
                    {model.description}
                  </Text>
                </View>
                {selectedModel === model.id && (
                  <Feather name="check" size={18} color={tc.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="message-circle" size={48} color="#ccc" />
              <Text style={[styles.emptyText, { color: tc.textSecondary }]}>
                {t("chat.emptyState")}
              </Text>
              <Text style={[styles.emptyHint, { color: tc.textTertiary }]}>
                {t("chat.emptyHint")}
              </Text>
            </View>
          }
          onContentSizeChange={scrollToBottom}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <NativeProgress color={tc.primary} />
            <Text style={[styles.loadingText, { color: tc.textSecondary }]}>
              {t("chat.thinking")}
            </Text>
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: tc.backgroundSecondary }]}>
          {/* Microphone Button */}
          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording && styles.micButtonRecording,
              { backgroundColor: tc.surfaceElevated },
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isLoading || isTranscribing}
          >
            {isTranscribing ? (
              <ActivityIndicator size="small" color={tc.primary} />
            ) : (
              <Feather
                name={isRecording ? "square" : "mic"}
                size={20}
                color={isRecording ? "#FF3B30" : isLoading ? "#ccc" : tc.primary}
              />
            )}
          </TouchableOpacity>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: tc.surfaceElevated,
                color: tc.text,
              },
            ]}
            placeholder={isRecording ? t("transcription.recording") : t("chat.placeholder")}
            placeholderTextColor={isRecording ? "#FF3B30" : tc.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={32000}
            editable={!isLoading && !isRecording}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isRecording) &&
                !isLoading && {
                  backgroundColor: tc.borderSubtle,
                },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading || isRecording}
          >
            <Animated.View style={isLoading ? spinStyle : undefined}>
              <Feather
                name={isLoading ? "refresh-cw" : "send"}
                size={20}
                color={!inputText.trim() || isLoading || isRecording ? "#fff" : "#fff"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  offlineHeader: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modelSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  modelText: {
    fontSize: 12,
  },
  clearButton: {
    padding: 8,
  },
  modelDropdown: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modelOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
  },
  modelOptionSelected: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  modelOptionName: {
    fontSize: 16,
    fontWeight: "500",
  },
  modelOptionNameSelected: {
    color: BRAND.colors.primary,
  },
  modelOptionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyHint: {
    fontSize: 14,
    textAlign: "center",
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  assistantMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: BRAND.colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#fff",
  },
  copyButton: {
    padding: 4,
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: Platform.OS === "android" ? 24 : 12,
    gap: 8,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonRecording: {
    backgroundColor: "#FFE5E5",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {},
});
