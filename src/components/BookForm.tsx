import clsx from 'clsx'
import { BOOK_CATEGORIES } from '../lib/constants'
import { validateBookForm } from '../lib/validation'
import type { BookCondition, CreateBookInput, ExchangeType } from '../types/book'
import { GradientButton } from './GradientButton'

interface BookFormProps {
  initial?: Partial<CreateBookInput>
  onSubmit: (data: CreateBookInput) => Promise<void>
  useLocation?: boolean
  locationEnabled?: boolean
  imageUrls: string[]
  onImageCapture: (url: string) => void
  submitLabel?: string
  cameraSlot: React.ReactNode
}

export function BookForm({
  initial,
  onSubmit,
  useLocation: useLoc = false,
  locationEnabled = false,
  imageUrls,
  submitLabel = 'Đăng sách',
  cameraSlot,
}: BookFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = {
      title: fd.get('title') as string,
      author: (fd.get('author') as string) || undefined,
      category: fd.get('category') as string,
      condition: fd.get('condition') as BookCondition,
      exchangeType: fd.get('exchangeType') as ExchangeType,
      description: fd.get('description') as string,
    }

    const errors = validateBookForm(data)
    const errorEl = document.getElementById('form-errors')
    if (Object.keys(errors).length > 0) {
      if (errorEl) {
        errorEl.textContent = Object.values(errors).join('. ')
        errorEl.classList.remove('hidden')
      }
      return
    }
    if (errorEl) errorEl.classList.add('hidden')

    await onSubmit({
      ...data,
      imageUrls,
      ...(useLoc && locationEnabled ? {} : {}),
    })
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      {cameraSlot}

      <div id="form-errors" className="hidden text-sm text-accent-rose" role="alert" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tên sách *" name="title" defaultValue={initial?.title} placeholder="Tên sách của bạn" required />
        <Field label="Tác giả" name="author" defaultValue={initial?.author} placeholder="Tác giả" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-text-primary">
            Thể loại *
          </label>
          <select
            id="category"
            name="category"
            defaultValue={initial?.category ?? ''}
            required
            className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
          >
            <option value="" disabled>Chọn thể loại</option>
            {BOOK_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="condition" className="mb-1.5 block text-sm font-medium text-text-primary">
            Tình trạng *
          </label>
          <select
            id="condition"
            name="condition"
            defaultValue={initial?.condition ?? 'good'}
            required
            className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
          >
            <option value="new">Mới</option>
            <option value="good">Tốt</option>
            <option value="used">Đã dùng</option>
            <option value="old">Cũ</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="exchangeType" className="mb-1.5 block text-sm font-medium text-text-primary">
          Hình thức *
        </label>
        <select
          id="exchangeType"
          name="exchangeType"
          defaultValue={initial?.exchangeType ?? 'share'}
          required
          className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
        >
          <option value="share">Chia sẻ</option>
          <option value="exchange">Trao đổi</option>
          <option value="borrow">Cho mượn</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-text-primary">
          Mô tả *
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initial?.description}
          placeholder="Mô tả ngắn về sách (ít nhất 20 ký tự)"
          required
          minLength={20}
          className="w-full resize-none rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-yellow"
        />
      </div>

      {locationEnabled && (
        <label className="flex items-center gap-3 text-sm text-text-muted">
          <input type="checkbox" name="useLocation" defaultChecked className="h-4 w-4 rounded accent-accent-yellow" />
          Dùng vị trí hiện tại cho sách này
        </label>
      )}

      <GradientButton type="submit">{submitLabel}</GradientButton>
    </form>
  )
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
}: {
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className={clsx(
          'w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-text-primary',
          'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-yellow',
        )}
      />
    </div>
  )
}
