import { useState, useEffect } from 'react'
import type { CartItem, AuthUser } from '../types'
import { useToast } from '../context/ToastContext'

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  items: CartItem[]
  onOrderComplete: () => void
  user: AuthUser | null
  setCurrentUser: (user: AuthUser | null) => void
}

type Step = 'review' | 'shipping' | 'payment' | 'confirm'

const steps: { key: Step; label: string }[] = [
  { key: 'review', label: 'Review' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'confirm', label: 'Confirm' },
]

const stepIndex = (s: Step) => steps.findIndex(x => x.key === s)

export default function CheckoutModal({ open, onClose, items, onOrderComplete, user, setCurrentUser }: CheckoutModalProps) {
  const toast = useToast()
  const [step, setStep] = useState<Step>('review')

  // Load saved default address from localStorage
  const getSavedAddress = () => {
    try {
      const key = `addresses_${user?.id ?? 'guest'}`
      const list = JSON.parse(localStorage.getItem(key) ?? '[]')
      return list.find((a: any) => a.isDefault) || list[0] || null
    } catch { return null }
  }

  const [shipping, setShipping] = useState(() => {
    const saved = getSavedAddress()
    return {
      name: saved?.name || user?.name || '',
      email: user?.email || '',
      phone: saved?.phone || '',
      address: saved?.street || '',
      city: saved?.city || '',
      zip: saved?.zip || '',
      country: saved?.country || 'Indonesia',
    }
  })

  // Re-fill when user/modal opens
  useEffect(() => {
    if (open) {
      const saved = getSavedAddress()
      setShipping({
        name: saved?.name || user?.name || '',
        email: user?.email || '',
        phone: saved?.phone || '',
        address: saved?.street || '',
        city: saved?.city || '',
        zip: saved?.zip || '',
        country: saved?.country || 'Indonesia',
      })
    }
  }, [open, user])
  const [payment, setPayment] = useState({ method: 'card', card: '', expiry: '', cvv: '', name: '' })
  const [orderId, setOrderId] = useState(() => 'LM-' + Math.random().toString(36).slice(2, 8).toUpperCase())
  const [loading, setLoading] = useState(false)

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const shippingFee = subtotal >= 5000000 ? 0 : 50000
  const total = subtotal + shippingFee

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const payload = {
        userId: user?.id || null,
        customerName: shipping.name || user?.name || '',
        email: user?.email || shipping.email,
        phone: shipping.phone || '',
        address: `${shipping.address}, ${shipping.city}, ${shipping.zip}, ${shipping.country}`,
        total: total,
        paymentMethod: payment.method === 'card' ? 'Credit Card' : payment.method === 'transfer' ? 'Bank Transfer' : 'E-Wallet',
        items: items.map(item => ({
          productId: item.product.id,
          qty: item.qty,
          color: item.selectedColor
        }))
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed. Please try again.')

      setOrderId(data.id)

      // Auto-save phone to global state and localStorage
      if (user && shipping.phone && user.phone !== shipping.phone) {
        const updatedUser = { ...user, phone: shipping.phone }
        setCurrentUser(updatedUser)
        localStorage.setItem('lumiere_user', JSON.stringify(updatedUser))
      }

      // Auto-save address to profile for next time
      if (user?.id && shipping.address) {
        const key = `addresses_${user.id}`
        try {
          const existing = JSON.parse(localStorage.getItem(key) ?? '[]')
          const alreadySaved = existing.some((a: any) => a.street === shipping.address && a.city === shipping.city)
          if (!alreadySaved) {
            const newAddr = {
              id: Date.now(),
              name: shipping.name,
              phone: shipping.phone || '',
              street: shipping.address,
              city: shipping.city,
              zip: shipping.zip,
              country: shipping.country,
              isDefault: existing.length === 0,
            }
            localStorage.setItem(key, JSON.stringify([...existing, newAddr]))
          }
        } catch {}
      }

      setStep('confirm')
      onOrderComplete()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Checkout failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('review')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={step !== 'confirm' ? handleClose : undefined} />

      <div className="relative bg-stone-50 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-sm shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-stone-900 text-xl" style={{ fontFamily: 'var(--font-display)' }}>
            {step === 'confirm' ? 'Order Confirmed!' : 'Checkout'}
          </h2>
          {step !== 'confirm' && (
            <button onClick={handleClose} className="text-stone-400 hover:text-stone-900 transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Progress */}
        {step !== 'confirm' && (
          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-2">
              {steps.filter(s => s.key !== 'confirm').map((s, i, arr) => (
                <div key={s.key} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-2 ${stepIndex(step) >= i ? 'text-stone-900' : 'text-stone-300'}`}>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      stepIndex(step) > i ? 'bg-stone-900 border-stone-900 text-white' :
                      stepIndex(step) === i ? 'border-stone-900 text-stone-900' :
                      'border-stone-300 text-stone-300'
                    }`}>
                      {stepIndex(step) > i ? '✓' : i + 1}
                    </div>
                    <span className="text-xs tracking-wide hidden sm:block">{s.label}</span>
                  </div>
                  {i < arr.length - 1 && <div className={`h-px flex-1 ${stepIndex(step) > i ? 'bg-stone-900' : 'bg-stone-200'}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 py-6">
          {/* STEP 1 - Review */}
          {step === 'review' && (
            <div>
              <h3 className="text-stone-700 text-sm font-medium mb-4">Order Summary</h3>
              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-3 bg-white border border-stone-100 rounded-sm p-3">
                    <img src={item.product.img} alt={item.product.name} className="w-14 h-14 object-cover rounded-sm bg-stone-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-stone-900 text-sm font-medium truncate" style={{ fontFamily: 'var(--font-display)' }}>{item.product.name}</p>
                      <p className="text-stone-400 text-xs">{item.product.category} · Qty {item.qty}</p>
                    </div>
                    <p className="text-stone-700 text-sm font-medium flex-shrink-0">Rp {(item.product.price * item.qty).toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-stone-200 rounded-sm p-4 space-y-2 text-sm mb-6">
                <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-stone-500"><span>Shipping</span><span>{shippingFee === 0 ? 'Free' : `Rp ${shippingFee.toLocaleString('id-ID')}`}</span></div>
                <div className="flex justify-between text-stone-900 font-semibold border-t border-stone-100 pt-2"><span>Total</span><span>Rp {total.toLocaleString('id-ID')}</span></div>
              </div>
              <button onClick={() => setStep('shipping')} className="w-full bg-stone-900 text-white py-3.5 text-sm tracking-wide rounded-sm hover:bg-stone-800 transition-colors font-medium">
                Continue to Shipping →
              </button>
            </div>
          )}

          {/* STEP 2 - Shipping */}
          {step === 'shipping' && (
            <div>
              <h3 className="text-stone-700 text-sm font-medium mb-4">Shipping Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'Budi Santoso', col: 'sm:col-span-2' },
                  { label: 'Phone', key: 'phone', placeholder: '+62 812 3456 7890', col: 'sm:col-span-2' },
                  { label: 'Street Address', key: 'address', placeholder: 'Jl. Sudirman No. 12', col: 'sm:col-span-2' },
                  { label: 'City', key: 'city', placeholder: 'Jakarta', col: '' },
                  { label: 'ZIP Code', key: 'zip', placeholder: '10210', col: '' },
                ].map(f => (
                  <div key={f.key} className={f.col}>
                    <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">{f.label}</label>
                    <input
                      value={shipping[f.key as keyof typeof shipping]}
                      onChange={e => setShipping({ ...shipping, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full border border-stone-300 text-stone-900 text-sm px-3 py-2.5 rounded-sm focus:outline-none focus:border-stone-600 bg-white placeholder:text-stone-300"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Country</label>
                  <select
                    value={shipping.country}
                    onChange={e => setShipping({ ...shipping, country: e.target.value })}
                    className="w-full border border-stone-300 text-stone-700 text-sm px-3 py-2.5 rounded-sm focus:outline-none focus:border-stone-600 bg-white"
                  >
                    {['Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Australia', 'United States', 'United Kingdom'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-stone-100 rounded-sm p-4 mb-6">
                <p className="text-xs text-stone-500 font-medium mb-2 uppercase tracking-widest">Delivery Options</p>
                {[
                  { id: 'std', label: 'Standard Delivery', sub: '5-8 business days', price: shippingFee === 0 ? 'Free' : 'Rp 290.000' },
                  { id: 'exp', label: 'Express Delivery', sub: '2-3 business days', price: 'Rp 790.000' },
                ].map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 p-3 bg-white rounded-sm mb-2 cursor-pointer border border-stone-200 hover:border-stone-400 transition-colors">
                    <input type="radio" name="delivery" defaultChecked={opt.id === 'std'} className="accent-stone-700" />
                    <div className="flex-1">
                      <p className="text-stone-900 text-sm font-medium">{opt.label}</p>
                      <p className="text-stone-400 text-xs">{opt.sub}</p>
                    </div>
                    <p className="text-stone-700 text-sm font-medium">{opt.price}</p>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('review')} className="flex-1 border border-stone-300 text-stone-600 py-3 text-sm rounded-sm hover:border-stone-600 transition-colors">
                  ← Back
                </button>
                <button
                  onClick={() => setStep('payment')}
                  disabled={!shipping.name || !shipping.address || !shipping.city}
                  className="flex-1 bg-stone-900 text-white py-3 text-sm rounded-sm hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 - Payment */}
          {step === 'payment' && (
            <div>
              <h3 className="text-stone-700 text-sm font-medium mb-4">Payment Method</h3>

              <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs p-3 rounded-sm mb-5 flex gap-2 items-start">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
                <p><strong>Portfolio Demo:</strong> Tidak ada uang sungguhan yang ditransfer. Ini hanya simulasi. Anda bisa langsung klik <strong>Place Order</strong> untuk melihat simulasi pesanan berhasil.</p>
              </div>

              <div className="flex gap-3 mb-5">
                {[
                  { key: 'card', label: 'Credit / Debit Card' },
                  { key: 'transfer', label: 'Bank Transfer' },
                  { key: 'cod', label: 'Cash on Delivery' },
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setPayment({ ...payment, method: m.key })}
                    className={`flex-1 py-2.5 text-xs rounded-sm border transition-colors ${
                      payment.method === m.key
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-600 border-stone-300 hover:border-stone-600'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {payment.method === 'card' && (
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Cardholder Name</label>
                    <input
                      value={payment.name}
                      onChange={e => setPayment({ ...payment, name: e.target.value })}
                      placeholder="BUDI SANTOSO"
                      className="w-full border border-stone-300 text-stone-900 text-sm px-3 py-2.5 rounded-sm focus:outline-none focus:border-stone-600 bg-white placeholder:text-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Card Number</label>
                    <input
                      value={payment.card}
                      onChange={e => setPayment({ ...payment, card: formatCard(e.target.value) })}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className="w-full border border-stone-300 text-stone-900 text-sm px-3 py-2.5 rounded-sm focus:outline-none focus:border-stone-600 bg-white font-mono placeholder:text-stone-300 placeholder:font-sans"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Expiry Date</label>
                      <input
                        value={payment.expiry}
                        onChange={e => setPayment({ ...payment, expiry: formatExpiry(e.target.value) })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full border border-stone-300 text-stone-900 text-sm px-3 py-2.5 rounded-sm focus:outline-none focus:border-stone-600 bg-white font-mono placeholder:text-stone-300 placeholder:font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">CVV</label>
                      <input
                        value={payment.cvv}
                        onChange={e => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                        placeholder="•••"
                        maxLength={3}
                        className="w-full border border-stone-300 text-stone-900 text-sm px-3 py-2.5 rounded-sm focus:outline-none focus:border-stone-600 bg-white font-mono placeholder:text-stone-300 placeholder:font-sans"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-sm">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-600 flex-shrink-0">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <p className="text-green-700 text-xs">Your payment information is encrypted and secure.</p>
                  </div>
                </div>
              )}

              {payment.method === 'transfer' && (
                <div className="bg-stone-100 rounded-sm p-4 mb-5 space-y-2">
                  <p className="text-stone-700 text-sm font-medium">Bank Transfer Details</p>
                  <p className="text-stone-500 text-sm">Bank: <span className="text-stone-900">BCA - PT Lumière Indonesia</span></p>
                  <p className="text-stone-500 text-sm">Account: <span className="text-stone-900 font-mono">1234 5678 90</span></p>
                  <p className="text-stone-400 text-xs mt-2">Transfer the exact amount including your order ID as reference. Orders are confirmed within 1 business day after payment received.</p>
                </div>
              )}

              {payment.method === 'cod' && (
                <div className="bg-stone-100 rounded-sm p-4 mb-5">
                  <p className="text-stone-700 text-sm font-medium mb-1">Cash on Delivery</p>
                  <p className="text-stone-400 text-sm">Pay in cash when your order arrives. COD is available for orders under Rp 5.000.000. Additional Rp 100.000 COD handling fee applies.</p>
                </div>
              )}

              {/* Order total summary */}
              <div className="bg-white border border-stone-200 rounded-sm p-4 space-y-1.5 text-sm mb-5">
                <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-stone-500"><span>Shipping</span><span>{shippingFee === 0 ? 'Free' : `Rp ${shippingFee.toLocaleString('id-ID')}`}</span></div>
                <div className="flex justify-between text-stone-900 font-semibold border-t border-stone-100 pt-2"><span>Total charged</span><span>Rp {total.toLocaleString('id-ID')}</span></div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('shipping')} className="flex-1 border border-stone-300 text-stone-600 py-3 text-sm rounded-sm hover:border-stone-600 transition-colors">
                  ← Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={
                    loading || 
                    (payment.method === 'card' && (!payment.name || payment.card.length < 19 || payment.expiry.length < 5 || payment.cvv.length < 3))
                  }
                  className="flex-1 bg-stone-900 text-white py-3 text-sm rounded-sm hover:bg-stone-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Place Order · Rp ${total.toLocaleString('id-ID')}`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 - Confirm */}
          {step === 'confirm' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-600">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h3 className="text-stone-900 text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Order Placed!
              </h3>
              <p className="text-stone-500 text-sm mb-1">Thank you for your purchase.</p>
              <p className="text-stone-400 text-xs mb-6">
                Order ID: <span className="text-stone-700 font-mono font-medium">{orderId}</span>
              </p>

              <div className="bg-stone-100 rounded-sm p-4 text-left mb-6 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600"><span>Items</span><span>{items.reduce((s, i) => s + i.qty, 0)} pieces</span></div>
                <div className="flex justify-between text-stone-600"><span>Total paid</span><span className="font-medium text-stone-900">Rp {total.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-stone-600"><span>Estimated delivery</span><span>5-8 business days</span></div>
                <div className="flex justify-between text-stone-600"><span>Ship to</span><span>{shipping.city || 'Your address'}</span></div>
              </div>

              <p className="text-stone-400 text-xs mb-6">
                A confirmation email will be sent to <span className="text-stone-600">{shipping.email || 'your email'}</span>
              </p>

              <button
                onClick={handleClose}
                className="bg-stone-900 text-white px-10 py-3 text-sm tracking-wide rounded-sm hover:bg-stone-800 transition-colors font-medium"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
