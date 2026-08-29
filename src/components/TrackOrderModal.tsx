interface TrackItem {
  img: string
  name: string
  color: string
  qty: number
}

interface TrackOrderModalProps {
  open: boolean
  onClose: () => void
  orderId: string
  activeStep: number // 0=Placed, 1=Accepted, 2=InProgress, 3=OnTheWay, 4=Delivered
  items: TrackItem[]
  placedDate: string
}

const STEPS = [
  {
    label: 'Order Placed',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    label: 'Accepted',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
  {
    label: 'In Progress',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <path d="M12 22V12M3.27 6.96 12 12.01l8.73-5.05"/>
      </svg>
    ),
  },
  {
    label: 'On the Way',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    label: 'Delivered',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4"/>
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
      </svg>
    ),
  },
]

function stepDate(placedDate: string, step: number, activeStep: number): string {
  // parse "12 August 2026" style dates
  const base = new Date(placedDate)
  if (isNaN(base.getTime())) {
    // fallback
    const now = new Date()
    base.setTime(now.getTime())
  }
  const offsets = [0, 0, 1, 2, 4] // days after placed
  const d = new Date(base)
  d.setDate(d.getDate() + offsets[step])
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const label = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`

  if (step === 0) return `${label}\n11:00 AM`
  if (step === 1 && activeStep >= 1) return `${label}\n11:15 AM`
  if (step <= activeStep) return label
  return `Expected\n${label}`
}

export default function TrackOrderModal({ open, onClose, orderId, activeStep, items, placedDate }: TrackOrderModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-7 pb-5 border-b border-stone-100">
          <div>
            <h2 className="text-stone-900 text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              Order Status
            </h2>
            <p className="text-stone-400 text-sm mt-0.5">Order ID : <span className="text-stone-600 font-medium">{orderId}</span></p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="px-7 py-6 space-y-6">
          {/* ── Progress tracker ── */}
          <div className="bg-stone-50 border border-stone-100 rounded-xl px-6 py-7">
            <div className="relative flex items-start justify-between">

              {/* connecting line behind icons */}
              <div className="absolute top-[22px] left-[calc(10%+14px)] right-[calc(10%+14px)] h-[2px] bg-stone-200 z-0" />
              {/* filled portion */}
              <div
                className="absolute top-[22px] left-[calc(10%+14px)] h-[2px] bg-stone-900 z-0 transition-all duration-500"
                style={{ width: `calc((${activeStep} / 4) * (100% - 28px - 20%))` }}
              />

              {STEPS.map((step, i) => {
                const done = i <= activeStep
                const dateStr = stepDate(placedDate, i, activeStep)
                const [dateLine, timeLine] = dateStr.split('\n')
                return (
                  <div key={step.label} className="relative z-10 flex flex-col items-center flex-1">
                    {/* icon */}
                    <div className={`mb-2 transition-colors ${done ? 'text-stone-900' : 'text-stone-300'}`}>
                      {step.icon}
                    </div>
                    <p className={`text-xs font-medium mb-3 text-center leading-tight ${done ? 'text-stone-900' : 'text-stone-400'}`}>
                      {step.label}
                    </p>
                    {/* circle */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      done
                        ? 'bg-stone-900 border-stone-900'
                        : 'bg-white border-stone-200'
                    }`}>
                      <svg width="12" height="12" fill="none" stroke={done ? 'white' : '#d4d4d4'} strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    </div>
                    {/* date */}
                    <div className="mt-3 text-center">
                      <p className={`text-xs leading-snug ${done ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>{dateLine}</p>
                      {timeLine && <p className={`text-xs ${done ? 'text-stone-500' : 'text-stone-300'}`}>{timeLine}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Products ── */}
          <div className="bg-white border border-stone-100 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h3 className="text-stone-900 font-semibold text-sm">Products</h3>
            </div>
            <div className="divide-y divide-stone-100">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-14 h-14 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-stone-900 text-sm font-semibold">{item.name}</p>
                    <p className="text-stone-400 text-xs mt-0.5">Color : {item.color} | {item.qty} Qty.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
