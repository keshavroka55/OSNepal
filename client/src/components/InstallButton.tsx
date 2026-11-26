import { Download, Share } from 'lucide-react';
import { useInstallApp } from '../hooks/useInstallApp';

export default function InstallAppButton() {
  const { canInstall, showIOSHint, install } = useInstallApp();

  // Android / Chrome: real install button
  if (canInstall) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface-muted"
      >
        <Download className="size-4" aria-hidden />
        Download the app
      </button>
    );
  }

  // iPhone: Apple does not allow a button, so explain the steps
  if (showIOSHint) {
    return (
      <p className="text-sm text-text-muted">
        Get the app: tap <Share className="inline size-4" aria-hidden /> then “Add to Home Screen”.
      </p>
    );
  }

  // Desktop or unsupported browser: show nothing
  return null;
}