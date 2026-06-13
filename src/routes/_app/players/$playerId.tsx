import { createFileRoute, Link } from '@tanstack/react-router';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardHeader } from '#/components/ui/card';
import { Heading } from '#/components/ui/heading';
import { Loader } from '#/components/ui/loader';
import { useMounted } from '#/lib/use-mounted';
import { DevelopmentChart } from '#/modules/player/components/development-chart';
import { RecordSnapshotModal } from '#/modules/player/components/record-snapshot-modal';
import {
  usePlayer,
  usePlayerSnapshots,
} from '#/modules/player/hooks/use-players';

export const Route = createFileRoute('/_app/players/$playerId')({
  component: PlayerPage,
});

function PlayerPage() {
  const { playerId } = Route.useParams();
  const mounted = useMounted();
  const player = usePlayer(playerId);
  const snapshots = usePlayerSnapshots(playerId);

  if (!mounted || player.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (!player.data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-muted-fg">Player not found.</p>
        <Link className="text-primary hover:underline" to="/">
          Back to squad
        </Link>
      </main>
    );
  }

  const p = player.data;
  const history = snapshots.data ?? [];
  const latest = history.at(-1);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Link className="text-sm text-muted-fg hover:underline" to="/">
        ← Back to squad
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Heading level={1}>{p.name}</Heading>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-fg">
            {p.primaryPosition && (
              <Badge intent="secondary">{p.primaryPosition}</Badge>
            )}
            {p.squadNumber !== null && <span>#{p.squadNumber}</span>}
            {p.age !== null && <span>Age {p.age}</span>}
            {p.nationality && <span>{p.nationality}</span>}
          </div>
        </div>
        {/* Wait for history so the modal seeds the correct next week, not week 1. */}
        {snapshots.isSuccess ? (
          <RecordSnapshotModal
            careerId={p.careerId}
            defaults={{
              inGameWeek: (latest?.inGameWeek ?? 0) + 1,
              overall: p.overall ?? undefined,
              potential: p.potential ?? undefined,
            }}
            playerId={p.id}
          />
        ) : (
          <Button isDisabled intent="outline">
            Record snapshot
          </Button>
        )}
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Overall" value={p.overall} />
        <Stat label="Potential" value={p.potential} />
        <Stat
          format={(v) => `'${String(v).slice(-2)}`}
          label="Contract"
          value={p.contractUntil ?? undefined}
        />
        <Stat
          format={formatEur}
          label="Value"
          value={p.marketValueEur ?? undefined}
        />
      </div>

      <Card>
        <CardHeader
          description="Overall and potential by in-game week."
          title="Development"
        />
        <CardContent>
          {snapshots.isLoading ? (
            <Loader />
          ) : (
            <DevelopmentChart snapshots={history} />
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function Stat({
  format,
  label,
  value,
}: {
  format?: (v: number) => string;
  label: string;
  value: number | null | undefined;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs tracking-wide text-muted-fg uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">
        {value === null || value === undefined
          ? '—'
          : format
            ? format(value)
            : value}
      </p>
    </Card>
  );
}

function formatEur(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `€${Math.round(value / 1000)}K`;
  return `€${value}`;
}
