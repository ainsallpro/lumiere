import type { Product } from '../types'

// ── image pools ───────────────────────────────────────────────────────────────
const chairImgs = [
  '/images/products/product-1.jpg',
  '/images/products/product-2.jpg',
  '/images/products/product-3.jpg',
  '/images/products/product-4.jpg',
  '/images/products/product-5.jpg',
  '/images/products/product-6.jpg',
  '/images/products/product-7.jpg',
  '/images/products/product-8.jpg',
  '/images/products/product-9.jpg',
  '/images/products/product-10.jpg',
  '/images/products/product-11.jpg',
  '/images/products/product-12.jpg',
]

const sofaImgs = [
  '/images/products/product-13.jpg',
  '/images/products/product-14.jpg',
  '/images/products/product-15.jpg',
  '/images/products/product-16.jpg',
  '/images/products/product-17.jpg',
  '/images/products/product-18.jpg',
  '/images/products/product-19.jpg',
  '/images/products/product-20.jpg',
]

const tableImgs = [
  '/images/products/product-21.jpg',
  '/images/products/product-22.jpg',
  '/images/products/product-23.jpg',
  '/images/products/product-24.jpg',
  '/images/products/product-25.jpg',
  '/images/products/product-26.jpg',
  '/images/products/product-27.jpg',
  '/images/products/product-28.jpg',
  '/images/products/product-29.jpg',
  '/images/products/product-30.jpg',
]

const colors = ['Natural', 'Beige', 'White', 'Grey', 'Black', 'Brown', 'Walnut', 'Oak']
const chairMaterials = ['Wood', 'Upholstered', 'Fabric', 'Leather', 'Rattan', 'Metal']
const sofaMaterials = ['Fabric', 'Upholstered', 'Leather', 'Linen', 'Velvet']
const tableMaterials = ['Wood', 'Metal', 'Glass', 'Teak', 'Marble', 'Reclaimed Wood']

const chairSubs = ['Lounge Chair', 'Dining Chair', 'Armchair', 'Bar Stool', 'Accent Chair', 'Rocking Chair', 'Office Chair', 'Club Chair']
const sofaSubs  = ['Sectional Sofa', 'Reception Sofa', 'Curved Sofa', 'Armless Sofa', 'Loveseat', 'Sleeper Sofa']
const tableSubs = ['Dining Table', 'Coffee Table', 'Side Table', 'Console Table', 'Desk', 'Nightstand', 'Bedside Table']

const chairNames = [
  'Solano Lounge Chair', 'Nordic Side Chair', 'Walnut Accent Chair', 'Ash Rocking Chair', 'Linen Club Chair',
  'Beech Bar Stool', 'Woven Wicker Chair', 'Tufted Wingback', 'Velvet Armchair', 'Bentwood Bistro Chair',
  'Leather Swivel Chair', 'Canvas Sling Chair', 'Upholstered Dining Chair', 'Carved Oak Chair', 'Papasan Chair',
  'Barrel Accent Chair', 'Wishbone Chair', 'Tulip Pedestal Chair', 'Egg Shell Chair', 'Hairpin Leg Chair',
  'Rattan Peacock Chair', 'Brass Frame Chair', 'Danish Modern Chair', 'Saddle Leather Chair', 'Ghost Acrylic Chair',
  'Low Slung Lounge', 'Cane Back Chair', 'Sheepskin Chair', 'Folding Linen Chair', 'Swivel Accent Chair',
  'Cognac Club Chair', 'Natural Jute Chair', 'Studio Dining Chair', 'Rounded Back Chair', 'Moulded Plywood Chair',
  'Buttoned Ottoman Chair', 'Slim Oak Stool', 'Curved Shell Chair', 'Wicker Bucket Chair', 'Mid-Century Arm Chair',
  'Boucle Accent Chair', 'Suede Bergère Chair', 'Petal Chair', 'Saarinen Tulip Chair', 'Arc Rocking Chair',
]

