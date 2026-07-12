import { describe, it, expect } from "vitest";
import { MAX_LENGTHS } from "../constants";
import { exceedsMax } from "../exceedsMax";

describe("exceedsMax", () => {
  it("returns false for undefined values", () => {
    expect(exceedsMax(undefined, "firstName")).toBe(false);
  });

  it("returns false for null values", () => {
    expect(exceedsMax(null, "firstName")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(exceedsMax("", "firstName")).toBe(false);
  });

  it("returns false for a value under the limit", () => {
    expect(exceedsMax("Ada", "firstName")).toBe(false);
  });

  it("returns false for a value exactly at the limit (boundary)", () => {
    const exact = "a".repeat(MAX_LENGTHS.firstName);
    expect(exceedsMax(exact, "firstName")).toBe(false);
  });

  it("returns true for a value one character over the limit (boundary)", () => {
    const overByOne = "a".repeat(MAX_LENGTHS.firstName + 1);
    expect(exceedsMax(overByOne, "firstName")).toBe(true);
  });

  it("checks the limit for the specific field key given", () => {
    const value = "a".repeat(50);
    expect(exceedsMax(value, "discordUsername")).toBe(true);
    expect(exceedsMax(value, "nonUoaExcerpt")).toBe(false);
  });
});
