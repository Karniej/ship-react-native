import { Platform } from "react-native";

import { Paths, File, Directory } from "expo-file-system";

// Metadata storage key prefix
const METADATA_KEY = "file_cache_metadata";

interface CacheMetadata {
  uri: string;
  localPath: string;
  cachedAt: number;
  expiresAt: number | null;
  size?: number;
  mimeType?: string;
}

interface CacheOptions {
  /** Time-to-live in milliseconds (null = never expires) */
  ttl?: number | null;
  /** Subdirectory within cache */
  subdir?: string;
  /** Custom filename (defaults to hash of URL) */
  filename?: string;
}

/**
 * File cache service for downloading and storing API results locally
 * Uses the new expo-file-system SDK 54+ API with File and Directory classes
 */
class FileCacheService {
  private initialized = false;
  private metadata: Map<string, CacheMetadata> = new Map();
  private cacheDir!: Directory;
  private mediaDir!: Directory;

  /**
   * Initialize cache directories
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create cache directories using new API
      this.cacheDir = new Directory(Paths.document, "cache");
      this.mediaDir = new Directory(Paths.document, "media");

      if (!this.cacheDir.exists) {
        this.cacheDir.create();
      }
      if (!this.mediaDir.exists) {
        this.mediaDir.create();
      }

      // Load metadata from storage
      await this.loadMetadata();

      this.initialized = true;
    } catch (error) {
      console.error("[FileCache] Init error:", error);
    }
  }

  /**
   * Generate a hash for cache key
   */
  private hashKey(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get file extension from URL or mime type
   */
  private getExtension(url: string, mimeType?: string): string {
    if (mimeType) {
      const mimeExtensions: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
        "video/mp4": ".mp4",
        "video/quicktime": ".mov",
        "audio/mpeg": ".mp3",
        "audio/wav": ".wav",
        "application/json": ".json",
        "application/pdf": ".pdf",
      };
      if (mimeExtensions[mimeType]) return mimeExtensions[mimeType];
    }

    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
      if (match) return `.${match[1]}`;
    } catch {
      const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
      if (match) return `.${match[1]}`;
    }

