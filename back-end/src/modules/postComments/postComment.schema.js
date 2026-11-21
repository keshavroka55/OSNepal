import { z } from "zod";

const id = z.string().uuid();

export const postIdParam = z.object({ postId: id });
export const commentIdParam = z.object({ id });

export const listQuery = z.object({
  sort: z.enum(["best", "new"]).default("best"),
  cursor: z.string().max(300).optional(),
  limit: z.coerce.number().int().min(1).max(30).default(15),
});

export const createBody = z.object({
  body: z.string().trim().min(1).max(10000),
  parentId: id.optional(),
});

export const editBody = z.object({ body: z.string().trim().min(1).max(10000) });

export const voteBody = z.object({
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});
