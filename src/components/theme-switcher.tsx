import { Icons } from '#/components/icons';
import { Button } from '#/components/ui/button';
import {
  Menu,
  MenuContent,
  MenuItem,
  type Selection,
} from '#/components/ui/menu';
import { useTheme } from '#/integrations/next-themes/theme-provider';

const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
] as const;

export function ThemeSwitcher({
  intent = 'plain',
}: {
  intent?: 'outline' | 'plain';
}) {
  const { setTheme, theme } = useTheme();

  const onSelectionChange = (keys: Selection) => {
    if (keys === 'all') return;
    const [next] = keys;
    if (next !== undefined) setTheme(String(next));
  };

  return (
    <Menu>
      <Button isCircle aria-label="Switch theme" intent={intent} size="sq-sm">
        <Icons.sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Icons.moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </Button>
      <MenuContent
        placement="bottom end"
        selectedKeys={theme ? [theme] : []}
        selectionMode="single"
        onSelectionChange={onSelectionChange}
      >
        {THEMES.map((option) => (
          <MenuItem key={option.id} id={option.id}>
            {option.label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
