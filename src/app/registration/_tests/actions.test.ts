import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * vi.mock() calls are hoisted to the very top of this file, above every
 * import and even above ordinary `const` declarations.
 * Vitest needs to intercept a module before anything else runs, including
 * the imports further down that pull in ../actions.
 *
 * Four mocks are needed here, for two different reasons:
 *
 * - next/headers and next/navigation are server-only Next.js APIs that
 *   don't exist outside a real request/render cycle. Without mocking
 *   them, importing ../actions here would throw immediately.
 * - submitMemberRegistration and findMemberByUpiAndStudentId are mocked
 *   so this file only exercises actions.ts's own logic (routing, merging,
 *   redirects) in isolation. Letting them run for real would pull in
 *   validateMemberRegistration and a live Postgres call - both already
 *   covered by their own test suites, and not this file's responsibility.
 *
 * The mocks below are created via vi.hoisted() rather than plain consts,
 * because vi.mock()'s factory runs before ordinary top-level code in this
 * file. Referencing a plain const from inside the factory would hit it
 * before it's initialized (this is the exact error Vitest throws if you
 * try). vi.hoisted() runs in that same early phase, so the mock exists in
 * time - and the returned reference can still be reset and asserted on
 * later, in beforeEach and inside individual tests.
 */
const cookieStore = new Map<string, string>();

const submitMemberRegistrationMock = vi.hoisted(() => vi.fn());
const findMemberByUpiAndStudentIdMock = vi.hoisted(() => vi.fn());

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

vi.mock("@/repositories/memberRepository", () => ({
  findMemberByUpiAndStudentId: findMemberByUpiAndStudentIdMock,
}));

import { submitRegistrationStep } from "../actions";

