import prisma from "../../prisma.js";

export const toggleFollow = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself");
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } }
  });

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } }
    });
    return { following: false, message: "Unfollowed successfully" };
  } else {
    await prisma.follow.create({ data: { followerId, followingId } });
    return { following: true, message: "Followed successfully" };
  }
};

export const getFollowers = async (userId) => {
  return prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: { select: { id: true, name: true, avatar: true, role: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};

export const getFollowing = async (userId) => {
  return prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: { select: { id: true, name: true, avatar: true, role: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};

export const checkIsFollowing = async (followerId, followingId) => {
  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } }
  });
  return !!follow;
};