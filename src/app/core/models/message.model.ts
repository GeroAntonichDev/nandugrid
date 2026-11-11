export interface Conversation {
  id: string;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  readAt?: string;
}
