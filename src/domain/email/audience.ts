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

export function selectRecipients({
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

  const recipients = new Set<string>();
  for (const member of currentMembers) {
    const email = normaliseEmail(member.email);
    if (optedOut.has(email) || recipients.has(email)) continue;
    if (matchesAudience(audience, member, isReturning)) recipients.add(email);
  }
  return [...recipients];
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
