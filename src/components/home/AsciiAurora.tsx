/* Static glyph columns with a travelling CSS shimmer, so this stays a server component. */

const GLYPH_LINES = [
  "0x7f3a::01101001//dev/null",
  "rwxr-xr-x_4f2c9a10",
  "a91e{fork}001101/tty0",
  "7b2d::kernel.map::01001",
  "pipe|grep|awk|0f4e8c",
  "11001010::eth0::a7d3",
  "[root@localhost]#9c21",
  "ff02::1/dev/pts/0",
  "chmod+755::01ae93f",
  "01011|proc|mem|c4d8",
  "sys_call[4e7a]00110",
  "b8f1::sudoers.d::101",
  "./configure&&make0d9e",
  "100101::inode::7ac3f",
  "usr/bin/env::e24b01",
  "dmesg|tail::0110ff2",
  "9a3c::localhost::00101",
  "mount/dev/sda1::f82e",
  "011101::daemon::3c9a0",
  "var/log/syslog::b71d",
  "e5f0::socket[12]::010",
  "sha256sum::8d2c4a01",
  "00110::systemd::fa73",
  "home/uoa/lug::10c8e2",
];

const AURORA_GROUPS = [
  // Shorter top-left group, rising at roughly 20 degrees.
  {
    barCount: 32,
    leftStart: 20,
    leftEnd: 55,
    topStart: 4,
    topEnd: -20,
    viewportAnchored: false,
    viewportTopAnchored: false,
    heightStart: 0.2,
    heightEnd: 1,
    bottomAnchoredTaper: true,
    cycleDuration: 4,
    traversalFraction: 0.525,
    xOffset: "0%",
  },
  // Longer bottom-right group, anchored directly against the top-right edge.
  {
    barCount: 64,
    leftStart: 40,
    leftEnd: 101,
    topStart: 53,
    topEnd: -15,
    viewportAnchored: true,
    viewportTopAnchored: true,
    heightStart: 0.4,
    heightEnd: 0.7,
    bottomAnchoredTaper: false,
    cycleDuration: 4.6,
    traversalFraction: 0.737,
    xOffset: "-50%",
  },
];

const POSITION_JITTER = [0, -0.8, 1.2, -0.4, 0.7, -1.1, 0.4, -0.6];
const HEIGHT_SCALES = [0.84, 0.92, 1.03, 1.16, 0.88, 1.1, 0.97, 1.18];
const WAVE_STAGGER_WEIGHTS = [0.12, 0.18, 0.15, 0.22, 0.14, 0.2, 0.16, 0.19];
const DENSITY_BREAKPOINTS = [0.1, 0.4, 0.5, 0.8, 0.9];
const DENSITY_SUBDIVISIONS = [0.25, 0.5, 0.75];

function getBarProgresses(barCount: number) {
  const baseStep = 1 / (barCount - 1);
  const baseProgresses = Array.from(
    { length: barCount },
    (_, barIndex) => barIndex * baseStep,
  );
  const densityProgresses = DENSITY_BREAKPOINTS.flatMap((waveProgress) => {
    const distributionProgress = 1 - waveProgress;
    const lowerProgress =
      Math.floor(distributionProgress / baseStep) * baseStep;

    return DENSITY_SUBDIVISIONS.map(
      (subdivision) => lowerProgress + subdivision * baseStep,
    );
  });

  return [...baseProgresses, ...densityProgresses].sort(
    (progressA, progressB) => progressA - progressB,
  );
}

function interpolatePattern(
  pattern: number[],
  progress: number,
  baseBarCount: number,
  patternOffset: number,
) {
  const basePosition = progress * (baseBarCount - 1);
  const lowerIndex = Math.floor(basePosition);
  const upperIndex = Math.min(lowerIndex + 1, baseBarCount - 1);
  const blend = basePosition - lowerIndex;
  const lowerValue = pattern[(lowerIndex + patternOffset) % pattern.length];
  const upperValue = pattern[(upperIndex + patternOffset) % pattern.length];

  return lowerValue + (upperValue - lowerValue) * blend;
}

