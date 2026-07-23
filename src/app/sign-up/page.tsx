import Image from "next/image";

export default function SignUp() {
  return (
    <section className="relative h-full w-full overflow-hidden">
      {/* Same background as homepage */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"
      />

      {/* Centered card */}
      <div className="relative z-10 flex items-center justify-center h-full px-4 py-8">
        <div className="fade-up fade-up-1 w-full max-w-lg">
        <div className="bg-black/90 border border-white/50 rounded-3xl px-8 py-10 sm:px-12">

          {/* Step progress */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-[var(--color-accent)]" />
              <div className="w-20 h-px bg-white/20" />
              <div className="w-4 h-4 rounded-full bg-white/25" />
              <div className="w-20 h-px bg-white/20" />
              <div className="w-4 h-4 rounded-full bg-white/25" />
              <div className="w-20 h-px bg-white/20" />
              <div className="w-4 h-4 rounded-full bg-white/25" />
            </div>
            <p className="font-mono text-white/50 text-sm mt-1">Step 1 out of 4</p>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.svg"
              alt="LUG@UoA logo"
              width={180}
              height={180}
              className="h-44 w-auto"
            />
          </div>

          {/* Heading */}
          <h1 className="font-sans font-black text-white text-3xl sm:text-4xl text-center mb-4 tracking-tight">
            Join LUG@UoA
          </h1>

          {/* Description */}
          <p className="font-mono text-white/55 text-base text-center leading-relaxed mb-8">
            A club where we build, share, and talk about Linux, the free and open source operating system.
          </p>

          {/* Email field */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block font-sans font-bold text-white text-base mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full bg-black/60 border border-white/25 rounded-lg px-4 py-3 text-white font-mono text-sm placeholder-transparent focus:outline-none focus:border-[var(--color-accent)] transition-colors duration-200"
            />
          </div>

          {/* Continue button — placeholder, no action yet */}
          <button
            type="button"
            className="w-full bg-[var(--color-accent)] text-black font-sans font-bold text-lg py-4 rounded-lg mt-2 mb-5 hover:brightness-110 active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            Continue
          </button>

          {/* Helper text */}
          <p className="font-sans font-bold text-white/70 text-sm text-center">
            We&apos;ll check if you&apos;ve joined LUG before to speed things up
          </p>

        </div>
        </div>
      </div>
    </section>
  );
}
