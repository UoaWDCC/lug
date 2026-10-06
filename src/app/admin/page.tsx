import Link from "next/link";

const links = [
  {
    href: "/admin/members",
    label: "View members",
    description: "Browse registered members and their details.",
  },
  {
    href: "/admin/blog",
    label: "Manage blog posts",
    description: "See published posts and draft new ones.",
  },
  {
    href: "/admin/emails",
    label: "Send email to mailing list",
    description: "Compose and send an email to all members.",
  },
];

export default function AdminPage() {
  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-gray-600">Tools for club executives.</p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-lg border border-gray-200 p-4 transition hover:border-gray-400 hover:bg-gray-50"
            >
              <span className="block text-base font-semibold">
                {link.label}
              </span>
              <span className="mt-1 block text-sm text-gray-600">
                {link.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
