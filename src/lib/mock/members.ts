export type MemberRow = {
  firstName: string;
  lastName: string;
  email: string;
  linuxSkillLevel: string;
  joinedAt: string;
};

export async function getMockMembers(): Promise<MemberRow[]> {
  return [
    {
      firstName: "Ava",
      lastName: "Nguyen",
      email: "ava.nguyen@aucklanduni.ac.nz",
      linuxSkillLevel: "REGULAR_USER",
      joinedAt: "2026-03-12",
    },
    {
      firstName: "Liam",
      lastName: "Patel",
      email: "liam.patel@aucklanduni.ac.nz",
      linuxSkillLevel: "BEGINNER_USER",
      joinedAt: "2026-03-15",
    },
    {
      firstName: "Sophie",
      lastName: "Chen",
      email: "sophie.chen@aucklanduni.ac.nz",
      linuxSkillLevel: "POWER_USER",
      joinedAt: "2026-04-02",
    },
    {
      firstName: "Marcus",
      lastName: "Tane",
      email: "marcus.tane@gmail.com",
      linuxSkillLevel: "AWARE_OF_EXISTENCE",
      joinedAt: "2026-04-18",
    },
    {
      firstName: "Priya",
      lastName: "Singh",
      email: "priya.singh@aucklanduni.ac.nz",
      linuxSkillLevel: "CONTRIBUTOR",
      joinedAt: "2026-05-01",
    },
  ];
}
