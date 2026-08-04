import Link from "next/link";
import Image from "next/image";

import ThemeToggle from "@/components/theme/ThemeToggle";

export default function NavBar() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-7 py-[18px]">
      <Link
        href="/"
        aria-label="LUG@UoA home"
        className="flex items-center gap-3 transition-opacity duration-150 hover:opacity-70 active:opacity-55"
      >
        <Image
          src="/logo.svg"
          alt="LUG@UoA penguin logo"
          width={44}
          height={44}
          priority
          className="h-11 w-11 shrink-0 rounded-full"
        />
        <span className="font-sans text-xl font-black tracking-[-0.3px] text-[var(--fg)]">
          LUG@UoA
        </span>
      </Link>

      <ThemeToggle />
    </header>
  );
}
