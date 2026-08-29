import { useState } from 'react'
import type { Page, ShopPreFilter } from '../App'
import type { Product } from '../types'
import { ProductsContext } from '../context'
import { useContext } from 'react'
import { bundles } from '../data/bundles'
import BundleModal from '../components/BundleModal'

interface CategoriesPageProps {
  navigate: (page: Page, preFilter?: ShopPreFilter) => void
  addToCart: (product: Product, qty: number) => void
}

// mapping from category display name → ShopPreFilter
const CATEGORY_FILTERS: Record<string, ShopPreFilter> = {
  'Living Room': { rooms: ['Living Room'],  label: 'Living Room' },
  'Bedroom':     { rooms: ['Bedroom'],      label: 'Bedroom' },
  'Dining':      { rooms: ['Dining Room'],  label: 'Dining Room' },
  'Seating':     { categories: ['Chair'],   label: 'Seating & Chairs' },
  'Storage':     { categories: ['Table'],   label: 'Storage & Tables' },
}


const highlights = [
  { label: '500+', desc: 'Unique pieces' },
  { label: '12', desc: 'Collections per year' },
  { label: '40+', desc: 'Master craftspeople' },
  { label: '18', desc: 'Wood species used' },
]

export default function CategoriesPage({ navigate, addToCart }: CategoriesPageProps) {
  const products = useContext(ProductsContext)
  const [selectedBundle, setSelectedBundle] = useState<Product | null>(null)

  const categories = [
    {
      name: 'Living Room',
      count: products.filter(p => p.room === 'Living Room').length,
      description: 'Sofas, coffee tables, shelving, and accent pieces that define your main gathering space.',
      img: '/images/categories/category-1.jpg',
      featured: products.filter(p => p.room === 'Living Room').slice(0, 3).map(p => p.name),
      span: 'lg:col-span-2 lg:row-span-1',
      height: 'h-80 lg:h-96',
    },
    {
      name: 'Bedroom',
      count: products.filter(p => p.room === 'Bedroom').length,
      description: 'Beds, nightstands, wardrobes, and dressers crafted for rest and restoration.',
      img: '/images/categories/category-2.jpg',
      featured: products.filter(p => p.room === 'Bedroom').slice(0, 3).map(p => p.name),
      span: 'lg:col-span-1',
      height: 'h-80 lg:h-96',
    },
    {
      name: 'Dining',
      count: products.filter(p => p.room === 'Dining Room').length,
      description: 'Tables, chairs, and storage for shared meals and memorable evenings.',
      img: '/images/categories/category-3.jpg',
      featured: products.filter(p => p.room === 'Dining Room').slice(0, 3).map(p => p.name),
      span: 'lg:col-span-1',
      height: 'h-72',
    },
    {
      name: 'Seating',
      count: products.filter(p => p.category === 'Chair').length,
      description: 'Armchairs, accent chairs, ottomans, and benches - the art of sitting beautifully.',
      img: '/images/categories/category-4.jpg',
      featured: products.filter(p => p.category === 'Chair').slice(0, 3).map(p => p.name),
      span: 'lg:col-span-1',
      height: 'h-72',
    },
    {
      name: 'Storage',
      count: products.filter(p => p.category === 'Table').length,
      description: 'Bookshelves, cabinets, sideboards, and baskets - beautiful order.',
      img: '/images/categories/category-5.jpg',
      featured: products.filter(p => p.category === 'Table').slice(0, 3).map(p => p.name),
      span: 'lg:col-span-1',
      height: 'h-72',
    }
  ]

  const goToCategory = (name: string) => {
    navigate('shop', CATEGORY_FILTERS[name])
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <p className="text-warm-600 text-xs tracking-[0.25em] uppercase mb-2 font-medium">Browse</p>
          <h1 className="text-stone-900 text-5xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Categories
          </h1>
          <p className="text-stone-500 text-base max-w-lg">
            Every room deserves furniture that fits - explore by space and find pieces made for the way you live.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-stone-200 bg-stone-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 grid grid-cols-4 divide-x divide-stone-200">
          {highlights.map(({ label, desc }) => (
            <div key={desc} className="px-6 first:pl-0 text-center">
              <p className="text-stone-900 text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{label}</p>
              <p className="text-stone-500 text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => goToCategory(cat.name)}
              className={`relative group overflow-hidden rounded-sm text-left ${cat.span} ${cat.height} bg-stone-200`}
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between mb-2">
                  <h2 className="text-white text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {cat.name}
                  </h2>
                  <span className="text-stone-300 text-xs tracking-widest bg-white/10 px-2.5 py-1 rounded-sm">
                    {cat.count} pieces
                  </span>
                </div>
                <p className="text-stone-300 text-sm leading-relaxed mb-3 max-w-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block">
                  {cat.description}
                </p>
                <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex">
                  {cat.featured.map(item => (
                    <span key={item} className="text-[10px] tracking-wide bg-white/15 text-stone-200 px-2.5 py-1 rounded-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA pill - appears on hover */}
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                <span className="flex items-center gap-1.5 bg-white text-stone-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                  Shop {cat.name}
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Curated section */}
      <section className="bg-warm-50 border-t border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-warm-600 text-xs tracking-[0.25em] uppercase mb-3 font-medium">Curated Sets</p>
              <h2 className="text-stone-900 text-4xl mb-5" style={{ fontFamily: 'var(--font-display)' }}>
                Complete Room<br />
                <em>Packages</em>
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 max-w-sm">
                Save up to 20% when you furnish an entire room. Every set is designed to work together - harmonious, effortless, complete.
              </p>
              <button
                onClick={() => navigate('shop')}
                className="bg-stone-900 text-white px-8 py-3 text-sm tracking-wide hover:bg-stone-800 transition-colors rounded-sm"
              >
                Explore All Products
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {bundles.map(bundle => (
                <button
                  key={bundle.id}
                  onClick={() => setSelectedBundle(bundle)}
                  className="bg-white border border-stone-200 rounded-sm p-5 text-left hover:border-stone-400 hover:shadow-sm transition-all group"
                >
                  <p className="text-stone-400 text-[10px] tracking-widest uppercase mb-1">{bundle.bundleItems?.length} pieces</p>
                  <h4 className="text-stone-900 text-sm font-semibold mb-1 group-hover:text-warm-700 transition-colors">{bundle.name}</h4>
                  <p className="text-warm-600 text-sm font-medium">Rp {bundle.price.toLocaleString('id-ID')}</p>
                  <p className="text-stone-400 text-[10px] mt-2 flex items-center gap-1 group-hover:text-stone-600 transition-colors">
                    View Package Details →
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BundleModal
        open={!!selectedBundle}
        onClose={() => setSelectedBundle(null)}
        bundle={selectedBundle}
        addToCart={addToCart}
      />

      {/* Instagram strip */}
      <section className="py-16 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-stone-900 text-2xl mb-8" style={{ fontFamily: 'var(--font-display)' }}>
            What our customers have created
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              '/images/categories/category-6.jpg',
              '/images/categories/category-7.jpg',
              '/images/categories/category-8.jpg',
              '/images/categories/category-9.jpg',
            ].map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-sm bg-stone-100">
                <img src={src} alt="Customer interior" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
          <p className="text-stone-400 text-xs mt-3 text-center tracking-wide">
            Share your space - tag us <span className="text-stone-700">@lumierefurniture</span>
          </p>
        </div>
      </section>
    </div>
  )
}
