import prisma from "../../prisma.js";
import { AppError } from "../../utils/AppError.js";
import { hotScore } from "../../utils/hotRank.js";
import { generateSlug } from "../../utils/slug.util.js";
import { encodeCursor, decodeCursor } from "../../utils/cursor.js";
import { assertLinksAllowed } from "../../utils/spamGuard.js";
import { getOrSetCache, invalidateEcosystemFeeds } from "../../middleware/cacheAside.js";
import { config } from "../../config/config.js";
import { getSpaceRole, canModerate } from "../spaces/space.service.js";
import { postInclude, toPostDto } from "./post.dto.js";

// Column each sort orders by. Ties always break on id for stable paging.
const SORT_COLUMN = { hot: "hotScore", new: "createdAt", top: "score" };

const visibleTo = (userId) => ({
  deletedAt: null,
  status: { in: ["PUBLISHED", "LOCKED"] },
  space: userId
    ? { OR: [{ isPrivate: false }, { members: { some: { userId } } }] }
    : { isPrivate: false },
});

function cursorFilter(column, cursor) {
  const c = decodeCursor(cursor);
  if (!c) return {};
  const value = column === "createdAt" ? new Date(c.v) : c.v;
  return { OR: [{ [column]: { lt: value } }, { [column]: value, id: { lt: c.id } }] };
}

async function queryFeed({ sort, cursor, limit, space, author, startup, type }, userId) {
  const column = SORT_COLUMN[sort];
  const rows = await prisma.post.findMany({
    where: {
      ...visibleTo(userId),
      ...(space && { space: { slug: space, ...(visibleTo(userId).space) } }),
      ...(author && { authorId: author }),
      ...(startup && { startupId: startup }),
      ...(type && { type }),
      ...cursorFilter(column, cursor),
    },
    orderBy: [{ [column]: "desc" }, { id: "desc" }],
    take: limit + 1, // one extra row tells us whether another page exists
    include: postInclude(userId),
  });

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);
  const last = items.at(-1);
  return {
    items: items.map(toPostDto),
    nextCursor: hasMore && last ? encodeCursor(last[column], last.id) : null,
  };
}

export async function listFeed(query, userId) {
  // Anonymous readers all see the same thing, so cache it briefly.
  // Signed-in feeds carry personal vote state and skip the cache.
  if (userId) return queryFeed(query, userId);
  const key = `ecosystem:feed:${JSON.stringify(query)}`;
  return getOrSetCache(key, () => queryFeed(query, null), config.FEED_TTL);
}

export async function getPost(id, userId) {
  const post = await prisma.post.findFirst({
    where: { id, ...visibleTo(userId) },
    include: postInclude(userId),
  });
  if (!post) throw new AppError("Post not found", 404);
  return toPostDto(post);
}

// Connects existing tags or creates new ones, case-insensitively by slug.
async function tagConnectors(tx, names) {
  const slugs = [...new Set(names.map(generateSlug).filter(Boolean))];
  const links = [];
  for (const slug of slugs) {
    const tag = await tx.tag.upsert({
      where: { slug },
      update: {},
      create: { slug, name: slug },
    });
    links.push({ tagId: tag.id });
  }
  return links;
}

export async function createPost(user, data) {
  const space = await prisma.space.findUnique({ where: { slug: data.spaceSlug }, select: { id: true } });
  if (!space) throw new AppError("Space not found", 404);

  const role = await getSpaceRole(user, space.id);
  if (!role) throw new AppError("Join this space to post in it", 403);

  await assertLinksAllowed(user.id, data.body, data.linkUrl);

  if (data.startupId) {
    const startup = await prisma.startup.findUnique({
      where: { id: data.startupId },
      select: { status: true, founderId: true },
    });
    if (!startup) throw new AppError("Startup not found", 404);
    if (startup.status !== "published" && startup.founderId !== user.id) {
      throw new AppError("You can only attach published launches or your own", 403);
    }
  }

  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.post.create({
      data: {
        spaceId: space.id,
        authorId: user.id,
        type: data.type,
        title: data.title,
        body: data.body,
        linkUrl: data.linkUrl,
        startupId: data.startupId,
        // The author's own vote counts, as on Reddit.
        score: 1,
        hotScore: hotScore(1, new Date()),
        tags: { create: await tagConnectors(tx, data.tags) },
      },
    });
    await tx.postVote.create({ data: { userId: user.id, postId: created.id, value: 1 } });
    return created;
  });

  await invalidateEcosystemFeeds();
  return getPost(post.id, user.id);
}

