import Image from "next/image";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { AdminNavLink } from "./AdminNavLink";

const navItems = [
  { href: "/admin/members", label: "Members" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/emails", label: "Emails" },
];

/* Shared by the brand block and the section links; both show the same pill when active. */
const pillClass =
  "rounded-lg border border-transparent no-underline transition-colors duration-150 aria-[current=page]:border-[var(--input-border)] aria-[current=page]:bg-[var(--chip-hover-bg)]";

type Props = {
  adminName: string;
  logoutAction: () => Promise<void>;
};

export function AdminHeader({ adminName, logoutAction }: Props) {
  return (
    <header className="border-b border-[var(--divider)] bg-[var(--card-bg)]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3 sm:gap-x-8 sm:px-14">
        <AdminNavLink
          href="/admin"
          exact
          aria-label="Admin dashboard"
          className={`group -ml-3 flex items-center gap-2.5 px-3 py-2 text-[var(--fg)] hover:text-[var(--fg)] aria-[current=page]:text-[var(--accent-text)] sm:gap-3 ${pillClass}`}
        >
          <Image
            src="/logo.svg"
            alt=""
            width={40}
            height={40}
            priority
            className="h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10"
          />
          <span className="font-sans text-xl font-black tracking-[-0.3px] sm:text-2xl">
            LUG@UoA
          </span>
          <span className="rounded-md border border-[var(--divider)] bg-[var(--chip-bg)] px-2 py-0.5 max-sm:hidden font-mono text-xs font-medium tracking-wider text-[var(--muted)] group-aria-[current=page]:border-[var(--input-border)] group-aria-[current=page]:text-[var(--accent-text)]">
            ADMIN
          </span>
        </AdminNavLink>

        <nav
          aria-label="Admin sections"
          className="order-last w-full md:order-none md:w-auto md:flex-1"
        >
          <ul className="flex gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <AdminNavLink
                  href={item.href}
                  className={`block px-5 py-2.5 font-mono text-lg text-[var(--muted)] hover:text-[var(--fg)] aria-[current=page]:text-[var(--accent-text)] ${pillClass}`}
                >
                  {item.label}
                </AdminNavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <span className="hidden text-lg text-[var(--muted)] sm:inline">
            {adminName}
          </span>
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[var(--input-border)] bg-transparent px-3.5 py-2 font-mono text-base text-[var(--fg)] transition-colors duration-150 hover:border-[var(--accent)] hover:bg-[var(--row-hover-bg)] sm:px-5"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
