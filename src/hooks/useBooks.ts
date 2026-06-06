import { useCallback, useEffect, useState } from 'react'
import { getAdapter } from '../lib/dataAdapter'
import { haversineDistance } from '../lib/geo'
import type { Book, BookWithDistance, CreateBookInput, UpdateBookInput } from '../types/book'

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdapter().getBooks()
      setBooks(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải danh sách sách')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchBooks()
  }, [fetchBooks])

  return { books, loading, error, refetch: fetchBooks }
}

export function useMyBooks(userId: string | undefined) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMyBooks = useCallback(async () => {
    if (!userId) {
      setBooks([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await getAdapter().getMyBooks(userId)
      setBooks(data)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void fetchMyBooks()
  }, [fetchMyBooks])

  const createBook = async (ownerName: string, input: CreateBookInput) => {
    if (!userId) throw new Error('Chưa đăng nhập')
    const book = await getAdapter().createBook(userId, ownerName, input)
    setBooks((prev) => [book, ...prev])
    return book
  }

  const updateBook = async (id: string, input: UpdateBookInput) => {
    if (!userId) throw new Error('Chưa đăng nhập')
    const book = await getAdapter().updateBook(id, userId, input)
    setBooks((prev) => prev.map((b) => (b.id === id ? book : b)))
    return book
  }

  const deleteBook = async (id: string) => {
    if (!userId) throw new Error('Chưa đăng nhập')
    await getAdapter().deleteBook(id, userId)
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  return { books, loading, refetch: fetchMyBooks, createBook, updateBook, deleteBook }
}

export function useNearbyBooks(
  userLat?: number,
  userLng?: number,
  radiusMeters = Infinity,
  excludeOwnerId?: string,
) {
  const { books, loading, refetch } = useBooks()

  const nearby: BookWithDistance[] = books
    .filter((b) => {
      if (excludeOwnerId && b.ownerId === excludeOwnerId) return false
      if (!b.latitude || !b.longitude) return false
      if (!userLat || !userLng) return true
      const dist = haversineDistance(userLat, userLng, b.latitude, b.longitude)
      return dist <= radiusMeters
    })
    .map((b): BookWithDistance => {
      if (!userLat || !userLng || !b.latitude || !b.longitude) return { ...b }
      return {
        ...b,
        distanceMeters: haversineDistance(userLat, userLng, b.latitude, b.longitude),
      }
    })
    .sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity))

  return { books: nearby, loading, refetch }
}