async function loadPostForWrite(id) {
  const post = await prisma.post.findFirst({ where: { id, deletedAt: null } });
  if (!post) throw new AppError("Post not found", 404);
  return post;
}

export async function editPost(user, id, data) {
  const post = await loadPostForWrite(id);
  // Only the author edits; moderators can remove but not rewrite someone's words.
  if (post.authorId !== user.id) throw new AppError("You can only edit your own posts", 403);
  if (post.status !== "PUBLISHED") throw new AppError("This post can't be edited", 409);

  if (data.body) await assertLinksAllowed(user.id, data.body);

  await prisma.post.update({ where: { id }, data });
  await invalidateEcosystemFeeds();
  return getPost(id, user.id);
}

export async function deletePost(user, id) {
  const post = await loadPostForWrite(id);
  const role = await getSpaceRole(user, post.spaceId);
  if (post.authorId !== user.id && !canModerate(role)) {
    throw new AppError("Not allowed to delete this post", 403);
  }
  await prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
  await invalidateEcosystemFeeds();
  return { deleted: true };
}

export async function votePost(userId, id, value) {
  const post = await loadPostForWrite(id);
  if (post.status !== "PUBLISHED") throw new AppError("Voting is closed on this post", 409);

  // Counter and vote row change together, so score can never drift from votes.
  return prisma.$transaction(async (tx) => {
    const existing = await tx.postVote.findUnique({ where: { userId_postId: { userId, postId: id } } });
    const delta = value - (existing?.value ?? 0);

    if (value === 0) {
      if (existing) await tx.postVote.delete({ where: { id: existing.id } });
    } else {
      await tx.postVote.upsert({
        where: { userId_postId: { userId, postId: id } },
        update: { value },
        create: { userId, postId: id, value },
      });
    }

    const updated = delta === 0
      ? post
      : await tx.post.update({ where: { id }, data: { score: { increment: delta } } });

    const hot = hotScore(updated.score, post.createdAt);
    await tx.post.update({ where: { id }, data: { hotScore: hot } });
    return { score: updated.score, viewerVote: value };
  });
}

export async function toggleSave(userId, id) {
  await loadPostForWrite(id);
  const key = { userId_postId: { userId, postId: id } };
  const existing = await prisma.postSave.findUnique({ where: key });
  if (existing) {
    await prisma.postSave.delete({ where: key });
    return { saved: false };
  }
  await prisma.postSave.create({ data: { userId, postId: id } });
  return { saved: true };
}

const ACTION_STATUS = { remove: "REMOVED", restore: "PUBLISHED", lock: "LOCKED", unlock: "PUBLISHED" };

export async function moderatePost(user, id, action) {
  const post = await loadPostForWrite(id);
  const role = await getSpaceRole(user, post.spaceId);
  if (!canModerate(role)) throw new AppError("Moderators only", 403);

  await prisma.post.update({ where: { id }, data: { status: ACTION_STATUS[action] } });
  await invalidateEcosystemFeeds();
  return { status: ACTION_STATUS[action] };
}

// Hot scores decay with time, so a periodic job refreshes recent posts.
// Older posts have decayed so far that their order no longer changes.
export async function refreshHotScores() {
  return prisma.$executeRaw`
    UPDATE "posts"
    SET "hotScore" = "score" / POWER(EXTRACT(EPOCH FROM (NOW() - "createdAt")) / 3600 + 2, 1.5)
    WHERE "createdAt" > NOW() - INTERVAL '7 days' AND "deletedAt" IS NULL
  `;
}
