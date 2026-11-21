import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';

interface SortTabsProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label?: string;
}

// Radix Tabs gives arrow-key navigation and the right ARIA roles.
export function SortTabs<T extends string>({ value, options, onChange, label = 'Sort' }: SortTabsProps<T>) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as T)} aria-label={label}>
      <TabsList>
        {options.map((o) => (
          <TabsTrigger key={o.value} value={o.value}>{o.label}</TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
