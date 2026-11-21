import prisma from "../../prisma.js";
import { AppError } from "../../utils/AppError.js";
import { sanitizeMarkdown } from "../../utils/markdown.js";
import { assertLinksAllowed } from "../../utils/spamGuard.js";
import { emitToRoom, postRoom, userRoom } from "../../lib/realtime.js";
import { getSpaceRole, canModerate } from "../spaces/space.service.js";

// How deep replies may nest. Replies to a comment at the limit attach to its
// parent instead, which keeps threads readable on a phone.
const MAX_DEPTH = 6;
// How many levels a single list call returns; deeper replies load on demand.
const LEVELS_PER_REQUEST = 3;
const REPLIES_PER_LEVEL = 200;

const authorSelect = { id: true, name: true, username: true, avatar: true, verified: true };

const orderFor = (sort) =>
  sort === "new"
    ? [{ createdAt: "desc" }, { id: "desc" }]
    : [{ score: "desc" }, { createdAt: "asc" }, { id: "asc" }];

function toDto(comment, voteMap) {
  const deleted = Boolean(comment.deletedAt);
  return {
    id: comment.id,
    postId: comment.postId,
    parentId: comment.parentId,
    depth: comment.depth,
    // Deleted comments stay as placeholders so replies keep their context.
    body: deleted ? "" : sanitizeMarkdown(comment.body),
    author: deleted ? null : comment.author,
    deleted,
    score: comment.score,
    replyCount: comment.replyCount,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    viewerVote: voteMap.get(comment.id) ?? 0,
    replies: [],
  };
}

async function viewerVotes(userId, ids) {
  if (!userId || ids.length === 0) return new Map();
  const votes = await prisma.commentVote.findMany({
    where: { userId, commentId: { in: ids } },
    select: { commentId: true, value: true },
  });
  return new Map(votes.map((v) => [v.commentId, v.value]));
}

async function assertCanReadPost(postId, userId) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      deletedAt: null,
      status: { in: ["PUBLISHED", "LOCKED"] },
      space: userId
        ? { OR: [{ isPrivate: false }, { members: { some: { userId } } }] }
        : { isPrivate: false },
    },
    select: { id: true, status: true, authorId: true, spaceId: true },
  });
  if (!post) throw new AppError("Post not found", 404);
  return post;
}

// Loads `levels` generations below `parents` with one query per generation,
// not one per comment.
async function attachReplies(parents, levels, sort, userId) {
  const all = [...parents];
  let current = parents;
  for (let i = 0; i < levels && current.length > 0; i++) {
    const ids = current.filter((c) => c.replyCount > 0).map((c) => c.id);
    if (ids.length === 0) break;
    const children = await prisma.postComment.findMany({
      where: { parentId: { in: ids } },
      orderBy: orderFor(sort),
      take: REPLIES_PER_LEVEL,
      include: { author: { select: authorSelect } },
    });
    all.push(...children);
    current = children;
  }
  return all;
}

function buildTree(rows, rootIds, voteMap) {
  const nodes = new Map(rows.map((r) => [r.id, toDto(r, voteMap)]));
  for (const row of rows) {
    const parent = row.parentId && nodes.get(row.parentId);
    if (parent) parent.replies.push(nodes.get(row.id));
  }
  return rootIds.map((id) => nodes.get(id));
}

export async function listComments(postId, { sort, cursor, limit }, userId) {
  await assertCanReadPost(postId, userId);

  const roots = await prisma.postComment.findMany({
    where: { postId, parentId: null },
    orderBy: orderFor(sort),
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor } }),
    take: limit + 1,
    include: { author: { select: authorSelect } },
  });
  const hasMore = roots.length > limit;
  const page = roots.slice(0, limit);

  const rows = await attachReplies(page, LEVELS_PER_REQUEST, sort, userId);
  const voteMap = await viewerVotes(userId, rows.map((r) => r.id));

  return {
    items: buildTree(rows, page.map((r) => r.id), voteMap),
    nextCursor: hasMore ? page.at(-1).id : null,
  };
}

// "Load more replies": children of one comment, with their next few levels.
export async function listReplies(commentId, { sort }, userId) {
  const parent = await prisma.postComment.findUnique({ where: { id: commentId } });
  if (!parent) throw new AppError("Comment not found", 404);
  await assertCanReadPost(parent.postId, userId);

  const children = await prisma.postComment.findMany({
    where: { parentId: commentId },
    orderBy: orderFor(sort),
    take: REPLIES_PER_LEVEL,
    include: { author: { select: authorSelect } },
  });
  const rows = await attachReplies(children, LEVELS_PER_REQUEST - 1, sort, userId);
  const voteMap = await viewerVotes(userId, rows.map((r) => r.id));
  return { items: buildTree(rows, children.map((c) => c.id), voteMap) };
}

