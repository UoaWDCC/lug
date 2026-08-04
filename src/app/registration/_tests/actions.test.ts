import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * vi.mock() calls are hoisted to the very top of this file, above every
 * import and even above ordinary `const` declarations.
 * Vitest needs to intercept a module before anything else runs, including
 * the imports further down that pull in ../actions.
 *
 * Three mocks are needed here, for two different reasons:
 *
 * - next/headers and next/navigation are server-only Next.js APIs that
 *   don't exist outside a real request/render cycle. Without mocking
 *   them, importing ../actions here would throw immediately.
 * - submitMemberRegistration is mocked so this file only exercises
 *   actions.ts's own logic (routing, merging, redirects) in isolation.
 *   Letting it run for real would pull in validateMemberRegistration and
 *   a live Postgres call via createMembershipRegistration - both already
 *   covered by their own test suites, and not this file's responsibility.
 *
 * submitMemberRegistrationMock is created via vi.hoisted() rather than a
 * plain const, because vi.mock()'s factory runs before ordinary top-level
 * code in this file. Referencing a plain const from inside the factory
 * would hit it before it's initialized (this is the exact error Vitest
 * throws if you try). vi.hoisted() runs in that same early phase, so the
 * mock exists in time - and the returned reference can still be reset and
 * asserted on later, in beforeEach and inside individual tests.
 */
const cookieStore = new Map<string, string>();

const submitMemberRegistrationMock = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      cookieStore.has(name)
        ? { name, value: cookieStore.get(name)! }
        : undefined,
    set: (name: string, value: string) => cookieStore.set(name, value),
    delete: (arg: string | { name: string }) =>
      cookieStore.delete(typeof arg === "string" ? arg : arg.name),
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/features/membership-registration/submitMemberRegistration", () => ({
  submitMemberRegistration: submitMemberRegistrationMock,
}));

import { submitRegistrationStep } from "../actions";

function buildFormData(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      value.forEach((v) => fd.append(key, v));
    } else {
      fd.set(key, value);
    }
  }
  return fd;
}

function setCookieDraft(draft: object) {
  cookieStore.set("formState", JSON.stringify(draft));
}

beforeEach(() => {
  cookieStore.clear();
  submitMemberRegistrationMock.mockReset();
  submitMemberRegistrationMock.mockResolvedValue({ ok: true });
});

describe("page value validation", () => {
  it("redirects to /registration when the page field is missing", async () => {
    await expect(
      submitRegistrationStep(null, buildFormData({})),
    ).rejects.toThrow("REDIRECT:/registration");
  });

  it("redirects to /registration when the page field is not a recognized page", async () => {
    const fd = buildFormData({ page: "notARealPage" });
    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );
  });
});

describe("back navigation", () => {
  it("pops the last page off the stack and saves it as the current page", async () => {
    setCookieDraft({
      page: "newMember",
      pageStack: ["start"],
      email: "test@example.com",
    });
    const fd = buildFormData({ page: "newMember", intent: "back" });

    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );

    const saved = JSON.parse(cookieStore.get("formState")!);
    expect(saved.page).toBe("start");
    expect(saved.pageStack).toEqual([]);
  });

  it("falls back to start when the stack is already empty", async () => {
    setCookieDraft({ page: "start", pageStack: [] });
    const fd = buildFormData({ page: "start", intent: "back" });

    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );

    const saved = JSON.parse(cookieStore.get("formState")!);
    expect(saved.page).toBe("start");
  });
});

