import { Platform } from "react-native";

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { API_MODE, API_BASE_URL } from "@/constants/api";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface PushToken {
  token: string;
  platform: "ios" | "android";
  deviceId: string;
}

class NotificationsService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  /**
   * Initialize notifications - call this early in app lifecycle
   */
  async initialize(): Promise<void> {
    if (!Device.isDevice) {
      console.warn("[Notifications] Push notifications only work on physical devices");
      return;
    }

    // Request permissions
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn("[Notifications] Permission not granted");
      return;
    }

    // Get push token
    await this.registerForPushNotifications();

    // Set up listeners
    this.setupListeners();
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return false;
    }

    // iOS specific: request provisional authorization for quiet notifications
    if (Platform.OS === "ios") {
      await Notifications.setNotificationCategoryAsync("default", []);
    }

    return true;
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  }

  /**
   * Register for push notifications and get token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Get project ID from app config
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

      if (!projectId) {
        console.warn("[Notifications] No project ID found - push notifications disabled");
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.expoPushToken = tokenData.data;

      // Configure Android channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#007AFF",
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error("[Notifications] Failed to get push token:", error);
      return null;
    }
  }

  /**
   * Get the current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Save push token to server for the current user
   * In Convex mode, use the Convex mutation (useRegisterPushToken hook)
   * In Expo API Routes mode, use the API endpoint
   */
  async savePushTokenToServer(userId: string): Promise<void> {
    if (!this.expoPushToken) {
      console.warn("[Notifications] No push token to save");
      return;
    }

    try {
      const deviceId = Constants.deviceId ?? Device.modelId ?? "unknown";

      if (API_MODE === "convex") {
        // In Convex mode, use the Convex hooks (useRegisterPushToken)
        console.warn("[Notifications] Use useRegisterPushToken hook in Convex mode");
        return;
      }

      // Expo API Routes mode
      const response = await fetch(`${API_BASE_URL}/api/push-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          token: this.expoPushToken,
          platform: Platform.OS,
          deviceId,
        }),
      });

      if (!response.ok) {
        console.error("[Notifications] Failed to save push token");
      } else {
        console.log("[Notifications] Push token saved successfully");
      }
    } catch (error) {
      console.error("[Notifications] Error saving push token:", error);
    }
  }

  /**
   * Remove push token from server (call on logout)
   * In Convex mode, use the Convex mutation
   * In Expo API Routes mode, use the API endpoint
   */
  async removePushTokenFromServer(userId: string): Promise<void> {
    try {
      const deviceId = Constants.deviceId ?? Device.modelId ?? "unknown";

      if (API_MODE === "convex") {
        // In Convex mode, use the Convex hooks
        console.warn("[Notifications] Use Convex mutation in Convex mode");
        return;
      }

      // Expo API Routes mode
      const response = await fetch(`${API_BASE_URL}/api/push-tokens`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, deviceId }),
      });

      if (response.ok) {
        console.log("[Notifications] Push token removed from server");
      }
    } catch (error) {
      console.error("[Notifications] Error removing push token:", error);
    }
  }

  /**
   * Set up notification listeners
   */
  private setupListeners(): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("[Notifications] Received:", notification);
      // Handle foreground notification - you can emit an event or update state
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("[Notifications] Response:", response);
      const data = response.notification.request.content.data;
      // Handle notification tap - navigate to specific screen, etc.
      if (data) {
        this.handleNotificationTap(data);
      }
    });
  }

  /**
   * Handle notification tap - override in your app
   */
  private handleNotificationTap(data: Record<string, unknown>): void {
    // Default implementation - log the data
    console.log("[Notifications] Tap data:", data);

    // You can emit an event here or use a navigation ref
    // Example navigation patterns:
    // - data.screen: 'generations' -> navigate to generations
    // - data.generationId: '123' -> navigate to specific generation
    // - data.url: 'myapp://...' -> handle deep link
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    notification: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data ?? {},
        sound: true,
      },
      trigger: trigger ?? null, // null = immediate
    });

    return id;
  }

  /**
   * Schedule a notification for a specific time
   */
  async scheduleNotificationAt(notification: NotificationData, date: Date): Promise<string> {
    return this.scheduleLocalNotification(notification, {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    });
  }

  /**
   * Schedule a daily notification
   */
  async scheduleDailyNotification(
    notification: NotificationData,
    hour: number,
    minute: number
  ): Promise<string> {
    return this.scheduleLocalNotification(notification, {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    });
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Set badge count (iOS)
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Get badge count (iOS)
   */
  async getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

export const notificationsService = new NotificationsService();
