import { useEffect, useState } from 'react';

// Chrome's "install app" event (not in the default TypeScript types)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

// Stored outside React because the event fires only once
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // hide Chrome's default banner, we show our own button
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });

  // After a successful install, hide the button
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

export function useInstallApp() {
  const [, rerender] = useState(0);

  // Re-render this component whenever the install state changes
  useEffect(() => {
    const update = () => rerender((n) => n + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  // Already opened as an installed app? Then no need to show anything.
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  // iPhone/iPad Safari has no install event, so we show a manual hint instead
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt(); // opens the system install dialog
    deferredPrompt = null;
    notify();
  };

  return {
    canInstall: deferredPrompt !== null && !isStandalone, // Android / Chrome
    showIOSHint: isIOS && !isStandalone, // iPhone Safari
    install,
  };
}