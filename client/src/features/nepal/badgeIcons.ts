import {
  Award, GitMerge, GitPullRequest, Gem, Handshake, Heart, Landmark, Layers, Link2,
  Medal, MessagesSquare, Mountain, Rocket, Sparkles, Trophy,
  type LucideIcon,
} from 'lucide-react';

const BADGE_ICONS: Record<string, LucideIcon> = {
  'founding-member': Mountain,      // 🏔️
  'first-project': Rocket,          // 🚀
  'serial-builder': Layers,         // 🏗️
  'team-player': Handshake,         // 🤝
  'contributor': GitPullRequest,    // 🔧
  'core-contributor': GitMerge,     // ⚙️
  'crowd-favourite': Heart,         // ❤️
  'voice': MessagesSquare,          // 💬
  'connector': Link2,               // 🔗
  'backed': Gem,                    // 💎
  'verified-investor': Landmark,    // 🏦
  'angel': Sparkles,                // 😇
};

// Only used if you add a new badge and forget to map it here.
const TIER_ICONS: Record<string, LucideIcon> = {
  bronze: Medal,
  silver: Award,
  gold: Trophy,
};

export const getBadgeIcon = (badge: { key: string; tier?: string }): LucideIcon =>
  BADGE_ICONS[badge.key] ?? TIER_ICONS[badge.tier ?? ''] ?? Award;