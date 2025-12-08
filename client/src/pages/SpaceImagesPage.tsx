import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import {
  fetchImagesForSpace,
  deleteImage as deleteImageApi,
  type GeneratedImage,
} from '../api/images.ts';
import { useSpaceContext } from '../space/SpaceContext.tsx';

export function SpaceImagesPage(): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const { setActiveSpaceId } = useSpaceContext();

  const spaceIdParam = params.spaceId;
  const spaceId =
    spaceIdParam && Number.isFinite(Number(spaceIdParam))
      ? Number(spaceIdParam)
      : null;

  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<GeneratedImage | null>(null);
  const [tileSize, setTileSize] = useState<'small' | 'medium' | 'large'>(
    'small',
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (spaceId) {
      setActiveSpaceId(spaceId);
    }
  }, [spaceId, setActiveSpaceId]);

  useEffect(() => {
    const loadImages = async (): Promise<void> => {
      if (!user || !spaceId) {
        setImages([]);
        return;
      }
      setImagesError(null);
      try {
        const imgs = await fetchImagesForSpace(spaceId);
        setImages(imgs);
      } catch {
        setImagesError('Failed to load images.');
      }
    };

    void loadImages();
  }, [user, spaceId]);

  const handleDeleteImage = async (image: GeneratedImage): Promise<void> => {
    if (!spaceId) return;
    try {
      await deleteImageApi(spaceId, image.id);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      if (modalImage && modalImage.id === image.id) {
        setModalImage(null);
      }
    } catch {
      setImagesError('Failed to delete image.');
    }
  };

  if (loading) {
    return (
      <section>
        <h2>Images</h2>
        <p>Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>Images</h2>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  if (!spaceId) {
    return (
      <section>
        <h2>Images</h2>
        <p>Invalid space ID.</p>
        <p>
          <Link to="/spaces">Back to spaces</Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <h2 style={{ margin: 0 }}>Images in this space</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => setTileSize('small')}
            style={{
              border: '1px solid #ccc',
              background: tileSize === 'small' ? '#ddd' : '#f5f5f5',
              padding: '2px 6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Small
          </button>
          <button
            type="button"
            onClick={() => setTileSize('medium')}
            style={{
              border: '1px solid #ccc',
              background: tileSize === 'medium' ? '#ddd' : '#f5f5f5',
              padding: '2px 6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Medium
          </button>
          <button
            type="button"
            onClick={() => setTileSize('large')}
            style={{
              border: '1px solid #ccc',
              background: tileSize === 'large' ? '#ddd' : '#f5f5f5',
              padding: '2px 6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Large
          </button>
        </div>
      </div>
      {imagesError && <p style={{ color: 'red' }}>{imagesError}</p>}
      {images.length === 0 && <p>No images generated yet.</p>}
      {images.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              tileSize === 'small'
                ? 'repeat(auto-fill, minmax(160px, 1fr))'
                : tileSize === 'medium'
                  ? 'repeat(2, minmax(0, 1fr))'
                  : 'repeat(1, minmax(0, 1fr))',
            gap: 12,
            marginTop: 12,
          }}
        >
          {images.map((img) => (
            <figure
              key={img.id}
              style={{
                border: '1px solid #ccc',
                padding: 8,
                borderRadius: 4,
              }}
            >
              {(img.cloudfrontUrl || img.s3Url) && (
                <button
                  type="button"
                  onClick={() => setModalImage(img)}
                  style={{
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <img
                    src={img.cloudfrontUrl ?? img.s3Url}
                    alt={img.prompt.slice(0, 80)}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </button>
              )}
              <figcaption style={{ marginTop: 4, fontSize: '0.8rem' }}>
                <div>Seed: {img.seed}</div>
                <div>
                  Created:{' '}
                  {new Date(img.createdAt).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {modalImage && (modalImage.cloudfrontUrl || modalImage.s3Url) && (
        <div
          role="presentation"
          onClick={() => setModalImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              background: '#fff',
              padding: 16,
              borderRadius: 6,
              maxWidth: '90vw',
              maxHeight: '90vh',
              boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            <div style={{ alignSelf: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
                aria-label="Close image"
              >
                ×
              </button>
            </div>
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <img
                src={modalImage.cloudfrontUrl ?? modalImage.s3Url}
                alt={modalImage.prompt.slice(0, 120)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
            <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
              <div>Seed: {modalImage.seed}</div>
              <div>
                Created:{' '}
                {new Date(modalImage.createdAt).toLocaleString(undefined, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </div>
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    void handleDeleteImage(modalImage);
                  }}
                >
                  Delete image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p>
        <Link to={`/spaces/${spaceId}`}>&larr; Back to space</Link>
      </p>
    </section>
  );
}
