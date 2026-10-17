"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import uploadBlogImage from "@/features/blog/uploadBlogImage";

type Props = {
  inputClass: string;
  labelClass: string;
  initialContent?: string;
};

export function PostEditor({
  inputClass,
  labelClass,
  initialContent = "",
}: Props) {
  const [content, setContent] = useState(initialContent);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function insertImage(file: File) {
    const textarea = textareaRef.current;
    const cursor = textarea?.selectionStart ?? content.length;
    const selectionEnd = textarea?.selectionEnd ?? cursor;
    const uploadData = new FormData();
    uploadData.set("file", file);
    setUploading(true);
    setUploadError(null);

    try {
      const result = await uploadBlogImage(uploadData);
      if ("error" in result) {
        setUploadError(result.error);
        return;
      }

      const safeName = file.name.replace(/[\[\]]/g, "");
      const markdown = `![${safeName}](${result.url})`;
      setContent(
        (current) =>
          current.slice(0, cursor) + markdown + current.slice(selectionEnd),
      );
      requestAnimationFrame(() => {
        textarea?.focus();
        textarea?.setSelectionRange(
          cursor + markdown.length,
          cursor + markdown.length,
        );
      });
    } catch {
      setUploadError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <label htmlFor="content" className={labelClass}>
          Content (markdown)
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded border border-gray-400 px-3 py-1 text-sm disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Insert image"}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        aria-label="Choose blog image"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void insertImage(file);
        }}
      />
      {uploadError && (
        <p role="alert" className="mb-2 text-sm text-red-700">
          {uploadError}
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-600">
            Markdown
          </p>
          <textarea
            ref={textareaRef}
            id="content"
            name="content"
            rows={20}
            required
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className={`${inputClass} min-h-96 font-mono`}
          />
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-600">
            Preview
          </p>
          <div
            aria-live="polite"
            className="min-h-96 rounded border border-gray-300 bg-gray-50 px-4 py-3 text-sm [overflow-wrap:anywhere] [&_a]:text-blue-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-gray-200 [&_code]:px-1 [&_h1]:mb-3 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-xl [&_h3]:font-semibold [&_hr]:my-4 [&_img]:max-w-full [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-gray-900 [&_pre]:p-3 [&_pre]:text-white [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_ul]:list-disc"
          >
            {content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-500">
                Your rendered markdown will appear here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
