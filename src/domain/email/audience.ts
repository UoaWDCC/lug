// This file contains the business logic for selecting recipient email addresses
// Selection is based on intended audience, ignoring opted out addresses

import type { AudienceMember, EmailAudience } from "./types";

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

type SelectRecipientsInput = {
  audience: EmailAudience;
  currentMembers: readonly AudienceMember[];
  earlierMembers: readonly AudienceMember[];
  optedOutEmailAddresses: readonly string[];
};

export function selectRecipientAddresses({
  audience,
  currentMembers,
  earlierMembers,
  optedOutEmailAddresses,
}: SelectRecipientsInput): string[] {
  const earlierEmails = new Set(
    earlierMembers.map((member) => normaliseEmail(member.email)),
  );
  const earlierStudentKeys = new Set(earlierMembers.flatMap(studentKey));
  const optedOut = new Set(optedOutEmailAddresses.map(normaliseEmail));

  const isReturning = (member: AudienceMember) =>
    earlierEmails.has(normaliseEmail(member.email)) ||
    studentKey(member).some((key) => earlierStudentKeys.has(key));

  // Track email addresses added to recipient set
  const addresses = new Set<string>();

  // Loop over current LUG members
  for (const member of currentMembers) {
    const email = normaliseEmail(member.email);

    // Skip opted-out email addresses and those already in recipient set
    if (optedOut.has(email) || addresses.has(email)) continue;

    // Add email address if its member is in the intended audience
    if (matchesAudience(audience, member, isReturning)) addresses.add(email);
  }
  return [...addresses];
}

function matchesAudience(
  audience: EmailAudience,
  member: AudienceMember,
  isReturning: (member: AudienceMember) => boolean,
): boolean {
  switch (audience) {
    case "ALL":
      return true;
    case "UOA_STUDENTS":
      return member.isCurrentUoaStudent;
    case "RETURNING":
      return isReturning(member);
    case "NEW":
      return !isReturning(member);
  }
}

function studentKey(member: AudienceMember): string[] {
  const upi = member.upi?.trim();
  const studentId = member.studentId?.trim();
  return upi && studentId ? [`${upi}:${studentId}`] : [];
}
