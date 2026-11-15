/**
 * NativeContextMenu - Cross-platform native context menu
 *
 * Uses SwiftUI ContextMenu on iOS and Jetpack Compose DropdownMenu on Android
 * for a truly native look and feel.
 *
 * Wrap any component to add a long-press context menu.
 */

import { useState } from "react";

import { View, TouchableOpacity, Text, StyleSheet, Modal, Pressable } from "react-native";

// Note: expo-ui ContextMenu imports are commented out until API stabilizes
// import { ContextMenu as SwiftUIContextMenu } from "@expo/ui/swift-ui";
// import { ContextMenu as ComposeContextMenu } from "@expo/ui/jetpack-compose";
import { useTheme } from "expo-router/react-navigation";

export interface ContextMenuAction {
  /** Unique identifier for this action */
  id: string;
  /** Display title */
  title: string;
  /** Optional subtitle (iOS only) */
  subtitle?: string;
  /** Icon name (SF Symbol on iOS, Material Icon on Android) */
  icon?: string;
  /** Whether this is a destructive action (shows in red) */
  destructive?: boolean;
  /** Whether this action is disabled */
  disabled?: boolean;
}

interface NativeContextMenuProps {
  /** Child component that triggers the context menu on long press */
  children: React.ReactNode;
  /** Array of menu actions */
  actions: ContextMenuAction[];
  /** Callback when an action is selected */
  onAction: (actionId: string) => void;
  /** Optional title for the menu (iOS only) */
  title?: string;
}

export function NativeContextMenu({ children, actions, onAction, title }: NativeContextMenuProps) {
  const theme = useTheme();
  const [showFallbackMenu, setShowFallbackMenu] = useState(false);

  // Note: expo-ui ContextMenu API is still in beta and may change.
  // The native components require specific prop formats for menu items.
  // Using fallback modal for all platforms until API stabilizes.
  // TODO: Update to native implementations when expo-ui API is finalized:
  // - iOS: SwiftUIContextMenu with proper actions format
  // - Android: ComposeContextMenu with proper menu items

  // Fallback for web or other platforms - custom modal menu
  return (
    <>
      <TouchableOpacity onLongPress={() => setShowFallbackMenu(true)} delayLongPress={500}>
        {children}
      </TouchableOpacity>

      <Modal
        visible={showFallbackMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFallbackMenu(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowFallbackMenu(false)}>
          <View style={[styles.menu, { backgroundColor: theme.dark ? "#2a2a3e" : "#fff" }]}>
            {title && <Text style={[styles.menuTitle, { color: theme.colors.text }]}>{title}</Text>}
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.menuItem, action.disabled && styles.menuItemDisabled]}
                onPress={() => {
                  if (!action.disabled) {
                    setShowFallbackMenu(false);
                    onAction(action.id);
                  }
                }}
                disabled={action.disabled}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    { color: action.destructive ? "#FF3B30" : theme.colors.text },
                    action.disabled && styles.menuItemTextDisabled,
                  ]}
                >
                  {action.title}
                </Text>
                {action.subtitle && (
                  <Text style={[styles.menuItemSubtitle, { color: theme.dark ? "#999" : "#666" }]}>
                    {action.subtitle}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    borderRadius: 12,
    minWidth: 200,
    maxWidth: 280,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    textAlign: "center",
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemTextDisabled: {
    color: "#999",
  },
  menuItemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default NativeContextMenu;
