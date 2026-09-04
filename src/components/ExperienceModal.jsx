import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBreakpoints } from '../hooks/useBreakpoints';
import { useDetailModalMotion } from '../hooks/useDetailModalMotion';

const ExperienceModal = ({ exp, onClose, sourceElement }) => {
  const { isTablet } = useBreakpoints();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const { isClosing, requestClose, panelRef } = useDetailModalMotion(exp, onClose, sourceElement);

  // Reset image index when experience changes
  useEffect(() => {
    setCurrentImgIndex(0);
  }, [exp]);

  if (!exp) return null;

  // Prepare images list (supports exp.images array or single exp.image/exp.logo fallback)
  const imagesList = (exp.images && exp.images.length > 0)
    ? exp.images
    : (exp.image ? [exp.image] : []);

  const hasImages = imagesList.length > 0;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  // Color accents
  const isGreen = exp.id === 'invite' || exp.id === 'thecoderschool';
  const isBlue = exp.id === 'mathnasium' || exp.id === 'techknowhow_asst';
  const accentColor = isGreen ? 'var(--accent-primary)' : (isBlue ? '#38bdf8' : 'var(--accent-secondary)');

  return createPortal(
    <div
      className={`detail-modal-backdrop${isClosing ? ' is-closing' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(2, 7, 22, 0.18)',
        zIndex: 100010,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={requestClose}
    >
      {/* Modal Container - Solid & Compact */}
      <div
        className="detail-modal-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={exp.title}
        style={{
          background: 'var(--bg-primary, #0a1325)',
          color: 'var(--text-primary, #ffffff)',
          borderRadius: '16px',
          border: '1px solid var(--border-glass, rgba(58, 197, 163, 0.25))',
          width: '100%',
          maxWidth: '980px',
          maxHeight: '68vh',
          position: 'relative',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 100000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={requestClose}
          style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid var(--border-glass, rgba(255, 255, 255, 0.2))',
            color: 'var(--text-primary, #ffffff)',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 30,
            fontSize: '1.2rem',
            lineHeight: 1,
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Header Section */}
        <div style={{
          padding: '1rem 1.5rem 0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          borderBottom: '1px solid var(--border-glass, rgba(255, 255, 255, 0.1))',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          {/* Company / Institution Logo */}
          <div style={{
            background: '#ffffff',
            padding: '0.25rem',
            borderRadius: '8px',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
          }}>
            <img src={exp.logo} alt={`${exp.title} Logo`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingRight: '2rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: accentColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {exp.dateStr}
            </span>
            <h2 style={{ fontSize: 'clamp(1.05rem, 1.6vw, 1.35rem)', fontWeight: 'bold', color: 'var(--text-primary, #ffffff)', margin: '0.08rem 0 0.05rem', lineHeight: '1.2' }}>
              {exp.role}
            </h2>
            <h3 style={{ fontSize: '0.84rem', fontWeight: '500', color: 'var(--text-secondary, #a0a0ab)', margin: 0 }}>
              {exp.title}
            </h3>
          </div>
        </div>

        {/* Modal Content Body */}
        <div style={{
          display: 'flex',
          flexDirection: isTablet ? 'column' : 'row',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Left Column: Details, Description, Bullets & Tags */}
          <div style={{
            flex: hasImages ? (isTablet ? '1' : '1.15') : '1',
            padding: '1.35rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.15rem'
          }}>
            {/* Overview / Short Description */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: '0.35rem' }}>
                Overview
              </h4>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary, #d4d4d8)', lineHeight: '1.55', margin: 0 }}>
                {exp.shortDesc}
              </p>
            </div>

            {/* Key Accomplishments & Bullet Points */}
            {exp.bullets && exp.bullets.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: '0.5rem' }}>
                  Key Contributions
                </h4>
                <ul style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary, #ffffff)',
                  listStyleType: 'none',
                  paddingLeft: '1.1rem',
                  margin: 0
                }}>
                  {exp.bullets.map((bullet, idx) => (
                    <li key={idx} style={{ position: 'relative', lineHeight: '1.45' }}>
                      <span style={{ position: 'absolute', left: '-1.1rem', color: accentColor, fontWeight: 'bold' }}>•</span>
                      <span dangerouslySetInnerHTML={{ __html: bullet }} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills & Technologies Tags */}
            {exp.tags && exp.tags.length > 0 && (
              <div style={{ marginTop: '0.15rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary, #94a3b8)', marginBottom: '0.4rem' }}>
                  Technologies & Skills
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {exp.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid var(--border-glass, rgba(255, 255, 255, 0.15))',
                        color: 'var(--text-primary, #ffffff)',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: '500'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Compact Square Image Carousel */}
          {hasImages && (
            <div style={{
              flex: isTablet ? '1' : '0.6',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.25)',
              borderLeft: isTablet ? 'none' : '1px solid var(--border-glass, rgba(255, 255, 255, 0.1))',
              borderTop: isTablet ? '1px solid var(--border-glass, rgba(255, 255, 255, 0.1))' : 'none',
              position: 'relative'
            }}>
              {/* Square image container that scales down on narrow screens */}
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '240px',
                aspectRatio: '1 / 1',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                overflow: 'hidden',
                background: 'var(--bg-secondary, #070e1c)',
                border: '1px solid var(--border-glass, rgba(255, 255, 255, 0.15))',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)'
              }}>
                <img
                  src={imagesList[currentImgIndex]}
                  alt={`${exp.title} showcase ${currentImgIndex + 1}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'opacity 0.25s ease-in-out'
                  }}
                />

                {/* Left & Right Arrow Navigation Controls */}
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      aria-label="Previous picture"
                      style={{
                        position: 'absolute',
                        left: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                        transition: 'transform 0.2s ease, background 0.2s ease',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>

                    <button
                      onClick={handleNextImage}
                      aria-label="Next picture"
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                        transition: 'transform 0.2s ease, background 0.2s ease',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>

                    {/* Image Counter Badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0.5rem',
                      right: '0.5rem',
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      zIndex: 10
                    }}>
                      {currentImgIndex + 1} / {imagesList.length}
                    </div>
                  </>
                )}
              </div>

              {/* Indicator Dots */}
              {imagesList.length > 1 && (
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
                  {imagesList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImgIndex(idx)}
                      style={{
                        width: idx === currentImgIndex ? '16px' : '6px',
                        height: '6px',
                        borderRadius: '9999px',
                        background: idx === currentImgIndex ? accentColor : 'var(--border-glass, rgba(255,255,255,0.2))',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        padding: 0
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ExperienceModal;
