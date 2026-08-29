import { useState, useMemo, useEffect } from 'react'
import type { Product } from '../types'
import type { Page } from '../App'
import { ProductsContext } from '../context'
import { useContext } from 'react'
import { getReviewsForProduct } from '../data/reviews'

interface Props {
  product: Product
  onBack: () => void
  addToCart: (product: Product, qty: number, color?: string) => void
  openProduct: (product: Product) => void
  navigate: (page: Page, preFilter?: import('../App').ShopPreFilter) => void
  wishlist: Set<number>
  toggleWishlist: (id: number) => void
}

// ── helpers ──────────────────────────────────────────────────────────────────
const COLOR_HEX: Record<string, string> = {
  Natural: '#c8a882', Beige: '#e8d8c0', White: '#f5f5f3', Grey: '#9e9e9e',
  Black: '#2c2c2c', Brown: '#6b3e26', Walnut: '#5c3317', Oak: '#b08d57',
  Mixed: 'linear-gradient(135deg, #e8d8c0 0%, #9e9e9e 50%, #2c2c2c 100%)',
}

const reviewAuthors = [
  { name: 'Isabelle Marchand', avatar: '/images/team/team-10.jpg', time: '1 week ago' },
  { name: 'Thomas Andersen',   avatar: '/images/team/team-11.jpg', time: '2 weeks ago' },
  { name: 'Nora Lindqvist',    avatar: '/images/team/team-12.jpg', time: '1 month ago' },
  { name: 'Kofi Mensah',       avatar: '/images/team/team-13.jpg', time: '2 months ago' },
  { name: 'Amélie Dubois',     avatar: '/images/team/team-14.jpg', time: '3 months ago' },
]
const reviewTitles = [
  'Absolutely love this piece - quality exceeded expectations!',
  'Beautiful design, exactly as pictured.',
  'Worth every penny. Sturdy and elegant.',
  'Great addition to our home. Fast delivery too.',
  'Superb craftsmanship. Our guests always compliment it.',
]
const reviewBodies = [
  "We've had this for three months now and it still looks brand new. The materials are high quality and the finish is flawless. Assembly was straightforward and the result is exactly what we hoped for.",
  "Ordered this after seeing it in a friend's home. Delivery was quick and the packaging was excellent - no damage at all. It fits perfectly in our living room and the colour is exactly as shown.",
  "I was a little hesitant at the price point but decided to invest and I'm so glad I did. The build quality is exceptional. This will last decades, not years.",
  "Elegant, well-made, and the dimensions are spot-on. I measured carefully before ordering and it fits the space perfectly. The warm tone of the wood complements our existing furniture beautifully.",
  "Third piece I've bought from Lumière and I'm never disappointed. Consistent quality, great communication, and the product speaks for itself.",
]

function StarFill({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={s <= Math.round(rating) ? 'text-warm-400' : 'text-stone-200'}>★</span>
      ))}
    </div>
  )
}

// build thumbnail variants from one image by varying crop position
function thumbVariants(img: string) {
  const base = img.split('?')[0]
  return [
    `${base}?w=300&h=300&fit=crop&auto=format`,
    `${base}?w=300&h=300&fit=crop&auto=format&crop=top`,
    `${base}?w=300&h=300&fit=crop&auto=format&crop=bottom`,
    `${base}?w=300&h=300&fit=crop&auto=format&crop=left`,
  ]
}

