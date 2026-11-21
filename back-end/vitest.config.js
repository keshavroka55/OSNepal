import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    // Dummy values so config validation passes without a real .env.
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      JWT_SECRET: "test-secret-that-is-at-least-32-characters-long",
      CLIENT_URL: "http://localhost:5173",
      GOOGLE_CLIENT_ID: "x",
      GOOGLE_CLIENT_SECRET: "x",
      GOOGLE_CALLBACK_URL: "http://localhost/cb",
    },
  },
});
