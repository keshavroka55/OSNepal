// Usage: node src/scripts/seedBadges.js   (safe to re-run)
import prisma from "../prisma.js";
import { syncBadgeCatalog } from "../modules/badges/badge.service.js";

syncBadgeCatalog()
  .then(() => console.info("Badge catalog synced"))
  .catch((err) => { console.error(err.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