const sofaNames = [
  'Haven Three-Seat Sofa', 'Nordic Cloud Sofa', 'Linen Curved Sofa', 'Ivory Sectional Sofa', 'Velvet Two-Seat Sofa',
  'Studio Compact Sofa', 'Boucle Loveseat', 'Modular Corner Sofa', 'Oak Frame Sofa', 'Feather-Fill Sofa',
  'Tufted Chesterfield', 'Slouchy Deep Sofa', 'Camel Leather Sofa', 'Pearl White Sofa', 'Denim Blue Sofa',
  'Oyster Velvet Sofa', 'Reclaimed Wood Sofa', 'Slim Arm Sofa', 'L-Shape Family Sofa', 'Minimal Steel Sofa',
  'Sage Green Sofa', 'Cream Bouclé Sofa', 'Dark Walnut Sofa', 'Herringbone Sofa', 'Oversized Sectional',
  'Tokyo Low Sofa', 'Convertible Sleeper Sofa', 'Florence Knoll Sofa', 'Chaise Longue Sofa', 'Arc Sofa',
]

const tableNames = [
  'Aria Oak Dining Table', 'Teak Coffee Table', 'Walnut Side Table', 'Pine Farmhouse Table', 'Study Writing Desk',
  'Round Bistro Table', 'Glass Top Console', 'Marble Coffee Table', 'Industrial Steel Desk', 'Reclaimed Teak Table',
  'Oval Dining Table', 'Slim Console Table', 'Lift-Top Coffee Table', 'Nesting Side Tables', 'Extendable Dining Table',
  'Herringbone Dining Table', 'Bedside Nightstand', 'Floating Shelf Desk', 'Drum Side Table', 'X-Frame Dining Table',
  'Two-Drawer Nightstand', 'Hairpin Coffee Table', 'Slab Wood Table', 'Painted Farmhouse Desk', 'Pedestal Side Table',
]

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length] }
function rand(min: number, max: number, seed: number): number {
  return Math.round(min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min))
}
function pickMultiple<T>(arr: T[], seed: number, min: number, max: number): T[] {
  const count = rand(min, max, seed)
  const result: T[] = []
  for (let i = 0; i < count; i++) {
    result.push(arr[(seed + i * 7) % arr.length])
  }
  return Array.from(new Set(result))
}

function makeProduct(
  id: number,
  name: string,
  category: 'Sofa' | 'Chair' | 'Table',
  subIndex: number,
  imgPool: string[],
  materialPool: string[],
  subPool: string[],
  seed: number,
): Product {
  const basePrice = Math.round((category === 'Sofa' ? rand(5000000, 45000000, seed)
    : category === 'Chair' ? rand(2000000, 18000000, seed)
    : rand(3500000, 30000000, seed)) / 50000) * 50000
  const discount = [10, 15, 20, 25, 29, 30, 35, 40, 50][seed % 9]
  const originalPrice = Math.round(basePrice / (1 - discount / 100) / 50000) * 50000
  const tabs: Product['tabs'] = []
  if (seed % 3 === 0) tabs.push('latest')
  if (seed % 4 === 0) tabs.push('bestseller')
  if (seed % 5 === 0) tabs.push('featured')
  if (tabs.length === 0) tabs.push('latest')

  return {
    id,
    name,
    category,
    subcategory: pick(subPool, subIndex),
    price: basePrice,
    originalPrice,
    discount,
    rating: Math.round((4.4 + (seed % 6) * 0.1) * 10) / 10,
    reviews: 3 + (id % 3),
    img: pick(imgPool, seed),
    tabs,
    hasTimer: seed % 6 === 0,
    colors: pickMultiple(colors, seed + 2, 1, 4),
    material: pick(materialPool, seed + 3),
    inStock: seed % 8 !== 0,
    room: category === 'Sofa' ? 'Living Room'
      : category === 'Chair' ? pick(['Living Room', 'Bedroom', 'Office', 'Dining Room', 'Outdoor'], seed)
      : pick(['Living Room', 'Bedroom', 'Office', 'Dining Room'], seed + 1),
  } as Product
}

export const products: Product[] = [
  // ── CHAIRS (45) ──────────────────────────────────────────────────────────────
  ...chairNames.map((name, i) => makeProduct(i + 1, name, 'Chair', i, chairImgs, chairMaterials, chairSubs, i + 1)),

  // ── SOFAS (30) ───────────────────────────────────────────────────────────────
  ...sofaNames.map((name, i) => makeProduct(i + 46, name, 'Sofa', i, sofaImgs, sofaMaterials, sofaSubs, i + 5)),

  // ── TABLES (25) ──────────────────────────────────────────────────────────────
  ...tableNames.map((name, i) => makeProduct(i + 76, name, 'Table', i, tableImgs, tableMaterials, tableSubs, i + 3)),
]
