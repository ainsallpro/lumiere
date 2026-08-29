import { useState } from 'react'
import type { Product } from '../types'
import { saveReview, hasReviewed } from '../data/reviews'

interface OrderItem {
  product: Product
  qty: number
  color: string
}

interface ReviewModalProps {
  open: boolean
  onClose: () => void
  orderId: string
  items: OrderItem[]
  authorName: string
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="text-3xl transition-colors focus:outline-none"
          style={{ color: s <= (hovered || value) ? '#c9833a' : '#d6d3d1' }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

const LABEL = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export default function ReviewModal({ open, onClose, orderId, items, authorName }: ReviewModalProps) {
  const [step, setStep] = useState(0) // index of current product being reviewed
  const [ratings, setRatings] = useState<Record<number, number>>({})
  const [titles, setTitles] = useState<Record<number, string>>({})
  const [bodies, setBodies] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const reviewable = items.filter(({ product }) => !hasReviewed(product.id, orderId))

  // All already reviewed
  if (reviewable.length === 0 && !submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div
          className="relative bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-stone-900 text-xl font-semibold mb-2">Already Reviewed</h3>
          <p className="text-stone-500 text-sm mb-6">You have already submitted reviews for all products in this order.</p>
          <button onClick={onClose} className="bg-stone-900 text-white px-8 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div
          className="relative bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-16 h-16 bg-warm-100 text-warm-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 className="text-stone-900 text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Thank You!
          </h3>
          <p className="text-stone-500 text-sm mb-6">
            Your review has been submitted and will appear on the product page.
          </p>
          <button
            onClick={() => { setSubmitted(false); setStep(0); onClose() }}
            className="bg-stone-900 text-white px-8 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  const current = reviewable[step]
  const { product } = current
  const rating = ratings[product.id] ?? 0
  const title = titles[product.id] ?? ''
  const body = bodies[product.id] ?? ''

  const handleSubmitStep = async () => {
    if (rating === 0 || submitting) return
    setSubmitting(true)

    const reviewData = {
      productId: product.id,
      productName: product.name,
      orderId,
      authorName,
      rating,
      title: title || LABEL[rating],
      body,
      date: new Date().toISOString(),
    }

    // Save to localStorage immediately (local cache for hasReviewed)
    saveReview(reviewData)

    // Save to backend database
    try {
      const token = localStorage.getItem('lumiere_token') || ''
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reviewData)
      })
    } catch {
      // Silently fail - localStorage already saved as fallback
    } finally {
      setSubmitting(false)
    }

    if (step < reviewable.length - 1) {
      setStep(s => s + 1)
    } else {
      setSubmitted(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <p className="text-stone-400 text-xs">
              Product {step + 1} of {reviewable.length}
            </p>
            <h3 className="text-stone-900 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              Write a Review
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close review modal"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-700"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        {reviewable.length > 1 && (
          <div className="h-1 bg-stone-100">
            <div
              className="h-full bg-warm-400 transition-all duration-500"
              style={{ width: `${((step + 1) / reviewable.length) * 100}%` }}
            />
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Product info */}
          <div className="flex items-center gap-3 bg-stone-50 rounded-xl p-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
              <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-stone-900 text-sm font-semibold leading-snug">{product.name}</p>
              <p className="text-stone-400 text-xs mt-0.5">{product.subcategory} · {current.color}</p>
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label className="text-stone-700 text-sm font-medium mb-2 block">Your Rating *</label>
            <div className="flex items-center gap-3">
              <StarPicker value={rating} onChange={v => setRatings(r => ({ ...r, [product.id]: v }))} />
              {rating > 0 && (
                <span className="text-warm-600 text-sm font-medium">{LABEL[rating]}</span>
              )}
            </div>
            {rating === 0 && (
              <p className="text-red-400 text-xs mt-1">Please select a rating to continue</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-stone-700 text-sm font-medium mb-1.5 block">Review Title</label>
            <input
              type="text"
              placeholder={`e.g. "${LABEL[rating] || 'Great product'}!"`}
              value={title}
              onChange={e => setTitles(t => ({ ...t, [product.id]: e.target.value }))}
              maxLength={80}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-warm-400 transition-colors"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-stone-700 text-sm font-medium mb-1.5 block">
              Your Review <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Share your experience - quality, delivery, how it fits in your space..."
              value={body}
              onChange={e => setBodies(b => ({ ...b, [product.id]: e.target.value }))}
              rows={4}
              maxLength={500}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-warm-400 transition-colors resize-none"
            />
            <p className="text-stone-300 text-xs text-right mt-1">{body.length}/500</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-stone-500 text-sm hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitStep}
            disabled={rating === 0 || submitting}
            className={`px-7 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              rating === 0 || submitting
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 text-white hover:bg-stone-800 shadow-sm hover:shadow-md'
            }`}
          >
            {submitting ? 'Submitting…' : step < reviewable.length - 1 ? 'Submit & Next →' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  )
}
