import { LocateFixed } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookCard } from '../components/BookCard'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { NearbyRadar } from '../components/NearbyRadar'
import { useToast } from '../components/Toast'
import { useAuth } from '../hooks/useAuth'
import { useNearbyBooks } from '../hooks/useBooks'
import { useGeolocation } from '../hooks/useGeolocation'
import { useMessages } from '../hooks/useMessages'
import { RADIUS_OPTIONS } from '../lib/constants'
import type { BookWithDistance } from '../types/book'

export function NearbyPage() {
  const { user, updateProfile } = useAuth()
  const { requestLocation, loading: geoLoading } = useGeolocation()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { startThread } = useMessages(user?.id, user?.fullName)
  const [radius, setRadius] = useState<number>(Infinity)
  const [messageBook, setMessageBook] = useState<BookWithDistance | null>(null)
  const [messageText, setMessageText] = useState('')

  const { books, loading } = useNearbyBooks(
    user?.latitude,
    user?.longitude,
    radius,
    user?.id,
  )

  const handleEnableLocation = async () => {
    try {
      const pos = await requestLocation()
      await updateProfile({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        locationAccuracy: pos.coords.accuracy,
        locationEnabled: true,
      })
      showToast('Đã bật định vị', 'success')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không thể bật định vị', 'error')
    }
  }

  const handleSendMessage = async () => {
    if (!messageBook || !messageText.trim()) return
    try {
      const thread = await startThread({
        bookId: messageBook.id,
        bookTitle: messageBook.title,
        ownerId: messageBook.ownerId,
        ownerName: messageBook.ownerName,
        initialMessage: messageText.trim(),
      })
      setMessageBook(null)
      setMessageText('')
      showToast('Đã gửi tin nhắn!', 'success')
      navigate(`/app/messages?thread=${thread.id}`)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không thể gửi tin nhắn', 'error')
    }
  }

  if (!user?.locationEnabled) {
    return (
      <div className="glass-card mx-auto max-w-lg rounded-card-lg p-8 text-center">
        <LocateFixed className="mx-auto mb-4 h-12 w-12 text-accent-blue" />
        <h2 className="mb-2 text-xl font-bold">Bật định vị để tìm sách gần bạn</h2>
        <p className="mb-6 text-text-muted">
          Chúng tôi chỉ dùng vị trí để tính khoảng cách tương đối. Không chia sẻ tọa độ chính xác.
        </p>
        <Button onClick={() => void handleEnableLocation()} disabled={geoLoading}>
          {geoLoading ? 'Đang xác định...' : 'Bật định vị'}
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-black text-text-primary">Sách gần bạn</h1>

      <div className="mb-8 flex justify-center">
        <NearbyRadar
          books={books}
          userLat={user.latitude}
          userLng={user.longitude}
          maxRadiusMeters={typeof radius === 'number' && radius !== Infinity ? radius : 10000}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {RADIUS_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setRadius(opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              radius === opt.value ? 'bg-accent-teal text-dark' : 'bg-white/10 text-text-muted'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-yellow border-t-transparent" />
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          title="Chưa có sách nào gần bạn"
          description="Thử mở rộng bán kính tìm kiếm hoặc đăng sách đầu tiên."
          actionLabel="Đăng sách"
          onAction={() => navigate('/app/add-book')}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onMessage={() => setMessageBook(book)}
              messageLabel="Nhắn tin"
            />
          ))}
        </div>
      )}

      {messageBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-2xl p-6">
            <h3 className="mb-1 font-bold text-text-primary">Nhắn tin về sách</h3>
            <p className="mb-4 text-sm text-accent-yellow">{messageBook.title}</p>
            <p className="mb-3 text-xs text-text-muted">Gửi tới {messageBook.ownerName}</p>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              placeholder="Xin chào, mình quan tâm đến quyển sách này..."
              className="mb-4 w-full resize-none rounded-xl border border-glass bg-white/5 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-yellow"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setMessageBook(null)}>
                Hủy
              </Button>
              <Button className="flex-1" onClick={() => void handleSendMessage()} disabled={!messageText.trim()}>
                Gửi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
