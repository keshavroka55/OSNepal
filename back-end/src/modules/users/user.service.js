import prisma from "../../prisma.js";

// Get my profile
export const getMyProfile = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      bio: true,
      avatar: true,
      location: true,
      website: true,
      headline: true,
      skills: true,
      interests: true,
      firm: true,
      focusAreas: true,
      ticketSize: true,
      profileCompleted: true,
      verified: true,
      reputationPoints: true,
      messagePolicy: true,
      twitterUrl: true,
      linkedinUrl: true,
      githubUrl: true,
      createdAt: true,
      startups: {
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          logo: true,
          status: true,
          totalVotes: true,
          totalComments: true,
          createdAt: true,
        },
      },
      comments: {
        select: { id: true, content: true, createdAt: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      votes: {
        select: { id: true, startupId: true, createdAt: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      bookmarks: {
        select: { id: true, startupId: true },
        take: 10,
      },
      badges: { include: { badge: true }, orderBy: { awardedAt: 'desc' } },
      memberships: { select: { role: true, startup: { select: { id: true, name: true, slug: true, logo: true, type: true } } } },
      followers: {
        select: { id: true, followerId: true },
      },
      follows: {
        select: { id: true, followingId: true },
      },
    },
  });
};

// Get any user profile by username/id
export const getUserById = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      avatar: true,
      location: true,
      website: true,
      headline: true,
      skills: true,
      interests: true,
      firm: true,
      focusAreas: true,
      ticketSize: true,
      profileCompleted: true,
      verified: true,
      reputationPoints: true,
      messagePolicy: true,
      twitterUrl: true,
      linkedinUrl: true,
      githubUrl: true,
      createdAt: true,
      startups: {
        where: { status: 'published' },
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          logo: true,
          totalVotes: true,
          totalComments: true,
          createdAt: true,
        },
      },
      role: true,
      badges: { include: { badge: true }, orderBy: { awardedAt: 'desc' } },
      memberships: { select: { role: true, startup: { select: { id: true, name: true, slug: true, logo: true, type: true } } } },
      followers: { select: { id: true, followerId: true } },
      follows: { select: { id: true, followingId: true } },
    },
  });
};

// Get user by username
export const getUserByUsername = async (username) => {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      avatar: true,
      location: true,
      website: true,
      headline: true,
      skills: true,
      interests: true,
      firm: true,
      focusAreas: true,
      ticketSize: true,
      profileCompleted: true,
      verified: true,
      reputationPoints: true,
      twitterUrl: true,
      linkedinUrl: true,
      githubUrl: true,
      createdAt: true,
      startups: {
        where: { status: 'published' },
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          logo: true,
          totalVotes: true,
          totalComments: true,
          createdAt: true,
        },
      },
      role: true,
      badges: { include: { badge: true }, orderBy: { awardedAt: 'desc' } },
      memberships: { select: { role: true, startup: { select: { id: true, name: true, slug: true, logo: true, type: true } } } },
      followers: { select: { id: true } },
      follows: { select: { id: true } },
    },
  });
};

// Update my profile
export const updateMyProfile = async (userId, data) => {
  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.headline !== undefined) updateData.headline = data.headline;
  if (data.twitterUrl !== undefined) updateData.twitterUrl = data.twitterUrl;
  if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl;
  if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl;

  const list = (v) => (Array.isArray(v) ? [...new Set(v.map((x) => String(x).trim()).filter(Boolean))].slice(0, 20) : undefined);
  if (data.skills !== undefined) updateData.skills = list(data.skills) ?? [];
  if (data.interests !== undefined) updateData.interests = list(data.interests) ?? [];
  if (data.focusAreas !== undefined) updateData.focusAreas = list(data.focusAreas) ?? [];
  if (data.firm !== undefined) updateData.firm = data.firm;
  if (data.ticketSize !== undefined) updateData.ticketSize = data.ticketSize;
  if (data.profileCompleted !== undefined) updateData.profileCompleted = !!data.profileCompleted;

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      bio: true,
      avatar: true,
      location: true,
      website: true,
      headline: true,
      skills: true,
      interests: true,
      firm: true,
      focusAreas: true,
      ticketSize: true,
      profileCompleted: true,
      verified: true,
      reputationPoints: true,
      twitterUrl: true,
      linkedinUrl: true,
      githubUrl: true,
    },
  });
};

// Get all users (admin only)
export const getAllUsers = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        verified: true,
        reputationPoints: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  return {
    data: users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  return prisma.user.delete({ where: { id: userId } });
};

// Update user role (admin only)
export const updateUserRole = async (userId, role) => {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
};

// Add reputation points
export const addReputationPoints = async (userId, points) => {
  return prisma.user.update({
    where: { id: userId },
    data: { reputationPoints: { increment: points } },
  });
};

// Get top founders by reputation
export const getTopFounders = async (limit = 10) => {
  return prisma.user.findMany({
    where: { startups: { some: {} } },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      headline: true,
      skills: true,
      interests: true,
      firm: true,
      focusAreas: true,
      ticketSize: true,
      profileCompleted: true,
      verified: true,
      reputationPoints: true,
      _count: { select: { startups: true, followers: true } },
    },
    orderBy: { reputationPoints: 'desc' },
    take: limit,
  });
};

// for connect and message feature like linkdin

export async function listDiscoverableUsers(currentUserId, { page = 1, limit = 20, search = '' }) {
  const skip = (page - 1) * limit;

  const where = {
    ...(currentUserId && {
      id: { not: currentUserId }, // never show the viewer their own card

    }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        messagePolicy: true,

        // for statup details 
        startups: {
          select: {
            name: true,
          },
          take: 1,
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  const result = users.map((user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    messagePolicy: user.messagePolicy,
    startupName: user.startups[0]?.name ?? null,
  }));

  // Fetch all connections involving the current viewer in one query,
  // then build a lookup map instead of querying per-user (avoids N+1)
  let connections = [];

  if (currentUserId) {
    connections = await prisma.connection.findMany({
      where: {
        OR: [{ requesterId: currentUserId },
        { receiverId: currentUserId }],
      },
    });
  };

  const statusByUserId = new Map();
  for (const conn of connections) {
    const otherId = conn.requesterId === currentUserId ? conn.receiverId : conn.requesterId;
    statusByUserId.set(otherId, conn.status); // 'PENDING' | 'ACCEPTED' | 'REJECTED'
  }

  const usersWithStatus = result.map((u) => ({
    ...u,
    connectionStatus: statusByUserId.get(u.id) === 'ACCEPTED'
      ? 'ACCEPTED'
      : statusByUserId.get(u.id) === 'PENDING'
        ? 'PENDING'
        : 'NONE',
  }));

  return {
    users: usersWithStatus,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}