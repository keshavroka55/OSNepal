import { describe, it, expect, vi, beforeEach } from "vitest";

// A tiny in-memory stand-in for the parts of Prisma the vote logic touches.
const db = vi.hoisted(() => {
  const state = { votes: new Map(), post: null };
  const tx = {
    postVote: {
      findUnique: vi.fn(async ({ where }) => state.votes.get(where.userId_postId.userId) ?? null),
      upsert: vi.fn(async ({ where, update, create }) => {
        const key = where.userId_postId.userId;
        const row = state.votes.has(key) ? { ...state.votes.get(key), ...update } : { id: key, ...create };
        state.votes.set(key, row);
        return row;
      }),
      delete: vi.fn(async ({ where }) => state.votes.delete(where.id)),
    },
    post: {
      update: vi.fn(async ({ data }) => {
        if (data.score?.increment) state.post.score += data.score.increment;
        if (data.hotScore !== undefined) state.post.hotScore = data.hotScore;
        return { ...state.post };
      }),
    },
  };
  const prisma = {
    post: { findFirst: vi.fn(async () => ({ ...state.post })) },
    $transaction: vi.fn(async (fn) => fn(tx)),
  };
  return { state, tx, prisma };
});

vi.mock("../src/prisma.js", () => ({ default: db.prisma }));
vi.mock("../src/lib/redis.js", () => ({ default: { on: vi.fn() } }));

const { votePost } = await import("../src/modules/posts/post.service.js");

beforeEach(() => {
  db.state.votes.clear();
  db.state.post = { id: "p1", status: "PUBLISHED", score: 1, createdAt: new Date() };
});

describe("votePost", () => {
  it("adds an upvote and increments the score once", async () => {
    const result = await votePost("u1", "p1", 1);
    expect(result).toEqual({ score: 2, viewerVote: 1 });
  });

  it("switching from up to down moves the score by 2, not 1", async () => {
    await votePost("u1", "p1", 1);
    const result = await votePost("u1", "p1", -1);
    expect(result.score).toBe(0);
  });

  it("clearing a vote restores the previous score", async () => {
    await votePost("u1", "p1", 1);
    const result = await votePost("u1", "p1", 0);
    expect(result.score).toBe(1);
    expect(db.state.votes.has("u1")).toBe(false);
  });

  it("repeating the same vote does not double count", async () => {
    await votePost("u1", "p1", 1);
    const result = await votePost("u1", "p1", 1);
    expect(result.score).toBe(2);
  });

  it("refuses votes on locked posts", async () => {
    db.state.post.status = "LOCKED";
    await expect(votePost("u1", "p1", 1)).rejects.toMatchObject({ status: 409 });
  });
});
