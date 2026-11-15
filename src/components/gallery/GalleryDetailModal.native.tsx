import { useState, useEffect } from "react";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useAudioPlayer, AudioModule } from "expo-audio";
import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { VideoView, useVideoPlayer } from "expo-video";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";

import { useI18n } from "@/hooks/useI18n";
import type { Generation } from "@/types/generation.types";
import { getContentType, getContentTypeIcon, getGenerationDate } from "@/types/generation.types";
import { fileDownload } from "@/utils/fileDownload";
import { haptics } from "@/utils/haptics";

const { width, height } = Dimensions.get("window");

interface GalleryDetailModalProps {
  visible: boolean;
  generation: Generation | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function GalleryDetailModal({
  visible,
  generation,
  onClose,
  onDelete,
}: GalleryDetailModalProps) {
  const theme = useTheme();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const contentType = generation ? getContentType(generation.provider) : "image";
  const icon = getContentTypeIcon(contentType);

  // Audio player for audio content
  const audioUrl = contentType === "audio" && generation?.output_url ? generation.output_url : "";
  const audioPlayer = useAudioPlayer(audioUrl);
  const isAudioPlaying = audioPlayer.playing;

  // Video player for video content
  const videoUrl = contentType === "video" && generation?.output_url ? generation.output_url : "";
  const videoPlayer = useVideoPlayer(videoUrl);

  // Pause audio when modal closes
  useEffect(() => {
    if (!visible && isAudioPlaying) {
      audioPlayer.pause();
    }
  }, [visible, isAudioPlaying, audioPlayer]);

  const handlePlayAudio = async () => {
    if (!generation?.output_url) return;

    try {
      haptics.light();

      // Configure audio mode for playback
      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      if (isAudioPlaying) {
        audioPlayer.pause();
      } else {
        audioPlayer.play();
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      haptics.error();
    }
  };

  const handleShare = async () => {
    if (!generation) return;

    try {
      haptics.light();
      const outputData = generation.output_data as {
        text?: string;
        analysis?: string;
      } | null;

      if (contentType === "text") {
        const text = outputData?.text || outputData?.analysis || "";
        await Sharing.shareAsync(text, { mimeType: "text/plain" }).catch(() => {
          // If sharing fails, copy to clipboard
          Clipboard.setStringAsync(text);
          Alert.alert(t("common.success"), t("gallery.copiedToClipboard"));
        });
      } else if (generation.output_url) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(generation.output_url);
        }
      }
      haptics.success();
    } catch (error) {
      console.error("Error sharing:", error);
      haptics.error();
    }
  };

