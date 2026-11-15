/** @format */

import { Platform } from "react-native";

export interface WatchMessage {
  type: string;
  data?: any;
  timestamp: number;
}

export interface WatchConnectivityState {
  isWatchAppInstalled: boolean;
  isWatchConnected: boolean;
  isReachable: boolean;
  lastSync: number | null;
}

export class WatchConnectivityService {
  private static instance: WatchConnectivityService;
  private listeners: Map<string, (message: WatchMessage) => void> = new Map();
  private state: WatchConnectivityState = {
    isWatchAppInstalled: false,
    isWatchConnected: false,
    isReachable: false,
    lastSync: null,
  };

  public static getInstance(): WatchConnectivityService {
    if (!WatchConnectivityService.instance) {
      WatchConnectivityService.instance = new WatchConnectivityService();
    }
    return WatchConnectivityService.instance;
  }

  async initialize(): Promise<void> {
    if (Platform.OS !== "ios") {
      console.log("Watch connectivity only available on iOS");
      return;
    }

    try {
      // Initialize watch connectivity
      await this.checkWatchAvailability();
      this.setupMessageHandlers();
    } catch (error) {
      console.error("Failed to initialize watch connectivity:", error);
    }
  }

  private async checkWatchAvailability(): Promise<void> {
    try {
      // Mock implementation - in real app, would use WatchConnectivity framework
      this.state.isWatchAppInstalled = true;
      this.state.isWatchConnected = true;
      this.state.isReachable = true;
    } catch (error) {
      console.error("Watch availability check failed:", error);
    }
  }

  private setupMessageHandlers(): void {
    // Setup message handlers for watch communication
    console.log("Setting up watch message handlers");
  }

  async sendMessage(message: WatchMessage): Promise<boolean> {
    if (!this.state.isReachable) {
      console.log("Watch not reachable, cannot send message");
      return false;
    }

    try {
      console.log("Sending message to watch:", message);
      // Mock implementation - in real app, would send via WatchConnectivity
      return true;
    } catch (error) {
      console.error("Failed to send message to watch:", error);
      return false;
    }
  }

  async sendUserData(userData: any): Promise<boolean> {
    const message: WatchMessage = {
      type: "user_data",
      data: userData,
      timestamp: Date.now(),
    };

    return this.sendMessage(message);
  }

  async sendTimerUpdate(timerData: any): Promise<boolean> {
    const message: WatchMessage = {
      type: "timer_update",
      data: timerData,
      timestamp: Date.now(),
    };

    return this.sendMessage(message);
  }

  async sendSettingsUpdate(settings: any): Promise<boolean> {
    const message: WatchMessage = {
      type: "settings_update",
      data: settings,
      timestamp: Date.now(),
    };

    return this.sendMessage(message);
  }

  addMessageListener(id: string, callback: (message: WatchMessage) => void): void {
    this.listeners.set(id, callback);
  }

  removeMessageListener(id: string): void {
    this.listeners.delete(id);
  }

  private handleIncomingMessage(message: WatchMessage): void {
    this.listeners.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error("Error in watch message listener:", error);
      }
    });
  }

  getState(): WatchConnectivityState {
    return { ...this.state };
  }

  async syncWithWatch(): Promise<boolean> {
    if (!this.state.isReachable) {
      return false;
    }

    try {
      const syncMessage: WatchMessage = {
        type: "sync_request",
        timestamp: Date.now(),
      };

      const success = await this.sendMessage(syncMessage);
      if (success) {
        this.state.lastSync = Date.now();
      }

      return success;
    } catch (error) {
      console.error("Watch sync failed:", error);
      return false;
    }
  }

  async transferUserContext(userData: any): Promise<boolean> {
    const message: WatchMessage = {
      type: "user_context",
      data: {
        user: userData,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    return this.sendMessage(message);
  }

  isWatchAvailable(): boolean {
    return this.state.isWatchAppInstalled && this.state.isWatchConnected;
  }
}

export default WatchConnectivityService.getInstance();
