import { useEffect, useRef, useState } from 'react';
import type { AuthUser } from '../types';

interface GoogleAuthButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  onSuccess: (user: AuthUser) => void;
  onError: (errorMessage: string) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleAuthButton({
  text = 'signin_with',
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const tokenClientRef = useRef<any>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const setupTokenClient = () => {
      if (!window.google?.accounts?.oauth2) return;

      try {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              onError(tokenResponse.error_description || 'Google sign in was cancelled or failed.');
              setLoading(false);
              return;
            }

            if (!tokenResponse.access_token) {
              onError('Failed to obtain Google access token.');
              setLoading(false);
              return;
            }

            try {
              const res = await fetch('/api/google', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accessToken: tokenResponse.access_token }),
              });

              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.error || 'Google authentication failed');
              }

              if (data.token) {
                localStorage.setItem('lumiere_token', data.token);
              }

              onSuccess(data.user);
            } catch (err: any) {
              onError(err.message || 'Error occurred while signing in with Google.');
            } finally {
              setLoading(false);
            }
          },
        });
      } catch (err) {
        console.error('Failed to initialize Google Token Client:', err);
      }
    };

    if (window.google?.accounts?.oauth2) {
      setupTokenClient();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          setupTokenClient();
        }
      }, 150);
      return () => clearInterval(interval);
    }
  }, [clientId, onSuccess, onError]);

  const handleGoogleClick = () => {
    if (!clientId) {
      onError('Google Client ID is not configured.');
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      onError('Google Identity Services is loading. Please try again in a moment.');
      return;
    }

    setLoading(true);

    // Safety timeout in case popup is closed by user or blocked
    const timer = setTimeout(() => {
      setLoading(false);
    }, 45000);

    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
    } else {
      // Setup and request
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenResponse: any) => {
            clearTimeout(timer);
            if (tokenResponse.error) {
              onError(tokenResponse.error_description || 'Google sign in was cancelled or failed.');
              setLoading(false);
              return;
            }
            try {
              const res = await fetch('/api/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: tokenResponse.access_token }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Google authentication failed');
              if (data.token) localStorage.setItem('lumiere_token', data.token);
              onSuccess(data.user);
            } catch (err: any) {
              onError(err.message || 'Error signing in with Google.');
            } finally {
              setLoading(false);
            }
          },
        });
        tokenClientRef.current = client;
        client.requestAccessToken({ prompt: 'select_account' });
      } catch (err: any) {
        clearTimeout(timer);
        setLoading(false);
        onError('Unable to open Google sign in window.');
      }
    }
  };

  const getLabel = () => {
    switch (text) {
      case 'signup_with':
        return 'Sign Up with Google';
      case 'continue_with':
        return 'Continue with Google';
      case 'signin_with':
      default:
        return 'Sign In with Google';
    }
  };

  if (!clientId) {
    return (
      <div className="w-full p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
        <p className="text-xs text-amber-800 font-medium flex items-center justify-center gap-1.5">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-amber-600">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <strong>Google Client ID not configured</strong>
        </p>
        <p className="text-[11px] text-amber-600 mt-0.5">
          Please add your Client ID in <code>.env</code> (<code>VITE_GOOGLE_CLIENT_ID</code>) &amp; <code>server/.env</code>.
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={loading}
      className="w-full bg-white border border-stone-200 hover:bg-stone-50 hover:border-stone-300 active:scale-[0.99] text-stone-700 py-4 rounded-xl font-medium tracking-wide flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-base font-medium text-stone-700">Connecting to Google...</span>
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-stone-700 text-base font-medium">{getLabel()}</span>
        </>
      )}
    </button>
  );
}