  const handleSaveToGallery = async () => {
    if (!generation?.output_url) return;

    try {
      haptics.light();
      setIsLoading(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("common.error"), t("gallery.permissionDenied"));
        return;
      }

      const result = await fileDownload.download({
        url: generation.output_url,
        filename: `generation_${generation.id}`,
        fileType: contentType === "video" ? "video" : "image",
        saveToGallery: true,
      });

      if (result.success) {
        haptics.success();
        Alert.alert(t("common.success"), t("gallery.savedToGallery"));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error saving to gallery:", error);
      haptics.error();
      Alert.alert(t("common.error"), t("gallery.saveFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = async () => {
    if (!generation) return;

    try {
      haptics.light();
      const outputData = generation.output_data as {
        text?: string;
        analysis?: string;
      } | null;
      const text = outputData?.text || outputData?.analysis || generation.prompt || "";
      await Clipboard.setStringAsync(text);
      haptics.success();
      Alert.alert(t("common.success"), t("gallery.copiedToClipboard"));
    } catch (error) {
      console.error("Error copying:", error);
      haptics.error();
    }
  };

  const handleDelete = () => {
    if (!generation) return;

    haptics.warning();
    Alert.alert(t("common.delete"), t("gallery.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          haptics.medium();
          onDelete(generation.id);
          onClose();
        },
      },
    ]);
  };

  const renderContent = () => {
    if (!generation) return null;

    const outputData = generation.output_data as {
      text?: string;
      analysis?: string;
    } | null;

    switch (contentType) {
      case "image":
        return (
          <View style={styles.mediaContainer}>
            {generation.output_url ? (
              <Image
                source={{ uri: generation.output_url }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            ) : (
              <View
                style={[
                  styles.placeholder,
                  { backgroundColor: theme.dark ? "#2C2C2E" : "#F2F2F7" },
                ]}
              >
                <Feather name="image" size={48} color={theme.dark ? "#666" : "#999"} />
              </View>
            )}
          </View>
        );

      case "video":
        return (
          <View style={styles.mediaContainer}>
            {generation.output_url ? (
              <VideoView
                player={videoPlayer}
                style={styles.video}
                contentFit="contain"
                nativeControls
              />
            ) : (
              <View style={[styles.placeholder, { backgroundColor: "#E91E63" }]}>
                <Feather name="video" size={48} color="#fff" />
              </View>
            )}
          </View>
        );

      case "audio":
        return (
          <View style={[styles.audioContainer, { backgroundColor: "#9C27B0" }]}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayAudio}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Feather name={isAudioPlaying ? "pause" : "play"} size={48} color="#fff" />
              )}
            </TouchableOpacity>
            <Text style={styles.audioLabel}>
              {isAudioPlaying ? t("gallery.playing") : t("gallery.tapToPlay")}
            </Text>
            <View style={styles.audioWaveContainer}>
              {[...Array(12)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.audioWaveBar,
                    {
                      height: 16 + Math.sin(i * 0.5) * 24,
                      opacity: isAudioPlaying ? 1 : 0.5,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        );

      case "text":
        const text = outputData?.text || outputData?.analysis || "";
        const isTranscription = generation.provider === "transcription";

        return (
          <View
            style={[
              styles.textContainer,
              { backgroundColor: isTranscription ? "#FFF3E0" : "#E3F2FD" },
            ]}
          >
            <View style={styles.textHeader}>
              <Feather
                name={isTranscription ? "file-text" : "eye"}
                size={24}
                color={isTranscription ? "#FF5722" : "#2196F3"}
              />
              <Text style={[styles.textTitle, { color: isTranscription ? "#E65100" : "#1565C0" }]}>
                {isTranscription ? t("gallery.transcription") : t("gallery.analysis")}
              </Text>
            </View>
            <ScrollView style={styles.textScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.textContent, { color: theme.dark ? "#333" : "#333" }]}>
                {text || t("gallery.noContent")}
              </Text>
            </ScrollView>
          </View>
        );

      default:
        return null;
    }
  };

  if (!generation) return null;

  const formattedDate = getGenerationDate(generation).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.dark ? "#333" : "#E5E5EA" }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor: getTypeColor(contentType, generation.provider),
                },
              ]}
            >
              <Feather name={icon as any} size={14} color="#fff" />
            </View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {generation.model}
            </Text>
          </View>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Feather name="trash-2" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}

          {/* Prompt */}
          {generation.prompt && (
            <View
              style={[
                styles.promptContainer,
                { backgroundColor: theme.dark ? "#1C1C1E" : "#F9F9F9" },
              ]}
            >
              <Text style={[styles.promptLabel, { color: theme.dark ? "#999" : "#666" }]}>
                {t("gallery.prompt")}
              </Text>
              <Text style={[styles.promptText, { color: theme.colors.text }]}>
                {generation.prompt}
              </Text>
            </View>
          )}

          {/* Meta */}
          <View
            style={[styles.metaContainer, { backgroundColor: theme.dark ? "#1C1C1E" : "#F9F9F9" }]}
          >
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.dark ? "#999" : "#666" }]}>
                {t("gallery.provider")}
              </Text>
              <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                {generation.provider}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.dark ? "#999" : "#666" }]}>
                {t("gallery.creditsUsed")}
              </Text>
              <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                {generation.credits_used}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.dark ? "#999" : "#666" }]}>
                {t("gallery.createdAt")}
              </Text>
              <Text style={[styles.metaValue, { color: theme.colors.text }]}>{formattedDate}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        <View
          style={[styles.actionsContainer, { borderTopColor: theme.dark ? "#333" : "#E5E5EA" }]}
        >
          {(contentType === "image" || contentType === "video") && generation.output_url && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
              onPress={handleSaveToGallery}
              disabled={isLoading}
            >
              <Feather name="download" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>{t("gallery.save")}</Text>
            </TouchableOpacity>
          )}

          {contentType === "text" && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#2196F3" }]}
              onPress={handleCopyText}
            >
              <Feather name="copy" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>{t("common.copy")}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.dark ? "#333" : "#007AFF" }]}
            onPress={handleShare}
          >
            <Feather name="share" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>{t("common.share")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const getTypeColor = (contentType: string, provider: string): string => {
  switch (contentType) {
    case "image":
      return "#4CAF50";
    case "video":
      return "#E91E63";
    case "audio":
      return "#9C27B0";
    case "text":
      return provider === "transcription" ? "#FF5722" : "#2196F3";
    default:
      return "#666";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    gap: 16,
  },
  mediaContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  audioContainer: {
    width: "100%",
    aspectRatio: 1.5,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  audioLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  audioWaveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 48,
  },
  audioWaveBar: {
    width: 4,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 2,
  },
  textContainer: {
    borderRadius: 12,
    padding: 16,
    maxHeight: height * 0.4,
  },
  textHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  textTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  textScroll: {
    maxHeight: height * 0.3,
  },
  textContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  promptContainer: {
    borderRadius: 12,
    padding: 16,
  },
  promptLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  promptText: {
    fontSize: 15,
    lineHeight: 22,
  },
  metaContainer: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
