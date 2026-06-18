import { useState } from 'react';

import type { CatalogPlayer } from '#/db/schema';

import { Button } from '#/components/ui/button';
import { Label } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '#/components/ui/modal';
import { NumberField, NumberInput } from '#/components/ui/number-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '#/components/ui/select';
import { TextField } from '#/components/ui/text-field';
import { numberOrUndefined } from '#/lib/utils/number';
import { useCatalogSearch } from '#/modules/catalog/hooks/use-catalog-search';
import { useAddPlayer } from '#/modules/player/hooks/use-players';

const POSITIONS = [
  'GK',
  'RB',
  'RWB',
  'CB',
  'LB',
  'LWB',
  'CDM',
  'CM',
  'CAM',
  'RM',
  'LM',
  'RW',
  'LW',
  'CF',
  'ST',
];

type AddPlayerModalProps = { careerId: string };

type FormState = {
  age?: number;
  catalogId?: number;
  name: string;
  overall?: number;
  position: string;
  potential?: number;
  squadNumber?: number;
};

const EMPTY: FormState = { name: '', position: '' };

export function AddPlayerModal({ careerId }: AddPlayerModalProps) {
  const addPlayer = useAddPlayer(careerId);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [search, setSearch] = useState('');
  const catalog = useCatalogSearch(search);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const prefill = (p: CatalogPlayer) => {
    setForm({
      age: p.age ?? undefined,
      catalogId: p.id,
      name: p.fullName,
      overall: p.overall ?? undefined,
      position: p.primaryPosition ?? '',
      potential: p.potential ?? undefined,
    });
    setSearch('');
  };

  const submit = (close: () => void) => {
    if (!form.name.trim()) return;
    addPlayer.mutate(
      {
        age: form.age,
        catalogId: form.catalogId,
        name: form.name.trim(),
        overall: form.overall,
        potential: form.potential,
        primaryPosition: form.position || undefined,
        squadNumber: form.squadNumber,
      },
      {
        onSuccess: () => {
          setForm(EMPTY);
          close();
        },
      },
    );
  };

  return (
    <Modal>
      <Button>Add player</Button>
      <ModalContent size="lg">
        {({ close }) => (
          <>
            <ModalHeader>
              <ModalTitle>Add player to squad</ModalTitle>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <TextField
                aria-label="Search catalog"
                value={search}
                onChange={setSearch}
              >
                <Label>Search player database</Label>
                <Input placeholder="Type a name to prefill from the catalog…" />
              </TextField>

              {search.trim().length >= 2 && (
                <CatalogResults
                  isError={catalog.isError}
                  isLoading={catalog.isLoading}
                  results={catalog.data ?? []}
                  onPick={prefill}
                />
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  isRequired
                  value={form.name}
                  // Editing the name drops catalogId to avoid a false FK link to
                  // the prefilled catalog entry.
                  onChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      catalogId: undefined,
                      name: v,
                    }))
                  }
                >
                  <Label>Name</Label>
                  <Input placeholder="Player name" />
                </TextField>

                <Select
                  placeholder="Select position"
                  // oxlint-disable-next-line typescript/no-deprecated -- react-aria single-select controlled API; only deprecated in the multi-select generic union
                  selectedKey={form.position || null}
                  // oxlint-disable-next-line typescript/no-deprecated -- react-aria single-select controlled API; only deprecated in the multi-select generic union
                  onSelectionChange={(k) => set('position', String(k))}
                >
                  <Label>Position</Label>
                  <SelectTrigger />
                  <SelectContent>
                    {POSITIONS.map((p) => (
                      <SelectItem key={p} id={p} textValue={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <NumberField
                  maxValue={50}
                  minValue={14}
                  value={form.age}
                  onChange={(v) => set('age', numberOrUndefined(v))}
                >
                  <Label>Age</Label>
                  <NumberInput />
                </NumberField>

                <NumberField
                  maxValue={99}
                  minValue={1}
                  value={form.squadNumber}
                  onChange={(v) => set('squadNumber', numberOrUndefined(v))}
                >
                  <Label>Squad number</Label>
                  <NumberInput />
                </NumberField>

                <NumberField
                  maxValue={99}
                  minValue={1}
                  value={form.overall}
                  onChange={(v) => set('overall', numberOrUndefined(v))}
                >
                  <Label>Overall</Label>
                  <NumberInput />
                </NumberField>

                <NumberField
                  maxValue={99}
                  minValue={1}
                  value={form.potential}
                  onChange={(v) => set('potential', numberOrUndefined(v))}
                >
                  <Label>Potential</Label>
                  <NumberInput />
                </NumberField>
              </div>
              {addPlayer.isError && (
                <p className="text-sm text-danger" role="alert">
                  Couldn't add the player. Please try again.
                </p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button intent="outline" onPress={close}>
                Cancel
              </Button>
              <Button
                isDisabled={!form.name.trim()}
                isPending={addPlayer.isPending}
                onPress={() => submit(close)}
              >
                Add player
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function CatalogResults({
  isError,
  isLoading,
  onPick,
  results,
}: {
  isError: boolean;
  isLoading: boolean;
  onPick: (p: CatalogPlayer) => void;
  results: CatalogPlayer[];
}) {
  if (isError) {
    return (
      <p className="text-sm text-danger" role="alert">
        Couldn't search the catalog. Enter the player manually below.
      </p>
    );
  }
  if (isLoading) {
    return <p className="text-sm text-muted-fg">Searching…</p>;
  }
  if (results.length === 0) {
    return (
      <p className="text-sm text-muted-fg">
        No matches. The player catalog is empty until you import the dataset.
        Enter the player manually below.
      </p>
    );
  }
  return (
    <ul className="max-h-40 divide-y overflow-auto rounded-lg border">
      {results.map((p) => (
        <li key={p.id}>
          <button
            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
            type="button"
            onClick={() => onPick(p)}
          >
            <span>{p.fullName}</span>
            <span className="text-muted-fg">
              {p.primaryPosition ?? '—'} · {p.overall ?? '—'}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
