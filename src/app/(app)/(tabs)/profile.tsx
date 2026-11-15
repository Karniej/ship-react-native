import React, { useState, useEffect, useRef } from "react";

import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  Modal,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { GlassCard } from "@components/ui/design";
import { API_MODE } from "@constants/api";
import { BRAND } from "@constants/brand";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@hooks/useAppTheme";
import { useI18n } from "@hooks/useI18n";
import { PostHogAnalytics } from "@services/PostHogService";
import { useAuthStore } from "@store/useAuthStore";
import { haptics } from "@utils/haptics";
import { usePostHog } from "posthog-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark, colors: tc, spacing: sp, borderRadius: br } = useAppTheme();
  const posthog = usePostHog();
  const { t } = useI18n();
  const { user, signOut, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    PostHogAnalytics.trackScreenViewed(posthog, "profile");
  }, [posthog]);

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
          console.log("[Profile] Use Convex mutation to update profile");
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
      "For assistance, please contact us at:\n\nsupport@example.com",
      [{ text: t("common.ok") }]
    );
  };

  const ProfileRow = ({
    icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: keyof typeof Feather.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={() => {
        if (onPress) {
          haptics.light();
          onPress();
        }
      }}
      style={[
        styles.profileRow,
        { borderBottomColor: tc.borderSubtle, padding: sp.lg, gap: sp.md },
      ]}
      disabled={!onPress}
    >
      <Feather name={icon} size={20} color="#4facfe" />
      <View style={styles.profileRowContent}>
        <Text style={[styles.profileRowTitle, { color: tc.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.profileRowSubtitle, { color: tc.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      {onPress && <Feather name="chevron-right" size={16} color={tc.textTertiary} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.background }]} edges={["top"]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { padding: sp.lg, gap: sp.lg }]}>
          {/* Profile Header */}
          <View style={[styles.profileHeader, { gap: sp.md, padding: sp.lg }]}>
            <TouchableOpacity
              style={[styles.avatar, { backgroundColor: tc.borderSubtle }]}
              onPress={() => {
                haptics.light();
                setEditName(user?.name || "");
                setIsEditing(true);
              }}
            >
              <Image
                source={{
                  uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.name || "default"}`,
                }}
                style={styles.avatarImage}
              />
              <View style={[styles.editBadge, { backgroundColor: tc.primary }]}>
                <Feather name="edit-2" size={12} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={[styles.profileInfo, { gap: sp.xs }]}>
              <Text style={[styles.profileName, { color: tc.text }]}>{user?.name || "User"}</Text>
              <Text style={[styles.profileEmail, { color: tc.textSecondary }]}>
                {user?.email || "user@example.com"}
              </Text>
              {user?.isPremium && (
                <View style={[styles.premiumBadge, { gap: sp.xs, marginTop: sp.xs }]}>
                  <Feather name="star" size={16} color="#FFD700" />
                  <Text style={styles.premiumText}>{t("profile.premiumMember")}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Profile Options */}
          <GlassCard padding={0}>
            <ProfileRow
              icon="user"
              title={t("profile.editProfile")}
              subtitle={t("profile.updateInfo")}
              onPress={() => {
                setEditName(user?.name || "");
                setIsEditing(true);
              }}
            />
            <ProfileRow
              icon="shield"
              title={t("profile.privacySecurity")}
              subtitle={t("profile.managePrivacy")}
              onPress={() => router.push("/privacy")}
            />
            <ProfileRow
              icon="bell"
              title={t("settings.notifications")}
              subtitle={t("profile.customizeNotifications")}
              onPress={() => router.push("/(app)/(tabs)/settings")}
            />
            <ProfileRow
              icon="help-circle"
              title={t("profile.helpSupport")}
              subtitle={t("profile.getHelp")}
              onPress={handleOpenHelp}
            />
            <ProfileRow
              icon="bar-chart-2"
              title={t("analytics.title")}
              subtitle={t("analytics.viewStats")}
              onPress={() => router.push("/(app)/analytics")}
            />
          </GlassCard>

          {/* Premium Section */}
          {!user?.isPremium && (
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
                style={[styles.premiumCard, { padding: sp.xl, gap: sp.lg }]}
              >
                <View style={[styles.premiumHeader, { gap: 14 }]}>
                  <View style={[styles.premiumIconContainer, { borderRadius: br.xl }]}>
                    <Feather name="star" size={24} color="#fff" />
                  </View>
                  <View style={[styles.premiumTextContainer, { gap: sp.xs }]}>
                    <Text style={styles.premiumTitle}>{t("profile.upgradeToPremium")}</Text>
                    <Text style={styles.premiumDescription}>{t("profile.unlockFeatures")}</Text>
                  </View>
                </View>
                <View style={[styles.upgradeButton, { borderRadius: br.lg }]}>
                  <Text style={[styles.upgradeButtonText, { color: tc.primary }]}>
                    {t("profile.upgradeNow")}
                  </Text>
                  <Feather name="arrow-right" size={16} color={tc.primary} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Account Actions */}
          <View style={[styles.actions, { gap: sp.md }]}>
            <TouchableOpacity
              style={[styles.outlineButton, { borderColor: tc.borderSubtle, borderRadius: br.md }]}
              onPress={() => {
                haptics.light();
                router.push("/terms");
              }}
            >
              <Text style={[styles.outlineButtonText, { color: tc.text }]}>
                {t("settings.termsOfService")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dangerButton, { borderRadius: br.md }]}
              onPress={handleSignOut}
            >
              <Text style={styles.dangerButtonText}>{t("auth.signOut")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditing(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: tc.background }]}>
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
            <Text style={[styles.modalTitle, { color: tc.text }]}>{t("profile.editProfile")}</Text>
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
        </SafeAreaView>
      </Modal>
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
  content: {},
  profileHeader: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "visible",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileEmail: {
    fontSize: 14,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  premiumText: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "600",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  profileRowContent: {
    flex: 1,
  },
  profileRowTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  profileRowSubtitle: {
    fontSize: 14,
  },
  premiumCardContainer: {
    overflow: "hidden",
    shadowColor: BRAND.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumCard: {},
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  premiumIconContainer: {
    width: 52,
    height: 52,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  premiumDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  upgradeButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  actions: {},
  outlineButton: {
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  outlineButtonText: {
    fontSize: 16,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: "#FF3B30",
    paddingVertical: 14,
    alignItems: "center",
  },
  dangerButtonText: {
    fontSize: 16,
    color: "#FF3B30",
  },
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
