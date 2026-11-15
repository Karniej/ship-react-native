declare module "@env" {
  export const EXPO_PUBLIC_API_URL: string;
  export const EXPO_PUBLIC_CONVEX_URL: string;
  export const EXPO_PUBLIC_POSTHOG_API_KEY: string;
  export const EXPO_PUBLIC_POSTHOG_HOST: string;
  export const EXPO_PUBLIC_SENTRY_DSN: string;
  export const EXPO_PUBLIC_ENABLE_ANALYTICS: string;
  export const EXPO_PUBLIC_ENABLE_ERROR_REPORTING: string;
  export const EXPO_PUBLIC_REVENUECAT_IOS_KEY: string;
  export const EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: string;
  export const EXPO_PUBLIC_DEV_MODE: string;
}

// Extend process.env with your environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_CONVEX_URL: string;
      EXPO_PUBLIC_POSTHOG_API_KEY: string;
      EXPO_PUBLIC_POSTHOG_HOST: string;
      EXPO_PUBLIC_SENTRY_DSN: string;
      EXPO_PUBLIC_ENABLE_ANALYTICS: string;
      EXPO_PUBLIC_ENABLE_ERROR_REPORTING: string;
      EXPO_PUBLIC_REVENUECAT_IOS_KEY: string;
      EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: string;
      EXPO_PUBLIC_DEV_MODE: string;
    }
  }
}
