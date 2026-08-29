// ── User Review Storage (localStorage) ───────────────────────────────────────

export interface UserReview {
  productId: number
  productName: string
  orderId: string
  authorName: string
  rating: number
  title: string
  body: string
  date: string // ISO string
}

const STORAGE_KEY = 'furniter_user_reviews'

export function getAllReviews(): UserReview[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as UserReview[]
  } catch {
    return []
  }
}

export function getReviewsForProduct(productId: number): UserReview[] {
  return getAllReviews().filter(r => r.productId === productId)
}

export function saveReview(review: UserReview): void {
  const all = getAllReviews()
  // Replace if already reviewed same product+order
  const filtered = all.filter(
    r => !(r.productId === review.productId && r.orderId === review.orderId)
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, review]))
}

export function hasReviewed(productId: number, orderId: string): boolean {
  return getAllReviews().some(
    r => r.productId === productId && r.orderId === orderId
  )
}
