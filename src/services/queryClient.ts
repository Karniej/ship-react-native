import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";

// Configure QueryClient with sensible defaults for mobile
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 1000 * 60 * 5,
      // Keep unused data in cache for 30 minutes
      gcTime: 1000 * 60 * 30,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus for mobile
      refetchOnWindowFocus: false,
      // Refetch on reconnect to get fresh data
      refetchOnReconnect: true,
      // Use cached data while fetching
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// AsyncStorage persister for offline cache
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "REACT_QUERY_OFFLINE_CACHE",
  // Throttle persistence writes to avoid performance issues
  throttleTime: 1000,
});

// Query keys factory for consistent key management
export const queryKeys = {
  // User related queries
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    settings: () => [...queryKeys.user.all, "settings"] as const,
    tokens: () => [...queryKeys.user.all, "tokens"] as const,
  },
  // AI generations
  generations: {
    all: ["generations"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.generations.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.generations.all, "detail", id] as const,
  },
  // Subscriptions
  subscription: {
    all: ["subscription"] as const,
    status: () => [...queryKeys.subscription.all, "status"] as const,
    offerings: () => [...queryKeys.subscription.all, "offerings"] as const,
  },
  // Analytics
  analytics: {
    all: ["analytics"] as const,
    usage: (period?: string) => [...queryKeys.analytics.all, "usage", period] as const,
  },
};
