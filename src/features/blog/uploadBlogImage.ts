import { requireAdmin } from "@/lib/auth/session";
import { imageStorage } from "@/lib/storage/localStorage";
export default async function uploadBlogImage(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  await requireAdmin();
  try {
    const file: File = requireFile(formData, "file");
    const url: string = await imageStorage.upload(file);
    return { url };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

function requireFile(formData: FormData, key: string): File {
  const value = formData.get(key);
  if (!(value instanceof File)) {
    throw new Error(`Missing file: ${key}`);
  }
  return value;
}
