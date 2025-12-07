import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { useAuth } from './auth/AuthContext.tsx';

export default function App(): JSX.Element {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <h1 style={{ margin: 0 }}>Graphics Workshop</h1>
        <nav style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/dashboard">Dashboard</Link>
          {user && (
            <>
              <span style={{ marginLeft: 'auto' }}>
                Signed in as {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={() => {
                  void logout();
                }}
                style={{ marginLeft: '0.5rem' }}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </header>
      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}
