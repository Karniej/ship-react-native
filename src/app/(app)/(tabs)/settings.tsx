import React, { useEffect, useState, useRef } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { GlassCard } from "@components/ui/design";
import { NativeSwitch } from "@components/ui/native";
import { API_MODE } from "@constants/api";
import { BRAND } from "@constants/brand";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@hooks/useAppTheme";
import { useI18n } from "@hooks/useI18n";
import { languages, Language } from "@locales";
import { PostHogAnalytics } from "@services/PostHogService";
import { useAuthStore } from "@store/useAuthStore";
import { useGeneralStore } from "@store/useGeneralStore";
import { useNotificationStore } from "@store/useNotificationStore";
import { haptics } from "@utils/haptics";
import { usePostHog } from "posthog-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEMES = [
  { value: "light" as const, name: "light", icon: "sun" as const },
  { value: "dark" as const, name: "dark", icon: "moon" as const },
  { value: "system" as const, name: "system", icon: "smartphone" as const },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const posthog = usePostHog();
  const { t, language, changeLanguage } = useI18n();
  const { user, signOut, updateUser } = useAuthStore();
  const { theme: currentTheme, setTheme, isCelsius, setIsCelsius } = useGeneralStore();
  const {
    preferences,
    updatePreference,
    requestPermission,
    scheduleNotification,
    cancelAllNotifications,
  } = useNotificationStore();

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    PostHogAnalytics.trackScreenViewed(posthog, "settings");
  }, [posthog]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    haptics.selection();
    setTheme(newTheme);
    PostHogAnalytics.trackSettingsChanged(posthog, "theme", newTheme);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    haptics.selection();
    changeLanguage(newLanguage);
    PostHogAnalytics.trackSettingsChanged(posthog, "language", newLanguage);
  };

  const handleNotificationToggle = async (value: boolean) => {
    haptics.light();
    if (value) {
      const granted = await requestPermission();
      if (granted) {
        await scheduleNotification({
          content: {
            title: t("settings.dailyReminders"),
            body: t("home.whatToCreate"),
          },
          trigger: {
            hour: 10,
            minute: 0,
            repeats: true,
          },
        });
        haptics.success();
      }
    } else {
      await cancelAllNotifications();
    }
    updatePreference("dailyReminders", value);
    PostHogAnalytics.trackSettingsChanged(posthog, "daily_reminders", value);
  };

  const handlePreferenceChange = (key: "achievements" | "weeklySummary", value: boolean) => {
    haptics.light();
    updatePreference(key, value);
    PostHogAnalytics.trackSettingsChanged(posthog, key, value);
  };

  const handleSignOut = () => {
    haptics.warning();
    Alert.alert(t("auth.signOut"), t("auth.signOutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.signOut"),
        style: "destructive",
        onPress: async () => {
          haptics.medium();
          PostHogAnalytics.trackUserSignedOut(posthog);
          await signOut();
          router.replace("/");
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      haptics.warning();
      Alert.alert(t("common.error"), t("errors.emptyName"));
      return;
    }

    haptics.medium();
    setIsSaving(true);
    try {
      if (user?.id) {
        if (API_MODE === "convex") {
          console.log("[Settings] Use Convex mutation to update profile");
        }
      }

      updateUser({ name: editName.trim() });
      setIsEditing(false);
      haptics.success();
      PostHogAnalytics.trackProfileUpdated(posthog, ["name"]);
      Alert.alert(t("common.success"), t("profile.profileUpdated"));
    } catch (error) {
      console.error("Failed to update profile:", error);
      haptics.error();
      Alert.alert(t("common.error"), t("errors.generic"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenHelp = () => {
    haptics.light();
    Alert.alert(
      t("profile.helpSupport"),
      `For assistance, please contact us at:\n\n${BRAND.links.support}`,
      [{ text: t("common.ok") }]
    );
  };

  const SettingRow = ({
    icon,
    label,
    value,
    onPress,
    color,
  }: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    color?: string;
  }) => (
    <TouchableOpacity
      style={[styles.settingRow, { padding: sp.md }]}
      onPress={() => {
        if (onPress) {
          haptics.light();
          onPress();
        }
      }}
      disabled={!onPress}
    >
      <View style={[styles.settingRowLeft, { gap: sp.md }]}>
        <Feather name={icon} size={20} color={color || tc.textSecondary} />
        <Text style={[styles.settingLabel, { color: color || tc.text }]}>{label}</Text>
      </View>
      {value && (
        <View style={[styles.settingRowRight, { gap: sp.xs }]}>
          <Text style={[styles.settingValue, { color: tc.textTertiary }]}>{value}</Text>
          {onPress && <Feather name="chevron-right" size={16} color={tc.textTertiary} />}
        </View>
      )}
      {!value && onPress && <Feather name="chevron-right" size={16} color={tc.textTertiary} />}
    </TouchableOpacity>
  );

  const SettingSwitch = ({
    icon,
    label,
    value,
    onValueChange,
  }: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={[styles.settingRow, { padding: sp.md }]}>
      <View style={[styles.settingRowLeft, { gap: sp.md }]}>
        <Feather name={icon} size={20} color={tc.textSecondary} />
        <Text style={[styles.settingLabel, { color: tc.text }]}>{label}</Text>
      </View>
      <NativeSwitch value={value} onValueChange={onValueChange} />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: tc.backgroundSecondary }]}
      edges={["top"]}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { padding: sp.lg, gap: sp["2xl"], paddingBottom: 120 }]}>
          <Text style={[styles.title, { color: tc.text }]}>{t("settings.title")}</Text>

          {/* Account Section — hidden, re-enable by removing {false && ...} wrapper */}
          {false && (
            <View style={[styles.section, { gap: sp.sm }]}>
              <Text style={[styles.sectionTitle, { color: tc.textSecondary }]}>
                {t("common.profile")}
              </Text>
              <GlassCard padding={sp.xs}>
                <TouchableOpacity
                  style={[styles.profileHeader, { padding: sp.md, gap: sp.md }]}
                  onPress={() => {
                    haptics.light();
                    setEditName(user?.name || "");
                    setIsEditing(true);
                  }}
                >
                  <View style={styles.avatarContainer}>
                    <Image
                      source={{
                        uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.name || "default"}`,
                      }}
                      style={styles.avatar}
                    />
                    {user?.isPremium && (
                      <View style={styles.premiumBadge}>
                        <Feather name="star" size={10} color="#FFD700" />
                      </View>
                    )}
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: tc.text }]}>
                      {user?.name || "User"}
                    </Text>
                    <Text style={[styles.profileEmail, { color: tc.textSecondary }]}>
                      {user?.email || "user@example.com"}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={tc.textTertiary} />
                </TouchableOpacity>
              </GlassCard>
            </View>
          )}

          {/* Premium Section — hidden (hard paywall only) */}
          {false && !user?.isPremium && (
            <TouchableOpacity
              style={[styles.premiumCardContainer, { borderRadius: br.xl }]}
              onPress={() => {
                haptics.medium();
                router.push("/(app)/premium");
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={BRAND.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.premiumCard, { padding: 18 }]}
              >
                <View style={[styles.premiumContent, { gap: 14 }]}>
                  <View style={[styles.premiumIconContainer, { borderRadius: br.lg }]}>
                    <Feather name="star" size={24} color="#fff" />
                  </View>
                  <View style={styles.premiumText}>
                    <Text style={styles.premiumTitle}>{t("profile.upgradeToPremium")}</Text>
                    <Text style={styles.premiumSubtitle}>{t("profile.unlockFeatures")}</Text>
                  </View>
                </View>
                <View style={styles.premiumArrow}>
                  <Feather name="arrow-right" size={20} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Appearance Section */}
          <View style={[styles.section, { gap: sp.sm }]}>
            <Text style={[styles.sectionTitle, { color: tc.textSecondary }]}>
              {t("settings.appearance")}
            </Text>
            <GlassCard padding={sp.xs}>
              <Text
                style={[
                  styles.cardLabel,
                  { color: tc.textSecondary, padding: sp.md, paddingBottom: sp.sm },
                ]}
              >
                {t("settings.theme")}
              </Text>
              <View style={[styles.themeOptions, { gap: sp.sm, padding: sp.sm, paddingTop: 0 }]}>
                {THEMES.map((themeOption) => (
                  <TouchableOpacity
                    key={themeOption.value}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: tc.backgroundSecondary,
                        padding: sp.md,
                        borderRadius: br.md,
                        gap: sp.sm,
                      },
                      currentTheme === themeOption.value && styles.themeOptionActive,
                    ]}
                    onPress={() => handleThemeChange(themeOption.value)}
                  >
                    <Feather
                      name={themeOption.icon}
                      size={20}
                      color={currentTheme === themeOption.value ? tc.primary : tc.textSecondary}
                    />
                    <Text
                      style={[
                        styles.themeOptionText,
                        { color: tc.textSecondary },
                        currentTheme === themeOption.value && {
                          color: tc.primary,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {t(`settings.${themeOption.name}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          </View>

          {/* Notifications Section */}
          <View style={[styles.section, { gap: sp.sm }]}>
            <Text style={[styles.sectionTitle, { color: tc.textSecondary }]}>
              {t("settings.notifications")}
            </Text>
            <GlassCard padding={sp.xs}>
              <SettingSwitch
                icon="bell"
                label={t("settings.dailyReminders")}
                value={preferences.dailyReminders}
                onValueChange={handleNotificationToggle}
              />
              <View
                style={[
                  styles.separator,
                  { backgroundColor: tc.borderSubtle, marginHorizontal: sp.md },
                ]}
              />
              <SettingSwitch
                icon="award"
                label={t("settings.achievementAlerts")}
                value={preferences.achievements}
                onValueChange={(value) => handlePreferenceChange("achievements", value)}
              />
              <View
                style={[
                  styles.separator,
                  { backgroundColor: tc.borderSubtle, marginHorizontal: sp.md },
                ]}
              />
              <SettingSwitch
                icon="file-text"
                label={t("settings.weeklySummary")}
                value={preferences.weeklySummary}
                onValueChange={(value) => handlePreferenceChange("weeklySummary", value)}
              />
            </GlassCard>
          </View>

          {/* Language Selection */}
          <View style={[styles.section, { gap: sp.sm }]}>
            <Text style={[styles.sectionTitle, { color: tc.textSecondary }]}>
              {t("settings.language")}
            </Text>
            <GlassCard padding={sp.xs}>
              {languages.map((lang, index) => (
                <View key={lang.code}>
                  <TouchableOpacity
                    style={[styles.languageRow, { padding: sp.md }]}
                    onPress={() => handleLanguageChange(lang.code)}
                  >
                    <View>
                      <Text
                        style={[
                          styles.languageText,
                          { color: tc.text },
                          language === lang.code && { color: tc.primary, fontWeight: "600" },
                        ]}
                      >
                        {lang.nativeName}
                      </Text>
                      <Text style={[styles.languageSubtext, { color: tc.textTertiary }]}>
                        {lang.name}
                      </Text>
                    </View>
                    {language === lang.code && (
                      <Feather name="check" size={20} color={tc.primary} />
                    )}
                  </TouchableOpacity>
                  {index < languages.length - 1 && (
                    <View
                      style={[
                        styles.separator,
                        { backgroundColor: tc.borderSubtle, marginHorizontal: sp.md },
                      ]}
                    />
                  )}
                </View>
              ))}
            </GlassCard>
          </View>

          {/* Support & About Section */}
          <View style={[styles.section, { gap: sp.sm }]}>
            <Text style={[styles.sectionTitle, { color: tc.textSecondary }]}>
              {t("settings.about")}
            </Text>
            <GlassCard padding={sp.xs}>
              <SettingRow
                icon="bar-chart-2"
                label={t("analytics.title")}
                onPress={() => router.push("/(app)/analytics")}
              />
              <View
                style={[
                  styles.separator,
                  { backgroundColor: tc.borderSubtle, marginHorizontal: sp.md },
                ]}
              />
              <SettingRow
                icon="help-circle"
                label={t("profile.helpSupport")}
                onPress={handleOpenHelp}
              />
              <View
                style={[
                  styles.separator,
                  { backgroundColor: tc.borderSubtle, marginHorizontal: sp.md },
                ]}
              />
              <SettingRow
                icon="shield"
                label={t("settings.privacyPolicy")}
                onPress={() => router.push("/privacy")}
              />
              <View
                style={[
                  styles.separator,
                  { backgroundColor: tc.borderSubtle, marginHorizontal: sp.md },
                ]}
              />
              <SettingRow
                icon="book"
                label={t("settings.termsOfService")}
                onPress={() => router.push("/terms")}
              />
              <View
                style={[
                  styles.separator,
                  { backgroundColor: tc.borderSubtle, marginHorizontal: sp.md },
                ]}
              />
              <SettingRow icon="info" label={t("settings.version")} value="1.0.0" />
            </GlassCard>
          </View>

          {/* Sign Out — hidden, re-enable by removing {false && ...} wrapper */}
          {false && (
            <View style={[styles.section, { gap: sp.sm }]}>
              <GlassCard padding={sp.xs}>
                <SettingRow
                  icon="log-out"
                  label={t("auth.signOut")}
                  color="#FF3B30"
                  onPress={handleSignOut}
                />
              </GlassCard>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Profile Modal — hidden, re-enable by removing {false && ...} wrapper */}
      {false && (
        <Modal
          visible={isEditing}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsEditing(false)}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: tc.background }]}>
            <KeyboardAvoidingView
              style={styles.keyboardView}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <View
                style={[styles.modalHeader, { borderBottomColor: tc.borderSubtle, padding: sp.lg }]}
              >
                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    setIsEditing(false);
                  }}
                >
                  <Text style={[styles.modalCancelText, { color: tc.textSecondary }]}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: tc.text }]}>
                  {t("profile.editProfile")}
                </Text>
                <TouchableOpacity onPress={handleSaveProfile} disabled={isSaving}>
                  <Text
                    style={[
                      styles.modalSaveText,
                      { color: tc.primary },
                      isSaving && styles.modalSaveTextDisabled,
                    ]}
                  >
                    {isSaving ? t("common.loading") : t("common.save")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.modalContent, { padding: sp.lg, gap: sp["2xl"] }]}>
                <View style={[styles.modalAvatarContainer, { gap: sp.sm }]}>
                  <Image
                    source={{
                      uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${editName || "default"}`,
                    }}
                    style={styles.modalAvatar}
                  />
                  <Text style={[styles.avatarHint, { color: tc.textTertiary }]}>
                    {t("profile.avatarHint")}
                  </Text>
                </View>

                <View style={[styles.inputGroup, { gap: sp.sm }]}>
                  <Text style={[styles.inputLabel, { color: tc.text }]}>{t("auth.name")}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: tc.surfaceElevated,
                        borderColor: tc.borderSubtle,
                        color: tc.text,
                        borderRadius: br.md,
                        padding: sp.md,
                      },
                    ]}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder={t("onboarding.enterName")}
                    placeholderTextColor={tc.textTertiary}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <View style={[styles.inputGroup, { gap: sp.sm }]}>
                  <Text style={[styles.inputLabel, { color: tc.text }]}>{t("auth.email")}</Text>
                  <View
                    style={[
                      styles.inputDisabled,
                      {
                        backgroundColor: tc.backgroundSecondary,
                        borderRadius: br.md,
                        padding: sp.md,
                        borderColor: tc.borderSubtle,
                      },
                    ]}
                  >
                    <Text style={[styles.inputDisabledText, { color: tc.textTertiary }]}>
                      {user?.email || ""}
                    </Text>
                  </View>
                  <Text style={[styles.inputHint, { color: tc.textTertiary }]}>
                    {t("profile.emailCannotChange")}
                  </Text>
                </View>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {},
  title: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 0.37,
  },
  section: {},
  sectionTitle: {
    fontSize: 13,
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  // Profile Header
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  premiumBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#1a365d",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  // Premium Card
  premiumCardContainer: {
    overflow: "hidden",
    shadowColor: BRAND.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  premiumIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  premiumSubtitle: {
    fontSize: 13,
    marginTop: 3,
    color: "rgba(255,255,255,0.85)",
  },
  premiumArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Theme
  cardLabel: {
    fontSize: 14,
  },
  themeOptions: {
    flexDirection: "row",
  },
  themeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  themeOptionActive: {
    backgroundColor: "#E3F2FD",
  },
  themeOptionText: {
    fontSize: 14,
  },
  // Settings rows
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingRowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 17,
  },
  settingValue: {
    fontSize: 17,
  },
  separator: {
    height: 1,
  },
  // Language
  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  languageText: {
    fontSize: 17,
  },
  languageSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  // Modal
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  modalCancelText: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalSaveTextDisabled: {
    opacity: 0.5,
  },
  modalContent: {},
  modalAvatarContainer: {
    alignItems: "center",
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarHint: {
    fontSize: 12,
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    fontSize: 16,
  },
  inputDisabled: {
    borderWidth: 1,
  },
  inputDisabledText: {
    fontSize: 16,
  },
  inputHint: {
    fontSize: 12,
  },
});
