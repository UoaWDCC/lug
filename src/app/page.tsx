import Link from "next/link";

/* home hero with terminal menu */
export default function Home() {
  return (
    <section
      aria-label="Hero"
      className="relative h-full w-full overflow-hidden"
    >
      {/* Background art */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.png')" }}
      />

      {/* Dark fade left so text stays readable */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent"
      />
      {/* Bottom fade blends into footer */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"
      />

      {/* Content column */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-32 sm:pt-36 pb-24">
        <div className="max-w-2xl">

          {/* subheading */}
          <div className="fade-up fade-up-1">
            <p className="shimmer-accent font-mono text-xl sm:text-2xl">
              University of Auckland
            </p>
          </div>

          {/* heading */}
          <div className="fade-up fade-up-2 mt-4">
            <h1 className="font-mono font-bold text-white text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight">
              Linux Users
              <br />
              Group
            </h1>
          </div>

          {/* description */}
          <div className="fade-up fade-up-3 mt-6">
            <p className="text-white/90 text-base sm:text-lg max-w-md leading-relaxed">
              A club where we build, share, and talk about Linux, the free and
              open source operating system.
            </p>
          </div>

          {/* terminal menu */}
          <div className="fade-up fade-up-4 mt-10 max-w-xl">
            <div className="rounded-md border border-white/70 bg-black/85 backdrop-blur-sm overflow-hidden">
              {/* title bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/30 text-white text-sm">
                <span className="font-mono">lug@uoa:~</span>
                <span className="font-mono tracking-widest select-none flex items-center gap-2" aria-hidden>
                  <span className="text-lg leading-none">—</span>
                  <span className="text-lg leading-none">□</span>
                  <span className="text-2xl leading-none">×</span>
                </span>
              </div>

              {/* body */}
              <div className="p-4 sm:p-5">
                <p className="font-mono text-white font-bold mb-3">
                  Welcome to LUG@UoA!
                </p>

                <nav aria-label="Main menu" className="flex flex-col gap-2.5">
                  <Link href="/sign-up" className="term-btn font-mono">
                    <span>1. sign-up</span>
                    <span className="text-sm opacity-90">Join LUG@UoA</span>
                    <span aria-hidden className="term-btn-arrow">→</span>
                  </Link>
                  <Link href="/about" className="term-btn font-mono">
                    <span>2. about-us</span>
                    <span className="text-sm opacity-90">What does LUG do?</span>
                    <span aria-hidden className="term-btn-arrow">→</span>
                  </Link>
                  <Link href="/events" className="term-btn font-mono">
                    <span>3. our-events</span>
                    <span className="text-sm opacity-90">What&apos;s coming up?</span>
                    <span aria-hidden className="term-btn-arrow">→</span>
                  </Link>
                </nav>
              </div>

              {/* prompt line */}
              <div className="px-3 py-2 border-t border-white/30 font-mono text-white text-sm">
                <span>lug@uoa:~$</span>
                <span className="cursor-blink" aria-hidden />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
