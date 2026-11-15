// PACKAGE_TYPE is a plain string enum — safe to import as a value even in
// Expo Go / Jest (react-native-purchases only touches the native module
// when its methods are called, which purchases.service.ts guards).
import { PACKAGE_TYPE, PurchasesPackage } from "react-native-purchases";
import { create } from "zustand";

import { purchasesService } from "../services/purchases.service";

/**
 * Outcome of a restore attempt:
 * - "restored": restore completed AND an active premium entitlement was found
 * - "no_purchases": restore completed but there was nothing to restore —
 *   the paywall must tell the user instead of closing as if it succeeded
 * (a thrown error is the third outcome — the restore call itself failed)
 */
export type RestoreResult = "restored" | "no_purchases";

interface PremiumState {
  isSubscribed: boolean;
  isLoading: boolean;
  offerings: PurchasesPackage[];
  selectedOffering: PurchasesPackage | null;
  error: string | null;
  checkSubscriptionStatus: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchasePackage: (pack: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<RestoreResult>;
  setSelectedOffering: (pack: PurchasesPackage | null) => void;
}

export const usePremiumStore = create<PremiumState>((set, get) => ({
  isSubscribed: false,
  isLoading: false,
  offerings: [],
  selectedOffering: null,
  error: null,

  checkSubscriptionStatus: async () => {
    try {
      set({ isLoading: true, error: null });
      const isSubscribed = await purchasesService.checkSubscriptionStatus();
      set({ isSubscribed });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadOfferings: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log("[Premium Store] Loading offerings...");
      const offerings = await purchasesService.getOfferings();
      console.log("[Premium Store] Loaded", offerings.length, "offerings");
      set({ offerings });

      // Auto-select yearly plan (best value) if available.
      // RevenueCat emits PACKAGE_TYPE.ANNUAL ("ANNUAL") — never compare
      // packageType against lowercase literals like "yearly".
      if (offerings.length > 0 && !get().selectedOffering) {
        const yearlyPlan = offerings.find(
          (o: PurchasesPackage) => o.packageType === PACKAGE_TYPE.ANNUAL
        );
        if (yearlyPlan) {
          console.log("[Premium Store] Auto-selected yearly plan");
          set({ selectedOffering: yearlyPlan });
        } else {
          console.log("[Premium Store] Auto-selected first plan");
          set({ selectedOffering: offerings[0] });
        }
      }
    } catch (error) {
      console.error("[Premium Store] Error loading offerings:", error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  purchasePackage: async (pack: PurchasesPackage) => {
    try {
      set({ isLoading: true, error: null });
      const result = await purchasesService.purchasePackage(pack);

      // The mock service returns a simulated customerInfo with entitlements
      // Check if it has active entitlements and update state directly
      if (result?.entitlements?.active) {
        set({ isSubscribed: true });
      } else {
        await get().checkSubscriptionStatus();
      }
    } catch (error) {
      set({ error: (error as Error).message });
      throw error; // Re-throw so the UI can handle it
    } finally {
      set({ isLoading: false });
    }
  },

  restorePurchases: async () => {
    try {
      set({ isLoading: true, error: null });
      await purchasesService.restorePurchases();
      // Re-check the entitlement rather than trusting that a completed
      // restore means an active subscription — it usually doesn't.
      const isSubscribed = await purchasesService.checkSubscriptionStatus();
      set({ isSubscribed });
      return isSubscribed ? ("restored" as const) : ("no_purchases" as const);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error; // Re-throw so the UI can show a restore-failed message
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedOffering: (pack: PurchasesPackage | null) => {
    set({ selectedOffering: pack });
  },
}));
