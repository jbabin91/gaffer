import { createFileRoute, Link } from '@tanstack/react-router';

import type { Player } from '#/db/schema';

import { Badge } from '#/components/ui/badge';
import { Card } from '#/components/ui/card';
import { Heading } from '#/components/ui/heading';
import { Loader } from '#/components/ui/loader';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '#/components/ui/table';
import { useMounted } from '#/hooks/use-mounted';
import { CareerSwitcher } from '#/modules/career/components/career-switcher';
import { CreateCareerForm } from '#/modules/career/components/create-career-form';
import { useActiveCareer } from '#/modules/career/hooks/use-active-career';
import { AddPlayerModal } from '#/modules/player/components/add-player-modal';
import { useSquad } from '#/modules/player/hooks/use-players';

export const Route = createFileRoute('/_app/squad')({ component: SquadPage });

function SquadPage() {
  const mounted = useMounted();
  const { activeCareer, activeCareerId, careers, isLoading, selectCareer } =
    useActiveCareer();

  if (!mounted || isLoading) {
    return <CenteredLoader />;
  }

  if (careers.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <CreateCareerForm onCreated={selectCareer} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Heading level={1}>{activeCareer?.name ?? 'Squad'}</Heading>
          {activeCareer?.managerName && (
            <p className="text-sm text-muted-fg">{activeCareer.managerName}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <CareerSwitcher
            activeCareerId={activeCareerId}
            careers={careers}
            onSelect={selectCareer}
          />
          {activeCareerId && <AddPlayerModal careerId={activeCareerId} />}
        </div>
      </header>

      {activeCareerId && <SquadTable careerId={activeCareerId} />}
    </main>
  );
}

function SquadTable({ careerId }: { careerId: string }) {
  const squad = useSquad(careerId);

  if (squad.isLoading) return <CenteredLoader />;

  const players = squad.data ?? [];
  if (players.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-muted-fg">
          No players yet. Add your first signing to start tracking development.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <Table aria-label="Squad">
        <TableHeader>
          <TableColumn className="w-12">#</TableColumn>
          <TableColumn isRowHeader>Name</TableColumn>
          <TableColumn>Pos</TableColumn>
          <TableColumn>Age</TableColumn>
          <TableColumn>OVR</TableColumn>
          <TableColumn>POT</TableColumn>
        </TableHeader>
        <TableBody>
          {players.map((player: Player) => (
            <TableRow key={player.id}>
              <TableCell className="text-muted-fg tabular-nums">
                {player.squadNumber ?? '—'}
              </TableCell>
              <TableCell className="font-medium">
                <Link
                  className="hover:underline"
                  params={{ playerId: player.id }}
                  to="/players/$playerId"
                >
                  {player.name}
                </Link>
              </TableCell>
              <TableCell>{player.primaryPosition ?? '—'}</TableCell>
              <TableCell className="tabular-nums">
                {player.age ?? '—'}
              </TableCell>
              <TableCell className="tabular-nums">
                {player.overall ?? '—'}
              </TableCell>
              <TableCell>
                {player.potential !== null ? (
                  <Badge intent="secondary">{player.potential}</Badge>
                ) : (
                  '—'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function CenteredLoader() {
  return (
    <div className="flex justify-center py-20">
      <Loader />
    </div>
  );
}
