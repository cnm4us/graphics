import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchSpaces, type Space } from '../api/spaces.ts';
import { useSpaceContext } from '../space/SpaceContext.tsx';

type LeftDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function LeftDrawer({
  isOpen,
  onClose,
}: LeftDrawerProps): JSX.Element | null {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { activeSpaceId, setActiveSpaceId } = useSpaceContext();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isOpen) return;

    const loadSpaces = async (): Promise<void> => {
      setSpacesLoading(true);
      setSpacesError(null);
      try {
        const list = await fetchSpaces();
        setSpaces(list);
      } catch {
        setSpacesError('Failed to load spaces.');
      } finally {
        setSpacesLoading(false);
      }
    };

    void loadSpaces();
  }, [user, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleNavigate = (path: string): void => {
    navigate(path);
    onClose();
  };

  const handleSelectSpace = (space: Space): void => {
    setActiveSpaceId(space.id);
    handleNavigate(`/spaces/${space.id}`);
  };

  const hasActiveSpace =
    activeSpaceId !== null &&
    spaces.some((space) => space.id === activeSpaceId);

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 999,
        }}
      />
      <aside
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          backgroundColor: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
          padding: 16,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <strong>Graphics Workshop</strong>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </header>

        {!user && (
          <nav>
            <h4>Account</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => handleNavigate('/login')}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    color: '#0077cc',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Login
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/register')}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    color: '#0077cc',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Register
                </button>
              </li>
            </ul>
          </nav>
        )}

        {user && (
          <>
            <section>
              <h4>Account</h4>
              <p style={{ marginTop: 4, marginBottom: 8 }}>
                Signed in as {user.displayName || user.email}
              </p>
              <button
                type="button"
                onClick={() => {
                  void logout();
                  onClose();
                }}
                style={{
                  border: '1px solid #ccc',
                  background: '#f5f5f5',
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </section>

            <nav style={{ flex: 1, overflowY: 'auto' }}>
              <h4>Navigation</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/dashboard')}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      color: '#0077cc',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Dashboard
                  </button>
                </li>
                <li style={{ marginBottom: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/spaces')}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      color: '#0077cc',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Spaces
                  </button>
                </li>
              </ul>

              <section style={{ marginTop: 16 }}>
                <h5>Your spaces</h5>
                {spacesLoading && <p>Loading spaces…</p>}
                {spacesError && (
                  <p style={{ color: 'red' }}>{spacesError}</p>
                )}
                {!spacesLoading && spaces.length === 0 && (
                  <p style={{ fontSize: '0.9rem' }}>
                    You do not have any spaces yet.
                  </p>
                )}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {spaces.map((space) => {
                    const isActive = space.id === activeSpaceId;
                    return (
                      <li key={space.id} style={{ marginBottom: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleSelectSpace(space)}
                          style={{
                            border: 'none',
                            background: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            fontWeight: isActive ? 'bold' : 'normal',
                            color: isActive ? '#000' : '#0077cc',
                            textDecoration: 'underline',
                          }}
                        >
                          {space.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section style={{ marginTop: 16 }}>
                <h5>Space actions</h5>
                {!hasActiveSpace && (
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>
                    Select a space above to enable these.
                  </p>
                )}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 4 }}>
                    <button
                      type="button"
                      disabled={!hasActiveSpace}
                      onClick={() =>
                        handleNavigate(
                          `/spaces/${activeSpaceId as number}/characters`,
                        )
                      }
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        color: hasActiveSpace ? '#0077cc' : '#aaa',
                        cursor: hasActiveSpace ? 'pointer' : 'default',
                        textDecoration: hasActiveSpace
                          ? 'underline'
                          : 'none',
                      }}
                    >
                      Characters
                    </button>
                  </li>
                  <li style={{ marginBottom: 4 }}>
                    <button
                      type="button"
                      disabled={!hasActiveSpace}
                      onClick={() =>
                        handleNavigate(
                          `/spaces/${activeSpaceId as number}/styles`,
                        )
                      }
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        color: hasActiveSpace ? '#0077cc' : '#aaa',
                        cursor: hasActiveSpace ? 'pointer' : 'default',
                        textDecoration: hasActiveSpace
                          ? 'underline'
                          : 'none',
                      }}
                    >
                      Styles
                    </button>
                  </li>
                  <li style={{ marginBottom: 4 }}>
                    <button
                      type="button"
                      disabled={!hasActiveSpace}
                      onClick={() =>
                        handleNavigate(
                          `/spaces/${activeSpaceId as number}/scenes`,
                        )
                      }
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        color: hasActiveSpace ? '#0077cc' : '#aaa',
                        cursor: hasActiveSpace ? 'pointer' : 'default',
                        textDecoration: hasActiveSpace
                          ? 'underline'
                          : 'none',
                      }}
                    >
                      Scenes
                    </button>
                  </li>
                  <li style={{ marginBottom: 4 }}>
                    <button
                      type="button"
                      disabled={!hasActiveSpace}
                      onClick={() =>
                        handleNavigate(
                          `/spaces/${activeSpaceId as number}/generate`,
                        )
                      }
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        color: hasActiveSpace ? '#0077cc' : '#aaa',
                        cursor: hasActiveSpace ? 'pointer' : 'default',
                        textDecoration: hasActiveSpace
                          ? 'underline'
                          : 'none',
                      }}
                    >
                      Generate
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      disabled={!hasActiveSpace}
                      onClick={() =>
                        handleNavigate(
                          `/spaces/${activeSpaceId as number}/images`,
                        )
                      }
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        color: hasActiveSpace ? '#0077cc' : '#aaa',
                        cursor: hasActiveSpace ? 'pointer' : 'default',
                        textDecoration: hasActiveSpace
                          ? 'underline'
                          : 'none',
                      }}
                    >
                      Images
                    </button>
                  </li>
                </ul>
              </section>
            </nav>
          </>
        )}
      </aside>
    </>
  );
}

