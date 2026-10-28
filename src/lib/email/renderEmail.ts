import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

type RenderEmailInput = {
  subject: string;
  /** Markdown, as typed in the composer */
  body: string;
  unsubscribeUrl: string;
};

export type RenderedEmail = {
  html: string;
  text: string;
};

// Email clients ignore <style> blocks and Tailwind, so every element gets inline styles.
// Colours copied from the composer preview (EmailComposer.tsx).
const ELEMENT_STYLES: Record<string, string> = {
  p: "margin:12px 0;",
  h1: "margin:20px 0 8px;font-size:20px;font-weight:900;",
  h2: "margin:20px 0 8px;font-size:18px;font-weight:900;",
  h3: "margin:16px 0 8px;font-size:16px;font-weight:700;",
  ul: "margin:12px 0;padding-left:24px;",
  ol: "margin:12px 0;padding-left:24px;",
  li: "margin:6px 0;",
  a: "color:#0f7a60;text-decoration:underline;",
  blockquote:
    "margin:12px 0;padding-left:12px;border-left:2px solid #3fcca8;color:#5b635f;",
  code: "background:#eef3f1;border-radius:4px;padding:0 4px;font-family:monospace;font-size:0.9em;",
  pre: "margin:12px 0;padding:12px;background:#eef3f1;border-radius:8px;overflow-x:auto;",
  hr: "margin:20px 0;border:0;border-top:1px solid #e3e6e4;",
  img: "max-width:100%;border-radius:6px;",
  table: "border-collapse:collapse;margin:12px 0;",
  th: "border:1px solid #e3e6e4;padding:4px 8px;text-align:left;",
  td: "border:1px solid #e3e6e4;padding:4px 8px;",
};

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function addInlineStyles(node: HastNode, parentTag?: string) {
  // Code inside a code block already sits on the block's background
  const style =
    node.tagName === "code" && parentTag === "pre"
      ? undefined
      : node.tagName && ELEMENT_STYLES[node.tagName];
  if (style) node.properties = { ...node.properties, style };
  for (const child of node.children ?? []) {
    addInlineStyles(child, node.tagName);
  }
}

// Same Markdown flavour and sanitising as the preview; styles are added after sanitising,
// because the sanitiser strips style attributes
const markdownToHtml = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(() => (tree: HastNode) => addInlineStyles(tree))
  .use(rehypeStringify);

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderEmail({
  subject,
  body,
  unsubscribeUrl,
}: RenderEmailInput): RenderedEmail {
  const bodyHtml = String(markdownToHtml.processSync(body));
  const safeSubject = escapeHtml(subject);
  const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl);

  // Table layout: the most reliable way to centre and size things across email clients
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#eef1ef;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1ef;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:576px;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
<tr><td align="center" style="background:#000000;border-bottom:4px solid #3fcca8;padding:28px 24px;color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.3px;">LUG@UoA</td></tr>
<tr><td style="padding:28px 32px;color:#1f2421;font-size:15px;line-height:1.6;">
<h1 style="margin:0 0 16px;font-size:24px;font-weight:900;color:#111412;">${safeSubject}</h1>
${bodyHtml}
</td></tr>
<tr><td align="center" style="background:#f4f6f5;border-top:1px solid #e3e6e4;padding:16px 24px;color:#6b736f;font-size:12px;line-height:20px;">
You're receiving this because you're a member of LUG@UoA.<br>
<a href="${safeUnsubscribeUrl}" style="color:#6b736f;text-decoration:underline;">Unsubscribe</a> from the mailing list.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  // Markdown is already readable as plain text, so the text version uses it as typed
  const text = `${subject}

${body.trim()}

--
You're receiving this because you're a member of LUG@UoA.
Unsubscribe: ${unsubscribeUrl}
`;

  return { html, text };
}
