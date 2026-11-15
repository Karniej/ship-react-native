import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export type ImageModel = "dall-e-3" | "flux-schnell" | "sdxl";

interface ModelPickerProps {
  value: ImageModel;
  onValueChange: (value: ImageModel) => void;
}

const MODELS: {
  id: ImageModel;
  name: string;
  description: string;
  provider: string;
}[] = [
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    description: "OpenAI - Best quality, slower",
    provider: "openai",
  },
  {
    id: "flux-schnell",
    name: "Flux Schnell",
    description: "Replicate - Fast, good quality",
    provider: "replicate",
  },
  {
    id: "sdxl",
    name: "SDXL",
    description: "Replicate - Stable Diffusion XL",
    provider: "replicate",
  },
];

export function ModelPicker({ value, onValueChange }: ModelPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Model</Text>

      <View style={styles.options}>
        {MODELS.map((model) => {
          const isSelected = value === model.id;
          return (
            <TouchableOpacity
              key={model.id}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onValueChange(model.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionName}>{model.name}</Text>
                <Text style={styles.optionDescription}>{model.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function getProviderFromModel(model: ImageModel): "openai" | "replicate" {
  const modelConfig = MODELS.find((m) => m.id === model);
  return (modelConfig?.provider as "openai" | "replicate") || "openai";
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  optionSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#90CAF9",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#007AFF",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: "500",
  },
  optionDescription: {
    fontSize: 12,
    color: "#666",
  },
});
