import React, { useEffect } from "react";

import { StyleSheet, View, Modal, Pressable, type ViewStyle } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing, zIndex, animation } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

import { IconButton } from "./IconButton";
import { Text } from "./Text";

// ============================================================================
// TYPES
// ============================================================================

interface FullScreenModalProps {
  /** Control modal visibility */
  visible: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Optional title */
  title?: string;
  /** Show close button */
  showCloseButton?: boolean;
  /** Close button position */
  closeButtonPosition?: "left" | "right";
  /** Custom header content */
  headerContent?: React.ReactNode;
  /** Background color */
  backgroundColor?: string;
  /** Animation type */
  animationType?: "fade" | "slide" | "scale";
  /** Close on backdrop press */
  closeOnBackdrop?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FullScreenModal({
  visible,
  onClose,
  children,
  title,
  showCloseButton = true,
  closeButtonPosition = "right",
  headerContent,
  backgroundColor,
  animationType = "fade",
  closeOnBackdrop = false,
  style,
}: FullScreenModalProps) {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const translateY = useSharedValue(50);

  const bgColor = backgroundColor || (isDark ? "rgba(0, 0, 0, 0.95)" : "rgba(0, 0, 0, 0.9)");

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {
        duration: animation.duration.normal,
        easing: Easing.out(Easing.ease),
      });

      if (animationType === "scale") {
        scale.value = withSpring(1, animation.spring.default);
      } else if (animationType === "slide") {
        translateY.value = withSpring(0, animation.spring.default);
      }
    } else {
      opacity.value = withTiming(0, {
        duration: animation.duration.fast,
        easing: Easing.in(Easing.ease),
      });
      scale.value = withTiming(0.95, { duration: animation.duration.fast });
      translateY.value = withTiming(50, { duration: animation.duration.fast });
    }
  }, [visible, animationType]);

  // Animated styles
  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => {
    switch (animationType) {
      case "scale":
        return {
          transform: [{ scale: scale.value }],
          opacity: opacity.value,
        };
      case "slide":
        return {
          transform: [{ translateY: translateY.value }],
          opacity: opacity.value,
        };
      default:
        return {
          opacity: opacity.value,
        };
    }
  });

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { backgroundColor: bgColor }, animatedOverlayStyle]}>
        <Pressable style={styles.backdropPressable} onPress={handleBackdropPress} />

        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + spacing.md,
              flexDirection: closeButtonPosition === "left" ? "row" : "row-reverse",
            },
          ]}
        >
          {showCloseButton && (
            <IconButton
              icon="close"
              variant="subtle"
              color="default"
              size="md"
              onPress={onClose}
              style={styles.closeButton}
            />
          )}
          {title && (
            <Text variant="h5" color="inverse" style={styles.title}>
              {title}
            </Text>
          )}
          {headerContent}
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <Animated.View
          style={[styles.content, { paddingBottom: insets.bottom }, animatedContentStyle, style]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ============================================================================
// BOTTOM SHEET MODAL (Alternative style)
// ============================================================================

interface BottomSheetModalProps {
  /** Control modal visibility */
  visible: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Optional title */
  title?: string;
  /** Modal height (percentage or number) */
  height?: number | `${number}%`;
  /** Show handle indicator */
  showHandle?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

export function BottomSheetModal({
  visible,
  onClose,
  children,
  title,
  height = "50%",
  showHandle = true,
  style,
}: BottomSheetModalProps) {
  const { isDark, colors: themeColors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const overlayOpacity = useSharedValue(0);
  const translateY = useSharedValue(500);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, {
        duration: animation.duration.normal,
      });
      translateY.value = withSpring(0, animation.spring.default);
    } else {
      overlayOpacity.value = withTiming(0, {
        duration: animation.duration.fast,
      });
      translateY.value = withTiming(500, {
        duration: animation.duration.normal,
      });
    }
  }, [visible]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.bottomSheetContainer}>
        <Animated.View style={[styles.bottomSheetOverlay, animatedOverlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              height,
              backgroundColor: themeColors.surface,
              paddingBottom: insets.bottom,
            },
            animatedSheetStyle,
            style,
          ]}
        >
          {showHandle && <View style={styles.handle} />}
          {title && (
            <View style={styles.bottomSheetHeader}>
              <Text variant="h5">{title}</Text>
            </View>
          )}
          <View style={styles.bottomSheetContent}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    zIndex: zIndex.modal,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFill,
  },
  header: {
    width: "100%",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Bottom Sheet styles
  bottomSheetContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomSheetOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[400],
    borderRadius: 2,
    alignSelf: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  bottomSheetHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
