import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import './AuthButton.css';

export function AuthButton() {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (!supabase) return null;

  if (loading) {
    return <div className="auth-button-loading">...</div>;
  }

  if (!isAuthenticated) {
    return (
      <>
        <button
          className="auth-button sign-in"
          onClick={() => setShowModal(true)}
        >
          Sign In
        </button>
        <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  const email = user?.email || 'User';
  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="auth-user-menu">
      <button
        className="auth-user-button"
        onClick={() => setShowDropdown(!showDropdown)}
        title={email}
      >
        <span className="auth-user-avatar">{initial}</span>
      </button>

      {showDropdown && (
        <>
          <div
            className="auth-dropdown-overlay"
            onClick={() => setShowDropdown(false)}
          />
          <div className="auth-dropdown">
            <Link
              to="/my-collections"
              className="auth-dropdown-item"
              onClick={() => setShowDropdown(false)}
            >
              My Collections
            </Link>
            <button
              className="auth-dropdown-item"
              onClick={() => {
                signOut();
                setShowDropdown(false);
              }}
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
