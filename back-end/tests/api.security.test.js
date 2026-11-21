import { describe, it, expect, vi } from "vitest";
import request from "supertest";

// The app imports Prisma and Redis at load time; stub both so no services are needed.
vi.mock("../src/prisma.js", () => ({ default: {} }));
vi.mock("../src/lib/redis.js", () => ({ default: { on: vi.fn(), get: vi.fn(), set: vi.fn() } }));

const { default: app } = await import("../src/app.js");

describe("API security basics", () => {
  it("serves a health check", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
  });

  it("sets security headers", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("rejects mutating requests from unknown origins (CSRF)", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Origin", "https://evil.example")
      .send({});
    expect(res.status).toBe(403);
  });

  it("requires sign-in to post, vote and comment", async () => {
    const id = "11111111-1111-4111-8111-111111111111";
    for (const [method, path] of [
      ["post", "/api/posts"],
      ["post", `/api/posts/${id}/vote`],
      ["post", `/api/post-comments/post/${id}`],
      ["post", "/api/reports"],
    ]) {
      const res = await request(app)[method](path).send({});
      expect(res.status, `${method} ${path}`).toBe(401);
    }
  });

  it("keeps the admin report queue admin-only", async () => {
    expect((await request(app).get("/api/reports")).status).toBe(401);
  });

  it("no longer exposes the removed backdoor routes", async () => {
    expect((await request(app).post("/api/auth/keshav-register").send({})).status).toBe(404);
    expect((await request(app).patch("/api/auth/role").send({ role: "admin" })).status).toBe(404);
    expect((await request(app).get("/api/db-test")).status).toBe(404);
  });

  it("validates feed query parameters", async () => {
    const res = await request(app).get("/api/posts?sort=bogus");
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toBe("sort");
  });
});
