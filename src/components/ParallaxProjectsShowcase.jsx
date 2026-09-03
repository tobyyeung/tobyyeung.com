import React, { useState, useEffect, useRef } from 'react';
import { initialProjects } from '../data/projects';

// Single Horizontal Project Card with 3D Tilt & Parallax Window
const HorizontalProjectCard = ({ project, index, onSelect }) => {
  const cardRef = useRef(null);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

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
      style={{
        width: 'clamp(340px, 28vw, 440px)',
        flexShrink: 0,
        perspective: '1200px',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(project)}
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

          {/* Screenshot with Hover Zoom */}
          <img
            src={project.imageUrl}
            alt={project.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${isHovered ? 1.06 : 1})`,
              transition: 'transform 0.4s ease, filter 0.3s ease',
              filter: isHovered ? 'brightness(1.05)' : 'brightness(0.92)'
            }}
          />

          {/* Bottom Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(7, 14, 28, 0.95) 0%, transparent 55%)',
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

// ─── Pinned Horizontal Scroll Section with Exact Runway & Wheel Controls ─────
const ParallaxProjectsShowcase = ({ onSelectProject }) => {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const trackRef = useRef(null);

  const [horizontalTranslate, setHorizontalTranslate] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [runwayHeight, setRunwayHeight] = useState('2200px');

  // Measure exact horizontal overflow and set precise runway height (ZERO dead space)
  useEffect(() => {
    const updateRunway = () => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.scrollWidth;
      const viewportWidth = window.innerWidth || 1200;
      const viewportHeight = window.innerHeight || 800;
      const maxScrollX = Math.max(0, trackWidth - viewportWidth);

      // Pacing multiplier (1.6x) ensures comfortable, smooth horizontal scrolling
      // Bigger end cushion (1300px) provides plenty of scroll distance keeping "More on GitHub" fully pinned
      const pacingMultiplier = 1.6;
      const endCushion = 1300;
      const calculatedHeight = Math.round(maxScrollX * pacingMultiplier) + viewportHeight + endCushion;
      setRunwayHeight(`${calculatedHeight}px`);
    };

    updateRunway();
    window.addEventListener('resize', updateRunway);
    const timer1 = setTimeout(updateRunway, 100);
    const timer2 = setTimeout(updateRunway, 500);

    return () => {
      window.removeEventListener('resize', updateRunway);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Window scroll handler: converts vertical scroll down the runway to horizontal translation
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!sectionRef.current || !trackRef.current || ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        if (!sectionRef.current || !trackRef.current) {
          ticking = false;
          return;
        }

        const rect = sectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight || 800;
        const totalScrollableDistance = sectionRef.current.offsetHeight - viewportHeight;

        if (totalScrollableDistance <= 0) {
          ticking = false;
          return;
        }

        // Active horizontal translation finishes before the big end cushion
        const currentScrolled = -rect.top;
        const endCushion = 1300;
        const activeScrollDistance = Math.max(100, totalScrollableDistance - endCushion);
        const progress = Math.max(0, Math.min(1, currentScrolled / activeScrollDistance));

        const trackWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth || 1200;
        const maxTranslate = Math.max(0, trackWidth - viewportWidth);

        setHorizontalTranslate(progress * maxTranslate);
        setScrollProgress(progress);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clickable glide arrows for quick navigation
  const handleNavClick = (direction) => {
    if (!sectionRef.current || !trackRef.current) return;
    const viewportHeight = window.innerHeight || 800;
    const totalScrollableDistance = sectionRef.current.offsetHeight - viewportHeight;
    const currentScrollTop = window.pageYOffset + sectionRef.current.getBoundingClientRect().top;
    const step = 450; // scroll ~450px vertically to advance horizontally

    if (direction === 'next') {
      window.scrollBy({ top: step, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: -step, behavior: 'smooth' });
    }
  };

  const projects = initialProjects;

  return (
    <div
      ref={sectionRef}
      className="horizontal-projects-scroll-wrapper"
      style={{
        position: 'relative',
        height: runwayHeight, // Exactly sized to track length — ZERO empty space!
        width: '100%'
      }}
    >
      {/* Pinned Sticky Viewport (Locks on screen while scrolling down the runway) */}
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#020716',
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
              WORKS <span style={{ color: '#3AC5A3' }}>×</span> PROJECTS
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
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            gap: '32px',
            paddingLeft: 'clamp(24px, 5vw, 60px)',
            paddingRight: 'clamp(280px, 38vw, 600px)',
            transform: `translate3d(-${horizontalTranslate}px, 0, 0)`,
            willChange: 'transform',
            alignItems: 'stretch'
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
