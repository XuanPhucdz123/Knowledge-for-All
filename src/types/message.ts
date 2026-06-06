export interface ChatThread {
  id: string
  bookId: string
  bookTitle: string
  ownerId: string
  ownerName: string
  requesterId: string
  requesterName: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  threadId: string
  senderId: string
  senderName: string
  body: string
  createdAt: string
}

export interface SendMessageInput {
  threadId: string
  body: string
}

export interface StartThreadInput {
  bookId: string
  bookTitle: string
  ownerId: string
  ownerName: string
  initialMessage: string
}
