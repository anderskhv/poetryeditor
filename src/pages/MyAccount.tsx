import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getRegisteredUsedCents, isUserAdmin, CAPS } from '../utils/usageTracking';
import './MyAccount.css';

export function MyAccount() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Email change
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Usage stats
  const [usedCents, setUsedCents] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Writing stats
  const [poemCount, setPoemCount] = useState<number | null>(null);
  const [collectionCount, setCollectionCount] = useState<number | null>(null);
  const [totalWords, setTotalWords] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user && supabase) {
      getRegisteredUsedCents(user.id, supabase).then(setUsedCents);
      isUserAdmin(user.id, supabase).then(setIsAdmin);

      // Fetch writing stats
      supabase
        .from('collections')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .then(({ count }) => setCollectionCount(count ?? 0));

      supabase
        .from('poems')
        .select('id, content')
        .then(({ data }) => {
          if (data) {
            setPoemCount(data.length);
            const words = data.reduce((sum, poem) => {
              if (!poem.content) return sum;
              return sum + poem.content.trim().split(/\s+/).filter(Boolean).length;
            }, 0);
            setTotalWords(words);
          }
        });
    }
  }, [user]);

  const handleEmailChange = async (e: FormEvent) => {
    e.preventDefault();
    setEmailMessage(null);

    if (!newEmail || !supabase) return;

    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setEmailLoading(false);

    if (error) {
      setEmailMessage({ type: 'error', text: error.message });
    } else {
      setEmailMessage({ type: 'success', text: 'Confirmation email sent to your new address. Please check your inbox.' });
      setNewEmail('');
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!supabase) return;

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setPasswordLoading(true);

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword,
    });

    if (signInError) {
      setPasswordLoading(false);
      setPasswordMessage({ type: 'error', text: 'Current password is incorrect.' });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      setPasswordMessage({ type: 'error', text: error.message });
    } else {
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="my-account-page">
          <div className="my-account-container">
            <p className="my-account-loading">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const capCents = CAPS.registered;
  const usedDollars = usedCents !== null ? (usedCents / 100).toFixed(2) : '...';
  const capDollars = (capCents / 100).toFixed(2);
  const usagePercent = usedCents !== null ? Math.min(100, (usedCents / capCents) * 100) : 0;

  return (
    <Layout>
      <SEOHead
        title="My Account — Poetry Editor"
        description="Manage your Poetry Editor account settings."
        noindex
      />
      <div className="my-account-page">
        <div className="my-account-container">
          <h1>My Account</h1>

          {/* Account info */}
          <section className="my-account-section">
            <h2>Account</h2>
            <div className="my-account-field">
              <span className="my-account-label">Email</span>
              <span className="my-account-value">{user.email}</span>
            </div>
            {memberSince && (
              <div className="my-account-field">
                <span className="my-account-label">Member since</span>
                <span className="my-account-value">{memberSince}</span>
              </div>
            )}
            {isAdmin && (
              <div className="my-account-field">
                <span className="my-account-label">Role</span>
                <span className="my-account-value">Admin</span>
              </div>
            )}
          </section>

          {/* Writing stats */}
          <section className="my-account-section">
            <h2>Your Writing</h2>
            <div className="my-account-stats">
              <div className="my-account-stat">
                <span className="my-account-stat-value">{poemCount ?? '...'}</span>
                <span className="my-account-stat-label">{poemCount === 1 ? 'poem' : 'poems'}</span>
              </div>
              <div className="my-account-stat">
                <span className="my-account-stat-value">{collectionCount ?? '...'}</span>
                <span className="my-account-stat-label">{collectionCount === 1 ? 'collection' : 'collections'}</span>
              </div>
              <div className="my-account-stat">
                <span className="my-account-stat-value">{totalWords !== null ? totalWords.toLocaleString() : '...'}</span>
                <span className="my-account-stat-label">words written</span>
              </div>
            </div>
          </section>

          {/* AI Coach Usage */}
          <section className="my-account-section">
            <h2>AI Coach Usage</h2>
            <p className="my-account-hint">Your monthly AI coaching allowance. Resets on the 1st of each month.</p>
            <div className="my-account-usage">
              <div className="my-account-usage-bar">
                <div
                  className="my-account-usage-fill"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <div className="my-account-usage-text">
                {isAdmin ? (
                  <span>Unlimited (admin)</span>
                ) : (
                  <span>${usedDollars} of ${capDollars} used this month</span>
                )}
              </div>
            </div>
          </section>

          {/* Change email */}
          <section className="my-account-section">
            <h2>Change Email</h2>
            {emailMessage && (
              <div className={`my-account-message my-account-message--${emailMessage.type}`}>
                {emailMessage.text}
              </div>
            )}
            <form onSubmit={handleEmailChange} className="my-account-form">
              <label className="my-account-form-label">
                New email address
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="my-account-input"
                  placeholder="new@example.com"
                />
              </label>
              <button type="submit" className="my-account-button" disabled={emailLoading}>
                {emailLoading ? 'Sending...' : 'Update Email'}
              </button>
            </form>
          </section>

          {/* Change password */}
          <section className="my-account-section">
            <h2>Change Password</h2>
            {passwordMessage && (
              <div className={`my-account-message my-account-message--${passwordMessage.type}`}>
                {passwordMessage.text}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="my-account-form">
              <label className="my-account-form-label">
                Current password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="my-account-input"
                />
              </label>
              <label className="my-account-form-label">
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="my-account-input"
                  placeholder="At least 6 characters"
                />
              </label>
              <label className="my-account-form-label">
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="my-account-input"
                />
              </label>
              <button type="submit" className="my-account-button" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}
