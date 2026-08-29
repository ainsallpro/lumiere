import React, { useState } from 'react'
import type { Product } from '../types'
import { useToast } from '../context/ToastContext'

interface AddProductModalProps {
  onSave: (p: any) => void
  onClose: () => void
}

export default function AddProductModal({ onSave, onClose }: AddProductModalProps) {
  const toast = useToast()
  const [name, setName] = useState('')
  const [rawPrice, setRawPrice] = useState('') // stores string like '1000000'
  const [category, setCategory] = useState('Seating')
  const [room, setRoom] = useState('Living Room')
  const [material, setMaterial] = useState('Wood')
  const [colors, setColors] = useState<string[]>(['Oak'])
  const [newColor, setNewColor] = useState('')
  const [discount, setDiscount] = useState('0')
  const [images, setImages] = useState<string[]>([]) // up to 5 images
  const [inStock, setInStock] = useState(true)

  // Auto-format price with thousands separator
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digits
    const val = e.target.value.replace(/\D/g, '')
    setRawPrice(val)
  }

  // Display price formatted
  const displayPrice = rawPrice ? parseInt(rawPrice, 10).toLocaleString('id-ID') : ''

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    // Cap at 5 images total
    const remainingSlots = 5 - images.length
    const toProcess = files.slice(0, remainingSlots)

    toProcess.forEach(file => {
      const reader = new FileReader()
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setImages(prev => [...prev, evt.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddColor = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || !newColor.trim()) {
      return
    }
    e.preventDefault()
    if (!colors.includes(newColor.trim())) {
      setColors([...colors, newColor.trim()])
    }
    setNewColor('')
  }

  const handleSubmit = () => {
    if (!name || !rawPrice) return toast.error('Name and Price are required')
    
    // Rating and Reviews count are defaulted to 0 for a new product
    onSave({
      name,
      originalPrice: parseInt(rawPrice, 10),
      discount: parseInt(discount, 10) || 0,
      category,
      room,
      material,
      colors,
      rating: 0,
      reviews: 0,
      img: images[0] || '',
      gallery: images.slice(1),
      inStock
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
        <h3 className="text-stone-900 font-semibold text-base mb-5">Add New Product</h3>
        
        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="col-span-2">
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Woven Wicker Chair"
              className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50" 
            />
          </div>
          
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Price (Rp)</label>
            <input 
              type="text" 
              value={displayPrice} 
              onChange={handlePriceChange}
              placeholder="0"
              className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50" 
            />
          </div>
          
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Discount (%)</label>
            <input 
              type="number" 
              value={discount} 
              onChange={e => setDiscount(e.target.value)}
              placeholder="0"
              className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50" 
            />
          </div>
          
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50 appearance-none"
            >
              <option value="Seating">Seating</option>
              <option value="Tables">Tables</option>
              <option value="Beds">Beds</option>
              <option value="Storage">Storage</option>
              <option value="Lighting">Lighting</option>
            </select>
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Room</label>
            <select 
              value={room} 
              onChange={e => setRoom(e.target.value)}
              className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50 appearance-none"
            >
              <option value="Living Room">Living Room</option>
              <option value="Bedroom">Bedroom</option>
              <option value="Dining Room">Dining Room</option>
              <option value="Office">Office</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Material (Select or Type)</label>
            <input 
              list="materials-list"
              value={material} 
              onChange={e => setMaterial(e.target.value)}
              placeholder="e.g. Solid Oak"
              className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50" 
            />
            <datalist id="materials-list">
              <option value="Wood" />
              <option value="Fabric" />
              <option value="Metal" />
              <option value="Leather" />
              <option value="Glass" />
              <option value="Rattan" />
            </datalist>
          </div>

          <div className="col-span-2">
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Colors</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {colors.map(c => (
                <span key={c} className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  {c}
                  <button onClick={() => setColors(colors.filter(x => x !== c))} className="text-stone-400 hover:text-stone-800">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newColor} 
                onChange={e => setNewColor(e.target.value)}
                onKeyDown={handleAddColor}
                placeholder="Type new color and press Enter"
                className="flex-1 border border-stone-200 text-stone-900 text-sm px-4 py-2 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50" 
              />
              <button 
                onClick={handleAddColor} 
                className="bg-stone-900 text-white text-xs px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors font-medium"
              >
                Add
              </button>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Photos (Max 5)</label>
            {images.length < 5 && (
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleFileChange}
                className="w-full mb-3 text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" 
              />
            )}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-lg border border-stone-200 overflow-hidden group">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    &times;
                  </button>
                  {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-stone-900/80 text-white text-[10px] text-center py-0.5 font-medium">Main</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-3">
            <input 
              type="checkbox" 
              id="add-instock" 
              checked={inStock} 
              onChange={e => setInStock(e.target.checked)} 
              className="accent-stone-900 w-4 h-4 rounded border-stone-300" 
            />
            <label htmlFor="add-instock" className="text-sm text-stone-700 font-medium">In Stock immediately</label>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end border-t border-stone-100 pt-5">
          <button onClick={onClose} className="px-5 py-2.5 text-sm text-stone-600 border border-stone-200 rounded-xl hover:border-stone-400 transition-colors font-medium">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2.5 text-sm text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-colors font-semibold shadow-md">
            Add Product
          </button>
        </div>
      </div>
    </div>
  )
}
