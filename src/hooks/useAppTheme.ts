import { useColorScheme } from "react-native";

import { useTheme } from "expo-router/react-navigation";

import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
  componentSizes,
  lightTheme,
  darkTheme,
  getThemeColor,
  accentDerived,
  opacity,
  cinematicGradient,
  withOpacity,
} from "../constants/theme";
import { useGeneralStore } from "../store/useGeneralStore";

/**
 * Comprehensive theme hook that provides access to all design tokens
 * and theme-aware color resolution.
 *
 * Usage:
 * const { isDark, theme, colors } = useAppTheme();
 */
export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const { theme: themePreference } = useGeneralStore();
  const navigationTheme = useTheme();

  // Determine actual theme based on preference
  const isDark =
    themePreference === "dark" || (themePreference === "system" && systemColorScheme === "dark");

  // Theme-resolved colors
  const themeColors = {
    // Backgrounds
    background: isDark ? colors.background.dark : colors.background.light,
    backgroundSecondary: isDark
      ? colors.background.darkSecondary
      : colors.background.lightSecondary,

    // Surfaces (layered depth system)
    surface: isDark ? colors.surface.dark : colors.surface.light,
    surfaceElevated: isDark ? colors.surface.darkElevated : colors.surface.lightElevated,
    surfaceHighest: isDark ? colors.surface.highest.dark : colors.surface.highest.light,

    // Text
    text: isDark ? colors.text.primary.dark : colors.text.primary.light,
    textSecondary: isDark ? colors.text.secondary.dark : colors.text.secondary.light,
    textTertiary: isDark ? colors.text.tertiary.dark : colors.text.tertiary.light,
    textDisabled: isDark ? colors.text.disabled.dark : colors.text.disabled.light,
    textInverse: isDark ? colors.text.inverse.dark : colors.text.inverse.light,

    // Borders
    border: isDark ? colors.border.dark : colors.border.light,
    borderStrong: isDark ? colors.border.darkStrong : colors.border.lightStrong,

    // Overlay
    overlay: isDark ? colors.overlay.dark : colors.overlay.light,

    // Skeleton
    skeleton: isDark ? colors.skeleton.dark : colors.skeleton.light,

    // Brand colors (same in both themes)
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    secondary: colors.secondary,
    secondaryLight: colors.secondaryLight,
    secondaryDark: colors.secondaryDark,
    tertiary: colors.tertiary,

    // Semantic colors (same in both themes)
    success: colors.success,
    successLight: colors.successLight,
    successDark: colors.successDark,
    error: colors.error,
    errorLight: colors.errorLight,
    errorDark: colors.errorDark,
    warning: colors.warning,
    warningLight: colors.warningLight,
    warningDark: colors.warningDark,
    info: colors.info,
    infoLight: colors.infoLight,
    infoDark: colors.infoDark,

    // Neutrals
    white: colors.white,
    black: colors.black,
    transparent: colors.transparent,
    gray: colors.gray,

    // VidNotes glass/surface tokens
    glass: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.70)",
    bgSubtle: isDark ? "rgba(255,255,255,0.07)" : colors.background.lightSecondary,
    cardDark: isDark ? "rgba(255,255,255,0.12)" : colors.surface.lightElevated,
    selectedCard: isDark ? withOpacity(colors.primary, 0.2) : withOpacity(colors.primary, 0.08),

    // VidNotes border tokens
    borderSubtle: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    borderMedium: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    borderAccent: colors.primary,

    // VidNotes text tokens
    textQuaternary: isDark ? "rgba(255,255,255,0.25)" : "rgba(60,60,67,0.18)",

    // Tab bar
    tabBarBg: isDark ? "rgba(28,28,30,0.90)" : "rgba(255,255,255,0.94)",
    tabInactive: isDark ? "rgba(255,255,255,0.40)" : "rgba(60,60,67,0.40)",
    tabActive: colors.primary,

    // Accent tint (for icon backgrounds)
    accentTintBg: isDark ? withOpacity(colors.primary, 0.2) : withOpacity(colors.primary, 0.1),
  };

  return {
    // Theme state
    isDark,

    // Navigation theme (for React Navigation)
    navigationTheme: isDark ? darkTheme : lightTheme,

    // Theme-resolved colors
    colors: themeColors,

    // Design tokens (static - don't change with theme)
    spacing,
    typography,
    borderRadius,
    shadows,
    animation,
    componentSizes,

    // VidNotes tokens
    accentDerived,
    opacity,
    cinematicGradient,

    // Raw colors (for when you need both light/dark variants)
    rawColors: colors,

    // Helper to get color by path
    getColor: (colorPath: string) => getThemeColor(colorPath, isDark),
  };
}

// Export types for components
export type AppTheme = ReturnType<typeof useAppTheme>;
export type ThemeColors = AppTheme["colors"];
