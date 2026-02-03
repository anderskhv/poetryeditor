import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import './AuthModal.css';

type AuthView = 'sign_in' | 'sign_up' | 'forgot_password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setMessage(null);
  };

  const handleViewChange = (newView: AuthView) => {
    resetForm();
    setView(newView);
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      resetForm();
      onClose();
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) return;
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for a confirmation link.');
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) return;
    const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL;
    const redirectBase = publicSiteUrl && publicSiteUrl.trim().length > 0
      ? publicSiteUrl
      : window.location.origin;
    const redirectTo = new URL('/reset-password', redirectBase).toString();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for a password reset link.');
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'sign_in':
        return 'Sign In to Poetry Editor';
      case 'sign_up':
        return 'Create an Account';
      case 'forgot_password':
        return 'Reset Password';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'sign_in':
      case 'sign_up':
        return 'Save your poems to the cloud, access them anywhere.';
      case 'forgot_password':
        return "Enter your email and we'll send you a reset link.";
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>{getTitle()}</h2>
        <p className="auth-modal-subtitle">{getSubtitle()}</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-message">{message}</div>}

        {view === 'sign_in' && (
          <form onSubmit={handleSignIn} className="auth-form">
            <label className="auth-label">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                placeholder="you@example.com"
              />
            </label>
            <label className="auth-label">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
                placeholder="Your password"
              />
            </label>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="auth-links">
              <button
                type="button"
                className="auth-link"
                onClick={() => handleViewChange('forgot_password')}
              >
                Forgot password?
              </button>
              <button
                type="button"
                className="auth-link"
                onClick={() => handleViewChange('sign_up')}
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        )}

        {view === 'sign_up' && (
          <form onSubmit={handleSignUp} className="auth-form">
            <label className="auth-label">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                placeholder="you@example.com"
              />
            </label>
            <label className="auth-label">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="auth-input"
                placeholder="At least 6 characters"
              />
            </label>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
            <div className="auth-links">
              <button
                type="button"
                className="auth-link"
                onClick={() => handleViewChange('sign_in')}
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        )}

        {view === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <label className="auth-label">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                placeholder="you@example.com"
              />
            </label>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="auth-links">
              <button
                type="button"
                className="auth-link"
                onClick={() => handleViewChange('sign_in')}
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
