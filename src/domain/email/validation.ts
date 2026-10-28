import { z } from "zod";

import { AUDIENCE_FORM_VALUES, MAX_LENGTHS } from "./constants";
import type { AudienceFormValue, EmailAudience } from "./types";

export const AUDIENCE_BY_FORM_VALUE: Record<AudienceFormValue, EmailAudience> =
  {
    all: "ALL",
    new: "NEW",
    returning: "RETURNING",
    uoa: "UOA_STUDENTS",
  };

const audience = z
  .enum(AUDIENCE_FORM_VALUES, { error: "Choose who to send this email to." })
  .transform((value) => AUDIENCE_BY_FORM_VALUE[value]);

const subject = z
  .string()
  .trim()
  .max(
    MAX_LENGTHS.subject,
    `Subject must be ${MAX_LENGTHS.subject} characters or less.`,
  );

const body = z
  .string()
  .trim()
  .max(
    MAX_LENGTHS.body,
    `Body must be ${MAX_LENGTHS.body} characters or less.`,
  );

export const composeEmailSchema = z.discriminatedUnion("intent", [
  z.object({ intent: z.literal("draft"), audience, subject, body }),
  z.object({
    intent: z.literal("send"),
    audience,
    subject: subject.min(1, "Subject is required."),
    body: body.min(1, "Body is required."),
  }),
]);

export type ComposeEmailInput = z.infer<typeof composeEmailSchema>;
