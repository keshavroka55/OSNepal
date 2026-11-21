-- Enum values must be committed before they can be used, so they live in
-- their own migration. Everything that uses them is in the next one.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'developer';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'investor';

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'JOIN_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'JOIN_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'JOIN_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'INVESTOR_INTEREST';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'INVESTOR_MARK';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BADGE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CONNECTION';

ALTER TYPE "PostType" ADD VALUE IF NOT EXISTS 'IDEA';
ALTER TYPE "PostType" ADD VALUE IF NOT EXISTS 'FEEDBACK';
