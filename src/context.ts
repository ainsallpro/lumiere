import { createContext, useContext } from 'react'
import type { Product } from './types'

// Primary Products Context (provides the product list array for zero breaking changes)
export const ProductsContext = createContext<Product[]>([])

// Products Refresh Context (allows Admin or other components to trigger a real-time re-fetch)
export const ProductsRefreshContext = createContext<() => Promise<void>>(async () => {})

// Custom hook to access product list
export function useProducts(): Product[] {
  return useContext(ProductsContext)
}

// Custom hook to trigger product list re-fetch across the app
export function useRefreshProducts(): () => Promise<void> {
  return useContext(ProductsRefreshContext)
}
