import prisma from "../prisma.js";

const sanitize = (s) =>
  s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_.-]/g, "")
    .slice(0, 30);

export const generateUniqueUsername = async (base) => {
  let seed = base ? String(base) : "user" + Math.floor(Math.random() * 10000);
  seed = sanitize(seed);
  if (!seed) seed = "user" + Math.floor(Math.random() * 10000);

  let username = seed;
  let i = 0;
  // keep trying until unique
  while (await prisma.user.findUnique({ where: { username } })) {
    i += 1;
    username = `${seed}${i}`;
    if (i > 1000) {
      // fallback to random
      username = `${seed}${Math.floor(Math.random() * 100000)}`;
      break;
    }
  }
  return username;
};

export default generateUniqueUsername;
