import NavBar from "@/components/layout/NavBar";
import TerminalDock from "@/components/terminal/TerminalDock";
import TerminalProvider from "@/components/terminal/TerminalProvider";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <div aria-hidden className="hero-layer hero-layer--dark z-0" />
      <div aria-hidden className="hero-layer hero-layer--light z-0" />

      <TerminalProvider>
        <NavBar />
        {children}
        <TerminalDock />
      </TerminalProvider>
    </div>
  );
}
