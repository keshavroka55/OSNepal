import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { notify } from '../../../utils/notify';
import { joinSpace, leaveSpace } from '../api/ecosystemApi';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { compactNumber } from '../relativeTime';
import type { Space } from '../types';

export function SpaceSidebar({ space, onChange }: { space: Space; onChange: (s: Space) => void }) {
  const requireAuth = useRequireAuth();
  const [busy, setBusy] = useState(false);
  const joined = Boolean(space.viewerRole);

  const toggle = async () => {
    if (!requireAuth('join this space')) return;
    setBusy(true);
    try {
      const result = joined ? await leaveSpace(space.slug) : await joinSpace(space.slug);
      onChange({
        ...space,
        viewerRole: result.joined ? 'MEMBER' : null,
        memberCount: result.memberCount ?? space.memberCount,
      });
    } catch (err: unknown) {
      notify.error((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Couldn't update membership.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside aria-label={`About ${space.name}`} className="space-y-4 rounded-lg border border-border bg-surface p-4 text-sm">
      <div>
        <h2 className="text-base font-semibold">{space.icon} {space.name}</h2>
        <p className="mt-1 text-text-muted">{space.description}</p>
        <p className="mt-2 text-text-muted"><span className="tabular font-medium text-text">{compactNumber(space.memberCount)}</span> members</p>
      </div>

      {space.viewerRole !== 'OWNER' && (
        <Button className="w-full" variant={joined ? 'outline' : 'default'} onClick={toggle} disabled={busy}>
          {joined ? 'Leave space' : 'Join space'}
        </Button>
      )}
      {joined && (
        <Button asChild className="w-full" variant="secondary">
          <Link to={`/ecosystem/new?space=${space.slug}`}>New post</Link>
        </Button>
      )}

      {space.rules && (
        <section aria-labelledby="space-rules">
          <h3 id="space-rules" className="font-semibold">Rules</h3>
          <p className="mt-1 whitespace-pre-line text-text-muted">{space.rules}</p>
        </section>
      )}

      {space.moderators && space.moderators.length > 0 && (
        <section aria-labelledby="space-mods">
          <h3 id="space-mods" className="font-semibold">Moderators</h3>
          <ul className="mt-1 space-y-1">
            {space.moderators.map((m) => (
              <li key={m.id}>
                <Link to={`/profile/${m.id}`} className="text-text-muted hover:text-text hover:underline">
                  {m.username ? `@${m.username}` : m.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
