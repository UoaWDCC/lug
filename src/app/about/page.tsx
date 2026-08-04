import Link from "next/link";

import {
  accentButtonClass,
  ghostButtonClass,
  scrollableMainClass,
} from "@/components/primitive/buttonStyles";

const PILLARS = [
  {
    title: "Build",
    desc: "Ship projects, contribute to open source, and tinker with your own setup.",
  },
  {
    title: "Share",
    desc: "Workshops and talks, beginner basics through to deep kernel dives.",
  },
  {
    title: "Talk",
    desc: "A friendly Discord for questions, memes, and late-night troubleshooting.",
  },
];

export default function About() {
  return (
    <main className={scrollableMainClass}>
      <div className="mx-auto max-w-[900px]">
        <div className="mb-1.5 font-mono text-sm text-[var(--accent-text)]">
          $ cat about-us.md
        </div>

        <h1 className="m-0 mb-3.5 text-[clamp(30px,4.5vw,46px)] font-black tracking-[-1px]">
          What does LUG do?
        </h1>

        <p className="m-0 mb-8 max-w-[620px] text-base leading-[1.6] text-[var(--muted)]">
          We&apos;re a student-run community for anyone curious about Linux and
          open source, from your very first terminal command to your first
          kernel patch. No experience required, just curiosity.
        </p>

        <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-xl border border-[var(--input-border)] bg-[var(--card-bg)] p-[22px]"
            >
              <div className="mb-[9px] font-mono text-[17px] font-bold text-[var(--accent-text)]">
                {pillar.title}
              </div>
              <div className="text-[14.5px] leading-[1.55] text-[var(--muted)]">
                {pillar.desc}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/registration" className={accentButtonClass}>
            Join us
          </Link>
          <Link href="/" className={ghostButtonClass}>
            &#8592; back home
          </Link>
        </div>
      </div>
    </main>
  );
}
