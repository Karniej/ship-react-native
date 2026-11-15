/**
 * NativeProgress - Cross-platform progress indicator
 * Uses React Native's built-in ActivityIndicator for maximum compatibility.
 */

import { View, ActivityIndicator } from "react-native";

interface NativeProgressProps {
  progress?: number;
  type?: "circular" | "linear";
  color?: string;
}

export function NativeProgress({ progress, type = "circular", color }: NativeProgressProps) {
  if (type === "circular") {
    return <ActivityIndicator color={color || "#007AFF"} />;
  }

  return (
    <View style={{ height: 4, backgroundColor: "#E5E5EA", borderRadius: 2 }}>
      <View
        style={{
          height: "100%",
          width: `${(progress || 0) * 100}%`,
          backgroundColor: color || "#007AFF",
          borderRadius: 2,
        }}
      />
    </View>
  );
}

export default NativeProgress;
