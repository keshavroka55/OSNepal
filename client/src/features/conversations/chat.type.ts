export type ConnectionStatus = 'NONE' | 'PENDING' | 'ACCEPTED';
export type MessagePolicy = 'ANYONE' | 'CONNECTIONS_ONLY';

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string | null;
  messagePolicy: MessagePolicy;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  seenAt: string | null;
}