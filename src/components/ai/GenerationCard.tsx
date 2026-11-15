import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

import * as Sharing from "expo-sharing";

import { Feather } from "@expo/vector-icons";

import type { Generation } from "@/types/generation.types";
import { getGenerationUrl, getGenerationDate } from "@/types/generation.types";

interface GenerationCardProps {
  generation: Generation;
  onDelete?: (id: string) => void;
}

export function GenerationCard({ generation, onDelete }: GenerationCardProps) {
  const isImage = generation.provider !== "elevenlabs";
  const outputUrl = getGenerationUrl(generation);
  const formattedDate = getGenerationDate(generation).toLocaleDateString();

  const handleShare = async () => {
    if (outputUrl && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(outputUrl);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(generation.id);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name={isImage ? "image" : "music"} size={16} color="#666" />
          <Text style={styles.meta}>
            {generation.provider} - {generation.model}
          </Text>
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      {/* Content */}
      {isImage && outputUrl && (
        <Image source={{ uri: outputUrl }} style={styles.image} resizeMode="cover" />
      )}

      {!isImage && (
        <View style={styles.audioPlaceholder}>
          <Feather name="music" size={32} color="#666" />
          <Text style={styles.audioText}>Audio Generated</Text>
        </View>
      )}

      {/* Prompt */}
      {generation.prompt && (
        <Text style={styles.prompt} numberOfLines={2}>
          {generation.prompt}
        </Text>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Feather name="share-2" size={16} color="#007AFF" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        {onDelete && (
          <TouchableOpacity style={styles.actionButtonDanger} onPress={handleDelete}>
            <Feather name="trash-2" size={16} color="#FF3B30" />
            <Text style={styles.actionTextDanger}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meta: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  audioPlaceholder: {
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
  },
  audioText: {
    fontSize: 14,
    color: "#666",
  },
  prompt: {
    fontSize: 14,
    color: "#333",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 6,
  },
  actionText: {
    fontSize: 14,
    color: "#007AFF",
  },
  actionButtonDanger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: 6,
  },
  actionTextDanger: {
    fontSize: 14,
    color: "#FF3B30",
  },
});
