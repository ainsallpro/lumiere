import { useState } from 'react'

export interface AuthUser {
  id: number
  name: string
  email: string
  isAdmin?: boolean
}

const ADMIN_EMAIL    = 'admin@lumiere.com'
const ADMIN_PASSWORD = 'admin123'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onAuth: (user: AuthUser) => void
}

type Tab = 'login' | 'register'

export default function AuthModal({ open, onClose, onAuth }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>('login')

  // login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regError, setRegError] = useState('')
  const [showLoginPw, setShowLoginPw] = useState(false)
  const [showRegPw, setShowRegPw] = useState(false)

  if (!open) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!loginEmail || !loginPassword) { setLoginError('Please fill in all fields.'); return }
    if (loginPassword.length < 6) { setLoginError('Password must be at least 6 characters.'); return }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      if (data.token) localStorage.setItem('lumiere_token', data.token)
      onAuth(data.user)
      onClose()
    } catch (err: any) {
      setLoginError(err.message)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    if (!regName || !regEmail || !regPassword || !regConfirm) { setRegError('Please fill in all fields.'); return }
    if (regPassword.length < 6) { setRegError('Password must be at least 6 characters.'); return }
    if (regPassword !== regConfirm) { setRegError("Passwords don't match."); return }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName.trim(), email: regEmail, password: regPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      if (data.token) localStorage.setItem('lumiere_token', data.token)
      onAuth(data.user)
      onClose()
    } catch (err: any) {
      setRegError(err.message)
    }
  }

  const EyeIcon = ({ show }: { show: boolean }) => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      {show
        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M1 1l22 22"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors z-10"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 bg-stone-900 rounded-sm flex items-center justify-center">
              <span className="text-stone-50 text-xs font-bold" style={{ fontFamily: 'var(--font-display)' }}>L</span>
            </div>
            <span className="text-stone-900 text-lg" style={{ fontFamily: 'var(--font-display)' }}>Lumière</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setLoginError(''); setRegError('') }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  tab === t
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
        </div>

        <div className="px-8 py-7">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <p className="text-stone-900 text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>Welcome back</p>
                <p className="text-stone-400 text-xs">Sign in to access your account and orders.</p>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50 placeholder:text-stone-300"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs tracking-widest uppercase text-stone-500">Password</label>
                    <button type="button" className="text-xs text-warm-600 hover:text-warm-700 transition-colors">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPw ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50 placeholder:text-stone-300 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <EyeIcon show={showLoginPw} />
                    </button>
                  </div>
                </div>
              </div>

              {loginError && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-stone-900 text-white py-3 rounded-lg text-sm font-semibold tracking-wide hover:bg-stone-800 transition-colors mt-1"
              >
                Sign In
              </button>

              <p className="text-center text-xs text-stone-400">
                Don't have an account?{' '}
                <button type="button" onClick={() => setTab('register')} className="text-stone-700 font-medium hover:text-stone-900 transition-colors">
                  Create one
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <p className="text-stone-900 text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>Join Lumière</p>
                <p className="text-stone-400 text-xs">Create an account to track orders and save favourites.</p>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50 placeholder:text-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50 placeholder:text-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showRegPw ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50 placeholder:text-stone-300 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPw(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <EyeIcon show={showRegPw} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={e => setRegConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-stone-200 text-stone-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-stone-500 bg-stone-50 placeholder:text-stone-300"
                  />
                </div>
              </div>

              {regError && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{regError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-stone-900 text-white py-3 rounded-lg text-sm font-semibold tracking-wide hover:bg-stone-800 transition-colors mt-1"
              >
                Create Account
              </button>

              <p className="text-center text-xs text-stone-400">
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('login')} className="text-stone-700 font-medium hover:text-stone-900 transition-colors">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
