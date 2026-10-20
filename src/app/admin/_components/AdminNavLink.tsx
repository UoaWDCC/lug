"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = React.ComponentProps<typeof Link> & {
  href: string;
  /** Match only this exact path, not its children (used for the dashboard). */
  exact?: boolean;
};

/* The layout persists across navigations, so the active state has to come from the client.
   usePathname also runs during SSR, so the right link is marked without JS.
   Style the active state with aria-[current=page]: variants. */
export function AdminNavLink({ href, exact = false, ...rest }: Props) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} aria-current={isActive ? "page" : undefined} {...rest} />
  );
}
