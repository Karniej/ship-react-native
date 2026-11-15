/** @format */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface GeneralStore {
  isCelsius: boolean;
  language: string;
  theme: "light" | "dark" | "system";

  setIsCelsius: (value: boolean) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useGeneralStore = create<GeneralStore>()(
  persist(
    (set) => ({
      isCelsius: true,
      language: "en",
      theme: "system",

      setIsCelsius: (value: boolean) => set({ isCelsius: value }),
      setLanguage: (language: string) => set({ language }),
      setTheme: (theme: "light" | "dark" | "system") => set({ theme }),
    }),
    {
      name: "general-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
