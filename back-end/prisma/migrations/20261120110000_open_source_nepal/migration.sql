-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('STARTUP', 'OPEN_SOURCE', 'LEARNING', 'IDEA', 'HARDWARE');
CREATE TYPE "ProjectStage" AS ENUM ('IDEA', 'BUILDING', 'BETA', 'LAUNCHED');
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "InvestorInterestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Existing "user" accounts become developers; new sign-ups default to developer.
UPDATE "users" SET "role" = 'developer' WHERE "role" = 'user';
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'developer';

-- AlterTable users
ALTER TABLE "users"
  ADD COLUMN "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "firm" TEXT,
  ADD COLUMN "focusAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "ticketSize" TEXT,
  ADD COLUMN "profileCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable startups
ALTER TABLE "startups" ALTER COLUMN "logo" DROP NOT NULL;
ALTER TABLE "startups" ALTER COLUMN "website_url" DROP NOT NULL;
ALTER TABLE "startups"
  ADD COLUMN "type" "ProjectType" NOT NULL DEFAULT 'STARTUP',
  ADD COLUMN "stage" "ProjectStage" NOT NULL DEFAULT 'IDEA',
  ADD COLUMN "problem" TEXT,
  ADD COLUMN "solution" TEXT,
  ADD COLUMN "target_users" TEXT,
  ADD COLUMN "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "lookingFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "roadmap" JSONB,
  ADD COLUMN "open_to_feedback" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "investor_backed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "investor_marked_at" TIMESTAMP(3),
  ADD COLUMN "investor_marked_by_id" TEXT;
CREATE INDEX "startups_type_status_idx" ON "startups"("type", "status");
CREATE INDEX "startups_investor_backed_idx" ON "startups"("investor_backed");
ALTER TABLE "startups" ADD CONSTRAINT "startups_investor_marked_by_id_fkey"
  FOREIGN KEY ("investor_marked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable notifications
ALTER TABLE "notifications" ADD COLUMN "message" TEXT, ADD COLUMN "link" TEXT;

-- CreateTable join_requests
CREATE TABLE "join_requests" (
  "id" TEXT NOT NULL,
  "startupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "roleWanted" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
  "respondedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "join_requests_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "join_requests_startupId_userId_key" ON "join_requests"("startupId", "userId");
CREATE INDEX "join_requests_userId_status_idx" ON "join_requests"("userId", "status");
CREATE INDEX "join_requests_startupId_status_idx" ON "join_requests"("startupId", "status");
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable project_members
CREATE TABLE "project_members" (
  "id" TEXT NOT NULL,
  "startupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'Contributor',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "project_members_startupId_userId_key" ON "project_members"("startupId", "userId");
CREATE INDEX "project_members_userId_idx" ON "project_members"("userId");
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable contributions
CREATE TABLE "contributions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "startupId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "url" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "contributions_userId_createdAt_idx" ON "contributions"("userId", "createdAt");
CREATE INDEX "contributions_startupId_idx" ON "contributions"("startupId");
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable badges / user_badges
CREATE TABLE "badges" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "tier" TEXT NOT NULL DEFAULT 'bronze',
  CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "badges_key_key" ON "badges"("key");
CREATE TABLE "user_badges" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable investor_interests
CREATE TABLE "investor_interests" (
  "id" TEXT NOT NULL,
  "investorId" TEXT NOT NULL,
  "startupId" TEXT NOT NULL,
  "note" TEXT,
  "status" "InvestorInterestStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "investor_interests_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "investor_interests_investorId_startupId_key" ON "investor_interests"("investorId", "startupId");
CREATE INDEX "investor_interests_status_createdAt_idx" ON "investor_interests"("status", "createdAt");
ALTER TABLE "investor_interests" ADD CONSTRAINT "investor_interests_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "investor_interests" ADD CONSTRAINT "investor_interests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "investor_interests" ADD CONSTRAINT "investor_interests_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
