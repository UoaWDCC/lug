import Link from "next/link";

export default function SuccessPage() {
  return (
    <section className="max-w-2xl">
      <h1>You&apos;re registered!</h1>
      <p className="mb-6">
        Thanks for signing up for LUG@UoA, this is a placeholder success page!
      </p>

      <Link href="/" className="underline">
        Back to home
      </Link>
    </section>
  );
}
