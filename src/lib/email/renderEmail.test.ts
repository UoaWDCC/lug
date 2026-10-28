import { describe, expect, it } from "vitest";
import { renderEmail } from "./renderEmail";

const unsubscribeUrl = "https://lug.example/unsubscribe?token=abc.def&x=1";

function render(body: string, subject = "Welcome back") {
  return renderEmail({ subject, body, unsubscribeUrl });
}

describe("renderEmail", () => {
  it("renders Markdown to HTML with inline styles", () => {
    const { html } = render("Hi **all**, see [the site](https://lug.example).");

    expect(html).toContain("<strong>all</strong>");
    expect(html).toContain(
      '<a href="https://lug.example" style="color:#0f7a60;text-decoration:underline;">the site</a>',
    );
  });

  it("escapes HTML in the subject", () => {
    const { html } = render("Body", "<script>alert(1)</script>");

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("drops raw HTML and unsafe links in the body", () => {
    const { html } = render(
      '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n[click](javascript:alert(1))',
    );

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("javascript:");
  });

  it("puts the unsubscribe link in the HTML footer and the text version", () => {
    const { html, text } = render("Body");

    expect(html).toContain(
      'href="https://lug.example/unsubscribe?token=abc.def&amp;x=1"',
    );
    expect(text).toContain(`Unsubscribe: ${unsubscribeUrl}`);
  });

  it("uses the subject and Markdown source for the text version", () => {
    const { text } = render("Hi **all**\n\n- one\n- two\n");

    expect(
      text.startsWith("Welcome back\n\nHi **all**\n\n- one\n- two\n\n--\n"),
    ).toBe(true);
  });

  it("does not give code inside a code block its own background", () => {
    const { html } = render("```\nconst x = 1;\n```");

    expect(html).toContain("<pre style=");
    expect(html).toContain("<code>");
  });
});
