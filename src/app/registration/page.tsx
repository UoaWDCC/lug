import { cookies } from "next/headers";

import { StartPage } from "./pages/StartPage";
import { ReturningUoaPage } from "./pages/ReturningUoaPage";
import { NewMemberPage } from "./pages/NewMemberPage";
import { NewUoaPage } from "./pages/NewUoaPage";
import { NewNonUoaPage } from "./pages/NewNonUoaPage";
import { FinalPage } from "./pages/FinalPage";
import { RegistrationForm } from "./RegistrationForm";
import { readRegistrationDraft } from "./utils";

export default async function FormPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("formState")?.value;
  const draft = readRegistrationDraft(raw);
  const { page = "start" } = draft;

  return (
    <section className="max-w-2xl border-2 border-green-500">
      <h1>LUG@UoA Member Registration Form 2026</h1>
      <p className="mb-6">{`Thank you for registering your interest to become a member of the
          University of Auckland Linux User Group (also known as LUG@UoA)! It's
          great to have you with us. The details collected in this form will be
          used for record-keeping purposes as mandated by Student Groups and to
          send you relevant communication about the user group, as well as to
          identify areas of interest for the club. We will not otherwise use or
          transfer your information. You can modify or withdraw your response by
          contacting lug.aucklanduni@gmail.com.`}</p>

      <RegistrationForm currentPage={page}>
        {page === "start" && <StartPage fields={draft} />}
        {page === "returningUoa" && <ReturningUoaPage fields={draft} />}
        {page === "newMember" && <NewMemberPage fields={draft} />}
        {page === "newUoa" && <NewUoaPage fields={draft} />}
        {page === "newNonUoa" && <NewNonUoaPage fields={draft} />}
        {page === "final" && <FinalPage fields={draft} />}
      </RegistrationForm>
    </section>
  );
}
