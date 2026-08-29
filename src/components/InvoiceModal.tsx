import React from 'react'

interface InvoiceModalProps {
  open: boolean
  onClose: () => void
  order: any
}

export default function InvoiceModal({ open, onClose, order }: InvoiceModalProps) {
  if (!open || !order) return null

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice');
    if (!printContent) return;
    
    // Create a temporary iframe for printing to avoid layout issues
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;
    
    // Copy all current stylesheets (Tailwind + custom fonts)
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    let styleHtml = '';
    styles.forEach(s => styleHtml += s.outerHTML);
    
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>Invoice ${order.id}</title>
          ${styleHtml}
          <style>
            @media print {
              @page { margin: 0; }
              body { padding: 40px; margin: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();
    
    // Wait for styles/fonts to load, then print
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    }, 500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop (hidden when printing) */}
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm print:hidden" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:w-full print:absolute print:inset-0 print:p-0">
        
        {/* Header Actions (hidden when printing) */}
        <div className="sticky top-0 bg-white border-b border-stone-100 px-7 py-4 flex items-center justify-between z-10 print:hidden">
          <h2 className="text-stone-900 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Invoice {order.id}</h2>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-stone-900 text-white text-xs px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors font-medium"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <path d="M6 14h12v8H6z"/>
              </svg>
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Invoice Content (This is what gets printed) */}
        <div id="printable-invoice" className="p-10 bg-white">
          <div className="flex items-start justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-stone-900 rounded-sm flex items-center justify-center print:-mt-1">
                  <span className="text-stone-50 text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>L</span>
                </div>
                <span className="text-stone-900 text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Lumière</span>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed max-w-[200px]">
                Grand Lumière Boulevard<br/>
                Jakarta Selatan<br/>
                DKI Jakarta, Indonesia
              </p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-stone-900 mb-2 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>Invoice</h1>
              <p className="text-stone-500 text-sm font-mono mb-1">{order.id}</p>
              <p className="text-stone-400 text-xs">Date: {order.date}</p>
            </div>
          </div>

          <div className="flex justify-between mb-10 pb-8 border-b border-stone-100">
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-2">Billed To</p>
              <p className="text-stone-900 font-medium text-sm mb-1">{order.customer || 'Customer Name'}</p>
              <p className="text-stone-500 text-xs max-w-[250px] leading-relaxed">
                {order.address || 'Address not provided'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-2">Payment Info</p>
              <p className="text-stone-900 font-medium text-sm mb-1">{order.method || 'Credit Card'}</p>
              <p className="text-stone-500 text-xs">Status: <span className="font-semibold text-stone-700">{order.status}</span></p>
            </div>
          </div>

          <table className="w-full text-left mb-10">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="pb-3 text-xs uppercase tracking-widest text-stone-400 font-semibold">Item</th>
                <th className="pb-3 text-xs uppercase tracking-widest text-stone-400 font-semibold text-center w-24">Qty</th>
                <th className="pb-3 text-xs uppercase tracking-widest text-stone-400 font-semibold text-right w-32">Price</th>
                <th className="pb-3 text-xs uppercase tracking-widest text-stone-400 font-semibold text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(order.items || order.itemDetails || []).map((item: any, i: number) => {
                const itemName = item.product?.name || item.productName || item.name || 'Furniture Item'
                const itemColor = item.color || item.selectedColor || 'Default'
                const itemQty = item.qty || 1
                const productPrice = item.product?.originalPrice
                  ? Math.round((item.product.originalPrice * (1 - (item.product.discount || 0) / 100)) / 1000) * 1000
                  : item.price || Math.round(order.total / Math.max(1, (order.items?.length || 1)))

                return (
                  <tr key={i}>
                    <td className="py-4">
                      <p className="text-stone-900 font-medium text-sm">{itemName}</p>
                      <p className="text-stone-400 text-xs mt-0.5">Color: {itemColor}</p>
                    </td>
                    <td className="py-4 text-stone-600 text-sm text-center">{itemQty}</td>
                    <td className="py-4 text-stone-600 text-sm text-right">Rp {productPrice.toLocaleString('id-ID')}</td>
                    <td className="py-4 text-stone-900 font-medium text-sm text-right">Rp {(productPrice * itemQty).toLocaleString('id-ID')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Subtotal</span>
                <span>Rp {order.total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600 pb-3 border-b border-stone-200">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-stone-900 pt-1">
                <span>Total</span>
                <span>Rp {order.total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-stone-100 text-center">
            <p className="text-stone-400 text-xs">Thank you for shopping with Lumière.</p>
            <p className="text-stone-400 text-xs mt-1">If you have any questions concerning this invoice, please contact nurainsalimah1@gmail.com.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
