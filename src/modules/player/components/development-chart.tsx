import { useId, useMemo } from 'react';

import type { PlayerSnapshot } from '#/db/schema';

type DevelopmentChartProps = { snapshots: PlayerSnapshot[] };

const WIDTH = 640;
const HEIGHT = 220;
const PAD = { bottom: 28, left: 32, right: 16, top: 16 };

/**
 * Lightweight SVG line chart of overall (and potential) across in-game weeks.
 * Dependency-free so the bundle stays small; snapshots arrive sorted by week.
 */
export function DevelopmentChart({ snapshots }: DevelopmentChartProps) {
  const gradientId = useId();
  const chart = useMemo(() => buildChart(snapshots), [snapshots]);

  if (!chart) {
    return (
      <p className="text-sm text-muted-fg">
        Record at least two weekly snapshots to see a development trend.
      </p>
    );
  }

  const {
    areaPath,
    maxWeek,
    minWeek,
    overallPath,
    potentialPath,
    sorted,
    x,
    y,
    yTicks,
  } = chart;

  return (
    <figure className="w-full">
      <svg
        aria-label="Overall and potential rating over in-game weeks"
        className="h-auto w-full"
        role="img"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-primary)"
              stopOpacity="0.25"
            />
            <stop
              offset="100%"
              stopColor="var(--color-primary)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              className="stroke-border"
              strokeWidth={1}
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
            />
            <text
              className="fill-muted-fg text-[10px]"
              dominantBaseline="middle"
              textAnchor="end"
              x={PAD.left - 6}
              y={y(tick)}
            >
              {tick}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />

        {potentialPath && (
          <path
            className="stroke-muted-fg"
            d={potentialPath}
            fill="none"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
        )}

        <path
          className="stroke-primary"
          d={overallPath}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
        />

        {sorted.map((s) => (
          <circle
            key={s.id}
            className="fill-primary"
            cx={x(s.inGameWeek)}
            cy={y(s.overall)}
            r={3}
          />
        ))}

        {[minWeek, maxWeek].map((week) => (
          <text
            key={week}
            className="fill-muted-fg text-[10px]"
            textAnchor="middle"
            x={x(week)}
            y={HEIGHT - 8}
          >
            Wk {week}
          </text>
        ))}
      </svg>

      <figcaption className="mt-2 flex gap-4 text-xs text-muted-fg">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-primary" /> Overall
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0 w-4 border-t border-dashed border-muted-fg" />{' '}
          Potential
        </span>
      </figcaption>
    </figure>
  );
}

/** Derive all chart geometry from snapshots, or null when there's no trend. */
function buildChart(snapshots: PlayerSnapshot[]) {
  if (snapshots.length < 2) return null;

  const sorted = snapshots.toSorted((a, b) => a.inGameWeek - b.inGameWeek);
  const weeks = sorted.map((s) => s.inGameWeek);
  const ratings = sorted.flatMap((s) => [s.overall, s.potential ?? s.overall]);

  const minWeek = Math.min(...weeks);
  const maxWeek = Math.max(...weeks);
  const minRating = Math.max(0, Math.min(...ratings) - 2);
  const maxRating = Math.min(99, Math.max(...ratings) + 2);

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const x = (week: number) =>
    PAD.left +
    (maxWeek === minWeek
      ? 0
      : ((week - minWeek) / (maxWeek - minWeek)) * plotW);
  const y = (rating: number) =>
    PAD.top +
    (maxRating === minRating
      ? plotH
      : (1 - (rating - minRating) / (maxRating - minRating)) * plotH);

  const line = (pick: (s: PlayerSnapshot) => number | null) =>
    sorted
      .map((s) => {
        const v = pick(s);
        return v === null ? null : { x: x(s.inGameWeek), y: y(v) };
      })
      .filter((p): p is { x: number; y: number } => p !== null)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

  const overallPath = line((s) => s.overall);
  const potentialPath = line((s) => s.potential ?? null);
  const areaPath = `${overallPath} L ${x(maxWeek)} ${PAD.top + plotH} L ${x(minWeek)} ${PAD.top + plotH} Z`;

  return {
    areaPath,
    maxWeek,
    minWeek,
    overallPath,
    potentialPath,
    sorted,
    x,
    y,
    yTicks: ratingTicks(minRating, maxRating),
  };
}

export function ratingTicks(min: number, max: number): number[] {
  const span = max - min;
  const step = span <= 8 ? 2 : span <= 20 ? 5 : 10;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= max; t += step) ticks.push(t);
  return ticks;
}
