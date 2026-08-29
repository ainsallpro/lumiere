import React from 'react'

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse flex flex-col">
      {/* Image box shimmer */}
      <div className="w-full aspect-square bg-stone-200/70 relative">
        <div className="absolute top-3 left-3 w-12 h-5 bg-stone-300 rounded-full" />
      </div>
      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="w-16 h-3 bg-stone-200 rounded mb-2" />
          <div className="w-3/4 h-4 bg-stone-300 rounded mb-2" />
          <div className="w-1/2 h-3 bg-stone-200 rounded" />
        </div>
        <div className="mt-4 flex items-center justify-between pt-2 border-t border-stone-50">
          <div className="w-20 h-4 bg-stone-300 rounded" />
          <div className="w-8 h-8 rounded-full bg-stone-200" />
        </div>
      </div>
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-100/60 px-5 py-4 border-b border-stone-100">
        <div>
          <div className="w-12 h-2.5 bg-stone-200 rounded mb-2" />
          <div className="w-24 h-4 bg-stone-300 rounded" />
        </div>
        <div>
          <div className="w-16 h-2.5 bg-stone-200 rounded mb-2" />
          <div className="w-20 h-4 bg-stone-300 rounded" />
        </div>
        <div>
          <div className="w-14 h-2.5 bg-stone-200 rounded mb-2" />
          <div className="w-20 h-4 bg-stone-300 rounded" />
        </div>
        <div>
          <div className="w-16 h-2.5 bg-stone-200 rounded mb-2" />
          <div className="w-20 h-4 bg-stone-300 rounded" />
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-stone-200 rounded-lg" />
          <div className="space-y-1.5 flex-1">
            <div className="w-1/3 h-3.5 bg-stone-300 rounded" />
            <div className="w-1/4 h-2.5 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
