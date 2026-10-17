import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import updateMemberAction from "@/features/admin-members/updateMemberAction";
import { requireAdmin } from "@/lib/auth/session";
import { findMemberById } from "@/repositories/memberRepository";
import {
  MAX_LENGTHS,
  MAX_MAJORS,
  VALID_INVOLVEMENTS,
  VALID_PROGRAMME_TYPES,
  VALID_SKILL_LEVELS,
  VALID_YEARS_REMAINING,
  FACULTY_OPTIONS,
} from "@/domain/member/constants";
import { formatEnum } from "@/app/admin/members/utils";
import { AdminSelect } from "@/app/admin/_components/AdminSelect";
import {
  adminBackLinkClass,
  adminCardClass,
  adminCheckInputClass,
  adminChipClass,
  adminErrorClass,
  adminHintClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminSectionTitleClass,
} from "@/app/admin/_components/adminStyles";

const FORM_ID = "edit-member-form";

const errorMessages: Record<string, string> = {
  invalid_data: "Some of the submitted member details were invalid.",
  not_found: "The member could not be found.",
  duplicate: "That email is already used by another registration.",
  database: "The member could not be updated. Please try again.",
};

type EditMemberPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

async function submitMemberUpdate(formData: FormData) {
  "use server";

  const result = await updateMemberAction(formData);
  const rawId = formData.get("id");
  const memberId = typeof rawId === "string" ? Number(rawId) : NaN;

  if (Number.isInteger(memberId) && memberId > 0) {
    redirect(`/admin/members/${memberId}/edit?error=${result.error}`);
  }

  redirect("/admin/members?error=invalid_id");
}

/* Save/Cancel appear in the header and at the foot of the form; both target the form by id. */
function FormActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/admin/members" className={adminSecondaryButtonClass}>
        Cancel
      </Link>
      <button type="submit" form={FORM_ID} className={adminPrimaryButtonClass}>
        Save changes
      </button>
    </div>
  );
}

