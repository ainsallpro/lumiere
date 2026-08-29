import { useState, useEffect } from 'react';
import type { Page } from '../App';

interface Props {
  navigate: (page: Page) => void;
  token?: string;
}

export default function ResetPasswordPage({ navigate, token: propToken }: Props) {
  const [token, setToken] = useState(propToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      const urlParams = new URLSearchParams(window.location.search);
      const queryToken = urlParams.get('token');
      if (queryToken) {
        setToken(queryToken);
      } else if (window.location.hash.includes('token=')) {
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const hashToken = hashParams.get('token');
        if (hashToken) setToken(hashToken);
      }
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing or the link is incomplete.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }: { show: boolean }) => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <path d="M1 1l22 22" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative py-12">
        {/* Logo Area */}
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
          {!success ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-semibold text-stone-900 mb-3">
                Create New Password
              </h1>
              <p className="text-stone-500 mb-8 leading-relaxed text-sm sm:text-base">
                Please enter a new password for your Lumière account.
              </p>

              {!token && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-sm text-amber-800 flex items-start gap-2.5">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-amber-600 flex-shrink-0 mt-0.5">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div>
                    <strong>Reset token not found:</strong> Please make sure you opened the full link from your email.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-stone-700 font-medium mb-2 text-sm">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
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

                <div>
                  <label className="block text-stone-700 font-medium mb-2 text-sm">
                    Confirm New Password *
                  </label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full border border-stone-200 text-stone-900 px-4 py-3.5 rounded-xl focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-shadow placeholder:text-stone-400"
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3.5 rounded-xl border border-red-100 space-y-2">
                    <p>{error}</p>
                    {error.toLowerCase().includes('expired') && (
                      <button
                        type="button"
                        onClick={() => navigate('forgot-password')}
                        className="text-stone-900 underline font-semibold hover:text-stone-700"
                      >
                        Request a new reset link here
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white py-4 rounded-xl font-medium tracking-wide transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving New Password...</span>
                    </>
                  ) : (
                    'Save New Password'
                  )}
                </button>
              </form>

              <div className="text-center mt-8">
                <button
                  onClick={() => navigate('login')}
                  className="text-stone-600 hover:text-stone-900 font-medium text-sm transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 border border-emerald-100">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 mb-3">
                Password Reset Successful!
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mb-8 leading-relaxed">
                Your new password is now active. You can now sign in to your Lumière account using your new password.
              </p>

              <button
                onClick={() => navigate('login')}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-xl font-medium text-sm transition-colors"
              >
                Sign In Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Image Side */}
      <div className="hidden lg:block w-1/2 relative bg-stone-100 overflow-hidden">
        <img
          src="/images/hero/hero_2.jpg"
          alt="Lumière Interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/10 backdrop-brightness-95"></div>
      </div>
    </div>
  );
}