describe("case: start", () => {
  it("rejects an invalid email format", async () => {
    const fd = buildFormData({
      page: "start",
      email: "not-an-email",
      isConditionalReturningMember: "no",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/valid email address/);
  });

  it("rejects an email over the max length", async () => {
    const longEmail = `${"a".repeat(250)}@example.com`; // valid shape, 262 chars
    const fd = buildFormData({
      page: "start",
      email: longEmail,
      isConditionalReturningMember: "no",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/Your email must be under 254 characters/);
  });

  it("rejects an isConditionalReturningMember value that isn't yes/no", async () => {
    const fd = buildFormData({
      page: "start",
      email: "test@example.com",
      isConditionalReturningMember: "maybe",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/registered previously/);
  });

  it("routes to returningUoa on 'yes', appending start to the page stack", async () => {
    const fd = buildFormData({
      page: "start",
      email: "test@example.com",
      isConditionalReturningMember: "yes",
    });
    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );

    const saved = JSON.parse(cookieStore.get("formState")!);
    expect(saved.page).toBe("returningUoa");
    expect(saved.pageStack).toEqual(["start"]);
  });

  it("routes to newMember on 'no'", async () => {
    const fd = buildFormData({
      page: "start",
      email: "test@example.com",
      isConditionalReturningMember: "no",
    });
    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );

    const saved = JSON.parse(cookieStore.get("formState")!);
    expect(saved.page).toBe("newMember");
  });
});

describe("case: newMember", () => {
  it("rejects a missing firstName", async () => {
    const fd = buildFormData({
      page: "newMember",
      lastName: "Lovelace",
      isCurrentUoaStudent: "no",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toBe("First name is required.");
  });

  it("rejects a firstName over the max length", async () => {
    const fd = buildFormData({
      page: "newMember",
      firstName: "a".repeat(101),
      lastName: "Lovelace",
      isCurrentUoaStudent: "no",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/First name must be under 100 characters/);
  });

  it("rejects a missing lastName", async () => {
    const fd = buildFormData({
      page: "newMember",
      firstName: "Ada",
      isCurrentUoaStudent: "no",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toBe("Last name is required.");
  });

  it("rejects an isCurrentUoaStudent value that isn't yes/no", async () => {
    const fd = buildFormData({
      page: "newMember",
      firstName: "Ada",
      lastName: "Lovelace",
      isCurrentUoaStudent: "maybe",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/attend the University of Auckland/);
  });

  it("routes to newUoa on 'yes'", async () => {
    const fd = buildFormData({
      page: "newMember",
      firstName: "Ada",
      lastName: "Lovelace",
      isCurrentUoaStudent: "yes",
    });
    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );
    expect(JSON.parse(cookieStore.get("formState")!).page).toBe("newUoa");
  });

  it("routes to newNonUoa on 'no'", async () => {
    const fd = buildFormData({
      page: "newMember",
      firstName: "Ada",
      lastName: "Lovelace",
      isCurrentUoaStudent: "no",
    });
    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );
    expect(JSON.parse(cookieStore.get("formState")!).page).toBe("newNonUoa");
  });
});

describe("case: newUoa", () => {
  const validBase = {
    page: "newUoa",
    upi: "abcd123",
    studentId: "123456789",
    faculty: ["science"],
    programme: "Bachelor of Science",
    yearLevel: "FIRST_YEAR",
  };

  it("rejects a missing upi", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, upi: "" }),
    );
    expect(result?.error).toBe("UPI is required.");
  });

  it("rejects an invalid upi format", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, upi: "12345" }),
    );
    expect(result?.error).toMatch(/Invalid UPI format/);
  });

  it("rejects a missing studentId", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, studentId: "" }),
    );
    expect(result?.error).toBe("Student ID is required.");
  });

  it("rejects a studentId with the wrong number of digits", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, studentId: "123" }),
    );
    expect(result?.error).toMatch(/9-10 digits/);
  });

  it("rejects when no faculty is selected", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, faculty: [] }),
    );
    expect(result?.error).toMatch(/at least 1 faculty/);
  });

  it("rejects more than MAX_FACULTIES faculties", async () => {
    const fd = buildFormData({
      ...validBase,
      faculty: ["science", "law", "business"],
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/at most 2 faculties/);
  });

  it("rejects a faculty value not in VALID_FACULTIES", async () => {
    const fd = buildFormData({
      ...validBase,
      faculty: ["astrology"],
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/valid faculty/);
  });

  it("rejects more than MAX_MAJORS majors", async () => {
    const fd = buildFormData({
      ...validBase,
      majors: ["a", "b", "c", "d", "e"],
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/at most 4 majors/);
  });

  it("rejects a major value over the max length", async () => {
    const fd = buildFormData({
      ...validBase,
      majors: ["a".repeat(41)],
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/Each major must be under 40 characters/);
  });

  it("rejects a missing programme", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, programme: "" }),
    );
    expect(result?.error).toMatch(/current programme of study/);
  });

  it("rejects a programme value over the max length", async () => {
    const fd = buildFormData({ ...validBase, programme: "a".repeat(151) });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/Programme must be under 150 characters/);
  });

  it("rejects a missing yearLevel", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, yearLevel: "" }),
    );
    expect(result?.error).toMatch(/current year of study/);
  });

  it("rejects a yearLevel outside the known set", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, yearLevel: "SIXTH_YEAR" }),
    );
    expect(result?.error).toMatch(/valid year of study/);
  });

  it("routes to final on a fully valid submission", async () => {
    await expect(
      submitRegistrationStep(null, buildFormData(validBase)),
    ).rejects.toThrow("REDIRECT:/registration");
    expect(JSON.parse(cookieStore.get("formState")!).page).toBe("final");
  });

  describe("addMajor intent", () => {
    it("increments majorCount and preserves already-typed fields without advancing the page", async () => {
      setCookieDraft({ page: "newUoa", pageStack: ["start", "newMember"] });
      const fd = buildFormData({
        ...validBase,
        intent: "addMajor",
        majorCount: "1",
        majors: ["Computer Science"],
      });

      await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
        "REDIRECT:/registration",
      );

      const saved = JSON.parse(cookieStore.get("formState")!);
      expect(saved.page).toBe("newUoa");
      expect(saved.pageStack).toEqual(["start", "newMember"]);
      expect(saved.majorCount).toBe(2);
      expect(saved.majors).toEqual(["Computer Science"]);
      expect(saved.upi).toBe("abcd123");
    });

    it("caps majorCount at MAX_MAJORS", async () => {
      setCookieDraft({ page: "newUoa", pageStack: ["start", "newMember"] });
      const fd = buildFormData({
        ...validBase,
        intent: "addMajor",
        majorCount: "4",
      });

      await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
        "REDIRECT:/registration",
      );

      const saved = JSON.parse(cookieStore.get("formState")!);
      expect(saved.majorCount).toBe(4);
    });
  });
});

