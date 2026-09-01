import fs from "fs/promises";
import path from "path";

export interface StorageFile {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export interface StorageProvider {
  upload(file: StorageFile, folder?: string): Promise<UploadResult>;
  delete(key: string): Promise<boolean>;
  getUrl(key: string): string;
}

class LocalStorageProvider implements StorageProvider {
  private baseDir: string;
  private publicPath: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "public", "uploads");
    this.publicPath = "/uploads";
  }

  private async ensureDir(dirPath: string) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  async upload(file: StorageFile, folder: string = "general"): Promise<UploadResult> {
    const targetFolder = path.join(this.baseDir, folder);
    await this.ensureDir(targetFolder);

    const ext = path.extname(file.filename);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filePath = path.join(targetFolder, uniqueName);

    await fs.writeFile(filePath, file.buffer);

    const relativeKey = `${folder}/${uniqueName}`;
    return {
      url: `${this.publicPath}/${relativeKey}`,
      key: relativeKey,
      size: file.size,
      mimeType: file.mimeType,
    };
  }

  async delete(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.baseDir, key);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(key: string): string {
    return `${this.publicPath}/${key}`;
  }
}

// S3-compatible provider stub (ready to configure when AWS/R2 credentials are provided)
class S3StorageProvider implements StorageProvider {
  async upload(_file: StorageFile, _folder?: string): Promise<UploadResult> {
    // S3 integration placeholder with strict AWS SDK v3 abstraction
    throw new Error("S3 storage credentials not configured. Please use local storage or provide S3 credentials.");
  }

  async delete(_key: string): Promise<boolean> {
    return true;
  }

  getUrl(key: string): string {
    return `https://${process.env.STORAGE_BUCKET}.s3.${process.env.STORAGE_REGION}.amazonaws.com/${key}`;
  }
}

const providerType = process.env.STORAGE_PROVIDER || "local";
export const storage: StorageProvider =
  providerType === "s3" ? new S3StorageProvider() : new LocalStorageProvider();
