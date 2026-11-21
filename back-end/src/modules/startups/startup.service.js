import prisma from '../../prisma.js';
import { generateSlug } from '../../utils/slug.util.js';
import { getOrSetCache, invalidateStartupCaches } from '../../middleware/cacheAside.js';
import { config } from '../../config/config.js';
import { evaluateBadges } from '../badges/badge.service.js';

const PROJECT_TYPES = ['STARTUP', 'OPEN_SOURCE', 'LEARNING', 'IDEA', 'HARDWARE'];
const PROJECT_STAGES = ['IDEA', 'BUILDING', 'BETA', 'LAUNCHED'];
const OWNER_EDITABLE = [
  'name', 'tagline', 'description', 'logo', 'banner', 'websiteUrl', 'githubUrl', 'twitterUrl', 'discordUrl',
  'linkedinUrl', 'categoryId', 'type', 'stage', 'problem', 'solution', 'targetUsers', 'roadmap',
  'openToFeedback', 'teamMembers', 'launchDate',
];

const cleanList = (v) =>
  Array.isArray(v) ? [...new Set(v.map((x) => String(x).trim()).filter(Boolean))].slice(0, 15) : [];

// Tags are free-form tech/stack labels; create the ones that do not exist yet.
const tagConnect = async (tags) => {
  const names = cleanList(tags).slice(0, 8);
  if (names.length === 0) return {};
  const rows = await Promise.all(names.map((name) => prisma.tag.upsert({
    where: { slug: generateSlug(name) || name.toLowerCase() },
    update: {},
    create: { name, slug: generateSlug(name) || name.toLowerCase() },
  })));
  return { startupTags: { create: rows.map((t) => ({ tagId: t.id })) } };
};

const normalizeStartup = (startup) => {
  if (!startup) return startup;

  const { startupTags = [], ...rest } = startup;

  return {
    ...rest,
    tags: startupTags.map((startupTag) => startupTag.tag).filter(Boolean),
  };
};

export const getAllStartups = async (role, options = {}) => {
  const { page = 1, limit = 20, category, search, type, stage, lookingFor, backed, sort = 'new' } = options;
  const cacheKey = `feed:all:${role || 'guest'}:page:${page}:limit:${limit}:cat:${category || ''}:search:${search || ''}:type:${type || ''}:stage:${stage || ''}:lf:${lookingFor || ''}:backed:${backed ?? ''}:sort:${sort}`;
  return getOrSetCache(cacheKey, async () => {
    const skip = (page - 1) * limit;
    const where = role === 'admin' ? {} : { status: 'published' };
    if (category) {
      where.category = { slug: category };
    }
    if (type) where.type = type;
    if (stage) where.stage = stage;
    if (lookingFor) where.lookingFor = { has: lookingFor };
    if (backed !== undefined) where.investorBacked = backed;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [startups, total] = await Promise.all([
      prisma.startup.findMany({
        where,
        include: {
          founder: { select: { id: true, name: true, avatar: true, verified: true } },
          category: { select: { id: true, name: true, slug: true } },
          votes: { select: { id: true, userId: true } },
          comments: { select: { id: true } },
          bookmarks: { select: { id: true, userId: true } },
          screenshots: { select: { id: true, imageUrl: true, position: true } },
          startupTags: { include: { tag: true } },
        },
        orderBy: sort === 'top' ? [{ totalVotes: 'desc' }, { createdAt: 'desc' }] : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.startup.count({ where }),
    ]);
    return { data: startups.map(normalizeStartup), pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }, config.FEED_TTL);
};

export const getStartupById = async (id) => {
  const cacheKey = `project:${id}`;
  return getOrSetCache(cacheKey, async () => {
    return prisma.startup.findUnique({
      where: { id },
      include: {
        founder: { select: { id: true, name: true, avatar: true, verified: true, headline: true } },
        category: true,
        votes: { select: { id: true, userId: true } },
        comments: {
          where: { parentId: null }, // that's it. 
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            replies: { include: { user: { select: { id: true, name: true, avatar: true } } } },
          },
        },
        bookmarks: { select: { id: true, userId: true } },
        screenshots: { orderBy: { position: 'asc' } },
        startupTags: { include: { tag: true } },
        members: { include: { user: { select: { id: true, name: true, username: true, avatar: true, headline: true, verified: true } } }, orderBy: { joinedAt: 'asc' } },
        investorMarkedBy: { select: { id: true, name: true } },
        leaderboards: true,
      },
    }).then(normalizeStartup)

  }, config.PROJECT_TTL);
};

export const getStartupBySlug = async (slug) => {
  const cacheKey = `project:slug:${slug}`;
  return getOrSetCache(cacheKey, async () => {
    const startup = await prisma.startup.findUnique({
      where: { slug },
      include: {
        founder: { select: { id: true, name: true, avatar: true, verified: true, headline: true } },
        category: true,
        votes: { select: { id: true, userId: true } },
        comments: {
          where: { parentId: null },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            replies: { include: { user: { select: { id: true, name: true, avatar: true } } } },
            },
          },
        bookmarks: { select: { id: true, userId: true } },
        screenshots: { orderBy: { position: 'asc' } },
          startupTags: { include: { tag: true } },
        members: { include: { user: { select: { id: true, name: true, username: true, avatar: true, headline: true, verified: true } } }, orderBy: { joinedAt: 'asc' } },
        investorMarkedBy: { select: { id: true, name: true } },
        leaderboards: true,
      },
    });
    if (startup) {
      await prisma.startup.update({
        where: { id: startup.id },
        data: { totalViews: { increment: 1 } },
      });
    }
    return normalizeStartup(startup);
  }, config.PROJECT_TTL);
};

export const getTrendingStartups = async (days = 7, limit = 10) => {
  const cacheKey = `feed:trending:days:${days}:limit:${limit}`;
  return getOrSetCache(cacheKey, async () => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return prisma.startup.findMany({
      where: {
        status: 'published',
        createdAt: { gte: date },
      },
      include: {
        founder: { select: { id: true, name: true, avatar: true, verified: true } },
        category: { select: { id: true, name: true, slug: true } },
        votes: { select: { id: true, userId: true } },
        comments: { select: { id: true } },
        bookmarks: { select: { id: true, userId: true } },
        screenshots: { select: { id: true, imageUrl: true } },
        startupTags: { include: { tag: true } },
      },
      orderBy: {
        totalVotes: 'desc',
      },
      take: limit,
    }).then((startups) => startups.map(normalizeStartup));
  }, config.FEED_TTL);
};

