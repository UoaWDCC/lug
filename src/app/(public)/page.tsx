import CommandRain from "@/components/home/CommandRain";
import TerminalPanel from "@/components/home/TerminalPanel";

/* Home hero: copy column on the left, falling commands on the right. */
export default function Home() {
  return (
    <main
      className="relative z-10 mx-auto grid min-h-0 w-full max-w-[1680px] flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] items-start gap-8 overflow-y-auto px-8 pt-9 pb-7 short:pt-5 short:pb-5 shorter:pt-3 shorter:pb-4 shortest:pt-2 shortest:pb-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      style={{ zoom: 1.1 }}
    >
      {/* Top-aligned so the reclaimed space goes to the terminal below. */}
      <div className="flex h-full max-w-[680px] min-w-0 flex-col gap-3 shorter:gap-2 shortest:gap-1.5">
        <div className="font-mono text-[clamp(18px,2.2vw,25px)] font-semibold shorter:text-[18px] shortest:text-[16px] text-[var(--accent-text)]">
          University of Auckland
        </div>

        <h1 className="m-0 text-[clamp(42px,6vw,76px)] leading-[0.98] short:text-[clamp(40px,5vw,56px)] shorter:text-[clamp(36px,4.2vw,50px)] shortest:text-[clamp(34px,3.6vw,42px)] font-black tracking-[-1.5px]">
          Linux Users
          <br />
          Group
        </h1>

        <p className="m-0 mb-3 max-w-[540px] text-[18px] leading-[1.45] short:mb-1 shorter:mb-0 shorter:text-[16px] shortest:text-[15px] shortest:leading-[1.35] text-[var(--muted)]">
          A club where we build, share, and talk about Linux, the free and
          open-source operating system.
        </p>

        <TerminalPanel />
      </div>

      {/* Rain needs real height to fall through, so it is desktop-only. */}
      <div className="hidden h-full min-h-0 xl:block">
        <CommandRain />
      </div>
    </main>
  );
}
