"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import uploadBlogImage from "@/features/blog/uploadBlogImage";
import {
  adminErrorClass,
  adminSectionTitleClass,
} from "@/app/admin/_lib/adminStyles";

type Props = {
  initialContent?: string;
};

/* Rendered-markdown typography for the preview pane, in theme colours. */
const previewClass =
  "min-w-0 px-6 py-5 leading-relaxed [overflow-wrap:anywhere] " +
  "[&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:tracking-tight " +
  "[&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:tracking-tight " +
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold " +
  "[&>:first-child]:mt-0 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 " +
  "[&_strong]:font-bold [&_em]:italic [&_hr]:my-6 [&_hr]:border-[var(--divider)] " +
  "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--accent)] [&_blockquote]:pl-4 [&_blockquote]:text-[var(--muted)] " +
  "[&_code]:rounded [&_code]:border [&_code]:border-[var(--input-border)] [&_code]:bg-[var(--accent)]/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-[var(--accent-text)] " +
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[var(--input-border)] [&_pre]:bg-[var(--input-bg)] [&_pre]:p-5 [&_pre]:text-sm [&_pre]:leading-6 " +
  // text-[1em] undoes the inline-code shrink, so block code matches the <pre>'s size.
  "[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[1em] [&_pre_code]:text-[var(--fg)] " +
  "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[var(--divider)] [&_td]:p-2 [&_th]:border [&_th]:border-[var(--divider)] [&_th]:p-2 [&_th]:text-left";

const toolbarButtonClass =
  "flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md border border-[var(--divider)] bg-[var(--chip-bg)] px-2 font-mono text-sm text-[var(--muted)] transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--accent-text)]";

export function PostEditor({ initialContent = "" }: Props) {
  const [content, setContent] = useState(initialContent);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Replace the selection (or insert at the cursor) and select the inserted text afterwards. */
  function replaceSelection(
    build: (selected: string) => string,
    selectInner?: { before: number; after: number },
  ) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? start;
    const selected = content.slice(start, end);
    const inserted = build(selected);

    setContent(
      (current) => current.slice(0, start) + inserted + current.slice(end),
    );
    requestAnimationFrame(() => {
      textarea?.focus();
      if (selectInner) {
        textarea?.setSelectionRange(
          start + selectInner.before,
          start + inserted.length - selectInner.after,
        );
      } else {
        textarea?.setSelectionRange(
          start + inserted.length,
          start + inserted.length,
        );
      }
    });
  }

  function wrap(marker: string, placeholder: string) {
    replaceSelection(
      (selected) => `${marker}${selected || placeholder}${marker}`,
      {
        before: marker.length,
        after: marker.length,
      },
    );
  }

  function insertCode() {
    const textarea = textareaRef.current;
    const selected = textarea
      ? content.slice(textarea.selectionStart, textarea.selectionEnd)
      : "";
    // Multi-line selections become a fenced block; anything else inline code.
    if (selected.includes("\n")) {
      replaceSelection((text) => `\`\`\`\n${text}\n\`\`\``, {
        before: 4,
        after: 4,
      });
    } else {
      wrap("`", "code");
    }
  }

  async function insertImage(file: File) {
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
      replaceSelection(() => `![${safeName}](${result.url})`);
    } catch {
      setUploadError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="grid overflow-hidden rounded-2xl border border-[var(--input-border)] bg-[var(--card-bg)] lg:grid-cols-2">
      <div className="flex min-w-0 flex-col border-b border-[var(--divider)] lg:border-r lg:border-b-0">
        <div className="flex h-14 items-center justify-between gap-3 border-b border-[var(--divider)] px-5">
          <label htmlFor="content" className={adminSectionTitleClass}>
            Markdown
          </label>
          <div
            role="toolbar"
            aria-label="Formatting"
            className="flex items-center gap-1.5"
          >
            {/* Image upload lives with the other inserts: it lands at the cursor too. */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label={uploading ? "Uploading image" : "Insert image"}
              title={uploading ? "Uploading…" : "Insert image"}
              className={`${toolbarButtonClass} disabled:cursor-wait disabled:opacity-60`}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 ${uploading ? "animate-pulse" : ""}`}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
              </svg>
            </button>
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
            <span aria-hidden className="mx-1 h-5 w-px bg-[var(--divider)]" />
            <button
              type="button"
              onClick={() => wrap("**", "bold text")}
              aria-label="Bold"
              title="Bold (Ctrl/⌘+B)"
              className={`${toolbarButtonClass} font-bold`}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => wrap("*", "italic text")}
              aria-label="Italic"
              title="Italic (Ctrl/⌘+I)"
              className={`${toolbarButtonClass} italic`}
            >
              I
            </button>
            <button
              type="button"
              onClick={insertCode}
              aria-label="Code"
              title="Code"
              className={toolbarButtonClass}
            >
              {"</>"}
            </button>
          </div>
        </div>
        {uploadError && (
          <p role="alert" className={`mx-5 mt-4 ${adminErrorClass}`}>
            {uploadError}
          </p>
        )}
        <textarea
          ref={textareaRef}
          id="content"
          name="content"
          required
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (!(event.metaKey || event.ctrlKey)) return;
            const key = event.key.toLowerCase();
            if (key === "b" || key === "i") {
              event.preventDefault();
              if (key === "b") wrap("**", "bold text");
              else wrap("*", "italic text");
            }
          }}
          placeholder="## Start writing in markdown…"
          className="min-h-[32rem] w-full flex-1 resize-y bg-transparent px-5 py-5 font-mono text-sm leading-7 [font-variant-ligatures:none] text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none focus-visible:bg-[var(--accent)]/[0.03]"
        />
      </div>

      <div className="min-w-0">
        <div className="flex h-14 items-center border-b border-[var(--divider)] px-5">
          <h2 className={adminSectionTitleClass}>Preview</h2>
        </div>
        <div aria-live="polite" className={previewClass}>
          {content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                // Images become captioned figures; spans keep this valid inside the wrapping <p>.
                img: ({ src, alt }) => (
                  <span className="my-5 block overflow-hidden rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- author-supplied URL, unknown size */}
                    <img
                      src={typeof src === "string" ? src : undefined}
                      alt={alt ?? ""}
                      className="block max-h-[28rem] w-full object-contain"
                    />
                    {alt && (
                      <span className="block border-t border-[var(--divider)] px-4 py-2.5 text-sm text-[var(--muted)] italic">
                        {alt}
                      </span>
                    )}
                  </span>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <p className="text-[var(--muted)]">
              Your rendered markdown will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
