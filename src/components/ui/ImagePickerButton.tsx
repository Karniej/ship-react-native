import { useState } from "react";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { useI18n } from "@/hooks/useI18n";
import { haptics } from "@/utils/haptics";

interface ImagePickerButtonProps {
  /** Currently selected image URI */
  value: string | null;
  /** Callback when image is selected or cleared */
  onValueChange: (uri: string | null) => void;
  /** Label displayed above the picker */
  label: string;
  /** Placeholder text when no image is selected */
  placeholder?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Custom accent color */
  accentColor?: string;
  /** Whether to show camera option */
  showCamera?: boolean;
  /** Height of the image preview */
  previewHeight?: number;
  /** Optional validation function */
  onValidate?: (uri: string) => Promise<{ valid: boolean; error?: string }>;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function ImagePickerButton({
  value,
  onValueChange,
  label,
  placeholder,
  disabled = false,
  accentColor = "#007AFF",
  showCamera = true,
  previewHeight = 150,
  onValidate,
}: ImagePickerButtonProps) {
  const theme = useTheme();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  // Press animation
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleSelectImage = async (useCamera: boolean) => {
    if (disabled || isLoading) return;

    haptics.light();
    setIsLoading(true);

    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        haptics.warning();
        Alert.alert(
          t("common.error"),
          useCamera ? t("imagePicker.cameraPermission") : t("imagePicker.galleryPermission")
        );
        setIsLoading(false);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Run validation if provided
        if (onValidate) {
          const validation = await onValidate(imageUri);
          if (!validation.valid) {
            haptics.warning();
            Alert.alert(t("common.error"), validation.error || t("errors.generic"));
            setIsLoading(false);
            return;
          }
        }

        onValueChange(imageUri);
      }
    } catch (err) {
      haptics.error();
      console.error("Image picker error:", err);
      Alert.alert(t("common.error"), t("errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    haptics.light();
    onValueChange(null);
  };

  const showImageOptions = () => {
    if (disabled || isLoading) return;

    if (showCamera) {
      Alert.alert(t("imagePicker.selectSource"), "", [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("imagePicker.fromGallery"),
          onPress: () => handleSelectImage(false),
        },
        {
          text: t("imagePicker.takePhoto"),
          onPress: () => handleSelectImage(true),
        },
      ]);
    } else {
      handleSelectImage(false);
    }
  };

  if (value) {
    return (
      <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
        <View
          style={[
            styles.previewContainer,
            {
              backgroundColor: theme.dark ? "#2a2a3e" : "#F9F9F9",
              borderColor: theme.dark ? "#333" : "#E5E5EA",
            },
          ]}
        >
          <Image
            source={{ uri: value }}
            style={[styles.preview, { height: previewHeight }]}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: "rgba(0,0,0,0.6)" }]}
            onPress={handleClear}
            disabled={disabled}
          >
            <Feather name="x" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.changeButton, { backgroundColor: "rgba(0,0,0,0.6)" }]}
            onPress={showImageOptions}
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="edit-2" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(300)} style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <AnimatedTouchable
        style={[
          styles.pickerButton,
          {
            backgroundColor: theme.dark ? "#2a2a3e" : "#F9F9F9",
            borderColor: theme.dark ? "#333" : "#E5E5EA",
          },
          disabled && styles.disabled,
          animatedStyle,
        ]}
        onPress={showImageOptions}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={accentColor} />
        ) : (
          <>
            <Feather name="image" size={28} color={accentColor} />
            <Text style={[styles.placeholderText, { color: theme.dark ? "#999" : "#666" }]}>
              {placeholder || t("imagePicker.selectImage")}
            </Text>
          </>
        )}
      </AnimatedTouchable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  pickerButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.5,
  },
  previewContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  preview: {
    width: "100%",
    borderRadius: 12,
  },
  clearButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  changeButton: {
    position: "absolute",
    top: 8,
    right: 44,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
