import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../src/prisma.js", () => ({ default: {} }));
vi.mock("../src/lib/redis.js", () => ({ default: { on: vi.fn(), get: vi.fn(), set: vi.fn() } }));

const { default: app } = await import("../src/app.js");
const { BADGES } = await import("../src/modules/badges/badge.definitions.js");

const SECRET = "test-secret-that-is-at-least-32-characters-long";
const cookieFor = (role) => `token=${jwt.sign({ id: "11111111-1111-4111-8111-111111111111", role }, SECRET)}`;
const ID = "22222222-2222-4222-8222-222222222222";

describe("Open Source Nepal access rules", () => {
  it("requires sign-in for join requests, notifications and investor actions", async () => {
    for (const [method, url] of [
      ["post", "/api/join-requests"],
      ["get", "/api/join-requests/received"],
      ["get", "/api/notifications"],
      ["post", "/api/investors/interest"],
      ["get", "/api/investors/admin/queue"],
    ]) {
      const res = await request(app)[method](url).send({});
      expect(res.status, `${method} ${url}`).toBe(401);
    }
  });

  it("only investors can request the Investor mark", async () => {
    const res = await request(app).post("/api/investors/interest").set("Cookie", cookieFor("developer")).send({ startupId: ID });
    expect(res.status).toBe(403);
  });

  it("only admins can review Investor-mark requests", async () => {
    for (const role of ["developer", "investor"]) {
      const res = await request(app).patch(`/api/investors/admin/${ID}`).set("Cookie", cookieFor(role)).send({ status: "APPROVED" });
      expect(res.status).toBe(403);
    }
  });

  it("only investors and admins can open deal flow", async () => {
    const res = await request(app).get("/api/investors/deal-flow").set("Cookie", cookieFor("developer"));
    expect(res.status).toBe(403);
  });

  it("validates join request bodies", async () => {
    const res = await request(app).post("/api/join-requests").set("Cookie", cookieFor("developer")).send({ startupId: "nope" });
    expect(res.status).toBe(400);
  });

  it("refuses to register an admin and ignores unknown roles", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "X", email: "x@example.com", password: "password123", role: "admin" });
    expect(res.status).toBe(400); // admin is not an allowed role in the schema
  });

  it("rejects an invalid leaderboard period or type", async () => {
    expect((await request(app).get("/api/leaderboards/rankings?period=yearly")).status).toBe(400);
    expect((await request(app).get("/api/leaderboards/rankings?type=NOPE")).status).toBe(400);
  });

  it("badge catalog has unique keys and every badge is checkable", () => {
    const keys = BADGES.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
    const empty = { projects: 0, memberships: 0, contributions: 0, verifiedContributions: 0, comments: 0, connections: 0, backedProjects: 0, approvedInterests: 0, likesReceived: 0, isInvestor: false, verified: false, joinedBeforeLaunchCutoff: false };
    expect(BADGES.every((b) => b.check(empty) === false)).toBe(true);
    expect(BADGES.find((b) => b.key === "first-project").check({ ...empty, projects: 1 })).toBe(true);
  });
});
