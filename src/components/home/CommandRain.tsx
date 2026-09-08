/* Falling command columns, pure CSS so this stays a server component. */

const COMMANDS = [
  "sudo apt update",
  "git status",
  "cd /home/user",
  "ls -la",
  "cat /etc/os-release",
  "systemctl status",
  "grep -r err .",
  "vim main.c",
  "df -h",
  "ps aux",
];

const FADE_MASK =
  "linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)";

export default function CommandRain() {
  return (
    <div aria-hidden className="relative h-full min-h-0">
      {COMMANDS.map((text, i) => (
        <div
          key={text}
          className="rain-column pointer-events-none absolute top-0 font-mono text-base whitespace-nowrap text-[var(--accent)] [writing-mode:vertical-rl]"
          style={{
            left: `${6 + i * 10}%`,
            opacity: 0,
            // Each column sits at one of three brightness steps.
            ["--rain-op" as string]: `calc(var(--rain-base-opacity) + ${(i % 3) * 0.12})`,
            animation: `rainFall ${15 + (i % 5) * 2}s linear infinite`,
            animationDelay: `${-(i * 3.2)}s`,
            WebkitMaskImage: FADE_MASK,
            maskImage: FADE_MASK,
          }}
        >
          {text}
        </div>
      ))}
    </div>
  );
}