export const createStartup = async (data, userId) => {
  // Ideas and learning projects have no logo or website yet, so only the
  // fields every project needs are required.
  if (!data.name || !data.tagline || !data.description || !data.categoryId) {
    throw new Error('Missing required fields: name, tagline, description, categoryId');
  }
  if (data.type && !PROJECT_TYPES.includes(data.type)) throw new Error('Invalid project type');
  if (data.stage && !PROJECT_STAGES.includes(data.stage)) throw new Error('Invalid project stage');

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) throw new Error('Category not found');

  // Generate slug
  let slug = generateSlug(data.name);
  let existingSlug = await prisma.startup.findUnique({ where: { slug } });
  let counter = 1;
  while (existingSlug) {
    slug = `${generateSlug(data.name)}-${counter}`;
    existingSlug = await prisma.startup.findUnique({ where: { slug } });
    counter++;
  }

    const created = await prisma.startup.create({
    data: {
      name: data.name,
      slug,
      tagline: data.tagline,
      description: data.description,
      logo: data.logo || null,
      teamMembers: data.teamMembers ?? [],
      banner: data.banner || null,
      websiteUrl: data.websiteUrl || null,
      type: data.type || 'STARTUP',
      stage: data.stage || 'IDEA',
      problem: data.problem || null,
      solution: data.solution || null,
      targetUsers: data.targetUsers || null,
      features: cleanList(data.features),
      lookingFor: cleanList(data.lookingFor),
      roadmap: Array.isArray(data.roadmap) ? data.roadmap.slice(0, 12) : [],
      openToFeedback: data.openToFeedback !== false,
      ...(await tagConnect(data.tags)),
      githubUrl: data.githubUrl || null,
      twitterUrl: data.twitterUrl || null,
      discordUrl: data.discordUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      // By default user-submitted startups are published immediately.
      // Admins can change `status` later via the update endpoint.
      status: 'published',
      founderId: userId,
      categoryId: data.categoryId,
      launchDate: data.launchDate ? new Date(data.launchDate) : null,
    },
    include: {
      founder: { select: { id: true, name: true, avatar: true } },
      category: true,
      votes: true,
      comments: true,
      startupTags: { include: { tag: true } },
    },
  }).then(normalizeStartup);

    await invalidateStartupCaches({ id: created.id, slug: created.slug });
    await evaluateBadges(userId);
    return created;
};

