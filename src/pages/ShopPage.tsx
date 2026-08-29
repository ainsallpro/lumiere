import { useState, useMemo } from 'react'
import type { Product } from '../types'
import { ProductsContext } from '../context'
import { useContext } from 'react'
import type { ShopPreFilter } from '../App'
import { ProductCardSkeleton } from '../components/Skeleton'

interface ShopPageProps {
  addToCart: (product: Product) => void
  openProduct: (product: Product) => void
  preFilter?: ShopPreFilter | null
  wishlist: Set<number>
  toggleWishlist: (id: number) => void
}


const SORT_OPTIONS = [
  { value: 'default',   label: 'Default Sorting' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc',label: 'Price: High to Low' },
  { value: 'rating',    label: 'Top Rated' },
  { value: 'discount',  label: 'Biggest Discount' },
]
const COLOR_HEX: Record<string, string> = {
  Natural:'#c8a882', Beige:'#e8d8c0', White:'#f5f5f3', Grey:'#9e9e9e',
  Black:'#2c2c2c', Brown:'#6b3e26', Walnut:'#5c3317', Oak:'#b08d57',
  Mixed: 'linear-gradient(135deg, #e8d8c0 0%, #9e9e9e 50%, #2c2c2c 100%)',
}
const PER_PAGE = 12

interface Filters {
  categories: string[]
  subcategories: string[]
  rooms: string[]
  colors: string[]
  materials: string[]
  inStock: boolean | null
  priceMin: number
  priceMax: number
}

const DEFAULT_FILTERS: Filters = {
  categories: [],
  subcategories: [],
  rooms: [],
  colors: [],
  materials: [],
  inStock: null,
  priceMin: 0,
  priceMax: 50000000,
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors ${
          checked ? 'bg-stone-900 border-stone-900' : 'border-stone-300 group-hover:border-stone-500'
        }`}
      >
        {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
      </div>
      <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors select-none">{label}</span>
    </label>
  )
}

function ActivePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-warm-100 border border-warm-300 text-stone-700 text-xs px-3 py-1.5 rounded-full font-medium">
      {label}
      <button onClick={onRemove} className="text-stone-500 hover:text-stone-900 transition-colors ml-0.5">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
    </span>
  )
}

export default function ShopPage({ addToCart, openProduct, preFilter, wishlist, toggleWishlist }: ShopPageProps) {
  const products = useContext(ProductsContext)
  
  const ROOMS = useMemo(() => Array.from(new Set(products.map(p => p.room))).filter(Boolean), [products])
  const COLORS = useMemo(() => Array.from(new Set(products.flatMap(p => p.colors || []))).filter(Boolean), [products])
  const MATERIALS = useMemo(() => Array.from(new Set(products.map(p => p.material))).filter(Boolean), [products])

  const [filters, setFilters] = useState<Filters>(() => {
    if (preFilter) {
      return {
        ...DEFAULT_FILTERS,
        categories: preFilter.categories ?? [],
        subcategories: preFilter.subcategories ?? [],
        rooms: preFilter.rooms ?? [],
      }
    }
    return DEFAULT_FILTERS
  })
  const [sort, setSort]         = useState('default')
  const [page, setPage]         = useState(1)
  const [addedId, setAddedId]   = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleAdd = (p: Product) => {
    addToCart(p)
    setAddedId(p.id)
    setTimeout(() => setAddedId(null), 1300)
  }

  const setF = (partial: Partial<Filters>) => {
    setFilters(f => ({ ...f, ...partial }))
    setPage(1)
  }

  // ── filtered + sorted ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...products]
    if (filters.categories.length) list = list.filter(p => filters.categories.includes(p.category))
    if (filters.subcategories.length) list = list.filter(p => filters.subcategories.includes(p.subcategory || ''))
    if (filters.rooms.length)      list = list.filter(p => filters.rooms.includes(p.room))
    if (filters.colors.length)     list = list.filter(p => p.colors && p.colors.some(c => filters.colors.includes(c)))
    if (filters.materials.length)  list = list.filter(p => filters.materials.includes(p.material))
    if (filters.inStock === true)  list = list.filter(p => p.inStock)
    if (filters.inStock === false) list = list.filter(p => !p.inStock)
    list = list.filter(p => p.price >= filters.priceMin && p.price <= filters.priceMax)
    switch (sort) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break
      case 'price-desc': list.sort((a, b) => b.price - a.price); break
      case 'rating':     list.sort((a, b) => b.rating - a.rating); break
      case 'discount':   list.sort((a, b) => b.discount - a.discount); break
    }
    return list
  }, [filters, sort, products])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageItems  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // ── active filter pills ───────────────────────────────────────────────────────
  const activePills: { label: string; remove: () => void }[] = [
    ...filters.categories.map(c => ({ label: c, remove: () => setF({ categories: toggle(filters.categories, c) }) })),
    ...filters.subcategories.map(s => ({ label: s, remove: () => setF({ subcategories: toggle(filters.subcategories, s) }) })),
    ...filters.rooms.map(r => ({ label: r, remove: () => setF({ rooms: toggle(filters.rooms, r) }) })),
    ...filters.colors.map(c => ({ label: c, remove: () => setF({ colors: toggle(filters.colors, c) }) })),
    ...filters.materials.map(m => ({ label: m, remove: () => setF({ materials: toggle(filters.materials, m) }) })),
    ...(filters.inStock === true  ? [{ label: 'In Stock',     remove: () => setF({ inStock: null }) }] : []),
    ...(filters.inStock === false ? [{ label: 'Out of Stock', remove: () => setF({ inStock: null }) }] : []),
    ...(filters.priceMin > 0 || filters.priceMax < 50000000
      ? [{ label: `Rp ${filters.priceMin.toLocaleString('id-ID')} - Rp ${filters.priceMax.toLocaleString('id-ID')}`, remove: () => setF({ priceMin: 0, priceMax: 50000000 }) }]
      : []),
  ]

  // ── pagination numbers ────────────────────────────────────────────────────────
  const pageNums = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3)       return [1, 2, 3, '…', totalPages]
    if (page >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages]
    return [1, '…', page - 1, page, page + 1, '…', totalPages]
  })()

  // ── sidebar content (shared mobile + desktop) ─────────────────────────────────
  const SidebarContent = () => (
    <div className="space-y-7">
      {/* Category */}
      <div>
        <h4 className="text-stone-900 text-sm font-semibold mb-3 pb-2 border-b border-stone-200">Category</h4>
        {(['Chair', 'Sofa', 'Table'] as const).map(c => (
          <CheckRow key={c} label={c} checked={filters.categories.includes(c)}
            onChange={() => setF({ categories: toggle(filters.categories, c) })} />
        ))}
      </div>

      {/* Room */}
      <div>
        <h4 className="text-stone-900 text-sm font-semibold mb-3 pb-2 border-b border-stone-200">Room</h4>
        {ROOMS.map(r => (
          <CheckRow key={r} label={r} checked={filters.rooms.includes(r)}
            onChange={() => setF({ rooms: toggle(filters.rooms, r) })} />
        ))}
      </div>

      {/* Price */}
      <div>
        <h4 className="text-stone-900 text-sm font-semibold mb-3 pb-2 border-b border-stone-200">Price</h4>
        <div className="flex justify-between text-xs text-stone-500 mb-3">
          <span>Rp {filters.priceMin.toLocaleString('id-ID')}</span>
          <span>Rp {filters.priceMax.toLocaleString('id-ID')}</span>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-stone-400 uppercase tracking-widest">Min</label>
            <input type="range" min={0} max={50000000} step={500000} value={filters.priceMin}
              onChange={e => { const v = +e.target.value; if (v < filters.priceMax) setF({ priceMin: v }) }}
              className="w-full h-1 bg-stone-200 rounded-full appearance-none cursor-pointer accent-stone-800"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-400 uppercase tracking-widest">Max</label>
            <input type="range" min={0} max={50000000} step={500000} value={filters.priceMax}
              onChange={e => { const v = +e.target.value; if (v > filters.priceMin) setF({ priceMax: v }) }}
              className="w-full h-1 bg-stone-200 rounded-full appearance-none cursor-pointer accent-stone-800"
            />
          </div>
        </div>
      </div>

      {/* Color */}
      <div>
        <h4 className="text-stone-900 text-sm font-semibold mb-3 pb-2 border-b border-stone-200">Color</h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button key={c} onClick={() => setF({ colors: toggle(filters.colors, c) })}
              title={c}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
                filters.colors.includes(c)
                  ? 'border-stone-900 text-stone-900 font-medium'
                  : 'border-stone-200 text-stone-500 hover:border-stone-400'
              }`}
            >
              <span className="w-3 h-3 rounded-full flex-shrink-0 border border-white shadow-sm" style={{ background: COLOR_HEX[c] }} />
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <h4 className="text-stone-900 text-sm font-semibold mb-3 pb-2 border-b border-stone-200">Material</h4>
        {MATERIALS.map(m => (
          <CheckRow key={m} label={m} checked={filters.materials.includes(m)}
            onChange={() => setF({ materials: toggle(filters.materials, m) })} />
        ))}
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-stone-900 text-sm font-semibold mb-3 pb-2 border-b border-stone-200">Availability</h4>
        <CheckRow label="In Stock"
          checked={filters.inStock === true}
          onChange={() => setF({ inStock: filters.inStock === true ? null : true })} />
        <CheckRow label="Out of Stock"
          checked={filters.inStock === false}
          onChange={() => setF({ inStock: filters.inStock === false ? null : false })} />
      </div>

      {/* Reset */}
      {activePills.length > 0 && (
        <button onClick={() => { setFilters(DEFAULT_FILTERS); setPage(1) }}
          className="w-full text-xs text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-400 py-2 rounded-sm transition-colors">
          Reset All Filters
        </button>
      )}
    </div>
  )

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Page header */}
      <div className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
          <p className="text-warm-600 text-xs tracking-[0.25em] uppercase mb-1.5 font-medium">Our Collection</p>
          <h1 className="text-stone-900 text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
            {preFilter?.label ? preFilter.label : 'Shop'}
          </h1>
          {preFilter?.label && (
            <p className="text-stone-400 text-sm mt-2">
              Showing results for <span className="text-stone-700 font-medium">{preFilter.label}</span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 flex gap-8">
        {/* ── SIDEBAR desktop ── */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
            <h2 className="text-stone-900 text-lg font-semibold mb-5" style={{ fontFamily: 'var(--font-display)' }}>
              Filter Options
            </h2>
            <SidebarContent />
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 border border-stone-300 text-stone-600 text-xs px-3 py-2 rounded-sm hover:border-stone-600 transition-colors"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                Filters
              </button>
              <p className="text-stone-500 text-sm">
                Showing <span className="font-medium text-stone-900">{(page - 1) * PER_PAGE + 1} - {Math.min(page * PER_PAGE, filtered.length)}</span> of{' '}
                <span className="font-medium text-stone-900">{filtered.length}</span> results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-stone-500 text-sm hidden sm:block">Sort by :</span>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1) }}
                className="border border-stone-300 text-stone-700 text-sm px-4 py-2 rounded-sm bg-white focus:outline-none focus:border-stone-500 cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filters */}
          {activePills.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center mb-5">
              <span className="text-stone-500 text-xs">Active Filter</span>
              {activePills.map((p, i) => <ActivePill key={i} label={p.label} onRemove={p.remove} />)}
              <button onClick={() => { setFilters(DEFAULT_FILTERS); setPage(1) }}
                className="text-xs text-warm-600 hover:text-warm-800 underline underline-offset-2 transition-colors ml-1">
                Clear All
              </button>
            </div>
          )}

          {/* Grid */}
          {products.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-stone-400 text-lg mb-2">No products found</p>
              <button onClick={() => { setFilters(DEFAULT_FILTERS); setPage(1) }} className="text-sm text-stone-500 underline hover:text-stone-900">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {pageItems.map(product => (
                <div key={product.id} className="group bg-white rounded-xl border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Image */}
                  <div onClick={() => openProduct(product)} className="relative bg-stone-100 overflow-hidden cursor-pointer" style={{ aspectRatio: '1' }}>
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount pill */}
                    <span className="absolute top-3 left-3 bg-stone-800 text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                      {product.discount}% off
                    </span>

                    {/* Action icons - right side, appear on hover */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id) }}
                        aria-label={wishlist.has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                        className={`w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-colors ${
                          wishlist.has(product.id) ? 'text-red-500' : 'text-stone-400 hover:text-red-400'
                        }`}
                      >
                        <svg width="14" height="14" fill={wishlist.has(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </button>
                    </div>

                    {/* Out of stock overlay */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="bg-stone-800 text-white text-xs px-3 py-1.5 rounded-full font-medium">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div onClick={() => openProduct(product)} className="cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-stone-400 text-xs">{product.subcategory}</p>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-warm-400">★</span>
                        <span className="text-stone-600 font-medium">{product.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-stone-900 text-[15px] font-semibold leading-snug mb-2.5" style={{ fontFamily: 'var(--font-display)' }}>
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-stone-900 text-base font-bold">Rp {product.price.toLocaleString('id-ID')}</span>
                      <span className="text-stone-400 text-sm line-through">Rp {product.originalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    </div>
                    <button
                      disabled={!product.inStock}
                      onClick={() => handleAdd(product)}
                      className={`w-full py-2.5 text-xs tracking-wide rounded-lg font-semibold transition-colors ${
                        !product.inStock
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : addedId === product.id
                          ? 'bg-green-600 text-white'
                          : 'bg-stone-900 text-white hover:bg-stone-700'
                      }`}
                    >
                      {!product.inStock ? 'Out of Stock' : addedId === product.id ? '✓ Added to Cart' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-900 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ‹
              </button>

              {pageNums.map((n, i) => (
                n === '…'
                  ? <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-stone-400 text-sm">…</span>
                  : (
                    <button
                      key={n}
                      onClick={() => setPage(n as number)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                        page === n
                          ? 'bg-warm-400 text-white border-warm-400'
                          : 'border border-stone-300 text-stone-600 hover:border-stone-900 hover:text-stone-900'
                      }`}
                    >
                      {n}
                    </button>
                  )
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-900 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile sidebar drawer ── */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-stone-900 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Filter Options</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-stone-400 hover:text-stone-900 transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <SidebarContent />
          </div>
        </>
      )}
    </div>
  )
}
