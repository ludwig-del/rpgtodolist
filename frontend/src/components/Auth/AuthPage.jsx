import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import './AuthPage.css';

export default function AuthPage() {
  const { loginUser, registerUser } = useGame();
  const [mode, setMode]     = useState('login');   // 'login' | 'register'
  const [form, setForm]     = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginUser(form.email, form.password);
      } else {
        await registerUser(form.username, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="auth-eyebrow">Rise, Tarnished</p>
        <h1 className="auth-title">Elden Ring</h1>
        <p className="auth-sub">Daily Quest</p>
        <div className="gold-divider" />

        <div className="auth-tabs">
          <button
            className={`auth-tab${mode === 'login' ? ' auth-tab--active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab${mode === 'register' ? ' auth-tab--active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <input
              className="auth-input"
              type="text"
              placeholder="Tarnished Name"
              value={form.username}
              onChange={update('username')}
              required
              minLength={3}
            />
          )}
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={update('email')}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={update('password')}
            required
            minLength={6}
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Entering the Lands Between...' : mode === 'login' ? 'Enter' : 'Create Character'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
