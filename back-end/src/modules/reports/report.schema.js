import { z } from "zod";

const id = z.string().uuid();

export const createBody = z.object({
  targetType: z.enum(["POST", "COMMENT"]),
  targetId: id,
  reason: z.string().trim().min(3).max(500),
});

export const reportIdParam = z.object({ id });

export const queueQuery = z.object({
  status: z.enum(["OPEN", "RESOLVED", "DISMISSED"]).default("OPEN"),
  cursor: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const resolveBody = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]),
  // Lets an admin act on the content and close the report in one step.
  removeTarget: z.boolean().default(false),
});
