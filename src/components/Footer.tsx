import type { Page } from '../App'

interface FooterProps {
  navigate: (page: Page, preFilter?: import('../App').ShopPreFilter) => void
}

export default function Footer({ navigate }: FooterProps) {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-stone-50 rounded-sm flex items-center justify-center">
                <span className="text-stone-900 text-xs font-bold" style={{ fontFamily: 'var(--font-display)' }}>L</span>
              </div>
              <span className="text-stone-50 text-lg" style={{ fontFamily: 'var(--font-display)' }}>Lumière</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              Crafting spaces that tell your story. Every piece is selected for beauty, durability, and timeless design.
            </p>
            <div className="flex gap-3 mt-6">
              {['instagram', 'pinterest', 'facebook'].map(s => (
                <a key={s} href="#" className="w-8 h-8 border border-stone-700 rounded-sm flex items-center justify-center hover:border-stone-400 hover:text-stone-100 transition-colors text-xs uppercase tracking-widest">
                  {s[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-stone-100 text-xs tracking-widest uppercase mb-5 font-medium">Navigate</h4>
            <ul className="space-y-3">
              {(['home', 'shop', 'categories', 'about', 'contact'] as Page[]).map(p => (
                <li key={p}>
                  <button onClick={() => navigate(p)} className="text-sm text-stone-400 hover:text-stone-100 transition-colors capitalize">
                    {p === 'about' ? 'About Us' : p === 'contact' ? 'Contact Us' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-stone-100 text-xs tracking-widest uppercase mb-5 font-medium">Support</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              {['Shipping Policy', 'Returns & Exchanges', 'Care Instructions', 'Assembly Guides', 'FAQs'].map(l => (
                <li key={l}><a href="#" className="hover:text-stone-100 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-stone-100 text-xs tracking-widest uppercase mb-5 font-medium">Newsletter</h4>
            <p className="text-sm text-stone-400 mb-4">New arrivals, exclusive offers, and interior inspiration.</p>
            <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-stone-800 border border-stone-700 text-stone-100 text-sm px-3 py-2 rounded-sm placeholder:text-stone-600 focus:outline-none focus:border-stone-500"
              />
              <button className="bg-stone-100 text-stone-900 text-sm px-3 py-2 rounded-sm hover:bg-white transition-colors font-medium">
                →
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-600">
          <span>© 2026 Lumière Furniture. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-stone-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-stone-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-stone-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
