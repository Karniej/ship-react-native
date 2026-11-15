import { DynamicColorIOS, Platform } from "react-native";

import { Tabs } from "expo-router";

import { GenerationProgressBar } from "@components/GenerationProgress";
import { isFeatureEnabled } from "@constants/features";
import { Feather } from "@expo/vector-icons";
import { useAIStore } from "@store/useAIStore";
import { NativeTabs } from "expo-router/unstable-native-tabs";

// Dynamic colors for light/dark mode on iOS
const selectedIconColor =
  Platform.OS === "ios"
    ? DynamicColorIOS({
        light: "#007AFF",
        dark: "#0A84FF",
      })
    : "#007AFF";

export default function TabLayout() {
  const { currentGeneration, isGenerating } = useAIStore();
  const hasActiveGeneration = isGenerating || !!currentGeneration;

  // Use NativeTabs on iOS for liquid glass effect (iOS 26+)
  // Falls back gracefully on older iOS versions
  if (Platform.OS === "ios") {
    return (
      <NativeTabs minimizeBehavior="onScrollDown" blurEffect="systemChromeMaterial">
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon
            sf={{ default: "house", selected: "house.fill" }}
            selectedColor={selectedIconColor}
          />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        {isFeatureEnabled("gallery") && (
          <NativeTabs.Trigger name="gallery">
            <NativeTabs.Trigger.Icon
              sf={{ default: "folder", selected: "folder.fill" }}
              selectedColor={selectedIconColor}
            />
            <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        )}

        {/* Hidden profile tab - merged into Settings */}
        <NativeTabs.Trigger name="profile" hidden />

        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Icon
            sf={{ default: "gearshape", selected: "gearshape.fill" }}
            selectedColor={selectedIconColor}
          />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        {/* Bottom accessory for active generation status (iOS 26+) */}
        {hasActiveGeneration && (
          <NativeTabs.BottomAccessory>
            <GenerationProgressBar />
          </NativeTabs.BottomAccessory>
        )}
      </NativeTabs>
    );
  }

  // Android and web fallback - use standard Tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          paddingBottom: Platform.OS === "android" ? 8 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      {isFeatureEnabled("gallery") && (
        <Tabs.Screen
          name="gallery"
          options={{
            title: "Library",
            tabBarIcon: ({ color, size }) => <Feather name="folder" size={size} color={color} />,
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hidden - merged into Settings
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
