export const ROLES = [
  "PRESIDENT",
  "VICE_PRESIDENT",
  "SECRETARY",
  "TREASURER",
  "MEDIA",
] as const;

export type Role = (typeof ROLES)[number];

export type Admin = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};
