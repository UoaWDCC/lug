import { describe, expect, it } from "vitest";

import {
    MAX_LENGTHS,
    exceedsMax,
    readRegistrationDraft,
} from "../utils";


describe("exceedsMax", () => {
    it("returns false for undefined values", () => {
        expect(exceedsMax(undefined, "firstName")).toBe(false);
    });

    it("returns false for an empty string", () => {
        expect(exceedsMax("", "firstName")).toBe(false);
    })

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
        // discordUsername (32) has a much lower limit than nonUoaExcerpt (500)
        const value = "a".repeat(50);
        expect(exceedsMax(value, "discordUsername")).toBe(true);
        expect(exceedsMax(value, "nonUoaExcerpt")).toBe(false);
    });
});

describe("readRegistrationDraft", () => {
    it("returns a fresh default draft when raw is undefined", () => {
        expect(readRegistrationDraft(undefined)).toEqual({ page: "start", pageStack: [] });
    });

    it("returns a fresh default draft when raw is an empty string", () => {
        expect(readRegistrationDraft("")).toEqual({ page: "start", pageStack: [] });
    });

    it("returns a fresh default draft when raw is malformed JSON", () => {
        expect(readRegistrationDraft("{not valid json")).toEqual({ page: "start", pageStack: [] });
    });

    it("returns a fresh default draft when raw parses to null", () => {
        expect(readRegistrationDraft("null")).toEqual({ page: "start", pageStack: [] });
    });

    it("returns a fresh default draft when raw parses to a primitive", () => {
        expect(readRegistrationDraft('"just a string"')).toEqual({ page: "start", pageStack: [] });
    });

    it("returns a fresh default draft when raw parses to an array", () => {
        // typeof [] === "object" in JS, so without an explicit Array.isArray
        // check, a JSON array would slip past the object/null guard.
        expect(readRegistrationDraft(JSON.stringify([1, 2, 3]))).toEqual({
        page: "start",
        pageStack: [],
        });
    });

    it("returns a fresh default draft when page is not a valid page", () => {
        const draft = readRegistrationDraft(JSON.stringify({ page: "notARealPage", pageStack: [] }));
        expect(draft).toEqual({ page: "start", pageStack: [] });
    });

    it("returns a fresh default draft when pageStack is not an array", () => {
        const draft = readRegistrationDraft(JSON.stringify({ page: "start", pageStack: "notAnArray" }));
        expect(draft).toEqual({ page: "start", pageStack: [] });
    });

    it("returns a fresh default draft when pageStack contains an invalid page", () => {
        const draft = readRegistrationDraft(
        JSON.stringify({ page: "start", pageStack: ["start", "notReal"] }),
        );
        expect(draft).toEqual({ page: "start", pageStack: [] });
    });

    it("returns the parsed draft unchanged when it is valid", () => {
        const valid = {
        page: "newUoa",
        pageStack: ["start", "newMember"],
        firstName: "Ada",
        lastName: "Lovelace",
        };
        expect(readRegistrationDraft(JSON.stringify(valid))).toEqual(valid);
    });

    describe("singleton regression: fresh default must not be a shared reference", () => {
        it("returns a new object on each call, not the same reference", () => {
        const first = readRegistrationDraft(undefined);
        const second = readRegistrationDraft(undefined);
        expect(first).not.toBe(second);
        });

        it("returns a new pageStack array on each call, not the same reference", () => {
        const first = readRegistrationDraft(undefined);
        const second = readRegistrationDraft(undefined);
        expect(first.pageStack).not.toBe(second.pageStack);
        });

        it("mutating one call's result does not affect a later call's result", () => {
        const first = readRegistrationDraft(undefined);
        // Mirrors the kind of direct mutation actions.ts used to perform
        // on `prev` before the mergedPrev fix
        first.faculty = ["mutated"];
        first.pageStack?.push("newMember");

        const second = readRegistrationDraft(undefined);
        expect(second).toEqual({ page: "start", pageStack: [] });
        expect(second.faculty).toBeUndefined();
        });
    });
});