import { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

import { animation } from "../constants/theme";

export function usePressAnimation(scale = 0.96) {
  const pressed = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));

  const onPressIn = () => {
    pressed.value = withSpring(scale, animation.springs.snappy);
  };

  const onPressOut = () => {
    pressed.value = withSpring(1, animation.springs.snappy);
  };

  return { animatedStyle, onPressIn, onPressOut };
}
