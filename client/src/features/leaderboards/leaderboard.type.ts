export enum LeaderboardType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  ALL_TIME = "ALL_TIME",
  FOUNDERS = "FOUNDERS",
}

export interface LeaderboardEntry {
  id: string;
  startupId: string;
  type: LeaderboardType;
  rank: number;
  score: number;
  calculatedAt: string;
  // optional relation – adjust fields to match your Startup model
  startup?: {
    id: string;
    name: string;
    logo?: string;
    category?: string;
    tagline?: string;
  };
}