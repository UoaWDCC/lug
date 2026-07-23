import Link from "next/link";
import Image from "next/image";

export default function NavBar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 pt-6">
      <nav className="flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 justify-between items-center">
        {/* logo and wordmark */}
        <Link
          href="/"
          className="flex gap-2 items-center group"
          aria-label="LUG@UoA home"
        >
          {/* logo.svg's outer ring is fill=black, so it's invisible on the black
              bg and reads as 32/414 (7.73%) of transparent padding each side.
              Pull left by that much so the visible circle meets the content edge. */}
          <Image
            src="/logo.svg"
            alt="LUG@UoA emblem"
            width={64}
            height={64}
            priority
            className="h-14 w-auto sm:h-16 -ml-[4.3px] sm:-ml-[4.9px]"
          />
          <span className="font-sans font-bold text-white text-2xl sm:text-3xl tracking-tight transition-colors group-hover:text-[var(--color-accent)]">
            LUG@UoA
          </span>
        </Link>

      </nav>
    </header>
  );
}
