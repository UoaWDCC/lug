import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { findMemberById } from "@/repositories/memberRepository";

type EditMemberPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  await requireAdmin();

  // Read the [id] part of the URL.
  const { id } = await params;
  const memberId = Number(id);

  // Display a 404 page for invalid ID
  if (!Number.isInteger(memberId) || memberId <= 0) {
    notFound();
  }

  // Retrieve this member from the database.
  const member = await findMemberById(memberId);

  // Display a 404 page if the member does not exist.
  if (!member) {
    notFound();
  }

  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Edit {member.firstName} {member.lastName}
      </h1>

      <form className="mt-6">
        <div>
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={member.firstName}
          />
        </div>

        <div>
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            defaultValue={member.lastName}
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={member.email}
          />
        </div>

        <button type="submit">Save changes</button>
      </form>
    </section>
  );
}
