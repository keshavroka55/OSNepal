// back-end/src/controllers/conversation.controller.js
import prisma from "../../prisma.js";
import { canUsersMessage } from '../connections/connection.service.js';
import { findOrCreateConversation, getConversationHistory, listConversationsForUser } from './conversation.service.js';

export async function getOrCreateConversationWithUser(req, res) {
  const currentUserId = req.user.id;
  const { userId: otherUserId } = req.params;

  try {
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, name: true, avatar: true, messagePolicy: true },
    });

    if (!otherUser) return res.status(404).json({ error: 'User not found' });

    const check = await canUsersMessage(currentUserId, otherUserId);
    if (!check.allowed) {
      return res.status(403).json({ error: check.reason });
    }

    const conversation = await findOrCreateConversation(currentUserId, otherUserId);
    const messages = await getConversationHistory(conversation.id);

    res.json({
      conversationId: conversation.id,
      otherUser,
      messages: messages.reverse(), // oldest-first for rendering top-to-bottom
    });
  } catch (err) {
    console.error('getOrCreateConversationWithUser error', err);
    res.status(500).json({ error: 'Failed to load conversation' });
  }
}

export async function getMessages(req, res) {
  const { conversationId } = req.params;
  const { cursor } = req.query;

  try {
    const messages = await getConversationHistory(conversationId, cursor);
    res.json({ messages: messages.reverse() });
  } catch (err) {
    console.error('getMessages error', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
}


export async function listPendingRequests(req, res) {
  try {
    const pending = await prisma.connection.findMany({
      where: { receiverId: req.user.id, status: 'PENDING' },
      include: { requester: { select: { id: true, name: true, avatar: true } } },
    });
    res.json(pending);
  } catch (err) {
    console.error('listPendingRequests error', err);
    res.status(500).json({ error: 'Failed to load pending requests' });
  }
}

export async function listConversations(req, res) {
  try {
    const conversations = await listConversationsForUser(req.user.id);
    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? 0;
      const bTime = b.lastMessage?.createdAt ?? 0;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
    res.json(conversations);
  } catch (err) {
    console.error('listConversations error', err);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
}