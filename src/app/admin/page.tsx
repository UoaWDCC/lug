import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { countBlogPosts } from "@/repositories/blogPostRepository";
import {
  countMembers,
  countUoaStudentMembers,
} from "@/repositories/memberRepository";

/* Outline icons drawn on a 24px grid (Lucide shapes, ISC licence); stroke follows currentColor. */
const iconPaths = {
  members: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  blog: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  email: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
};

const links = [
  {
    href: "/admin/members",
    label: "View members",
    description: "Browse registered members and their details.",
    icon: iconPaths.members,
  },
  {
    href: "/admin/blog",
    label: "Manage blog posts",
    description: "See published posts and draft new ones.",
    icon: iconPaths.blog,
  },
  {
    href: "/admin/emails",
    label: "Send email to mailing list",
    description: "Compose and send an email to all members.",
    icon: iconPaths.email,
  },
];

const cardClass =
  "rounded-2xl border border-[var(--input-border)] bg-[var(--card-bg)] p-5 sm:p-6";

export default async function AdminPage() {
  await requireAdmin();

  const [memberCount, blogPostCount, uoaStudentCount] = await Promise.all([
    countMembers(),
    countBlogPosts(),
    countUoaStudentMembers(),
  ]);

  const stats = [
    { label: "Registered members", value: memberCount },
    { label: "Blog posts", value: blogPostCount },
    { label: "UoA students", value: uoaStudentCount },
  ];

  return (
    <section className="mx-auto max-w-6xl">
      <p className="font-mono text-base text-[var(--muted)]">
        $ admin --dashboard
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Dashboard</h1>
      <p className="mt-2 text-[var(--muted)]">
        Tools for LUG@UoA club executives.
      </p>

      <dl className="mt-8 grid gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className={cardClass}>
            <dt className="text-[var(--muted)]">{stat.label}</dt>
            <dd className="mt-1 font-mono text-4xl font-semibold text-[var(--accent-text)]">
              {stat.value.toLocaleString("en-NZ")}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="mt-8 grid gap-5 sm:grid-cols-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`${cardClass} block h-full text-[var(--fg)] no-underline transition-colors duration-150 hover:border-[var(--accent)] hover:bg-[var(--row-hover-bg)] hover:text-[var(--fg)]`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--input-border)] bg-[var(--chip-hover-bg)] text-[var(--accent-text)]">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  {link.icon}
                </svg>
              </span>
              <span className="mt-4 block font-mono text-lg font-semibold">
                {link.label}
              </span>
              <span className="mt-1 block text-[var(--muted)]">
                {link.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
