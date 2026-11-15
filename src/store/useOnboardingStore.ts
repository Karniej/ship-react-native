import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserOnboardingData {
  name?: string;
  preferences?: any;
  [key: string]: any;
}

interface OnboardingStore {
  isOnboardingCompleted: boolean;
  hasSeenPremiumScreen: boolean;
  hasSeenAuthScreen: boolean;
  currentSlideIndex: number;
  userData: UserOnboardingData;

  setCurrentSlide: (index: number) => void;
  updateUserData: (key: string, value: any) => void;
  completeOnboarding: () => void;
  markPremiumScreenSeen: () => void;
  markAuthScreenSeen: () => void;
  resetOnboarding: () => void;
  nextSlide: () => void;
  previousSlide: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      isOnboardingCompleted: false,
      hasSeenPremiumScreen: false,
      hasSeenAuthScreen: false,
      currentSlideIndex: 0,
      userData: {},

      setCurrentSlide: (index: number) => set({ currentSlideIndex: index }),

      updateUserData: (key: string, value: any) => {
        set((state) => ({
          userData: { ...state.userData, [key]: value },
        }));
      },

      completeOnboarding: () => {
        set({ isOnboardingCompleted: true });
      },

      markPremiumScreenSeen: () => {
        set({ hasSeenPremiumScreen: true });
      },

      markAuthScreenSeen: () => {
        set({ hasSeenAuthScreen: true });
      },

      resetOnboarding: () => {
        set({
          isOnboardingCompleted: false,
          hasSeenPremiumScreen: false,
          hasSeenAuthScreen: false,
          currentSlideIndex: 0,
          userData: {},
        });
      },

      nextSlide: () => {
        set((state) => ({
          currentSlideIndex: Math.min(state.currentSlideIndex + 1, 4), // Assuming 5 slides max
        }));
      },

      previousSlide: () => {
        set((state) => ({
          currentSlideIndex: Math.max(state.currentSlideIndex - 1, 0),
        }));
      },
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
