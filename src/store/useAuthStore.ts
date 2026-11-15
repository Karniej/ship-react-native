import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { API_MODE } from "@/constants/api";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPremium: boolean;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions (these are no-ops in Convex mode - use useConvexAuth hooks instead)
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithApple: () => Promise<{ error: Error | null }>;
  signInAnonymously: () => Promise<{ error: Error | null }>;
  linkEmailAccount: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

/**
 * Auth store for managing authentication state
 *
 * In Convex mode:
 * - Use the useConvexAuth hooks from src/hooks/useConvexAuth.ts for auth actions
 * - This store provides backward compatibility for existing code
 * - Auth state is managed by Convex Auth provider
 *
 * In Expo API Routes mode:
 * - Auth is minimal (anonymous only)
 * - Premium features are gated by RevenueCat
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      signInWithEmail: async (email: string, password: string) => {
        if (API_MODE === "convex") {
          // In Convex mode, use useConvexAuthActions hook instead
          console.warn("Use useConvexAuthActions().signInWithEmail in Convex mode");
          return { error: new Error("Use Convex auth hooks in Convex mode") };
        }
        // Expo API Routes mode - no auth needed
        return { error: null };
      },

      signUpWithEmail: async (email: string, password: string, name: string) => {
        if (API_MODE === "convex") {
          console.warn("Use useConvexAuthActions().signUpWithEmail in Convex mode");
          return { error: new Error("Use Convex auth hooks in Convex mode") };
        }
        return { error: null };
      },

      signInWithMagicLink: async (email: string) => {
        if (API_MODE === "convex") {
          console.warn("Use useConvexAuthActions().signInWithMagicLink in Convex mode");
          return { error: new Error("Use Convex auth hooks in Convex mode") };
        }
        return { error: null };
      },

      signInWithGoogle: async () => {
        if (API_MODE === "convex") {
          console.warn("Use Convex Google OAuth in Convex mode");
          return { error: new Error("Use Convex auth hooks in Convex mode") };
        }
        return { error: null };
      },

      signInWithApple: async () => {
        if (API_MODE === "convex") {
          console.warn("Use Convex Apple OAuth in Convex mode");
          return { error: new Error("Use Convex auth hooks in Convex mode") };
        }
        return { error: null };
      },

      signInAnonymously: async () => {
        if (API_MODE === "convex") {
          console.warn("Use useConvexAuthActions().signInAnonymously in Convex mode");
          return { error: new Error("Use Convex auth hooks in Convex mode") };
        }

        // In Expo API Routes mode, create a local anonymous user
        const anonymousUser: User = {
          id: `anon_${Date.now()}`,
          email: "",
          name: "Guest User",
          isPremium: false,
          isAnonymous: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          user: anonymousUser,
          isAuthenticated: true,
          isLoading: false,
        });

        return { error: null };
      },

      linkEmailAccount: async (email: string, password: string) => {
        if (API_MODE === "convex") {
          console.warn("Use Convex account linking in Convex mode");
          return { error: new Error("Use Convex auth hooks in Convex mode") };
        }
        return { error: null };
      },

      signOut: async () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              ...userData,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      },

      initializeAuth: async () => {
        set({ isLoading: true });

        if (API_MODE === "convex") {
          // In Convex mode, auth is handled by ConvexAuthProvider
          // Just mark as not loading - the auth state comes from Convex
          set({ isLoading: false });
          return;
        }

        // In Expo API Routes mode, check for persisted user
        const { user } = get();
        if (user) {
          set({
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
