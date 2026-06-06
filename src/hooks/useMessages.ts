import { useCallback, useEffect, useState } from 'react'
import type { ChatMessage, ChatThread, StartThreadInput } from '../types/message'

const THREADS_KEY = 'sgn_chat_threads'
const MESSAGES_KEY = 'sgn_chat_messages'

function readThreads(): ChatThread[] {
  try {
    const raw = localStorage.getItem(THREADS_KEY)
    return raw ? (JSON.parse(raw) as ChatThread[]) : []
  } catch {
    return []
  }
}

function writeThreads(threads: ChatThread[]): void {
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads))
}

function readMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY)
    return raw ? (JSON.parse(raw) as ChatMessage[]) : []
  } catch {
    return []
  }
}

function writeMessages(messages: ChatMessage[]): void {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useMessages(userId: string | undefined, userName: string | undefined) {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!userId) {
      setThreads([])
      setMessages([])
      setLoading(false)
      return
    }
    const allThreads = readThreads().filter(
      (t) => t.ownerId === userId || t.requesterId === userId,
    )
    const allMessages = readMessages().filter((m) =>
      allThreads.some((t) => t.id === m.threadId),
    )
    setThreads(
      allThreads.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    )
    setMessages(allMessages)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const getThreadMessages = useCallback(
    (threadId: string) =>
      messages
        .filter((m) => m.threadId === threadId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages],
  )

  const startThread = useCallback(
    async (input: StartThreadInput) => {
      if (!userId || !userName) throw new Error('Chưa đăng nhập')

      const existing = readThreads().find(
        (t) =>
          t.bookId === input.bookId &&
          ((t.requesterId === userId && t.ownerId === input.ownerId) ||
            (t.ownerId === userId && t.requesterId === input.ownerId)),
      )

      const now = new Date().toISOString()
      let thread: ChatThread

      if (existing) {
        thread = { ...existing, updatedAt: now }
        const threads = readThreads().map((t) => (t.id === existing.id ? thread : t))
        writeThreads(threads)
      } else {
        thread = {
          id: uid(),
          bookId: input.bookId,
          bookTitle: input.bookTitle,
          ownerId: input.ownerId,
          ownerName: input.ownerName,
          requesterId: userId,
          requesterName: userName,
          updatedAt: now,
        }
        writeThreads([thread, ...readThreads()])
      }

      const msg: ChatMessage = {
        id: uid(),
        threadId: thread.id,
        senderId: userId,
        senderName: userName,
        body: input.initialMessage,
        createdAt: now,
      }
      writeMessages([...readMessages(), msg])
      refresh()
      return thread
    },
    [userId, userName, refresh],
  )

  const sendMessage = useCallback(
    async (threadId: string, body: string) => {
      if (!userId || !userName) throw new Error('Chưa đăng nhập')
      const trimmed = body.trim()
      if (!trimmed) return

      const now = new Date().toISOString()
      const msg: ChatMessage = {
        id: uid(),
        threadId,
        senderId: userId,
        senderName: userName,
        body: trimmed,
        createdAt: now,
      }
      writeMessages([...readMessages(), msg])
      writeThreads(
        readThreads().map((t) => (t.id === threadId ? { ...t, updatedAt: now } : t)),
      )
      refresh()
    },
    [userId, userName, refresh],
  )

  return { threads, loading, getThreadMessages, startThread, sendMessage, refresh }
}
