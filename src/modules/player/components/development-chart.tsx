import type { ChartConfig } from '#/components/ui/chart';
import type { PlayerSnapshot } from '#/db/schema';

import { LineChart } from '#/components/ui/line-chart';

type DevelopmentChartProps = { snapshots: PlayerSnapshot[] };

const CONTAINER_HEIGHT = 280;

export function DevelopmentChart({ snapshots }: DevelopmentChartProps) {
  if (snapshots.length < 2) {
    return (
      <p className="text-sm text-muted-fg">
        Record at least two weekly snapshots to see a development trend.
      </p>
    );
  }

  const config: ChartConfig = {
    overall: { color: 'var(--color-primary)', label: 'Overall' },
    ...(snapshots.some((s) => s.potential !== null) && {
      potential: { color: 'var(--color-muted-fg)', label: 'Potential' },
    }),
  };

  return (
    <LineChart
      connectNulls
      config={config}
      containerHeight={CONTAINER_HEIGHT}
      data={toChartData(snapshots)}
      dataKey="week"
      tooltipProps={{
        labelFormatter: (_label, payload) =>
          `Wk ${payload?.[0]?.payload?.week ?? ''}`,
      }}
      xAxisProps={{
        allowDecimals: false,
        domain: ['dataMin', 'dataMax'],
        tickFormatter: (value) => `Wk ${value}`,
        type: 'number',
      }}
      yAxisProps={{ domain: ratingDomain(snapshots) }}
    />
  );
}

export function toChartData(snapshots: PlayerSnapshot[]) {
  return snapshots
    .toSorted((a, b) => a.inGameWeek - b.inGameWeek)
    .map((s) => ({
      overall: s.overall,
      potential: s.potential ?? null,
      week: s.inGameWeek,
    }));
}

export function ratingDomain(snapshots: PlayerSnapshot[]): [number, number] {
  const ratings = snapshots.flatMap((s) => [
    s.overall,
    s.potential ?? s.overall,
  ]);
  return [
    Math.max(0, Math.min(...ratings) - 2),
    Math.min(99, Math.max(...ratings) + 2),
  ];
}
