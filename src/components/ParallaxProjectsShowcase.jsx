import React, { useState, useEffect, useRef } from 'react';
import { initialProjects } from '../data/projects';

// Single Horizontal Project Card with 3D Tilt & Parallax Window
const HorizontalProjectCard = ({ project, index, onSelect }) => {
  const cardRef = useRef(null);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isSquareImage, setIsSquareImage] = useState(true);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouseTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseTilt({ x: 0, y: 0 });
  };

  const rotateX = isHovered ? -mouseTilt.y * 7 : 0;
  const rotateY = isHovered ? mouseTilt.x * 7 : 0;

  return (
    <div
      ref={cardRef}
      className="horizontal-project-card-wrapper"
      role="button"
      tabIndex={0}
      aria-label={`View details for ${project.title}`}
      style={{
        width: 'clamp(340px, 28vw, 440px)',
        flexShrink: 0,
        perspective: '1200px',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={(event) => onSelect(project, event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(project, event.currentTarget);
        }
      }}
    >
      <div
        className="horizontal-project-card"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: isHovered ? 'rgba(10, 24, 48, 0.96)' : 'rgba(7, 14, 28, 0.88)',
          border: `1px solid ${isHovered ? '#3AC5A3' : 'rgba(58, 197, 163, 0.22)'}`,
          borderRadius: '18px',
          overflow: 'hidden',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${isHovered ? '12px' : '0px'})`,
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.1s ease-out'
            : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s, box-shadow 0.25s',
          boxShadow: isHovered
            ? '0 25px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(58, 197, 163, 0.25)'
            : '0 12px 30px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Specular Radial Glare on Mouse Move */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at ${(mouseTilt.x + 1) * 50}% ${(mouseTilt.y + 1) * 50}%, rgba(58, 197, 163, 0.18) 0%, transparent 60%)`,
              zIndex: 10,
              pointerEvents: 'none'
            }}
          />
        )}

        {/* ── Parallax Image Window ── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '230px',
            overflow: 'hidden',
            background: '#030814',
            flexShrink: 0
          }}
        >
          {/* Category Tag Badge */}
          <div
            style={{
              position: 'absolute',
              left: '18px',
              top: '18px',
              zIndex: 12,
              transform: 'translateZ(20px)'
            }}
          >
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '0.75rem',
                fontWeight: '600',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#020716',
                background: '#3AC5A3',
                padding: '4px 12px',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                display: 'inline-block'
              }}
            >
              {project.technologies[0]} × {project.technologies[1] || 'Web'}
            </span>
          </div>

          {/* Fit square logos completely; keep the wide screenshot treatment. */}
          <img
            draggable={false}
            src={project.imageUrl}
            alt={project.title}
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              const ratio = naturalWidth / naturalHeight;
              setIsSquareImage(ratio >= 0.95 && ratio <= 1.05);
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: isSquareImage ? 'contain' : 'cover',
              transform: `scale(${isSquareImage ? (isHovered ? 0.98 : 0.92) : (isHovered ? 1.06 : 1)})`,
              transition: 'transform 0.4s ease, filter 0.3s ease',
              filter: isHovered ? 'brightness(1.05)' : 'brightness(0.92)'
            }}
          />

          {/* Bottom Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: isSquareImage ? 'none' : 'linear-gradient(to top, rgba(7, 14, 28, 0.95) 0%, transparent 55%)',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* ── Card Content ── */}
        <div
          style={{
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
            transform: 'translateZ(10px)'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: '1.45rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  lineHeight: '1.2',
                  margin: 0
                }}
              >
                {project.title}
              </h3>

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3AC5A3"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isHovered ? 'translateX(3px) translateY(-2px)' : 'none',
                  transition: 'transform 0.2s ease',
                  flexShrink: 0
                }}
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </div>

            <p
              style={{
                fontSize: '0.9rem',
                lineHeight: '1.55',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '16px'
              }}
            >
              {project.shortDescription}
            </p>
          </div>

          {/* Tech Tag Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}
          >
            {project.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'rgba(255, 255, 255, 0.85)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '3px 8px',
                  borderRadius: '5px'
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Free horizontal project gallery ────────────────────────────────────────
const ParallaxProjectsShowcase = ({ onSelectProject }) => {
  const trackRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ active: false, hasDragged: false, startX: 0, startScrollLeft: 0, pointerId: null });

  // Keep the progress indicator and arrow state in sync with ordinary horizontal scrolling.
  useEffect(() => {
    const updateProgress = () => {
      if (!trackRef.current) return;
      const maxScroll = trackRef.current.scrollWidth - trackRef.current.clientWidth;
      setScrollProgress(maxScroll > 0 ? trackRef.current.scrollLeft / maxScroll : 0);
    };

    const track = trackRef.current;
    updateProgress();
    track?.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      track?.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  // Arrow navigation and pointer drag both use the track's native scroll position.
  const handleNavClick = (direction) => {
    trackRef.current?.scrollBy({ left: direction === 'next' ? 460 : -460, behavior: 'smooth' });
  };

  const handlePointerDown = (event) => {
    // Only drag with primary mouse button or touch
    if (event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = {
      active: true,
      hasDragged: false,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      pointerId: event.pointerId
    };
  };

  const handlePointerMove = (event) => {
    const track = trackRef.current;
    if (!track || !dragRef.current.active) return;
    const deltaX = event.clientX - dragRef.current.startX;

    // Only engage drag-scrolling if movement surpasses intentional drag threshold
    if (!dragRef.current.hasDragged) {
      if (Math.abs(deltaX) < 8) return;
      dragRef.current.hasDragged = true;
      setIsDragging(true);
      try {
        track.setPointerCapture?.(dragRef.current.pointerId);
      } catch (err) {
        // ignore if pointerId invalid
      }
    }

    track.scrollLeft = dragRef.current.startScrollLeft - deltaX;
  };

  const stopDragging = () => {
    if (!dragRef.current.active) return;
    const track = trackRef.current;
    if (dragRef.current.pointerId != null && track?.hasPointerCapture?.(dragRef.current.pointerId)) {
      try {
        track.releasePointerCapture(dragRef.current.pointerId);
      } catch (err) {
        // ignore
      }
    }
    dragRef.current.active = false;
    setIsDragging(false);

    if (dragRef.current.hasDragged) {
      setTimeout(() => {
        dragRef.current.hasDragged = false;
      }, 50);
    }
  };

  const preventClickAfterDrag = (event) => {
    if (dragRef.current.hasDragged) {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current.hasDragged = false;
    }
  };

  const handleTrackWheel = (event) => {
    const track = trackRef.current;
    if (!track) return;
    const horizontalDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
    if (!horizontalDelta) return;
    event.preventDefault();
    track.scrollLeft += horizontalDelta;
  };

  const projects = initialProjects;

  return (
    <div
      className="horizontal-projects-scroll-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        background: '#020716',
        padding: 'clamp(72px, 10vw, 120px) 0'
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 8
        }}
      >
        {/* Top Header bar with section indicator, buttons & scroll progress bar */}
        <div
          style={{
            padding: '0 clamp(24px, 5vw, 60px)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#3AC5A3',
                letterSpacing: '2px'
              }}
            >
              03
            </span>
            <h2
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: '700',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0
              }}
            >
              PROJECTS <span style={{ color: '#3AC5A3' }}>×</span> WORKS
            </h2>
          </div>

          {/* Navigation Arrows, Progress Bar & Cue */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Arrow Buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => handleNavClick('prev')}
                disabled={scrollProgress <= 0.02}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(10, 20, 42, 0.8)',
                  border: '1px solid rgba(58, 197, 163, 0.3)',
                  color: '#3AC5A3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: scrollProgress <= 0.02 ? 'default' : 'pointer',
                  opacity: scrollProgress <= 0.02 ? 0.4 : 1,
                  transition: 'all 0.2s'
                }}
                title="Previous projects"
              >
                ←
              </button>
              <button
                onClick={() => handleNavClick('next')}
                disabled={scrollProgress >= 0.98}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(10, 20, 42, 0.8)',
                  border: '1px solid rgba(58, 197, 163, 0.3)',
                  color: '#3AC5A3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: scrollProgress >= 0.98 ? 'default' : 'pointer',
                  opacity: scrollProgress >= 0.98 ? 0.4 : 1,
                  transition: 'all 0.2s'
                }}
                title="Next projects"
              >
                →
              </button>
            </div>

            {/* Live Progress Bar */}
            <div
              style={{
                width: '130px',
                height: '4px',
                background: 'rgba(58, 197, 163, 0.15)',
                borderRadius: '999px',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${scrollProgress * 100}%`,
                  background: '#3AC5A3',
                  boxShadow: '0 0 8px #3AC5A3',
                  borderRadius: '999px',
                  transition: 'width 0.1s ease-out'
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Single Horizontal Row Track ── */}
        <div
          ref={trackRef}
          data-projects-scroll-track
          onDragStart={(event) => event.preventDefault()}
          onWheel={handleTrackWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onClickCapture={preventClickAfterDrag}
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            gap: '32px',
            paddingLeft: 'clamp(24px, 5vw, 60px)',
            paddingRight: 'clamp(48px, 8vw, 140px)',
            alignItems: 'stretch',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollBehavior: isDragging ? 'auto' : 'smooth',
            scrollbarWidth: 'thin',
            scrollbarColor: '#3AC5A3 rgba(58, 197, 163, 0.12)',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'pan-y',
            userSelect: 'none'
          }}
        >
          {/* Introductory Card Panel */}
          <div
            style={{
              width: 'clamp(260px, 22vw, 340px)',
              flexShrink: 0,
              background: 'rgba(10, 19, 37, 0.7)',
              border: '1px solid rgba(58, 197, 163, 0.25)',
              borderRadius: '18px',
              padding: '30px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#3AC5A3',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}
            >
              Portfolio Gallery
            </span>
            <h3
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '2.2rem',
                fontWeight: '700',
                color: '#ffffff',
                lineHeight: '1.05',
                textTransform: 'uppercase',
                marginBottom: '14px'
              }}
            >
              Featured<br />
              <span style={{ color: '#3AC5A3' }}>Creations</span>
            </h3>
            <p
              style={{
                fontSize: '0.92rem',
                lineHeight: '1.6',
                color: '#a0a0ab',
                margin: 0
              }}
            >
              High-concurrency platforms, AI retrieval pipelines, and interactive web apps built with Next.js, Python, FastAPI, and cloud microservices.
            </p>
          </div>

          {/* All 6 Projects in a Single Continuous Row */}
          {projects.map((proj, idx) => (
            <HorizontalProjectCard
              key={proj.id}
              project={proj}
              index={idx}
              onSelect={onSelectProject}
            />
          ))}

          {/* Final Callout Card */}
          <div
            style={{
              width: 'clamp(240px, 20vw, 300px)',
              flexShrink: 0,
              background: 'rgba(10, 19, 37, 0.55)',
              border: '1px dashed rgba(58, 197, 163, 0.35)',
              borderRadius: '18px',
              padding: '30px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(58, 197, 163, 0.1)',
                border: '1px solid #3AC5A3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3AC5A3'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4" />
              </svg>
            </div>
            <h4
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.35rem',
                color: '#ffffff',
                textTransform: 'uppercase',
                margin: 0
              }}
            >
              More On GitHub
            </h4>
            <a
              href="https://github.com/tobyyeung"
              target="_blank"
              rel="noopener noreferrer"
              className="glitch-typo"
              data-title="View Repositories"
              style={{ color: '#3AC5A3', fontSize: '0.88rem', fontWeight: '600' }}
            >
              <span>View Repositories →</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParallaxProjectsShowcase;
