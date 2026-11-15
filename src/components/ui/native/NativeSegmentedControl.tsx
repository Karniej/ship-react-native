// @ts-nocheck
/**
 * NativeSegmentedControl - Cross-platform native segmented control
 *
 * Uses SwiftUI Picker (segmented style) on iOS and Jetpack Compose
 * SegmentedButton on Android for a truly native look and feel.
 */

import { Platform, View, TouchableOpacity, Text, StyleSheet } from "react-native";

import { Picker as ComposePicker } from "@expo/ui/jetpack-compose";
import { Host, Picker as SwiftUIPicker } from "@expo/ui/swift-ui";
import { useTheme } from "expo-router/react-navigation";

interface SegmentOption {
  /** Unique value for this option */
  value: string;
  /** Display label for this option */
  label: string;
}

interface NativeSegmentedControlProps {
  /** Array of options to display */
  options: SegmentOption[];
  /** Currently selected value */
  selectedValue: string;
  /** Callback when selection changes */
  onValueChange: (value: string) => void;
}

export function NativeSegmentedControl({
  options,
  selectedValue,
  onValueChange,
}: NativeSegmentedControlProps) {
  const theme = useTheme();

  // expo-ui Picker expects string[] for options
  const optionLabels = options.map((opt) => opt.label);
  const selectedIndex = options.findIndex((opt) => opt.value === selectedValue);

  if (Platform.OS === "ios") {
    return (
      <Host matchContents>
        <SwiftUIPicker
          variant="segmented"
          options={optionLabels}
          selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
          onOptionSelected={({ nativeEvent }) => {
            const selected = options[nativeEvent.index];
            if (selected) {
              onValueChange(selected.value);
            }
          }}
        />
      </Host>
    );
  }

  if (Platform.OS === "android") {
    return (
      <ComposePicker
        variant="segmented"
        options={optionLabels}
        selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
        onOptionSelected={({ nativeEvent }) => {
          const selected = options[nativeEvent.index];
          if (selected) {
            onValueChange(selected.value);
          }
        }}
      />
    );
  }

  // Fallback for web or other platforms
  return (
    <View
      style={[styles.fallbackContainer, { backgroundColor: theme.dark ? "#3a3a4e" : "#E5E5EA" }]}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.fallbackOption,
            selectedValue === option.value && {
              backgroundColor: theme.dark ? "#007AFF" : "#fff",
            },
          ]}
          onPress={() => onValueChange(option.value)}
        >
          <Text
            style={[
              styles.fallbackText,
              { color: selectedValue === option.value ? (theme.dark ? "#fff" : "#000") : "#666" },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 2,
  },
  fallbackOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default NativeSegmentedControl;
