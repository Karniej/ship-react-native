/**
 * ============================================================================
 * SOCIAL AUTH SERVICE
 * ============================================================================
 *
 * Handles OAuth authentication with Google and Apple.
 * In Convex mode, use the Convex Auth hooks instead.
 * This service is for Expo API Routes mode or fallback.
 */

import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";

import { API_MODE } from "@/constants/api";

// Required for web browser auth session
WebBrowser.maybeCompleteAuthSession();

// Get the redirect URI for OAuth
const getRedirectUri = (): string => {
  // For Expo Go
  if (Constants.appOwnership === "expo") {
    const uri = AuthSession.makeRedirectUri({
      scheme: "exp",
      path: "auth/callback",
    });
    return Array.isArray(uri) ? uri[0] : uri;
  }

  // For standalone/dev builds
  const scheme = Constants.expoConfig?.scheme || "myapp";
  const uri = AuthSession.makeRedirectUri({
    scheme: Array.isArray(scheme) ? scheme[0] : scheme,
    path: "auth/callback",
  });
  return Array.isArray(uri) ? uri[0] : uri;
};

export interface AuthResult {
  success: boolean;
  error?: string;
}

class AuthService {
  private redirectUri: string;

  constructor() {
    this.redirectUri = getRedirectUri();
  }

  /**
   * Get the OAuth redirect URI (useful for debugging)
   */
  getRedirectUri(): string {
    return this.redirectUri;
  }

  /**
   * Sign in with Google
   * In Convex mode, use the Convex Auth hooks instead
   */
  async signInWithGoogle(): Promise<AuthResult> {
    if (API_MODE === "convex") {
      console.warn("Use Convex Auth for Google sign-in in Convex mode");
      return { success: false, error: "Use Convex Auth hooks in Convex mode" };
    }

    // In Expo API Routes mode, OAuth is not supported without a backend
    return { success: false, error: "OAuth requires Convex backend" };
  }

  /**
   * Sign in with Apple
   * In Convex mode, use the Convex Auth hooks instead
   */
  async signInWithApple(): Promise<AuthResult> {
    if (API_MODE === "convex") {
      console.warn("Use Convex Auth for Apple sign-in in Convex mode");
      return { success: false, error: "Use Convex Auth hooks in Convex mode" };
    }

    // In Expo API Routes mode, OAuth is not supported without a backend
    return { success: false, error: "OAuth requires Convex backend" };
  }

  /**
   * Check if Google Sign In is available
   */
  isGoogleAvailable(): boolean {
    return API_MODE === "convex";
  }

  /**
   * Check if Apple Sign In is available
   */
  isAppleAvailable(): boolean {
    return API_MODE === "convex";
  }
}

export const authService = new AuthService();
