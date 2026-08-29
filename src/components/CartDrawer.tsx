import type { CartItem } from '../types'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQty: (id: number, color: string, qty: number) => void
  onRemove: (id: number, color: string) => void
  onCheckout: () => void
}

export default function CartDrawer({ open, onClose, items, onUpdateQty, onRemove, onCheckout }: CartDrawerProps) {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0)
  const shipping = subtotal >= 5000000 ? 0 : 50000
  const total = subtotal + shipping

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-stone-50 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200">
          <div>
            <h2 className="text-stone-900 text-xl" style={{ fontFamily: 'var(--font-display)' }}>Your Cart</h2>
            <p className="text-stone-400 text-xs mt-0.5">{items.reduce((s, i) => s + i.qty, 0)} item{items.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} aria-label="Close cart drawer" className="text-stone-400 hover:text-stone-900 transition-colors p-1">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="text-stone-400">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="text-stone-600 font-medium mb-1">Your cart is empty</p>
              <p className="text-stone-400 text-sm">Add some beautiful pieces to get started.</p>
              <button onClick={onClose} className="mt-5 text-sm text-stone-500 underline underline-offset-2 hover:text-stone-900 transition-colors">
                Continue shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={`${item.product.id}-${item.selectedColor}`} className="flex gap-4 bg-white border border-stone-100 rounded-sm p-3">
                <div className="w-20 h-20 bg-stone-100 rounded-sm overflow-hidden flex-shrink-0">
                  <img src={item.product.img} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-400 text-[10px] tracking-widest uppercase mb-0.5">
                    {item.product.category} &bull; {item.selectedColor}
                  </p>
                  <p className="text-stone-900 text-sm font-medium leading-snug mb-1 truncate" style={{ fontFamily: 'var(--font-display)' }}>
                    {item.product.name}
                  </p>
                  <p className="text-warm-600 text-sm font-semibold">Rp {item.product.price.toLocaleString('id-ID')}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-stone-200 rounded-sm">
                      <button
                        onClick={() => onUpdateQty(item.product.id, item.selectedColor, item.qty - 1)}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm text-stone-700">{item.qty}</span>
                      <button
                        onClick={() => onUpdateQty(item.product.id, item.selectedColor, item.qty + 1)}
                        aria-label="Increase quantity"
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemove(item.product.id, item.selectedColor)}
                      aria-label="Remove item from cart"
                      className="text-stone-300 hover:text-red-400 transition-colors text-xs"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer totals */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 px-6 py-5 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `Rp ${shipping.toLocaleString('id-ID')}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-stone-400 text-xs">Tambah Rp {(5000000 - subtotal).toLocaleString('id-ID')} lagi untuk gratis ongkir</p>
              )}
              <div className="flex justify-between text-stone-900 font-semibold border-t border-stone-200 pt-2">
                <span>Total</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-stone-900 text-white py-3.5 text-sm tracking-wide font-medium rounded-sm hover:bg-stone-800 transition-colors"
            >
              View Cart &amp; Checkout
            </button>
            <button onClick={onClose} className="w-full text-stone-500 text-xs py-1 hover:text-stone-900 transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
