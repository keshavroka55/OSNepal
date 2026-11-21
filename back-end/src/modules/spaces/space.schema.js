import { z } from "zod";

export const slugParam = z.object({ slug: z.string().min(1).max(60) });

export const createSpaceBody = z.object({
  name: z.string().trim().min(3).max(40),
  description: z.string().trim().min(10).max(300),
  icon: z.string().trim().max(8).optional(), // a single emoji
  rules: z.string().trim().max(2000).optional(),
  isPrivate: z.boolean().default(false),
});
