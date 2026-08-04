import { cookies } from "next/headers";

import { StartPage } from "./_pages/StartPage";
import { ReturningUoaPage } from "./_pages/ReturningUoaPage";
import { NewMemberPage } from "./_pages/NewMemberPage";
import { NewUoaPage } from "./_pages/NewUoaPage";
import { NewNonUoaPage } from "./_pages/NewNonUoaPage";
import { FinalPage } from "./_pages/FinalPage";
import { RegistrationForm } from "./RegistrationForm";
import { readRegistrationDraft } from "./utils";
import { getStepProgress } from "./_components/steps";

export default async function FormPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("formState")?.value;
  const draft = readRegistrationDraft(raw);
  const { page = "start" } = draft;

  return (
    <main className="relative z-10 flex min-h-0 flex-1 items-start justify-center overflow-y-auto px-5 pt-2 pb-10">
      <div className="w-full max-w-[480px] rounded-[18px] border border-[var(--accent)] bg-[var(--card-bg)] p-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <RegistrationForm
          currentPage={page}
          step={getStepProgress(page, draft)}
        >
          {page === "start" && <StartPage fields={draft} />}
          {page === "returningUoa" && <ReturningUoaPage fields={draft} />}
          {page === "newMember" && <NewMemberPage fields={draft} />}
          {page === "newUoa" && <NewUoaPage fields={draft} />}
          {page === "newNonUoa" && <NewNonUoaPage fields={draft} />}
          {page === "final" && <FinalPage fields={draft} />}
        </RegistrationForm>
      </div>
    </main>
  );
}
