import prisma from "../../prisma.js";

export const toggleBookmark = async (userId, startupId) => {
  const startup = await prisma.startup.findUnique({ where: { id: startupId } });
  if (!startup) throw new Error("Startup not found");

  const existing = await prisma.bookmark.findUnique({
    where: { userId_startupId: { userId, startupId } },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { userId_startupId: { userId, startupId } },
    });
    return { bookmarked: false, message: "Bookmark removed" };
  } else {
    const bookmark = await prisma.bookmark.create({
      data: { userId, startupId },
    });
    return { bookmarked: true, message: "Startup bookmarked", bookmark };
  }
};

export const getMyBookmarks = async (userId) => {
  return prisma.bookmark.findMany({
    where: { userId },
    include: {
      startup: {
        include: {
          founder: { select: { id: true, name: true, avatar: true, verified: true } },
          category: { select: { id: true, name: true } },
          votes: { select: { id: true, userId: true } },
          comments: { select: { id: true } },
          bookmarks: { select: { id: true, userId: true } },
          screenshots: { select: { id: true, imageUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const checkIsBookmarked = async (userId, startupId) => {
  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_startupId: { userId, startupId } },
  });
  return !!bookmark;
};

export const getBookmarkCount = async (startupId) => {
  return prisma.bookmark.count({ where: { startupId } });
};