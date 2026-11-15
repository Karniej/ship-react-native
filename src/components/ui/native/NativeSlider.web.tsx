import Slider from "@react-native-community/slider";
import { useTheme } from "expo-router/react-navigation";

interface NativeSliderProps {
  value: number;
  min?: number;
  max?: number;
  steps?: number;
  onValueChange: (value: number) => void;
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
