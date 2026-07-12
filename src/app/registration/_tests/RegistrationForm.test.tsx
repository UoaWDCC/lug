import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { RegistrationForm } from "../RegistrationForm";

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

describe("RegistrationForm", () => {
  it("does not render an error banner when there is no error state", () => {
    render(
      <RegistrationForm currentPage="start">
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders the child content passed to it", () => {
    render(
      <RegistrationForm currentPage="start">
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("hides the Prev button on the first page (start)", () => {
    render(
      <RegistrationForm currentPage="start">
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(screen.queryByRole("button", { name: "Prev" })).not.toBeInTheDocument();
  });

  it("shows the Prev button on any page other than start", () => {
    render(
      <RegistrationForm currentPage="newMember">
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(screen.getByRole("button", { name: "Prev" })).toBeInTheDocument();
  });

  it("labels the submit button 'Next' on a non-final page", () => {
    render(
      <RegistrationForm currentPage="newMember">
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("labels the submit button 'Submit' on the final page", () => {
    render(
      <RegistrationForm currentPage="final">
        <p>child content</p>
      </RegistrationForm>,
    );

    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("includes a hidden input carrying the current page value", () => {
    const { container } = render(
      <RegistrationForm currentPage="newUoa">
        <p>child content</p>
      </RegistrationForm>,
    );

    const hiddenInput = container.querySelector('input[type="hidden"][name="page"]');
    expect(hiddenInput).toHaveValue("newUoa");
  });
});