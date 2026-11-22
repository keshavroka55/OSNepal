// Usage: node src/scripts/seedDemo.js
// Loads categories plus a small, realistic Nepal-flavoured dataset so a fresh
// install is not empty. Development only: it creates accounts with a known password.
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";
import { generateSlug } from "../utils/slug.util.js";
import { syncBadgeCatalog, evaluateBadges } from "../modules/badges/badge.service.js";

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed demo accounts in production.");
  process.exit(1);
}

const PASSWORD = process.env.DEMO_PASSWORD || "OpenSourceNepal1!";

const CATEGORIES = ["Education", "Agriculture", "Developer Tools", "Healthcare", "Climate", "FinTech", "Civic Tech", "Tourism", "E-commerce", "Hardware & IoT"];

const USERS = [
  { name: "Keshav Roka", username: "keshav", role: "developer", headline: "Full-Stack Developer", location: "Kathmandu", bio: "Building tools for Nepal's developer ecosystem. Passionate about open source and education tech.", skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "Docker"], githubUrl: "https://github.com/keshavroka55" },
  { name: "Anisha Shrestha", username: "anisha", role: "developer", headline: "UI/UX Designer", location: "Lalitpur", bio: "Design systems and product thinking. Making complex things simple.", skills: ["Figma", "React", "CSS", "User Research"] },
  { name: "Bikash Thapa", username: "bikash", role: "developer", headline: "Backend Engineer", location: "Pokhara", bio: "APIs, databases and distributed systems. Go and Rust enthusiast.", skills: ["Go", "Rust", "PostgreSQL", "Redis", "Kubernetes"] },
  { name: "Priya Karki", username: "priya", role: "developer", headline: "Founder & Product Manager", location: "Kathmandu", bio: "Building AgriNepal. Interested in AgriTech and climate solutions.", skills: ["Product", "Strategy", "Growth", "User Research"] },
  { name: "Rohan Maharjan", username: "rohan", role: "developer", headline: "ML Engineer", location: "Bhaktapur", bio: "Machine learning and computer vision. Python + PyTorch.", skills: ["Python", "PyTorch", "TensorFlow", "FastAPI", "MLOps"] },
  { name: "Sita Pandey", username: "sita", role: "developer", headline: "Mobile Developer", location: "Chitwan", bio: "React Native and Flutter. Apps that work on low connectivity.", skills: ["React Native", "Flutter", "Firebase", "Kotlin"] },
  { name: "Rajan Shrestha", username: "rajan", role: "investor", headline: "Angel Investor", location: "Kathmandu", bio: "Backing early Nepali founders in education, agriculture and fintech.", firm: "Himalayan Angels", focusAreas: ["Education", "Agriculture", "FinTech"], ticketSize: "NPR 10-50 lakh", verified: true },
];

