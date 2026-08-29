import { useState, useEffect } from 'react'
import type { Page } from '../App'
import { ProductsContext, useRefreshProducts } from '../context'
import { useToast } from '../context/ToastContext'
import { useContext } from 'react'
import type { Product } from '../types'
import AddProductModal from '../components/AddProductModal'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface AdminPageProps {
  navigate: (page: Page) => void
  onLogout: () => void
}

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers'

// ── Auth helper: adds JWT Bearer token to admin API requests ─────────────────
function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = localStorage.getItem('lumiere_token') || ''
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...extra }
}

// ── Shared types ──────────────────────────────────────────────────────────────
interface OrderItemDetail {
  productName: string
  qty: number
  color: string
  img?: string
}

interface Order {
  id: string; customer: string; total: number; status: string
  date: string; method: string; items: number; email: string; address: string
  itemDetails?: OrderItemDetail[]
}
interface Customer {
  name: string; email: string; orders: number; spent: number; joined: string; phone: string
}

const INIT_ORDERS: Order[] = [
  { id: '#LM-20260801', customer: 'Ainna Salimah',  email: 'ainna@gmail.com',  address: 'Jl. Sudirman No. 12, Jakarta',     total: 16400000, status: 'Accepted',   date: '01 Aug 2026', method: 'Credit Card',     items: 3 },
  { id: '#LM-20260729', customer: 'Budi Santoso',   email: 'budi@gmail.com',   address: 'Jl. Gatot Subroto No. 5, Bandung', total:  4800000, status: 'Delivered',  date: '29 Jul 2026', method: 'Bank Transfer',    items: 1 },
  { id: '#LM-20260725', customer: 'Citra Dewi',     email: 'citra@gmail.com',  address: 'Jl. Pemuda No. 88, Surabaya',      total: 22900000, status: 'Delivered',  date: '25 Jul 2026', method: 'Cash on Delivery', items: 2 },
  { id: '#LM-20260720', customer: 'Dian Pratama',   email: 'dian@gmail.com',   address: 'Jl. Diponegoro No. 3, Semarang',   total:  8900000, status: 'Processing', date: '20 Jul 2026', method: 'Credit Card',      items: 2 },
  { id: '#LM-20260715', customer: 'Eka Rahayu',     email: 'eka@gmail.com',    address: 'Jl. Asia Afrika No. 22, Bandung',  total: 31200000, status: 'Delivered',  date: '15 Jul 2026', method: 'Bank Transfer',    items: 4 },
  { id: '#LM-20260710', customer: 'Fajar Nugroho',  email: 'fajar@gmail.com',  address: 'Jl. Malioboro No. 1, Yogyakarta',  total:  5600000, status: 'Cancelled',  date: '10 Jul 2026', method: 'Credit Card',      items: 1 },
  { id: '#LM-20260705', customer: 'Gita Permata',   email: 'gita@gmail.com',   address: 'Jl. Imam Bonjol No. 9, Medan',     total: 18700000, status: 'Delivered',  date: '05 Jul 2026', method: 'Cash on Delivery', items: 3 },
]

const INIT_CUSTOMERS: Customer[] = [
  { name: 'Ainna Salimah', email: 'ainna@gmail.com', orders: 4, spent: 52300000, joined: 'Jan 2026', phone: '+62 811 0001' },
  { name: 'Budi Santoso',  email: 'budi@gmail.com',  orders: 2, spent: 14600000, joined: 'Mar 2026', phone: '+62 811 0002' },
  { name: 'Citra Dewi',    email: 'citra@gmail.com', orders: 6, spent: 87400000, joined: 'Nov 2025', phone: '+62 811 0003' },
  { name: 'Dian Pratama',  email: 'dian@gmail.com',  orders: 1, spent:  8900000, joined: 'Jul 2026', phone: '+62 811 0004' },
  { name: 'Eka Rahayu',    email: 'eka@gmail.com',   orders: 3, spent: 42100000, joined: 'Feb 2026', phone: '+62 811 0005' },
  { name: 'Fajar Nugroho', email: 'fajar@gmail.com', orders: 1, spent:  5600000, joined: 'Jun 2026', phone: '+62 811 0006' },
  { name: 'Gita Permata',  email: 'gita@gmail.com',  orders: 5, spent: 73900000, joined: 'Dec 2025', phone: '+62 811 0007' },
]

