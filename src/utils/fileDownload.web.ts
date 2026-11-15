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

type WebFileInfo = {
  exists: boolean;
  uri?: string;
  size?: number;
  isDirectory?: boolean;
  modificationTime?: number;
};

function getFileExtension(url: string, fileType: FileType): string {
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
}

async function triggerBrowserDownload(url: string, filename: string): Promise<void> {
  const documentRef = (globalThis as any).document;
  const urlRef = (globalThis as any).URL;

  if (!documentRef || !urlRef) {
    throw new Error("Browser download APIs are not available");
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = urlRef.createObjectURL(blob);
  const link = documentRef.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  documentRef.body.appendChild(link);
  link.click();
  link.remove();
  urlRef.revokeObjectURL(objectUrl);
}

export const fileDownload = {
  async download(options: DownloadOptions): Promise<DownloadResult> {
    const { url, filename, fileType, showShareSheet = false } = options;

    try {
      if (!url || typeof url !== "string") {
        return { success: false, error: "Invalid URL provided" };
      }

      const extension = getFileExtension(url, fileType);
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_-]/g, "_");
      const fullFilename = `${sanitizedFilename}_${Date.now()}.${extension}`;

      if (showShareSheet) {
        const navigatorRef = (globalThis as any).navigator;
        if (navigatorRef?.share) {
          await navigatorRef.share({ url, title: fullFilename });
          return { success: true, localUri: url };
        }
      }

      await triggerBrowserDownload(url, fullFilename);
      return { success: true, localUri: url };
    } catch (error) {
      console.error("File download error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Download failed",
      };
    }
  },

  async saveToGallery(
    url: string,
    filename: string,
    fileType: "image" | "video"
  ): Promise<DownloadResult> {
    return this.download({ url, filename, fileType });
  },

  async downloadAndShare(
    url: string,
    filename: string,
    fileType: FileType
  ): Promise<DownloadResult> {
    return this.download({ url, filename, fileType, showShareSheet: true });
  },

  async getFileInfo(uri: string): Promise<WebFileInfo> {
    return { exists: true, uri };
  },

  async deleteFile(): Promise<boolean> {
    return true;
  },

  async readAsBase64(): Promise<string | null> {
    return null;
  },

  async listDownloadedFiles(): Promise<string[]> {
    return [];
  },

  async clearDownloads(): Promise<boolean> {
    return true;
  },

  async getTotalDownloadSize(): Promise<number> {
    return 0;
  },

  async requestMediaLibraryPermissions(): Promise<boolean> {
    return true;
  },
};
