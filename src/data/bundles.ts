import type { Product } from '../types'
import { products } from './products'

// Helper to grab specific items for a bundle
function getBundleItems(room: string, count: number, startIdx: number = 0): Product[] {
  return products.filter(p => p.room === room).slice(startIdx, startIdx + count)
}

function createBundleProduct(
  id: number,
  name: string,
  room: string,
  itemCount: number,
  startIdx: number,
  img: string
): Product {
  const items = getBundleItems(room === 'Dining' ? 'Dining Room' : room === 'Seating' ? 'Living Room' : room, itemCount, startIdx)
  
  const originalPrice = items.reduce((sum, item) => sum + item.price, 0)
  // 20% bundle discount
  const price = Math.round((originalPrice * 0.8) / 10000) * 10000

  return {
    id: 1000 + id, // Special ID range for bundles
    name,
    category: 'Bundle',
    subcategory: 'Complete Room Package',
    price,
    originalPrice,
    discount: 20,
    rating: 5.0,
    reviews: 3 + (id % 3),
    img,
    tabs: ['featured'],
    colors: ['Mixed'],
    material: 'Mixed',
    inStock: true,
    room,
    bundleItems: items
  }
}

export const bundles: Product[] = [
  createBundleProduct(1, 'Living Room Set', 'Living Room', 5, 0, '/images/categories/category-1.jpg'),
  createBundleProduct(2, 'Bedroom Suite', 'Bedroom', 4, 0, '/images/categories/category-2.jpg'),
  createBundleProduct(3, 'Dining Bundle', 'Dining', 6, 0, '/images/categories/category-3.jpg'),
  createBundleProduct(4, 'Home Office', 'Seating', 4, 5, '/images/categories/category-4.jpg'),
]
