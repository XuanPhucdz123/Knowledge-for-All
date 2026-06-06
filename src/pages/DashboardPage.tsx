import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookCard } from '../components/BookCard'
import { EmptyState } from '../components/EmptyState'
import { GradientButton } from '../components/GradientButton'
import { useAuth } from '../hooks/useAuth'
import { useBooks } from '../hooks/useBooks'
import { haversineDistance } from '../lib/geo'
import type { ExchangeType } from '../types/book'

export function DashboardPage() {
  const { user } = useAuth()
  const { books, loading } = useBooks()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ExchangeType | 'all'>('all')
  const [sortNearby, setSortNearby] = useState(false)

  const filtered = useMemo(() => {
    let result = books.filter((b) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      const matchFilter = filter === 'all' || b.exchangeType === filter
      return matchSearch && matchFilter
    })

    if (sortNearby && user?.latitude && user?.longitude) {
      result = [...result]
        .map((b) => ({
          ...b,
          distanceMeters:
            b.latitude && b.longitude
              ? haversineDistance(user.latitude!, user.longitude!, b.latitude, b.longitude)
              : undefined,
        }))
        .sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity))
    }

    return result
  }, [books, search, filter, sortNearby, user])

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black text-text-primary">Khám phá sách</h1>
        <GradientButton onClick={() => navigate('/app/add-book')}>+ Đăng sách</GradientButton>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Tìm theo tên sách, tác giả, thể loại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-glass bg-white/5 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {(['all', 'share', 'exchange', 'borrow'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? 'bg-accent-yellow text-dark' : 'bg-white/10 text-text-muted hover:bg-white/15'
            }`}
          >
            {f === 'all' ? 'Tất cả' : f === 'share' ? 'Chia sẻ' : f === 'exchange' ? 'Trao đổi' : 'Cho mượn'}
          </button>
        ))}
        {user?.locationEnabled && (
          <button
            onClick={() => setSortNearby(!sortNearby)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              sortNearby ? 'bg-accent-teal text-dark' : 'bg-white/10 text-text-muted'
            }`}
          >
            Gần tôi nhất
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-yellow border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Chưa có sách nào được chia sẻ"
          description="Hãy là người đầu tiên đăng sách."
          actionLabel="Đăng sách ngay"
          onAction={() => navigate('/app/add-book')}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              actionLabel="Gửi yêu cầu"
              onAction={() => navigate(`/app?book=${book.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
