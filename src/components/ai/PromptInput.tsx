import { useState, useCallback, useRef, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import ReanimatedModule, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing as REasing,
} from "react-native-reanimated";

import { BRAND } from "@/constants/brand";
import { haptics } from "@/utils/haptics";

const ReanimatedView = ReanimatedModule.View;

export interface PromptExample {
  title: string;
  prompt?: string;
  text?: string;
}

export interface StyleModifier {
  label: string;
  value: string;
}

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
  buttonLabel?: string;
  loadingLabel?: string;
  examples?: PromptExample[];
  styleModifiers?: StyleModifier[];
  showExamples?: boolean;
  multiline?: boolean;
  minHeight?: number;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function PromptInput({
  onSubmit,
  isLoading = false,
  placeholder = "Describe what you want to generate...",
  maxLength = 1000,
  buttonLabel = "Generate",
  loadingLabel = "Generating...",
  examples = [],
  styleModifiers = [],
  showExamples = true,
  multiline = true,
  minHeight = 120,
  value,
  onValueChange,
}: PromptInputProps) {
  const theme = useTheme();
  const [internalPrompt, setInternalPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);
  const [showExamplesPanel, setShowExamplesPanel] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const buttonScale = useRef(new Animated.Value(1)).current;
  const inputBorderColor = useRef(new Animated.Value(0)).current;
  const examplesFade = useRef(new Animated.Value(0)).current;

  // Spin animation for loading icon
  const spinValue = useSharedValue(0);
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value * 360}deg` }],
  }));

  useEffect(() => {
    if (isLoading) {
      spinValue.value = withRepeat(
        withTiming(1, { duration: 1000, easing: REasing.linear }),
        -1,
        false
      );
    } else {
      spinValue.value = withTiming(0, { duration: 300 });
    }
  }, [isLoading, spinValue]);

  // Use controlled or uncontrolled mode
  const prompt = value !== undefined ? value : internalPrompt;
  const setPrompt = onValueChange || setInternalPrompt;

  // Animate examples panel
  useEffect(() => {
    Animated.timing(examplesFade, {
      toValue: showExamplesPanel ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showExamplesPanel]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(inputBorderColor, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(inputBorderColor, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      // Button press animation
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          damping: 10,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]).start();

      let finalPrompt = prompt.trim();

      // Apply style modifier if selected
      if (selectedStyle !== null && styleModifiers[selectedStyle]) {
        finalPrompt += styleModifiers[selectedStyle].value;
      }

      onSubmit(finalPrompt);
    }
  };

  const handleExampleSelect = useCallback(
    (example: PromptExample) => {
      haptics.light();
      const text = example.prompt || example.text || "";
      setPrompt(text);
      setShowExamplesPanel(false);
    },
    [setPrompt]
  );

  const handleStyleSelect = useCallback((index: number) => {
    haptics.selection();
    setSelectedStyle((prev) => (prev === index ? null : index));
  }, []);

  const handleClear = useCallback(() => {
    haptics.light();
    setPrompt("");
    setSelectedStyle(null);
  }, [setPrompt]);

  const charCount = prompt.length;
  const isOverLimit = charCount > maxLength;
  const isDisabled = !prompt.trim() || isLoading || isOverLimit;

  const borderColor = inputBorderColor.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isOverLimit ? "#FF3B30" : theme.dark ? "#333" : "#E5E5EA",
      isOverLimit ? "#FF3B30" : BRAND.colors.primary,
    ],
  });

  return (
    <View style={styles.container}>
      {/* Examples Toggle */}
      {showExamples && examples.length > 0 && (
        <TouchableOpacity
          style={[
            styles.examplesToggle,
            {
              backgroundColor: showExamplesPanel
                ? `${BRAND.colors.primary}15`
                : theme.dark
                  ? "#2a2a3e"
                  : "#F5F5F7",
              borderColor: showExamplesPanel ? BRAND.colors.primary : "transparent",
            },
          ]}
          onPress={() => {
            haptics.light();
            setShowExamplesPanel(!showExamplesPanel);
          }}
        >
          <Feather
            name="zap"
            size={16}
            color={showExamplesPanel ? BRAND.colors.primary : theme.dark ? "#999" : "#666"}
          />
          <Text
            style={[
              styles.examplesToggleText,
              {
                color: showExamplesPanel ? BRAND.colors.primary : theme.dark ? "#999" : "#666",
              },
            ]}
          >
            {showExamplesPanel ? "Hide Examples" : "Try an Example"}
          </Text>
          <Feather
            name={showExamplesPanel ? "chevron-up" : "chevron-down"}
            size={16}
            color={showExamplesPanel ? BRAND.colors.primary : theme.dark ? "#999" : "#666"}
          />
        </TouchableOpacity>
      )}

      {/* Examples Panel */}
      {showExamplesPanel && examples.length > 0 && (
        <Animated.View style={{ opacity: examplesFade }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.examplesScroll}
            contentContainerStyle={styles.examplesContent}
          >
            {examples.map((example, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.exampleChip,
                  {
                    backgroundColor: theme.dark ? "#2a2a3e" : "#fff",
                    borderColor: theme.dark ? "#444" : "#E5E5EA",
                  },
                ]}
                onPress={() => handleExampleSelect(example)}
                activeOpacity={0.7}
              >
                <Text style={[styles.exampleTitle, { color: theme.colors.text }]} numberOfLines={1}>
                  {example.title}
                </Text>
                <Text
                  style={[styles.examplePreview, { color: theme.dark ? "#999" : "#666" }]}
                  numberOfLines={2}
                >
                  {(example.prompt || example.text || "").substring(0, 60)}...
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Text Input */}
      <View style={styles.inputWrapper}>
        <Animated.View
          style={[
            styles.inputContainer,
            {
              borderColor,
              backgroundColor: theme.dark ? "#1a1a2e" : "#fff",
            },
          ]}
        >
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder={placeholder}
            placeholderTextColor={theme.dark ? "#666" : "#999"}
            style={[
              styles.input,
              {
                minHeight: multiline ? minHeight : 48,
                color: theme.colors.text,
              },
            ]}
            multiline={multiline}
            editable={!isLoading}
            onSubmitEditing={!multiline ? handleSubmit : undefined}
            returnKeyType={multiline ? "default" : "send"}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Clear Button */}
          {prompt.length > 0 && !isLoading && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <View
                style={[
                  styles.clearButtonInner,
                  { backgroundColor: theme.dark ? "#444" : "#E5E5EA" },
                ]}
              >
                <Feather name="x" size={14} color={theme.dark ? "#999" : "#666"} />
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>

      {/* Style Modifiers */}
      {styleModifiers.length > 0 && (
        <View style={styles.modifiersSection}>
          <Text style={[styles.modifiersLabel, { color: theme.dark ? "#999" : "#666" }]}>
            Style:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modifiersContent}
          >
            {styleModifiers.map((modifier, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modifierChip,
                  {
                    backgroundColor:
                      selectedStyle === index
                        ? BRAND.colors.primary
                        : theme.dark
                          ? "#2a2a3e"
                          : "#F5F5F7",
                    borderColor:
                      selectedStyle === index
                        ? BRAND.colors.primary
                        : theme.dark
                          ? "#444"
                          : "#E5E5EA",
                  },
                ]}
                onPress={() => handleStyleSelect(index)}
              >
                <Text
                  style={[
                    styles.modifierText,
                    {
                      color: selectedStyle === index ? "#fff" : theme.dark ? "#999" : "#666",
                    },
                  ]}
                >
                  {modifier.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text
          style={[
            styles.charCount,
            { color: isOverLimit ? "#FF3B30" : theme.dark ? "#666" : "#999" },
          ]}
        >
          {charCount}/{maxLength}
        </Text>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isDisabled}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isDisabled && !isLoading
                  ? [theme.dark ? "#444" : "#ccc", theme.dark ? "#333" : "#bbb"]
                  : BRAND.gradients.primary
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <ReanimatedView style={isLoading ? spinStyle : undefined}>
                <Feather name={isLoading ? "refresh-cw" : "send"} size={18} color="#fff" />
              </ReanimatedView>
              <Text style={styles.buttonText}>{isLoading ? loadingLabel : buttonLabel}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  examplesToggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  examplesToggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  examplesScroll: {
    maxHeight: 110,
  },
  examplesContent: {
    gap: 10,
    paddingVertical: 4,
  },
  exampleChip: {
    width: 170,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  examplePreview: {
    fontSize: 12,
    lineHeight: 18,
  },
  inputWrapper: {
    position: "relative",
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: "hidden",
  },
  input: {
    maxHeight: 200,
    padding: 14,
    paddingRight: 44,
    fontSize: 16,
    textAlignVertical: "top",
  },
  clearButton: {
    position: "absolute",
    top: 14,
    right: 14,
  },
  clearButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modifiersSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modifiersLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  modifiersContent: {
    gap: 8,
  },
  modifierChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  modifierText: {
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCount: {
    fontSize: 13,
    fontWeight: "500",
  },
  button: {
    borderRadius: 14,
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
