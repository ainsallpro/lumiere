import type { Product } from '../types'

interface BundleModalProps {
  bundle: Product | null
  open: boolean
  onClose: () => void
  addToCart: (product: Product, qty: number) => void
}

export default function BundleModal({ bundle, open, onClose, addToCart }: BundleModalProps) {
  if (!open || !bundle) return null

  const handleAdd = () => {
    addToCart(bundle, 1)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header (Image + Title) */}
        <div className="relative h-64 w-full flex-shrink-0 bg-stone-100">
          <img src={bundle.img} alt={bundle.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent flex items-end p-8">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-warm-500 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-sm mb-3">
                Save 20%
              </span>
              <h2 className="text-white text-3xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {bundle.name}
              </h2>
              <div className="flex items-end gap-3 text-white">
                <span className="text-2xl font-semibold">Rp {bundle.price.toLocaleString('id-ID')}</span>
                <span className="text-stone-300 text-base line-through mb-1">Rp {bundle.originalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body (Items List) */}
        <div className="p-8 overflow-y-auto flex-1">
          <h3 className="text-stone-900 font-semibold mb-4 flex items-center gap-2">
            What's Included <span className="text-stone-400 text-xs font-normal">({bundle.bundleItems?.length} items)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bundle.bundleItems?.map(item => (
              <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-stone-100 bg-stone-50/50">
                <div className="w-20 h-20 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-stone-100">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-stone-900 text-sm font-semibold mb-0.5 leading-snug">{item.name}</p>
                  <p className="text-stone-500 text-xs mb-2">{item.category} · {item.colors?.[0] || 'Default'}</p>
                  <p className="text-stone-400 text-xs line-through">Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer (Action) */}
        <div className="p-6 border-t border-stone-100 bg-white flex-shrink-0 flex items-center justify-between">
          <p className="text-stone-500 text-sm hidden sm:block">
            Furnish your space effortlessly with a single click.
          </p>
          <button
            onClick={handleAdd}
            className="w-full sm:w-auto bg-stone-900 text-white px-8 py-3.5 rounded-xl font-semibold tracking-wide hover:bg-stone-800 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Add Bundle to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
