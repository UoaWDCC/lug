import { getMockMembers } from "@/lib/mock/members";

async function sendEmail(formData: FormData) {
  "use server";
  // TODO: Fix with real mailing list later
  const email = {
    subject: formData.get("subject"),
    body: formData.get("body"),
  };
  console.log("mailing list send", email);
}

const inputClass =
  "block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none";
const labelClass = "block text-sm font-medium mb-1";

export default async function AdminEmailsPage() {
  const members = await getMockMembers();

  return (
    <section className="py-8 max-w-xl">
      <h1 className="text-3xl font-bold tracking-tight">Send email</h1>
      <p className="mt-1 text-sm text-gray-600">
        <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
          {members.length} recipients
        </span>{" "}
        will receive this.
      </p>

      <form action={sendEmail} className="mt-6 space-y-4">
        <div>
          <label htmlFor="subject" className={labelClass}>
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="body" className={labelClass}>
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={8}
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Send to mailing list
        </button>
      </form>
    </section>
  );
}
