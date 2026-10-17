import type { StepProgress } from "./steps";

/* Dot-and-segment progress rail from the handoff. */
export default function ProgressSteps({ current, total, label }: StepProgress) {
  const dots = Array.from({ length: total }, (_, i) => i);

  return (
    <>
      <div
        className="mb-1.5 flex items-center justify-center"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${current} of ${total}`}
      >
        {dots.map((i) => (
          <div key={i} className="flex items-center">
            <div
              className="h-3.5 w-3.5 shrink-0 rounded-full"
              style={{
                background:
                  i < current ? "var(--accent)" : "var(--input-border)",
              }}
            />
            {i < total - 1 && (
              <div
                className="h-0.5 w-[40px]"
                style={{
                  background:
                    i + 1 < current ? "var(--accent)" : "var(--input-border)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mb-3 text-center font-mono text-[15px] text-[var(--muted)]">
        Step {current} of {total} · {label}
      </div>
    </>
  );
}
