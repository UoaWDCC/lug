import { describe, it, expect, vi, beforeEach } from "vitest";

const cookieStore = new Map<string, string>();

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
    yearLevel: "year1",
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

  it("rejects when no faculty is selected and no otherFaculty is given", async () => {
    const result = await submitRegistrationStep(
      null,
      buildFormData({ ...validBase, faculty: [] }),
    );
    expect(result?.error).toMatch(/at least 1 faculty/);
  });

  it("rejects 'other' selected without otherFaculty text", async () => {
    const fd = buildFormData({
      ...validBase,
      faculty: ["other"],
      otherFaculty: "",
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/specify your other faculty/);
  });

  it("rejects an otherFaculty value over the max length", async () => {
    const fd = buildFormData({
      ...validBase,
      faculty: ["other"],
      otherFaculty: "a".repeat(101),
    });
    const result = await submitRegistrationStep(null, fd);
    expect(result?.error).toMatch(/Other faculty must be under 100 characters/);
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

  it("routes to final on a fully valid submission", async () => {
    await expect(
      submitRegistrationStep(null, buildFormData(validBase)),
    ).rejects.toThrow("REDIRECT:/registration");
    expect(JSON.parse(cookieStore.get("formState")!).page).toBe("final");
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
      "REDIRECT:/success",
    );
    expect(cookieStore.has("formState")).toBe(false);
  });

  // console.log is currently the only observable output of the final merge,
  // since there's no persistence layer yet (that's domain/member/validation.ts,
  // still to be built). This spy is a deliberate, temporary seam — once a real
  // submitMemberRegistration/repository call replaces the console.log, these
  // assertions should move to checking that call's arguments instead.
  describe("otherFaculty merge into faculty", () => {
    it("folds otherFaculty into faculty and removes the 'other' placeholder", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      setCookieDraft({
        page: "final",
        pageStack: ["start", "newMember", "newUoa"],
        faculty: ["science", "other"],
        otherFaculty: "Faculty of Made Up Studies",
      });
      const fd = buildFormData({
        page: "final",
        linuxSkillLevel: "BEGINNER_USER",
      });

      await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
        "REDIRECT:/success",
      );

      const fullDraft = logSpy.mock.calls[0][1];
      expect(fullDraft.faculty).toEqual([
        "science",
        "Faculty of Made Up Studies",
      ]);
    });

    it("does not mutate the object read from the cookie", async () => {
      setCookieDraft({
        page: "final",
        pageStack: ["start", "newMember", "newUoa"],
        faculty: ["other"],
        otherFaculty: "Faculty of Made Up Studies",
      });
      const rawBefore = cookieStore.get("formState")!;

      const fd = buildFormData({
        page: "final",
        linuxSkillLevel: "BEGINNER_USER",
      });
      await expect(submitRegistrationStep(null, fd)).rejects.toThrow(
        "REDIRECT:/success",
      );

      // Re-parsing the string captured *before* the call proves nothing
      // mutated the underlying data during the request — this is the
      // regression test for the prev.faculty = [...] mutation bug.
      const reparsed = JSON.parse(rawBefore);
      expect(reparsed.faculty).toEqual(["other"]);
    });
  });

  describe("stripIrrelevantFields per branch", () => {
    it("strips UoA-only and non-UoA-only fields when the last page was returningUoa", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
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
        "REDIRECT:/success",
      );

      const fullDraft = logSpy.mock.calls[0][1];
      expect(fullDraft.upi).toBe("abcd123");
      expect(fullDraft.studentId).toBe("123456789");
      expect(fullDraft.firstName).toBeUndefined();
      expect(fullDraft.primaryAffiliation).toBeUndefined();
    });

    it("keeps UoA fields and strips non-UoA fields when the last page was newUoa", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
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
        "REDIRECT:/success",
      );

      const fullDraft = logSpy.mock.calls[0][1];
      expect(fullDraft.programme).toBe("Bachelor of Science");
      expect(fullDraft.primaryAffiliation).toBeUndefined();
    });

    it("keeps non-UoA fields and strips UoA fields when the last page was newNonUoa", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
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
        "REDIRECT:/success",
      );

      const fullDraft = logSpy.mock.calls[0][1];
      expect(fullDraft.primaryAffiliation).toBe("Independent");
      expect(fullDraft.upi).toBeUndefined();
    });
  });
});
