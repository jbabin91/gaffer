import type { Career } from '#/db/schema';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '#/components/ui/select';

type CareerSwitcherProps = {
  activeCareerId: string | undefined;
  careers: Career[];
  onSelect: (careerId: string) => void;
};

export function CareerSwitcher({
  activeCareerId,
  careers,
  onSelect,
}: CareerSwitcherProps) {
  if (careers.length === 0) return null;

  return (
    <Select
      aria-label="Active career"
      className="w-56"
      // oxlint-disable-next-line typescript/no-deprecated -- react-aria single-select controlled API; only deprecated in the multi-select generic union
      selectedKey={activeCareerId ?? null}
      // oxlint-disable-next-line typescript/no-deprecated -- react-aria single-select controlled API; only deprecated in the multi-select generic union
      onSelectionChange={(key) => onSelect(String(key))}
    >
      <SelectTrigger />
      <SelectContent>
        {careers.map((career) => (
          <SelectItem key={career.id} id={career.id} textValue={career.name}>
            {career.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
