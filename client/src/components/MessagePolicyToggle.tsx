// components/MessagePolicyToggle.tsx

import { useEffect, useState } from 'react';
import { Check, Globe, Loader2, Lock } from 'lucide-react';
import { api } from "../features/api/api";

type MessagePolicy = "ANYONE" | "CONNECTIONS_ONLY";

interface MessagePolicyToggleProps {
  initialPolicy: MessagePolicy;
  onSuccess?: (policy: MessagePolicy) => void;
}

export default function MessagePolicyToggle({
  initialPolicy,
  onSuccess,
}: MessagePolicyToggleProps) {
  const [policy, setPolicy] = useState<MessagePolicy>(initialPolicy);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setPolicy(initialPolicy);
  }, [initialPolicy]);

  async function handleChange(newPolicy: MessagePolicy) {
    if (newPolicy === policy || saving) return;

    setSaving(true);

    try {
      await api.patch("/api/users/me/message-policy", {
        messagePolicy: newPolicy,
      });

      setPolicy(newPolicy);
      setFeedback('Saved');
      window.setTimeout(() => setFeedback(null), 1800);

      onSuccess?.(newPolicy);
    } catch (error) {
      console.error(error);
      setFeedback('Save failed');
      window.setTimeout(() => setFeedback(null), 2200);
    } finally {
      setSaving(false);
    }
  }

  const options = [
    {
      value: 'ANYONE' as const,
      title: 'Anyone',
      description: 'Anyone on the platform can message you.',
      icon: Globe,
    },
    {
      value: 'CONNECTIONS_ONLY' as const,
      title: 'Connections only',
      description: 'Only users connected with you can message you.',
      icon: Lock,
    },
  ];

  return (
    <div className="w-full max-w-105 rounded-2xl border border-surface-raised bg-card p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-text">Message privacy</p>
          <p className="text-[13px] leading-5 text-text-text-muted">
            Control who can send you direct messages.
          </p>
        </div>
        {saving ? (
          <div className="flex items-center gap-2 text-[12px] text-text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving
          </div>
        ) : feedback ? (
          <div className={`text-[12px] font-medium ${feedback === 'Saved' ? 'text-success' : 'text-danger'}`}>
            {feedback}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map(option => {
          const Icon = option.icon;
          const isSelected = policy === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={saving}
              onClick={() => handleChange(option.value)}
              aria-pressed={isSelected}
              className={`group flex min-h-27 items-start gap-3 rounded-2xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(0,113,227,0.10)]'
                  : 'border-surface-raised bg-card hover:border-border hover:bg-secondary'
              } ${saving ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-text-text-muted group-hover:bg-surface-raised'}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-text">{option.title}</p>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </div>
                <p className="mt-1 text-[13px] leading-5 text-text-text-muted">{option.description}</p>
                {isSelected && (
                  <span className="mt-2 inline-flex items-center rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
                    Selected
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}