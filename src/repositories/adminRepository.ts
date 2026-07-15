import { getPrisma } from "@/lib/db/prisma";
import type { Admin, Role } from "@/domain/admin/types";

type AdminRecord = {
  id: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

function toAdmin(record: Omit<AdminRecord, "passwordHash">): Admin {
  return {
    id: record.id,
    email: record.email,
    firstName: record.firstName,
    lastName: record.lastName,
    role: record.role,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function findAdminByEmail(
  email: string,
): Promise<AdminRecord | null> {
  return getPrisma().admin.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function findAdminById(id: number): Promise<Admin | null> {
  const record = await getPrisma().admin.findUnique({ where: { id } });
  if (!record) return null;
  const { passwordHash: _, ...admin } = record;
  return toAdmin(admin);
}
