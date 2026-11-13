import { describe, expect, it } from "vitest";
import { maskEmail } from "../mask";

describe("maskEmail", () => {
  it("keeps the first letter and the domain", () => {
    expect(maskEmail("samir@example.com")).toBe("s***@example.com");
  });

  it("hides one-letter names too", () => {
    expect(maskEmail("s@example.com")).toBe("s***@example.com");
  });

  it("hides everything when there's no name before the @", () => {
    expect(maskEmail("@example.com")).toBe("***");
    expect(maskEmail("not-an-email")).toBe("***");
  });
});
