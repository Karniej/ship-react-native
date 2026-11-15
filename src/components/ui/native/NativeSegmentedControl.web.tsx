import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

import { useTheme } from "expo-router/react-navigation";

interface SegmentOption {
  value: string;
  label: string;
}

interface NativeSegmentedControlProps {
  options: SegmentOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export function NativeSegmentedControl({
  options,
  selectedValue,
  onValueChange,
}: NativeSegmentedControlProps) {
  const theme = useTheme();

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
