// @ts-nocheck
/**
 * NativeSlider - Cross-platform native slider component
 *
 * Uses SwiftUI Slider on iOS and Jetpack Compose Slider on Android
 * for a truly native look and feel.
 */

import { Platform } from "react-native";

import { Slider as ComposeSlider } from "@expo/ui/jetpack-compose";
import { Host, Slider as SwiftUISlider } from "@expo/ui/swift-ui";
import Slider from "@react-native-community/slider";
import { useTheme } from "expo-router/react-navigation";

interface NativeSliderProps {
  /** Current value */
  value: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Number of steps (expo-ui uses steps, not step) */
  steps?: number;
  /** Callback when value changes */
  onValueChange: (value: number) => void;
  /** Color of the slider track */
  color?: string;
}

export function NativeSlider({
  value,
  min = 0,
  max = 1,
  steps,
  onValueChange,
  color,
}: NativeSliderProps) {
  const theme = useTheme();

  if (Platform.OS === "ios") {
    return (
      <Host matchContents>
        <SwiftUISlider
          value={value}
          min={min}
          max={max}
          steps={steps}
          onValueChange={onValueChange}
          color={color}
        />
      </Host>
    );
  }

  if (Platform.OS === "android") {
    return (
      <ComposeSlider
        value={value}
        min={min}
        max={max}
        steps={steps}
        onValueChange={onValueChange}
        color={color}
      />
    );
  }

  // Fallback for web or other platforms using community slider
  return (
    <Slider
      value={value}
      minimumValue={min}
      maximumValue={max}
      step={steps ? (max - min) / steps : undefined}
      onValueChange={onValueChange}
      minimumTrackTintColor={color || "#007AFF"}
      maximumTrackTintColor={theme.dark ? "#3a3a4e" : "#E5E5EA"}
      thumbTintColor={color || "#007AFF"}
    />
  );
}

export default NativeSlider;
