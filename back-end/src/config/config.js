import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// Validate once at startup so a bad deploy fails immediately instead of
// failing on the first request that happens to need the missing value.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRATION: z.string().default("30d"),
  CLIENT_URL: z.string().min(1), // comma-separated list of allowed origins

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().min(1),

  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.coerce.number().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  FEED_TTL: z.coerce.number().default(10),
  PROJECT_TTL: z.coerce.number().default(15),
  COMMENT_TTL: z.coerce.number().default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Print variable names only, never values.
  const problems = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
  console.error(`Invalid environment configuration:\n${problems.join("\n")}`);
  process.exit(1);
}

export const config = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  allowedOrigins: parsed.data.CLIENT_URL.split(",").map((o) => o.trim()),
};
