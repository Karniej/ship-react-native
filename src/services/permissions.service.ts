import { Platform, Linking, Alert } from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as Notifications from "expo-notifications";

export type PermissionType = "camera" | "microphone" | "mediaLibrary" | "notifications";

export type PermissionStatus = "granted" | "denied" | "undetermined" | "limited";

export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

type MediaLibraryPermissionResponse = Awaited<
  ReturnType<typeof MediaLibrary.getPermissionsAsync>
> & {
  accessPrivileges?: "all" | "limited" | "none";
};

class PermissionsService {
  /**
   * Check permission status without requesting
   */
  async checkPermission(type: PermissionType): Promise<PermissionResult> {
    switch (type) {
      case "camera":
        return this.checkCameraPermission();
      case "microphone":
        return this.checkMicrophonePermission();
      case "mediaLibrary":
        return this.checkMediaLibraryPermission();
      case "notifications":
        return this.checkNotificationsPermission();
      default:
        return { status: "undetermined", canAskAgain: true };
    }
  }

  /**
   * Request permission
   */
  async requestPermission(type: PermissionType): Promise<PermissionResult> {
    switch (type) {
      case "camera":
        return this.requestCameraPermission();
      case "microphone":
        return this.requestMicrophonePermission();
      case "mediaLibrary":
        return this.requestMediaLibraryPermission();
      case "notifications":
        return this.requestNotificationsPermission();
      default:
        return { status: "undetermined", canAskAgain: true };
    }
  }

  /**
   * Request permission with explanation alert if denied
   */
  async requestWithExplanation(
    type: PermissionType,
    explanation: {
      title: string;
      message: string;
      settingsButtonText?: string;
      cancelButtonText?: string;
    }
  ): Promise<PermissionResult> {
    // First check current status
    const currentStatus = await this.checkPermission(type);

    if (currentStatus.status === "granted") {
      return currentStatus;
    }

    // If we can ask again, request permission
    if (currentStatus.canAskAgain) {
      return this.requestPermission(type);
    }

    // Permission denied and can't ask again - show settings alert
    return new Promise((resolve) => {
      Alert.alert(explanation.title, explanation.message, [
        {
          text: explanation.cancelButtonText ?? "Cancel",
          style: "cancel",
          onPress: () => resolve(currentStatus),
        },
        {
          text: explanation.settingsButtonText ?? "Open Settings",
          onPress: async () => {
            await this.openSettings();
            // After returning from settings, check permission again
            const newStatus = await this.checkPermission(type);
            resolve(newStatus);
          },
        },
      ]);
    });
  }

  /**
   * Open device settings
   */
  async openSettings(): Promise<void> {
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:");
    } else {
      await Linking.openSettings();
    }
  }

  /**
   * Check multiple permissions at once
   */
  async checkMultiple(types: PermissionType[]): Promise<Record<PermissionType, PermissionResult>> {
    const results = await Promise.all(types.map((type) => this.checkPermission(type)));

    return types.reduce(
      (acc, type, index) => {
        acc[type] = results[index];
        return acc;
      },
      {} as Record<PermissionType, PermissionResult>
    );
  }

  /**
   * Request multiple permissions at once
   */
  async requestMultiple(
    types: PermissionType[]
  ): Promise<Record<PermissionType, PermissionResult>> {
    const results = await Promise.all(types.map((type) => this.requestPermission(type)));

    return types.reduce(
      (acc, type, index) => {
        acc[type] = results[index];
        return acc;
      },
      {} as Record<PermissionType, PermissionResult>
    );
  }

  // Private implementation methods

  private async checkCameraPermission(): Promise<PermissionResult> {
    const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
    return {
      status: this.mapPermissionStatus(status),
      canAskAgain: canAskAgain ?? true,
    };
  }

  private async requestCameraPermission(): Promise<PermissionResult> {
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    return {
      status: this.mapPermissionStatus(status),
      canAskAgain: canAskAgain ?? true,
    };
  }

  /**
   * Microphone permissions are handled through camera on iOS (bundled)
   * On Android, microphone access is typically requested with camera
   * For audio-only features, you may need to use expo-av or expo-audio
   */
  private async checkMicrophonePermission(): Promise<PermissionResult> {
    // Use camera permissions as a proxy since iOS bundles camera + microphone
    // For dedicated audio recording, consider using expo-audio's useAudioRecorder hook
    const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
    return {
      status: this.mapPermissionStatus(status),
      canAskAgain: canAskAgain ?? true,
    };
  }

  private async requestMicrophonePermission(): Promise<PermissionResult> {
    // Request camera which includes microphone on iOS
    // For dedicated audio recording, consider using expo-audio's useAudioRecorder hook
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    return {
      status: this.mapPermissionStatus(status),
      canAskAgain: canAskAgain ?? true,
    };
  }

  private async checkMediaLibraryPermission(): Promise<PermissionResult> {
    const permission = (await MediaLibrary.getPermissionsAsync()) as MediaLibraryPermissionResponse;
    return {
      status:
        permission.accessPrivileges === "limited"
          ? "limited"
          : this.mapPermissionStatus(permission.status),
      canAskAgain: permission.canAskAgain ?? true,
    };
  }

  private async requestMediaLibraryPermission(): Promise<PermissionResult> {
    const permission =
      (await MediaLibrary.requestPermissionsAsync()) as MediaLibraryPermissionResponse;
    return {
      status:
        permission.accessPrivileges === "limited"
          ? "limited"
          : this.mapPermissionStatus(permission.status),
      canAskAgain: permission.canAskAgain ?? true,
    };
  }

  private async checkNotificationsPermission(): Promise<PermissionResult> {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    return {
      status: this.mapPermissionStatus(status),
      canAskAgain: canAskAgain ?? true,
    };
  }

  private async requestNotificationsPermission(): Promise<PermissionResult> {
    const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
    return {
      status: this.mapPermissionStatus(status),
      canAskAgain: canAskAgain ?? true,
    };
  }

  private mapPermissionStatus(status: string): PermissionStatus {
    switch (status) {
      case "granted":
        return "granted";
      case "denied":
        return "denied";
      case "undetermined":
      default:
        return "undetermined";
    }
  }
}

export const permissionsService = new PermissionsService();

// Convenience functions for common permission requests

export async function requestCameraWithExplanation(): Promise<PermissionResult> {
  return permissionsService.requestWithExplanation("camera", {
    title: "Camera Access Required",
    message:
      "This app needs access to your camera to take photos for image analysis and generation.",
    settingsButtonText: "Open Settings",
  });
}

export async function requestMicrophoneWithExplanation(): Promise<PermissionResult> {
  return permissionsService.requestWithExplanation("microphone", {
    title: "Microphone Access Required",
    message: "This app needs access to your microphone to record audio for transcription.",
    settingsButtonText: "Open Settings",
  });
}

export async function requestMediaLibraryWithExplanation(): Promise<PermissionResult> {
  return permissionsService.requestWithExplanation("mediaLibrary", {
    title: "Photo Library Access Required",
    message:
      "This app needs access to your photo library to save generated images and select photos.",
    settingsButtonText: "Open Settings",
  });
}

export async function requestNotificationsWithExplanation(): Promise<PermissionResult> {
  return permissionsService.requestWithExplanation("notifications", {
    title: "Enable Notifications",
    message:
      "Enable notifications to get updates when your AI generations are complete and for important announcements.",
    settingsButtonText: "Open Settings",
  });
}
