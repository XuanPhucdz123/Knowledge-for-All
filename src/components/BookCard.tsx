import clsx from 'clsx'
import { MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCallback, useRef } from 'react'
import { CONDITION_LABELS, EXCHANGE_LABELS, STATUS_LABELS } from '../lib/constants'
import { formatDistance } from '../lib/geo'
import { ILLUSTRATIONS } from '../lib/images'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { BookWithDistance } from '../types/book'
import { Button } from './Button'
import { ImageWithSkeleton } from './ImageWithSkeleton'

interface BookCardProps {
  book: BookWithDistance
  onAction?: () => void
  onMessage?: () => void
  actionLabel?: string
  messageLabel?: string
  compact?: boolean
}

export function BookCard({
  book,
  onAction,
  onMessage,
  actionLabel = 'Xem chi tiết',
  messageLabel = 'Nhắn tin',
  compact,
}: BookCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const isTouch = typeof window !== 'undefined' && 'ontouchstart' in window

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduced || isTouch || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      cardRef.current.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) scale(1.02)`
    },
    [reduced, isTouch],
  )

  const handleLeave = useCallback(() => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)'
  }, [])

  const imageUrl = book.imageUrls[0]?.trim() || ILLUSTRATIONS.defaultCover

  return (
    <motion.article
      layout
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={clsx(
        'glass-card group overflow-hidden rounded-card border border-white/10 transition-all duration-300 ease-out lg:rounded-card-lg',
        'hover:-translate-y-1 hover:scale-[1.02] hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-500/10 hover:ring-1 hover:ring-amber-400/20',
        compact ? 'w-[220px]' : 'w-full',
      )}
      style={{ willChange: reduced ? undefined : 'transform' }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
        <ImageWithSkeleton
          src={imageUrl}
          fallbackSrc={ILLUSTRATIONS.defaultCover}
          alt={`Bìa sách ${book.title}`}
          loading="lazy"
          wrapperClassName="h-full w-full"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-accent-purple/90 px-3 py-1 text-xs font-semibold text-white">
          {EXCHANGE_LABELS[book.exchangeType]}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-dark/70 px-2 py-1 text-xs text-text-primary backdrop-blur-sm">
          {STATUS_LABELS[book.status]}
        </span>
      </div>

      <div className="p-4">
        <h3 className="mb-1 line-clamp-2 font-bold text-text-primary">{book.title}</h3>
        {book.author && (
          <p className="mb-2 text-sm text-text-muted">{book.author}</p>
        )}
        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/10 px-2 py-0.5">{book.category}</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5">
            {CONDITION_LABELS[book.condition]}
          </span>
        </div>
        <p className="mb-3 text-xs text-text-muted">bởi {book.ownerName}</p>
        {book.distanceMeters !== undefined && (
          <p className="mb-3 flex items-center gap-1 text-xs text-accent-teal">
            <MapPin className="h-3 w-3" />
            {formatDistance(book.distanceMeters)}
          </p>
        )}
        {(onAction || onMessage) && (
          <div className="flex gap-2">
            {onMessage && (
              <Button variant="primary" size="sm" className="flex-1" onClick={onMessage}>
                {messageLabel}
              </Button>
            )}
            {onAction && (
              <Button variant="outline" size="sm" className={onMessage ? 'flex-1' : 'w-full'} onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.article>
  )
}
