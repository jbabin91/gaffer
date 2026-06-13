import { useState } from 'react';

import { Button } from '#/components/ui/button';
import { Label } from '#/components/ui/field';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '#/components/ui/modal';
import { NumberField, NumberInput } from '#/components/ui/number-field';
import { numberOrUndefined } from '#/lib/number';
import { useRecordSnapshot } from '#/modules/player/hooks/use-players';

type SnapshotDefaults = {
  inGameWeek: number;
  overall?: number;
  potential?: number;
};

type RecordSnapshotModalProps = {
  careerId: string;
  /** Seeded from the player's latest snapshot; may load after first render. */
  defaults: SnapshotDefaults;
  playerId: string;
};

export function RecordSnapshotModal({
  careerId,
  defaults,
  playerId,
}: RecordSnapshotModalProps) {
  const record = useRecordSnapshot(playerId, careerId);

  return (
    <Modal>
      <Button intent="outline">Record snapshot</Button>
      <ModalContent size="sm">
        {({ close }) => (
          // Mounted only while open, so the form re-seeds from the latest
          // defaults on every open rather than freezing the first render's.
          <SnapshotForm
            defaults={defaults}
            isError={record.isError}
            isPending={record.isPending}
            onCancel={close}
            onSubmit={(values) => record.mutate(values, { onSuccess: close })}
          />
        )}
      </ModalContent>
    </Modal>
  );
}

type SnapshotFormProps = {
  defaults: SnapshotDefaults;
  isError: boolean;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    inGameWeek: number;
    overall: number;
    potential?: number;
  }) => void;
};

function SnapshotForm({
  defaults,
  isError,
  isPending,
  onCancel,
  onSubmit,
}: SnapshotFormProps) {
  const [week, setWeek] = useState<number | undefined>(defaults.inGameWeek);
  const [overall, setOverall] = useState<number | undefined>(defaults.overall);
  const [potential, setPotential] = useState<number | undefined>(
    defaults.potential,
  );

  const canSubmit = week !== undefined && overall !== undefined;

  return (
    <>
      <ModalHeader>
        <ModalTitle>Record weekly snapshot</ModalTitle>
      </ModalHeader>
      <ModalBody className="space-y-4">
        <NumberField
          maxValue={52}
          minValue={0}
          value={week}
          onChange={(v) => setWeek(numberOrUndefined(v))}
        >
          <Label>In-game week</Label>
          <NumberInput />
        </NumberField>
        <NumberField
          maxValue={99}
          minValue={1}
          value={overall}
          onChange={(v) => setOverall(numberOrUndefined(v))}
        >
          <Label>Overall</Label>
          <NumberInput />
        </NumberField>
        <NumberField
          maxValue={99}
          minValue={1}
          value={potential}
          onChange={(v) => setPotential(numberOrUndefined(v))}
        >
          <Label>Potential</Label>
          <NumberInput />
        </NumberField>
        {isError && (
          <p className="text-sm text-danger" role="alert">
            Couldn't save the snapshot. Please try again.
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button intent="outline" onPress={onCancel}>
          Cancel
        </Button>
        <Button
          isDisabled={!canSubmit}
          isPending={isPending}
          onPress={() => {
            if (week !== undefined && overall !== undefined) {
              onSubmit({ inGameWeek: week, overall, potential });
            }
          }}
        >
          Save
        </Button>
      </ModalFooter>
    </>
  );
}
