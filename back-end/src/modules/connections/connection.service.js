// back-end/src/services/connection.service.js
import prisma from "../../prisma.js";

export async function canUsersMessage(senderId, receiverId) {
  if (senderId === receiverId) {
    return { allowed: false, reason: 'Cannot message yourself' };
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { messagePolicy: true },
  });

  if (!receiver) {
    return { allowed: false, reason: 'User not found' };
  }

  // Receiver has opened their profile to anyone — skip the connection check entirely
  if (receiver.messagePolicy === 'ANYONE') {
    return { allowed: true };
  }

  // Default: CONNECTIONS_ONLY — require an accepted connection either direction
  const connection = await prisma.connection.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { requesterId: senderId, receiverId: receiverId },
        { requesterId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (!connection) {
    return { allowed: false, reason: 'This user only accepts messages from connections' };
  }

  return { allowed: true };
}