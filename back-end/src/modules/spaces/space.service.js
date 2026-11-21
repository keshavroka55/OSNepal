import prisma from "../../prisma.js";
import { AppError } from "../../utils/AppError.js";
import { generateSlug } from "../../utils/slug.util.js";

const spaceSelect = {
  id: true, slug: true, name: true, description: true, icon: true,
  rules: true, isPrivate: true, memberCount: true, createdAt: true,
};

// Returns the user's role in a space, treating site admins as moderators
// everywhere. Other modules use this for every moderation check.
export async function getSpaceRole(user, spaceId) {
  if (!user) return null;
  const member = await prisma.spaceMember.findUnique({
    where: { userId_spaceId: { userId: user.id, spaceId } },
    select: { role: true },
  });
  if (member) return member.role;
  return user.role === "admin" ? "MODERATOR" : null;
}

export const canModerate = (role) => role === "MODERATOR" || role === "OWNER";

export async function listSpaces(userId) {
  const spaces = await prisma.space.findMany({
    // Private spaces only appear to their members.
    where: userId
      ? { OR: [{ isPrivate: false }, { members: { some: { userId } } }] }
      : { isPrivate: false },
    orderBy: { memberCount: "desc" },
    take: 100,
    select: {
      ...spaceSelect,
      members: userId ? { where: { userId }, select: { role: true } } : false,
    },
  });
  return spaces.map(({ members, ...space }) => ({ ...space, viewerRole: members?.[0]?.role ?? null }));
}

export async function getSpace(slug, userId) {
  const space = await prisma.space.findUnique({
    where: { slug },
    select: {
      ...spaceSelect,
      members: {
        where: { OR: [{ role: { in: ["OWNER", "MODERATOR"] } }, ...(userId ? [{ userId }] : [])] },
        select: { role: true, user: { select: { id: true, name: true, username: true, avatar: true } } },
        take: 20,
      },
    },
  });
  if (!space) throw new AppError("Space not found", 404);

  const viewer = space.members.find((m) => m.user.id === userId);
  if (space.isPrivate && !viewer) throw new AppError("Space not found", 404);

  const { members, ...rest } = space;
  return {
    ...rest,
    viewerRole: viewer?.role ?? null,
    moderators: members.filter((m) => m.role !== "MEMBER").map((m) => ({ ...m.user, role: m.role })),
  };
}

async function uniqueSlug(name) {
  const base = generateSlug(name) || "space";
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    if (!(await prisma.space.findUnique({ where: { slug: candidate }, select: { id: true } }))) return candidate;
  }
  throw new AppError("Could not create a unique space name", 409);
}

export async function createSpace(userId, data) {
  const slug = await uniqueSlug(data.name);
  // The creator becomes OWNER in the same transaction so a space is never ownerless.
  return prisma.space.create({
    data: {
      ...data,
      slug,
      createdById: userId,
      memberCount: 1,
      members: { create: { userId, role: "OWNER" } },
    },
    select: spaceSelect,
  });
}

export async function joinSpace(userId, slug) {
  const space = await prisma.space.findUnique({ where: { slug }, select: { id: true, isPrivate: true } });
  if (!space) throw new AppError("Space not found", 404);
  // Private spaces have no invite flow yet, so they can't be joined directly.
  if (space.isPrivate) throw new AppError("This space is invite-only", 403);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.spaceMember.findUnique({
      where: { userId_spaceId: { userId, spaceId: space.id } },
    });
    if (existing) return { joined: true, memberCount: (await tx.space.findUnique({ where: { id: space.id } })).memberCount };

    await tx.spaceMember.create({ data: { userId, spaceId: space.id } });
    const updated = await tx.space.update({
      where: { id: space.id },
      data: { memberCount: { increment: 1 } },
      select: { memberCount: true },
    });
    return { joined: true, memberCount: updated.memberCount };
  });
}

export async function leaveSpace(userId, slug) {
  const space = await prisma.space.findUnique({ where: { slug }, select: { id: true } });
  if (!space) throw new AppError("Space not found", 404);

  return prisma.$transaction(async (tx) => {
    const membership = await tx.spaceMember.findUnique({
      where: { userId_spaceId: { userId, spaceId: space.id } },
    });
    if (!membership) return { joined: false };
    if (membership.role === "OWNER") throw new AppError("Owners can't leave their own space", 400);

    await tx.spaceMember.delete({ where: { id: membership.id } });
    const updated = await tx.space.update({
      where: { id: space.id },
      data: { memberCount: { decrement: 1 } },
      select: { memberCount: true },
    });
    return { joined: false, memberCount: updated.memberCount };
  });
}
