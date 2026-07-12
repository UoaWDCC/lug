export const VALID_SKILL_LEVELS = [
  "NOTHING",
  "AWARE_OF_EXISTENCE",
  "BEGINNER_USER",
  "REGULAR_USER",
  "POWER_USER",
  "CONTRIBUTOR",
] as const;

export const VALID_INVOLVEMENTS = [
  "ATTENDING",
  "SPEAKING",
  "EXECUTIVE",
  "PROJECTS",
] as const;

export const VALID_YEAR_LEVELS = [
  "FIRST_YEAR",
  "SECOND_YEAR",
  "THIRD_YEAR",
  "FOURTH_YEAR",
  "FIFTH_YEAR_OR_LATER",
  "GRADUATED_WITHIN_2_YEARS",
] as const;

export const MAX_LENGTHS = {
  email: 254,
  firstName: 100,
  lastName: 100,
  otherFaculty: 100,
  programme: 150,
  primaryAffiliation: 150,
  nonUoaExcerpt: 500,
  nonUoaPitch: 500,
  discordUsername: 32,
} as const;
