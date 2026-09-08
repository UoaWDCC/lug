import Link from "next/link";

import {
  ghostButtonClass,
  scrollableMainClass,
} from "@/components/primitive/buttonStyles";

/* Placeholder events from the handoff — replace once real event data exists. */
const EVENTS = [
  {
    date: "Tue 4 Aug · 5:30pm",
    title: "Intro to the Terminal",
    desc: "A beginner-friendly first-steps workshop. Bring a laptop.",
  },
  {
    date: "Tue 18 Aug · 5:30pm",
    title: "Dotfiles Night",
    desc: "Show off your setup, steal some ideas, rice your desktop.",
  },
  {
    date: "Tue 1 Sep · 5:30pm",
    title: "Kernel Compile Workshop",
    desc: "Build and boot your own custom Linux kernel from source.",
  },
];

export default function Events() {
  return (
    <main className={scrollableMainClass}>
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-2 font-mono text-xl text-[var(--accent-text)]">
          $ ls ./events
        </div>

        <h1 className="m-0 mb-5 text-[clamp(48px,7vw,73px)] font-black tracking-[-1px]">
          What&apos;s coming up?
        </h1>

        <div className="mb-7 flex flex-col gap-2.5">
          {EVENTS.map((event) => (
            <div
              key={event.title}
              className="flex flex-wrap items-start gap-5 rounded-xl border border-[var(--input-border)] bg-[var(--card-bg)] p-5"
            >
              <div className="min-w-[175px] font-mono text-[18px] font-semibold text-[var(--accent-text)]">
                {event.date}
              </div>
              <div className="min-w-[200px] flex-1">
                <div className="mb-1.5 text-[27px] font-bold">
                  {event.title}
                </div>
                <div className="text-lg leading-[1.5] text-[var(--muted)]">
                  {event.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link href="/" className={ghostButtonClass}>
          &#8592; back home
        </Link>
      </div>
    </main>
  );
}
