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

export const VALID_PROGRAMME_TYPES = [
  "TFC_PRE_UNI",
  "BACHELOR",
  "MASTER",
  "PHD",
  "OTHER",
] as const;

export const VALID_FACULTIES = [
  "engineeringDesign",
  "science",
  "artsEducation",
  "business",
  "law",
  "medicalHealthScience",
  "liggins",
  "bioengineering",
] as const;

export const MAX_LENGTHS = {
  email: 254,
  firstName: 100,
  lastName: 100,
  major: 40,
  primaryAffiliation: 150,
  nonUoaExcerpt: 500,
  nonUoaPitch: 500,
  discordUsername: 32,
} as const;

export const FACULTY_OPTIONS = [
  { value: "engineeringDesign", label: "Faculty of Engineering & Design" },
  { value: "science", label: "Faculty of Science" },
  { value: "artsEducation", label: "Faculty of Arts & Education" },
  { value: "business", label: "Business School" },
  { value: "law", label: "Auckland Law School" },
  {
    value: "medicalHealthScience",
    label: "Faculty of Medical and Health Sciences",
  },
  { value: "liggins", label: "Liggins Institute" },
  { value: "bioengineering", label: "Auckland Bioengineering Institute" },
];

export const MAX_FACULTIES = 2;
export const MAX_MAJORS = 4;

export const VALID_YEARS_REMAINING = [0, 1, 2, 3, 4, 5] as const;
