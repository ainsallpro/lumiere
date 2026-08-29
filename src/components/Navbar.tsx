import { useState, useEffect, useRef } from 'react'
import type { Page } from '../App'
import type { AuthUser, Product } from '../types'
import { ProductsContext } from '../context'
import { useContext } from 'react'

interface NavbarProps {
  currentPage: Page
  navigate: (page: Page, preFilter?: import('../App').ShopPreFilter) => void
  cartCount: number
  wishlistCount: number
  onCartOpen: () => void
  currentUser: AuthUser | null
  onLogout: () => void
  openProduct: (product: Product) => void
}

const navLinks: { label: string; page: Page }[] = [
  { label: 'Home', page: 'home' },
  { label: 'Shop', page: 'shop' },
  { label: 'Categories', page: 'categories' },
  { label: 'About Us', page: 'about' },
  { label: 'Contact', page: 'contact' },
]

export default function Navbar({
  currentPage, navigate, cartCount, wishlistCount, onCartOpen, currentUser, onLogout, openProduct
}: NavbarProps) {
  const products = useContext(ProductsContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lumiere_recent_searches')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const initials = currentUser
    ? currentUser.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : ''

  // Smart multi-keyword / tokenized search matching
  const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const results = searchTerms.length > 0
    ? products.filter(p => {
        const searchableText = [
          p.name,
          p.category,
          p.subcategory || '',
          p.material || '',
          p.room || '',
          ...(p.colors || []),
        ].join(' ').toLowerCase()

        // Every keyword typed by the user must match somewhere in the product
        return searchTerms.every(term => searchableText.includes(term))
      }).slice(0, 8)
    : []

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== trimmed.toLowerCase())
      const updated = [trimmed, ...filtered].slice(0, 6)
      try { localStorage.setItem('lumiere_recent_searches', JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  const removeRecentSearch = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setRecentSearches(prev => {
      const updated = prev.filter(t => t !== termToRemove)
      try { localStorage.setItem('lumiere_recent_searches', JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  const clearAllRecentSearches = () => {
    setRecentSearches([])
    try { localStorage.removeItem('lumiere_recent_searches') } catch {}
  }

  const openSearch = () => {
    setSearchOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
  }

  const handleSelect = (product: Product) => {
    if (query.trim()) {
      saveRecentSearch(query.trim())
    }
    closeSearch()
    openProduct(product)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    saveRecentSearch(query.trim())
    if (results.length === 1) {
      handleSelect(results[0])
    } else {
      closeSearch()
      navigate('shop')
    }
  }

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate('home')} className="flex items-center gap-2">
            <div className="w-7 h-7 bg-stone-900 rounded-sm flex items-center justify-center">
              <span className="text-stone-50 text-xs font-bold" style={{ fontFamily: 'var(--font-display)' }}>L</span>
            </div>
            <span className="text-stone-900 text-lg font-semibold tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
              Lumière
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, page }) => (
              <button
                key={page}
                onClick={() => navigate(page)}
                className={`text-sm tracking-wide transition-colors duration-200 pb-0.5 ${
                  currentPage === page
                    ? 'text-stone-900 border-b border-stone-900'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={openSearch}
              className="hidden md:flex text-stone-500 hover:text-stone-900 transition-colors p-1"
              aria-label="Search products"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" />
              </svg>
            </button>

            {/* Auth */}
            {currentUser ? (
              <button
                onClick={() => navigate(currentUser.isAdmin ? 'admin' : ('account' as any))}
                className="flex items-center gap-2 group"
                aria-label="View account profile"
              >
                <div className="w-8 h-8 rounded-full bg-warm-400 flex items-center justify-center text-white text-xs font-semibold">
                  {initials}
                </div>
                <span className="hidden md:block text-stone-700 text-sm font-medium group-hover:text-stone-900 transition-colors max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => navigate('login')}
                className="hidden md:flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors border border-stone-300 hover:border-stone-500 rounded-lg px-3.5 py-1.5 font-medium"
                aria-label="Sign In"
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Sign In
              </button>
            )}

            {/* Wishlist */}
            <button
              onClick={() => navigate('wishlist')}
              className="relative hidden md:flex text-stone-500 hover:text-stone-900 transition-colors p-1"
              aria-label="Wishlist"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="relative text-stone-500 hover:text-stone-900 transition-colors p-1"
              aria-label="Open cart"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-warm-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-stone-600 p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                {menuOpen
                  ? <path d="M6 18 18 6M6 6l12 12" />
                  : <path d="M3 12h18M3 6h18M3 18h18" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-stone-50 px-6 py-4 flex flex-col gap-4">
            {/* Mobile search */}
            <button
              onClick={() => { openSearch(); setMenuOpen(false) }}
              className="flex items-center gap-2 text-stone-500 text-sm py-1"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" />
              </svg>
              Search products…
            </button>
            {navLinks.map(({ label, page }) => (
              <button
                key={page}
                onClick={() => { navigate(page); setMenuOpen(false) }}
                className={`text-left text-sm tracking-wide py-1 ${
                  currentPage === page ? 'text-stone-900 font-medium' : 'text-stone-500'
                }`}
              >
                {label}
              </button>
            ))}
            <div className="border-t border-stone-200 pt-3">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-warm-400 flex items-center justify-center text-white text-xs font-semibold">
                      {initials}
                    </div>
                    <span className="text-stone-700 text-sm font-medium">{currentUser.name.split(' ')[0]}</span>
                  </div>
                  <button onClick={() => { onLogout(); setMenuOpen(false) }} className="text-xs text-red-500 font-medium">
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { navigate('login'); setMenuOpen(false) }}
                  className="w-full bg-stone-900 text-white py-2.5 rounded-lg text-sm font-medium"
                >
                  Sign In / Create Account
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Search overlay ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center pt-12 sm:pt-20 px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-md transition-opacity" onClick={closeSearch} />

          <div className="relative w-full max-w-2xl">
            {/* Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl px-4 sm:px-5 py-3.5 sm:py-4 border border-stone-200/80">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-stone-400 flex-shrink-0">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products, categories, materials (e.g. Sofa, Oak, Chair)..."
                className="flex-1 text-stone-900 text-sm sm:text-base outline-none placeholder:text-stone-400 bg-transparent min-w-0"
              />

              {/* Clear Input Button */}
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                  aria-label="Clear text"
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}

              {/* Explicit Close Button (Crucial for Mobile & Touch Screen) */}
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Close search"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm transition-all shadow-xs flex-shrink-0 cursor-pointer"
              >
                <span>Close</span>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </form>

            {/* Results dropdown */}
            {query.trim().length > 0 && (
              <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden max-h-[70vh] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                {results.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" />
                      </svg>
                    </div>
                    <p className="text-stone-800 font-medium text-base mb-1">No products found</p>
                    <p className="text-stone-500 text-xs sm:text-sm">
                      We couldn't find matches for "<span className="font-semibold text-stone-700">{query}</span>". Try searching by category like <button type="button" onClick={() => setQuery('Sofa')} className="text-warm-600 underline font-medium">Sofa</button>, <button type="button" onClick={() => setQuery('Chair')} className="text-warm-600 underline font-medium">Chair</button>, or <button type="button" onClick={() => setQuery('Table')} className="text-warm-600 underline font-medium">Table</button>.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="px-5 py-3 bg-stone-50/70 border-b border-stone-100 flex items-center justify-between">
                      <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">
                        {results.length} product{results.length !== 1 ? 's' : ''} found
                      </p>
                      <button
                        type="button"
                        onClick={() => { saveRecentSearch(query); closeSearch(); navigate('shop'); }}
                        className="text-xs text-warm-600 hover:text-warm-700 font-medium transition-colors"
                      >
                        View all in Shop →
                      </button>
                    </div>
                    <div className="overflow-y-auto divide-y divide-stone-100">
                      {results.map(product => (
                        <button
                          key={product.id}
                          onClick={() => handleSelect(product)}
                          className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 active:bg-stone-100 transition-colors text-left group cursor-pointer"
                        >
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 border border-stone-200/60">
                            <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-stone-900 text-sm font-semibold truncate group-hover:text-warm-600 transition-colors">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                              <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] font-medium text-stone-600">
                                {product.category}
                              </span>
                              <span>•</span>
                              <span>{product.material}</span>
                              {product.room && (
                                <>
                                  <span>•</span>
                                  <span>{product.room}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 pl-2">
                            <p className="text-stone-900 text-sm sm:text-base font-bold">
                              Rp {product.price.toLocaleString('id-ID')}
                            </p>
                            {product.discount > 0 && (
                              <p className="text-stone-400 text-xs line-through">
                                Rp {product.originalPrice.toLocaleString('id-ID')}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 text-center">
                      <button
                        type="button"
                        onClick={() => { saveRecentSearch(query); closeSearch(); navigate('shop'); }}
                        className="text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-950 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>Explore full catalogue in Shop</span>
                        <span>→</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Suggestions & Recent Searches when empty */}
            {query.trim().length === 0 && (
              <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 p-5 space-y-5 animate-in fade-in duration-150">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 uppercase tracking-widest font-semibold">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>Recent Searches</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearAllRecentSearches}
                        className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                      >
                        Clear history
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map(item => (
                        <div
                          key={item}
                          className="group inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => { setQuery(item); inputRef.current?.focus(); }}
                            className="cursor-pointer"
                          >
                            {item}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(item, e)}
                            aria-label={`Remove ${item}`}
                            className="text-stone-400 hover:text-stone-700 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Categories & Tags */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 uppercase tracking-widest font-semibold mb-2.5">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    <span>Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Sofa',
                      'Chair',
                      'Dining Table',
                      'Living Room',
                      'Solid Wood',
                      'Oak',
                      'Walnut',
                      'Velvet',
                    ].map(label => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => { setQuery(label); inputRef.current?.focus(); }}
                        className="text-xs text-stone-700 bg-stone-50 hover:bg-stone-100 hover:border-stone-300 border border-stone-200 px-3.5 py-1.5 rounded-full transition-all flex items-center cursor-pointer shadow-2xs font-medium"
                      >
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
