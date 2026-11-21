import prisma from "../../prisma.js";
import { AppError } from "../../utils/AppError.js";
import { notify } from "../notifications/notification.service.js";
import { evaluateBadges } from "../badges/badge.service.js";
import { invalidateStartupCaches } from "../../middleware/cacheAside.js";

const startupBrief = { id: true, name: true, slug: true, logo: true, tagline: true, type: true, stage: true, totalVotes: true, investorBacked: true, founderId: true, category: { select: { name: true, slug: true } }, founder: { select: { id: true, name: true, username: true, avatar: true, verified: true } } };

// Investors raise their hand; only an admin turns that into a public mark.
export async function expressInterest(investorId, { startupId, note }) {
  const investor = await prisma.user.findUnique({ where: { id: investorId }, select: { verified: true } });
  if (!investor?.verified) throw new AppError("Your investor account is waiting for verification by the Open Source Nepal team.", 403);
  const startup = await prisma.startup.findUnique({ where: { id: startupId }, select: { id: true, name: true, status: true, founderId: true } });
  if (!startup || startup.status !== "published") throw new AppError("Project not found", 404);
  const existing = await prisma.investorInterest.findUnique({ where: { investorId_startupId: { investorId, startupId } } });
  if (existing && existing.status !== "REJECTED") throw new AppError("You already requested the mark for this project", 409);

  const row = existing
    ? await prisma.investorInterest.update({ where: { id: existing.id }, data: { status: "PENDING", note: note || null, reviewedById: null, reviewedAt: null } })
    : await prisma.investorInterest.create({ data: { investorId, startupId, note: note || null } });

  const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
  await Promise.all(admins.map((a) => notify({ userId: a.id, actorId: investorId, type: "INVESTOR_INTEREST", startupId, message: `requested the Investor mark on ${startup.name}`, link: "/dashboard/investor-marks" })));
  return row;
}

export const myInterests = (investorId) =>
  prisma.investorInterest.findMany({ where: { investorId }, orderBy: { createdAt: "desc" }, include: { startup: { select: startupBrief } } });

export const queue = (status = "PENDING") =>
  prisma.investorInterest.findMany({
    where: { status }, orderBy: { createdAt: "asc" }, take: 100,
    include: {
      startup: { select: startupBrief },
      investor: { select: { id: true, name: true, username: true, avatar: true, firm: true, ticketSize: true, focusAreas: true, verified: true, headline: true } },
    },
  });

export async function review(adminId, interestId, status) {
  const row = await prisma.investorInterest.findUnique({ where: { id: interestId }, include: { startup: { select: { id: true, name: true, slug: true, founderId: true } } } });
  if (!row) throw new AppError("Request not found", 404);

  await prisma.$transaction(async (tx) => {
    await tx.investorInterest.update({ where: { id: interestId }, data: { status, reviewedById: adminId, reviewedAt: new Date() } });
    if (status === "APPROVED") {
      await tx.startup.update({ where: { id: row.startupId }, data: { investorBacked: true, investorMarkedAt: new Date(), investorMarkedById: adminId } });
    }
  });

  if (status === "APPROVED") {
    await invalidateStartupCaches({ id: row.startupId, slug: row.startup.slug });
    await notify({ userId: row.startup.founderId, actorId: row.investorId, startupId: row.startupId, type: "INVESTOR_MARK", message: `${row.startup.name} earned the Investor mark`, link: `/projects/${row.startup.slug}` });
    await Promise.all([evaluateBadges(row.startup.founderId), evaluateBadges(row.investorId)]);
  }
  await notify({
    userId: row.investorId, actorId: adminId, startupId: row.startupId, type: "INVESTOR_MARK",
    message: status === "APPROVED" ? `Your Investor mark on ${row.startup.name} was approved` : `Your Investor mark request on ${row.startup.name} was declined`,
    link: `/projects/${row.startup.slug}`,
  });
  return { id: interestId, status };
}

export async function revokeMark(startupId) {
  const startup = await prisma.startup.findUnique({ where: { id: startupId }, select: { id: true, slug: true } });
  if (!startup) throw new AppError("Project not found", 404);
  await prisma.$transaction([
    prisma.startup.update({ where: { id: startupId }, data: { investorBacked: false, investorMarkedAt: null, investorMarkedById: null } }),
    prisma.investorInterest.updateMany({ where: { startupId, status: "APPROVED" }, data: { status: "REJECTED" } }),
  ]);
  await invalidateStartupCaches({ id: startupId, slug: startup.slug });
  return { ok: true };
}

// Investor deal-flow: published projects worth a look, with traction signals.
export async function dealFlow({ type, category, stage, backed, search, sort = "traction", page = 1, limit = 20 }) {
  const where = {
    status: "published",
    ...(type && { type }), ...(stage && { stage }),
    ...(category && { category: { slug: category } }),
    ...(backed !== undefined && { investorBacked: backed }),
    ...(search && { OR: [{ name: { contains: search, mode: "insensitive" } }, { tagline: { contains: search, mode: "insensitive" } }] }),
  };
  const orderBy = sort === "new" ? [{ createdAt: "desc" }] : [{ totalVotes: "desc" }, { totalViews: "desc" }];
  const [items, total] = await Promise.all([
    prisma.startup.findMany({
      where, orderBy, skip: (page - 1) * limit, take: limit,
      select: { ...startupBrief, problem: true, totalComments: true, totalViews: true, createdAt: true, _count: { select: { members: true, joinRequests: true } } },
    }),
    prisma.startup.count({ where }),
  ]);
  return { items, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
}

export const investorAccounts = () =>
  prisma.user.findMany({
    where: { role: "investor" }, orderBy: [{ verified: "asc" }, { createdAt: "desc" }], take: 200,
    select: { id: true, name: true, email: true, firm: true, verified: true, createdAt: true },
  });
