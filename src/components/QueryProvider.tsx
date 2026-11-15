import { ReactNode } from "react";

import { Platform } from "react-native";

import { QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { queryClient, asyncStoragePersister } from "../services/queryClient";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider with offline persistence support
 *
 * On native platforms, uses PersistQueryClientProvider to cache queries to AsyncStorage.
 * On web (during SSR), uses regular QueryClientProvider without persistence.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Use persistence on native, skip during SSR
  const isSSR = Platform.OS === "web" && typeof window === "undefined";

  if (isSSR) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        // Max age for persisted cache (24 hours)
        maxAge: 1000 * 60 * 60 * 24,
        // Dehydrate queries that are successful
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist successful queries
            return query.state.status === "success";
          },
        },
      }}
      // Show stale data while rehydrating
      onSuccess={() => {
        // Resume mutations that were paused during offline
        queryClient.resumePausedMutations();
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
