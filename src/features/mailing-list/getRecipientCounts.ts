import { selectRecipients } from "@/domain/email/audience";
import type { AudienceFormValue, RecipientCounts } from "@/domain/email/types";
import { AUDIENCE_BY_FORM_VALUE } from "@/domain/email/validation";
import { findAllOptedOutEmails } from "@/repositories/emailOptOutRepository";
import { findAudienceMembers } from "@/repositories/memberRepository";

export async function getRecipientCounts(): Promise<RecipientCounts> {
  const [{ currentMembers, earlierMembers }, optedOutEmails] =
    await Promise.all([findAudienceMembers(), findAllOptedOutEmails()]);

  const countFor = (value: AudienceFormValue) =>
    selectRecipients({
      audience: AUDIENCE_BY_FORM_VALUE[value],
      currentMembers,
      earlierMembers,
      optedOutEmails,
    }).length;

  return {
    all: countFor("all"),
    new: countFor("new"),
    returning: countFor("returning"),
    uoa: countFor("uoa"),
  };
}
