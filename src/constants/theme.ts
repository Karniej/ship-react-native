/**
 * ============================================================================
 * THEME SYSTEM
 * ============================================================================
 *
 * Comprehensive design system for consistent styling across the app.
 * All components should use these tokens for colors, spacing, typography, etc.
 *
 * NOTE: Brand colors are imported from constants/brand.ts
 * Edit brand.ts to change primary brand colors, gradients, and feature colors.
 *
 * Usage:
 * import { colors, spacing, typography } from '@/constants/theme';
 * import { useAppTheme } from '@/hooks/useAppTheme';
 */

import { BRAND } from "./brand";

// ============================================================================
// HELPERS
// ============================================================================

export function withOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Brand Colors (imported from brand.ts for easy customization)
  primary: BRAND.colors.primary,
  primaryLight: BRAND.colors.primaryLight,
  primaryDark: BRAND.colors.primaryDark,

  secondary: BRAND.colors.secondary,
  secondaryLight: "#7A79E0",
  secondaryDark: "#3634A3",

  tertiary: BRAND.colors.accent,
  tertiaryLight: "#FFB340",
  tertiaryDark: "#CC7700",

  // Semantic Colors (imported from brand.ts)
  success: BRAND.colors.success,
  successLight: "#A8E6B3",
  successDark: "#248A3D",

  error: BRAND.colors.error,
  errorLight: "#FF8A84",
  errorDark: "#C41E14",

  warning: BRAND.colors.warning,
  warningLight: "#FFD180",
  warningDark: "#CC7700",

  info: "#5AC8FA",
  infoLight: "#A8E4FD",
  infoDark: "#0A84FF",

  // Neutral Colors
  white: "#FFFFFF",
  black: "#000000",

  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // ============================================================================
  // SURFACE-BASED COLOR SYSTEM
  // Layered depth — never flat. Each level = elevation.
  // Inspired by Linear, Stripe, Apple system apps.
  // ============================================================================

  // Background Colors (base layer — lowest elevation)
  background: {
    light: "#F7F7F8",
    lightSecondary: "#F1F1F3",
    dark: "#0B0B0C",
    darkSecondary: "#121214",
    glass: "rgba(255,255,255,0.08)",
    bgSubtle: "rgba(255,255,255,0.07)",
  },

  // Surface Colors (cards, containers — mid elevation)
  surface: {
    light: "#FFFFFF",
    lightElevated: "#F1F1F3",
    dark: "#121214",
    darkElevated: "#1A1A1E",
    glass: "rgba(255,255,255,0.08)",
    selectedCard: withOpacity(BRAND.colors.primary, 0.15),
    highest: { light: "#E9E9EC", dark: "#222228" },
  },

  // Text Colors
  text: {
    primary: {
      light: "#111111",
      dark: "#FFFFFF",
    },
    secondary: {
      light: "rgba(0,0,0,0.6)",
      dark: "rgba(255,255,255,0.65)",
    },
    tertiary: {
      light: "rgba(0,0,0,0.4)",
      dark: "rgba(255,255,255,0.4)",
    },
    disabled: {
      light: "rgba(0,0,0,0.25)",
      dark: "rgba(255,255,255,0.25)",
    },
    inverse: {
      light: "#FFFFFF",
      dark: "#111111",
    },
    quaternary: {
      light: "rgba(0,0,0,0.18)",
      dark: "rgba(255,255,255,0.18)",
    },
  },

  // Border Colors (subtle separation, not decoration)
  border: {
    light: "rgba(0,0,0,0.08)",
    lightStrong: "rgba(0,0,0,0.12)",
    dark: "rgba(255,255,255,0.08)",
    darkStrong: "rgba(255,255,255,0.12)",
    subtle: { light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.05)" },
    medium: { light: "rgba(0,0,0,0.08)", dark: "rgba(255,255,255,0.08)" },
    strong: { light: BRAND.colors.primary, dark: BRAND.colors.primary },
  },

  // Overlay Colors
  overlay: {
    light: "rgba(0, 0, 0, 0.4)",
    dark: "rgba(0, 0, 0, 0.6)",
  },

  // Skeleton Colors
  skeleton: {
    light: "#E5E7EB",
    dark: "#374151",
  },

  // Transparent
  transparent: "transparent",
};

// ============================================================================
// ACCENT-DERIVED COLORS
// ============================================================================

export const accentDerived = {
  ctaGlow: withOpacity(BRAND.colors.primary, 0.4),
  iconCircleBg: withOpacity(BRAND.colors.primary, 0.2),
  selectedOverlay: withOpacity(BRAND.colors.primary, 0.2),
  badgeBg: withOpacity(BRAND.colors.primary, 0.9),
  tintBg: withOpacity(BRAND.colors.primary, 0.1),
} as const;

// ============================================================================
// OPACITY SCALE
// ============================================================================

export const opacity = {
  glass: 0.07,
  glassBorder: 0.06,
  selectedFill: 0.2,
  subtleTint: 0.1,
  textSecondary: 0.6,
  textTertiary: 0.35,
  textDisabled: 0.25,
  textGhost: 0.15,
  pressedOverlay: 0.1,
} as const;

