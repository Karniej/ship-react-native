import React from "react";

import { View, Image, ImageSourcePropType, StyleSheet } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { cinematicGradient } from "../../../constants/theme";

interface CinematicBackgroundProps {
  imageSource?: ImageSourcePropType;
  children: React.ReactNode;
}

export function CinematicBackground({ imageSource, children }: CinematicBackgroundProps) {
  return (
    <View style={styles.container}>
      {imageSource && <Image source={imageSource} style={styles.image} resizeMode="cover" />}
      <LinearGradient
        colors={cinematicGradient.colors as unknown as [string, string, ...string[]]}
        locations={cinematicGradient.locations as unknown as [number, number, ...number[]]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
    opacity: 0.75,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
