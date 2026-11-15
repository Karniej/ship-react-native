import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

import { NativeContextMenu, type ContextMenuAction } from "@components/ui/native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";

import type { Generation, ContentType } from "@/types/generation.types";
import { getContentType, getContentTypeIcon, getGenerationDate } from "@/types/generation.types";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 48) / 2; // 2 columns with padding

interface GalleryItemProps {
  generation: Generation;
  onPress: (generation: Generation) => void;
  onShare?: (generation: Generation) => void;
  onDelete?: (generation: Generation) => void;
  onCopy?: (generation: Generation) => void;
}

export function GalleryItem({ generation, onPress, onShare, onDelete, onCopy }: GalleryItemProps) {
  const theme = useTheme();
  const contentType = getContentType(generation.provider);
  const icon = getContentTypeIcon(contentType);

  // Context menu actions for long-press
  const contextMenuActions: ContextMenuAction[] = [
    ...(onShare ? [{ id: "share", title: "Share", icon: "square.and.arrow.up" }] : []),
    ...(onCopy ? [{ id: "copy", title: "Copy", icon: "doc.on.doc" }] : []),
    ...(onDelete ? [{ id: "delete", title: "Delete", icon: "trash", destructive: true }] : []),
  ];

  const handleContextMenuAction = (actionId: string) => {
    switch (actionId) {
      case "share":
        onShare?.(generation);
        break;
      case "copy":
        onCopy?.(generation);
        break;
      case "delete":
        onDelete?.(generation);
        break;
    }
  };

  const renderThumbnail = () => {
    switch (contentType) {
      case "image":
        return generation.output_url ? (
          <Image
            source={{ uri: generation.output_url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.placeholder, { backgroundColor: theme.dark ? "#2C2C2E" : "#F2F2F7" }]}
          >
            <Feather name="image" size={32} color={theme.dark ? "#666" : "#999"} />
          </View>
        );

      case "video":
        return (
          <View style={[styles.placeholder, { backgroundColor: "#E91E63" }]}>
            <View style={styles.videoPlayIcon}>
              <Feather name="play" size={32} color="#fff" />
            </View>
            {generation.output_url && (
              <Image
                source={{ uri: generation.output_url }}
                style={[styles.thumbnail, styles.videoThumbnail]}
                resizeMode="cover"
              />
            )}
          </View>
        );

      case "audio":
        return (
          <View style={[styles.placeholder, { backgroundColor: "#9C27B0" }]}>
            <Feather name="music" size={32} color="#fff" />
            <View style={styles.audioWave}>
              {[...Array(5)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.audioBar,
                    {
                      height: 8 + Math.random() * 16,
                      backgroundColor: "rgba(255,255,255,0.6)",
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        );

      case "text":
        const isTranscription = generation.provider === "transcription";
        const outputData = generation.output_data as {
          text?: string;
          analysis?: string;
        } | null;
        const previewText = outputData?.text || outputData?.analysis || generation.prompt || "";

        return (
          <View
            style={[
              styles.placeholder,
              { backgroundColor: isTranscription ? "#FF5722" : "#2196F3" },
            ]}
          >
            <Feather name={isTranscription ? "file-text" : "eye"} size={24} color="#fff" />
            <Text style={styles.textPreview} numberOfLines={3}>
              {previewText.substring(0, 80)}...
            </Text>
          </View>
        );

      default:
        return (
          <View
            style={[styles.placeholder, { backgroundColor: theme.dark ? "#2C2C2E" : "#F2F2F7" }]}
          >
            <Feather name="file" size={32} color={theme.dark ? "#666" : "#999"} />
          </View>
        );
    }
  };

  const getTypeColor = (): string => {
    switch (contentType) {
      case "image":
        return "#4CAF50";
      case "video":
        return "#E91E63";
      case "audio":
        return "#9C27B0";
      case "text":
        return generation.provider === "transcription" ? "#FF5722" : "#2196F3";
      default:
        return "#666";
    }
  };

  const formattedDate = getGenerationDate(generation).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const content = (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.dark ? "#1C1C1E" : "#fff" }]}
      onPress={() => onPress(generation)}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailContainer}>
        {renderThumbnail()}
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
          <Feather name={icon as any} size={12} color="#fff" />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.prompt, { color: theme.colors.text }]} numberOfLines={2}>
          {generation.prompt || getContentTypeLabel(contentType)}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: theme.dark ? "#999" : "#666" }]}>
            {generation.model}
          </Text>
          <Text style={[styles.metaText, { color: theme.dark ? "#999" : "#666" }]}>
            {formattedDate}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Wrap with context menu if any actions are available
  if (contextMenuActions.length > 0) {
    return (
      <NativeContextMenu actions={contextMenuActions} onAction={handleContextMenuAction}>
        {content}
      </NativeContextMenu>
    );
  }

  return content;
}

const getContentTypeLabel = (contentType: ContentType): string => {
  switch (contentType) {
    case "image":
      return "Generated Image";
    case "video":
      return "Generated Video";
    case "audio":
      return "Generated Audio";
    case "text":
      return "Text Result";
    default:
      return "Generation";
  }
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_SIZE,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    width: "100%",
    height: ITEM_SIZE,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  videoThumbnail: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0.8,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayIcon: {
    position: "absolute",
    zIndex: 10,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  audioWave: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginTop: 12,
  },
  audioBar: {
    width: 4,
    borderRadius: 2,
  },
  textPreview: {
    color: "#fff",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 8,
    opacity: 0.9,
  },
  typeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    padding: 10,
  },
  prompt: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  metaText: {
    fontSize: 11,
  },
});
