// back-end/src/services/message.service.js
import prisma from "../../prisma.js";

// Deterministic ordering so (A,B) and (B,A) always resolve to the same row
function sortUserIds(id1, id2) {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

export async function findOrCreateConversation(userId1, userId2) {

  const [userAId, userBId] = sortUserIds(userId1, userId2);

  let conversation = await prisma.conversation.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { userAId, userBId },
    });
  }

  return conversation;
}

export async function getConversationHistory(conversationId, cursor, limit = 30) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });
}

export async function createMessage({ conversationId, senderId, receiverId, text }) {
  return prisma.message.create({
    data: { conversationId, senderId, receiverId, text },
  });
}

export async function markMessagesSeen(conversationId, seenByUserId) {
  return prisma.message.updateMany({
    where: {
      conversationId,
      receiverId: seenByUserId,
      seenAt: null,
    },
    data: { seenAt: new Date() },
  });
}

export async function listConversationsForUser(userId) {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    include: {
      userA: { select: { id: true, name: true, avatar: true } },
      userB: { select: { id: true, name: true, avatar: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return Promise.all(
    conversations.map(async (c) => {
      const otherUser = c.userAId === userId ? c.userB : c.userA;
      const unreadCount = await prisma.message.count({
        where: { conversationId: c.id, receiverId: userId, seenAt: null },
      });

      return {
        conversationId: c.id,
        otherUser,
        lastMessage: c.messages[0] ?? null,
        unreadCount,
      };
    })
  );
}