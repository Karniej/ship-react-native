import React from "react";

import { StyleSheet, View, Image, type ViewStyle, type ImageStyle } from "react-native";

import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

import { colors, componentSizes, borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

import { Text } from "./Text";

// ============================================================================
// TYPES
// ============================================================================

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface AvatarProps {
  /** Image source URL */
  source?: string;
  /** Fallback initials (e.g., "JD" for John Doe) */
  initials?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Size variant */
  size?: AvatarSize;
  /** Show online status indicator */
  showStatus?: boolean;
  /** Online status */
  isOnline?: boolean;
  /** Enable enter animation */
  animated?: boolean;
  /** Custom background color for initials */
  backgroundColor?: string;
  /** Custom style */
  style?: ViewStyle;
}

interface AvatarGroupProps {
  /** Array of avatar data */
  avatars: { source?: string; initials?: string; alt?: string }[];
  /** Size of each avatar */
  size?: AvatarSize;
  /** Maximum avatars to display */
  max?: number;
  /** Custom style */
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Avatar({
  source,
  initials,
  alt,
  size = "md",
  showStatus = false,
  isOnline = false,
  animated = false,
  backgroundColor,
  style,
}: AvatarProps) {
  const { isDark } = useAppTheme();

  const avatarSize = getAvatarSize(size);
  const initialsSize = getInitialsSize(size);
  const statusSize = getStatusSize(size);

  const bgColor = backgroundColor || (isDark ? colors.gray[600] : colors.gray[300]);

  const textColor = isDark ? colors.text.primary.dark : colors.text.primary.light;

  const containerStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
  };

  const content = source ? (
    <Image
      source={{ uri: source }}
      style={[styles.image, containerStyle as ImageStyle]}
      accessibilityLabel={alt}
    />
  ) : (
    <View style={[styles.initialsContainer, containerStyle, { backgroundColor: bgColor }]}>
      <Text variant="label" style={{ fontSize: initialsSize, color: textColor }}>
        {initials?.substring(0, 2).toUpperCase() || "?"}
      </Text>
    </View>
  );

  const avatar = (
    <View style={[styles.container, style]}>
      {animated ? (
        <Animated.View entering={ZoomIn.duration(300)}>{content}</Animated.View>
      ) : (
        content
      )}
      {showStatus && (
        <Animated.View
          entering={animated ? FadeIn.delay(200) : undefined}
          style={[
            styles.status,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: isOnline ? colors.success : colors.gray[400],
              borderColor: isDark ? colors.background.dark : colors.background.light,
            },
          ]}
        />
      )}
    </View>
  );

  return avatar;
}

// ============================================================================
// AVATAR GROUP
// ============================================================================

export function AvatarGroup({ avatars, size = "md", max = 4, style }: AvatarGroupProps) {
  const { isDark } = useAppTheme();
  const avatarSize = getAvatarSize(size);
  const overlap = avatarSize * 0.3;

  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <View style={[styles.group, style]}>
      {displayAvatars.map((avatar, index) => (
        <View
          key={index}
          style={[
            styles.groupItem,
            {
              marginLeft: index > 0 ? -overlap : 0,
              zIndex: displayAvatars.length - index,
            },
          ]}
        >
          <Avatar
            source={avatar.source}
            initials={avatar.initials}
            alt={avatar.alt}
            size={size}
            style={{
              borderWidth: 2,
              borderColor: isDark ? colors.background.dark : colors.background.light,
            }}
          />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            styles.groupItem,
            {
              marginLeft: -overlap,
              zIndex: 0,
            },
          ]}
        >
          <View
            style={[
              styles.remaining,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                backgroundColor: isDark ? colors.gray[700] : colors.gray[200],
                borderWidth: 2,
                borderColor: isDark ? colors.background.dark : colors.background.light,
              },
            ]}
          >
            <Text variant="labelSmall" style={{ fontSize: getInitialsSize(size) * 0.8 }}>
              +{remaining}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// SIZE HELPERS
// ============================================================================

function getAvatarSize(size: AvatarSize): number {
  return componentSizes.avatar[size];
}

function getInitialsSize(size: AvatarSize): number {
  const sizes: Record<AvatarSize, number> = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 18,
    xl: 24,
    "2xl": 32,
  };
  return sizes[size];
}

function getStatusSize(size: AvatarSize): number {
  const sizes: Record<AvatarSize, number> = {
    xs: 6,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 14,
    "2xl": 18,
  };
  return sizes[size];
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    resizeMode: "cover",
  },
  initialsContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  status: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
  group: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupItem: {},
  remaining: {
    justifyContent: "center",
    alignItems: "center",
  },
});