const STATUS_COLOR: Record<string, string> = {
  Accepted:   'bg-warm-100 text-warm-700',
  Processing: 'bg-blue-50 text-blue-600',
  'On the Way': 'bg-indigo-50 text-indigo-600',
  Delivered:  'bg-green-50 text-green-600',
  Cancelled:  'bg-red-50 text-red-500',
}

const SIDEBAR: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
  { key: 'products',  label: 'Products',  icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
  { key: 'orders',    label: 'Orders',    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2' },
  { key: 'customers', label: 'Customers', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
]

// ── Generic Confirm Modal ─────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onClose }: {
  title: string; message: string; confirmLabel?: string; danger?: boolean
  onConfirm: () => void; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-stone-900 font-semibold text-base mb-2">{title}</h3>
        <p className="text-stone-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-stone-600 border border-stone-200 rounded-lg hover:border-stone-400 transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(); onClose() }} className={`px-4 py-2 text-sm text-white rounded-lg transition-colors font-medium ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-stone-900 hover:bg-stone-800'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ── View Order Modal ──────────────────────────────────────────────────────────
function ViewOrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-stone-900 font-semibold text-base">Order Details</h3>
            <p className="text-stone-400 text-xs mt-0.5 font-mono">{order.id}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Customer & Order Metadata */}
        <div className="space-y-3 text-sm bg-stone-50 p-4 rounded-xl mb-5">
          {[
            ['Customer', order.customer], ['Email', order.email],
            ['Address', order.address],
            ['Total', `Rp ${order.total.toLocaleString('id-ID')}`], ['Payment Method', order.method],
            ['Date Placed', order.date],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-stone-200/50 pb-2">
              <span className="text-stone-500 text-xs">{k}</span>
              <span className="text-stone-900 font-medium text-xs text-right max-w-[240px]">{v}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-1">
            <span className="text-stone-500 text-xs">Status</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status]}`}>{order.status}</span>
          </div>
        </div>

        {/* Ordered Items List */}
        <div>
          <h4 className="text-stone-900 text-xs font-bold uppercase tracking-wider mb-3">
            Ordered Items ({order.items} {order.items === 1 ? 'item' : 'items'})
          </h4>
          {order.itemDetails && order.itemDetails.length > 0 ? (
            <div className="space-y-2.5">
              {order.itemDetails.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl border border-stone-100 bg-white hover:border-stone-200 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-100">
                    {item.img ? (
                      <img src={item.img} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-900 text-xs font-semibold truncate">{item.productName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">Color: {item.color}</span>
                      <span className="text-[11px] text-stone-500">Qty: <strong className="text-stone-800">{item.qty}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic">No detailed items recorded for this order.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-xs font-medium text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Edit Order Modal ──────────────────────────────────────────────────────────
function EditOrderModal({ order, onSave, onClose }: { order: Order; onSave: (updated: Order) => void; onClose: () => void }) {
  const [status, setStatus] = useState(order.status)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-stone-900 font-semibold text-base mb-5">Edit Order <span className="text-stone-400 font-mono text-xs">{order.id}</span></h3>
        <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50 mb-6">
          {['Accepted', 'Processing', 'On the Way', 'Delivered', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-stone-600 border border-stone-200 rounded-lg hover:border-stone-400 transition-colors">Cancel</button>
          <button onClick={() => { onSave({ ...order, status }); onClose() }} className="px-4 py-2 text-sm text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors font-medium">Save Changes</button>
        </div>
      </div>
    </div>
  )
}

// ── View Customer Modal ───────────────────────────────────────────────────────
function ViewCustomerModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <h3 className="text-stone-900 font-semibold text-base">Customer Detail</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-warm-400 flex items-center justify-center text-white font-semibold">
            {customer.name.split(' ').map(w => w[0]).slice(0,2).join('')}
          </div>
          <div>
            <p className="text-stone-900 font-semibold">{customer.name}</p>
            <p className="text-stone-400 text-xs">Member since {customer.joined}</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          {[['Email', customer.email], ['Phone', customer.phone], ['Total Orders', String(customer.orders)], ['Total Spent', `Rp ${customer.spent.toLocaleString('id-ID')}`]].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-stone-50 pb-2">
              <span className="text-stone-400">{k}</span>
              <span className="text-stone-900 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Edit Product Modal ────────────────────────────────────────────────────────
function EditProductModal({ product, onSave, onClose }: {
  product: Product; onSave: (p: Product) => void; onClose: () => void
}) {
  const [name, setName]                   = useState(product.name)
  const [category, setCategory]           = useState<Product['category']>(product.category || 'Chair')
  const [subcategory, setSubcategory]     = useState(product.subcategory || '')
  const [room, setRoom]                   = useState(product.room || 'Living Room')
  const [material, setMaterial]           = useState(product.material || 'Wood')
  const [colorsInput, setColorsInput]     = useState((product.colors || []).join(', '))
  const [originalPrice, setOriginalPrice] = useState(String(product.originalPrice))
  const [discount, setDiscount]           = useState(String(product.discount))
  const [img, setImg]                     = useState(product.img)
  const [inStock, setInStock]             = useState(product.inStock)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) setImg(evt.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const parsedColors = colorsInput
    .split(',')
    .map(c => c.trim())
    .filter(Boolean)

  const handleSave = () => {
    onSave({
      ...product,
      name: name.trim(),
      category,
      subcategory: subcategory.trim() || category,
      room,
      material,
      colors: parsedColors.length ? parsedColors : ['#000000'],
      originalPrice: Number(originalPrice) || 0,
      discount: Number(discount) || 0,
      img,
      inStock,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-5 border-b border-stone-100 pb-3">
          <h3 className="text-stone-900 font-semibold text-base">Edit Product #{product.id}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {/* Product Name */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Product Name *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50" />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value as any)}
                className="w-full border border-stone-200 text-stone-900 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50">
                <option value="Chair">Chair</option>
                <option value="Sofa">Sofa</option>
                <option value="Table">Table</option>
                <option value="Bundle">Bundle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Subcategory</label>
              <input value={subcategory} onChange={e => setSubcategory(e.target.value)} placeholder="e.g. Lounge Chair"
                className="w-full border border-stone-200 text-stone-900 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50" />
            </div>
          </div>

          {/* Room & Material */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Room</label>
              <select value={room} onChange={e => setRoom(e.target.value)}
                className="w-full border border-stone-200 text-stone-900 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50">
                <option value="Living Room">Living Room</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Dining Room">Dining Room</option>
                <option value="Office">Office</option>
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Material</label>
              <select value={material} onChange={e => setMaterial(e.target.value)}
                className="w-full border border-stone-200 text-stone-900 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50">
                <option value="Wood">Wood</option>
                <option value="Fabric">Fabric</option>
                <option value="Leather">Leather</option>
                <option value="Metal">Metal</option>
                <option value="Rattan">Rattan</option>
                <option value="Marble">Marble</option>
              </select>
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Colors (comma separated HEX / names)</label>
            <input value={colorsInput} onChange={e => setColorsInput(e.target.value)} placeholder="#c8a882, #2c2c2c, #e8d8c0"
              className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50 font-mono text-xs" />
            {parsedColors.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-stone-400">Preview:</span>
                {parsedColors.map((c, i) => (
                  <span key={i} className="w-4 h-4 rounded-full border border-stone-300 inline-block shadow-sm" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
            )}
          </div>

          {/* Price & Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Original Price (Rp) *</label>
              <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)}
                className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Discount (%)</label>
              <input type="number" min="0" max="100" value={discount} onChange={e => setDiscount(e.target.value)}
                className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50" />
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Product Photo</label>
            <input type="file" accept="image/*" onChange={handleFileChange}
              className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" />
            {img && <img src={img} alt="Preview" className="mt-3 h-20 w-20 object-cover rounded-lg border border-stone-200 shadow-sm" />}
          </div>

          {/* In Stock */}
          <div className="flex items-center gap-3 pt-1">
            <input type="checkbox" id="instock" checked={inStock} onChange={e => setInStock(e.target.checked)} className="accent-stone-900 w-4 h-4 rounded cursor-pointer" />
            <label htmlFor="instock" className="text-sm font-medium text-stone-800 cursor-pointer select-none">Mark as In Stock</label>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-3 border-t border-stone-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-stone-600 border border-stone-200 rounded-xl hover:border-stone-400 transition-colors">Cancel</button>
          <button onClick={handleSave}
            className="px-5 py-2 text-sm text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-colors font-medium shadow-sm">Save Changes</button>
        </div>
      </div>
    </div>
  )
}



// ── Chart data ────────────────────────────────────────────────────────────────

const WARM = '#d09354'
const STONE = '#78716c'

// Custom tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-stone-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
      {label && <p className="text-stone-400 mb-1">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} className="font-medium">
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue') ? `Rp ${p.value.toLocaleString('id-ID')}` : p.value}
        </p>
      ))}
    </div>
  )
}

// ── Excel Export (Dynamic CDN) ────────────────────────────────────────────────
async function exportExcel(orders: Order[], monthLabel: string) {
  // Load ExcelJS dynamically if not already loaded
  if (!(window as any).ExcelJS) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  const ExcelJS = (window as any).ExcelJS;
  
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sales Report');

  // Add Title
  sheet.mergeCells('A1:H1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'LUMIÈRE FURNITURE - SALES REPORT';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1C1917' } }; // stone-900
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('A2:H2');
  const subTitleCell = sheet.getCell('A2');
  subTitleCell.value = `Period: ${monthLabel} | Generated: ${new Date().toLocaleString('id-ID')}`;
  subTitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF57534E' } }; // stone-500
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.addRow([]);

  // Summary Section
  const revenue = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0);
  sheet.addRow(['SUMMARY']).font = { bold: true };
  sheet.addRow(['Total Orders', orders.length, '', 'Total Revenue', `Rp ${revenue.toLocaleString('id-ID')}`, '', 'Delivered', orders.filter(o => o.status === 'Delivered').length]);
  sheet.addRow(['Accepted', orders.filter(o => o.status === 'Accepted').length, '', 'Processing', orders.filter(o => o.status === 'Processing').length, '', 'Cancelled', orders.filter(o => o.status === 'Cancelled').length]);
  sheet.addRow([]);

  // Order Details Header
  const headerRow = sheet.addRow(['Order ID', 'Customer', 'Email', 'Items', 'Total', 'Payment', 'Status', 'Date']);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.eachCell((cell: any) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD09354' } }; // warm-400
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Order Data
  orders.forEach(o => {
    const row = sheet.addRow([o.id, o.customer, o.email, o.items, `Rp ${o.total.toLocaleString('id-ID')}`, o.method, o.status, o.date]);
    row.getCell(7).font = { 
      bold: true,
      color: { argb: o.status === 'Delivered' ? 'FF16A34A' : o.status === 'Cancelled' ? 'FFDC2626' : 'FFD97706' } 
    };
  });

  // Adjust column widths
  sheet.columns = [
    { width: 16 }, // ID
    { width: 22 }, // Customer
    { width: 28 }, // Email
    { width: 8 },  // Items
    { width: 18 }, // Total
    { width: 18 }, // Payment
    { width: 14 }, // Status
    { width: 16 }, // Date
  ];

  // Write and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lumiere-report-${monthLabel.replace(/\s+/g, '-').toLowerCase()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ orders, customers }: { orders: Order[], customers: Customer[] }) {
  const toast = useToast()
  const allProducts = useContext(ProductsContext)
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)

  // Dynamic Chart Data
  const allMonthly = Array.from({ length: 12 }).map((_, i) => ({
    month: new Date(0, i).toLocaleString('en', { month: 'short' }),
    revenue: 0,
    orders: 0
  }))
  
  orders.forEach(o => {
    if (o.status !== 'Cancelled') {
      const monthStr = o.date.split(' ')[1] // "13 Aug 2026" -> "Aug"
      const mData = allMonthly.find(m => m.month === monthStr)
      if (mData) {
        mData.revenue += o.total
        mData.orders += 1
      }
    }
  })

  const filteredOrders = selectedMonths.length === 0
    ? orders
    : orders.filter(o => selectedMonths.includes(o.date.split(' ')[1]))

  const orderStatusData = [
    { name: 'Delivered',  value: filteredOrders.filter(o => o.status === 'Delivered').length, color: '#4ade80' },
    { name: 'Accepted',   value: filteredOrders.filter(o => o.status === 'Accepted').length, color: '#d09354' },
    { name: 'Processing', value: filteredOrders.filter(o => o.status === 'Processing').length, color: '#60a5fa' },
    { name: 'On the Way', value: filteredOrders.filter(o => o.status === 'On the Way').length, color: '#818cf8' },
    { name: 'Cancelled',  value: filteredOrders.filter(o => o.status === 'Cancelled').length, color: '#f87171' },
  ].filter(s => s.value > 0)

  const catCounts = allProducts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const categoryData = Object.entries(catCounts).map(([name, count]) => ({ name, count }))

  const monthData = selectedMonths.length === 0
    ? allMonthly
    : allMonthly.filter(m => selectedMonths.includes(m.month))

  const toggleMonth = (m: string) =>
    setSelectedMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  const monthLabel = selectedMonths.length === 0
    ? 'All Months (2026)'
    : selectedMonths.join(', ') + ' 2026'

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportExcel(filteredOrders, monthLabel)
      toast.success('Excel report exported successfully!')
    } catch(e) {
      toast.error('Failed to export Excel file.')
    } finally {
      setExporting(false)
    }
  }

  const revenue = filteredOrders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0)
  const pendingCount = filteredOrders.filter(o => o.status === 'Processing' || o.status === 'Accepted').length
  
  const stats = [
    { label: 'Total Revenue',   value: `Rp ${revenue.toLocaleString('id-ID')}`,  sub: 'Live Data', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', color: 'bg-warm-50 text-warm-600' },
    { label: 'Total Orders',    value: filteredOrders.length,                    sub: `${pendingCount} pending`, icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Products',  value: allProducts.length,               sub: `${categoryData.length} categories`, icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Customers', value: customers.length,                 sub: 'Live Data', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', color: 'bg-green-50 text-green-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header + controls */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="text-stone-900 text-2xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</h2>
          <p className="text-stone-400 text-sm">Welcome back, Admin. Here is what is happening today.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select
              className="appearance-none bg-white border border-stone-200 text-stone-600 text-xs px-4 py-2.5 rounded-xl pr-8 focus:outline-none focus:border-stone-400 font-medium cursor-pointer transition-colors hover:border-stone-300"
              value={selectedMonths.length === 1 ? selectedMonths[0] : ''}
              onChange={(e) => {
                if (e.target.value === '') setSelectedMonths([])
                else setSelectedMonths([e.target.value])
              }}
            >
              <option value="">All Months</option>
              {allMonthly.map(m => (
                <option key={m.month} value={m.month}>{m.month}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-stone-400">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 bg-stone-900 text-white text-xs px-4 py-2.5 rounded-xl hover:bg-stone-800 transition-colors font-medium disabled:opacity-60">
            {exporting ? (
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            )}
            Export Excel
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d={s.icon}/></svg>
            </div>
            <p className="text-stone-900 text-2xl font-bold">{s.value}</p>
            <p className="text-stone-500 text-xs mt-0.5">{s.label}</p>
            <p className="text-green-500 text-xs mt-1 font-medium">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue area chart */}
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-stone-900 font-semibold text-sm">Monthly Revenue</h3>
            <p className="text-stone-400 text-xs mt-0.5">{monthLabel}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={WARM} stopOpacity={0.18} />
                <stop offset="95%" stopColor={WARM} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(0)}jt`} width={40} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e7e5e4', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke={WARM} strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: WARM, strokeWidth: 2, stroke: '#fff' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Order status pie */}
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h3 className="text-stone-900 font-semibold text-sm mb-4">Order Status</h3>
            <div className="flex items-center gap-4">
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {orderStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} cursor={{fill: 'transparent'}} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-stone-400 text-sm">No orders yet</div>
              )}
            </div>
          </div>

          {/* Category bar */}
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h3 className="text-stone-900 font-semibold text-sm mb-4">Products by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 0 }} barSize={12}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} width={48} interval={0} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f5f5f4' }} />
                <Bar dataKey="count" name="Products" fill={WARM} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      {/* Recent orders table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="text-stone-900 font-semibold text-sm">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>{['Order ID','Customer','Total','Status','Date'].map(h => (
                <th key={h} className="text-left text-xs text-stone-400 font-medium px-6 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {orders.slice(0,5).map(o => (
                <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-xs text-stone-600">{o.id}</td>
                  <td className="px-6 py-3.5 text-stone-900 font-medium">{o.customer}</td>
                  <td className="px-6 py-3.5 text-stone-900 font-semibold">Rp {o.total.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-3.5"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status]}`}>{o.status}</span></td>
                  <td className="px-6 py-3.5 text-stone-400 text-xs">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Products Tab ──────────────────────────────────────────────────────────────
function ProductsTab() {
  const toast = useToast()
  const allProducts = useContext(ProductsContext)
  const refreshProducts = useRefreshProducts()
  const [items, setItems] = useState<Product[]>(allProducts)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 25

  // Sync items when global products change
  useEffect(() => {
    setItems(allProducts)
  }, [allProducts])

  const filtered = items
    .filter(p => catFilter === 'All' || p.category === catFilter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 when filter/search changes
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleCat = (c: string) => { setCatFilter(c); setPage(1) }

  return (
    <div className="space-y-5">
      {editTarget && <EditProductModal product={editTarget} onClose={() => setEditTarget(null)} onSave={async (updated) => {
        try {
          const res = await fetch(`/api/products/${updated.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
              name: updated.name,
              category: updated.category,
              subcategory: updated.subcategory,
              room: updated.room,
              material: updated.material,
              colors: updated.colors,
              originalPrice: updated.originalPrice,
              discount: updated.discount,
              img: updated.img,
              inStock: updated.inStock,
            })
          })
          if (res.ok) {
            await refreshProducts()
            toast.success('Product updated successfully!')
          }
        } catch (e) { toast.error('Failed to update product.') }
      }} />}
      {deleteTarget && <ConfirmModal danger title="Delete Product" message={`Are you sure you want to permanently delete "${deleteTarget.name}"? This action cannot be undone.`} confirmLabel="Delete Product"
        onClose={() => setDeleteTarget(null)} onConfirm={async () => {
          try {
            const res = await fetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE', headers: authHeaders() })
            if (!res.ok) {
              const err = await res.json()
              toast.error(err.error || 'Failed to delete product.')
              return
            }
            await refreshProducts()
            toast.success('Product deleted successfully!')
          } catch (e) { toast.error('Failed to delete product.') }
        }} />}
      {isAdding && <AddProductModal onClose={() => setIsAdding(false)} onSave={async (newP) => {
        try {
          const res = await fetch(`/api/products`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(newP)
          })
          if (!res.ok) throw new Error('Failed')
          await refreshProducts()
          toast.success('Product added successfully!')
          setPage(1)
        } catch (e) { toast.error('Failed to add product.') }
      }} />}

      <div className="flex items-center justify-between">
        <h2 className="text-stone-900 text-2xl" style={{ fontFamily: 'var(--font-display)' }}>Products <span className="text-stone-400 text-base font-normal">({items.length})</span></h2>
        <button onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-stone-900 text-white text-xs px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors font-medium">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Add Product
        </button>
      </div>
      <div className="flex gap-3 flex-wrap">
        <input type="text" value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search products…"
          className="border border-stone-200 text-stone-900 text-sm px-4 py-2 rounded-lg focus:outline-none focus:border-stone-400 bg-white w-56" />
        {['All','Chair','Sofa','Table'].map(c => (
          <button key={c} onClick={() => handleCat(c)}
            className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors ${catFilter === c ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'}`}>{c}</button>
        ))}
      </div>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>{['Product','Category','Price','Stock','Rating','Actions'].map(h => (
                <th key={h} className="text-left text-xs text-stone-400 font-medium px-5 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {shown.map(p => (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-stone-900 font-medium text-xs max-w-[140px] truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-stone-500 text-xs">{p.category}</td>
                  <td className="px-5 py-3 text-stone-900 font-semibold text-xs">Rp {p.price.toLocaleString('id-ID')}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {p.inStock ? 'In Stock' : 'Out'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-stone-500">★ {p.rating}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => setEditTarget(p)} className="text-xs text-stone-500 hover:text-stone-900 transition-colors font-medium">Edit</button>
                      <button onClick={() => setDeleteTarget(p)} className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination footer */}
        <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs rounded-lg border border-stone-200 text-stone-600 hover:border-stone-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                ← Prev
              </button>
              <span className="text-xs text-stone-500 font-medium">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 text-xs rounded-lg border border-stone-200 text-stone-600 hover:border-stone-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab({ orders, setOrders }: { orders: Order[], setOrders: React.Dispatch<React.SetStateAction<Order[]>> }) {
  const toast = useToast()
  const [filter, setFilter] = useState('All')
  const [viewTarget, setViewTarget] = useState<Order | null>(null)
  const [editTarget, setEditTarget] = useState<Order | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)

  const shown = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="space-y-5">
      {viewTarget  && <ViewOrderModal order={viewTarget} onClose={() => setViewTarget(null)} />}
      {editTarget  && <EditOrderModal order={editTarget} onClose={() => setEditTarget(null)} onSave={async (updated) => {
        try {
          await fetch(`/api/orders/${encodeURIComponent(updated.id)}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status: updated.status })
          })
          setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
          toast.success('Order status updated!')
        } catch (e) { toast.error('Failed to update order status.') }
      }} />}
      {cancelTarget && <ConfirmModal danger title="Cancel Order" message={`Are you sure you want to cancel order ${cancelTarget.id} for ${cancelTarget.customer}? This action cannot be undone.`} confirmLabel="Cancel Order"
        onClose={() => setCancelTarget(null)} onConfirm={async () => {
          try {
            await fetch(`/api/orders/${encodeURIComponent(cancelTarget.id)}`, {
              method: 'PUT',
              headers: authHeaders(),
              body: JSON.stringify({ status: 'Cancelled' })
            })
            setOrders(prev => prev.map(o => o.id === cancelTarget.id ? { ...o, status: 'Cancelled' } : o))
            toast.success('Order cancelled.')
          } catch (e) { toast.error('Failed to cancel order.') }
        }} />}

      <h2 className="text-stone-900 text-2xl" style={{ fontFamily: 'var(--font-display)' }}>Orders</h2>
      <div className="flex gap-2 flex-wrap">
        {['All','Accepted','Processing','On the Way','Delivered','Cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors ${filter === s ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'}`}>{s}</button>
        ))}
      </div>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>{['Order ID','Customer','Items','Total','Method','Status','Date','Actions'].map(h => (
                <th key={h} className="text-left text-xs text-stone-400 font-medium px-5 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {shown.map(o => (
                <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-stone-600">{o.id}</td>
                  <td className="px-5 py-3.5 text-stone-900 font-medium text-xs">{o.customer}</td>
                  <td className="px-5 py-3.5 text-stone-500 text-xs">{o.items}</td>
                  <td className="px-5 py-3.5 text-stone-900 font-semibold text-xs">Rp {o.total.toLocaleString('id-ID')}</td>
                  <td className="px-5 py-3.5 text-stone-500 text-xs">{o.method}</td>
                  <td className="px-5 py-3.5"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status]}`}>{o.status}</span></td>
                  <td className="px-5 py-3.5 text-stone-400 text-xs">{o.date}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2.5">
                      <button onClick={() => setViewTarget(o)} className="text-xs text-stone-500 hover:text-stone-900 font-medium transition-colors">View</button>
                      <button onClick={() => setEditTarget(o)} className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">Edit</button>
                      {o.status !== 'Cancelled' && o.status !== 'Delivered' &&
                        <button onClick={() => setCancelTarget(o)} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">Cancel</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Customers Tab ─────────────────────────────────────────────────────────────
function CustomersTab({ customers, setCustomers }: { customers: Customer[], setCustomers: React.Dispatch<React.SetStateAction<Customer[]>> }) {
  const toast = useToast()
  const [viewTarget, setViewTarget] = useState<Customer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  return (
    <div className="space-y-5">
      {viewTarget   && <ViewCustomerModal customer={viewTarget} onClose={() => setViewTarget(null)} />}
      {deleteTarget && <ConfirmModal danger title="Delete Customer" message={`Are you sure you want to permanently delete customer ${deleteTarget.name}? This action cannot be undone.`} confirmLabel="Delete Customer"
        onClose={() => setDeleteTarget(null)} onConfirm={async () => {
          try {
            const res = await fetch(`/api/customers/${encodeURIComponent(deleteTarget.email)}`, { method: 'DELETE', headers: authHeaders() })
            if (!res.ok) {
              const err = await res.json()
              toast.error(err.error || 'Failed to delete customer.')
              return
            }
            setCustomers(prev => prev.filter(c => c.email !== deleteTarget.email))
            toast.success('Customer deleted successfully.')
          } catch (e) { toast.error('Failed to delete customer.') }
        }} />}

      <h2 className="text-stone-900 text-2xl" style={{ fontFamily: 'var(--font-display)' }}>Customers</h2>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>{['Customer','Email','Orders','Total Spent','Joined','Actions'].map(h => (
                <th key={h} className="text-left text-xs text-stone-400 font-medium px-5 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {customers.map(c => (
                <tr key={c.email} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-warm-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {c.name.split(' ').map(w => w[0]).slice(0,2).join('')}
                      </div>
                      <span className="text-stone-900 font-medium text-xs">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-stone-500 text-xs">{c.email}</td>
                  <td className="px-5 py-3.5 text-stone-700 text-xs font-medium">{c.orders}</td>
                  <td className="px-5 py-3.5 text-stone-900 font-semibold text-xs">Rp {c.spent.toLocaleString('id-ID')}</td>
                  <td className="px-5 py-3.5 text-stone-400 text-xs">{c.joined}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2.5">
                      <button onClick={() => setViewTarget(c)} className="text-xs text-stone-500 hover:text-stone-900 font-medium transition-colors">View</button>
                      <button onClick={() => setDeleteTarget(c)} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminPage({ navigate, onLogout }: AdminPageProps) {
  const allProducts = useContext(ProductsContext)
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('lumiere_token') || ''
    const headers = { 'Authorization': `Bearer ${token}` }
    fetch('/api/orders', { headers })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(console.error)

    fetch('/api/customers', { headers })
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-stone-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-stone-800 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-warm-400 rounded-sm flex items-center justify-center">
            <span className="text-stone-900 text-xs font-bold" style={{ fontFamily: 'var(--font-display)' }}>L</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none" style={{ fontFamily: 'var(--font-display)' }}>Lumière</p>
            <p className="text-stone-400 text-[10px] tracking-widest uppercase mt-0.5">Admin</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          aria-label="Toggle admin navigation menu"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileMenuOpen ? <path d="M6 18 18 6M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Responsive Drawer on Mobile, Fixed Sidebar on Desktop) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-stone-900 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-5 py-5 border-b border-stone-800 hidden md:block">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-warm-400 rounded-sm flex items-center justify-center">
              <span className="text-stone-900 text-xs font-bold" style={{ fontFamily: 'var(--font-display)' }}>L</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Lumière</p>
              <p className="text-stone-500 text-[10px] tracking-widest uppercase">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {SIDEBAR.map(({ key, label, icon }) => (
            <button key={key} onClick={() => { setActiveTab(key); setMobileMenuOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${activeTab === key ? 'bg-warm-400 text-stone-900' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d={icon}/></svg>
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-stone-800 space-y-1">
          <button onClick={() => navigate('home')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-400 hover:text-white hover:bg-stone-800 transition-colors text-left">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>
            </svg>
            View Store
          </button>
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-stone-800 transition-colors text-left">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
        {activeTab === 'dashboard' && <Dashboard orders={orders} customers={customers} />}
        {activeTab === 'products'  && <ProductsTab />}
        {activeTab === 'orders'    && <OrdersTab orders={orders} setOrders={setOrders} />}
        {activeTab === 'customers' && <CustomersTab customers={customers} setCustomers={setCustomers} />}
      </main>
    </div>
  )
}
