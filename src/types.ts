export interface Product {
  id: number
  name: string
  category: 'Sofa' | 'Chair' | 'Table' | 'Bundle'
  subcategory: string
  price: number
  originalPrice: number
  discount: number
  rating: number
  reviews: number
  img: string
  gallery?: string[]
  tabs: ('latest' | 'bestseller' | 'featured')[]
  hasTimer?: boolean
  colors: string[]
  material: string
  inStock: boolean
  room: string
  bundleItems?: Product[]
}

export interface CartItem {
  product: Product
  qty: number
  selectedColor: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  phone?: string
  isAdmin?: boolean
}
