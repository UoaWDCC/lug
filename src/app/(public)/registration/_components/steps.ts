import { RegistrationPage } from "../types";

/* Both paths are the same length: start, one middle page, then final. */

const TOTAL_STEPS = 3;

const STAGE_LABELS: Record<RegistrationPage, string> = {
  start: "Status",
  uoaDetails: "Study",
  newNonUoa: "Affiliation",
  final: "Finish",
};

const POSITIONS: Record<RegistrationPage, number> = {
  start: 1,
  uoaDetails: 2,
  newNonUoa: 2,
  final: TOTAL_STEPS,
};

export type StepProgress = {
  current: number;
  total: number;
  label: string;
};

export function getStepProgress(page: RegistrationPage): StepProgress {
  return {
    current: POSITIONS[page],
    total: TOTAL_STEPS,
    label: STAGE_LABELS[page],
  };
}
