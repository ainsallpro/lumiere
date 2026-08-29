import { useState } from 'react'
import type { Page } from '../App'
import type { AuthUser } from '../types'
import GoogleAuthButton from '../components/GoogleAuthButton'

interface Props {
  navigate: (page: Page) => void
  onAuth: (user: AuthUser) => void
}

export default function RegisterPage({ navigate, onAuth }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (!agreed) { setError('You must agree to the Terms & Condition.'); return }
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Save JWT token to localStorage
      if (data.token) {
        localStorage.setItem('lumiere_token', data.token);
      }
      onAuth(data.user);
    } catch (err: any) {
      setError(err.message);
    }
  }

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )

  const EyeIcon = ({ show }: { show: boolean }) => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      {show
        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M1 1l22 22"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  )

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative py-12">
        
        {/* Back / Logo Area */}
        <div className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32 flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
          <div className="w-8 h-8 rounded-sm bg-stone-900 flex items-center justify-center text-white font-bold" style={{ fontFamily: 'var(--font-display)' }}>L</div>
          <span className="text-xl font-bold tracking-tight text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>Lumière<span className="text-[#e29b47]">.</span></span>
        </div>

        <div className="max-w-md w-full mx-auto mt-12">
          <h1 className="text-4xl font-semibold text-stone-900 mb-2">Sign Up</h1>
          <p className="text-stone-500 mb-8">Fill your information below or register with your social account.</p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-stone-700 font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter Full Name"
                className="w-full border border-stone-200 text-stone-900 px-4 py-3.5 rounded-xl focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-shadow placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter Email Address"
                className="w-full border border-stone-200 text-stone-900 px-4 py-3.5 rounded-xl focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-shadow placeholder:text-stone-400"
              />
            </div>
            
            <div>
              <label className="block text-stone-700 font-medium mb-2">Password *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full border border-stone-200 text-stone-900 px-4 py-3.5 rounded-xl focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-shadow placeholder:text-stone-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <EyeIcon show={showPw} />
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group mt-2">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border-2 border-stone-300 group-hover:border-stone-900 transition-colors mt-0.5 flex-shrink-0">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="absolute opacity-0 w-full h-full cursor-pointer peer" 
                />
                <svg className="w-3.5 h-3.5 text-stone-900 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-stone-700 font-medium select-none text-sm leading-relaxed">
                Agree with <span className="underline underline-offset-2">Terms & Condition</span> and <span className="underline underline-offset-2">Privacy Policy</span>
              </span>
            </label>

            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100 mt-2">{error}</p>}

            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-xl font-medium tracking-wide transition-colors mt-4"
            >
              Sign Up
            </button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
            <span className="relative bg-white px-4 text-stone-500 text-sm">or Sign Up with</span>
          </div>

          <GoogleAuthButton
            text="signup_with"
            onSuccess={(user) => {
              onAuth(user);
              navigate('home');
            }}
            onError={(msg) => setError(msg)}
          />

          <p className="text-center mt-8 text-stone-600 font-medium">
            Already have an account?{' '}
            <button onClick={() => navigate('login')} className="text-stone-700 hover:text-stone-900 underline underline-offset-2 transition-colors">
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* Right Image Side */}
      <div className="hidden lg:block w-1/2 relative bg-stone-100 overflow-hidden">
        <img 
          src="/images/hero/hero_2.jpg" 
          alt="Living Room Interior" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
