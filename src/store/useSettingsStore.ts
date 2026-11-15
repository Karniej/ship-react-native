import { create } from "zustand";

import { storage } from "../utils/storage";

interface SettingsState {
  theme: "light" | "dark" | "system";
  language: string;
  notificationsEnabled: boolean;
  setTheme: (theme: "light" | "dark" | "system") => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  initSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "system",
  language: "en",
  notificationsEnabled: true,

  setTheme: async (theme) => {
    await storage.set("theme", theme);
    set({ theme });
  },

  setLanguage: async (language) => {
    await storage.set("language", language);
    set({ language });
  },

  setNotificationsEnabled: async (enabled) => {
    await storage.set("notificationsEnabled", enabled);
    set({ notificationsEnabled: enabled });
  },

  initSettings: async () => {
    const [theme, language, notificationsEnabled] = await Promise.all([
      storage.get<"light" | "dark" | "system">("theme"),
      storage.get<string>("language"),
      storage.get<boolean>("notificationsEnabled"),
    ]);

    set({
      theme: theme || "system",
      language: language || "en",
      notificationsEnabled: notificationsEnabled ?? true,
    });
  },
}));
