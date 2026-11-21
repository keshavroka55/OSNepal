// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-passphrase' node src/scripts/createFirstAdmin.js
// Credentials come from the environment so no password lives in the repo.
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";
import { generateUniqueUsername } from "../utils/username.util.js";

async function createFirstAdmin() {
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
  if (!email || !password || password.length < 12) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters).");
  }

  if (await prisma.user.findUnique({ where: { email } })) {
    console.info("A user with that email already exists.");
    return;
  }

  await prisma.user.create({
    data: {
      name: "Admin",
      email,
      password: await bcrypt.hash(password, 12),
      role: "admin",
      emailVerified: true,
      username: await generateUniqueUsername("admin"),
    },
  });
  console.info(`Admin created: ${email}`);
}

createFirstAdmin()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
