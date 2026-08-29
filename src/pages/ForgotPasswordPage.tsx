import { useState } from 'react';
import type { Page } from '../App';

interface Props {
  navigate: (page: Page) => void;
}

export default function ForgotPasswordPage({ navigate }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send password reset email.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative py-12">
        {/* Back / Logo Area */}
        <div
          className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32 flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('home')}
        >
          <div
            className="w-8 h-8 rounded-sm bg-stone-900 flex items-center justify-center text-white font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            L
          </div>
          <span
            className="text-xl font-bold tracking-tight text-stone-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Lumière<span className="text-[#e29b47]">.</span>
          </span>
        </div>

        <div className="max-w-md w-full mx-auto mt-16">
          {!submitted ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-semibold text-stone-900 mb-3">
                Forgot Password?
              </h1>
              <p className="text-stone-500 mb-8 leading-relaxed text-sm sm:text-base">
                No worries! Enter your registered email address and we will send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-stone-700 font-medium mb-2 text-sm">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full border border-stone-200 text-stone-900 px-4 py-3.5 rounded-xl focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-shadow placeholder:text-stone-400"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white py-4 rounded-xl font-medium tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="text-center mt-10">
                <button
                  onClick={() => navigate('login')}
                  className="text-stone-600 hover:text-stone-900 font-medium text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Back to Sign In
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#d09354] border border-amber-100">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 mb-3">
                Check Your Email
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mb-6 leading-relaxed">
                We've sent password reset instructions to:
                <br />
                <strong className="text-stone-900">{email}</strong>
              </p>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-left text-xs sm:text-sm text-stone-600 space-y-2 mb-8">
                <p>
                  <strong>Expiration:</strong> The reset link is valid for <strong>15 minutes</strong>.
                </p>
                <p>
                  Can't find the email? Please check your <strong>Spam / Junk</strong> folder.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 py-3.5 rounded-xl font-medium text-sm transition-colors"
                >
                  Resend Email
                </button>

                <button
                  onClick={() => navigate('login')}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 rounded-xl font-medium text-sm transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Image Side */}
      <div className="hidden lg:block w-1/2 relative bg-stone-100 overflow-hidden">
        <img
          src="/images/hero/hero_1.png"
          alt="Lumière Interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/10 backdrop-brightness-95"></div>
      </div>
    </div>
  );
}
