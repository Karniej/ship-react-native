import React, { useEffect, forwardRef } from "react";

import { type ViewStyle } from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  SlideInDown,
  SlideInUp,
  SlideOutDown,
  SlideOutUp,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";

import { animation } from "@/constants/theme";

// ============================================================================
// TYPES
// ============================================================================

type AnimationType =
  | "fade"
  | "fadeUp"
  | "fadeDown"
  | "fadeLeft"
  | "fadeRight"
  | "slideUp"
  | "slideDown"
  | "zoom"
  | "scale";

interface AnimatedWrapperProps {
  /** Content to animate */
  children: React.ReactNode;
  /** Control visibility */
  show: boolean;
  /** Animation type */
  type?: AnimationType;
  /** Animation duration in ms */
  duration?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Custom style */
  style?: ViewStyle;
}

interface AnimatedContainerProps {
  /** Content to animate */
  children: React.ReactNode;
  /** Animation type for entering */
  entering?: AnimationType;
  /** Animation type for exiting */
  exiting?: AnimationType;
  /** Animation duration in ms */
  duration?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Custom style */
  style?: ViewStyle;
}

// ============================================================================
// ANIMATED WRAPPER (Controlled)
// ============================================================================

export const AnimatedWrapper = forwardRef<Animated.View, AnimatedWrapperProps>(
  (
    { children, show, type = "fade", duration = animation.duration.normal, delay = 0, style },
    ref
  ) => {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(type === "scale" || type === "zoom" ? 0.95 : 1);
    const translateY = useSharedValue(
      type === "fadeUp" || type === "slideUp"
        ? 20
        : type === "fadeDown" || type === "slideDown"
          ? -20
          : 0
    );
    const translateX = useSharedValue(type === "fadeLeft" ? -20 : type === "fadeRight" ? 20 : 0);

    useEffect(() => {
      const config = { duration, easing: Easing.out(Easing.ease) };
      const springConfig = animation.spring.default;

      if (show) {
        opacity.value = withDelay(delay, withTiming(1, config));
        scale.value = withDelay(delay, withSpring(1, springConfig));
        translateY.value = withDelay(delay, withSpring(0, springConfig));
        translateX.value = withDelay(delay, withSpring(0, springConfig));
      } else {
        opacity.value = withTiming(0, {
          duration: duration * 0.7,
          easing: Easing.in(Easing.ease),
        });
        scale.value = withTiming(type === "scale" || type === "zoom" ? 0.95 : 1, config);
        translateY.value = withTiming(
          type === "fadeUp" || type === "slideUp"
            ? 20
            : type === "fadeDown" || type === "slideDown"
              ? -20
              : 0,
          config
        );
        translateX.value = withTiming(
          type === "fadeLeft" ? -20 : type === "fadeRight" ? 20 : 0,
          config
        );
      }
    }, [show, type, duration, delay]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { translateX: translateX.value },
      ],
    }));

    return (
      <Animated.View ref={ref} style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    );
  }
);

AnimatedWrapper.displayName = "AnimatedWrapper";

// ============================================================================
// ANIMATED CONTAINER (Layout animations)
// ============================================================================

export function AnimatedContainer({
  children,
  entering = "fade",
  exiting = "fade",
  duration = animation.duration.normal,
  delay = 0,
  style,
}: AnimatedContainerProps) {
  const getEnteringAnimation = () => {
    const baseAnimation = (() => {
      switch (entering) {
        case "fadeUp":
          return FadeInUp;
        case "fadeDown":
          return FadeInDown;
        case "fadeLeft":
          return FadeInLeft;
        case "fadeRight":
          return FadeInRight;
        case "slideUp":
          return SlideInUp;
        case "slideDown":
          return SlideInDown;
        case "zoom":
        case "scale":
          return ZoomIn;
        case "fade":
        default:
          return FadeIn;
      }
    })();

    return baseAnimation.duration(duration).delay(delay);
  };

  const getExitingAnimation = () => {
    const baseAnimation = (() => {
      switch (exiting) {
        case "fadeUp":
        case "slideUp":
          return SlideOutUp;
        case "fadeDown":
        case "slideDown":
          return SlideOutDown;
        case "zoom":
        case "scale":
          return ZoomOut;
        case "fade":
        default:
          return FadeOut;
      }
    })();

    return baseAnimation.duration(duration * 0.7);
  };

  return (
    <Animated.View entering={getEnteringAnimation()} exiting={getExitingAnimation()} style={style}>
      {children}
    </Animated.View>
  );
}

// ============================================================================
// STAGGERED LIST ITEM
// ============================================================================

interface StaggeredItemProps {
  /** Content to animate */
  children: React.ReactNode;
  /** Item index for stagger calculation */
  index: number;
  /** Base delay between items */
  staggerDelay?: number;
  /** Animation type */
  type?: AnimationType;
  /** Animation duration */
  duration?: number;
  /** Custom style */
  style?: ViewStyle;
}

export function StaggeredItem({
  children,
  index,
  staggerDelay = 50,
  type = "fadeUp",
  duration = animation.duration.normal,
  style,
}: StaggeredItemProps) {
  const getEnteringAnimation = () => {
    const delay = index * staggerDelay;

    switch (type) {
      case "fadeUp":
        return FadeInUp.duration(duration).delay(delay);
      case "fadeDown":
        return FadeInDown.duration(duration).delay(delay);
      case "fadeLeft":
        return FadeInLeft.duration(duration).delay(delay);
      case "fadeRight":
        return FadeInRight.duration(duration).delay(delay);
      case "zoom":
      case "scale":
        return ZoomIn.duration(duration).delay(delay);
      case "fade":
      default:
        return FadeIn.duration(duration).delay(delay);
    }
  };

  return (
    <Animated.View entering={getEnteringAnimation()} style={style}>
      {children}
    </Animated.View>
  );
}
