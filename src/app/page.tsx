import CommandRain from "@/components/home/CommandRain";
import TerminalPanel from "@/components/home/TerminalPanel";

/* Home hero: copy column on the left, falling commands on the right. */
export default function Home() {
  return (
    <main
      className="relative z-10 mx-auto grid min-h-0 w-full max-w-[1680px] flex-1 grid-cols-1 items-center gap-8 px-8 pb-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      style={{ zoom: 1.1 }}
    >
      <div className="flex max-w-[680px] min-w-0 flex-col gap-3.5">
        <div className="font-mono text-[clamp(18px,2.2vw,25px)] font-semibold text-[var(--accent-text)]">
          University of Auckland
        </div>

        <h1 className="m-0 text-[clamp(42px,6vw,76px)] leading-[0.98] font-black tracking-[-1.5px]">
          Linux Users
          <br />
          Group
        </h1>

        <p className="m-0 max-w-[540px] text-[18px] leading-[1.45] text-[var(--muted)]">
          A club where we build, share, and talk about Linux, the free and
          open-source operating system.
        </p>

        <TerminalPanel />
      </div>

      {/* Rain needs real height to fall through, so it is desktop-only. */}
      <div className="hidden h-full min-h-0 md:block">
        <CommandRain />
      </div>
    </main>
  );
}
