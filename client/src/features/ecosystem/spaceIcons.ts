import {
  Lightbulb,
  MessageSquareText,
  Handshake,
  Hammer,
  GraduationCap,
  Cpu,
  Hash,
  type LucideIcon,
} from 'lucide-react';

const SPACE_ICONS: Record<string, LucideIcon> = {
  'lightbulb': Lightbulb,
  'message-square-text': MessageSquareText,
  'handshake': Handshake,
  'hammer': Hammer,
  'graduation-cap': GraduationCap,
  'cpu': Cpu,
};

export const getSpaceIcon = (key?: string | null): LucideIcon =>
  (key && SPACE_ICONS[key]) || Hash;