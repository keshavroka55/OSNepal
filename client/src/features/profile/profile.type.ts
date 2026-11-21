import type { Startup, StartupFounder } from '../startups/startup.type';

export type Profile = {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: 'user' | 'admin' | string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  headline?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  verified?: boolean;
  reputationPoints?: number;
  messagePolicy?: 'ANYONE' | 'CONNECTIONS_ONLY';
  createdAt?: string;
  joinedDate?: string;
  startups?: Startup[];
  comments?: { id: string; content?: string; createdAt?: string }[];
  votes?: { id: string; startupId?: string; createdAt?: string }[];
  bookmarks?: { id: string; startupId?: string }[];
  followers?: { id: string; followerId?: string }[];
  follows?: { id: string; followingId?: string }[];


};