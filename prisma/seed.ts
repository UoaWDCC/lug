import { getPrisma } from "../src/lib/db/prisma";
import {
  LinuxSkillLevel,
  PotentialInvolvement,
  YearLevel,
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
      potentialInvolvement: [PotentialInvolvement.PROJECTS],
      discordUsername: "john_doe",
    },
    {
      firstName: "Jane",
      lastName: "Dough",
      email: "efg456@aucklanduni.ac.nz",
      isConditionalReturningMember: false,
      isCurrentUoaStudent: true,
      upi: "efgh456",
      studentId: "000000002",
      faculty: ["science", "business", "humanities"],
      programme: "Computer Science and Business Conjoint",
      yearLevel: YearLevel.SECOND_YEAR,
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
      isConditionalReturningMember: false,
      isCurrentUoaStudent: false,
      upi: null,
      studentId: null,
      faculty: [],
      programme: null,
      yearLevel: null,
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
      isConditionalReturningMember: false,
      isCurrentUoaStudent: false,
      upi: null,
      studentId: null,
      faculty: [],
      programme: null,
      yearLevel: null,
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
      where: { email: member.email },
      update: member,
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
