import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { Btn, Card, ChipInput, ErrorNote, Field, PageHeader, Spinner, UserAvatar, areaCls, inputCls } from '../../components/nepal/ui';
import { useAuth } from '../../contexts/AuthContext';
import { errMsg, myProfile, saveProfile } from '../../features/nepal/api';
import { SKILL_SUGGESTIONS } from '../../features/nepal/meta';
import { uploadAvatarAPI } from '../../features/users/userService';
import { useAsync } from '../../hooks/useAsync';
import MessagePolicyToggle from '../../components/MessagePolicyToggle';
import notify from '../../utils/notify';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth() as { user: Record<string, unknown> | null; setUser: (u: unknown) => void };
  const { data, loading, error } = useAsync(myProfile, []);
  const [f, setF] = useState({ name: '', headline: '', bio: '', location: '', website: '', githubUrl: '', linkedinUrl: '', firm: '', ticketSize: '', skills: [] as string[], focusAreas: [] as string[] });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!data) return;
    setF({ name: data.name, headline: data.headline ?? '', bio: data.bio ?? '', location: data.location ?? '', website: data.website ?? '', githubUrl: data.githubUrl ?? '', linkedinUrl: data.linkedinUrl ?? '', firm: data.firm ?? '', ticketSize: data.ticketSize ?? '', skills: data.skills ?? [], focusAreas: data.focusAreas ?? [] });
  }, [data]);

  if (loading) return <Spinner />;
  if (error || !data) return <ErrorNote message={error ?? 'Could not load profile'} />;
  const investor = data.role === 'investor';

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (file) await uploadAvatarAPI(file);
      const updated = await saveProfile(f);
      setUser({ ...user, ...updated });
      notify.success('Profile saved');
      navigate('/profile');
    } catch (err) { notify.error(errMsg(err)); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="mx-auto max-w-2xl">
      <SEO title="Edit profile" url="/profile/edit" noindex />
      <PageHeader title="Settings" subtitle="Your profile is how collaborators and investors find you." />
      <Card className="space-y-5">
        <div className="flex items-center gap-4">
          <UserAvatar user={{ name: f.name || 'You', avatar: file ? URL.createObjectURL(file) : data.avatar }} size="xl" />
          <div><label htmlFor="avatar" className="inline-flex h-9 cursor-pointer items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-surface-raised">Change photo</label><input id="avatar" type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /><p className="mt-1 text-xs text-text-muted">JPG or PNG, up to 5 MB</p></div>
        </div>
        <Field label="Full name" htmlFor="n"><input id="n" required className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Headline" htmlFor="h"><input id="h" className={inputCls} maxLength={80} value={f.headline} onChange={(e) => set('headline', e.target.value)} /></Field>
        <Field label="About" htmlFor="b"><textarea id="b" rows={4} maxLength={500} className={areaCls} value={f.bio} onChange={(e) => set('bio', e.target.value)} /></Field>
        <Field label="Location" htmlFor="l"><input id="l" className={inputCls} value={f.location} onChange={(e) => set('location', e.target.value)} /></Field>
        {investor ? (
          <>
            <Field label="Firm or fund" htmlFor="fi"><input id="fi" className={inputCls} value={f.firm} onChange={(e) => set('firm', e.target.value)} /></Field>
            <Field label="Ticket size" htmlFor="ts"><input id="ts" className={inputCls} value={f.ticketSize} onChange={(e) => set('ticketSize', e.target.value)} /></Field>
            <Field label="Focus areas"><ChipInput value={f.focusAreas} onChange={(v) => set('focusAreas', v)} /></Field>
          </>
        ) : <Field label="Skills"><ChipInput value={f.skills} onChange={(v) => set('skills', v)} suggestions={SKILL_SUGGESTIONS} /></Field>}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="GitHub" htmlFor="g"><input id="g" type="url" className={inputCls} placeholder="https://github.com/…" value={f.githubUrl} onChange={(e) => set('githubUrl', e.target.value)} /></Field>
          <Field label="LinkedIn" htmlFor="li"><input id="li" type="url" className={inputCls} value={f.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} /></Field>
          <Field label="Website" htmlFor="w"><input id="w" type="url" className={inputCls} value={f.website} onChange={(e) => set('website', e.target.value)} /></Field>
        </div>
      </Card>
      <Card className="mt-4"><h2 className="mb-2 font-semibold">Messaging</h2><MessagePolicyToggle initialPolicy={(data as unknown as { messagePolicy?: 'ANYONE' | 'CONNECTIONS_ONLY' }).messagePolicy ?? 'ANYONE'} /></Card>
      <div className="mt-5 flex justify-end gap-2"><Btn type="button" variant="ghost" onClick={() => navigate('/profile')}>Cancel</Btn><Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Btn></div>
    </form>
  );
}
