import { Platform } from "react-native";

import Constants from "expo-constants";

import { APP_CONFIG } from "../constants/config";

let Purchases: any = null;
let isAvailable = false;

const isExpoGo = Constants.appOwnership === "expo";

// Check if RevenueCat keys are configured (not placeholder values)
const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
const hasValidKeys =
  (Platform.OS === "ios" &&
    iosKey &&
    !iosKey.includes("your_ios_key") &&
    iosKey.startsWith("appl_")) ||
  (Platform.OS === "android" &&
    androidKey &&
    !androidKey.includes("your_android_key") &&
    androidKey.startsWith("goog_"));

// Only try to load RevenueCat if not in Expo Go and keys are configured
if (!isExpoGo && hasValidKeys) {
  try {
    Purchases = require("react-native-purchases").default;
    isAvailable = Purchases !== null;
  } catch {
    // Silent - RevenueCat not available
  }
}

// ============================================================================
// MOCK OFFERINGS FOR DEVELOPMENT
// ============================================================================
// These mock offerings are used when RevenueCat is not available (Expo Go, dev, etc.)
// They simulate real subscription packages for UI development and testing.

const MOCK_OFFERINGS = [
  {
    identifier: "premium_yearly",
    packageType: "ANNUAL",
    product: {
      identifier: "BUNDLE.ios.yearly",
      title: "Yearly Plan",
      description: "Full access for one year",
      price: 49.99,
      priceString: "$49.99",
      currencyCode: "USD",
      introPrice: {
        price: 0,
        priceString: "Free",
        periodNumberOfUnits: 7,
        periodUnit: "DAY",
      },
    },
    offeringIdentifier: "default",
  },
  {
    identifier: "premium_weekly",
    packageType: "WEEKLY",
    product: {
      identifier: "BUNDLE.ios.weekly",
      title: "Weekly Plan",
      description: "Full access weekly",
      price: 7.99,
      priceString: "$7.99",
      currencyCode: "USD",
      introPrice: null,
    },
    offeringIdentifier: "default",
  },
];

class PurchasesService {
  private initialized = false;
  private lastIdentifiedUserId: string | null = null;

  async initialize() {
    if (!isAvailable || this.initialized) return;

    try {
      const apiKey =
        Platform.OS === "android"
          ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
          : process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

      if (apiKey) {
        await Purchases.configure({ apiKey });
        this.initialized = true;
      }
    } catch (error: any) {
      // Silent in production, warn in dev only for real errors
      if (__DEV__ && !error?.message?.includes("configured")) {
        console.warn("[RevenueCat] Init error:", error?.message);
      }
    }
  }

  async getOfferings() {
    // Return mock offerings when RevenueCat is not available
    // This includes Expo Go and development without valid keys
    if (!isAvailable) {
      // Simulate async loading
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log("[Purchases] Using mock offerings (RevenueCat not available)");
      return MOCK_OFFERINGS as any;
    }

    try {
      const offerings = await Purchases.getOfferings();
      const packages = offerings.current?.availablePackages ?? [];
      console.log("[Purchases] Loaded", packages.length, "offerings from RevenueCat");
      return packages;
    } catch (error) {
      console.warn("[Purchases] Failed to load offerings:", error);
      // Fallback to mock offerings
      console.log("[Purchases] Using mock offerings as fallback");
      return MOCK_OFFERINGS as any;
    }
  }

  async purchasePackage(pack: any) {
    // Simulate purchase when RevenueCat is not available
    if (!isAvailable) {
      console.log("[Purchases] Simulating purchase for:", pack.identifier);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Simulate successful purchase
      return {
        entitlements: { active: { [APP_CONFIG.PREMIUM_ENTITLEMENT_ID]: true } },
      };
    }

    const { customerInfo } = await Purchases.purchasePackage(pack);
    return customerInfo;
  }

  async restorePurchases() {
    if (!isAvailable) throw new Error("Purchases not available");

    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  }

  async checkSubscriptionStatus(): Promise<boolean> {
    if (!isAvailable) return false;

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return this.hasActiveSubscription(customerInfo);
    } catch {
      return false;
    }
  }

  /**
   * Link the RevenueCat identity to our backend user id so webhook
   * `app_user_id` matches `profiles.userId`. Repeated calls with the same
   * id are no-ops. Never call this for anonymous users — that would burn a
   * RevenueCat identity per install.
   */
  async identifyUser(userId: string) {
    if (!isAvailable || !userId || this.lastIdentifiedUserId === userId) return;

    try {
      await Purchases.logIn(userId);
      this.lastIdentifiedUserId = userId;
    } catch {
      // Silent
    }
  }

  async logoutUser() {
    // No-op unless someone was identified — avoids RevenueCat's
    // "current user is anonymous" error on cold starts / anonymous sessions
    if (!isAvailable || this.lastIdentifiedUserId === null) return;

    try {
      await Purchases.logOut();
    } catch {
      // Silent
    } finally {
      this.lastIdentifiedUserId = null;
    }
  }

  private hasActiveSubscription(customerInfo: any): boolean {
    return customerInfo.entitlements.active[APP_CONFIG.PREMIUM_ENTITLEMENT_ID] !== undefined;
  }
}

export const purchasesService = new PurchasesService();
