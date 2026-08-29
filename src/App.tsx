import { useState, useEffect } from 'react'
import { ProductsContext, ProductsRefreshContext } from './context'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import CheckoutModal from './components/CheckoutModal'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import CategoriesPage from './pages/CategoriesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import CartPage from './pages/CartPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AccountPage from './pages/AccountPage'
import WishlistPage from './pages/WishlistPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import Footer from './components/Footer'
import type { CartItem, Product, AuthUser } from './types'

export type Page = 'home' | 'shop' | 'categories' | 'about' | 'contact' | 'account' | 'wishlist' | 'admin' | 'login' | 'register' | 'forgot-password' | 'reset-password'

export interface ShopPreFilter {
  categories?: string[]
  subcategories?: string[]
  rooms?: string[]
  label?: string   // display label e.g. "Bedroom"
}

import { ToastProvider } from './context/ToastContext'

export default function App() {
  const [globalProducts, setGlobalProducts] = useState<Product[]>([])

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setGlobalProducts(data)
      }
    } catch (err) {
      console.error('Failed to refresh products', err)
    }
  }

  useEffect(() => {
    refreshProducts()
  }, [])

  return (
    <ToastProvider>
      <ProductsContext.Provider value={globalProducts}>
        <ProductsRefreshContext.Provider value={refreshProducts}>
          <AppContent />
        </ProductsRefreshContext.Provider>
      </ProductsContext.Provider>
    </ToastProvider>
  )
}

