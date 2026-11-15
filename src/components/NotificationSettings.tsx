/** @format */

import React, { useState, useEffect } from "react";

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";

import * as Notifications from "expo-notifications";

import { NativeSwitch } from "@components/ui/native";
import { colors, spacing, typography } from "@constants/theme";
import { Feather } from "@expo/vector-icons";
import { useNotificationStore } from "@store/useNotificationStore";
import { useTheme } from "expo-router/react-navigation";

export interface NotificationSettingsProps {
  onClose?: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const theme = useTheme();
  const { preferences, updatePreference, requestPermission, checkPermissionStatus, isEnabled } =
    useNotificationStore();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const status = await checkPermissionStatus();
    setHasPermission(status === "granted");
  };

  const handleToggleMasterSwitch = async (value: boolean) => {
    if (value && hasPermission === false) {
      // Request permission first
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "To enable notifications, please allow permissions in Settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }
      setHasPermission(true);
    }

    updatePreference("enabled", value);
  };

  const handleTogglePreference = (key: keyof typeof preferences, value: boolean) => {
    updatePreference(key, value);
  };

  const NotificationRow = ({
    title,
    subtitle,
    icon,
    value,
    onToggle,
    disabled = false,
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    value: boolean;
    onToggle: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
          <Feather name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.text, opacity: 0.5 }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <NativeSwitch value={value} onValueChange={onToggle} disabled={disabled} />
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Notification Settings
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Permission Status */}
      {hasPermission === false && (
        <View style={[styles.warningContainer, { backgroundColor: colors.warning + "20" }]}>
          <Feather name="alert-triangle" size={20} color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.warning }]}>
            Notifications are disabled. Enable them in Settings to receive updates.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openSettings()}
            style={[styles.warningButton, { borderColor: colors.warning }]}
          >
            <Text style={[styles.warningButtonText, { color: colors.warning }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Master Switch */}
      <View style={styles.section}>
        <NotificationRow
          title="Enable Notifications"
          subtitle="Allow the app to send you notifications"
          icon="bell"
          value={isEnabled}
          onToggle={handleToggleMasterSwitch}
        />
      </View>

      {/* Notification Types */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notification Types</Text>

        <NotificationRow
          title="Daily Reminders"
          subtitle="Get reminded about your daily goals"
          icon="clock"
          value={preferences.dailyReminders}
          onToggle={(value) => handleTogglePreference("dailyReminders", value)}
          disabled={!isEnabled}
        />

        <NotificationRow
          title="Achievement Notifications"
          subtitle="Celebrate your milestones and achievements"
          icon="award"
          value={preferences.achievements}
          onToggle={(value) => handleTogglePreference("achievements", value)}
          disabled={!isEnabled}
        />

        <NotificationRow
          title="Weekly Summary"
          subtitle="Get a summary of your weekly progress"
          icon="bar-chart"
          value={preferences.weeklySummary}
          onToggle={(value) => handleTogglePreference("weeklySummary", value)}
          disabled={!isEnabled}
        />

        <NotificationRow
          title="Motivational Messages"
          subtitle="Receive inspiring messages to keep you motivated"
          icon="heart"
          value={preferences.motivational}
          onToggle={(value) => handleTogglePreference("motivational", value)}
          disabled={!isEnabled}
        />
      </View>

      {/* Timing Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Timing</Text>

        <NotificationRow
          title="Quiet Hours"
          subtitle="Reduce notifications during sleep hours"
          icon="moon"
          value={preferences.quietHours}
          onToggle={(value) => handleTogglePreference("quietHours", value)}
          disabled={!isEnabled}
        />

        <NotificationRow
          title="Sound"
          subtitle="Play sound with notifications"
          icon="volume-2"
          value={preferences.sound}
          onToggle={(value) => handleTogglePreference("sound", value)}
          disabled={!isEnabled}
        />

        <NotificationRow
          title="Vibration"
          subtitle="Vibrate when receiving notifications"
          icon="smartphone"
          value={preferences.vibration}
          onToggle={(value) => handleTogglePreference("vibration", value)}
          disabled={!isEnabled}
        />
      </View>

      {/* Test Notification */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.testButton,
            {
              backgroundColor: colors.primary,
              opacity: isEnabled ? 1 : 0.5,
            },
          ]}
          disabled={!isEnabled}
          onPress={async () => {
            setIsLoading(true);
            try {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "Test Notification",
                  body: "This is a test notification to check your settings.",
                  sound: preferences.sound,
                },
                trigger: null,
              });
              Alert.alert("Success", "Test notification sent!");
            } catch {
              Alert.alert("Error", "Failed to send test notification");
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <Text style={[styles.testButtonText, { color: colors.white }]}>
            {isLoading ? "Sending..." : "Send Test Notification"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: "600",
  },
  closeButton: {
    padding: spacing.sm,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 8,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  warningButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderRadius: 4,
  },
  warningButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "500",
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  testButton: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    alignItems: "center",
  },
  testButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
  },
});

export default NotificationSettings;
