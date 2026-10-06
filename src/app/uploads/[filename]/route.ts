import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  const uploadDir = process.env.UPLOAD_DIR;

  if (!uploadDir) {
    return new Response("Upload storage is not configured", {
      status: 500,
    });
  }

  if (!/^[a-f0-9-]+\.(jpg|jpeg|png|webp|gif|avif)$/i.test(filename)) {
    return new Response("Not found", {
      status: 404,
    });
  }

  const filePath = path.join(uploadDir, filename);

  try {
    const file = await readFile(filePath);

    const extension = path.extname(filename).toLowerCase();
    const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return new Response("Not found", {
        status: 404,
      });
    }

    console.error("Failed to serve uploaded image", error);

    return new Response("Internal server error", {
      status: 500,
    });
  }
}
