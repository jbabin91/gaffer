import { useState } from 'react';

import { Button } from '#/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '#/components/ui/card';
import { Label } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { TextField } from '#/components/ui/text-field';
import { useCreateCareer } from '#/modules/career/hooks/use-careers';

type CreateCareerFormProps = { onCreated?: (careerId: string) => void };

export function CreateCareerForm({ onCreated }: CreateCareerFormProps) {
  const createCareer = useCreateCareer();
  const [name, setName] = useState('');
  const [manager, setManager] = useState('');
  const [club, setClub] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    createCareer.mutate(
      {
        clubName: club.trim() || undefined,
        managerName: manager.trim() || undefined,
        name: name.trim(),
      },
      { onSuccess: (career) => onCreated?.(career.id) },
    );
  };

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader
        description="Track squads, player development, and your manager-mode plan."
        title="Start a career"
      />
      <CardContent className="space-y-4">
        <TextField isRequired value={name} onChange={setName}>
          <Label>Career name</Label>
          <Input placeholder="e.g. Newcastle Rebuild" />
        </TextField>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField value={manager} onChange={setManager}>
            <Label>Manager name</Label>
            <Input placeholder="Optional" />
          </TextField>
          <TextField value={club} onChange={setClub}>
            <Label>Club</Label>
            <Input placeholder="Optional" />
          </TextField>
        </div>
        {createCareer.isError && (
          <p className="text-sm text-danger" role="alert">
            Couldn't create the career. Please try again.
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          isDisabled={!name.trim()}
          isPending={createCareer.isPending}
          onPress={submit}
        >
          Create career
        </Button>
      </CardFooter>
    </Card>
  );
}
