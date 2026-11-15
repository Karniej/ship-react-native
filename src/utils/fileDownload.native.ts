import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

import * as FileSystem from "expo-file-system/legacy";

export type FileType = "image" | "video" | "audio" | "document";

interface DownloadOptions {
  url: string;
  filename: string;
  fileType: FileType;
  saveToGallery?: boolean;
  showShareSheet?: boolean;
}

interface DownloadResult {
  success: boolean;
  localUri?: string;
  error?: string;
}

const getFileExtension = (url: string, fileType: FileType): string => {
  const urlExtension = url.split(".").pop()?.split("?")[0]?.toLowerCase();

  if (
    urlExtension &&
    ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "mp3", "wav", "m4a", "pdf", "txt"].includes(
      urlExtension
    )
  ) {
    return urlExtension;
  }

  switch (fileType) {
    case "image":
      return "jpg";
    case "video":
      return "mp4";
    case "audio":
      return "mp3";
    case "document":
      return "txt";
    default:
      return "bin";
  }
};

const getContentDirectory = (fileType: FileType): string => {
  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory not available");
  }

  switch (fileType) {
    case "image":
      return `${FileSystem.documentDirectory}images/`;
    case "video":
      return `${FileSystem.documentDirectory}videos/`;
    case "audio":
      return `${FileSystem.documentDirectory}audio/`;
    case "document":
      return `${FileSystem.documentDirectory}documents/`;
    default:
      return `${FileSystem.documentDirectory}downloads/`;
  }
};

const ensureDirectoryExists = async (directory: string): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(directory);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }
};

export const fileDownload = {
  /**
   * Download a file from a URL and save it to the device
   */
  async download(options: DownloadOptions): Promise<DownloadResult> {
    const { url, filename, fileType, saveToGallery = false, showShareSheet = false } = options;

    try {
      // Validate URL
      if (!url || typeof url !== "string") {
        return { success: false, error: "Invalid URL provided" };
      }

      // Get file extension and directory
      const extension = getFileExtension(url, fileType);
      const directory = getContentDirectory(fileType);
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_-]/g, "_");
      const timestamp = Date.now();
      const fullFilename = `${sanitizedFilename}_${timestamp}.${extension}`;
      const localUri = `${directory}${fullFilename}`;

      // Ensure directory exists
      await ensureDirectoryExists(directory);

      // Download the file
      const downloadResult = await FileSystem.downloadAsync(url, localUri);

      if (downloadResult.status !== 200) {
        return {
          success: false,
          error: `Download failed with status ${downloadResult.status}`,
        };
      }

      // Verify file was downloaded
      const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
      if (!fileInfo.exists) {
        return {
          success: false,
          error: "File download failed - file not found",
        };
      }

      // Save to gallery if requested (for images and videos)
      if (saveToGallery && (fileType === "image" || fileType === "video")) {
        try {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === "granted") {
            await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
          }
        } catch (galleryError) {
          console.warn("Failed to save to gallery:", galleryError);
          // Don't fail the download, just warn
        }
      }

      // Show share sheet if requested
      if (showShareSheet) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(downloadResult.uri);
        }
      }

      return { success: true, localUri: downloadResult.uri };
    } catch (error) {
      console.error("File download error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Download failed",
      };
    }
  },

  /**
   * Download and save to camera roll/gallery
   */
  async saveToGallery(
    url: string,
    filename: string,
    fileType: "image" | "video"
  ): Promise<DownloadResult> {
    return this.download({
      url,
      filename,
      fileType,
      saveToGallery: true,
    });
  },

  /**
   * Download and share
   */
  async downloadAndShare(
    url: string,
    filename: string,
    fileType: FileType
  ): Promise<DownloadResult> {
    return this.download({
      url,
      filename,
      fileType,
      showShareSheet: true,
    });
  },

  /**
   * Get a local file's info
   */
  async getFileInfo(uri: string): Promise<FileSystem.FileInfo> {
    return FileSystem.getInfoAsync(uri);
  },

  /**
   * Delete a local file
   */
  async deleteFile(uri: string): Promise<boolean> {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      return true;
    } catch (error) {
      console.error("Delete file error:", error);
      return false;
    }
  },

  /**
   * Read a file as base64
   */
  async readAsBase64(uri: string): Promise<string | null> {
    try {
      return await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (error) {
      console.error("Read file error:", error);
      return null;
    }
  },

  /**
   * List all downloaded files of a specific type
   */
  async listDownloadedFiles(fileType: FileType): Promise<string[]> {
    try {
      const directory = getContentDirectory(fileType);
      const dirInfo = await FileSystem.getInfoAsync(directory);

      if (!dirInfo.exists) {
        return [];
      }

      const files = await FileSystem.readDirectoryAsync(directory);
      return files.map((file) => `${directory}${file}`);
    } catch (error) {
      console.error("List files error:", error);
      return [];
    }
  },

  /**
   * Clear all downloaded files of a specific type
   */
  async clearDownloads(fileType: FileType): Promise<boolean> {
    try {
      const directory = getContentDirectory(fileType);
      await FileSystem.deleteAsync(directory, { idempotent: true });
      return true;
    } catch (error) {
      console.error("Clear downloads error:", error);
      return false;
    }
  },

  /**
   * Get the size of all downloaded files
   */
  async getTotalDownloadSize(): Promise<number> {
    let totalSize = 0;
    const fileTypes: FileType[] = ["image", "video", "audio", "document"];

    for (const fileType of fileTypes) {
      const files = await this.listDownloadedFiles(fileType);
      for (const file of files) {
        const info = await FileSystem.getInfoAsync(file);
        if (info.exists && "size" in info) {
          totalSize += info.size || 0;
        }
      }
    }

    return totalSize;
  },

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermissions(): Promise<boolean> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === "granted";
  },
};
