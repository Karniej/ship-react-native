// constants/api.ts

export type ApiMode = "convex" | "expo-api-routes";

/**
 * API backend mode - set by setup script
 * - "convex": Full backend with auth, rate limiting, credits, real-time (default)
 * - "expo-api-routes": Simple proxy, premium features gated by RevenueCat
 */
export const API_MODE = "convex" as ApiMode;

/**
 * Base URL for Expo API routes
 * Set this to your deployed server URL in production
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

/**
 * Convex deployment URL
 */
export const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || "";

/**
 * Check if we're using Convex backend
 */
export const isConvexMode = () => API_MODE === "convex";

/**
 * Get the full API URL for an endpoint (Expo API Routes mode only)
 * @param endpoint - The endpoint name (e.g., "chat", "vision", "transcribe")
 * @returns The full URL to call
 */
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}/api/${endpoint}`;
}

/**
 * Get auth headers for API calls (Expo API Routes mode only)
 * @returns Headers object to spread into fetch options
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  // In Expo API Routes mode, no auth headers needed (uses RevenueCat for premium)
  return {};
}

/**
 * Helper to make API calls with proper URL and auth (Expo API Routes mode only)
 * For Convex mode, use the Convex client directly via useAction/useMutation hooks
 * @param endpoint - The endpoint name
 * @param options - Fetch options (method, body, etc.)
 * @returns Fetch response
 */
export async function apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
  if (API_MODE === "convex") {
    throw new Error(
      "apiCall should not be used in Convex mode. Use Convex hooks (useAction, useMutation) instead."
    );
  }

  const url = getApiUrl(endpoint);
  const authHeaders = await getAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
  });
}
