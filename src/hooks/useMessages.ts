import { useCallback, useEffect, useRef, useState } from 'react'
import { getSupabaseClient } from '../lib/supabase'
import type { ChatMessage, ChatThread, StartThreadInput } from '../types/message'

const CHAT_SELECT = `
  id,
  book_id,
  owner_id,
  requester_id,
  updated_at,
  books(title),
  owner:profiles!chats_owner_id_fkey(full_name),
  requester:profiles!chats_requester_id_fkey(full_name)
`

const MESSAGE_SELECT = `
  id,
  chat_id,
  sender_id,
  body,
  created_at,
  sender:profiles!messages_sender_id_fkey(full_name)
`

type Relation<T> = T | T[] | null | undefined

interface ProfileRelation {
  full_name?: string | null
}

interface BookRelation {
  title?: string | null
}

interface ChatRow {
  id: string
  book_id: string
  owner_id: string
  requester_id: string
  updated_at: string
  books?: Relation<BookRelation>
  owner?: Relation<ProfileRelation>
  requester?: Relation<ProfileRelation>
}

interface MessageRow {
  id: string
  chat_id: string
  sender_id: string
  body: string
  created_at: string
  sender?: Relation<ProfileRelation>
}

function firstRelation<T>(value: Relation<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function sortThreads(threads: ChatThread[]): ChatThread[] {
  return [...threads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

function mapThread(row: ChatRow): ChatThread {
  const book = firstRelation(row.books)
  const owner = firstRelation(row.owner)
  const requester = firstRelation(row.requester)

  return {
    id: row.id,
    bookId: row.book_id,
    bookTitle: book?.title ?? 'Sách',
    ownerId: row.owner_id,
    ownerName: owner?.full_name ?? 'Người dùng',
    requesterId: row.requester_id,
    requesterName: requester?.full_name ?? 'Người dùng',
    updatedAt: row.updated_at,
  }
}

function mapMessage(row: MessageRow, fallbackSenderName = 'Người dùng'): ChatMessage {
  const sender = firstRelation(row.sender)

  return {
    id: row.id,
    threadId: row.chat_id,
    senderId: row.sender_id,
    senderName: sender?.full_name ?? fallbackSenderName,
    body: row.body,
    createdAt: row.created_at,
  }
}

export function useMessages(userId: string | undefined, userName: string | undefined) {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const threadIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    threadIdsRef.current = new Set(threads.map((thread) => thread.id))
  }, [threads])

  const refresh = useCallback(async (showLoading = true) => {
    if (!userId) {
      setThreads([])
      setMessages([])
      setError(null)
      setLoading(false)
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      setThreads([])
      setMessages([])
      setError('Supabase chưa được cấu hình cho hệ thống tin nhắn.')
      setLoading(false)
      return
    }

    if (showLoading) setLoading(true)
    setError(null)

    try {
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select(CHAT_SELECT)
        .or(`owner_id.eq.${userId},requester_id.eq.${userId}`)
        .order('updated_at', { ascending: false })

      if (chatError) throw new Error(chatError.message)

      const chatRows = (chatData ?? []) as unknown as ChatRow[]
      const nextThreads = chatRows.map(mapThread)
      const chatIds = nextThreads.map((thread) => thread.id)

      if (chatIds.length === 0) {
        setThreads([])
        setMessages([])
        return
      }

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select(MESSAGE_SELECT)
        .in('chat_id', chatIds)
        .order('created_at', { ascending: true })

      if (messageError) throw new Error(messageError.message)

      setThreads(sortThreads(nextThreads))
      setMessages(((messageData ?? []) as unknown as MessageRow[]).map((row) => mapMessage(row)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải tin nhắn')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!userId) return

    const supabase = getSupabaseClient()
    if (!supabase) return

    let alive = true
    const channel = supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as MessageRow

          if (!threadIdsRef.current.has(newMessage.chat_id)) {
            void refresh(false)
            return
          }

          void (async () => {
            const { data, error: messageError } = await supabase
              .from('messages')
              .select(MESSAGE_SELECT)
              .eq('id', newMessage.id)
              .single()

            if (!alive || messageError) return

            const fallbackName = newMessage.sender_id === userId ? userName ?? 'Bạn' : 'Người dùng'
            const mapped = mapMessage((data ?? newMessage) as unknown as MessageRow, fallbackName)

            setMessages((prev) =>
              prev.some((message) => message.id === mapped.id) ? prev : [...prev, mapped],
            )
            setThreads((prev) =>
              sortThreads(
                prev.map((thread) =>
                  thread.id === mapped.threadId ? { ...thread, updatedAt: mapped.createdAt } : thread,
                ),
              ),
            )
          })()
        },
      )
      .subscribe()

    return () => {
      alive = false
      void supabase.removeChannel(channel)
    }
  }, [refresh, userId, userName])

  const getThreadMessages = useCallback(
    (threadId: string) =>
      messages
        .filter((message) => message.threadId === threadId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages],
  )

  const startThread = useCallback(
    async (input: StartThreadInput) => {
      if (!userId || !userName) throw new Error('Chưa đăng nhập')

      const supabase = getSupabaseClient()
      if (!supabase) throw new Error('Supabase chưa được cấu hình cho hệ thống tin nhắn.')

      const { data: existingData, error: existingError } = await supabase
        .from('chats')
        .select(CHAT_SELECT)
        .eq('book_id', input.bookId)
        .or(`owner_id.eq.${userId},requester_id.eq.${userId}`)

      if (existingError) throw new Error(existingError.message)

      const existingRow = ((existingData ?? []) as unknown as ChatRow[]).find(
        (thread) =>
          thread.book_id === input.bookId &&
          ((thread.requester_id === userId && thread.owner_id === input.ownerId) ||
            (thread.owner_id === userId && thread.requester_id === input.ownerId)),
      )

      let thread: ChatThread

      if (existingRow) {
        thread = mapThread(existingRow)
      } else {
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .insert({
            book_id: input.bookId,
            owner_id: input.ownerId,
            requester_id: userId,
          })
          .select(CHAT_SELECT)
          .single()

        if (chatError) throw new Error(chatError.message)
        thread = mapThread(chatData as unknown as ChatRow)
      }

      const trimmed = input.initialMessage.trim()
      if (trimmed) {
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .insert({
            chat_id: thread.id,
            sender_id: userId,
            body: trimmed,
          })
          .select(MESSAGE_SELECT)
          .single()

        if (messageError) throw new Error(messageError.message)

        const mapped = mapMessage(messageData as unknown as MessageRow, userName)
        thread = {
          ...thread,
          bookTitle: thread.bookTitle || input.bookTitle,
          ownerName: thread.ownerName || input.ownerName,
          requesterName: thread.requesterName || userName,
          updatedAt: mapped.createdAt,
        }

        await supabase.from('chats').update({ updated_at: mapped.createdAt }).eq('id', thread.id)
      }

      await refresh(false)
      return thread
    },
    [userId, userName, refresh],
  )

  const sendMessage = useCallback(
    async (threadId: string, body: string) => {
      if (!userId || !userName) throw new Error('Chưa đăng nhập')

      const supabase = getSupabaseClient()
      if (!supabase) throw new Error('Supabase chưa được cấu hình cho hệ thống tin nhắn.')

      const trimmed = body.trim()
      if (!trimmed) return

      const { data, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: threadId,
          sender_id: userId,
          body: trimmed,
        })
        .select(MESSAGE_SELECT)
        .single()

      if (messageError) throw new Error(messageError.message)

      const mapped = mapMessage(data as unknown as MessageRow, userName)
      setMessages((prev) =>
        prev.some((message) => message.id === mapped.id) ? prev : [...prev, mapped],
      )
      setThreads((prev) =>
        sortThreads(
          prev.map((thread) =>
            thread.id === threadId ? { ...thread, updatedAt: mapped.createdAt } : thread,
          ),
        ),
      )

      await supabase.from('chats').update({ updated_at: mapped.createdAt }).eq('id', threadId)
    },
    [userId, userName],
  )

  return { threads, messages, loading, error, getThreadMessages, startThread, sendMessage, refresh }
}
