import { useEffect, useState, useCallback, useMemo } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";

import { useRouter } from "expo-router";

import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@hooks/useAppTheme";

import { GalleryItem, GalleryDetailModal } from "@/components/gallery";
import { NoDataState, OfflineState } from "@/components/ui/EmptyState";
import { SkeletonGenerationCard } from "@/components/ui/Skeleton";
import { API_MODE, API_BASE_URL } from "@/constants/api";
import { useI18n } from "@/hooks/useI18n";
import { useNetworkState } from "@/hooks/useNetworkState";
import { useAIStore } from "@/store/useAIStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import type { Generation, ContentType } from "@/types/generation.types";
import { getContentType } from "@/types/generation.types";
import { haptics } from "@/utils/haptics";

const { width } = Dimensions.get("window");

type FilterType = "all" | ContentType;

interface FilterOption {
  type: FilterType;
  label: string;
  icon: string;
  color: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { type: "all", label: "All", icon: "grid", color: "#666" },
  { type: "image", label: "Images", icon: "image", color: "#4CAF50" },
  { type: "video", label: "Videos", icon: "video", color: "#E91E63" },
  { type: "audio", label: "Audio", icon: "music", color: "#9C27B0" },
  { type: "text", label: "Text", icon: "file-text", color: "#2196F3" },
];

export default function GalleryScreen() {
  const router = useRouter();
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const { t } = useI18n();
  const generations = useAIStore((s) => s.generations);
  const loadGenerations = useAIStore((s) => s.loadGenerations);
  const isLoading = useAIStore((s) => s.isLoading);
  const { isOffline } = useNetworkState();
  const cachedGenerations = useOfflineStore((s) => s.cachedGenerations);

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  useEffect(() => {
    loadGenerations();
  }, [loadGenerations]);

  const displayGenerations = useMemo(() => {
    const data = isOffline && generations.length === 0 ? cachedGenerations : generations;

    if (activeFilter === "all") {
      return data;
    }

    return data.filter((gen) => getContentType(gen.provider) === activeFilter);
  }, [generations, cachedGenerations, isOffline, activeFilter]);

  const filterCounts = useMemo(() => {
    const data = isOffline && generations.length === 0 ? cachedGenerations : generations;
    const counts: Record<FilterType, number> = {
      all: data.length,
      image: 0,
      video: 0,
      audio: 0,
      text: 0,
    };

    data.forEach((gen) => {
      const type = getContentType(gen.provider);
      counts[type]++;
    });

    return counts;
  }, [generations, cachedGenerations, isOffline]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await loadGenerations();
    setRefreshing(false);
  }, [loadGenerations]);

  const handleItemPress = (generation: Generation) => {
    haptics.light();
    setSelectedGeneration(generation);
    setIsDetailModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      haptics.medium();

      if (API_MODE === "convex") {
        // In Convex mode, use the deleteGeneration mutation
        console.warn("Use Convex mutation to delete generation in Convex mode");
      } else {
        // Expo API Routes mode
        const response = await fetch(`${API_BASE_URL}/api/generations/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete");
        }
      }

      loadGenerations();
      haptics.success();
    } catch (error) {
      console.error("Failed to delete generation:", error);
      haptics.error();
    }
  };

  const handleFilterPress = (filter: FilterType) => {
    haptics.light();
    setActiveFilter(filter);
  };

  const renderHeader = () => (
    <View style={styles.filtersWrapper}>
      {/* Offline Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Feather name="wifi-off" size={16} color="#F57C00" />
          <Text style={styles.offlineBannerText}>{t("offline.cachedData")}</Text>
        </View>
      )}

      {/* Filter Pills */}
      <View style={styles.filtersContainer}>
        {FILTER_OPTIONS.map((option) => {
          const isActive = activeFilter === option.type;
          const count = filterCounts[option.type];

          return (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? option.color : tc.backgroundSecondary,
                },
              ]}
              onPress={() => handleFilterPress(option.type)}
            >
              <Feather
                name={option.icon as any}
                size={14}
                color={isActive ? "#fff" : tc.textSecondary}
              />
              <Text style={[styles.filterText, { color: isActive ? "#fff" : tc.textSecondary }]}>
                {option.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    {
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.3)"
                        : isDark
                          ? "#444"
                          : "#E0E0E0",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      {
                        color: isActive ? "#fff" : tc.textSecondary,
                      },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Results Count */}
      <Text style={[styles.resultsCount, { color: tc.textSecondary }]}>
        {displayGenerations.length}{" "}
        {displayGenerations.length === 1 ? t("gallery.item") : t("gallery.items")}
      </Text>
    </View>
  );

  const renderItem = ({ item, index }: { item: Generation; index: number }) => (
    <View style={[styles.itemWrapper, index % 2 === 0 ? styles.itemLeft : styles.itemRight]}>
      <GalleryItem generation={item} onPress={handleItemPress} />
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonRow}>
            <SkeletonGenerationCard style={styles.skeletonItem} />
            <SkeletonGenerationCard style={styles.skeletonItem} />
          </View>
          <View style={styles.skeletonRow}>
            <SkeletonGenerationCard style={styles.skeletonItem} />
            <SkeletonGenerationCard style={styles.skeletonItem} />
          </View>
        </View>
      );
    }

    if (isOffline) {
      return <OfflineState onRetry={onRefresh} />;
    }

    return (
      <NoDataState
        title={activeFilter === "all" ? t("gallery.noGenerations") : t("gallery.noItemsInCategory")}
        description={
          activeFilter === "all" ? t("gallery.noGenerationsDesc") : t("gallery.tryDifferentFilter")
        }
        actionLabel={activeFilter === "all" ? t("gallery.createFirst") : t("gallery.showAll")}
        onAction={() => {
          haptics.medium();
          if (activeFilter === "all") {
            router.push("/(app)/generate");
          } else {
            setActiveFilter("all");
          }
        }}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
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
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.title, { color: tc.text }]}>{t("gallery.title")}</Text>
          <Text style={[styles.subtitle, { color: tc.textSecondary }]}>
            {t("gallery.subtitle")}
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton} disabled={refreshing}>
          <Feather
            name="refresh-cw"
            size={20}
            color={tc.text}
            style={refreshing ? styles.spinning : undefined}
          />
        </TouchableOpacity>
      </View>

      {/* Gallery Grid */}
      <FlatList
        data={displayGenerations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        initialNumToRender={6}
        windowSize={5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tc.text} />
        }
      />

      {/* Detail Modal */}
      <GalleryDetailModal
        visible={isDetailModalVisible}
        generation={selectedGeneration}
        onClose={() => {
          setIsDetailModalVisible(false);
          setSelectedGeneration(null);
        }}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
  },
  refreshButton: {
    padding: 8,
  },
  spinning: {
    opacity: 0.5,
  },
  filtersWrapper: {
    paddingBottom: 8,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  offlineBannerText: {
    color: "#E65100",
    fontSize: 14,
    fontWeight: "500",
  },
  filtersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  resultsCount: {
    fontSize: 13,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  itemWrapper: {
    width: (width - 48) / 2,
  },
  itemLeft: {
    marginRight: 8,
  },
  itemRight: {
    marginLeft: 8,
  },
  skeletonContainer: {
    paddingTop: 16,
    gap: 16,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skeletonItem: {
    width: (width - 48) / 2,
    height: (width - 48) / 2 + 60,
    borderRadius: 12,
  },
});
