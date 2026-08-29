import { useState } from 'react'

const faqs = [
  { q: 'How long does delivery take?', a: 'Standard delivery is 4-8 weeks from order confirmation. Rush delivery (2-3 weeks) is available on select items for an additional fee.' },
  { q: 'Do you offer assembly?', a: 'Yes - white glove delivery and professional assembly is included on all orders over Rp 10.000.000. For smaller orders, assembly is Rp 1.200.000 flat.' },
  { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery for items in original condition. Custom orders are final sale.' },
  { q: 'Can I request custom dimensions?', a: "Most pieces can be customized to your specifications - finish, fabric, and dimensions. Speak with a consultant to discuss options." },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <p className="text-warm-600 text-xs tracking-[0.25em] uppercase mb-2 font-medium">Get in Touch</p>
          <h1 className="text-stone-900 text-5xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>Contact Us</h1>
          <p className="text-stone-500 text-base max-w-md">
            Whether you have a question, need design advice, or want to book a showroom visit - we'd love to hear from you.
          </p>
        </div>
      </div>

      {/* Contact form + info */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="text-stone-900 text-2xl mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Send a message
            </h2>

            {submitted ? (
              <div className="bg-warm-50 border border-warm-200 rounded-sm p-8 text-center">
                <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-warm-600 text-xl">✓</span>
                </div>
                <h3 className="text-stone-900 text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>Message received</h3>
                <p className="text-stone-500 text-sm">We'll get back to you within 24 hours. Thank you, {form.name}.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-xs text-stone-400 hover:text-stone-700 transition-colors">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Full Name *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full border border-stone-300 text-stone-900 text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-stone-600 bg-white placeholder:text-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full border border-stone-300 text-stone-900 text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-stone-600 bg-white placeholder:text-stone-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Subject</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-stone-300 text-stone-700 text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-stone-600 bg-white"
                  >
                    <option value="">Select a topic</option>
                    <option>Product Enquiry</option>
                    <option>Custom Order</option>
                    <option>Delivery & Shipping</option>
                    <option>Returns & Warranty</option>
                    <option>Showroom Appointment</option>
                    <option>Trade & Wholesale</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us how we can help..."
                    className="w-full border border-stone-300 text-stone-900 text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-stone-600 bg-white placeholder:text-stone-300 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-stone-900 text-white px-10 py-3.5 text-sm tracking-wide hover:bg-stone-800 transition-colors rounded-sm font-medium"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-stone-900 text-2xl mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                Contact details
              </h2>
              <div className="space-y-5">
                {[
                  {
                    icon: (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                    ),
                    label: 'Email',
                    val: 'nurainsalimah1@gmail.com',
                  },
                  {
                    icon: (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    ),
                    label: 'Phone',
                    val: '+62 21 8899 7700',
                  },
                  {
                    icon: (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    ),
                    label: 'Store Hours',
                    val: 'Mon - Sat 09:00-18:00, Sun 10:00-16:00',
                  },
                  {
                    icon: (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    ),
                    label: 'Address',
                    val: 'Grand Lumière Boulevard, Jakarta, Indonesia',
                  },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="flex gap-4 items-start">
                    <span className="text-warm-500 w-5 flex-shrink-0 mt-0.5">{icon}</span>
                    <div>
                      <p className="text-stone-400 text-xs tracking-widest uppercase mb-0.5">{label}</p>
                      <p className="text-stone-700 text-sm">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Book appointment */}
            <div className="bg-stone-900 rounded-sm p-6 text-white">
              <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Book a showroom visit
              </h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-4">
                Experience the collection in person with a private appointment. Bring your floor plan - we'll help you design the room.
              </p>
              <button className="w-full bg-white text-stone-900 py-2.5 text-sm font-medium rounded-sm hover:bg-stone-100 transition-colors">
                Request Appointment
              </button>
            </div>

            {/* Social links */}
            <div>
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { name: 'Instagram', handle: '@lumierefurniture' },
                  { name: 'Pinterest', handle: '@lumierefurniture' },
                ].map(s => (
                  <a key={s.name} href="#" className="border border-stone-200 text-stone-600 text-xs px-3 py-2 rounded-sm hover:border-stone-400 hover:text-stone-900 transition-colors">
                    {s.handle}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store location + map */}
      <section className="bg-stone-100 border-t border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="mb-10">
            <p className="text-warm-600 text-xs tracking-[0.25em] uppercase mb-2 font-medium">Visit Us</p>
            <h2 className="text-stone-900 text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
              Our Showroom
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Store info card */}
            <div className="lg:col-span-2 bg-white rounded-sm border border-stone-200 p-7 space-y-5">
              <div>
                <h3 className="text-stone-900 text-2xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  Lumière Furniture
                </h3>
                <p className="text-warm-600 text-xs tracking-[0.2em] uppercase font-medium">Main Showroom</p>
              </div>

              <div className="space-y-4 text-sm text-stone-500">
                <div className="flex gap-3 items-start">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-warm-500 mt-0.5 flex-shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <p className="text-stone-700 font-medium">Grand Lumière Boulevard</p>
                    <p>Jakarta Selatan, DKI Jakarta</p>
                    <p>Indonesia</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-warm-500 mt-0.5 flex-shrink-0">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <div>
                    <p className="text-stone-700 font-medium">Store Hours</p>
                    <p>Mon - Sat: 09:00-18:00</p>
                    <p>Sunday: 10:00-16:00</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-warm-500 mt-0.5 flex-shrink-0">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <div>
                    <p className="text-stone-700 font-medium">Phone</p>
                    <p>+62 21 8899 7700</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-warm-500 mt-0.5 flex-shrink-0">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <div>
                    <p className="text-stone-700 font-medium">Email</p>
                    <p>nurainsalimah1@gmail.com</p>
                  </div>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Jakarta,+Indonesia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-medium text-stone-900 border border-stone-300 px-4 py-2.5 rounded-sm hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all w-full justify-center mt-2"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Open in Google Maps
              </a>
            </div>

            {/* Embedded map */}
            <div className="lg:col-span-3 rounded-sm overflow-hidden border border-stone-200 shadow-sm" style={{ height: '420px' }}>
              <iframe
                title="Lumière Furniture Showroom Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9551297631!2d107.6044!3d-6.9597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e9adf177bf8d%3A0x437398c4a9e3a5f2!2sManjahlega%2C%20Kec.%20Rancasari%2C%20Kota%20Bandung%2C%20Jawa%20Barat!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 lg:px-12 py-16 border-t border-stone-200">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px w-8 bg-warm-400" />
            <p className="text-warm-600 text-xs tracking-[0.25em] uppercase font-medium">Help</p>
            <div className="h-px w-8 bg-warm-400" />
          </div>
          <h2 className="text-stone-900 text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Frequently Asked
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i
            return (
              <div
                key={i}
                onClick={() => setOpenFaq(isOpen ? null : i)}
                className={`border rounded-xl cursor-pointer transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-stone-900 bg-stone-900'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between p-5 lg:px-8 lg:py-6">
                  <h4 className={`text-base font-semibold transition-colors ${isOpen ? 'text-white' : 'text-stone-900'}`}>
                    {faq.q}
                  </h4>
                  <span className={`text-xl flex-shrink-0 transition-transform duration-300 ${isOpen ? 'text-warm-400' : 'text-stone-400'}`}>
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
                <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-5 pb-5 lg:px-8 lg:pb-6 text-sm leading-relaxed text-stone-300">
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
