import { RegistrationDraft, RegistrationPage } from "../types";

/* Step total depends on the path — returning members answer one fewer page. */

const STAGE_LABELS: Record<RegistrationPage, string> = {
  start: "Status",
  returningUoa: "Identity",
  newMember: "About you",
  newUoa: "Study",
  newNonUoa: "Affiliation",
  final: "Finish",
};

const POSITIONS: Record<Exclude<RegistrationPage, "final">, number> = {
  start: 1,
  returningUoa: 2,
  newMember: 2,
  newUoa: 3,
  newNonUoa: 3,
};

export type StepProgress = {
  current: number;
  total: number;
  label: string;
};

export function getStepProgress(
  page: RegistrationPage,
  draft: Partial<RegistrationDraft>,
): StepProgress {
  // Unknown until the first page is answered, so assume the longer path.
  const total = draft.isConditionalReturningMember === "yes" ? 3 : 4;

  return {
    current: page === "final" ? total : POSITIONS[page],
    total,
    label: STAGE_LABELS[page],
  };
}