    return "";
  }

  /**
   * Load metadata from storage
   */
  private async loadMetadata(): Promise<void> {
    try {
      const metadataFile = new File(this.cacheDir, `${METADATA_KEY}.json`);

      if (metadataFile.exists) {
        const content = await metadataFile.text();
        const data = JSON.parse(content);
        this.metadata = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error("[FileCache] Load metadata error:", error);
      this.metadata = new Map();
    }
  }

  /**
   * Save metadata to storage
   */
  private async saveMetadata(): Promise<void> {
    try {
      const metadataFile = new File(this.cacheDir, `${METADATA_KEY}.json`);
      const data = Object.fromEntries(this.metadata);
      metadataFile.write(JSON.stringify(data));
    } catch (error) {
      console.error("[FileCache] Save metadata error:", error);
    }
  }

  /**
   * Download and cache a file from URL
   */
  async cacheFile(url: string, options: CacheOptions = {}): Promise<string | null> {
    await this.init();

    const { ttl = null, subdir = "", filename } = options;

    // Check if already cached and not expired
    const cached = await this.getCachedFile(url);
    if (cached) return cached;

    try {
      // Determine target directory
      let targetDir = this.cacheDir;
      if (subdir) {
        targetDir = new Directory(this.cacheDir, subdir);
        if (!targetDir.exists) {
          targetDir.create();
        }
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp|mp4|mov|mp3|wav)$/i)) {
        targetDir = this.mediaDir;
      }

      const ext = this.getExtension(url);
      const name = filename || this.hashKey(url);
      const targetFile = new File(targetDir, `${name}${ext}`);

      // Download file using fetch and write
      const response = await fetch(url);
      if (!response.ok) {
        console.error("[FileCache] Download failed:", response.status);
        return null;
      }

      const contentType = response.headers.get("content-type") || undefined;
      const blob = await response.blob();

      // Convert blob to base64 and write
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const base64Data = await base64Promise;
      targetFile.write(base64Data, { encoding: "base64" });

      const localPath = targetFile.uri;

      // Store metadata
      const metadata: CacheMetadata = {
        uri: url,
        localPath,
        cachedAt: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : null,
        mimeType: contentType,
        size: blob.size,
      };

      this.metadata.set(url, metadata);
      await this.saveMetadata();

      return localPath;
    } catch (error) {
      console.error("[FileCache] Cache file error:", error);
      return null;
    }
  }

  /**
   * Get cached file path if exists and not expired
   */
  async getCachedFile(url: string): Promise<string | null> {
    await this.init();

    const metadata = this.metadata.get(url);
    if (!metadata) return null;

    // Check expiration
    if (metadata.expiresAt && Date.now() > metadata.expiresAt) {
      await this.removeFile(url);
      return null;
    }

    // Verify file still exists
    const file = new File(metadata.localPath);
    if (!file.exists) {
      this.metadata.delete(url);
      await this.saveMetadata();
      return null;
    }

    return metadata.localPath;
  }

  /**
   * Cache JSON data
   */
  async cacheJSON<T>(key: string, data: T, ttl?: number): Promise<string> {
    await this.init();

    const jsonFile = new File(this.cacheDir, `${this.hashKey(key)}.json`);
    jsonFile.write(JSON.stringify(data));

    const localPath = jsonFile.uri;

    const metadata: CacheMetadata = {
      uri: key,
      localPath,
      cachedAt: Date.now(),
      expiresAt: ttl ? Date.now() + ttl : null,
      mimeType: "application/json",
    };

    this.metadata.set(key, metadata);
    await this.saveMetadata();

    return localPath;
  }

  /**
   * Get cached JSON data
   */
  async getCachedJSON<T>(key: string): Promise<T | null> {
    const localPath = await this.getCachedFile(key);
    if (!localPath) return null;

    try {
      const file = new File(localPath);
      const content = await file.text();
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }

  /**
   * Remove a cached file
   */
  async removeFile(url: string): Promise<void> {
    const metadata = this.metadata.get(url);
    if (!metadata) return;

    try {
      const file = new File(metadata.localPath);
      if (file.exists) {
        file.delete();
      }
    } catch {
      // Ignore deletion errors
    }

    this.metadata.delete(url);
    await this.saveMetadata();
  }

  /**
   * Clear all cached files
   */
  async clearAll(): Promise<void> {
    try {
      if (this.cacheDir?.exists) {
        this.cacheDir.delete();
      }
      if (this.mediaDir?.exists) {
        this.mediaDir.delete();
      }
      this.metadata.clear();
      this.initialized = false;
      await this.init();
    } catch (error) {
      console.error("[FileCache] Clear all error:", error);
    }
  }

  /**
   * Clear expired files
   */
  async clearExpired(): Promise<void> {
    await this.init();

    const now = Date.now();
    const expired: string[] = [];

    for (const [url, metadata] of this.metadata) {
      if (metadata.expiresAt && now > metadata.expiresAt) {
        expired.push(url);
      }
    }

    for (const url of expired) {
      await this.removeFile(url);
    }
  }

  /**
   * Get total cache size in bytes
   */
  async getCacheSize(): Promise<number> {
    await this.init();

    let total = 0;
    for (const metadata of this.metadata.values()) {
      if (metadata.size) {
        total += metadata.size;
      }
    }
    return total;
  }

  /**
   * Get local path for a URL (platform-aware)
   */
  getLocalUri(localPath: string): string {
    if (Platform.OS === "web") {
      return localPath;
    }
    return localPath.startsWith("file://") ? localPath : `file://${localPath}`;
  }
}

export const fileCache = new FileCacheService();
