import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { ThemeToggle } from '../../components/ThemeToggle';
import { VoteButton } from '../../features/ecosystem/components/VoteButton';
import { useTheme } from '../../contexts/ThemeContext';

const SWATCHES = [
  'background', 'surface', 'surface-raised', 'border', 'text', 'text-muted',
  'primary', 'primary-foreground', 'success', 'warning', 'danger', 'ring',
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="border-b border-border pb-1 text-sm font-semibold uppercase tracking-wide text-text-muted">{title}</h2>
      {children}
    </section>
  );
}

// Dev-only: visual check of every core component in the active theme.
// Not routed in production builds.
export default function DesignPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [vote, setVote] = useState({ score: 42, viewerVote: 0 as -1 | 0 | 1 });

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Design system</h1>
          <p className="text-sm text-text-muted">Preference: {theme}. Showing: {resolvedTheme}.</p>
        </div>
        <div className="flex items-center gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <Button key={t} size="sm" variant={theme === t ? 'default' : 'outline'} onClick={() => setTheme(t)}>{t}</Button>
          ))}
          <ThemeToggle />
        </div>
      </header>

      <Section title="Colour tokens">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SWATCHES.map((name) => (
            <li key={name} className="rounded-md border border-border p-2 text-xs">
              <div className="mb-1 h-8 rounded-sm border border-border" style={{ background: `var(--${name})` }} />
              {name}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type">
        <p className="text-2xl font-semibold">Display heading, Inter</p>
        <p className="text-sm">Body text sits at 14px with 1.6 leading for dense, readable lists.</p>
        <p className="text-sm text-text-muted">Muted text for metadata and secondary information.</p>
        <p className="tabular text-sm">Tabular numbers: 1,234 · 56 · 7,890</p>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="d-name">Name</Label><Input id="d-name" placeholder="Ada Lovelace" /></div>
          <div className="space-y-1.5"><Label htmlFor="d-bad">With error</Label><Input id="d-bad" aria-invalid defaultValue="not-an-email" /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="d-bio">Bio</Label><Textarea id="d-bio" placeholder="A sentence or two" /></div>
        </div>
      </Section>

      <Section title="Cards and votes">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <h3 className="font-semibold">Surface card</h3>
            <p className="text-sm text-text-muted">Hairline border, no heavy shadow. In dark mode the shadow disappears and the border does the work.</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-raised p-4">
            <VoteButton
              orientation="horizontal"
              label="the design page"
              score={vote.score}
              viewerVote={vote.viewerVote}
              onVote={(d) => setVote((v) => {
                const next = v.viewerVote === d ? 0 : d;
                return { score: v.score - v.viewerVote + next, viewerVote: next };
              })}
            />
          </div>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <span className="rounded-sm bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Live</span>
          <span className="rounded-sm bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">Scheduled</span>
        </div>
      </Section>

      <Section title="Dialog and toasts">
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this launch?</DialogTitle>
                <DialogDescription>This removes the page and its votes. It can't be undone.</DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2"><Button variant="outline">Cancel</Button><Button variant="destructive">Delete</Button></div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => toast.success('Saved')}>Success toast</Button>
          <Button variant="outline" onClick={() => toast.error('Something went wrong')}>Error toast</Button>
        </div>
      </Section>

      <Section title="Table">
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Product</TableHead><TableHead className="text-right">Votes</TableHead></TableRow></TableHeader>
            <TableBody>
              {[['1', 'Parcel', 482], ['2', 'Lumen', 391], ['3', 'Tidepool', 275]].map(([rank, name, votes]) => (
                <TableRow key={rank}><TableCell className="tabular">{rank}</TableCell><TableCell>{name}</TableCell><TableCell className="tabular text-right">{votes}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>
    </main>
  );
}
