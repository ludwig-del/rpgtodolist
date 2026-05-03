import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useGame } from './context/GameContext';
import Landing from './components/Landing/Landing';
import BossSelection from './components/BossSelection/BossSelection';
import Dashboard from './components/Dashboard/Dashboard';

export default function App() {
  const { session, loading } = useGame();

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
        <p style={{ fontFamily:'var(--font-title)', color:'var(--gold)', letterSpacing:'0.3em' }}>
          LOADING...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/"          element={<Landing />} />
      <Route path="/select"    element={<BossSelection />} />
      <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/select" replace />} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  );
}
