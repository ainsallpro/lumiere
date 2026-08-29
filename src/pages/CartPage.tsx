import { useState } from 'react'
import type { CartItem } from '../types'
import type { Page } from '../App'

interface CartPageProps {
  items: CartItem[]
  onUpdateQty: (id: number, color: string, qty: number) => void
  onRemove: (id: number, color: string) => void
  onClear: () => void
  onCheckout: () => void
  navigate: (page: Page, preFilter?: import('../App').ShopPreFilter) => void
}

const COUPONS: Record<string, number> = {
  LUMIERE10: 0.10,
  SAVE20: 0.20,
  WELCOME50: 50,
  NEWUSER: 0.15,
}

export default function CartPage({ items, onUpdateQty, onRemove, onClear, onCheckout, navigate }: CartPageProps) {
  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState('')

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const shipping  = subtotal >= 5000000 ? 0 : 50000
  const taxes     = 0

  const discount = appliedCoupon
    ? COUPONS[appliedCoupon] < 1
      ? Math.round(subtotal * COUPONS[appliedCoupon])
      : COUPONS[appliedCoupon]
    : 0

  const total = Math.max(0, subtotal + shipping + taxes - discount)

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase()
    if (COUPONS[code]) {
      setAppliedCoupon(code)
      setCouponError('')
    } else {
      setCouponError('Invalid coupon code.')
      setAppliedCoupon(null)
    }
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex items-center gap-2 text-xs text-stone-400">
          <button onClick={() => navigate('home')} className="hover:text-stone-700 transition-colors">Home</button>
          <span>/</span>
          <span className="text-stone-700">Shopping Cart</span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
          <p className="text-warm-600 text-xs tracking-[0.25em] uppercase mb-1.5 font-medium">Your Selection</p>
          <h1 className="text-stone-900 text-5xl" style={{ fontFamily: 'var(--font-display)' }}>Shopping Cart</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        {items.length === 0 ? (
          /* ── Empty state ── */
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="text-stone-400">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h2 className="text-stone-900 text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>Your cart is empty</h2>
            <p className="text-stone-500 text-sm mb-6">Looks like you haven't added anything yet.</p>
            <button
              onClick={() => navigate('shop')}
              className="bg-stone-900 text-white px-8 py-3 text-sm tracking-wide rounded-sm hover:bg-stone-800 transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── LEFT: cart table ── */}
            <div className="lg:col-span-2">

              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center bg-warm-400 text-stone-900 text-sm font-semibold px-5 py-3.5 rounded-xl mb-1">
                <span>Product</span>
                <span className="w-20 text-center">Price</span>
                <span className="w-28 text-center">Quantity</span>
                <span className="w-20 text-right">Subtotal</span>
              </div>

              {/* Rows */}
              <div className="bg-white rounded-xl border border-stone-100 divide-y divide-stone-100 overflow-hidden">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.selectedColor}`} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4">

                    {/* Product */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Remove */}
                      <button
                        onClick={() => onRemove(item.product.id, item.selectedColor)}
                        className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                        aria-label="Remove"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                      </button>

                      {/* Image */}
                      <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.product.img} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Name + color */}
                      <div className="min-w-0">
                        <p
                          className="text-stone-900 text-sm font-semibold truncate leading-snug cursor-pointer hover:text-warm-700 transition-colors"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {item.product.name}
                        </p>
                        <p className="text-stone-400 text-xs mt-0.5">Color : {item.selectedColor}</p>
                        <p className="text-stone-400 text-xs">{item.product.subcategory}</p>
                      </div>
                    </div>

                    {/* Unit price */}
                    <div className="w-20 text-center">
                      <span className="text-stone-700 text-sm font-medium">Rp {item.product.price.toLocaleString('id-ID')}</span>
                    </div>

                    {/* Qty stepper */}
                    <div className="w-28 flex items-center justify-center gap-1">
                      <button
                        onClick={() => onUpdateQty(item.product.id, item.selectedColor, item.qty - 1)}
                        className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-colors text-base"
                      >−</button>
                      <span className="w-8 text-center text-stone-900 text-sm font-semibold">{item.qty}</span>
                      <button
                        onClick={() => onUpdateQty(item.product.id, item.selectedColor, item.qty + 1)}
                        className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-colors text-base"
                      >+</button>
                    </div>

                    {/* Subtotal */}
                    <div className="w-20 text-right">
                      <span className="text-stone-900 text-sm font-bold">Rp {(item.product.price * item.qty).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom row: coupon + clear */}
              <div className="flex items-center gap-3 mt-5 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                  <input
                    type="text"
                    value={coupon}
                    onChange={e => { setCoupon(e.target.value); setCouponError('') }}
                    placeholder="Coupon Code"
                    className="flex-1 border border-stone-300 text-stone-900 text-sm px-4 py-2.5 rounded-full focus:outline-none focus:border-stone-600 bg-white placeholder:text-stone-300"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-stone-900 text-white text-sm px-5 py-2.5 rounded-full hover:bg-stone-800 transition-colors font-medium whitespace-nowrap"
                  >
                    Apply Coupon
                  </button>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                  {appliedCoupon && (
                    <span className="text-green-600 text-xs font-medium bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                      ✓ {appliedCoupon} applied
                    </span>
                  )}
                  {couponError && <span className="text-red-500 text-xs">{couponError}</span>}
                  <button
                    onClick={onClear}
                    className="text-sm text-stone-500 underline underline-offset-2 hover:text-red-500 transition-colors"
                  >
                    Clear Shopping Cart
                  </button>
                </div>
              </div>

              {/* Coupon hints */}
              <p className="text-stone-400 text-xs mt-2 ml-1">Try: LUMIERE10, SAVE20, WELCOME50</p>
            </div>

            {/* ── RIGHT: order summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-stone-200 p-6 sticky top-24">
                <h3 className="text-stone-900 text-lg font-semibold mb-5" style={{ fontFamily: 'var(--font-display)' }}>
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between text-stone-500">
                    <span>Items</span>
                    <span className="text-stone-900 font-medium">{items.reduce((s, i) => s + i.qty, 0)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Sub Total</span>
                    <span className="text-stone-900 font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-stone-900 font-medium'}>
                      {shipping === 0 ? 'Free' : `Rp ${shipping.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Taxes</span>
                    <span className="text-stone-900 font-medium">Rp {taxes}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span className="font-medium">−Rp {discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                {shipping > 0 && (
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 mb-4 text-xs text-stone-500">
                    Tambah <span className="font-semibold text-stone-900">Rp {(5000000 - subtotal).toLocaleString('id-ID')}</span> lagi untuk gratis ongkir
                    <div className="mt-2 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-warm-400 rounded-full" style={{ width: `${Math.min(100, (subtotal / 5000000) * 100)}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-stone-900 font-bold text-base border-t border-stone-200 pt-4 mb-5">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full bg-stone-900 text-white py-3.5 rounded-xl text-sm font-semibold tracking-wide hover:bg-stone-800 transition-colors"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('shop')}
                  className="w-full mt-3 text-stone-500 text-xs py-2 hover:text-stone-900 transition-colors"
                >
                  ← Continue Shopping
                </button>

                {/* Secure badges */}
                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-center gap-4">
                  {['SSL Secure', 'Free Returns', 'Encrypted'].map(b => (
                    <div key={b} className="flex items-center gap-1 text-stone-400 text-[10px]">
                      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
