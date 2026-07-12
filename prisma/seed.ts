import "dotenv/config";
import { getPrisma } from "../src/lib/db/prisma";
import { hashPassword } from "../src/lib/auth/password";
import type { Role } from "../src/domain/admin/types";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const firstName = process.env.SEED_ADMIN_FIRST_NAME ?? "Admin";
  const lastName = process.env.SEED_ADMIN_LAST_NAME ?? "User";
  const role = (process.env.SEED_ADMIN_ROLE ?? "PRESIDENT") as Role;

  if (!email || !password) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before seeding.",
    );
  }

  const passwordHash = await hashPassword(password);

  await getPrisma().admin.upsert({
    where: { email },
    update: { passwordHash, firstName, lastName, role },
    create: { email, passwordHash, firstName, lastName, role },
  });

  console.log(`Seeded admin: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
