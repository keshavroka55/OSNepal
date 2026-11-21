import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import DashboardSidebar from '../../components/DashboardSidebar';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { notify } from '../../utils/notify';
import { getReportQueue, resolveReport, type QueueReport } from '../../features/ecosystem/api/moderationApi';
import { SortTabs } from '../../features/ecosystem/components/SortTabs';
import { relativeTime } from '../../features/ecosystem/relativeTime';

type Status = QueueReport['status'];

export default function ModerationQueuePage() {
  const { user, authChecked } = useAuth();
  const [status, setStatus] = useState<Status>('OPEN');
  const [reports, setReports] = useState<QueueReport[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const page = await getReportQueue(status);
      setReports(page.items);
      setCursor(page.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { if (user?.role === 'admin') void load(); }, [load, user?.role]);

  const act = async (report: QueueReport, outcome: 'RESOLVED' | 'DISMISSED', removeTarget: boolean) => {
    try {
      await resolveReport(report.id, outcome, removeTarget);
      setReports((list) => list.filter((r) => r.targetId !== report.targetId));
      notify.success(removeTarget ? 'Content removed.' : outcome === 'DISMISSED' ? 'Report dismissed.' : 'Marked resolved.');
    } catch {
      notify.error("Couldn't update the report.");
    }
  };

  if (!authChecked) return null;
  if (user?.role !== 'admin') return <Navigate to="/home" replace />;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 pt-20 lg:p-8">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">Moderation queue</h1>
          <SortTabs
            value={status}
            onChange={setStatus}
            label="Report status"
            options={[{ value: 'OPEN', label: 'Open' }, { value: 'RESOLVED', label: 'Resolved' }, { value: 'DISMISSED', label: 'Dismissed' }]}
          />
        </div>

        {loading && <div className="space-y-2" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-surface-raised" />)}</div>}
        {error && <div role="alert" className="rounded-lg border border-border bg-surface p-4 text-sm">Couldn't load reports. <Button variant="link" onClick={load}>Retry</Button></div>}
        {!loading && !error && reports.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-text-muted">
            {status === 'OPEN' ? 'The queue is clear. Nothing needs review.' : 'Nothing here.'}
          </p>
        )}

        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs text-text-muted">
                {r.targetType === 'POST' ? 'Post' : 'Comment'} reported by {r.reporter.username ? `@${r.reporter.username}` : r.reporter.name} · {relativeTime(r.createdAt)}
              </p>
              <p className="mt-1 text-sm font-medium">
                {r.target
                  ? r.targetType === 'POST' && r.target.space
                    ? <Link to={`/ecosystem/s/${r.target.space.slug}/post/${r.target.id}`} className="hover:underline">{r.target.title}</Link>
                    : r.target.deletedAt ? 'Comment already deleted' : (r.target.body ?? '').slice(0, 200)
                  : 'Content no longer exists'}
              </p>
              <p className="mt-1 text-sm text-text-muted">Reason: {r.reason}</p>
              {status === 'OPEN' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="destructive" onClick={() => act(r, 'RESOLVED', true)}>Remove content</Button>
                  <Button size="sm" variant="outline" onClick={() => act(r, 'RESOLVED', false)}>Mark resolved</Button>
                  <Button size="sm" variant="ghost" onClick={() => act(r, 'DISMISSED', false)}>Dismiss</Button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {cursor && (
          <Button className="mt-4" variant="outline" onClick={async () => {
            const page = await getReportQueue(status, cursor);
            setReports((l) => [...l, ...page.items]); setCursor(page.nextCursor);
          }}>Load more</Button>
        )}
      </main>
    </div>
  );
}
