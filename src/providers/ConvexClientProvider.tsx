import { ReactNode, useEffect } from "react";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexProvider, ConvexReactClient, useConvexAuth, useQuery } from "convex/react";
import { anyApi } from "convex/server";

import { CONVEX_URL, API_MODE } from "@/constants/api";
import { purchasesService } from "@/services/purchases.service";

// Create Convex client (only if in Convex mode)
const convex = CONVEX_URL ? new ConvexReactClient(CONVEX_URL) : null;

interface ConvexClientProviderProps {
  children: ReactNode;
}

/**
 * Keeps the RevenueCat identity in sync with Convex auth.
 *
 * Identifying signed-in users via `Purchases.logIn(userId)` is what makes
 * RevenueCat webhook `app_user_id` match `profiles.userId`, so
 * convex/subscriptions.ts can resolve the profile for subscription events.
 *
 * Anonymous users are deliberately NOT identified (that would burn one
 * RevenueCat identity per install). `purchasesService` guards against
 * repeated identical logIn calls, so re-renders are free.
 *
 * Uses `anyApi` (untyped function reference) instead of `convex/_generated`
 * so this always-mounted provider never breaks bundling in
 * expo-api-routes mode, where generated Convex types don't exist.
 */
function RevenueCatIdentitySync() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const profile = useQuery(anyApi.profiles.getCurrentProfile, isAuthenticated ? {} : "skip");

  const userId: string | undefined = profile?.userId;
  const isAnonymous = !profile?.email; // same convention as useConvexAuthState

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Signed out — detach the RevenueCat identity (no-op if never identified)
      purchasesService.logoutUser();
      return;
    }

    if (userId && !isAnonymous) {
      purchasesService.identifyUser(userId);
    }
  }, [isLoading, isAuthenticated, userId, isAnonymous]);

  return null;
}

/**
 * Provides Convex client and auth context when in Convex mode.
 * In Expo API Routes mode, just renders children directly.
 */
export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  // If not in Convex mode or no URL configured, skip the provider
  if (API_MODE !== "convex" || !convex) {
    return <>{children}</>;
  }

  return (
    <ConvexProvider client={convex}>
      <ConvexAuthProvider client={convex}>
        <RevenueCatIdentitySync />
        {children}
      </ConvexAuthProvider>
    </ConvexProvider>
  );
}

/**
 * Export the Convex client for direct usage in services
 * Will be null if not in Convex mode
 */
export { convex };
