import { useState, useEffect } from 'react'
import type { Page } from '../App'
import type { Product } from '../types'
import { ProductsContext } from '../context'
import { useContext } from 'react'

interface HomePageProps {
  navigate: (page: Page, preFilter?: import('../App').ShopPreFilter) => void
  addToCart: (product: Product) => void
  openProduct: (product: Product) => void
  wishlist: Set<number>
  toggleWishlist: (id: number) => void
}

type TabKey = 'all' | 'latest' | 'bestseller' | 'featured'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All Products' },
  { key: 'latest', label: 'Latest Products' },
  { key: 'bestseller', label: 'Best Sellers' },
  { key: 'featured', label: 'Featured Products' },
]

function useCountdown(targetSeconds: number) {
  const [time, setTime] = useState(targetSeconds)
  useEffect(() => {
    const t = setInterval(() => setTime(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])
  const d = Math.floor(time / 86400)
  const h = Math.floor((time % 86400) / 3600)
  const m = Math.floor((time % 3600) / 60)
  const s = time % 60
  return { d, h, m, s }
}

function CountdownBadge({ seconds }: { seconds: number }) {
  const { d, h, m, s } = useCountdown(seconds)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-warm-500 text-white flex justify-around py-2 px-3 rounded-b-sm">
      {[{ v: pad(d), l: 'Days' }, { v: pad(h), l: 'Hours' }, { v: pad(m), l: 'Mins' }, { v: pad(s), l: 'Sec' }].map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-warm-200 font-light">:</span>}
          <div className="text-center">
            <p className="text-base font-bold leading-none">{v}</p>
            <p className="text-[9px] text-warm-100 leading-none mt-0.5">{l}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductCard({ product, addToCart, openProduct, wishlist, toggleWishlist }: {
  product: Product
  addToCart: (p: Product) => void
  openProduct: (p: Product) => void
  wishlist: Set<number>
  toggleWishlist: (id: number) => void
}) {
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="group bg-white rounded-sm border border-stone-100 hover:border-stone-300 hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Image area */}
      <div onClick={() => openProduct(product)} className="relative overflow-hidden bg-stone-100 cursor-pointer" style={{ aspectRatio: '4/4' }}>
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount badge */}
        <span className="absolute top-3 left-3 bg-stone-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
          {product.discount}% off
        </span>

        {/* Action icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id) }}
            aria-label={wishlist.has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            className={`w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50 transition-colors ${wishlist.has(product.id) ? 'text-red-500' : 'text-stone-400'}`}
          >
            <svg width="14" height="14" fill={wishlist.has(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Countdown timer for flash sale */}
        {product.hasTimer && (
          <CountdownBadge seconds={Math.floor(Math.random() * 86400 * 5 + 3600)} />
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-stone-400 text-[10px] tracking-widest uppercase">{product.subcategory}</p>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-warm-400">★</span>
            <span className="text-stone-600 font-medium">{product.rating}</span>
            <span className="text-stone-300">({product.reviews})</span>
          </div>
        </div>
        <h3 onClick={() => openProduct(product)} className="text-stone-900 text-base mb-2 leading-snug cursor-pointer hover:text-warm-700 transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-stone-900 text-base font-semibold">Rp {product.price.toLocaleString('id-ID')}</span>
          <span className="text-stone-400 text-sm line-through">Rp {product.originalPrice.toLocaleString('id-ID')}</span>
        </div>
        <button
          onClick={handleAdd}
          className={`mt-3 w-full py-2 text-xs tracking-wide rounded-sm transition-colors font-medium ${
            added
              ? 'bg-green-600 text-white'
              : 'bg-stone-900 text-white hover:bg-stone-700'
          }`}
        >
          {added ? '✓ Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

export default function HomePage({ navigate, addToCart, openProduct, wishlist, toggleWishlist }: HomePageProps) {
  const products = useContext(ProductsContext)
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [visibleCount, setVisibleCount] = useState(8)
  const [openFaq, setOpenFaq] = useState<number | null>(1) // Open the second one by default to match image

  // Dynamic category stats
  const chairs = products.filter(p => p.category === 'Chair')
  const sofas = products.filter(p => p.category === 'Sofa')
  const tables = products.filter(p => p.category === 'Table')
  
  const chairSubs = Array.from(new Set(chairs.map(p => p.subcategory || ''))).slice(0, 7)
  const sofaSubs = Array.from(new Set(sofas.map(p => p.subcategory || ''))).slice(0, 4)
  const tableSubs = Array.from(new Set(tables.map(p => p.subcategory || ''))).slice(0, 4)

  const filtered = activeTab === 'all'
    ? products
    : products.filter(p => p.tabs.includes(activeTab as any))

  const visible = filtered.slice(0, visibleCount)

  return (
    <div>
      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-end overflow-hidden bg-stone-200">
        <img
          src="/images/hero/hero_1.png"
          alt="Elegant gray chaise lounge beside a large window"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-20 w-full">
          <div className="max-w-xl">
            <p className="text-stone-300 text-xs tracking-[0.3em] uppercase mb-4 font-medium">New Collection - Summer 2026</p>
            <h1 className="text-white text-5xl lg:text-7xl leading-[1.05] mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Designed for<br /><em>how you live</em>
            </h1>
            <p className="text-stone-300 text-base leading-relaxed mb-8 max-w-sm">
              Sofas, chairs, and tables crafted from sustainably sourced materials and built to last a lifetime.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button onClick={() => navigate('shop')} className="bg-white text-stone-900 px-8 py-3.5 text-sm tracking-wide hover:bg-stone-100 transition-colors font-medium rounded-sm">
                Shop Collection
              </button>
              <button onClick={() => navigate('about')} className="border border-white/50 text-white px-8 py-3.5 text-sm tracking-wide hover:border-white hover:bg-white/10 transition-colors rounded-sm">
                Our Story
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* ── MARQUEE ──────────────────────────────── */}
      <div className="bg-stone-900 text-stone-300 text-xs tracking-[0.25em] uppercase overflow-hidden py-3">
        <div className="flex gap-12 whitespace-nowrap animate-marquee">
          {Array(8).fill(['Free Shipping Over Rp 5.000.000', 'Sustainably Sourced', 'Lifetime Warranty', '30-Day Returns', 'Expert Assembly']).flat().map((t, i) => (
            <span key={i} className="flex items-center gap-3">
              <span className="w-1 h-1 rounded-full bg-warm-400 inline-block" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── SERVICE BAR ──────────────────────────── */}
      <section className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200 gap-0">
          {[
            {
              icon: (
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="text-warm-500">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              ),
              title: 'Free Shipping',
              desc: 'Free shipping for all orders above Rp 5.000.000',
            },
            {
              icon: (
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="text-warm-500">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              ),
              title: 'Flexible Payment',
              desc: 'Multiple secure payment options available',
            },
            {
              icon: (
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="text-warm-500">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.06 12a19.79 19.79 0 0 1-3-8.57A2 2 0 0 1 3 1.84h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
                </svg>
              ),
              title: '24×7 Support',
              desc: 'Our team is available around the clock',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 px-6 first:pl-0 last:pr-0 py-4 md:py-0">
              <div className="w-12 h-12 bg-warm-50 border border-warm-100 rounded-sm flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
              <div>
                <p className="text-stone-900 text-sm font-semibold">{title}</p>
                <p className="text-stone-400 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORY SHOWCASE ────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="mb-10">
          <p className="text-warm-600 text-xs tracking-[0.25em] uppercase mb-2 font-medium">Browse by Type</p>
          <h2 className="text-stone-900 text-4xl" style={{ fontFamily: 'var(--font-display)' }}>Shop by Category</h2>
        </div>

        {/* 2-col grid: big Chairs left (row-span-2), Sofas + Tables stacked right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ gridTemplateRows: 'auto auto' }}>

          {/* ── CHAIRS - tall card ── */}
          <div
            className="relative rounded-2xl overflow-hidden lg:row-span-2 cursor-pointer group"
            style={{ minHeight: 480, backgroundColor: '#F5F4F2' }}
            onClick={() => navigate('shop', { categories: ['Chair'] })}
          >
            {/* Product image - floats on the right, blends with card bg */}
            <img
              src="/chair_1.png"
              alt="Wooden bar stool chair"
              className="absolute bottom-0 right-0 h-full w-auto object-contain object-bottom group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* text content */}
            <div className="relative z-10 p-7 flex flex-col h-full">
              <span className="inline-flex items-center gap-1.5 bg-white/80 text-stone-700 text-[11px] font-semibold px-3 py-1.5 rounded-full w-fit mb-4 shadow-sm">
                <span className="text-warm-500 font-bold">{chairs.length}</span> Items
              </span>
              <h3 className="text-stone-900 mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: 48, lineHeight: 1 }}>Chairs</h3>
              <p className="text-stone-500 text-sm mb-5 max-w-[180px] leading-relaxed">
                Lounge, dining, accent - crafted for comfort and beauty.
              </p>
              <ul className="space-y-2 text-sm text-stone-600 mb-auto">
                {chairSubs.map(s => (
                  <li 
                    key={s} 
                    onClick={(e) => { e.stopPropagation(); navigate('shop', { categories: ['Chair'], subcategories: [s] }) }}
                    className="hover:text-stone-900 cursor-pointer transition-colors w-fit"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              <span className="mt-6 text-xs tracking-wide text-stone-500 group-hover:text-stone-900 transition-colors flex items-center gap-1 w-fit">
                View All <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
              </span>
            </div>
          </div>

          {/* ── SOFAS - top-right card ── */}
          <div
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{ minHeight: 230, backgroundColor: '#F5F4F2' }}
            onClick={() => navigate('shop', { categories: ['Sofa'] })}
          >
            {/* Product image */}
            <img
              src="/sofa_1.png"
              alt="White sofa"
              className="absolute bottom-0 right-0 h-full w-auto object-contain object-bottom group-hover:scale-105 transition-transform duration-700"
            />

            <div className="relative z-10 p-6 flex flex-col h-full">
              <span className="inline-flex items-center gap-1.5 bg-white/80 text-stone-700 text-[11px] font-semibold px-3 py-1.5 rounded-full w-fit mb-3 shadow-sm">
                <span className="text-warm-500 font-bold">{sofas.length}</span> Items
              </span>
              <h3 className="text-stone-900 mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1 }}>Sofa</h3>
              <ul className="space-y-1.5 text-sm text-stone-600 mb-auto">
                {sofaSubs.map(s => (
                  <li 
                    key={s} 
                    onClick={(e) => { e.stopPropagation(); navigate('shop', { categories: ['Sofa'], subcategories: [s] }) }}
                    className="hover:text-stone-900 transition-colors w-fit"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              <span className="mt-4 text-xs text-stone-500 group-hover:text-stone-900 transition-colors flex items-center gap-1 w-fit">
                View All <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
              </span>
            </div>
          </div>

          {/* ── TABLES - bottom-right card ── */}
          <div
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{ minHeight: 230, backgroundColor: '#F5F4F2' }}
            onClick={() => navigate('shop', { categories: ['Table'] })}
          >
            {/* Product image */}
            <img
              src="/tables_1.png"
              alt="Wooden side table"
              className="absolute bottom-0 right-0 h-full w-auto object-contain object-bottom group-hover:scale-105 transition-transform duration-700"
            />

            <div className="relative z-10 p-6 flex flex-col h-full">
              <span className="inline-flex items-center gap-1.5 bg-white/80 text-stone-700 text-[11px] font-semibold px-3 py-1.5 rounded-full w-fit mb-3 shadow-sm">
                <span className="text-warm-500 font-bold">{tables.length}</span> Items
              </span>
              <h3 className="text-stone-900 mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1 }}>Tables</h3>
              <ul className="space-y-1.5 text-sm text-stone-600 mb-auto">
                {tableSubs.map(s => (
                  <li 
                    key={s} 
                    onClick={(e) => { e.stopPropagation(); navigate('shop', { categories: ['Table'], subcategories: [s] }) }}
                    className="hover:text-stone-900 transition-colors w-fit"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              <span className="mt-4 text-xs text-stone-500 group-hover:text-stone-900 transition-colors flex items-center gap-1 w-fit">
                View All <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ── PRODUCT COLLECTION ───────────────────── */}
      <section className="bg-stone-50 border-t border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-px w-8 bg-warm-400" />
              <p className="text-warm-600 text-xs tracking-[0.25em] uppercase font-medium">Our Products</p>
              <div className="h-px w-8 bg-warm-400" />
            </div>
            <h2 className="text-stone-900 text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
              Our <span className="text-warm-600">Products</span> Collections
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setVisibleCount(8) }}
                className={`px-6 py-2.5 text-sm rounded-full border transition-colors font-medium ${
                  activeTab === t.key
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-600 border-stone-300 hover:border-stone-600 hover:text-stone-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {visible.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                openProduct={openProduct}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            ))}
          </div>

          {/* Load more */}
          {visibleCount < filtered.length && (
            <div className="text-center mt-10">
              <button
                onClick={() => navigate('shop')}
                className="border border-stone-300 text-stone-600 px-12 py-3 text-sm tracking-wide hover:border-stone-900 hover:text-stone-900 transition-colors rounded-sm"
              >
                View All Products in Shop →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIAL ──────────────────────────── */}
      <section className="bg-stone-900 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {Array(5).fill(0).map((_, i) => <span key={i} className="text-warm-400">★</span>)}
          </div>
          <blockquote className="text-stone-100 text-3xl lg:text-4xl leading-snug mb-8 italic" style={{ fontFamily: 'var(--font-display)' }}>
            "Lumière transformed our home. The quality is extraordinary - each piece feels like it was made just for us."
          </blockquote>
          <p className="text-stone-400 text-sm tracking-wide"> - Isabelle Marchand, Paris</p>
        </div>
      </section>

      {/* ── VALUE PROPS ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: '◈', title: 'Master Craftsmanship', desc: 'Every joint, every finish - made by artisans with decades of experience.' },
            { icon: '◉', title: 'Sustainably Sourced', desc: 'FSC-certified wood and recycled materials in every piece we make.' },
            { icon: '◎', title: 'Lifetime Warranty', desc: "We stand behind our work. If it breaks, we'll repair or replace it." },
            { icon: '◐', title: 'White Glove Delivery', desc: 'In-home delivery and professional assembly included on all orders.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="border-t border-stone-200 pt-6">
              <span className="text-warm-500 text-2xl mb-3 block">{icon}</span>
              <h3 className="text-stone-900 font-semibold text-sm mb-2 tracking-wide">{title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ SECTION ──────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-12 py-20">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px w-8 bg-warm-400" />
            <p className="text-warm-600 text-xs tracking-[0.25em] uppercase font-medium">Faqs</p>
          </div>
          <h2 className="text-stone-900 text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Question? <span className="text-stone-900">Look here.</span>
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'What types of furniture do you offer?',
              a: 'We offer a curated selection of premium furniture for your living room, bedroom, dining room, and home office, including sofas, chairs, tables, and complete room packages.'
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards, bank transfers, and flexible payment plans through our partnered financing options.'
            },
            {
              q: 'Can I track my furniture delivery?',
              a: "Yes, once your order is dispatched, you will receive a tracking link in your account dashboard under 'My Orders'."
            },
            {
              q: 'What is your return policy?',
              a: 'We offer a 30-day return policy on all standard items. The furniture must be in its original condition.'
            },
            {
              q: 'What materials are used in your furniture?',
              a: 'We use sustainably sourced FSC-certified wood, premium full-grain leathers, and highly durable fabrics designed for longevity.'
            },
            {
              q: 'Are there any discounts or promotions available?',
              a: "We occasionally run promotions. We also offer a permanent 20% discount on all 'Complete Room Packages' when you purchase a bundled set."
            }
          ].map((faq, i) => {
            const isOpen = openFaq === i
            return (
              <div 
                key={i} 
                onClick={() => setOpenFaq(isOpen ? null : i)}
                className={`border rounded-xl cursor-pointer transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'border-stone-900 bg-stone-900' 
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between p-5 lg:px-8 lg:py-6">
                  <h4 className={`text-base font-semibold transition-colors ${isOpen ? 'text-white' : 'text-stone-900'}`}>
                    {faq.q}
                  </h4>
                  <span className={`text-xl transition-transform duration-300 ${isOpen ? 'text-warm-400 rotate-180' : 'text-stone-400'}`}>
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
                <div 
                  className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="px-5 pb-5 lg:px-8 lg:pb-6 text-sm leading-relaxed text-stone-300">
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────── */}
      <section className="bg-warm-100 border-t border-warm-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-stone-900 text-4xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>Visit Our Showroom</h2>
            <p className="text-stone-600 text-sm leading-relaxed max-w-md">
              Experience our full collection in person. Book a private appointment with one of our interior consultants.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('contact')} className="bg-stone-900 text-stone-50 px-8 py-3.5 text-sm tracking-wide hover:bg-stone-800 transition-colors rounded-sm font-medium">
              Book Appointment
            </button>
            <button onClick={() => navigate('shop')} className="border border-stone-400 text-stone-700 px-8 py-3.5 text-sm tracking-wide hover:border-stone-900 hover:text-stone-900 transition-colors rounded-sm">
              Shop Online
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