function buildFormData(
  fields: Record<string, string | string[] | undefined>,
): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
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
  findMemberByUpiAndStudentIdMock.mockReset();
  findMemberByUpiAndStudentIdMock.mockResolvedValue(null);
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
      page: "uoaDetails",
      pageStack: ["start"],
      faculty: ["science"],
    });
    const fd = buildFormData({ page: "uoaDetails", intent: "back" });

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
  it("rejects an isCurrentUoaStudent value that isn't yes/no", async () => {
    const fd = buildFormData({ page: "start", isCurrentUoaStudent: "maybe" });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/attend the University of Auckland/);
  });

  it("rejects a missing upi when isCurrentUoaStudent is yes", async () => {
    const fd = buildFormData({
      page: "start",
      isCurrentUoaStudent: "yes",
      upi: "",
      studentId: "123456789",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toBe("UPI is required.");
  });

  it("rejects an invalid upi format", async () => {
    const fd = buildFormData({
      page: "start",
      isCurrentUoaStudent: "yes",
      upi: "12345",
      studentId: "123456789",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/Invalid UPI format/);
  });

  it("rejects a missing studentId", async () => {
    const fd = buildFormData({
      page: "start",
      isCurrentUoaStudent: "yes",
      upi: "abcd123",
      studentId: "",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toBe("Student ID is required.");
  });

  it("rejects a studentId with the wrong number of digits", async () => {
    const fd = buildFormData({
      page: "start",
      isCurrentUoaStudent: "yes",
      upi: "abcd123",
      studentId: "123",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/9-10 digits/);
  });

  it("routes to newNonUoa on 'no'", async () => {
    const fd = buildFormData({ page: "start", isCurrentUoaStudent: "no" });
    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );
    expect(JSON.parse(cookieStore.get("formState")!).page).toBe("newNonUoa");
  });

  it("routes to uoaDetails with cleared fields when no existing member is found", async () => {
    const fd = buildFormData({
      page: "start",
      isCurrentUoaStudent: "yes",
      upi: "abcd123",
      studentId: "123456789",
    });
    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );

    expect(findMemberByUpiAndStudentIdMock).toHaveBeenCalledWith(
      "abcd123",
      "123456789",
    );

    const saved = JSON.parse(cookieStore.get("formState")!);
    expect(saved.page).toBe("uoaDetails");
    expect(saved.firstName).toBeUndefined();
    expect(saved.isConditionalReturningMember).toBeUndefined();
  });

  it("routes to uoaDetails and prefills fields when an existing member is found", async () => {
    findMemberByUpiAndStudentIdMock.mockResolvedValueOnce({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      faculty: ["science"],
      majors: ["Computer Science"],
      programmeType: "MASTER",
      yearsRemaining: 1,
    });
    const fd = buildFormData({
      page: "start",
      isCurrentUoaStudent: "yes",
      upi: "abcd123",
      studentId: "123456789",
    });
    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );

    const saved = JSON.parse(cookieStore.get("formState")!);
    expect(saved.page).toBe("uoaDetails");
    expect(saved.isConditionalReturningMember).toBe("yes");
    expect(saved.firstName).toBe("Ada");
    expect(saved.email).toBe("ada@example.com");
    expect(saved.faculty).toEqual(["science"]);
    expect(saved.majors).toEqual(["Computer Science"]);
    expect(saved.majorCount).toBe(1);
    expect(saved.programmeType).toBe("MASTER");
  });
});

describe("case: uoaDetails", () => {
  const validBase = {
    page: "uoaDetails",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    faculty: ["science"],
    programmeType: "MASTER",
  };

  it("rejects a missing firstName", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, firstName: "" }),
    );
    expect(result?.error).toBe("First name is required.");
  });

  it("rejects a firstName over the max length", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, firstName: "a".repeat(101) }),
    );
    expect(result?.error).toMatch(/First name must be under 100 characters/);
  });

  it("rejects a missing lastName", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, lastName: "" }),
    );
    expect(result?.error).toBe("Last name is required.");
  });

  it("rejects a lastName over the max length", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, lastName: "a".repeat(101) }),
    );
    expect(result?.error).toMatch(/Last name must be under 100 characters/);
  });

  it("rejects an invalid email format", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, email: "not-an-email" }),
    );
    expect(result?.error).toMatch(/valid email address/);
  });

  it("rejects an email over the max length", async () => {
    const longEmail = `${"a".repeat(250)}@example.com`; // valid shape, 262 chars
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, email: longEmail }),
    );
    expect(result?.error).toMatch(/Your email must be under 254 characters/);
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

  it("rejects a missing programmeType", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, programmeType: "" }),
    );
    expect(result?.error).toMatch(/select a programme type/);
  });

  it("rejects a programmeType outside the known set", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, programmeType: "WIZARDRY" }),
    );
    expect(result?.error).toMatch(/select a programme type/);
  });

  it("rejects a BACHELOR programme with a yearsRemaining outside the known set", async () => {
    const fd = buildFormData({
      ...validBase,
      programmeType: "BACHELOR",
      yearsRemaining: "9",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/years you have remaining/);
  });

  it("accepts a BACHELOR programme with a valid yearsRemaining", async () => {
    const fd = buildFormData({
      ...validBase,
      programmeType: "BACHELOR",
      yearsRemaining: "2",
    });
    await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
      "REDIRECT:/registration",
    );
    expect(JSON.parse(cookieStore.get("formState")!).page).toBe("final");
  });

  it("routes to final on a fully valid submission", async () => {
    await expect(
      submitRegistrationStep(null, buildFormData(validBase)),
    ).rejects.toThrow("REDIRECT:/registration");
    expect(JSON.parse(cookieStore.get("formState")!).page).toBe("final");
  });

  describe("addMajor intent", () => {
    it("increments majorCount and preserves already-typed fields without advancing the page", async () => {
      setCookieDraft({ page: "uoaDetails", pageStack: ["start"] });
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
      expect(saved.page).toBe("uoaDetails");
      expect(saved.pageStack).toEqual(["start"]);
      expect(saved.majorCount).toBe(2);
      expect(saved.majors).toEqual(["Computer Science"]);
      expect(saved.firstName).toBe("Ada");
    });

    it("caps majorCount at MAX_MAJORS", async () => {
      setCookieDraft({ page: "uoaDetails", pageStack: ["start"] });
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
  const validBase = {
    page: "newNonUoa",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    primaryAffiliation: "Independent",
  };

  it("rejects a missing firstName", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, firstName: "" }),
    );
    expect(result?.error).toBe("First name is required.");
  });

  it("rejects a firstName over the max length", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, firstName: "a".repeat(101) }),
    );
    expect(result?.error).toMatch(/First name must be under 100 characters/);
  });

  it("rejects a missing lastName", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, lastName: "" }),
    );
    expect(result?.error).toBe("Last name is required.");
  });

  it("rejects an invalid email format", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, email: "not-an-email" }),
    );
    expect(result?.error).toMatch(/valid email address/);
  });

  it("rejects a missing primaryAffiliation", async () => {
    const fd = buildFormData({ ...validBase, primaryAffiliation: "" });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toBe("Primary Affiliation is required.");
  });

  it("rejects a primaryAffiliation over the max length", async () => {
    const fd = buildFormData({
      ...validBase,
      primaryAffiliation: "a".repeat(151),
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(
      /Primary affiliation must be under 150 characters/,
    );
  });

  it("rejects a nonUoaExcerpt over the max length", async () => {
    const fd = buildFormData({
      ...validBase,
      nonUoaExcerpt: "a".repeat(501),
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/keep it under 500 characters/);
  });

  it("rejects a nonUoaPitch over the max length", async () => {
    const fd = buildFormData({
      ...validBase,
      nonUoaPitch: "a".repeat(501),
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/keep it under 500 characters/);
  });

  it("routes to final on a valid submission", async () => {
    const fd = buildFormData(validBase);
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
      pageStack: ["start", "newNonUoa"],
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
      pageStack: ["start", "newNonUoa"],
    });
    const fd = buildFormData({ page: "final", linuxSkillLevel: "WIZARD" });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/valid Linux knowledge level/);
  });

  it("rejects a potentialInvolvement value outside the known set", async () => {
    setCookieDraft({
      page: "final",
      pageStack: ["start", "newNonUoa"],
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
      pageStack: ["start", "newNonUoa"],
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
      pageStack: ["start", "newNonUoa"],
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
      pageStack: ["start", "newNonUoa"],
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
        pageStack: ["start", "uoaDetails"],
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
        pageStack: ["start", "uoaDetails"],
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
    it("keeps UoA fields and strips non-UoA fields when the last page was uoaDetails", async () => {
      setCookieDraft({
        page: "final",
        pageStack: ["start", "uoaDetails"],
        upi: "abcd123",
        programmeType: "MASTER",
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
      expect(submittedData.upi).toBe("abcd123");
      expect(submittedData.primaryAffiliation).toBeNull();
    });

    it("keeps non-UoA fields and strips UoA fields when the last page was newNonUoa", async () => {
      setCookieDraft({
        page: "final",
        pageStack: ["start", "newNonUoa"],
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