export default function ProductDetailPage({ product, onBack, addToCart, openProduct, navigate, wishlist, toggleWishlist }: Props) {
  const products = useContext(ProductsContext)
  const thumbs = useMemo(() => {
    if (product.gallery && product.gallery.length > 0) {
      return [product.img, ...product.gallery]
    }
    return thumbVariants(product.img)
  }, [product.img, product.gallery])
  const [activeThumb, setActiveThumb] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Mixed')
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'info' | 'review'>('description')
  const [reviewSort, setReviewSort] = useState('Newest')
  const isWishlisted = wishlist.has(product.id)
  const [added, setAdded] = useState(false)

  // related products (same category, different id)
  const related = useMemo(() =>
    products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4),
    [product, products]
  )

  // dummy reviews seeded from product id
  const reviews = useMemo(() => {
    const count = 3 + (product.id % 3)
    return Array.from({ length: count }, (_, i) => {
      // Create a faux old date for sorting purposes
      const past = new Date()
      past.setMonth(past.getMonth() - (i + 1))
      
      return {
        author: reviewAuthors[(product.id + i) % reviewAuthors.length],
        title: reviewTitles[(product.id + i) % reviewTitles.length],
        body: reviewBodies[(product.id + i) % reviewBodies.length],
        rating: 4.5 + ((product.id + i) % 3) * 0.25,
        verified: true,
        isUser: false,
        rawDate: past.getTime()
      }
    })
  }, [product])

  const [dbReviews, setDbReviews] = useState<any[]>([])

  // Fetch reviews from PostgreSQL database
  useEffect(() => {
    fetch(`/api/products/${product.id}/reviews`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbReviews(data)
      })
      .catch(() => {})
  }, [product.id])

  // user-submitted reviews from database + localStorage cache
  const userReviews = useMemo(() => {
    const local = getReviewsForProduct(product.id)
    const map = new Map<string, any>()

    // Add local reviews
    local.forEach(r => map.set(r.orderId, r))
    // Add or override with DB reviews
    dbReviews.forEach(r => map.set(r.orderId, r))

    return Array.from(map.values()).map(r => ({
      author: {
        name: r.authorName,
        avatar: '',
        time: new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      },
      title: r.title,
      body: r.body,
      rating: r.rating,
      verified: true,
      isUser: true,
      rawDate: new Date(r.date).getTime()
    }))
  }, [product, dbReviews])

  const sortedReviews = useMemo(() => {
    const combined = [...userReviews, ...reviews]
    return combined.sort((a, b) => {
      if (reviewSort === 'Newest') return b.rawDate - a.rawDate
      if (reviewSort === 'Oldest') return a.rawDate - b.rawDate
      if (reviewSort === 'Highest Rating') return b.rating - a.rating
      if (reviewSort === 'Lowest Rating') return a.rating - b.rating
      return 0
    })
  }, [userReviews, reviews, reviewSort])

  // Dynamic star breakdown including real user reviews
  const starBreakdown = useMemo(() => {
    const combined = [...userReviews, ...reviews]
    const total = combined.length
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    combined.forEach(r => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)))
      counts[rounded] = (counts[rounded] || 0) + 1
    })

    return [5, 4, 3, 2, 1].map(star => ({
      star,
      count: counts[star],
      pct: total > 0 ? Math.round((counts[star] / total) * 100) : 0,
    }))
  }, [userReviews, reviews])

  const handleAddToCart = () => {
    addToCart(product, qty, selectedColor)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const skuCode = `LM-${product.category.slice(0,2).toUpperCase()}${String(product.id).padStart(4,'0')}`
  const weight = `${10 + (product.id % 20)} kg`
  const dims = `${50 + (product.id % 50)}"D × ${40 + (product.id % 30)}"W × ${70 + (product.id % 60)}"H`

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex items-center gap-2 text-xs text-stone-400">
          <button onClick={() => navigate('home')} className="hover:text-stone-700 transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate('shop')} className="hover:text-stone-700 transition-colors">Shop</button>
          <span>/</span>
          <button onClick={onBack} className="hover:text-stone-700 transition-colors">{product.category}</button>
          <span>/</span>
          <span className="text-stone-700 truncate max-w-[180px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10">

        {/* ── MAIN PRODUCT SECTION ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">

          {/* Left - image gallery */}
          <div>
            {/* Main image */}
            <div className="relative bg-stone-100 rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: '1' }}>
              <img
                src={thumbs[activeThumb]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* Color Tint Overlay */}
              {selectedColor !== 'Mixed' && COLOR_HEX[selectedColor] && (
                <div 
                  className="absolute inset-0 pointer-events-none transition-colors duration-500"
                  style={{ 
                    backgroundColor: COLOR_HEX[selectedColor], 
                    mixBlendMode: 'color', 
                    opacity: 0.5 
                  }} 
                />
              )}
              {/* Prev / Next */}
              <button
                onClick={() => setActiveThumb(t => (t - 1 + thumbs.length) % thumbs.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-stone-900 text-white rounded-lg flex items-center justify-center hover:bg-stone-700 transition-colors shadow-lg"
              >‹</button>
              <button
                onClick={() => setActiveThumb(t => (t + 1) % thumbs.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-warm-400 text-white rounded-lg flex items-center justify-center hover:bg-warm-500 transition-colors shadow-lg"
              >›</button>

              {/* Discount badge */}
              <span className="absolute top-4 left-4 bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                {product.discount}% off
              </span>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {thumbs.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`flex-1 aspect-square bg-stone-100 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeThumb === i ? 'border-stone-900' : 'border-transparent hover:border-stone-300'
                  }`}
                >
                  <div className="relative w-full h-full">
                    <img src={t} alt="" className="w-full h-full object-cover" />
                    {selectedColor !== 'Mixed' && COLOR_HEX[selectedColor] && (
                      <div 
                        className="absolute inset-0 pointer-events-none transition-colors duration-500"
                        style={{ 
                          backgroundColor: COLOR_HEX[selectedColor], 
                          mixBlendMode: 'color', 
                          opacity: 0.5 
                        }} 
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right - product info */}
          <div>
            {/* Category + stock */}
            <div className="flex items-center gap-3 mb-2">
              <p className="text-stone-400 text-sm">{product.subcategory}</p>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                product.inStock
                  ? 'text-green-700 border-green-200 bg-green-50'
                  : 'text-red-500 border-red-200 bg-red-50'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-stone-900 text-4xl mb-3 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <StarFill rating={product.rating} />
              <span className="text-stone-700 text-sm font-medium">{product.rating}</span>
              <span className="text-stone-400 text-sm">({product.reviews} Reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-stone-200">
              <span className="text-stone-900 text-4xl font-bold">Rp {product.price.toLocaleString('id-ID')}</span>
              <span className="text-stone-400 text-xl line-through">Rp {product.originalPrice.toLocaleString('id-ID')}</span>
              <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                Save Rp {(product.originalPrice - product.price).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Description */}
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              Crafted with premium {product.material.toLowerCase()} and finished to perfection, the {product.name} brings timeless elegance to any space. Designed for everyday living - built to last generations.
            </p>

            {/* Color picker */}
            <div className="mb-6">
              <p className="text-stone-700 text-sm font-semibold mb-2.5">
                Color : <span className="text-stone-500 font-normal">{selectedColor}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {(product.colors || ['Mixed']).map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    title={c}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === c ? 'border-stone-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ background: COLOR_HEX[c] ?? '#ccc' }}
                  />
                ))}
              </div>
            </div>

            {/* Qty + CTA */}
            <div className="flex items-center gap-3 flex-wrap mb-7">
              {/* Quantity */}
              <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors text-lg"
                >−</button>
                <span className="w-10 text-center text-stone-900 font-semibold text-sm">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors text-lg"
                >+</button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 min-w-[140px] py-3 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
                  added
                    ? 'bg-green-600 text-white'
                    : product.inStock
                    ? 'bg-stone-900 text-white hover:bg-stone-700'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                {added ? '✓ Added to Cart' : 'Add To Cart'}
              </button>

              {/* Buy Now */}
              <button
                onClick={() => { addToCart(product, qty) }}
                disabled={!product.inStock}
                className="flex-1 min-w-[120px] py-3 rounded-xl text-sm font-semibold tracking-wide bg-warm-400 text-white hover:bg-warm-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
                  isWishlisted ? 'border-red-300 bg-red-50 text-red-500' : 'border-stone-300 text-stone-400 hover:border-red-300 hover:text-red-400'
                }`}
              >
                <svg width="16" height="16" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>

            {/* Meta info */}
            <div className="border-t border-stone-200 pt-5 space-y-2.5 text-sm">
              <p className="text-stone-600">
                <span className="font-semibold text-stone-800">SKU :</span>{' '}
                <span className="font-mono">{skuCode}</span>
              </p>
              <p className="text-stone-600">
                <span className="font-semibold text-stone-800">Material :</span>{' '}
                {product.material}
              </p>
              <p className="text-stone-600">
                <span className="font-semibold text-stone-800">Tags :</span>{' '}
                Furniture, {product.room}, {product.subcategory}, {product.category}
              </p>
            </div>
          </div>
        </div>

        {/* ── TABS ────────────────────────────────────────────── */}
        <div className="mb-16">
          {/* Tab bar */}
          <div className="flex gap-8 border-b border-stone-200 mb-8">
            {([
              { key: 'description', label: 'Description' },
              { key: 'info',        label: 'Additional Information' },
              { key: 'review',      label: `Review (${product.reviews})` },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  activeTab === t.key
                    ? 'text-stone-900 border-stone-900'
                    : 'text-stone-400 border-transparent hover:text-stone-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Description */}
          {activeTab === 'description' && (
            <div className="max-w-3xl">
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                The {product.name} is a masterpiece of contemporary craft. Built from {product.material.toLowerCase()}, every detail is considered - from the precise joinery to the smooth, hand-applied finish. Whether placed as a focal point or as part of a larger ensemble, it commands attention without demanding it.
              </p>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                Designed in our Lyon atelier and handcrafted in workshops across Scandinavia and Northern France, each piece is made to order and finished by artisans who take pride in their work. The result is furniture that improves with age - a genuinely long-term investment in your home.
              </p>
              <ul className="space-y-3">
                {[
                  `Premium ${product.material} construction - built for decades of daily use`,
                  'Hand-applied, non-toxic finish safe for families and pets',
                  'All fixings and assembly tools included - 30 min average build time',
                  'FSC-certified sustainable material sourcing throughout',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-stone-600">
                    <span className="w-5 h-5 rounded-full bg-warm-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Info */}
          {activeTab === 'info' && (
            <div className="max-w-2xl overflow-hidden rounded-xl border border-stone-200">
              {/* Header */}
              <div className="grid grid-cols-2 bg-warm-400 text-white text-sm font-semibold">
                <div className="px-5 py-3">Feature</div>
                <div className="px-5 py-3">Description</div>
              </div>
              {[
                { feature: 'Primary Material',  value: product.material },
                { feature: 'Color Options',     value: product.colors?.join(', ') || 'Mixed' },
                { feature: 'Item Weight',       value: weight },
                { feature: 'Dimensions',        value: dims },
                { feature: 'Brand',             value: 'Lumière' },
                { feature: 'Category',          value: product.category },
                { feature: 'Subcategory',       value: product.subcategory },
                { feature: 'Room',              value: product.room },
                { feature: 'Warranty',          value: 'Lifetime - repair or replace' },
                { feature: 'Assembly',          value: 'Required - approx. 30 min, tools included' },
                { feature: 'SKU',               value: skuCode },
              ].map(({ feature, value }, i) => (
                <div key={feature} className={`grid grid-cols-2 text-sm border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}`}>
                  <div className="px-5 py-3 text-stone-600">{feature}</div>
                  <div className="px-5 py-3 text-stone-800">{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'review' && (
            <div>
              {/* Rating summary */}
              <div className="flex gap-10 items-start mb-10 pb-10 border-b border-stone-200">
                {/* Big number */}
                <div className="text-center flex-shrink-0">
                  <p className="text-6xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>{product.rating}</p>
                  <p className="text-stone-500 text-sm mt-1">out of 5</p>
                  <div className="flex justify-center my-2">
                    <StarFill rating={product.rating} />
                  </div>
                  <p className="text-stone-400 text-xs">({product.reviews} Reviews)</p>
                </div>

                {/* Bar breakdown */}
                <div className="flex-1 space-y-2.5">
                  {starBreakdown.map(({ star, pct }) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm text-stone-500 w-10 text-right flex-shrink-0">{star} Star</span>
                      <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warm-400 rounded-full transition-all"
                          style={{ width: `${star === 5 ? 75 : star === 4 ? 45 : star === 3 ? 15 : star === 2 ? 8 : 4}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review list */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-stone-900 font-semibold">Review List</h3>
                  <p className="text-stone-400 text-xs mt-0.5">Showing {userReviews.length + reviews.length} of {product.reviews + userReviews.length} results</p>
                </div>
                <select 
                  value={reviewSort} 
                  onChange={e => setReviewSort(e.target.value)}
                  className="border border-stone-300 text-stone-700 text-xs px-3 py-2 rounded-lg bg-white focus:outline-none"
                >
                  <option>Newest</option>
                  <option>Oldest</option>
                  <option>Highest Rating</option>
                  <option>Lowest Rating</option>
                </select>
              </div>

              <div className="space-y-8">
                {sortedReviews.map((r, i) => (
                  <div key={i} className="border-b border-stone-100 pb-8 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {r.isUser ? (
                          <div className="w-10 h-10 rounded-full bg-warm-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {r.author.name.charAt(0)}
                          </div>
                        ) : (
                          <img src={r.author.avatar} alt={r.author.name} className="w-10 h-10 rounded-full object-cover bg-stone-200" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-stone-900 text-sm font-semibold">{r.author.name}</p>
                            {r.isUser && <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Your Review</span>}
                          </div>
                          <p className="text-stone-400 text-xs">Verified Purchase</p>
                        </div>
                      </div>
                      <span className="text-stone-400 text-xs">{r.author.time}</span>
                    </div>
                    <h4 className="text-stone-900 text-sm font-semibold mb-2">{r.title}</h4>
                    {r.body && <p className="text-stone-500 text-sm leading-relaxed mb-3">{r.body}</p>}
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= Math.round(r.rating) ? 'text-warm-400 text-sm' : 'text-stone-200 text-sm'}>★</span>
                      ))}
                      <span className="text-stone-500 text-xs ml-1">{r.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RELATED PRODUCTS ────────────────────────────────── */}
        <div>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-warm-600 text-xs tracking-[0.25em] uppercase mb-1 font-medium">More Like This</p>
              <h2 className="text-stone-900 text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
                Related Products
              </h2>
            </div>
            <button onClick={() => navigate('shop')} className="text-sm text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1 group hidden sm:flex">
              View All <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map(p => (
              <div
                key={p.id}
                onClick={() => openProduct(p)}
                className="group bg-white rounded-xl border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className="relative bg-stone-100 overflow-hidden" style={{ aspectRatio: '1' }}>
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-stone-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {p.discount}% off
                  </span>
                </div>
                <div className="p-3.5">
                  <p className="text-stone-400 text-[10px] uppercase tracking-widest mb-1">{p.subcategory}</p>
                  <h3 className="text-stone-900 text-sm font-semibold mb-1.5 leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-900 text-sm font-bold">Rp {p.price.toLocaleString('id-ID')}</span>
                    <span className="text-stone-400 text-xs line-through">Rp {p.originalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
