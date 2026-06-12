import { MessageCircle, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { useAuth } from '../hooks/useAuth'
import { useMessages } from '../hooks/useMessages'
import type { ChatThread } from '../types/message'

export function MessagesPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  const { threads, loading, error, getThreadMessages, sendMessage } = useMessages(user?.id, user?.fullName)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const requestedThread = searchParams.get('thread')
    if (requestedThread) setActiveId(requestedThread)
  }, [searchParams])

  const active = threads.find((t) => t.id === activeId) ?? threads[0] ?? null
  const activeMessages = active ? getThreadMessages(active.id) : []

  const otherName = (thread: ChatThread) =>
    thread.requesterId === user?.id ? thread.ownerName : thread.requesterName

  const handleSend = async () => {
    if (!active || !draft.trim()) return
    setSending(true)
    try {
      await sendMessage(active.id, draft)
      setDraft('')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không thể gửi tin nhắn', 'error')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-yellow border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={<MessageCircle className="h-12 w-12 text-accent-purple" />}
        title="Không thể tải tin nhắn"
        description={error}
      />
    )
  }

  if (threads.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle className="h-12 w-12 text-accent-purple" />}
        title="Chưa có cuộc trò chuyện nào"
        description="Tìm sách ở gần bạn và nhấn 'Nhắn tin' để bắt đầu trao đổi với người chia sẻ."
        actionLabel="Khám phá sách"
        onAction={() => {
          window.location.href = '/app/nearby'
        }}
      />
    )
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-glass bg-dark-secondary lg:flex-row">
      <aside className="w-full border-b border-glass lg:w-80 lg:border-b-0 lg:border-r">
        <div className="border-b border-glass px-4 py-4">
          <h1 className="text-lg font-black text-text-primary">Tin nhắn</h1>
          <p className="text-xs text-text-muted">{threads.length} cuộc trò chuyện</p>
        </div>
        <ul className="max-h-48 overflow-y-auto lg:max-h-full">
          {threads.map((thread) => (
            <li key={thread.id}>
              <button
                type="button"
                onClick={() => setActiveId(thread.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                  active?.id === thread.id ? 'bg-white/10' : ''
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-yellow/40 to-accent-purple/40 text-lg">
                  📚
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-text-primary">{otherName(thread)}</p>
                  <p className="truncate text-xs text-accent-yellow">{thread.bookTitle}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {active && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-glass px-4 py-3">
            <p className="font-bold text-text-primary">{otherName(active)}</p>
            <p className="text-sm text-accent-yellow">Về sách: {active.bookTitle}</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {activeMessages.map((msg) => {
              const mine = msg.senderId === user?.id
              return (
                <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      mine
                        ? 'rounded-br-md bg-gradient-to-br from-accent-yellow to-accent-orange text-dark'
                        : 'rounded-bl-md bg-white/10 text-text-primary'
                    }`}
                  >
                    {!mine && (
                      <p className="mb-1 text-[10px] font-semibold text-accent-teal">{msg.senderName}</p>
                    )}
                    <p>{msg.body}</p>
                    <p className={`mt-1 text-[10px] ${mine ? 'text-dark/60' : 'text-text-muted'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-glass p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleSend()
              }}
              className="flex gap-2"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white backdrop-blur-md placeholder:text-white/40 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md outline-none transition-all hover:border-amber-500/60 hover:bg-white/10 hover:text-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-40"
                aria-label="Gửi"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
