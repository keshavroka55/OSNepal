export type ProjectType = 'STARTUP' | 'OPEN_SOURCE' | 'LEARNING' | 'IDEA' | 'HARDWARE';
export type ProjectStage = 'IDEA' | 'BUILDING' | 'BETA' | 'LAUNCHED';
export type Role = 'developer' | 'investor' | 'admin' | 'user';

export interface Person {
  id: string;
  name: string;
  username?: string | null;
  avatar?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  skills?: string[];
  role?: Role;
  verified?: boolean;
  reputationPoints?: number;
  firm?: string | null;
  focusAreas?: string[];
  ticketSize?: string | null;
  connectionStatus?: 'NONE' | 'PENDING' | 'ACCEPTED';
  _count?: { startups: number; memberships: number; contributions: number; badges: number };
}

export interface Category { id: string; name: string; slug: string }

export interface Member { id: string; role: string; joinedAt: string; user: Person }

export interface ProjectComment {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  user: Person;
  replies: ProjectComment[];
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo?: string | null;
  banner?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  type: ProjectType;
  stage: ProjectStage;
  status: string;
  problem?: string | null;
  solution?: string | null;
  targetUsers?: string | null;
  features: string[];
  lookingFor: string[];
  roadmap?: { title: string; status: 'done' | 'in-progress' | 'planned'; date?: string }[] | null;
  openToFeedback: boolean;
  investorBacked: boolean;
  investorMarkedAt?: string | null;
  totalVotes: number;
  totalComments: number;
  totalViews: number;
  createdAt: string;
  founder: Person;
  category: Category;
  tags: { id: string; name: string }[];
  votes?: { id: string; userId: string }[];
  bookmarks?: { id: string; userId: string }[];
  members?: Member[];
  comments?: ProjectComment[];
}

export interface Paged<T> { data: T[]; pagination: { total: number; page: number; limit: number; pages: number } }

export type JoinStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export interface JoinRequest {
  id: string;
  roleWanted: string;
  message: string;
  status: JoinStatus;
  createdAt: string;
  user?: Person;
  startup: { id: string; name: string; slug: string; logo?: string | null; type: ProjectType; tagline?: string };
}

export interface NotificationItem {
  id: string;
  type: string;
  message?: string | null;
  link?: string | null;
  read: boolean;
  createdAt: string;
  actor?: Person | null;
  startup?: { id: string; name: string; slug: string } | null;
}

export interface BadgeDef { id?: string; key: string; name: string; description: string; icon: string; tier: string; awardedAt?: string }

export interface Ranking {
  rank: number;
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logo?: string | null;
  type: ProjectType;
  stage: ProjectStage;
  score: number;
  totalVotes: number;
  totalComments: number;
  investorBacked: boolean;
  lookingFor: string[];
  category: Category;
  founder: Person;
  _count: { members: number };
}

export interface Contribution {
  id: string;
  title: string;
  description?: string | null;
  url?: string | null;
  verified: boolean;
  createdAt: string;
  startup: { id: string; name: string; slug: string; logo?: string | null; type: ProjectType };
  user: Person;
}

export interface InterestRow {
  id: string;
  note?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  startup: Pick<Project, 'id' | 'name' | 'slug' | 'logo' | 'tagline' | 'type' | 'stage' | 'totalVotes' | 'investorBacked' | 'category' | 'founder'>;
  investor?: Person;
}

export interface PublicProfile extends Person {
  createdAt: string;
  website?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  startups: { id: string; name: string; slug: string; tagline: string; logo?: string | null; totalVotes: number; totalComments: number }[];
  badges: { id: string; awardedAt: string; badge: BadgeDef }[];
  memberships: { role: string; startup: { id: string; name: string; slug: string; logo?: string | null; type: ProjectType } }[];
  followers: { id: string }[];
  follows: { id: string }[];
}
