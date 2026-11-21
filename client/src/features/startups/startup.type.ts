export type StartupStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

export type StartupFounder = {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  headline?: string;
  verified?: boolean;
};

export type StartupTeamMember = {
  name: string;
  role: string;
  bio?: string;
};

export type StartupCategory = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
};

export type StartupVote = {
  id: string;
  userId: string;
};

export type StartupComment = {
  id: string;
};

export type StartupBookmark = {
  id: string;
  userId: string;
};

export type StartupScreenshot = {
  id: string;
  imageUrl: string;
  position?: number;
};

export type StartupTag = {
  id: string;
  name: string;
  slug?: string;
};

export type Startup = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo: string;
  banner?: string | null;
  websiteUrl?: string;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  discordUrl?: string | null;
  linkedinUrl?: string | null;
  status: StartupStatus;
  featured?: boolean;
  launchDate?: string | null;
  totalVotes?: number;
  totalComments?: number;
  totalViews?: number;
  dailyRank?: number | null;
  weeklyRank?: number | null;
  monthlyRank?: number | null;
  founder?: StartupFounder;
  teamMembers?: StartupTeamMember[];
  category?: StartupCategory;
  votes?: StartupVote[];
  comments?: StartupComment[];
  bookmarks?: StartupBookmark[];
  screenshots?: StartupScreenshot[];
  tags?: StartupTag[];
  createdAt: string;
  updatedAt?: string;


};