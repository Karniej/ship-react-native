/**
 * Settings Store Tests
 */

import { act } from "@testing-library/react-native";

import { useSettingsStore } from "@/store/useSettingsStore";

// Mock storage
jest.mock("@/utils/storage", () => ({
  storage: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  },
}));

// Reset store before each test
beforeEach(() => {
  useSettingsStore.setState({
    theme: "system",
    language: "en",
    notificationsEnabled: true,
  });
});

describe("useSettingsStore", () => {
  describe("Initial State", () => {
    it("has correct default theme", () => {
      const { theme } = useSettingsStore.getState();
      expect(theme).toBe("system");
    });

    it("has correct default language", () => {
      const { language } = useSettingsStore.getState();
      expect(language).toBe("en");
    });

    it("has notifications enabled by default", () => {
      const { notificationsEnabled } = useSettingsStore.getState();
      expect(notificationsEnabled).toBe(true);
    });
  });

  describe("Theme Actions", () => {
    it("sets theme to light", async () => {
      const { setTheme } = useSettingsStore.getState();

      await act(async () => {
        await setTheme("light");
      });

      expect(useSettingsStore.getState().theme).toBe("light");
    });

    it("sets theme to dark", async () => {
      const { setTheme } = useSettingsStore.getState();

      await act(async () => {
        await setTheme("dark");
      });

      expect(useSettingsStore.getState().theme).toBe("dark");
    });

    it("sets theme to system", async () => {
      const { setTheme } = useSettingsStore.getState();

      await act(async () => {
        await setTheme("dark");
        await setTheme("system");
      });

      expect(useSettingsStore.getState().theme).toBe("system");
    });
  });

  describe("Language Actions", () => {
    it("changes language", async () => {
      const { setLanguage } = useSettingsStore.getState();

      await act(async () => {
        await setLanguage("es");
      });

      expect(useSettingsStore.getState().language).toBe("es");
    });

    it("supports multiple languages", async () => {
      const { setLanguage } = useSettingsStore.getState();
      const languages = ["en", "es", "fr", "de"];

      for (const lang of languages) {
        await act(async () => {
          await setLanguage(lang);
        });
        expect(useSettingsStore.getState().language).toBe(lang);
      }
    });
  });

  describe("Notification Actions", () => {
    it("disables notifications", async () => {
      const { setNotificationsEnabled } = useSettingsStore.getState();

      await act(async () => {
        await setNotificationsEnabled(false);
      });

      expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
    });

    it("enables notifications", async () => {
      useSettingsStore.setState({ notificationsEnabled: false });
      const { setNotificationsEnabled } = useSettingsStore.getState();

      await act(async () => {
        await setNotificationsEnabled(true);
      });

      expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
    });
  });
});
