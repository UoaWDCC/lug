// Enough for someone to recognise their own address without showing it in full,
// e.g. "samir@example.com" → "s***@example.com"
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return "***";
  return `${email[0]}***${email.slice(at)}`;
}
