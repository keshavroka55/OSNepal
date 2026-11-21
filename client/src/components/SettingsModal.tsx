// client/src/components/SettingsModal.tsx
import { useState } from 'react';
import { X, Lock, Bell, User, ChevronRight } from 'lucide-react';
import MessagePolicyToggle from './MessagePolicyToggle';
import type { Profile } from '../features/profile/profile.type';

type SettingsTab = 'privacy' | 'notifications' | 'account';

interface SettingsModalProps {
  profile: Profile;
  onClose: () => void;
  onProfileUpdate: (updates: Partial<Profile>) => void;
}

const TABS: { key: SettingsTab; label: string; icon: typeof Lock; available: boolean }[] = [
  { key: 'privacy', label: 'Privacy', icon: Lock, available: true },
  { key: 'notifications', label: 'Notifications', icon: Bell, available: false },
  { key: 'account', label: 'Account', icon: User, available: false },
];

export default function SettingsModal({ profile, onClose, onProfileUpdate }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('privacy');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full h-full sm:h-auto sm:max-w-[720px] sm:max-h-[80vh] bg-background sm:rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.16)] flex flex-col sm:flex-row overflow-hidden">
        {/* Mobile header */}
        <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-[17px] font-semibold text-foreground">Settings</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Left nav — tabs */}
        <div className="sm:w-[220px] shrink-0 border-b sm:border-b-0 sm:border-r border-border p-2 sm:p-4">
          <h2 className="hidden sm:block text-[13px] font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-2">
            Settings
          </h2>
          <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  disabled={!tab.available}
                  onClick={() => tab.available && setActiveTab(tab.key)}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-[14px] font-medium whitespace-nowrap transition-colors shrink-0 ${
                    isActive
                      ? 'bg-primary/5 text-primary'
                      : tab.available
                        ? 'text-foreground hover:bg-accent'
                        : 'text-text-muted cursor-not-allowed'
                  }`}>
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                  {!tab.available && (
                    <span className="hidden sm:inline text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right content area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Desktop header */}
          <div className="hidden sm:flex items-center justify-between mb-6">
            <h3 className="text-[20px] font-semibold text-foreground">
              {TABS.find((t) => t.key === activeTab)?.label}
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          {activeTab === 'privacy' && (
            <MessagePolicyToggle
              initialPolicy={profile.messagePolicy || 'CONNECTIONS_ONLY'}
              onSuccess={(newPolicy) => onProfileUpdate({ messagePolicy: newPolicy })}
            />
          )}

          {/* Future tabs slot in here the same way, e.g.: */}
          {/* {activeTab === 'notifications' && <NotificationSettings ... />} */}
        </div>
      </div>
    </div>
  );
}