import { getPrisma } from "../src/lib/db/prisma";
import {
  LinuxSkillLevel,
  PotentialInvolvement,
} from "../src/generated/prisma/enums";

async function seedMembers() {
  const members = [
    {
      firstName: "John",
      lastName: "Doe",
      email: "abcd123@aucklanduni.ac.nz",
      isConditionalReturningMember: true,
      isCurrentUoaStudent: null,
      upi: "abcd123",
      studentId: "000000001",
      faculty: [],
      programme: null,
      yearLevel: null,
      primaryAffiliation: null,
      nonUoaExcerpt: null,
      nonUoaPitch: null,
      linuxSkillLevel: LinuxSkillLevel.REGULAR_USER,
      potentialInvolvement: [
        PotentialInvolvement.ATTENDING,
        PotentialInvolvement.PROJECTS,
      ],
      discordUsername: "john_doe",
    },
    {
      firstName: "Jane",
      lastName: "Dough",
      email: "efg456@aucklanduni.ac.nz",
      isConditionalReturningMember: false,
      isCurrentUoaStudent: true,
      upi: "ef456",
      studentId: "000000002",
      faculty: ["science", "business"],
      programme: "Computer Science and Business Conjoint",
      yearLevel: "SECOND_YEAR",
      primaryAffiliation: null,
      nonUoaExcerpt: null,
      nonUoaPitch: null,
      linuxSkillLevel: LinuxSkillLevel.NOTHING,
      potentialInvolvement: [],
      discordUsername: "janedough",
    },
    {
      firstName: "Samantha",
      lastName: "Collins",
      email: "sam67@gmail.com",
      isConditionalReturningMember: false,
      isCurrentUoaStudent: false,
      upi: null,
      studentId: null,
      faculty: [],
      programme: null,
      yearLevel: null,
      primaryAffiliation: "AuT",
      nonUoaExcerpt: "i am studying at AuT and love linux very much",
      nonUoaPitch: "i am the youngest person ever",
      linuxSkillLevel: LinuxSkillLevel.CONTRIBUTOR,
      potentialInvolvement: [
        PotentialInvolvement.ATTENDING,
        PotentialInvolvement.SPEAKING,
      ],
      discordUsername: "sam67",
    },
  ];

  for (const member of members) {
    await getPrisma().member.upsert({
      where: { email: member.email },
      update: {},
      create: member,
    });
  }

  console.log(`Seeded ${members.length} member(s).`);
}

async function main() {
  await seedMembers();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
