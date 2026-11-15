import { useState, useEffect, useCallback } from "react";

import { purchasesService } from "../services/purchases.service";
import { useAuthStore } from "../store/useAuthStore";
import { usePremiumStore } from "../store/usePremiumStore";

interface PremiumStatusState {
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
  lastChecked: number | null;
}

export function usePremiumStatus() {
  const { user, updateUser } = useAuthStore();
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatusState>({
    isPremium: user?.isPremium || false,
    isLoading: true,
    error: null,
    lastChecked: null,
  });

  const checkPremiumStatus = useCallback(async () => {
    try {
      setPremiumStatus((prev) => ({ ...prev, isLoading: true, error: null }));

      const isPremium = await purchasesService.checkSubscriptionStatus();

      setPremiumStatus({
        isPremium,
        isLoading: false,
        error: null,
        lastChecked: Date.now(),
      });

      // Sync the shared premium store so the hard-paywall guard sees the change
      usePremiumStore.setState({ isSubscribed: isPremium });

      // Update user store if premium status changed
      if (user && user.isPremium !== isPremium) {
        updateUser({ isPremium });
      }
    } catch (error) {
      setPremiumStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [user, updateUser]);

  useEffect(() => {
    checkPremiumStatus();

    // Check premium status every 5 minutes
    const interval = setInterval(checkPremiumStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkPremiumStatus]);

  // Refresh premium status when user changes
  useEffect(() => {
    if (user) {
      setPremiumStatus((prev) => ({ ...prev, isPremium: user.isPremium }));
    }
  }, [user]);

  return {
    ...premiumStatus,
    refresh: checkPremiumStatus,
  };
}

export function useIsPremium(): boolean {
  const { isPremium } = usePremiumStatus();
  return isPremium;
}
