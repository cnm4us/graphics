import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { CharactersPage } from './pages/CharactersPage.tsx';
import { StylesPage } from './pages/StylesPage.tsx';
import { SpacesListPage } from './pages/SpacesListPage.tsx';
import { SpaceDetailPage } from './pages/SpaceDetailPage.tsx';
import { SpaceGeneratePage } from './pages/SpaceGeneratePage.tsx';
import { SpaceImagesPage } from './pages/SpaceImagesPage.tsx';
import { SpaceScenesPage } from './pages/SpaceScenesPage.tsx';
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
          <Link to="/spaces">Spaces</Link>
          <Link to="/generate">Generate</Link>
          <Link to="/characters">Characters</Link>
          <Link to="/styles">Styles</Link>
          <Link to="/scenes">Scenes</Link>
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
          <Route path="/spaces" element={<SpacesListPage />} />
          <Route path="/spaces/:spaceId" element={<SpaceDetailPage />} />
          <Route
            path="/spaces/:spaceId/characters"
            element={<CharactersPage />}
          />
          <Route path="/spaces/:spaceId/styles" element={<StylesPage />} />
          <Route path="/spaces/:spaceId/scenes" element={<SpaceScenesPage />} />
          <Route
            path="/spaces/:spaceId/generate"
            element={<SpaceGeneratePage />}
          />
          <Route path="/spaces/:spaceId/images" element={<SpaceImagesPage />} />
          <Route path="/generate" element={<DashboardPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/styles" element={<StylesPage />} />
          <Route path="/scenes" element={<DashboardPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}
