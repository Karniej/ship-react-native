import React, { useEffect, useRef } from "react";

import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";

import { Feather } from "@expo/vector-icons";
import { useI18n } from "@hooks/useI18n";
import { useNetworkState } from "@hooks/useNetworkState";
import { useTheme } from "expo-router/react-navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface OfflineIndicatorProps {
  /** Show at the top or bottom of the screen */
  position?: "top" | "bottom";
  /** Whether the indicator can be dismissed */
  dismissible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Custom message to display */
  message?: string;
}

/**
 * OfflineIndicator Component
 *
 * Displays a banner when the device is offline.
 * Automatically shows/hides based on network state.
 *
 * Usage:
 * ```tsx
 * // In your root layout or screen
 * <OfflineIndicator />
 *
 * // With options
 * <OfflineIndicator
 *   position="bottom"
 *   dismissible
 *   onDismiss={() => console.log('Dismissed')}
 * />
 * ```
 */
export function OfflineIndicator({
  position = "top",
  dismissible = false,
  onDismiss,
  message,
}: OfflineIndicatorProps) {
  const { isConnected, isInternetReachable } = useNetworkState();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Determine if we should show the indicator
  const isOffline = isConnected === false || isInternetReachable === false;
  const shouldShow = isOffline && !isDismissed;

  useEffect(() => {
    // Reset dismissed state when coming back online
    if (!isOffline) {
      setIsDismissed(false);
    }

    // Animate in/out
    Animated.spring(slideAnim, {
      toValue: shouldShow ? 0 : position === "top" ? -100 : 100,
      useNativeDriver: true,
      damping: 15,
      stiffness: 150,
    }).start();
  }, [shouldShow, isOffline, position, slideAnim]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Don't render if not needed
  if (!isOffline && !shouldShow) {
    return null;
  }

  const displayMessage = message || t("offline.title");
  const subMessage = t("offline.message");

  return (
    <Animated.View
      style={[
        styles.container,
        position === "top"
          ? { top: 0, paddingTop: insets.top }
          : { bottom: 0, paddingBottom: insets.bottom },
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: theme.dark ? "#B91C1C" : "#DC2626",
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="wifi-off" size={18} color="#fff" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{displayMessage}</Text>
          <Text style={styles.subtitle}>{subMessage}</Text>
        </View>

        {dismissible && (
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.dismissButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * Compact version for inline use
 */
export function OfflineBadge() {
  const { isConnected, isInternetReachable } = useNetworkState();
  const { t } = useI18n();

  const isOffline = isConnected === false || isInternetReachable === false;

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Feather name="wifi-off" size={12} color="#fff" />
      <Text style={styles.badgeText}>{t("offline.title")}</Text>
    </View>
  );
}

/**
 * Hook to check offline status with message
 */
export function useOfflineStatus() {
  const { isConnected, isInternetReachable } = useNetworkState();
  const { t } = useI18n();

  const isOffline = isConnected === false || isInternetReachable === false;

  return {
    isOffline,
    message: isOffline ? t("offline.title") : null,
    description: isOffline ? t("offline.message") : null,
  };
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 2,
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
  },
});

export default OfflineIndicator;