// ============================================================================
// CINEMATIC GRADIENT
// ============================================================================

export const cinematicGradient = {
  colors: [
    "rgba(0,0,0,0.00)",
    "rgba(0,0,0,0.00)",
    "rgba(0,0,0,0.50)",
    "rgba(0,0,0,0.85)",
    "rgba(0,0,0,1.00)",
    "rgba(0,0,0,1.00)",
  ],
  locations: [0, 0.35, 0.5, 0.65, 0.8, 1.0] as number[],
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  "7xl": 80,
  "8xl": 96,
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

// Font family mapping per brand font choice
const FONT_FAMILIES: Record<
  string,
  {
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
    extraBold: string;
    black: string;
  }
> = {
  Inter: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    extraBold: "Inter_800ExtraBold",
    black: "Inter_900Black",
  },
  Poppins: {
    regular: "Poppins_400Regular",
    medium: "Poppins_500Medium",
    semiBold: "Poppins_600SemiBold",
    bold: "Poppins_700Bold",
    extraBold: "Poppins_800ExtraBold",
    black: "Poppins_900Black",
  },
  SpaceGrotesk: {
    regular: "SpaceGrotesk_400Regular",
    medium: "SpaceGrotesk_500Medium",
    semiBold: "SpaceGrotesk_600SemiBold",
    bold: "SpaceGrotesk_700Bold",
    extraBold: "SpaceGrotesk_700Bold", // Space Grotesk only goes to 700
    black: "SpaceGrotesk_700Bold",
  },
  DMSans: {
    regular: "DMSans_400Regular",
    medium: "DMSans_500Medium",
    semiBold: "DMSans_600SemiBold",
    bold: "DMSans_700Bold",
    extraBold: "DMSans_800ExtraBold",
    black: "DMSans_900Black",
  },
  Outfit: {
    regular: "Outfit_400Regular",
    medium: "Outfit_500Medium",
    semiBold: "Outfit_600SemiBold",
    bold: "Outfit_700Bold",
    extraBold: "Outfit_800ExtraBold",
    black: "Outfit_900Black",
  },
  Montserrat: {
    regular: "Montserrat_400Regular",
    medium: "Montserrat_500Medium",
    semiBold: "Montserrat_600SemiBold",
    bold: "Montserrat_700Bold",
    extraBold: "Montserrat_800ExtraBold",
    black: "Montserrat_900Black",
  },
};

const activeFontFamily = FONT_FAMILIES[BRAND.font] || FONT_FAMILIES.Inter;

export const typography = {
  // Font Families
  fontFamily: activeFontFamily,

  // Font Weights
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
    extraBold: "800" as const,
  },

  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    "2xl": 20,
    "3xl": 24,
    "4xl": 28,
    "5xl": 32,
    "6xl": 36,
    "7xl": 48,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },

  // Pre-defined Text Styles
  variants: {
    // Display
    display: {
      fontSize: 48,
      fontWeight: "700" as const,
      lineHeight: 1.1,
    },

    // Headings
    h1: {
      fontSize: 32,
      fontWeight: "700" as const,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 28,
      fontWeight: "700" as const,
      lineHeight: 1.25,
    },
    h3: {
      fontSize: 24,
      fontWeight: "600" as const,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 20,
      fontWeight: "600" as const,
      lineHeight: 1.35,
    },
    h5: {
      fontSize: 18,
      fontWeight: "600" as const,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: 16,
      fontWeight: "600" as const,
      lineHeight: 1.4,
    },

    // Body
    bodyLarge: {
      fontSize: 18,
      fontWeight: "400" as const,
      lineHeight: 1.5,
    },
    body: {
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: "400" as const,
      lineHeight: 1.5,
    },

    // Labels
    label: {
      fontSize: 14,
      fontWeight: "500" as const,
      lineHeight: 1.4,
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: "500" as const,
      lineHeight: 1.4,
    },

    // Caption
    caption: {
      fontSize: 12,
      fontWeight: "400" as const,
      lineHeight: 1.4,
    },
    captionSmall: {
      fontSize: 10,
      fontWeight: "400" as const,
      lineHeight: 1.4,
    },

    // Button
    button: {
      fontSize: 16,
      fontWeight: "600" as const,
      lineHeight: 1.25,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: "600" as const,
      lineHeight: 1.25,
    },

    // VidNotes Typography
    largeTitle: { fontSize: 34, fontWeight: "700" as const, letterSpacing: 0.37 },
    title2: { fontSize: 22, fontWeight: "700" as const },
    title3: { fontSize: 20, fontWeight: "600" as const },
    headline: { fontSize: 17, fontWeight: "600" as const },
    subheadline: { fontSize: 15, fontWeight: "400" as const },
    footnote: { fontSize: 13, fontWeight: "400" as const },
    caption1: { fontSize: 12, fontWeight: "400" as const },
    caption2: { fontSize: 11, fontWeight: "700" as const },
    micro: { fontSize: 10, fontWeight: "800" as const },
  },

  // Button sizes (iOS HIG)
  buttonSizes: {
    primaryHeight: 54,
    secondaryHeight: 48,
    smallHeight: 36,
    pillHeight: 34,
  },

  // Card border radii
  cardRadius: {
    large: 16,
    medium: 12,
    small: 10,
  },
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "2.5xl": 18,
  "3xl": 24,
  full: 9999,
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  "2xl": {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  ctaGlow: {
    shadowColor: BRAND.colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  mockup: {
    shadowColor: BRAND.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 15 },
    elevation: 12,
  },
} as const;

