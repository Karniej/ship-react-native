import React, { useEffect, useRef } from "react";

import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { BRAND } from "@constants/brand";
import { APP_CONFIG } from "@constants/config";
import { Feather } from "@expo/vector-icons";
import { useI18n } from "@hooks/useI18n";
import { useTheme } from "expo-router/react-navigation";
import { PurchasesPackage } from "react-native-purchases";

interface SubscriptionPickerProps {
  offerings: PurchasesPackage[];
  selectedOffering: PurchasesPackage | null;
  onSelect: (pack: PurchasesPackage) => void;
}

export function SubscriptionPicker({
  offerings,
  selectedOffering,
  onSelect,
}: SubscriptionPickerProps) {
  const theme = useTheme();
  const { t } = useI18n();

  // Animation values
  const monthlyScale = useRef(new Animated.Value(1)).current;
  const yearlyScale = useRef(new Animated.Value(1)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;
  const monthlyFade = useRef(new Animated.Value(0)).current;
  const yearlyFade = useRef(new Animated.Value(0)).current;

  // Entrance animations
  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(yearlyFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(monthlyFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing badge animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(badgePulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const getDiscountPercentage = (monthlyPrice: number, yearlyPrice: number) => {
    const yearlyMonthlyAmount = yearlyPrice / 12;
    return Math.round(((monthlyPrice - yearlyMonthlyAmount) / monthlyPrice) * 100);
  };

  const handleSelect = (pack: PurchasesPackage, scaleValue: Animated.Value) => {
    // Bounce animation on selection
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        damping: 10,
        stiffness: 150,
        useNativeDriver: true,
      }),
    ]).start();

    onSelect(pack);
  };

  const monthlyPack = offerings.find(
    (pack) => pack.packageType === APP_CONFIG.SUBSCRIPTION_TYPES.MONTHLY
  );
  const yearlyPack = offerings.find(
    (pack) => pack.packageType === APP_CONFIG.SUBSCRIPTION_TYPES.YEARLY
  );

  if (!monthlyPack || !yearlyPack) return null;

  const monthlyPrice = monthlyPack.product.price;
  const yearlyPrice = yearlyPack.product.price;
  const discount = getDiscountPercentage(monthlyPrice, yearlyPrice);

  const isMonthlySelected = selectedOffering?.identifier === monthlyPack.identifier;
  const isYearlySelected = selectedOffering?.identifier === yearlyPack.identifier;

  return (
    <View style={styles.container}>
      {/* Yearly Option (Featured) */}
      <Animated.View style={[{ opacity: yearlyFade, transform: [{ scale: yearlyScale }] }]}>
        <TouchableOpacity
          style={[
            styles.option,
            styles.featuredOption,
            {
              backgroundColor: theme.dark ? "#1a1a2e" : "#fff",
              borderColor: isYearlySelected
                ? BRAND.colors.primary
                : theme.dark
                  ? "#333"
                  : "#E5E5EA",
              borderWidth: isYearlySelected ? 2 : 1,
            },
          ]}
          onPress={() => handleSelect(yearlyPack, yearlyScale)}
          activeOpacity={0.8}
        >
          {/* Save Badge */}
          {discount > 0 && (
            <Animated.View style={[styles.bestValueBadge, { transform: [{ scale: badgePulse }] }]}>
              <LinearGradient
                colors={BRAND.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bestValueGradient}
              >
                <Feather name="percent" size={12} color="#fff" />
                <Text style={styles.bestValueText}>
                  {t("premium.save")} {discount}%
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          <View style={styles.optionContent}>
            <View style={styles.optionLeft}>
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: isYearlySelected
                        ? BRAND.colors.primary
                        : theme.dark
                          ? "#666"
                          : "#ccc",
                    },
                  ]}
                >
                  {isYearlySelected && (
                    <LinearGradient colors={BRAND.gradients.primary} style={styles.radioInner} />
                  )}
                </View>
              </View>
              <View>
                <Text
                  style={[
                    styles.optionTitle,
                    { color: theme.colors.text },
                    isYearlySelected && { color: BRAND.colors.primary },
                  ]}
                >
                  {t("premium.yearly")}
                </Text>
                <Text style={[styles.optionSubtitle, { color: theme.dark ? "#999" : "#666" }]}>
                  ${(yearlyPrice / 12).toFixed(2)}/{t("premium.perMonth")}
                </Text>
              </View>
            </View>
            <View style={styles.optionRight}>
              <Text
                style={[
                  styles.optionPrice,
                  { color: theme.colors.text },
                  isYearlySelected && { color: BRAND.colors.primary },
                ]}
              >
                ${yearlyPrice.toFixed(2)}
              </Text>
              <Text style={[styles.optionPeriod, { color: theme.dark ? "#999" : "#666" }]}>
                /{t("premium.year")}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Monthly Option */}
      <Animated.View style={[{ opacity: monthlyFade, transform: [{ scale: monthlyScale }] }]}>
        <TouchableOpacity
          style={[
            styles.option,
            {
              backgroundColor: theme.dark ? "#1a1a2e" : "#fff",
              borderColor: isMonthlySelected
                ? BRAND.colors.primary
                : theme.dark
                  ? "#333"
                  : "#E5E5EA",
              borderWidth: isMonthlySelected ? 2 : 1,
            },
          ]}
          onPress={() => handleSelect(monthlyPack, monthlyScale)}
          activeOpacity={0.8}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionLeft}>
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: isMonthlySelected
                        ? BRAND.colors.primary
                        : theme.dark
                          ? "#666"
                          : "#ccc",
                    },
                  ]}
                >
                  {isMonthlySelected && (
                    <LinearGradient colors={BRAND.gradients.primary} style={styles.radioInner} />
                  )}
                </View>
              </View>
              <View>
                <Text
                  style={[
                    styles.optionTitle,
                    { color: theme.colors.text },
                    isMonthlySelected && { color: BRAND.colors.primary },
                  ]}
                >
                  {t("premium.monthly")}
                </Text>
                <Text style={[styles.optionSubtitle, { color: theme.dark ? "#999" : "#666" }]}>
                  {t("premium.billedMonthly")}
                </Text>
              </View>
            </View>
            <View style={styles.optionRight}>
              <Text
                style={[
                  styles.optionPrice,
                  { color: theme.colors.text },
                  isMonthlySelected && { color: BRAND.colors.primary },
                ]}
              >
                ${monthlyPrice.toFixed(2)}
              </Text>
              <Text style={[styles.optionPeriod, { color: theme.dark ? "#999" : "#666" }]}>
                /{t("premium.month")}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  option: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  featuredOption: {
    paddingTop: 22,
    position: "relative",
  },
  bestValueBadge: {
    position: "absolute",
    top: -12,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  bestValueGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bestValueText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  optionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  optionRight: {
    alignItems: "flex-end",
  },
  optionPrice: {
    fontSize: 20,
    fontWeight: "700",
  },
  optionPeriod: {
    fontSize: 13,
  },
});
