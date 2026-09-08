import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ImageStorage } from "./uploadImage";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export class LocalImageStorage implements ImageStorage {
  async upload(file: File): Promise<string> {
    const uploadDir = process.env.UPLOAD_DIR;
    if (!uploadDir) {
      throw new Error("UPLOAD_DIR is not configured");
    }
    const extension = EXTENSIONS[file.type];
    if (!extension) {
      throw new Error("Unsupported image type");
    }
    await mkdir(uploadDir, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    const destination = path.join(uploadDir, filename);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(destination, bytes, {
      flag: "wx",
    });
    return `/uploads/${filename}`;
  }
}

export const imageStorage: ImageStorage = new LocalImageStorage();
