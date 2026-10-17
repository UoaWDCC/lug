import { cookies } from "next/headers";

import NavBar from "@/components/layout/NavBar";
import TerminalDock from "@/components/terminal/TerminalDock";
import TerminalProvider from "@/components/terminal/TerminalProvider";
import { SIDEBAR_COOKIE } from "@/components/terminal/commands";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarCollapsed =
    cookieStore.get(SIDEBAR_COOKIE)?.value === "collapsed";

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <div aria-hidden className="hero-layer hero-layer--dark z-0" />
      <div aria-hidden className="hero-layer hero-layer--light z-0" />

      <TerminalProvider initialSidebarCollapsed={sidebarCollapsed}>
        <NavBar />
        {children}
        <TerminalDock />
      </TerminalProvider>
    </div>
  );
}
