import { describe, it, expect, vi } from "vitest";

// spamGuard imports Prisma; the pure helper under test never touches it.
vi.mock("../src/prisma.js", () => ({ default: {} }));
import { hotScore } from "../src/utils/hotRank.js";
import { sanitizeMarkdown } from "../src/utils/markdown.js";
import { encodeCursor, decodeCursor } from "../src/utils/cursor.js";
const { containsLink } = await import("../src/utils/spamGuard.js");

describe("hotScore", () => {
  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 3_600_000);

  it("ranks a fresh post above an older post with the same score", () => {
    expect(hotScore(10, hoursAgo(1), now)).toBeGreaterThan(hotScore(10, hoursAgo(24), now));
  });

  it("lets a fresh post beat an older post with more votes", () => {
    expect(hotScore(5, hoursAgo(1), now)).toBeGreaterThan(hotScore(20, hoursAgo(48), now));
  });

  it("keeps negative scores negative and finite", () => {
    const value = hotScore(-3, hoursAgo(0), now);
    expect(value).toBeLessThan(0);
    expect(Number.isFinite(value)).toBe(true);
  });
});

describe("sanitizeMarkdown", () => {
  it("strips HTML tags", () => {
    expect(sanitizeMarkdown('hi <script>alert(1)</script> <img src=x onerror=y>')).not.toMatch(/<|>/);
  });
  it("neutralises javascript: links but keeps normal ones", () => {
    expect(sanitizeMarkdown("[x](javascript:alert(1))")).toBe("[x](#)");
    expect(sanitizeMarkdown("[ok](https://example.com)")).toBe("[ok](https://example.com)");
  });
  it("handles empty input", () => {
    expect(sanitizeMarkdown(null)).toBe("");
  });
});

describe("cursor", () => {
  it("round-trips", () => {
    expect(decodeCursor(encodeCursor(42, "abc"))).toEqual({ v: 42, id: "abc" });
  });
  it("returns null for garbage", () => {
    expect(decodeCursor("not-a-cursor!!")).toBeNull();
    expect(decodeCursor(undefined)).toBeNull();
  });
});

describe("containsLink", () => {
  it("detects urls", () => {
    expect(containsLink("see https://spam.example")).toBe(true);
    expect(containsLink("visit www.spam.example")).toBe(true);
    expect(containsLink("no links here")).toBe(false);
  });
});
