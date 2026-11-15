import { useEffect, useState, useCallback } from "react";

import * as Notifications from "expo-notifications";

import { notificationsService, NotificationData } from "@/services/notifications.service";
import { useAuthStore } from "@/store/useAuthStore";

interface UseNotificationsReturn {
  /** Whether push notifications are enabled on this device */
  isEnabled: boolean;
  /** The current Expo push token (if registered) */
  pushToken: string | null;
  /** Whether we're currently checking/requesting permissions */
  isLoading: boolean;
  /** Request notification permissions */
  requestPermissions: () => Promise<boolean>;
  /** Schedule a local notification */
  scheduleNotification: (notification: NotificationData, delay?: number) => Promise<string>;
  /** Cancel a scheduled notification */
  cancelNotification: (id: string) => Promise<void>;
  /** Cancel all scheduled notifications */
  cancelAllNotifications: () => Promise<void>;
  /** Set app badge count (iOS) */
  setBadgeCount: (count: number) => Promise<void>;
}

/**
 * Hook for managing push notifications
 *
 * @example
 * ```tsx
 * function NotificationSettings() {
 *   const { isEnabled, requestPermissions } = useNotifications();
 *
 *   return (
 *     <Switch
 *       value={isEnabled}
 *       onValueChange={async (enabled) => {
 *         if (enabled) {
 *           await requestPermissions();
 *         }
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function useNotifications(): UseNotificationsReturn {
  const [isEnabled, setIsEnabled] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  // Check initial permission status and initialize
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        // Check if notifications are enabled
        const enabled = await notificationsService.areNotificationsEnabled();
        setIsEnabled(enabled);

        if (enabled) {
          // Initialize and get push token
          await notificationsService.initialize();
          const token = notificationsService.getPushToken();
          setPushToken(token);

          // Save token to server if user is authenticated
          if (user?.id && token) {
            await notificationsService.savePushTokenToServer(user.id);
          }
        }
      } catch (error) {
        console.error("[useNotifications] Init error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      notificationsService.cleanup();
    };
  }, [user?.id]);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const granted = await notificationsService.requestPermissions();
      setIsEnabled(granted);

      if (granted) {
        await notificationsService.initialize();
        const token = notificationsService.getPushToken();
        setPushToken(token);

        // Save token if user is authenticated
        if (user?.id && token) {
          await notificationsService.savePushTokenToServer(user.id);
        }
      }

      return granted;
    } catch (error) {
      console.error("[useNotifications] Permission request error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Schedule a local notification
  const scheduleNotification = useCallback(
    async (notification: NotificationData, delaySeconds?: number): Promise<string> => {
      const trigger = delaySeconds
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL as const,
            seconds: delaySeconds,
          }
        : null;

      return notificationsService.scheduleLocalNotification(notification, trigger);
    },
    []
  );

  // Cancel a notification
  const cancelNotification = useCallback(async (id: string): Promise<void> => {
    await notificationsService.cancelNotification(id);
  }, []);

  // Cancel all notifications
  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    await notificationsService.cancelAllNotifications();
  }, []);

  // Set badge count
  const setBadgeCount = useCallback(async (count: number): Promise<void> => {
    await notificationsService.setBadgeCount(count);
  }, []);

  return {
    isEnabled,
    pushToken,
    isLoading,
    requestPermissions,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    setBadgeCount,
  };
}

/**
 * Hook to handle notification responses (when user taps on notification)
 */
export function useNotificationResponse(
  handler: (response: Notifications.NotificationResponse) => void
) {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(handler);
    return () => subscription.remove();
  }, [handler]);
}

/**
 * Hook to handle notifications received while app is in foreground
 */
export function useNotificationReceived(
  handler: (notification: Notifications.Notification) => void
) {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(handler);
    return () => subscription.remove();
  }, [handler]);
}
