import { useCallback } from "react";

import { useRouter } from "expo-router";

import { usePremiumStore } from "../store/usePremiumStore";

export function usePremiumFeatures() {
  const router = useRouter();
  const { isSubscribed } = usePremiumStore();

  const requirePremium = useCallback(
    (callback: () => void) => {
      if (isSubscribed) {
        callback();
      } else {
        router.push("/premium");
      }
    },
    [isSubscribed, router]
  );

  const isPremiumFeature = useCallback(
    (callback: () => void) => {
      return () => requirePremium(callback);
    },
    [requirePremium]
  );

  return {
    isSubscribed,
    requirePremium,
    isPremiumFeature,
  };
}