export const updateStartup = async (id, data, userId, role) => {
  const startup = await prisma.startup.findUnique({ where: { id } });
  if (!startup) throw new Error('Startup not found');
  if (role !== 'admin' && startup.founderId !== userId) {
    throw new Error('Not authorized');
  }

  // Only whitelisted fields are writable. Mark, counters, ownership and
  // moderation status must never come straight from the request body.
  let updateData = {};
  for (const key of OWNER_EDITABLE) if (data[key] !== undefined) updateData[key] = data[key];
  if (data.features !== undefined) updateData.features = cleanList(data.features);
  if (data.lookingFor !== undefined) updateData.lookingFor = cleanList(data.lookingFor);
  if (role === 'admin' && data.status !== undefined) updateData.status = data.status;
  if (role === 'admin' && data.featured !== undefined) updateData.featured = !!data.featured;
  if (updateData.type && !PROJECT_TYPES.includes(updateData.type)) throw new Error('Invalid project type');
  if (updateData.stage && !PROJECT_STAGES.includes(updateData.stage)) throw new Error('Invalid project stage');
  if (data.tags !== undefined) {
    await prisma.startupTag.deleteMany({ where: { startupId: id } });
    Object.assign(updateData, await tagConnect(data.tags));
  }

  // If name is being updated, regenerate slug
  if (data.name && data.name !== startup.name) {
    let slug = generateSlug(data.name);
    let existingSlug = await prisma.startup.findUnique({
      where: { slug },
    });
    let counter = 1;
    while (existingSlug && existingSlug.id !== id) {
      slug = `${generateSlug(data.name)}-${counter}`;
      existingSlug = await prisma.startup.findUnique({ where: { slug } });
      counter++;
    }
    updateData.slug = slug;
  }

    const updated = await prisma.startup.update({
    where: { id },
    data: updateData,
    include: {
      founder: { select: { id: true, name: true, avatar: true } },
      category: true,
      votes: true,
      comments: true,
      screenshots: true,
      startupTags: { include: { tag: true } },
    },
  }).then(normalizeStartup);

    await invalidateStartupCaches({ id, slug: updated.slug });
    return updated;
};

export const deleteStartup = async (id, userId, role) => {
  const startup = await prisma.startup.findUnique({ where: { id } });
  if (!startup) throw new Error('Startup not found');
  if (role !== 'admin' && startup.founderId !== userId) {
    throw new Error('Not authorized');
  }
  const deleted = await prisma.startup.delete({ where: { id } });
  await invalidateStartupCaches({ id: deleted.id, slug: deleted.slug });
  return deleted;
};

export const addScreenshot = async (startupId, data, userId, role) => {
  const startup = await prisma.startup.findUnique({ where: { id: startupId } });
  if (!startup) throw new Error('Startup not found');
  if (role !== 'admin' && startup.founderId !== userId) {
    throw new Error('Not authorized');
  }

  if (!data.imageUrl) throw new Error('Image URL is required');

  const maxPosition = await prisma.screenshot.findFirst({
    where: { startupId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });

    const screenshot = await prisma.screenshot.create({
    data: {
      imageUrl: data.imageUrl,
      position: (maxPosition?.position || 0) + 1,
      startupId,
    },
  });

    await invalidateStartupCaches({ id: startupId, slug: startup.slug });
    return screenshot;
};

export const deleteScreenshot = async (startupId, screenshotId, userId, role) => {
  const startup = await prisma.startup.findUnique({ where: { id: startupId } });
  if (!startup) throw new Error('Startup not found');
  if (role !== 'admin' && startup.founderId !== userId) {
    throw new Error('Not authorized');
  }

  const screenshot = await prisma.screenshot.findUnique({ where: { id: screenshotId } });
  if (!screenshot) throw new Error('Screenshot not found');

  const deleted = await prisma.screenshot.delete({ where: { id: screenshotId } });
  await invalidateStartupCaches({ id: startupId, slug: startup.slug });
  return deleted;
};


// Lightweight list for pickers (e.g. attaching a launch to a post).
export const getMyStartups = async (founderId) =>
  prisma.startup.findMany({
    where: { founderId, status: { in: ['published', 'pending'] } },
    select: { id: true, name: true, slug: true, logo: true, status: true, type: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
