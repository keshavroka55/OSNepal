// Single source of truth for badges. `check` receives a stats object
// (see collectStats in badge.service.js) and returns true when earned.
export const BADGES = [
  { key: "founding-member", name: "Founding Member", icon: "🏔️", tier: "gold", description: "Joined Open Source Nepal in its early days.", check: (s) => s.joinedBeforeLaunchCutoff },
  { key: "first-project", name: "First Launch", icon: "🚀", tier: "bronze", description: "Published your first project.", check: (s) => s.projects >= 1 },
  { key: "serial-builder", name: "Serial Builder", icon: "🏗️", tier: "silver", description: "Published 3 or more projects.", check: (s) => s.projects >= 3 },
  { key: "team-player", name: "Team Player", icon: "🤝", tier: "bronze", description: "Joined a project team.", check: (s) => s.memberships >= 1 },
  { key: "contributor", name: "Contributor", icon: "🔧", tier: "bronze", description: "Listed your first contribution.", check: (s) => s.contributions >= 1 },
  { key: "core-contributor", name: "Core Contributor", icon: "⚙️", tier: "gold", description: "5 contributions verified by project owners.", check: (s) => s.verifiedContributions >= 5 },
  { key: "crowd-favourite", name: "Crowd Favourite", icon: "❤️", tier: "silver", description: "Your projects earned 25 likes.", check: (s) => s.likesReceived >= 25 },
  { key: "voice", name: "Voice of the Community", icon: "💬", tier: "bronze", description: "Left 10 comments or feedback replies.", check: (s) => s.comments >= 10 },
  { key: "connector", name: "Connector", icon: "🔗", tier: "bronze", description: "Made 5 connections.", check: (s) => s.connections >= 5 },
  { key: "backed", name: "Investor Backed", icon: "💎", tier: "gold", description: "A project of yours earned the Investor mark.", check: (s) => s.backedProjects >= 1 },
  { key: "verified-investor", name: "Verified Investor", icon: "🏦", tier: "gold", description: "Verified by the Open Source Nepal team.", check: (s) => s.isInvestor && s.verified },
  { key: "angel", name: "Angel", icon: "😇", tier: "silver", description: "Investor mark approved on a project.", check: (s) => s.approvedInterests >= 1 },
];

export const BADGE_BY_KEY = Object.fromEntries(BADGES.map((b) => [b.key, b]));
