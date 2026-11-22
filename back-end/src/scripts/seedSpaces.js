// Usage: node src/scripts/seedSpaces.js   (run once after the ecosystem migration)
// Creates the starter spaces, owned by the first admin. Safe to re-run.
import prisma from "../prisma.js";

const SPACES = [
  { slug: "ideas", name: "Ideas", icon: "lightbulb", description: "Share a raw idea and let the community sharpen it before you build.", rules: "Describe the problem first, then your idea. Say who feels the pain." },
  { slug: "feedback", name: "Feedback", icon: "message-square-text", description: "Get honest critique on your product, prototype or pitch from people outside your team.", rules: "Give feedback before you ask for it. Critique the work, not the person." },
  { slug: "cofounder-hub", name: "Co-founder Hub", icon: "handshake", description: "Technical founder looking for a business partner, or the other way round.", rules: "Be clear about commitment, equity expectations and what you bring." },
  { slug: "build-in-public", name: "Build in Public", icon: "hammer", description: "Share progress, numbers and lessons while you build.", rules: "Be specific. No pure self-promotion." },
  { slug: "learn-and-contribute", name: "Learn & Contribute", icon: "graduation-cap", description: "Students and beginners: find a good first project and ask for mentorship.", rules: "No question is too basic. Say what you already tried." },
  { slug: "hardware-lab", name: "Hardware Lab", icon: "cpu", description: "IoT, embedded and robotics builders in Nepal.", rules: "Share parts lists, schematics and where you are stuck." },
];

async function seed() {
  const admin = await prisma.user.findFirst({ where: { role: "admin" }, select: { id: true } });
  if (!admin) throw new Error("Create an admin first (createFirstAdmin.js).");

  for (const space of SPACES) {
    const exists = await prisma.space.findUnique({ where: { slug: space.slug } });

    if (exists) {
      await prisma.space.update({ where: { slug: space.slug }, data: { icon: space.icon } });
      console.info(`Updated icon: ${space.name}`);
      continue;
    }
    
    await prisma.space.create({
      data: { ...space, createdById: admin.id, memberCount: 1, members: { create: { userId: admin.id, role: "OWNER" } } },
    });
    console.info(`Created space: ${space.name}`);
  }
}

seed()
  .catch((err) => { console.error(err.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
