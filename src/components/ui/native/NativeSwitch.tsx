/**
 * NativeSwitch - Cross-platform toggle/switch component
 * Uses React Native's built-in Switch for maximum compatibility.
 */

import { Switch as RNSwitch } from "react-native";

import { useTheme } from "expo-router/react-navigation";

interface NativeSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function NativeSwitch({ value, onValueChange, disabled = false }: NativeSwitchProps) {
  const theme = useTheme();

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: theme.dark ? "#3a3a4e" : "#E5E5EA",
        true: "#34C759",
      }}
      thumbColor="#fff"
    />
  );
}

export default NativeSwitch;
