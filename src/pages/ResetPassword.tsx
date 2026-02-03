import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import './ResetPassword.css';

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check if we have a recovery token in the URL hash
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setHasToken(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    if (!supabase) return;
    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  };

  return (
    <Layout>
      <div className="reset-password-page">
        <div className="reset-password-container">
          <h1>Reset Password</h1>

          {!hasToken ? (
            <div className="reset-password-info">
              <p>
                This page is used to complete a password reset. If you need to reset your password,
                click "Sign In" in the header and then "Forgot password?" to receive a reset link.
              </p>
              <button
                className="reset-password-button"
                onClick={() => navigate('/')}
              >
                Go to Home
              </button>
            </div>
          ) : success ? (
            <div className="reset-password-success">
              <p>Your password has been reset successfully.</p>
              <p>Redirecting to home page...</p>
            </div>
          ) : (
            <>
              <p className="reset-password-subtitle">Enter your new password below.</p>

              {error && <div className="reset-password-error">{error}</div>}

              <form onSubmit={handleSubmit} className="reset-password-form">
                <label className="reset-password-label">
                  New Password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="reset-password-input"
                    placeholder="At least 6 characters"
                  />
                </label>
                <label className="reset-password-label">
                  Confirm Password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="reset-password-input"
                    placeholder="Confirm your password"
                  />
                </label>
                <button
                  type="submit"
                  className="reset-password-button"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
