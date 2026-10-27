export const EMAIL_AUDIENCES = [
  "ALL",
  "NEW",
  "RETURNING",
  "UOA_STUDENTS",
] as const;

export const AUDIENCE_FORM_VALUES = ["all", "new", "returning", "uoa"] as const;

export const EMAIL_INTENTS = ["draft", "send"] as const;

export const MAX_LENGTHS = {
  subject: 200,
  body: 20_000,
} as const;