export async function createComment(user, postId, { body, parentId }) {
  const post = await assertCanReadPost(postId, user.id);
  if (post.status === "LOCKED") throw new AppError("This thread is locked", 403);

  await assertLinksAllowed(user.id, body);

  let parent = null;
  if (parentId) {
    parent = await prisma.postComment.findFirst({ where: { id: parentId, postId } });
    if (!parent) throw new AppError("Parent comment not found", 404);
    if (parent.deletedAt) throw new AppError("You can't reply to a deleted comment", 409);
    // Flatten replies that would exceed the depth limit.
    if (parent.depth + 1 > MAX_DEPTH && parent.parentId) {
      parent = await prisma.postComment.findUnique({ where: { id: parent.parentId } });
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const comment = await tx.postComment.create({
      data: {
        postId,
        authorId: user.id,
        parentId: parent?.id ?? null,
        depth: parent ? parent.depth + 1 : 0,
        body,
        score: 1, // the author's own upvote
      },
      include: { author: { select: authorSelect } },
    });
    await tx.commentVote.create({ data: { userId: user.id, commentId: comment.id, value: 1 } });
    const updatedPost = await tx.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
      select: { commentCount: true },
    });
    if (parent) {
      await tx.postComment.update({ where: { id: parent.id }, data: { replyCount: { increment: 1 } } });
    }
    return { comment, commentCount: updatedPost.commentCount };
  });

  // Realtime: update open pages, and tell the person being replied to.
  emitToRoom(postRoom(postId), "post:commentCount", { postId, commentCount: result.commentCount });
  const notifyId = parent?.authorId ?? post.authorId;
  if (notifyId !== user.id) {
    emitToRoom(userRoom(notifyId), "reply:new", {
      postId,
      commentId: result.comment.id,
      from: { id: user.id, name: result.comment.author.name },
    });
  }

  return toDto(result.comment, new Map([[result.comment.id, 1]]));
}

async function loadComment(id) {
  const comment = await prisma.postComment.findUnique({ where: { id } });
  if (!comment || comment.deletedAt) throw new AppError("Comment not found", 404);
  return comment;
}

export async function editComment(user, id, { body }) {
  const comment = await loadComment(id);
  if (comment.authorId !== user.id) throw new AppError("You can only edit your own comments", 403);

  await assertLinksAllowed(user.id, body);
  const updated = await prisma.postComment.update({
    where: { id },
    data: { body },
    include: { author: { select: authorSelect } },
  });
  const voteMap = await viewerVotes(user.id, [id]);
  return toDto(updated, voteMap);
}

export async function deleteComment(user, id) {
  const comment = await loadComment(id);
  const post = await prisma.post.findUnique({ where: { id: comment.postId }, select: { spaceId: true } });
  const role = await getSpaceRole(user, post.spaceId);
  if (comment.authorId !== user.id && !canModerate(role)) {
    throw new AppError("Not allowed to delete this comment", 403);
  }

  const { commentCount } = await prisma.$transaction(async (tx) => {
    await tx.postComment.update({ where: { id }, data: { deletedAt: new Date(), body: "" } });
    return tx.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
      select: { commentCount: true },
    });
  });

  emitToRoom(postRoom(comment.postId), "post:commentCount", { postId: comment.postId, commentCount });
  return { deleted: true };
}

export async function voteComment(userId, id, value) {
  const comment = await loadComment(id);
  await assertCanReadPost(comment.postId, userId);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.commentVote.findUnique({ where: { userId_commentId: { userId, commentId: id } } });
    const delta = value - (existing?.value ?? 0);

    if (value === 0) {
      if (existing) await tx.commentVote.delete({ where: { id: existing.id } });
    } else {
      await tx.commentVote.upsert({
        where: { userId_commentId: { userId, commentId: id } },
        update: { value },
        create: { userId, commentId: id, value },
      });
    }

    const updated = delta === 0
      ? comment
      : await tx.postComment.update({ where: { id }, data: { score: { increment: delta } } });
    return { score: updated.score, viewerVote: value };
  });
}
