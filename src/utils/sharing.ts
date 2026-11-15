import { Platform, Share, Alert } from "react-native";

import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

import * as FileSystem from "expo-file-system/legacy";

import { permissionsService } from "@/services/permissions.service";

export interface ShareOptions {
  title?: string;
  message?: string;
  url?: string;
}

export interface ShareResult {
  success: boolean;
  action?: "shared" | "dismissed" | "saved" | "copied";
  error?: string;
}

/**
 * Share content using the native share sheet
 */
export async function shareContent(options: ShareOptions): Promise<ShareResult> {
  try {
    const result = await Share.share(
      {
        title: options.title,
        message: options.message ?? "",
        url: options.url,
      },
      {
        dialogTitle: options.title,
      }
    );

    if (result.action === Share.sharedAction) {
      return { success: true, action: "shared" };
    } else if (result.action === Share.dismissedAction) {
      return { success: false, action: "dismissed" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[Sharing] Error sharing content:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Share a file (image, video, audio, etc.)
 */
export async function shareFile(
  fileUri: string,
  options?: { mimeType?: string; dialogTitle?: string }
): Promise<ShareResult> {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return { success: false, error: "Sharing is not available on this device" };
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: options?.mimeType,
      dialogTitle: options?.dialogTitle ?? "Share",
      UTI: getUTI(fileUri),
    });

    return { success: true, action: "shared" };
  } catch (error: any) {
    console.error("[Sharing] Error sharing file:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Share a remote URL by downloading it first
 */
export async function shareRemoteFile(
  remoteUrl: string,
  filename: string,
  options?: { mimeType?: string; dialogTitle?: string }
): Promise<ShareResult> {
  try {
    // Download to cache directory
    const localUri = `${FileSystem.cacheDirectory}${filename}`;

    const downloadResult = await FileSystem.downloadAsync(remoteUrl, localUri);

    if (downloadResult.status !== 200) {
      return { success: false, error: "Failed to download file" };
    }

    // Share the downloaded file
    return shareFile(localUri, options);
  } catch (error: any) {
    console.error("[Sharing] Error sharing remote file:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Save an image to the device's photo library
 */
export async function saveToPhotoLibrary(uri: string): Promise<ShareResult> {
  try {
    // Request permission
    const permission = await permissionsService.requestPermission("mediaLibrary");

    if (permission.status !== "granted" && permission.status !== "limited") {
      return { success: false, error: "Media library permission denied" };
    }

    // If it's a remote URL, download first
    let localUri = uri;
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      const filename = `generation_${Date.now()}.${getExtension(uri)}`;
      localUri = `${FileSystem.cacheDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(uri, localUri);
      if (downloadResult.status !== 200) {
        return { success: false, error: "Failed to download file" };
      }
    }

    // Save to library
    await MediaLibrary.saveToLibraryAsync(localUri);

    return { success: true, action: "saved" };
  } catch (error: any) {
    console.error("[Sharing] Error saving to photo library:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<ShareResult> {
  try {
    await Clipboard.setStringAsync(text);
    return { success: true, action: "copied" };
  } catch (error: any) {
    console.error("[Sharing] Error copying to clipboard:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Copy image to clipboard (iOS only)
 */
export async function copyImageToClipboard(uri: string): Promise<ShareResult> {
  if (Platform.OS !== "ios") {
    return { success: false, error: "Image clipboard only supported on iOS" };
  }

  try {
    // If remote, download first
    let localUri = uri;
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      const filename = `temp_${Date.now()}.${getExtension(uri)}`;
      localUri = `${FileSystem.cacheDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(uri, localUri);
      if (downloadResult.status !== 200) {
        return { success: false, error: "Failed to download image" };
      }
    }

    // Read as base64 and copy
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Clipboard.setImageAsync(base64);

    return { success: true, action: "copied" };
  } catch (error: any) {
    console.error("[Sharing] Error copying image to clipboard:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Share a generation (image/video) with options
 */
export async function shareGeneration(
  uri: string,
  type: "image" | "video" | "audio",
  prompt?: string
): Promise<void> {
  const options: { text: string; onPress: () => void }[] = [
    {
      text: "Share",
      onPress: () => {
        shareFile(uri, { mimeType: getMimeType(type) });
      },
    },
    {
      text: "Save to Photos",
      onPress: () => {
        handleSaveToPhotos(uri);
      },
    },
  ];

  if (prompt) {
    options.push({
      text: "Copy Prompt",
      onPress: () => {
        copyToClipboard(prompt);
      },
    });
  }

  if (Platform.OS === "ios" && type === "image") {
    options.push({
      text: "Copy Image",
      onPress: () => {
        copyImageToClipboard(uri);
      },
    });
  }

  options.push({ text: "Cancel", onPress: () => {} });

  Alert.alert("Share", "What would you like to do?", options, { cancelable: true });
}

// Helper function for save with feedback
async function handleSaveToPhotos(uri: string): Promise<void> {
  const result = await saveToPhotoLibrary(uri);
  if (result.success) {
    Alert.alert("Saved", "Image saved to your photo library");
  } else {
    Alert.alert("Error", result.error ?? "Failed to save image");
  }
}

// Helper functions

function getExtension(uri: string): string {
  const match = uri.match(/\.(\w+)(?:\?|$)/);
  return match ? match[1] : "jpg";
}

function getMimeType(type: "image" | "video" | "audio"): string {
  switch (type) {
    case "image":
      return "image/jpeg";
    case "video":
      return "video/mp4";
    case "audio":
      return "audio/mpeg";
    default:
      return "application/octet-stream";
  }
}

function getUTI(uri: string): string | undefined {
  if (Platform.OS !== "ios") return undefined;

  const extension = getExtension(uri).toLowerCase();

  const utiMap: Record<string, string> = {
    jpg: "public.jpeg",
    jpeg: "public.jpeg",
    png: "public.png",
    gif: "com.compuserve.gif",
    mp4: "public.mpeg-4",
    mov: "public.movie",
    mp3: "public.mp3",
    wav: "com.microsoft.waveform-audio",
    m4a: "public.mpeg-4-audio",
  };

  return utiMap[extension];
}