const PROJECTS = [
  { name: "RevisionFlow", owner: "keshav", type: "STARTUP", stage: "BETA", category: "Education", tagline: "Smart revision scheduling for students", tags: ["React", "Node.js", "PostgreSQL", "AI"], lookingFor: ["Backend Developer", "UI Designer", "Marketing"], problem: "Students in Nepal cram the night before exams, which leads to poor long-term retention.", solution: "An adaptive revision scheduler using spaced repetition, tailored to Nepal's curriculum.", targetUsers: "High school and university students preparing for SEE, +2 and entrance exams.", features: ["Smart scheduling algorithm", "Nepali language support", "Progress analytics", "Group study rooms"], websiteUrl: "https://revisionflow.app", githubUrl: "https://github.com/revisionflow", members: [["anisha", "UI Designer"]] },
  { name: "AgriNepal", owner: "priya", type: "STARTUP", stage: "BUILDING", category: "Agriculture", tagline: "Connecting farmers to markets directly", tags: ["React Native", "Firebase", "Node.js"], lookingFor: ["Backend Developer", "Mobile Developer", "Co-founder"], problem: "Farmers earn only 20-30% of the final price because of long supply chains.", solution: "A mobile-first marketplace with real-time logistics, quality checks and direct payment.", targetUsers: "Smallholder farmers in Chitwan, Kaski and Dhading plus urban consumers.", features: ["Farmer onboarding", "Real-time price discovery", "Logistics coordination", "eSewa/Khalti payments"], websiteUrl: "https://agrinepal.io", members: [["rohan", "ML Engineer"]] },
  { name: "OpenNepal Docs", owner: "anisha", type: "OPEN_SOURCE", stage: "LAUNCHED", category: "Developer Tools", tagline: "Open documentation for Nepal's public APIs", tags: ["TypeScript", "Astro", "MDX"], lookingFor: ["Technical Writer", "Backend Developer"], problem: "Developers struggle to find reliable documentation for government APIs and public data.", solution: "A versioned, community-maintained docs site with interactive examples and SDKs.", targetUsers: "Developers and researchers working with Nepali public data.", features: ["Interactive API explorer", "SDK examples", "Versioned docs"], githubUrl: "https://github.com/opennepal-docs", members: [["keshav", "Contributor"]] },
  { name: "MedQueue", owner: "bikash", type: "LEARNING", stage: "BUILDING", category: "Healthcare", tagline: "Reduce hospital waiting times with smart queues", tags: ["Vue.js", "Laravel", "MySQL"], lookingFor: ["Frontend Developer", "Healthcare Domain Expert"], problem: "Patients wait 3-6 hours in public hospitals with no way to know when their turn is near.", solution: "A lightweight web + SMS queue system hospitals can deploy without new hardware.", targetUsers: "Patients and staff at public and private hospitals.", features: ["Token generation", "Live queue dashboard", "SMS updates"] },
  { name: "KathmanduHeatMap", owner: "rohan", type: "HARDWARE", stage: "BETA", category: "Climate", tagline: "Real-time air quality for the Valley", tags: ["Python", "InfluxDB", "Grafana", "Raspberry Pi"], lookingFor: ["IoT Engineer", "Data Scientist"], problem: "Kathmandu has severe air pollution but little accessible real-time data.", solution: "Low-cost IoT sensors feeding a public dashboard and open API.", targetUsers: "Citizens, journalists, researchers and policymakers.", features: ["Real-time sensor data", "Public API", "Historical export", "AQI alerts"], members: [["anisha", "Frontend Developer"]] },
  { name: "NepPay", owner: "anisha", type: "OPEN_SOURCE", stage: "LAUNCHED", category: "FinTech", tagline: "One SDK for eSewa, Khalti and ConnectIPS", tags: ["TypeScript", "Node.js", "REST"], lookingFor: ["Contributors", "Documentation Writers"], problem: "Every Nepali startup rebuilds the same payment integrations from scratch.", solution: "A unified TypeScript SDK with one API across all major Nepali providers.", targetUsers: "Developers building payment-integrated apps in Nepal.", features: ["Unified payment API", "Sandbox mode", "Webhook handling"], githubUrl: "https://github.com/neppay", members: [["bikash", "Backend Developer"], ["sita", "Mobile Developer"]] },
  { name: "Ghumfir", owner: "sita", type: "IDEA", stage: "IDEA", category: "Tourism", tagline: "Offline-first trekking companion", tags: ["Flutter", "SQLite"], lookingFor: ["Backend Developer", "Marketing", "Co-founder"], problem: "Trekkers lose signal and maps on most trails.", solution: "An offline-first app with trail maps, permits checklists and emergency contacts.", targetUsers: "Domestic and international trekkers.", features: ["Offline maps", "Permit checklist", "SOS contacts"] },
];

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10);
  await syncBadgeCatalog();

  const cats = {};
  for (const name of CATEGORIES) {
    cats[name] = await prisma.category.upsert({ where: { name }, update: {}, create: { name, slug: generateSlug(name) } });
  }

  const users = {};
  for (const u of USERS) {
    const email = `${u.username}@example.com`;
    users[u.username] = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, password: hash, emailVerified: true, profileCompleted: true, interests: [], reputationPoints: 40 + Math.floor(Math.random() * 400), ...u },
    });
  }

  const startups = {};
  for (const p of PROJECTS) {
    const slug = generateSlug(p.name);
    let s = await prisma.startup.findUnique({ where: { slug } });
    if (!s) {
      s = await prisma.startup.create({
        data: {
          name: p.name, slug, tagline: p.tagline, description: `${p.solution}\n\n${p.problem}`,
          type: p.type, stage: p.stage, status: "published", problem: p.problem, solution: p.solution, targetUsers: p.targetUsers,
          features: p.features, lookingFor: p.lookingFor, websiteUrl: p.websiteUrl ?? null, githubUrl: p.githubUrl ?? null,
          roadmap: [{ title: "Prototype", status: "done" }, { title: "Public beta", status: "in-progress" }, { title: "Scale", status: "planned" }],
          founderId: users[p.owner].id, categoryId: cats[p.category].id,
          startupTags: { create: await Promise.all(p.tags.map(async (name) => ({ tagId: (await prisma.tag.upsert({ where: { slug: generateSlug(name) }, update: {}, create: { name, slug: generateSlug(name) } })).id }))) },
        },
      });
      for (const [uname, role] of p.members ?? []) {
        await prisma.projectMember.create({ data: { startupId: s.id, userId: users[uname].id, role } });
        await prisma.contribution.create({ data: { startupId: s.id, userId: users[uname].id, title: `${role} work on ${p.name}`, description: "Shipped core features during the first release.", verified: true } });
      }
    }
    startups[p.name] = s;
  }

  // Likes and comments so leaderboards have something to rank.
  const voters = Object.values(users).filter((u) => u.role === "developer");
  for (const [i, s] of Object.values(startups).entries()) {
    let likes = 0;
    for (const v of voters.slice(0, 2 + ((i * 2) % 5))) {
      if (v.id === s.founderId) continue;
      await prisma.vote.upsert({ where: { userId_startupId: { userId: v.id, startupId: s.id } }, update: {}, create: { userId: v.id, startupId: s.id } });
      likes++;
    }
    const total = await prisma.vote.count({ where: { startupId: s.id } });
    await prisma.startup.update({ where: { id: s.id }, data: { totalVotes: total } });
  }
  const c = await prisma.comment.count();
  if (c === 0) {
    await prisma.comment.create({ data: { userId: users.anisha.id, startupId: startups.RevisionFlow.id, content: "Great idea! The Nepali language support is the killer feature." } });
    await prisma.comment.create({ data: { userId: users.rohan.id, startupId: startups.AgriNepal.id, content: "Have you considered partnering with local cooperatives for pickup points?" } });
    await prisma.startup.updateMany({ where: { id: { in: [startups.RevisionFlow.id, startups.AgriNepal.id] } }, data: { totalComments: 1 } });
  }

  // An investor mark approved by an admin, if one exists, and one pending request.
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  await prisma.investorInterest.upsert({
    where: { investorId_startupId: { investorId: users.rajan.id, startupId: startups.AgriNepal.id } },
    update: {},
    create: { investorId: users.rajan.id, startupId: startups.AgriNepal.id, note: "Strong team and a real problem. Happy to talk about a seed round.", status: admin ? "APPROVED" : "PENDING", reviewedById: admin?.id ?? null, reviewedAt: admin ? new Date() : null },
  });
  if (admin) await prisma.startup.update({ where: { id: startups.AgriNepal.id }, data: { investorBacked: true, investorMarkedAt: new Date(), investorMarkedById: admin.id } });
  await prisma.investorInterest.upsert({
    where: { investorId_startupId: { investorId: users.rajan.id, startupId: startups.RevisionFlow.id } },
    update: {},
    create: { investorId: users.rajan.id, startupId: startups.RevisionFlow.id, note: "Education is a focus area for us." },
  });

  // A pending join request for the demo inbox.
  await prisma.joinRequest.upsert({
    where: { startupId_userId: { startupId: startups.RevisionFlow.id, userId: users.rohan.id } },
    update: {},
    create: { startupId: startups.RevisionFlow.id, userId: users.rohan.id, roleWanted: "Backend Developer", message: "I have built recommendation pipelines in Python and would love to help with the scheduler." },
  });

  for (const u of Object.values(users)) await evaluateBadges(u.id);
  console.info(`Demo data ready. Sign in as keshav@example.com / rajan@example.com with password: ${PASSWORD}`);
  if (!admin) console.info("Tip: run `npm run create-admin` and re-run this script to get an approved Investor mark.");
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