function getWaveDelay(
  barIndex: number,
  barCount: number,
  groupIndex: number,
  traversalDuration: number,
) {
  const stepCount = barCount - 1;
  const completedSteps = stepCount - barIndex;
  let completedWeight = 0;
  let totalWeight = 0;

  for (let step = 0; step < stepCount; step += 1) {
    const gapIndex = step + groupIndex * 3;
    const weight = WAVE_STAGGER_WEIGHTS[gapIndex % WAVE_STAGGER_WEIGHTS.length];

    totalWeight += weight;
    if (step < completedSteps) completedWeight += weight;
  }

  return (completedWeight / totalWeight) * traversalDuration;
}

/* Two deterministic diagonal groups with small local position and height variations. */
const AURORA_BARS = AURORA_GROUPS.flatMap((group, groupIndex) => {
  const progresses = getBarProgresses(group.barCount);

  return progresses.map((progress, barIndex) => {
    const endpointTaper = Math.sin(Math.PI * progress);
    const positionJitter = interpolatePattern(
      POSITION_JITTER,
      progress,
      group.barCount,
      groupIndex * 3,
    );
    const baseHeightScale = interpolatePattern(
      HEIGHT_SCALES,
      progress,
      group.barCount,
      groupIndex * 5,
    );
    const heightTaper =
      group.heightStart + (group.heightEnd - group.heightStart) * progress;
    const sourceBarIndex = Math.round(progress * (group.barCount - 1));

    return {
      groupIndex,
      progress,
      viewportAnchored: group.viewportAnchored,
      viewportTopAnchored: group.viewportTopAnchored,
      bottomAnchoredTaper: group.bottomAnchoredTaper,
      cycleDuration: group.cycleDuration,
      xOffset: group.xOffset,
      waveDelay: getWaveDelay(
        barIndex,
        progresses.length,
        groupIndex,
        group.cycleDuration * group.traversalFraction,
      ),
      left: group.leftStart + (group.leftEnd - group.leftStart) * progress,
      top:
        group.topStart +
        (group.topEnd - group.topStart) * progress +
        positionJitter * endpointTaper,
      baseHeightScale,
      heightTaper,
      heightScale: baseHeightScale * heightTaper,
      text: GLYPH_LINES[
        (sourceBarIndex * 5 + groupIndex * 11) % GLYPH_LINES.length
      ],
    };
  });
}).sort((barA, barB) => barA.left - barB.left);

export default function AsciiAurora() {
  return (
    <div aria-hidden className="relative h-full min-h-0">
      {AURORA_BARS.map((bar) => (
        <div
          key={`${bar.groupIndex}-${bar.progress.toFixed(6)}-${bar.waveDelay.toFixed(3)}-${bar.cycleDuration}`}
          className="aurora-column pointer-events-none absolute origin-top font-mono text-sm whitespace-nowrap [writing-mode:vertical-rl]"
          style={{
            left: bar.viewportAnchored
              ? `calc(${bar.left.toFixed(2)}% + max(0px, 45.4545vw - 840px))`
              : `${bar.left.toFixed(2)}%`,
            top: bar.viewportTopAnchored
              ? `calc(${bar.top.toFixed(2)}% - 92.7273px)`
              : `${bar.top.toFixed(2)}%`,
            transform: `translateX(${bar.xOffset}) scaleY(${
              bar.bottomAnchoredTaper ? bar.baseHeightScale : bar.heightScale
            })`,
            // Each group shares one duration internally, while the two groups drift.
            animationName: "auroraShimmer",
            animationDuration: `${bar.cycleDuration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDelay: `${bar.waveDelay.toFixed(3)}s`,
          }}
        >
          {bar.bottomAnchoredTaper ? (
            <span
              className="inline-block origin-bottom"
              style={{ transform: `scaleY(${bar.heightTaper})` }}
            >
              {bar.text}
            </span>
          ) : (
            bar.text
          )}
        </div>
      ))}
    </div>
  );
}
