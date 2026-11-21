import { useState } from 'react';
import { createReport } from '../api/ecosystemApi';
import { notify } from '../../../utils/notify';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

interface ReportDialogProps {
  target: { type: 'POST' | 'COMMENT'; id: string } | null;
  onClose: () => void;
}

export function ReportDialog({ target, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!target || reason.trim().length < 3) return;
    setSending(true);
    try {
      await createReport(target.type, target.id, reason.trim());
      notify.success('Thanks. A moderator will take a look.');
      setReason('');
      onClose();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      notify.error(message ?? "Couldn't send the report.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this {target?.type === 'POST' ? 'post' : 'comment'}</DialogTitle>
          <DialogDescription>Tell us what's wrong. Reports are private.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="report-reason">Reason</Label>
          <Textarea
            id="report-reason"
            value={reason}
            maxLength={500}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Spam, harassment, off-topic..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={sending || reason.trim().length < 3}>
            {sending ? 'Sending...' : 'Send report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
