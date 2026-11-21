import type { Startup } from '../startups/startup.type';

export type PublicProfile = {
  id: string;
  name: string;
  username?: string;
  email?: string;
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
  createdAt: string;
  startups?: Startup[];
  comments?: { id: string; content?: string; createdAt?: string }[];
  followers?: { id: string; followerId?: string }[];
  follows?: { id: string; followingId?: string }[];


};