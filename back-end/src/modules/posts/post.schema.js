import { z } from "zod";

const id = z.string().uuid();

export const postIdParam = z.object({ id });

export const feedQuery = z.object({
  sort: z.enum(["hot", "new", "top"]).default("hot"),
  cursor: z.string().max(300).optional(),
  limit: z.coerce.number().int().min(1).max(30).default(15),
  space: z.string().max(60).optional(),
  author: id.optional(),
  startup: id.optional(),
  type: z.enum(["IDEA", "FEEDBACK", "DISCUSSION", "QUESTION", "SHOWCASE", "LINK"]).optional(),
});

export const createPostBody = z
  .object({
    spaceSlug: z.string().min(1).max(60),
    type: z.enum(["IDEA", "FEEDBACK", "DISCUSSION", "QUESTION", "SHOWCASE", "LINK"]).default("DISCUSSION"),
    title: z.string().trim().min(5).max(200),
    body: z.string().max(20000).default(""),
    linkUrl: z.string().url().max(2000).optional(),
    startupId: id.optional(),
    tags: z.array(z.string().trim().min(2).max(24)).max(5).default([]),
  })
  .refine((p) => p.type !== "LINK" || !!p.linkUrl, {
    message: "Link posts need a URL",
    path: ["linkUrl"],
  });

export const editPostBody = z.object({
  title: z.string().trim().min(5).max(200).optional(),
  body: z.string().max(20000).optional(),
});

export const voteBody = z.object({
  // 0 clears the vote
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

export const moderateBody = z.object({
  action: z.enum(["remove", "restore", "lock", "unlock"]),
});
