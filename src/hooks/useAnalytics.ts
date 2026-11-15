import { useCallback } from "react";

import { usePostHog } from "posthog-react-native";

export const useAnalytics = () => {
  const postHog = usePostHog();

  const trackEvent = useCallback(
    (eventName: string, eventParams?: Record<string, string | number | boolean | null>) => {
      try {
        postHog?.capture(eventName, eventParams);
      } catch {
        // Silently fail analytics - don't break the app for tracking issues
      }
    },
    [postHog]
  );

  return { trackEvent };
};
