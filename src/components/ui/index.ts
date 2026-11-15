/**
 * ============================================================================
 * UI COMPONENT LIBRARY
 * ============================================================================
 *
 * A comprehensive set of reusable UI components built with:
 * - React Native Reanimated for smooth, performant animations
 * - Consistent theming via useAppTheme hook
 * - Full TypeScript support with proper type exports
 *
 * Usage:
 * import { Button, Text, Card, Input } from '@/components/ui';
 *
 * Theme usage:
 * import { useAppTheme } from '@/hooks/useAppTheme';
 * const { colors, spacing, typography } = useAppTheme();
 */

// ============================================================================
// CORE COMPONENTS
// ============================================================================

// Button - Animated button with variants and sizes
export { Button } from "./Button";

// Text - Themed text with typography variants
export {
  Text,
  DisplayText,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  BodyLarge,
  Body,
  BodySmall,
  Label,
  Caption,
} from "./Text";

// Card - Animated card container with variants
export { Card, CardHeader, CardContent, CardFooter } from "./Card";

// Input - Animated input with focus states
export { Input } from "./Input";

// ============================================================================
// FEEDBACK COMPONENTS
// ============================================================================

// Loading - Various loading indicators
export { Spinner, DotsLoader, PulseLoader, ProgressBar, LoadingOverlay } from "./Loading";

// Skeleton - Loading placeholders with shimmer effect
export {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  SkeletonCard,
  SkeletonGenerationCard,
  SkeletonMetricCard,
  SkeletonList,
  SkeletonAvatarGroup,
} from "./Skeleton";

// Empty States - Various empty/error states
export { EmptyState, OfflineState, ErrorState, NoDataState, SearchEmptyState } from "./EmptyState";

// ============================================================================
// DISPLAY COMPONENTS
// ============================================================================

// Avatar - User avatars with status indicators
export { Avatar, AvatarGroup } from "./Avatar";

// Badge - Notification badges and labels
export { Badge, BadgeWrapper } from "./Badge";

// Divider - Visual separators
export { Divider } from "./Divider";

// IconButton - Icon-only buttons with animations
export { IconButton } from "./IconButton";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

// Step Progress Bar - Multi-step progress indicator
export { StepProgressBar } from "./StepProgressBar";

// ============================================================================
// MODAL COMPONENTS
// ============================================================================

// Full Screen Modal - Animated full-screen modal
export { FullScreenModal, BottomSheetModal } from "./FullScreenModal";

// ============================================================================
// ANIMATION COMPONENTS
// ============================================================================

// Animated Wrapper - Controlled visibility animations
export { AnimatedWrapper, AnimatedContainer, StaggeredItem } from "./AnimatedWrapper";

// ============================================================================
// FEATURE SCREEN COMPONENTS
// ============================================================================

// Screen Header - Consistent header with back button, title, subtitle
export { ScreenHeader } from "./ScreenHeader";

// Credits Card - Display credits with loading state
export { CreditsCard } from "./CreditsCard";

// Error Card - Display error messages with optional dismiss
export { ErrorCard } from "./ErrorCard";

// Generation Loading State - Loading spinner with title/subtitle
export { GenerationLoadingState } from "./GenerationLoadingState";

// Generation Result - Success state wrapper for generated content
export { GenerationResult } from "./GenerationResult";

// Section Label - Consistent section titles
export { SectionLabel } from "./SectionLabel";

// Image Picker Button - Reusable image selection with preview
export { ImagePickerButton } from "./ImagePickerButton";

// ============================================================================
// CELEBRATION COMPONENTS
// ============================================================================

// Success Celebration - Full screen success animation with confetti
export { SuccessCelebration, SuccessCheck } from "./SuccessCelebration";

// Confetti - Particle effects for celebrations
export { Confetti, PremiumConfetti } from "./Confetti";

// ============================================================================
// NATIVE UI COMPONENTS (expo-ui)
// ============================================================================

// Native components powered by SwiftUI (iOS) and Jetpack Compose (Android)
export {
  NativeSwitch,
  NativeProgress,
  NativeSegmentedControl,
  NativeSlider,
  NativeContextMenu,
  type ContextMenuAction,
} from "./native";

// ============================================================================
// DESIGN COMPONENTS (VidNotes-style)
// ============================================================================

export { GlassCard, CTAButton, PressableCard, CinematicBackground, PageDots } from "./design";
