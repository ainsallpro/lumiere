import { useState, useEffect } from 'react'
import type { AuthUser } from '../types'
import type { Page } from '../App'
import TrackOrderModal from '../components/TrackOrderModal'
import ReviewModal from '../components/ReviewModal'
import InvoiceModal from '../components/InvoiceModal'
import { useToast } from '../context/ToastContext'
import { OrderCardSkeleton } from '../components/Skeleton'

interface AccountPageProps {
  currentUser: AuthUser | null
  onLogout: () => void
  navigate: (page: Page) => void
  onUpdateUser?: (updated: AuthUser) => void
}

type Tab = 'personal' | 'orders' | 'address' | 'payment' | 'password'

const STATUS_STYLE: Record<string, string> = {
  Accepted: 'text-warm-600 border-warm-400',
  Processing: 'text-blue-600 border-blue-400',
  Delivered: 'text-green-600 border-green-400',
  Cancelled: 'text-red-500 border-red-400',
}

const SIDEBAR_ITEMS: { key: Tab | 'logout'; label: string; icon: string }[] = [
  { key: 'personal', label: 'Personal Information', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { key: 'orders',   label: 'My Orders',            icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2' },
  { key: 'address',  label: 'Manage Address',       icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0' },
  { key: 'payment',  label: 'Payment Method',       icon: 'M1 4h22v16H1zM1 9h22' },
  { key: 'password', label: 'Password Manager',     icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { key: 'logout',   label: 'Logout',               icon: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9' },
]

// ── Personal Info Tab ──────────────────────────────────────────────────────────
function PersonalTab({ user, onUpdateUser }: { user: AuthUser | null; onUpdateUser?: (u: AuthUser) => void }) {
  const [name, setName]     = useState(user?.name ?? '')
  const [email]             = useState(user?.email ?? '')
  const [phone, setPhone]   = useState(user?.phone ?? '')
  const [gender, setGender] = useState('Prefer not to say')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState('')

  const initials = name.split(' ').map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name cannot be empty.'); return }
    if (!user?.id) return
    setError('')
    setSaving(true)
    try {
      const token = localStorage.getItem('lumiere_token') || ''
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), phone })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save.')
      }
      const updated = await res.json()
      onUpdateUser?.({ ...user, name: updated.name, phone: updated.phone })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="text-stone-900 text-2xl mb-8" style={{ fontFamily: 'var(--font-display)' }}>Personal Information</h2>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-warm-400 flex items-center justify-center text-white text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            {initials || '?'}
          </div>
          <button className="absolute bottom-0 right-0 w-6 h-6 bg-stone-900 rounded-full flex items-center justify-center text-white hover:bg-stone-700 transition-colors">
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
        <div>
          <p className="text-stone-900 font-semibold">{name}</p>
          <p className="text-stone-400 text-sm">{email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5 max-w-xl">
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Full Name *</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50" />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Email</label>
          <input type="email" value={email} disabled
            className="w-full border border-stone-200 text-stone-400 text-sm px-4 py-3 rounded-lg bg-stone-100 cursor-not-allowed" />
          <p className="text-xs text-stone-400 mt-1">Email address cannot be changed.</p>
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Phone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+62 812 3456 7890"
            className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50" />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Gender</label>
          <select value={gender} onChange={e => setGender(e.target.value)}
            className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50">
            <option>Prefer not to say</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        <button type="submit" disabled={saving}
          className={`px-8 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${saved ? 'bg-green-600 text-white' : saving ? 'bg-stone-400 text-white cursor-wait' : 'bg-stone-900 text-white hover:bg-stone-800'}`}>
          {saved ? '✓ Changes Saved' : saving ? 'Saving…' : 'Update Changes'}
        </button>
      </form>
    </div>
  )
}

// ── Orders Tab ─────────────────────────────────────────────────────────────────
function OrdersTab({ currentUser }: { currentUser: AuthUser | null }) {
  const toast = useToast()
  const [filter, setFilter]           = useState('All')
  const [orders, setOrders]           = useState<any[]>([])
  const [loading, setLoading]         = useState(false)
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null)
  const [reviewOrder, setReviewOrder]     = useState<any | null>(null)
  const [invoiceOrder, setInvoiceOrder]   = useState<any | null>(null)
  const [cancelTarget, setCancelTarget]   = useState<any | null>(null)
  const [cancelling, setCancelling]       = useState(false)

  const fetchOrders = () => {
    if (!currentUser?.id) return
    const token = localStorage.getItem('lumiere_token') || ''
    setLoading(true)
    fetch(`/api/users/${currentUser.id}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [currentUser])

  const handleCancelOrder = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    const token = localStorage.getItem('lumiere_token') || ''
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(cancelTarget.id)}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel order')

      setOrders(prev => prev.map(o => o.id === cancelTarget.id ? { ...o, status: 'Cancelled' } : o))
      toast.success('Order has been cancelled successfully.')
      setCancelTarget(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order.')
    } finally {
      setCancelling(false)
    }
  }

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-stone-900 text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
          My Orders {!loading && `(${filtered.length})`}
        </h2>
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span>Filter:</span>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="border border-stone-200 text-stone-700 text-sm px-3 py-1.5 rounded-lg focus:outline-none bg-white">
            <option>All</option>
            <option>Accepted</option>
            <option>Processing</option>
            <option>On the Way</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      <TrackOrderModal
        open={!!trackingOrder}
        onClose={() => setTrackingOrder(null)}
        orderId={trackingOrder?.id ?? ''}
        activeStep={trackingOrder?.status === 'Delivered' ? 4 : trackingOrder?.status === 'On the Way' ? 3 : trackingOrder?.status === 'Processing' ? 2 : trackingOrder?.status === 'Accepted' ? 1 : 0}
        placedDate={trackingOrder?.date ?? ''}
        items={(trackingOrder?.items ?? []).map(({ product, qty, color }: any) => ({
          img: product?.img || '', name: product?.name || 'Product', color, qty,
        }))}
      />

      <ReviewModal
        open={!!reviewOrder}
        onClose={() => setReviewOrder(null)}
        orderId={reviewOrder?.id ?? ''}
        items={reviewOrder?.items ?? []}
        authorName={currentUser?.name ?? 'Guest'}
      />

      <InvoiceModal
        open={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        order={invoiceOrder}
      />

      {/* Cancel Order Confirmation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={() => !cancelling && setCancelTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 className="text-stone-900 font-semibold text-lg mb-2">Cancel Order {cancelTarget.id}?</h3>
            <p className="text-stone-500 text-sm mb-6">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                disabled={cancelling}
                onClick={() => setCancelTarget(null)}
                className="px-5 py-2.5 text-xs font-semibold text-stone-600 border border-stone-200 rounded-xl hover:border-stone-400 transition-colors"
              >
                No, Keep Order
              </button>
              <button
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
              >
                {cancelling ? 'Cancelling…' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-stone-400">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
            </svg>
          </div>
          <p className="text-stone-900 font-semibold mb-1">No orders yet</p>
          <p className="text-stone-400 text-sm">Your orders will appear here after checkout.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map(order => (
            <div key={order.id} className="border border-stone-200 rounded-xl overflow-hidden bg-white">
              {/* Order header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-warm-400/20 border-b border-warm-400/30 px-5 py-4">
                <div>
                  <p className="text-stone-500 text-xs mb-0.5">Order ID</p>
                  <p className="text-stone-900 font-semibold text-sm">{order.id}</p>
                </div>
                <div>
                  <p className="text-stone-500 text-xs mb-0.5">Total Payment</p>
                  <p className="text-stone-900 font-semibold text-sm">Rp {order.total.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-stone-500 text-xs mb-0.5">Payment Method</p>
                  <p className="text-stone-900 font-semibold text-sm">{order.method}</p>
                </div>
                <div>
                  <p className="text-stone-500 text-xs mb-0.5">{order.status === 'Delivered' ? 'Date Received' : 'Order Date'}</p>
                  <p className="text-stone-900 font-semibold text-sm">{order.date}</p>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-stone-100">
                {order.items.map(({ product, qty, color }: any, idx: number) => (
                  <div key={product?.id || idx} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={product?.img || ''} alt={product?.name || 'Product'} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-stone-900 text-sm font-medium">{product?.name || 'Product'}</p>
                      <p className="text-stone-400 text-xs">Color: {color} | Qty: {qty}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-stone-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium border px-3 py-1 rounded-full ${STATUS_STYLE[order.status] ?? 'text-stone-600 border-stone-300'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {order.status === 'Accepted' && (
                    <button
                      onClick={() => setCancelTarget(order)}
                      className="text-xs text-red-500 hover:text-red-700 px-3 py-2 rounded-xl font-medium hover:bg-red-50 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  {order.status === 'Accepted' || order.status === 'Processing' || order.status === 'On the Way' ? (
                    <>
                      <button onClick={() => setTrackingOrder(order)} className="bg-stone-900 text-white text-xs px-5 py-2 rounded-xl hover:bg-stone-800 transition-colors font-medium">Track Order</button>
                      <button onClick={() => setInvoiceOrder(order)} className="border border-stone-300 text-stone-700 text-xs px-5 py-2 rounded-xl hover:border-stone-500 transition-colors font-medium">Invoice</button>
                    </>
                  ) : order.status === 'Delivered' ? (
                    <>
                      <button onClick={() => setReviewOrder(order)} className="bg-stone-900 text-white text-xs px-5 py-2 rounded-xl hover:bg-stone-800 transition-colors font-medium">Write a Review</button>
                      <button onClick={() => setInvoiceOrder(order)} className="border border-stone-300 text-stone-700 text-xs px-5 py-2 rounded-xl hover:border-stone-500 transition-colors font-medium">Invoice</button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Address Tab ────────────────────────────────────────────────────────────────
export type SavedAddress = {
  id: number
  name: string
  phone: string
  street: string
  city: string
  zip: string
  country: string
  isDefault?: boolean
}

function AddressTab({ userId }: { userId?: number }) {
  const storageKey = `addresses_${userId ?? 'guest'}`
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', street: '', city: '', zip: '', country: 'Indonesia' })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Load addresses from DB (with localStorage fallback)
  useEffect(() => {
    if (!userId) {
      try { setAddresses(JSON.parse(localStorage.getItem(storageKey) ?? '[]')) } catch {}
      return
    }
    const token = localStorage.getItem('lumiere_token') || ''
    setLoading(true)
    fetch(`/api/users/${userId}/addresses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAddresses(data)
          localStorage.setItem(storageKey, JSON.stringify(data))
        }
      })
      .catch(() => {
        try { setAddresses(JSON.parse(localStorage.getItem(storageKey) ?? '[]')) } catch {}
      })
      .finally(() => setLoading(false))
  }, [userId, storageKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const token = localStorage.getItem('lumiere_token') || ''

    if (userId) {
      try {
        if (editingId !== null) {
          const res = await fetch(`/api/users/${userId}/addresses/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(form)
          })
          if (!res.ok) throw new Error('Failed to update address')
          const updated = await res.json()
          setAddresses(prev => prev.map(a => a.id === editingId ? updated : a))
          setEditingId(null)
        } else {
          const res = await fetch(`/api/users/${userId}/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(form)
          })
          if (!res.ok) throw new Error('Failed to save address')
          const created = await res.json()
          setAddresses(prev => [created, ...prev])
        }
      } catch (err: any) {
        setError(err.message || 'Failed to save address.')
      }
    } else {
      // Local fallback for guest
      if (editingId !== null) {
        const updated = addresses.map(a => a.id === editingId ? { ...a, ...form } : a)
        setAddresses(updated)
        localStorage.setItem(storageKey, JSON.stringify(updated))
        setEditingId(null)
      } else {
        const newAddr: SavedAddress = { id: Date.now(), ...form }
        const updated = [...addresses, newAddr]
        setAddresses(updated)
        localStorage.setItem(storageKey, JSON.stringify(updated))
      }
    }

    setForm({ name: '', phone: '', street: '', city: '', zip: '', country: 'Indonesia' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const startEdit = (addr: SavedAddress) => {
    setEditingId(addr.id)
    setForm({ name: addr.name, phone: addr.phone, street: addr.street, city: addr.city, zip: addr.zip, country: addr.country })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteAddr = async (id: number) => {
    if (userId) {
      try {
        const token = localStorage.getItem('lumiere_token') || ''
        await fetch(`/api/users/${userId}/addresses/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      } catch {}
    }
    const remaining = addresses.filter(a => a.id !== id)
    setAddresses(remaining)
    localStorage.setItem(storageKey, JSON.stringify(remaining))
  }

  const setDefault = async (id: number) => {
    if (userId) {
      try {
        const token = localStorage.getItem('lumiere_token') || ''
        await fetch(`/api/users/${userId}/addresses/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ isDefault: true })
        })
      } catch {}
    }
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }))
    setAddresses(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  const inp = "w-full border border-stone-200 text-stone-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50"

  return (
    <div>
      <h2 className="text-stone-900 text-2xl mb-8" style={{ fontFamily: 'var(--font-display)' }}>Manage Address</h2>

      {/* Loading state */}
      {loading && <p className="text-stone-400 text-sm mb-4">Loading saved addresses…</p>}

      {/* Saved addresses */}
      {addresses.length > 0 && (
        <div className="space-y-3 mb-8">
          {addresses.map(addr => (
            <div key={addr.id} className={`flex items-start justify-between border rounded-xl px-5 py-4 bg-white ${addr.isDefault ? 'border-warm-400' : 'border-stone-200'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-stone-900 text-sm font-semibold">{addr.name}</p>
                  {addr.isDefault && <span className="text-[10px] font-semibold bg-warm-100 text-warm-600 px-2 py-0.5 rounded-full">Default</span>}
                </div>
                <p className="text-stone-400 text-sm">{addr.phone}</p>
                <p className="text-stone-500 text-sm">{addr.street}, {addr.city}, {addr.zip}, {addr.country}</p>
              </div>
              <div className="flex flex-col gap-1.5 text-xs font-medium flex-shrink-0 ml-4 items-end">
                <button onClick={() => startEdit(addr)} className="text-stone-600 hover:text-stone-900 transition-colors">Edit</button>
                {!addr.isDefault && <button onClick={() => setDefault(addr.id)} className="text-warm-600 hover:text-warm-800 transition-colors">Set as Default</button>}
                <button onClick={() => deleteAddr(addr.id)} className="text-red-500 hover:text-red-600 transition-colors">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit form */}
      <h3 className="text-stone-900 text-lg font-semibold mb-5" style={{ fontFamily: 'var(--font-display)' }}>
        {editingId !== null ? 'Edit Address' : 'Add New Address'}
      </h3>
      {error && <p className="text-red-500 text-xs bg-red-50 border border-red-100 p-3 rounded-lg mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Recipient Name *</label>
          <input required placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Phone Number *</label>
          <input required type="tel" placeholder="+62 812 3456 7890" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Street Address *</label>
          <input required placeholder="Jl. Sudirman No. 12" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className={inp} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">City *</label>
            <input required placeholder="Jakarta" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Postal Code *</label>
            <input required placeholder="10210" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} className={inp} />
          </div>
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Country *</label>
          <select required value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className={inp}>
            <option>Indonesia</option>
            <option>Malaysia</option>
            <option>Singapore</option>
            <option>Other</option>
          </select>
        </div>
        <div className="flex gap-3">
          {editingId !== null && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', phone: '', street: '', city: '', zip: '', country: 'Indonesia' }) }}
              className="px-6 py-3 rounded-xl text-sm font-semibold border border-stone-300 text-stone-700 hover:border-stone-500 transition-all">
              Cancel
            </button>
          )}
          <button type="submit"
            className={`px-8 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${saved ? 'bg-green-600 text-white' : 'bg-stone-900 text-white hover:bg-stone-800'}`}>
            {saved ? '✓ Saved' : editingId !== null ? 'Save Changes' : 'Add Address'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Payment Tab ────────────────────────────────────────────────────────────────
function PaymentTab() {
  const [cards] = useState<any[]>([])
  return (
    <div>
      <h2 className="text-stone-900 text-2xl mb-8" style={{ fontFamily: 'var(--font-display)' }}>Payment Method</h2>
      <div className="space-y-3 mb-8">
        {cards.map(card => (
          <div key={card.id} className="flex items-center justify-between border border-stone-200 rounded-xl px-5 py-4 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-7 bg-stone-900 rounded flex items-center justify-center">
                <span className="text-white text-[10px] font-bold tracking-tight">{card.type}</span>
              </div>
              <div>
                <p className="text-stone-900 text-sm font-semibold">•••• •••• •••• {card.last4}</p>
                <p className="text-stone-400 text-xs">Expires {card.expiry} · {card.name}</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs font-medium">
              <button className="text-stone-600 hover:text-stone-900 transition-colors">Edit</button>
              <button className="text-red-500 hover:text-red-600 transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <div className="border-2 border-dashed border-stone-200 rounded-xl px-5 py-8 text-center hover:border-stone-400 transition-colors cursor-pointer group">
        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-stone-200 transition-colors">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-stone-500">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
        <p className="text-stone-700 text-sm font-medium">Add New Payment Method</p>
        <p className="text-stone-400 text-xs mt-1">Credit card, debit card, or bank transfer</p>
      </div>
    </div>
  )
}

// ── Password Tab ───────────────────────────────────────────────────────────────
function PasswordTab({ userId }: { userId?: number }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const inp = "w-full border border-stone-200 text-stone-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50"

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.next.length < 6) { setError('New password must be at least 6 characters.'); return }
    if (form.next !== form.confirm) { setError('Passwords do not match.'); return }
    if (!userId) { setError('User session invalid. Please log in again.'); return }

    setLoading(true)
    try {
      const token = localStorage.getItem('lumiere_token') || ''
      const res = await fetch(`/api/users/${userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update password')

      setSuccess(true)
      setForm({ current: '', next: '', confirm: '' })
      setTimeout(() => setSuccess(false), 4000)
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-stone-900 text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>Password Manager</h2>
      <p className="text-stone-400 text-sm mb-8">Update your password to keep your account secure.</p>
      <form onSubmit={handle} className="space-y-5 max-w-sm">
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Current Password *</label>
          <input required type="password" placeholder="••••••••" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} className={inp} />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">New Password *</label>
          <input required type="password" placeholder="Min. 6 characters" value={form.next} onChange={e => setForm({ ...form, next: e.target.value })} className={inp} />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Confirm New Password *</label>
          <input required type="password" placeholder="••••••••" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className={inp} />
        </div>
        {error && <p className="text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>}
        {success && <p className="text-green-600 text-xs bg-green-50 border border-green-100 px-3 py-2 rounded-lg">✓ Password updated successfully in database.</p>}
        <button type="submit" disabled={loading} className={`bg-stone-900 text-white px-8 py-3 rounded-xl text-sm font-semibold tracking-wide hover:bg-stone-800 transition-colors ${loading ? 'opacity-50 cursor-wait' : ''}`}>
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}

// ── Main AccountPage ───────────────────────────────────────────────────────────
export default function AccountPage({ currentUser, onLogout, navigate, onUpdateUser }: AccountPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('personal')

  if (!currentUser) {
    return (
      <div className="bg-stone-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-stone-400">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2 className="text-stone-900 text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>Sign in required</h2>
          <p className="text-stone-500 text-sm mb-6">Please sign in to access your account.</p>
          <button onClick={() => navigate('home')} className="bg-stone-900 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex items-center gap-2 text-xs text-stone-400">
          <button onClick={() => navigate('home')} className="hover:text-stone-700 transition-colors">Home</button>
          <span>/</span>
          <span className="text-stone-700">My Account</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {SIDEBAR_ITEMS.map(({ key, label, icon }) => {
                const isLogout = key === 'logout'
                const isActive = !isLogout && activeTab === key
                return (
                  <button
                    key={key}
                    onClick={() => isLogout ? onLogout() : setActiveTab(key as Tab)}
                    className={`whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:w-full flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium text-left transition-all ${
                      isActive
                        ? 'bg-warm-400 text-stone-900 shadow-sm'
                        : isLogout
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-stone-600 hover:bg-white hover:text-stone-900 hover:shadow-sm bg-white lg:bg-transparent border lg:border-none border-stone-200'
                    }`}
                  >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="flex-shrink-0">
                      <path d={icon}/>
                    </svg>
                    {label}
                  </button>
                )
              })}
            </div>
          </aside>

          {/* ── Content ── */}
          <div className="w-full flex-1 bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 lg:p-8 min-h-[500px]">
            {activeTab === 'personal' && <PersonalTab user={currentUser} onUpdateUser={onUpdateUser} />}
            {activeTab === 'orders'   && <OrdersTab currentUser={currentUser} />}
            {activeTab === 'address'  && <AddressTab userId={currentUser.id} />}
            {activeTab === 'payment'  && <PaymentTab />}
            {activeTab === 'password' && <PasswordTab userId={currentUser.id} />}
          </div>
        </div>
      </div>
    </div>
  )
}