// ============================================================================
// ANIMATION
// ============================================================================

export const animation = {
  // Durations (ms)
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
    slowest: 1000,
  },

  // Spring configs for react-native-reanimated
  spring: {
    gentle: {
      damping: 20,
      stiffness: 100,
      mass: 1,
    },
    default: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 180,
      mass: 1,
    },
    stiff: {
      damping: 20,
      stiffness: 300,
      mass: 1,
    },
    quick: {
      damping: 20,
      stiffness: 400,
      mass: 1,
    },
  },

  // Timing configs
  easing: {
    linear: "linear",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },

  // VidNotes spring presets
  springs: {
    snappy: { damping: 12, stiffness: 200, mass: 0.8 },
    smooth: { damping: 18, stiffness: 120, mass: 1 },
    gentle: { damping: 20, stiffness: 90, mass: 1 },
  },
  timing: {
    press: 100,
    quick: 150,
    standard: 300,
    carousel: 600,
    cinematic: 900,
  },
  pressScale: {
    button: 0.98,
    card: 0.96,
  },
  stagger: {
    itemDelay: 50,
    entrance: {
      from: { opacity: 0, translateY: 10 },
      to: { opacity: 1, translateY: 0 },
      duration: 300,
    },
  },
} as const;

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

// ============================================================================
// BREAKPOINTS (for responsive design)
// ============================================================================

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// ============================================================================
// COMPONENT SIZES
// ============================================================================

export const componentSizes = {
  // Button heights
  button: {
    xs: 28,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  },

  // Input heights
  input: {
    sm: 36,
    md: 44,
    lg: 52,
  },

  // Icon sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    "2xl": 40,
  },

  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    "2xl": 96,
  },

  // Badge sizes
  badge: {
    sm: 18,
    md: 22,
    lg: 26,
  },

  // Touch targets (minimum for accessibility)
  touchTarget: 44,
} as const;

// ============================================================================
// THEME PRESETS (for React Navigation)
// ============================================================================

const fonts = {
  regular: {
    fontFamily: activeFontFamily.regular,
    fontWeight: "400" as const,
  },
  medium: {
    fontFamily: activeFontFamily.medium,
    fontWeight: "500" as const,
  },
  bold: {
    fontFamily: activeFontFamily.bold,
    fontWeight: "700" as const,
  },
  heavy: {
    fontFamily: activeFontFamily.extraBold,
    fontWeight: "800" as const,
  },
};

export const lightTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background.light,
    card: colors.surface.light,
    text: colors.text.primary.light,
    border: colors.border.light,
    notification: colors.error,
  },
  fonts,
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background.dark,
    card: colors.surface.dark,
    text: colors.text.primary.dark,
    border: colors.border.dark,
    notification: colors.error,
  },
  fonts,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get color based on theme
 */
export function getThemeColor(colorPath: string, isDark: boolean): string {
  const lightDarkMap: Record<string, { light: string; dark: string }> = {
    background: {
      light: colors.background.light,
      dark: colors.background.dark,
    },
    backgroundSecondary: {
      light: colors.background.lightSecondary,
      dark: colors.background.darkSecondary,
    },
    surface: { light: colors.surface.light, dark: colors.surface.dark },
    surfaceElevated: {
      light: colors.surface.lightElevated,
      dark: colors.surface.darkElevated,
    },
    textPrimary: {
      light: colors.text.primary.light,
      dark: colors.text.primary.dark,
    },
    textSecondary: {
      light: colors.text.secondary.light,
      dark: colors.text.secondary.dark,
    },
    textTertiary: {
      light: colors.text.tertiary.light,
      dark: colors.text.tertiary.dark,
    },
    textDisabled: {
      light: colors.text.disabled.light,
      dark: colors.text.disabled.dark,
    },
    border: { light: colors.border.light, dark: colors.border.dark },
    borderStrong: {
      light: colors.border.lightStrong,
      dark: colors.border.darkStrong,
    },
    skeleton: { light: colors.skeleton.light, dark: colors.skeleton.dark },
    overlay: { light: colors.overlay.light, dark: colors.overlay.dark },
  };

  const colorSet = lightDarkMap[colorPath];
  if (colorSet) {
    return isDark ? colorSet.dark : colorSet.light;
  }

  return colors.primary;
}

/**
 * Create shadow style for a given elevation
 */
export function createShadow(elevation: keyof typeof shadows) {
  return shadows[elevation];
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SpacingKey = keyof typeof spacing;
export type ColorKey = keyof typeof colors;
export type FontSizeKey = keyof typeof typography.fontSize;
export type FontWeightKey = keyof typeof typography.fontWeight;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;
export type AnimationDurationKey = keyof typeof animation.duration;
export type ComponentSizeKey = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
