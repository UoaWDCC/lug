import { selectRecipientAddresses } from "@/domain/email/audience";
import type { AudienceFormValue, RecipientCounts } from "@/domain/email/types";
import { AUDIENCE_BY_FORM_VALUE } from "@/domain/email/validation";
import { findAllOptedOutEmailAddresses } from "@/repositories/emailAddressOptOutRepository";
import { findAudienceMembers } from "@/repositories/memberRepository";

export async function getRecipientCounts(): Promise<RecipientCounts> {
  const [{ currentMembers, earlierMembers }, optedOutEmailAddresses] =
    await Promise.all([findAudienceMembers(), findAllOptedOutEmailAddresses()]);

  const countFor = (value: AudienceFormValue) =>
    selectRecipientAddresses({
      audience: AUDIENCE_BY_FORM_VALUE[value],
      currentMembers,
      earlierMembers,
      optedOutEmailAddresses,
    }).length;

  return {
    all: countFor("all"),
    new: countFor("new"),
    returning: countFor("returning"),
    uoa: countFor("uoa"),
  };
}
