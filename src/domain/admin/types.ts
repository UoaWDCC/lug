export type Role =
  | "PRESIDENT"
  | "VICE_PRESIDENT"
  | "SECRETARY"
  | "TREASURER"
  | "MEDIA";

export type Admin = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};
