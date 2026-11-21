import prisma from "../prisma.js";
import { AppError } from "./AppError.js";

const NEW_ACCOUNT_MS = 48 * 60 * 60 * 1000;
const URL_PATTERN = /(https?:\/\/|www\.)\S+/i;

export const containsLink = (...texts) => texts.some((t) => t && URL_PATTERN.test(t));

// New accounts are the usual source of link spam, so for the first 48 hours
// they can discuss but not post links. Applies to posts and comments.
export async function assertLinksAllowed(userId, ...texts) {
  if (!containsLink(...texts)) return;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, role: true },
  });
  const isNew = Date.now() - user.createdAt.getTime() < NEW_ACCOUNT_MS;
  if (isNew && user.role !== "admin") {
    throw new AppError("New accounts can't post links yet. Try again in a couple of days.", 403);
  }
}
