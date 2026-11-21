// back-end/src/controllers/connection.controller.js
import prisma from "../../prisma.js";

export async function sendConnectionRequest(req, res) {
  const requesterId = req.user.id;
  const { receiverId } = req.body;

  if (requesterId === receiverId) {
    return res.status(400).json({ error: 'Cannot connect with yourself' });
  }

  try {
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Connection already exists', status: existing.status });
    }

    const connection = await prisma.connection.create({
      data: { requesterId, receiverId, status: 'PENDING' },
    });

    res.status(201).json(connection);
  } catch (err) {
    console.error('sendConnectionRequest error', err);
    res.status(500).json({ error: 'Failed to send connection request' });
  }
}

export async function acceptConnectionRequest(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const connection = await prisma.connection.findUnique({ where: { id } });

    if (!connection) return res.status(404).json({ error: 'Connection not found' });
    if (connection.receiverId !== userId) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }

    const updated = await prisma.connection.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    res.json(updated);
  } catch (err) {
    console.error('acceptConnectionRequest error', err);
    res.status(500).json({ error: 'Failed to accept connection' });
  }
}

export async function listConnections(req, res) {
  const userId = req.user.id;

  try {
    const connections = await prisma.connection.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Flatten to "the other person" regardless of who initiated
    const result = connections.map((c) =>
      c.requesterId === userId ? c.receiver : c.requester
    );

    res.json(result);
  } catch (err) {
    console.error('listConnections error', err);
    res.status(500).json({ error: 'Failed to list connections' });
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