/** @format */

import { useState, useEffect, useCallback } from "react";

import { Platform } from "react-native";

import WatchConnectivityService, {
  WatchConnectivityState,
  WatchMessage,
} from "../services/WatchConnectivityService";
import { useAuthStore } from "../store/useAuthStore";

export interface WatchIntegrationState {
  isAvailable: boolean;
  isConnected: boolean;
  isReachable: boolean;
  lastSync: number | null;
  isInitialized: boolean;
  error: string | null;
}

export function useWatchIntegration() {
  const [state, setState] = useState<WatchIntegrationState>({
    isAvailable: false,
    isConnected: false,
    isReachable: false,
    lastSync: null,
    isInitialized: false,
    error: null,
  });

  const { user } = useAuthStore();

  const updateState = useCallback((watchState: WatchConnectivityState) => {
    setState((prev) => ({
      ...prev,
      isAvailable: watchState.isWatchAppInstalled,
      isConnected: watchState.isWatchConnected,
      isReachable: watchState.isReachable,
      lastSync: watchState.lastSync,
    }));
  }, []);

  const handleWatchMessage = useCallback((message: WatchMessage) => {
    console.log("Received watch message:", message);

    switch (message.type) {
      case "sync_request":
        syncUserData();
        break;
      case "timer_request":
        // Handle timer request from watch
        break;
      case "settings_request":
        // Handle settings request from watch
        break;
      default:
        console.log("Unknown watch message type:", message.type);
    }
  }, []);

  const initialize = useCallback(async () => {
    if (Platform.OS !== "ios") {
      setState((prev) => ({
        ...prev,
        isInitialized: true,
        error: "Watch integration only available on iOS",
      }));
      return;
    }

    try {
      await WatchConnectivityService.initialize();

      // Setup message listener
      WatchConnectivityService.addMessageListener("main-app", handleWatchMessage);

      // Get initial state
      const watchState = WatchConnectivityService.getState();
      updateState(watchState);

      setState((prev) => ({ ...prev, isInitialized: true, error: null }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isInitialized: true,
        error: error instanceof Error ? error.message : "Failed to initialize watch connectivity",
      }));
    }
  }, [handleWatchMessage, updateState]);

  const syncUserData = useCallback(async () => {
    if (!state.isReachable || !user) {
      return false;
    }

    try {
      const success = await WatchConnectivityService.sendUserData({
        id: user.id,
        name: user.name,
        isPremium: user.isPremium,
        settings: {
          // Include relevant user settings
        },
      });

      if (success) {
        setState((prev) => ({ ...prev, lastSync: Date.now() }));
      }

      return success;
    } catch (error) {
      console.error("Failed to sync user data with watch:", error);
      return false;
    }
  }, [state.isReachable, user]);

  const sendTimerUpdate = useCallback(
    async (timerData: any) => {
      if (!state.isReachable) {
        return false;
      }

      try {
        return await WatchConnectivityService.sendTimerUpdate(timerData);
      } catch (error) {
        console.error("Failed to send timer update to watch:", error);
        return false;
      }
    },
    [state.isReachable]
  );

  const sendSettingsUpdate = useCallback(
    async (settings: any) => {
      if (!state.isReachable) {
        return false;
      }

      try {
        return await WatchConnectivityService.sendSettingsUpdate(settings);
      } catch (error) {
        console.error("Failed to send settings update to watch:", error);
        return false;
      }
    },
    [state.isReachable]
  );

  const forceSync = useCallback(async () => {
    if (!state.isReachable) {
      return false;
    }

    try {
      const success = await WatchConnectivityService.syncWithWatch();
      if (success) {
        await syncUserData();
      }
      return success;
    } catch (error) {
      console.error("Failed to force sync with watch:", error);
      return false;
    }
  }, [state.isReachable, syncUserData]);

  const transferUserContext = useCallback(async () => {
    if (!state.isReachable || !user) {
      return false;
    }

    try {
      return await WatchConnectivityService.transferUserContext(user);
    } catch (error) {
      console.error("Failed to transfer user context to watch:", error);
      return false;
    }
  }, [state.isReachable, user]);

  // Initialize on mount
  useEffect(() => {
    initialize();

    // Cleanup on unmount
    return () => {
      WatchConnectivityService.removeMessageListener("main-app");
    };
  }, [initialize]);

  // Sync user data when user changes
  useEffect(() => {
    if (state.isInitialized && state.isReachable && user) {
      syncUserData();
    }
  }, [user, state.isInitialized, state.isReachable, syncUserData]);

  return {
    ...state,
    syncUserData,
    sendTimerUpdate,
    sendSettingsUpdate,
    forceSync,
    transferUserContext,
    initialize,
  };
}

export default useWatchIntegration;
