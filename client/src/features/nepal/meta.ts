import type { ProjectStage, ProjectType } from './types';

export const TYPE_META: Record<ProjectType, { label: string; plural: string; icon: string; tone: string; blurb: string }> = {
  STARTUP: { label: 'Startup', plural: 'Startups', icon: '🚀', tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-300', blurb: 'A venture with a business model' },
  OPEN_SOURCE: { label: 'Open Source', plural: 'Open Source', icon: '⚡', tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', blurb: 'Code anyone can use and improve' },
  LEARNING: { label: 'Learning', plural: 'Learning', icon: '🎓', tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300', blurb: 'Build to learn, with mentors and peers' },
  IDEA: { label: 'Idea', plural: 'Ideas', icon: '💡', tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300', blurb: 'Not built yet; looking for validation' },
  HARDWARE: { label: 'Hardware', plural: 'Hardware', icon: '🔌', tone: 'bg-rose-500/10 text-rose-700 dark:text-rose-300', blurb: 'IoT, robotics and physical products' },
};

export const STAGE_META: Record<ProjectStage, { label: string }> = {
  IDEA: { label: 'Idea' },
  BUILDING: { label: 'Building' },
  BETA: { label: 'Beta' },
  LAUNCHED: { label: 'Launched' },
};

export const TYPES = Object.keys(TYPE_META) as ProjectType[];
export const STAGES = Object.keys(STAGE_META) as ProjectStage[];

export const LOOKING_FOR_SUGGESTIONS = [
  'Frontend Developer', 'Backend Developer', 'Mobile Developer', 'UI/UX Designer', 'Marketing', 'Sales',
  'Co-founder', 'Data Scientist', 'IoT Engineer', 'Technical Writer', 'Community Manager', 'Mentor',
];

export const SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'TypeScript', 'Python', 'Go', 'Flutter', 'React Native', 'PostgreSQL', 'Docker',
  'Figma', 'Product', 'Marketing', 'Sales', 'Machine Learning', 'Embedded', 'Arduino',
];

export const timeAgo = (iso: string) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const units: [number, string][] = [[31536000, 'y'], [2592000, 'mo'], [604800, 'w'], [86400, 'd'], [3600, 'h'], [60, 'm']];
  for (const [secs, label] of units) if (s >= secs) return `${Math.floor(s / secs)}${label} ago`;
  return 'just now';
};

export const imgUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${path}`;
};
