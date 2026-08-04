import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { RegistrationForm } from "../RegistrationForm";
import type { StepProgress } from "../_components/steps";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const step: StepProgress = { current: 1, total: 4, label: "Status" };

describe("RegistrationForm", () => {
  it("does not render an error banner when there is no error state", () => {
    render(
      <RegistrationForm currentPage="start" step={step}>
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders the child content passed to it", () => {
    render(
      <RegistrationForm currentPage="start" step={step}>
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("renders a link home instead of a back button on the first page (start)", () => {
    render(
      <RegistrationForm currentPage="start" step={step}>
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(
      screen.queryByRole("button", { name: /Back/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back/ })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("shows the Back button on any page other than start", () => {
    render(
      <RegistrationForm currentPage="newMember" step={step}>
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(screen.getByRole("button", { name: /Back/ })).toBeInTheDocument();
  });

  it("labels the submit button 'Continue' on a non-final page", () => {
    render(
      <RegistrationForm currentPage="newMember" step={step}>
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(
      screen.getByRole("button", { name: "Continue" }),
    ).toBeInTheDocument();
  });

  it("labels the submit button 'Complete registration' on the final page", () => {
    render(
      <RegistrationForm currentPage="final" step={step}>
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(
      screen.getByRole("button", { name: "Complete registration" }),
    ).toBeInTheDocument();
  });

  it("renders the step progress indicator", () => {
    render(
      <RegistrationForm
        currentPage="newUoa"
        step={{ current: 3, total: 4, label: "Study" }}
      >
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(screen.getByText("Step 3 of 4 · Study")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "3",
    );
  });

  it("includes a hidden input carrying the current page value", () => {
    const { container } = render(
      <RegistrationForm currentPage="newUoa" step={step}>
        <p>child content</p>
      </RegistrationForm>,
    );

    const hiddenInput = container.querySelector(
      'input[type="hidden"][name="page"]',
    );
    expect(hiddenInput).toHaveValue("newUoa");
  });
});
