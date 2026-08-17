import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { findMemberById } from "@/repositories/memberRepository";
import {
  MAX_LENGTHS,
  MAX_MAJORS,
  VALID_INVOLVEMENTS,
  VALID_PROGRAMME_TYPES,
  VALID_SKILL_LEVELS,
  VALID_YEARS_REMAINING,
} from "@/domain/member/constants";
import { formatEnum } from "@/app/admin/members/utils";

const FACULTY_OPTIONS = [
  { value: "engineeringDesign", label: "Engineering & Design" },
  { value: "science", label: "Science" },
  { value: "artsEducation", label: "Arts & Education" },
  { value: "business", label: "Business School" },
  { value: "law", label: "Law" },
  { value: "medicalHealthScience", label: "Medical & Health Sciences" },
  { value: "liggins", label: "Liggins Institute" },
  { value: "bioengineering", label: "Bioengineering Institute" },
] as const;

const inputClassName =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

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
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Edit Member Details: {member.firstName} {member.lastName}
      </h1>

      <form className="mt-6 grid gap-6 md:grid-cols-2">
        <input type="hidden" name="id" value={member.id} />

        <div>
          <label className="block text-sm font-medium" htmlFor="firstName">
            First name
          </label>
          <input
            className={inputClassName}
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={member.firstName}
            maxLength={MAX_LENGTHS.firstName}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="lastName">
            Last name
          </label>
          <input
            className={inputClassName}
            id="lastName"
            name="lastName"
            type="text"
            defaultValue={member.lastName}
            maxLength={MAX_LENGTHS.lastName}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            className={inputClassName}
            id="email"
            name="email"
            type="email"
            defaultValue={member.email}
            maxLength={MAX_LENGTHS.email}
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium"
            htmlFor="discordUsername"
          >
            Discord username
          </label>
          <input
            className={inputClassName}
            id="discordUsername"
            name="discordUsername"
            type="text"
            defaultValue={member.discordUsername ?? ""}
            maxLength={MAX_LENGTHS.discordUsername}
          />
        </div>

        <fieldset className="rounded-md border border-gray-200 p-4">
          <legend className="px-1 text-sm font-medium">Faculty</legend>
          <p className="mb-3 text-sm text-gray-600">Choose up to two.</p>
          <div className="space-y-2">
            {FACULTY_OPTIONS.map((faculty) => (
              <label className="flex items-center gap-2" key={faculty.value}>
                <input
                  type="checkbox"
                  name="faculty"
                  value={faculty.value}
                  defaultChecked={member.faculty.includes(faculty.value)}
                />
                {faculty.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium"
              htmlFor="programmeType"
            >
              Programme type
            </label>
            <select
              className={inputClassName}
              id="programmeType"
              name="programmeType"
              defaultValue={member.programmeType ?? ""}
            >
              <option value="">Not specified</option>
              {VALID_PROGRAMME_TYPES.map((programmeType) => (
                <option key={programmeType} value={programmeType}>
                  {formatEnum(programmeType)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium"
              htmlFor="yearsRemaining"
            >
              Years remaining
            </label>
            <select
              className={inputClassName}
              id="yearsRemaining"
              name="yearsRemaining"
              defaultValue={member.yearsRemaining ?? ""}
            >
              <option value="">Not specified</option>
              {VALID_YEARS_REMAINING.map((years) => (
                <option key={years} value={years}>
                  {years === 0
                    ? "Less than 1"
                    : years === 5
                      ? "More than 4"
                      : years}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">Majors</legend>
          <p className="mb-3 text-sm text-gray-600">
            Add up to {MAX_MAJORS} majors or specialisations.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: MAX_MAJORS }).map((_, index) => (
              <div key={index}>
                <label className="sr-only" htmlFor={`major-${index}`}>
                  Major {index + 1}
                </label>
                <input
                  className={inputClassName}
                  id={`major-${index}`}
                  name="majors"
                  type="text"
                  defaultValue={member.majors[index] ?? ""}
                  maxLength={MAX_LENGTHS.major}
                  placeholder={`Major ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            className="block text-sm font-medium"
            htmlFor="linuxSkillLevel"
          >
            Linux skill level
          </label>
          <select
            className={inputClassName}
            id="linuxSkillLevel"
            name="linuxSkillLevel"
            defaultValue={member.linuxSkillLevel}
            required
          >
            {VALID_SKILL_LEVELS.map((skillLevel) => (
              <option key={skillLevel} value={skillLevel}>
                {formatEnum(skillLevel)}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="rounded-md border border-gray-200 p-4">
          <legend className="px-1 text-sm font-medium">
            Potential involvement
          </legend>
          <div className="space-y-2">
            {VALID_INVOLVEMENTS.map((involvement) => (
              <label className="flex items-center gap-2" key={involvement}>
                <input
                  type="checkbox"
                  name="potentialInvolvement"
                  value={involvement}
                  defaultChecked={member.potentialInvolvement.includes(
                    involvement,
                  )}
                />
                {formatEnum(involvement)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="md:col-span-2">
          <label
            className="block text-sm font-medium"
            htmlFor="primaryAffiliation"
          >
            Primary affiliation
          </label>
          <input
            className={inputClassName}
            id="primaryAffiliation"
            name="primaryAffiliation"
            type="text"
            defaultValue={member.primaryAffiliation ?? ""}
            maxLength={MAX_LENGTHS.primaryAffiliation}
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="nonUoaExcerpt">
            Non-UoA excerpt
          </label>
          <textarea
            className={inputClassName}
            id="nonUoaExcerpt"
            name="nonUoaExcerpt"
            defaultValue={member.nonUoaExcerpt ?? ""}
            maxLength={MAX_LENGTHS.nonUoaExcerpt}
            rows={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="nonUoaPitch">
            Non-UoA pitch
          </label>
          <textarea
            className={inputClassName}
            id="nonUoaPitch"
            name="nonUoaPitch"
            defaultValue={member.nonUoaPitch ?? ""}
            maxLength={MAX_LENGTHS.nonUoaPitch}
            rows={5}
          />
        </div>

        <section
          className="rounded-md bg-gray-50 p-4 md:col-span-2"
          aria-labelledby="record-information-heading"
        >
          <h2 className="font-semibold" id="record-information-heading">
            Record information
          </h2>
          <dl className="mt-3 grid gap-3 text-sm md:grid-cols-3">
            <div>
              <dt className="font-medium text-gray-600">Registration year</dt>
              <dd>{member.registrationYear}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Created</dt>
              <dd>
                <time dateTime={member.createdAt.toISOString()}>
                  {member.createdAt.toLocaleString("en-NZ")}
                </time>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Last updated</dt>
              <dd>
                <time dateTime={member.updatedAt.toISOString()}>
                  {member.updatedAt.toLocaleString("en-NZ")}
                </time>
              </dd>
            </div>
          </dl>
        </section>

        <div className="md:col-span-2">
          <button
            className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
            type="submit"
          >
            Save changes
          </button>
        </div>
      </form>
    </section>
  );
}
