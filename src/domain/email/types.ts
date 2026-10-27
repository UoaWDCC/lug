import type {
  AUDIENCE_FORM_VALUES,
  EMAIL_AUDIENCES,
  EMAIL_INTENTS,
} from "./constants";

export type EmailAudience = (typeof EMAIL_AUDIENCES)[number];
export type AudienceFormValue = (typeof AUDIENCE_FORM_VALUES)[number];
export type EmailIntent = (typeof EMAIL_INTENTS)[number];

export type AudienceMember = {
  email: string;
  isCurrentUoaStudent: boolean;
  upi: string | null;
  studentId: string | null;
};
