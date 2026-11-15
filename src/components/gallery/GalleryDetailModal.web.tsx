import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from "react-native";

import * as Clipboard from "expo-clipboard";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";

import { useI18n } from "@/hooks/useI18n";
import type { Generation } from "@/types/generation.types";
import { getContentType, getContentTypeIcon, getGenerationDate } from "@/types/generation.types";
import { fileDownload } from "@/utils/fileDownload";
import { haptics } from "@/utils/haptics";

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

  if (!generation) return null;

  const contentType = getContentType(generation.provider);
  const icon = getContentTypeIcon(contentType);
  const outputData = generation.output_data as {
    text?: string;
    analysis?: string;
  } | null;
  const textContent = outputData?.text || outputData?.analysis || "";
  const formattedDate = getGenerationDate(generation).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCopyText = async () => {
    const text = textContent || generation.prompt || "";
    await Clipboard.setStringAsync(text);
    Alert.alert(t("common.success"), t("gallery.copiedToClipboard"));
  };

  const handleDownload = async () => {
    if (!generation.output_url) return;

    const result = await fileDownload.download({
      url: generation.output_url,
      filename: `generation_${generation.id}`,
      fileType: contentType === "video" ? "video" : contentType === "audio" ? "audio" : "image",
    });

    if (!result.success) {
      Alert.alert(t("common.error"), result.error || t("gallery.saveFailed"));
    }
  };

  const handleDelete = () => {
    haptics.warning();
    onDelete(generation.id);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.dark ? "#333" : "#E5E5EA" }]}>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Feather name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(contentType) }]}>
                <Feather name={icon as any} size={14} color="#fff" />
              </View>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                {generation.model}
              </Text>
            </View>
            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <Feather name="trash-2" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {contentType === "image" && generation.output_url ? (
              <Image
                source={{ uri: generation.output_url }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.placeholder, { backgroundColor: getTypeColor(contentType) }]}>
                <Feather name={icon as any} size={42} color="#fff" />
                <Text style={styles.placeholderText}>{contentType}</Text>
              </View>
            )}

            {textContent ? (
              <View style={[styles.panel, { backgroundColor: theme.dark ? "#1C1C1E" : "#F9F9F9" }]}>
                <Text style={[styles.panelLabel, { color: theme.dark ? "#999" : "#666" }]}>
                  {contentType === "text" ? t("gallery.analysis") : t("gallery.prompt")}
                </Text>
                <Text style={[styles.panelText, { color: theme.colors.text }]}>{textContent}</Text>
              </View>
            ) : null}

            {generation.prompt ? (
              <View style={[styles.panel, { backgroundColor: theme.dark ? "#1C1C1E" : "#F9F9F9" }]}>
                <Text style={[styles.panelLabel, { color: theme.dark ? "#999" : "#666" }]}>
                  {t("gallery.prompt")}
                </Text>
                <Text style={[styles.panelText, { color: theme.colors.text }]}>
                  {generation.prompt}
                </Text>
              </View>
            ) : null}

            <View style={[styles.panel, { backgroundColor: theme.dark ? "#1C1C1E" : "#F9F9F9" }]}>
              <MetaRow label={t("gallery.provider")} value={generation.provider} />
              <MetaRow label={t("gallery.creditsUsed")} value={String(generation.credits_used)} />
              <MetaRow label={t("gallery.createdAt")} value={formattedDate} />
            </View>
          </ScrollView>

          <View style={[styles.actions, { borderTopColor: theme.dark ? "#333" : "#E5E5EA" }]}>
            {generation.output_url ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
                onPress={handleDownload}
              >
                <Feather name="download" size={20} color="#fff" />
                <Text style={styles.actionText}>{t("gallery.save")}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#2196F3" }]}
              onPress={handleCopyText}
            >
              <Feather name="copy" size={20} color="#fff" />
              <Text style={styles.actionText}>{t("common.copy")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaLabel, { color: theme.dark ? "#999" : "#666" }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

function getTypeColor(contentType: string): string {
  switch (contentType) {
    case "image":
      return "#4CAF50";
    case "video":
      return "#E91E63";
    case "audio":
      return "#9C27B0";
    case "text":
      return "#2196F3";
    default:
      return "#666";
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "90%",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconButton: {
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
  content: {
    padding: 16,
    gap: 16,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#000",
  },
  placeholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  placeholderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  panel: {
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  panelText: {
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  actions: {
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
  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default GalleryDetailModal;
