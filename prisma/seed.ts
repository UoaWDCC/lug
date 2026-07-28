import "dotenv/config";
import { getPrisma } from "../src/lib/db/prisma";
import { hashPassword } from "../src/lib/auth/password";
import type { Role } from "../src/domain/admin/types";

import {
  LinuxSkillLevel,
  PotentialInvolvement,
  ProgrammeType,
} from "../src/generated/prisma/enums";

const registrationYear = new Date().getFullYear();

async function seedMembers() {
  const members = [
    {
      firstName: "John",
      lastName: "Doe",
      email: "abcd123@aucklanduni.ac.nz",
      registrationYear,
      isConditionalReturningMember: true,
      isCurrentUoaStudent: null,
      upi: "abcd123",
      studentId: "000000001",
      faculty: [],
      programmeType: ProgrammeType.MASTER,
      majors: ["Software Engineering", "Mathematics"],
      yearsRemaining: 1,
      primaryAffiliation: null,
      nonUoaExcerpt: null,
      nonUoaPitch: null,
      linuxSkillLevel: LinuxSkillLevel.REGULAR_USER,
      potentialInvolvement: [PotentialInvolvement.PROJECTS],
      discordUsername: "john_doe",
    },
    {
      firstName: "Jane",
      lastName: "Dough",
      email: "efg456@aucklanduni.ac.nz",
      registrationYear: registrationYear - 1,
      isConditionalReturningMember: false,
      isCurrentUoaStudent: true,
      upi: "efgh456",
      studentId: "000000002",
      faculty: ["science", "business"],
      programmeType: ProgrammeType.BACHELOR,
      majors: ["Computer Science", "Finance"],
      yearsRemaining: 2,
      primaryAffiliation: null,
      nonUoaExcerpt: null,
      nonUoaPitch: null,
      linuxSkillLevel: LinuxSkillLevel.NOTHING,
      potentialInvolvement: [
        PotentialInvolvement.ATTENDING,
        PotentialInvolvement.EXECUTIVE,
      ],
      discordUsername: "janedough",
    },
    {
      firstName: "Samantha",
      lastName: "Collins",
      email: "sam67@gmail.com",
      registrationYear,
      isConditionalReturningMember: false,
      isCurrentUoaStudent: false,
      upi: null,
      studentId: null,
      faculty: [],
      primaryAffiliation: "AUT",
      nonUoaExcerpt: "I am studying Computer Science at AUT.",
      nonUoaPitch: "I want to join because I love Linux.",
      linuxSkillLevel: LinuxSkillLevel.CONTRIBUTOR,
      potentialInvolvement: [
        PotentialInvolvement.ATTENDING,
        PotentialInvolvement.SPEAKING,
      ],
      discordUsername: "sam67",
    },
    {
      firstName: "JoJo",
      lastName: "Siwa",
      email: "jojo@hotmail.com",
      registrationYear,
      isConditionalReturningMember: false,
      isCurrentUoaStudent: false,
      upi: null,
      studentId: null,
      faculty: [],
      primaryAffiliation: "Massey University",
      nonUoaExcerpt: "currently doing postgrad at massey",
      nonUoaPitch:
        "I think joining the Linux User Group will give me good karma since my bad background came back like a boomerang. One of my exes was a member of the Linux User Group and I want to spice things up by joining as well. My guilty pleasure is learning new things, and learning about Linux will help me develop my talents. Starting a new genre of music was a dream but LUG has captured my heart and I can’t wait to connect with other members who might be the next dream guest on my podcast.",
      linuxSkillLevel: LinuxSkillLevel.CONTRIBUTOR,
      potentialInvolvement: [
        PotentialInvolvement.SPEAKING,
        PotentialInvolvement.EXECUTIVE,
      ],
      discordUsername: null,
    },
  ];

  for (const member of members) {
    await getPrisma().member.upsert({
      where: {
        email_registrationYear: {
          email: member.email,
          registrationYear: member.registrationYear,
        },
      },
      update: member,
      create: member,
    });
  }

  console.log(`Seeded ${members.length} member(s).`);
}

async function seedAdmins() {
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

async function main() {
  await seedMembers();
  await seedAdmins();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