describe("case: newNonUoa", () => {
  it("rejects a missing primaryAffiliation", async () => {
    const fd = buildFormData({ page: "newNonUoa", primaryAffiliation: "" });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toBe("Primary Affiliation is required.");
  });

  it("rejects a primaryAffiliation over the max length", async () => {
    const fd = buildFormData({
      page: "newNonUoa",
      primaryAffiliation: "a".repeat(151),
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(
      /Primary affiliation must be under 150 characters/,
    );
  });

  it("rejects a nonUoaExcerpt over the max length", async () => {
    const fd = buildFormData({
      page: "newNonUoa",
      primaryAffiliation: "Independent",
      nonUoaExcerpt: "a".repeat(501),
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/keep it under 500 characters/);
  });

  it("rejects a nonUoaPitch over the max length", async () => {
    const fd = buildFormData({
      page: "newNonUoa",
      primaryAffiliation: "Independent",
      nonUoaPitch: "a".repeat(501),
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/keep it under 500 characters/);
  });

  it("routes to final on a valid submission", async () => {
    const fd = buildFormData({
      page: "newNonUoa",
      primaryAffiliation: "Independent",
    });
    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );
    expect(JSON.parse(cookieStore.get("formState")!).page).toBe("final");
  });
});

describe("case: returningUoa", () => {
  it("rejects a missing upi", async () => {
    const fd = buildFormData({
      page: "returningUoa",
      upi: "",
      studentId: "123456789",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toBe("UPI is required.");
  });

  it("rejects an invalid upi format", async () => {
    const fd = buildFormData({
      page: "returningUoa",
      upi: "notvalid!",
      studentId: "123456789",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/Invalid UPI format/);
  });

  it("rejects a missing studentId", async () => {
    const fd = buildFormData({
      page: "returningUoa",
      upi: "abcd123",
      studentId: "",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toBe("Student ID is required.");
  });

  it("rejects a studentId with the wrong number of digits", async () => {
    const fd = buildFormData({
      page: "returningUoa",
      upi: "abcd123",
      studentId: "42",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/9-10 digits/);
  });

  it("routes to final on a valid submission", async () => {
    const fd = buildFormData({
      page: "returningUoa",
      upi: "abcd123",
      studentId: "123456789",
    });
    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );
    expect(JSON.parse(cookieStore.get("formState")!).page).toBe("final");
  });
});

describe("case: final", () => {
  it("rejects a missing linuxSkillLevel", async () => {
    setCookieDraft({
      page: "final",
      pageStack: ["start", "newMember", "newNonUoa"],
    });
    const result = await submitRegistrationStep(
      null,
      buildFormData({ page: "final" }),
    );
    expect(result?.error).toMatch(/valid Linux knowledge level/);
  });

  it("rejects a linuxSkillLevel outside the known set", async () => {
    setCookieDraft({
      page: "final",
      pageStack: ["start", "newMember", "newNonUoa"],
    });
    const fd = buildFormData({ page: "final", linuxSkillLevel: "WIZARD" });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/valid Linux knowledge level/);
  });

  it("rejects a potentialInvolvement value outside the known set", async () => {
    setCookieDraft({
      page: "final",
      pageStack: ["start", "newMember", "newNonUoa"],
    });
    const fd = buildFormData({
      page: "final",
      linuxSkillLevel: "BEGINNER_USER",
      potentialInvolvement: ["ATTENDING", "PRESIDENT"],
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toBe("Invalid involvement option selected.");
  });

  it("rejects a discordUsername over the max length", async () => {
    setCookieDraft({
      page: "final",
      pageStack: ["start", "newMember", "newNonUoa"],
    });
    const fd = buildFormData({
      page: "final",
      linuxSkillLevel: "BEGINNER_USER",
      discordUsername: "a".repeat(33),
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(
      /Discord username must be under 32 characters/,
    );
  });

  it("deletes the cookie and redirects to /success on a valid submission", async () => {
    setCookieDraft({
      page: "final",
      pageStack: ["start", "newMember", "newNonUoa"],
      primaryAffiliation: "Independent",
    });
    const fd = buildFormData({
      page: "final",
      linuxSkillLevel: "BEGINNER_USER",
    });

    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration/success",
    );
    expect(cookieStore.has("formState")).toBe(false);
  });

  it("returns the submission's error and does not redirect when submission fails", async () => {
    submitMemberRegistrationMock.mockResolvedValueOnce({
      ok: false,
      error: { message: "It looks like you've already registered." },
    });
    setCookieDraft({
      page: "final",
      pageStack: ["start", "newMember", "newNonUoa"],
      primaryAffiliation: "Independent",
    });
    const fd = buildFormData({
      page: "final",
      linuxSkillLevel: "BEGINNER_USER",
    });

    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toBe("It looks like you've already registered.");
  });

  describe("majors flow through to submission", () => {
    it("includes majors from the draft in the parsed submission", async () => {
      setCookieDraft({
        page: "final",
        pageStack: ["start", "newMember", "newUoa"],
        faculty: ["science"],
        majors: ["Computer Science", "Statistics"],
      });
      const fd = buildFormData({
        page: "final",
        linuxSkillLevel: "BEGINNER_USER",
      });

      await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
        "REDIRECT:/registration/success",
      );

      const submittedData = submitMemberRegistrationMock.mock.calls[0][0];
      expect(submittedData.majors).toEqual(["Computer Science", "Statistics"]);
    });

    it("defaults majors to an empty array when absent from the draft", async () => {
      setCookieDraft({
        page: "final",
        pageStack: ["start", "newMember", "newUoa"],
        faculty: ["science"],
      });
      const fd = buildFormData({
        page: "final",
        linuxSkillLevel: "BEGINNER_USER",
      });

      await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
        "REDIRECT:/registration/success",
      );

      const submittedData = submitMemberRegistrationMock.mock.calls[0][0];
      expect(submittedData.majors).toEqual([]);
    });
  });

  describe("stripIrrelevantFields per branch", () => {
    it("strips UoA-only and non-UoA-only fields when the last page was returningUoa", async () => {
      setCookieDraft({
        page: "final",
        pageStack: ["start", "returningUoa"],
        upi: "abcd123",
        studentId: "123456789",
        firstName: "Should not appear",
        primaryAffiliation: "Should not appear either",
      });
      const fd = buildFormData({
        page: "final",
        linuxSkillLevel: "BEGINNER_USER",
      });

      await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
        "REDIRECT:/registration/success",
      );

      const submittedData = submitMemberRegistrationMock.mock.calls[0][0];
      expect(submittedData.upi).toBe("abcd123");
      expect(submittedData.studentId).toBe("123456789");
      expect(submittedData.firstName).toBeNull();
      expect(submittedData.primaryAffiliation).toBeNull();
    });

    it("keeps UoA fields and strips non-UoA fields when the last page was newUoa", async () => {
      setCookieDraft({
        page: "final",
        pageStack: ["start", "newMember", "newUoa"],
        programme: "Bachelor of Science",
        primaryAffiliation: "Should not appear",
      });
      const fd = buildFormData({
        page: "final",
        linuxSkillLevel: "BEGINNER_USER",
      });

      await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
        "REDIRECT:/registration/success",
      );

      const submittedData = submitMemberRegistrationMock.mock.calls[0][0];
      expect(submittedData.programme).toBe("Bachelor of Science");
      expect(submittedData.primaryAffiliation).toBeNull();
    });

    it("keeps non-UoA fields and strips UoA fields when the last page was newNonUoa", async () => {
      setCookieDraft({
        page: "final",
        pageStack: ["start", "newMember", "newNonUoa"],
        primaryAffiliation: "Independent",
        upi: "should-not-appear",
      });
      const fd = buildFormData({
        page: "final",
        linuxSkillLevel: "BEGINNER_USER",
      });

      await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
        "REDIRECT:/registration/success",
      );

      const submittedData = submitMemberRegistrationMock.mock.calls[0][0];
      expect(submittedData.primaryAffiliation).toBe("Independent");
      expect(submittedData.upi).toBeNull();
    });
  });
});
