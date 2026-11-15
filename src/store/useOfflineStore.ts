import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Generation } from "@/types/generation.types";

interface PendingGeneration {
  id: string;
  type: "image" | "speech";
  prompt: string;
  provider: string;
  model: string;
  createdAt: string;
}

interface OfflineState {
  // Cached data
  cachedGenerations: Generation[];
  cachedCredits: number | null;
  lastSyncAt: string | null;

  // Pending actions (queue for offline)
  pendingGenerations: PendingGeneration[];

  // Actions
  setCachedGenerations: (generations: Generation[]) => void;
  setCachedCredits: (credits: number) => void;
  addPendingGeneration: (generation: PendingGeneration) => void;
  removePendingGeneration: (id: string) => void;
  clearPendingGenerations: () => void;
  updateLastSync: () => void;
  clearCache: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      cachedGenerations: [],
      cachedCredits: null,
      lastSyncAt: null,
      pendingGenerations: [],

      setCachedGenerations: (generations) => {
        set({ cachedGenerations: generations });
      },

      setCachedCredits: (credits) => {
        set({ cachedCredits: credits });
      },

      addPendingGeneration: (generation) => {
        set((state) => ({
          pendingGenerations: [...state.pendingGenerations, generation],
        }));
      },

      removePendingGeneration: (id) => {
        set((state) => ({
          pendingGenerations: state.pendingGenerations.filter((g) => g.id !== id),
        }));
      },

      clearPendingGenerations: () => {
        set({ pendingGenerations: [] });
      },

      updateLastSync: () => {
        set({ lastSyncAt: new Date().toISOString() });
      },

      clearCache: () => {
        set({
          cachedGenerations: [],
          cachedCredits: null,
          lastSyncAt: null,
          pendingGenerations: [],
        });
      },
    }),
    {
      name: "offline-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