function AppContent() {
  const [currentPage, setCurrentPage]       = useState<Page>(() => {
    // Read initial page from URL hash (e.g. #shop, #about, #reset-password?token=...)
    const hashRaw = window.location.hash.replace('#', '')
    const hash = (hashRaw.split('?')[0]) as Page
    const validPages: Page[] = ['home','shop','categories','about','contact','account','wishlist','admin','login','register','forgot-password','reset-password']
    return validPages.includes(hash) ? hash : 'home'
  })
  const [resetToken, setResetToken]         = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryToken = urlParams.get('token');
    if (queryToken) return queryToken;
    if (window.location.hash.includes('token=')) {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
      return hashParams.get('token') || '';
    }
    return '';
  })
  const [shopPreFilter, setShopPreFilter]   = useState<ShopPreFilter | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen]             = useState(false)   // mini drawer
  const [cartPageOpen, setCartPageOpen]     = useState(false)   // full cart page
  const [checkoutOpen, setCheckoutOpen]     = useState(false)
  const [cartItems, setCartItems]           = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lumiere_cart')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [wishlist, setWishlist]             = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('lumiere_wishlist')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch { return new Set() }
  })
  const [currentUser, setCurrentUser]       = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('currentUser')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Persist currentUser
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  // Persist cart
  useEffect(() => {
    localStorage.setItem('lumiere_cart', JSON.stringify(cartItems))
  }, [cartItems])

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem('lumiere_wishlist', JSON.stringify(Array.from(wishlist)))
  }, [wishlist])

  // Sync URL hash with current page
  useEffect(() => {
    const newHash = currentPage === 'home' 
      ? '' 
      : currentPage === 'reset-password' && resetToken 
        ? `#reset-password?token=${resetToken}` 
        : `#${currentPage}`
    if (window.location.hash !== newHash) {
      window.history.pushState({ page: currentPage }, '', newHash || window.location.pathname)
    }
  }, [currentPage, resetToken])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const hashRaw = window.location.hash.replace('#', '')
      const hash = (hashRaw.split('?')[0]) as Page
      const validPages: Page[] = ['home','shop','categories','about','contact','account','wishlist','login','register','forgot-password','reset-password']
      const page = validPages.includes(hash) ? hash : 'home'
      
      if (window.location.hash.includes('token=')) {
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const token = hashParams.get('token');
        if (token) setResetToken(token);
      }

      // Never allow non-admins to navigate to admin via browser history
      if (page === 'admin' && !currentUser?.isAdmin) return
      setCurrentPage(page)
      setSelectedProduct(null)
      setCartPageOpen(false)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [currentUser])

  const toggleWishlist = (id: number) => {
    setWishlist(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const navigate = (page: Page, preFilter?: ShopPreFilter, userOverride?: AuthUser | null) => {
    const effectiveUser = userOverride !== undefined ? userOverride : currentUser
    // Route guard: only admins can access the admin page
    if (page === 'admin' && !effectiveUser?.isAdmin) {
      setCurrentPage('login')
      setSelectedProduct(null)
      setCartPageOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setCurrentPage(page)
    setSelectedProduct(null)
    setCartPageOpen(false)
    setShopPreFilter(preFilter ?? null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openProduct = (product: Product) => {
    setSelectedProduct(product)
    setCartPageOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeProduct = () => setSelectedProduct(null)

  const addToCart = (product: Product, defaultColor?: string) => {
    const color = defaultColor || product.colors?.[0] || 'Mixed'
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.selectedColor === color)
      if (existing) return prev.map(i => (i.product.id === product.id && i.selectedColor === color) ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, qty: 1, selectedColor: color }]
    })
    setCartOpen(true)
  }

  // add with explicit qty (from product detail page)
  const addToCartQty = (product: Product, qty: number, color?: string) => {
    const selectedColor = color || product.colors?.[0] || 'Mixed'
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.selectedColor === selectedColor)
      if (existing) return prev.map(i => (i.product.id === product.id && i.selectedColor === selectedColor) ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { product, qty, selectedColor }]
    })
    setCartOpen(true)
  }

  const updateQty = (id: number, color: string, qty: number) => {
    if (qty <= 0) setCartItems(prev => prev.filter(i => !(i.product.id === id && i.selectedColor === color)))
    else setCartItems(prev => prev.map(i => (i.product.id === id && i.selectedColor === color) ? { ...i, qty } : i))
  }

  const removeItem = (id: number, color: string) => setCartItems(prev => prev.filter(i => !(i.product.id === id && i.selectedColor === color)))
  const clearCart  = () => setCartItems([])

  const handleOrderComplete = () => {
    setCartItems([])
    setCartPageOpen(false)
  }

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cartItems.reduce((s, i) => s + ((i.product.price || 0) * i.qty), 0)

  // what to show in <main>
  const showCartPage    = cartPageOpen && !selectedProduct
  const showProductDetail = !!selectedProduct
  const showPage        = !cartPageOpen && !selectedProduct

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-sans)' }}>
      {currentPage !== 'admin' && <Navbar
        currentPage={currentPage}
        navigate={navigate}
        cartCount={cartCount}
        wishlistCount={wishlist.size}
        onCartOpen={() => { setCartPageOpen(true); setSelectedProduct(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null)
          localStorage.removeItem('lumiere_token')
          setCurrentPage('home')
        }}
        openProduct={openProduct}
      />}

      <main className="flex-1">
        {showProductDetail && (
          <ProductDetailPage
            product={selectedProduct!}
            onBack={closeProduct}
            addToCart={addToCartQty}
            openProduct={openProduct}
            navigate={navigate}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        )}

        {showCartPage && (
          <CartPage
            items={cartItems}
            onUpdateQty={updateQty}
            onRemove={removeItem}
            onClear={clearCart}
            onCheckout={() => { 
              setCartPageOpen(false)
              if (!currentUser) {
                navigate('login')
              } else {
                setCheckoutOpen(true)
              }
            }}
            navigate={navigate}
          />
        )}

        {showPage && (
          <>
            {currentPage === 'home'            && <HomePage navigate={navigate} addToCart={addToCart} openProduct={openProduct} wishlist={wishlist} toggleWishlist={toggleWishlist} />}
            {currentPage === 'shop'            && <ShopPage addToCart={addToCart} openProduct={openProduct} preFilter={shopPreFilter} wishlist={wishlist} toggleWishlist={toggleWishlist} />}
            {currentPage === 'wishlist'        && <WishlistPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} openProduct={openProduct} navigate={navigate} />}
            {currentPage === 'admin'           && currentUser?.isAdmin && <AdminPage navigate={navigate} onLogout={() => { setCurrentUser(null); localStorage.removeItem('lumiere_token'); setCurrentPage('home') }} />}
            {currentPage === 'categories'      && <CategoriesPage navigate={navigate} addToCart={addToCartQty} />}
            {currentPage === 'about'           && <AboutPage />}
            {currentPage === 'contact'         && <ContactPage />}
            {currentPage === 'account'         && <AccountPage currentUser={currentUser} onLogout={() => { setCurrentUser(null); localStorage.removeItem('lumiere_token'); navigate('home') }} navigate={navigate} onUpdateUser={(updated) => { setCurrentUser(updated); localStorage.setItem('currentUser', JSON.stringify(updated)) }} />}
            {currentPage === 'login'           && <LoginPage navigate={navigate} onAuth={u => { setCurrentUser(u); navigate(u.isAdmin ? 'admin' : 'home', undefined, u) }} />}
            {currentPage === 'register'        && <RegisterPage navigate={navigate} onAuth={u => { setCurrentUser(u); navigate(u.isAdmin ? 'admin' : 'home', undefined, u) }} />}
            {currentPage === 'forgot-password' && <ForgotPasswordPage navigate={navigate} />}
            {currentPage === 'reset-password'  && <ResetPasswordPage navigate={navigate} token={resetToken} />}
          </>
        )}
      </main>

      {currentPage !== 'admin' && currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'forgot-password' && currentPage !== 'reset-password' && <Footer navigate={navigate} />}

      {/* Mini cart drawer - appears on add-to-cart */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onCheckout={() => {
          setCartOpen(false)
          setCartPageOpen(true)
          setSelectedProduct(null)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        onOrderComplete={handleOrderComplete}
        user={currentUser}
        setCurrentUser={setCurrentUser}
      />
    </div>
  )
}