export default async function EditMemberPage({
  params,
  searchParams,
}: EditMemberPageProps) {
  await requireAdmin();

  // Read the [id] part of the URL.
  const { id } = await params;
  const { error } = await searchParams;
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

  // Returning members were not asked whether they are current UoA students,
  // so show both groups of fields when this value is unknown (null).
  const initialFieldView =
    member.isCurrentUoaStudent === true
      ? "uoa"
      : member.isCurrentUoaStudent === false
        ? "nonUoa"
        : "both";
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Link href="/admin/members" className={adminBackLinkClass}>
            <span aria-hidden>←</span> Members
          </Link>
          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Edit member
          </h1>
          <p className="mt-2 text-lg text-[var(--muted)]">
            {member.firstName} {member.lastName}
            <span className="mx-2" aria-hidden>
              ·
            </span>
            <span className="font-mono text-base">
              {member.registrationYear} registration
            </span>
          </p>
        </div>
        <FormActions />
      </div>

      {errorMessage && (
        <div className={`mt-8 ${adminErrorClass}`} role="alert">
          <strong>Unable to save changes:</strong> {errorMessage}
        </div>
      )}

      {/* flex gap, not space-y: it also spaces the cards inside the display:contents field selector. */}
      <form
        id={FORM_ID}
        action={submitMemberUpdate}
        className="mt-8 flex flex-col gap-6"
      >
        <input type="hidden" name="id" value={member.id} />

        <section
          className={adminCardClass}
          aria-labelledby="personal-details-heading"
        >
          <h2 id="personal-details-heading" className={adminSectionTitleClass}>
            Personal details
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className={adminLabelClass} htmlFor="firstName">
                First name
              </label>
              <input
                className={adminInputClass}
                id="firstName"
                name="firstName"
                type="text"
                defaultValue={member.firstName}
                maxLength={MAX_LENGTHS.firstName}
                required
              />
            </div>

            <div>
              <label className={adminLabelClass} htmlFor="lastName">
                Last name
              </label>
              <input
                className={adminInputClass}
                id="lastName"
                name="lastName"
                type="text"
                defaultValue={member.lastName}
                maxLength={MAX_LENGTHS.lastName}
                required
              />
            </div>

            <div>
              <label className={adminLabelClass} htmlFor="email">
                Email
              </label>
              <input
                className={`${adminInputClass} font-mono`}
                id="email"
                name="email"
                type="email"
                defaultValue={member.email}
                maxLength={MAX_LENGTHS.email}
                required
              />
            </div>

            <div>
              <label className={adminLabelClass} htmlFor="discordUsername">
                Discord username
              </label>
              <input
                className={`${adminInputClass} font-mono`}
                id="discordUsername"
                name="discordUsername"
                type="text"
                defaultValue={member.discordUsername ?? ""}
                maxLength={MAX_LENGTHS.discordUsername}
              />
            </div>
          </div>
        </section>

        {/* The radios below show/hide the UoA and non-UoA sections with CSS (see the <style> tag). */}
        <div className="member-field-selector contents">
          <section
            className={adminCardClass}
            aria-labelledby="student-details-heading"
          >
            <h2 id="student-details-heading" className={adminSectionTitleClass}>
              Student details
            </h2>
            <fieldset className="mt-6">
              <legend className={adminLabelClass}>Fields to show</legend>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    ["uoa", "UoA"],
                    ["nonUoa", "Non-UoA"],
                    ["both", "Both"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className={adminChipClass}>
                    <input
                      type="radio"
                      name="fieldView"
                      value={value}
                      defaultChecked={initialFieldView === value}
                      className={adminCheckInputClass}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div
              className="uoa-fields mt-8 border-t border-[var(--divider)] pt-8"
              role="group"
              aria-labelledby="uoa-information-heading"
            >
              <h3
                id="uoa-information-heading"
                className="text-xl font-black tracking-tight"
              >
                UoA information
              </h3>

              <fieldset className="mt-6">
                <legend className={adminLabelClass}>Faculty</legend>
                <p className={`-mt-1 mb-3 ${adminHintClass}`}>
                  Choose up to two.
                </p>
                <div className="flex flex-wrap gap-3">
                  {FACULTY_OPTIONS.map((faculty) => (
                    <label className={adminChipClass} key={faculty.value}>
                      <input
                        type="checkbox"
                        name="faculty"
                        value={faculty.value}
                        defaultChecked={member.faculty.includes(faculty.value)}
                        className={adminCheckInputClass}
                      />
                      {faculty.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <label className={adminLabelClass} htmlFor="programmeType">
                    Programme type
                  </label>
                  <AdminSelect
                    variant="field"
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
                  </AdminSelect>
                </div>

                <div>
                  <label className={adminLabelClass} htmlFor="yearsRemaining">
                    Years remaining
                  </label>
                  <AdminSelect
                    variant="field"
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
                  </AdminSelect>
                </div>
              </div>

              <fieldset className="mt-6">
                <legend className={adminLabelClass}>Majors</legend>
                <p className={`-mt-1 mb-3 ${adminHintClass}`}>
                  Add up to {MAX_MAJORS} majors or specialisations.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {Array.from({ length: MAX_MAJORS }).map((_, index) => (
                    <div key={index}>
                      <label className="sr-only" htmlFor={`major-${index}`}>
                        Major {index + 1}
                      </label>
                      <input
                        className={adminInputClass}
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
            </div>

            <div
              className="non-uoa-fields mt-8 border-t border-[var(--divider)] pt-8"
              role="group"
              aria-labelledby="non-uoa-information-heading"
            >
              <h3
                id="non-uoa-information-heading"
                className="text-xl font-black tracking-tight"
              >
                Non-UoA information
              </h3>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    className={adminLabelClass}
                    htmlFor="primaryAffiliation"
                  >
                    Primary affiliation
                  </label>
                  <input
                    className={adminInputClass}
                    id="primaryAffiliation"
                    name="primaryAffiliation"
                    type="text"
                    defaultValue={member.primaryAffiliation ?? ""}
                    maxLength={MAX_LENGTHS.primaryAffiliation}
                  />
                </div>

                <div>
                  <label className={adminLabelClass} htmlFor="nonUoaExcerpt">
                    Non-UoA excerpt
                  </label>
                  <textarea
                    className={`${adminInputClass} resize-y leading-relaxed`}
                    id="nonUoaExcerpt"
                    name="nonUoaExcerpt"
                    defaultValue={member.nonUoaExcerpt ?? ""}
                    maxLength={MAX_LENGTHS.nonUoaExcerpt}
                    rows={5}
                  />
                </div>

                <div>
                  <label className={adminLabelClass} htmlFor="nonUoaPitch">
                    Non-UoA pitch
                  </label>
                  <textarea
                    className={`${adminInputClass} resize-y leading-relaxed`}
                    id="nonUoaPitch"
                    name="nonUoaPitch"
                    defaultValue={member.nonUoaPitch ?? ""}
                    maxLength={MAX_LENGTHS.nonUoaPitch}
                    rows={5}
                  />
                </div>
              </div>
            </div>
          </section>

          <style>{`
            .member-field-selector:has(input[name="fieldView"][value="uoa"]:checked) .non-uoa-fields {
              display: none;
            }

            .member-field-selector:has(input[name="fieldView"][value="nonUoa"]:checked) .uoa-fields {
              display: none;
            }
          `}</style>
        </div>

        <section
          className={adminCardClass}
          aria-labelledby="involvement-heading"
        >
          <h2 id="involvement-heading" className={adminSectionTitleClass}>
            Linux &amp; involvement
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className={adminLabelClass} htmlFor="linuxSkillLevel">
                Linux skill level
              </label>
              <AdminSelect
                variant="field"
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
              </AdminSelect>
            </div>

            <fieldset>
              <legend className={adminLabelClass}>Potential involvement</legend>
              <div className="flex flex-wrap gap-3">
                {VALID_INVOLVEMENTS.map((involvement) => (
                  <label className={adminChipClass} key={involvement}>
                    <input
                      type="checkbox"
                      name="potentialInvolvement"
                      value={involvement}
                      defaultChecked={member.potentialInvolvement.includes(
                        involvement,
                      )}
                      className={adminCheckInputClass}
                    />
                    {formatEnum(involvement)}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <section
          className={adminCardClass}
          aria-labelledby="record-information-heading"
        >
          <h2
            id="record-information-heading"
            className={adminSectionTitleClass}
          >
            Record information
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className={adminHintClass}>Registration year</dt>
              <dd className="mt-1 font-mono">{member.registrationYear}</dd>
            </div>
            <div>
              <dt className={adminHintClass}>Created</dt>
              <dd className="mt-1 font-mono">
                <time dateTime={member.createdAt.toISOString()}>
                  {member.createdAt.toLocaleString("en-NZ")}
                </time>
              </dd>
            </div>
            <div>
              <dt className={adminHintClass}>Last updated</dt>
              <dd className="mt-1 font-mono">
                <time dateTime={member.updatedAt.toISOString()}>
                  {member.updatedAt.toLocaleString("en-NZ")}
                </time>
              </dd>
            </div>
          </dl>
        </section>

        <div className="flex justify-end border-t border-[var(--divider)] pt-6">
          <FormActions />
        </div>
      </form>
    </section>
  );
}
