import Link from "next/link";
import Image from "next/image";

import ThemeToggle from "@/components/theme/ThemeToggle";

export default function NavBar() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1848px] items-center justify-between gap-5 px-[35.2px] py-5">
      <Link
        href="/"
        aria-label="LUG@UoA home"
        className="flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-70 active:opacity-55"
      >
        <Image
          src="/logo.svg"
          alt="LUG@UoA penguin logo"
          width={62}
          height={62}
          priority
          className="h-[62px] w-[62px] shrink-0 rounded-full"
        />
        <span className="font-sans text-3xl font-black tracking-[-0.3px] text-[var(--fg)]">
          LUG@UoA
        </span>
      </Link>

      <ThemeToggle />
    </header>
  );
}
