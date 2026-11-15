import { useCallback } from "react";

import {
  useQuery as useReactQuery,
  useMutation as useReactMutation,
  useQueryClient,
  UseQueryOptions,
  QueryKey,
} from "@tanstack/react-query";

import { API_MODE, API_BASE_URL } from "../constants/api";
import { fileCache } from "../services/fileCache";
import { queryKeys } from "../services/queryClient";

// Generation type (simplified from Convex schema)
interface Generation {
  id: string;
  userId: string;
  provider: string;
  model: string;
  prompt?: string;
  outputUrl?: string;
  outputData?: unknown;
  creditsUsed: number;
  contentType: string;
  createdAt?: number;
}

// Re-export query keys for convenience
export { queryKeys };

/**
 * Wrapper around useQuery with file caching support
 */
export function useQueryWithCache<TData, TError = Error>(
  queryKey: QueryKey,
  fetcher: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn"> & {
    /** Cache result to file system */
    persistToFile?: boolean;
    /** TTL for file cache in ms */
    fileCacheTTL?: number;
  }
) {
  const { persistToFile, fileCacheTTL, ...queryOptions } = options || {};

  return useReactQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      const cacheKey = JSON.stringify(queryKey);

      // Check file cache first if enabled
      if (persistToFile) {
        const cached = await fileCache.getCachedJSON<TData>(cacheKey);
        if (cached) return cached;
      }

      // Fetch fresh data
      const data = await fetcher();

      // Persist to file cache if enabled
      if (persistToFile && data) {
        await fileCache.cacheJSON(cacheKey, data, fileCacheTTL);
      }

      return data;
    },
    ...queryOptions,
  });
}

// ============================================
// User Queries
// ============================================

/**
 * Fetch user profile
 * In Convex mode, use useQuery(api.profiles.getCurrentProfile) instead
 */
export function useUserProfile() {
  return useQueryWithCache(
    queryKeys.user.profile(),
    async () => {
      if (API_MODE === "convex") {
        // In Convex mode, use useQuery from convex/react
        console.warn("Use useQuery(api.profiles.getCurrentProfile) in Convex mode");
        return null;
      }

      // Expo API Routes mode - profile from local storage or API
      return null;
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      persistToFile: true,
      fileCacheTTL: 1000 * 60 * 60, // 1 hour file cache
      enabled: API_MODE !== "convex", // Disable in Convex mode
    }
  );
}

/**
 * Fetch user credit balance
 * In Convex mode, use useQuery(api.credits.getCurrentCredits) instead
 */
export function useCreditsBalance() {
  return useQueryWithCache(
    queryKeys.user.tokens(),
    async () => {
      if (API_MODE === "convex") {
        // In Convex mode, use useQuery from convex/react
        console.warn("Use useQuery(api.credits.getCurrentCredits) in Convex mode");
        return { credits_remaining: 0, credits_used_total: 0 };
      }

      // Expo API Routes mode - credits managed via RevenueCat
      return { credits_remaining: __DEV__ ? 50 : 0, credits_used_total: 0 };
    },
    {
      staleTime: 1000 * 30, // 30 seconds - credits change frequently
      refetchInterval: 1000 * 60, // Refetch every minute
      enabled: API_MODE !== "convex", // Disable in Convex mode
    }
  );
}

// ============================================
// Generation Queries
// ============================================

/**
 * Fetch user's generations with file caching
 * In Convex mode, use useQuery(api.generations.listUserGenerations) instead
 */
export function useGenerations(filters?: { provider?: string; limit?: number }) {
  return useQueryWithCache<Generation[]>(
    queryKeys.generations.list(filters),
    async () => {
      if (API_MODE === "convex") {
        // In Convex mode, use useQuery from convex/react
        console.warn("Use useQuery(api.generations.listUserGenerations) in Convex mode");
        return [];
      }

      // Expo API Routes mode - generations are not persisted
      return [];
    },
    {
      staleTime: 1000 * 60, // 1 minute
      persistToFile: true,
      fileCacheTTL: 1000 * 60 * 30, // 30 minutes file cache
      enabled: API_MODE !== "convex", // Disable in Convex mode
    }
  );
}

/**
 * Fetch single generation detail
 * In Convex mode, use useQuery(api.generations.getGeneration) instead
 */
export function useGenerationDetail(id: string) {
  return useQueryWithCache<Generation | null>(
    queryKeys.generations.detail(id),
    async () => {
      if (API_MODE === "convex") {
        // In Convex mode, use useQuery from convex/react
        console.warn("Use useQuery(api.generations.getGeneration) in Convex mode");
        return null;
      }

      // Expo API Routes mode - generations are not persisted
      return null;
    },
    {
      enabled: !!id && API_MODE !== "convex",
      persistToFile: true,
      fileCacheTTL: 1000 * 60 * 60 * 24, // 24 hour file cache for completed generations
    }
  );
}

// ============================================
// Media Caching Hook
// ============================================

/**
 * Hook to download and cache media files locally
 */
export function useMediaCache() {
  const download = useCallback(async (url: string) => {
    return fileCache.cacheFile(url, {
      ttl: null, // Never expires - user explicitly downloaded
    });
  }, []);

  const getCached = useCallback(async (url: string) => {
    return fileCache.getCachedFile(url);
  }, []);

  const clearCache = useCallback(async () => {
    return fileCache.clearAll();
  }, []);

  const getCacheSize = useCallback(async () => {
    return fileCache.getCacheSize();
  }, []);

  return {
    download,
    getCached,
    clearCache,
    getCacheSize,
  };
}

// ============================================
// Mutations
// ============================================

interface CreateGenerationInput {
  type: string;
  prompt: string;
  options?: Record<string, unknown>;
}

/**
 * Create a new generation with optimistic updates
 * In Convex mode, use useMutation(api.generations.createGeneration) instead
 */
export function useCreateGeneration() {
  const queryClient = useQueryClient();

  return useReactMutation({
    mutationFn: async (input: CreateGenerationInput) => {
      if (API_MODE === "convex") {
        // In Convex mode, use useMutation from convex/react
        throw new Error("Use Convex mutation in Convex mode");
      }

      // Expo API Routes mode
      const response = await fetch(`${API_BASE_URL}/api/generations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      // Invalidate generations list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.generations.all });
      // Also invalidate token balance as it likely changed
      queryClient.invalidateQueries({ queryKey: queryKeys.user.tokens() });
    },
  });
}

/**
 * Delete a generation
 * In Convex mode, use useMutation(api.generations.deleteGeneration) instead
 */
export function useDeleteGeneration() {
  const queryClient = useQueryClient();

  return useReactMutation({
    mutationFn: async (id: string) => {
      if (API_MODE === "convex") {
        // In Convex mode, use useMutation from convex/react
        throw new Error("Use Convex mutation in Convex mode");
      }

      // Expo API Routes mode
      const response = await fetch(`${API_BASE_URL}/api/generations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.generations.detail(id) });
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: queryKeys.generations.all });
    },
  });
}

// ============================================
// Prefetching
// ============================================

/**
 * Prefetch generations for faster navigation
 * In Convex mode, use preloadQuery instead
 */
export function usePrefetchGenerations() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    if (API_MODE === "convex") {
      // In Convex mode, use preloadQuery from convex/react
      console.warn("Use preloadQuery in Convex mode");
      return;
    }

    queryClient.prefetchQuery({
      queryKey: queryKeys.generations.list(),
      queryFn: async () => {
        // Expo API Routes mode - generations are not persisted
        return [];
      },
    });
  }, [queryClient]);
}
