import React, { useState, useEffect, useRef } from 'react';
import { experiences } from '../data/experiences';
import TimelineGoogleMap, { LOCATION_COORDS } from './TimelineGoogleMap';

// Individual Stepped Experience Card with Silky 3D Mouse Tilt & Smooth Crossfade
const SteppedExperienceCard = ({ exp, index, activeIndex, onSelect }) => {
  const isLeft = index % 2 === 0;
  const isActive = index === activeIndex;
  const isPast = index < activeIndex;

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
  const cityInfo = LOCATION_COORDS[exp.id] || { city: 'United States' };

  // Smooth directional translation: past cards glide upwards, future cards glide from below
  const translateY = isActive ? 0 : isPast ? -36 : 36;
  const scale = isActive ? 1 : 0.95;
  const blur = isActive ? 0 : 8;
  const opacity = isActive ? 1 : 0;

  return (
    <div
      ref={cardRef}
      className={`stepped-exp-card-container ${isLeft ? 'card-on-left' : 'card-on-right'}`}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: isActive ? 'auto' : 'none',
        opacity: opacity,
        filter: `blur(${blur}px)`,
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        transition: 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), filter 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: isActive ? 10 : 1
      }}
    >
      {/* ── Center Spine Marker Node (Geographic Location Pin on the Map) ── */}
      <div
        className="timeline-spine-node"
        data-experience-id={exp.id}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 15,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            position: 'relative',
            width: isActive ? '32px' : '16px',
            height: isActive ? '32px' : '16px',
            borderRadius: '50%',
            background: '#020716',
            border: `2.5px solid ${isActive ? '#00f0ff' : '#3AC5A3'}`,
            boxShadow: isActive ? '0 0 24px #00f0ff, 0 0 45px #3AC5A3' : '0 0 10px #3AC5A3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div
            style={{
              width: isActive ? '14px' : '6px',
              height: isActive ? '14px' : '6px',
              borderRadius: '50%',
              background: isActive ? '#00f0ff' : '#3AC5A3',
              boxShadow: isActive ? '0 0 15px #00f0ff' : 'none',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
          {/* Subtle radar pulse ring on active location */}
          {isActive && (
            <div
              style={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '50%',
                border: '2px solid #00f0ff',
                animation: 'mapPulse 2s infinite ease-out',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>
      </div>

      {/* ── Horizontal Connector Beam to the Active Card ── */}
      <div
        className="timeline-connector-line"
        style={{
          position: 'absolute',
          top: '50%',
          [isLeft ? 'right' : 'left']: '50%',
          width: isActive ? 'clamp(30px, 4vw, 60px)' : '0px',
          height: '2.5px',
          background: 'linear-gradient(90deg, #00f0ff, #3AC5A3)',
          boxShadow: '0 0 12px #00f0ff',
          transform: 'translateY(-50%)',
          zIndex: 12,
          opacity: isActive ? 1 : 0,
          transition: 'width 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease'
        }}
      />

      {/* ── Opposite Side Floating Milestone Badge ── */}
      <div
        className="timeline-opposite-date"
        style={{
          position: 'absolute',
          top: '50%',
          [isLeft ? 'left' : 'right']: 'calc(50% + clamp(40px, 5vw, 80px))',
          transform: isActive
            ? 'translateY(-50%)'
            : isPast
              ? 'translateY(calc(-50% - 24px))'
              : 'translateY(calc(-50% + 24px))',
          zIndex: 12,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isLeft ? 'flex-start' : 'flex-end',
          gap: '8px',
          opacity: isActive ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '0.82rem',
            fontWeight: '700',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#a0a0ab'
          }}
        >
          EXPERIENCE {index + 1} OF {experiences.length}
        </div>
        <span
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 'clamp(0.8rem, 1.5vw, 1.25rem)',
            fontWeight: '700',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#00f0ff',
            background: 'rgba(8, 17, 36, 0.94)',
            border: '1.5px solid #00f0ff',
            padding: '6px 18px',
            borderRadius: '8px',
            whiteSpace: 'normal',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.35), 0 8px 24px rgba(0,0,0,0.7)'
          }}
        >
          {exp.dateStr}
        </span>
        {/* Location badge positioned clearly under the milestone date */}
        <span
          style={{
            fontSize: 'clamp(0.7rem, 1vw, 0.86rem)',
            fontWeight: '600',
            color: '#3AC5A3',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: 'rgba(5, 12, 26, 0.9)',
            border: '1px solid rgba(58, 197, 163, 0.35)',
            padding: '4px 14px',
            borderRadius: '6px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            whiteSpace: 'normal'
          }}
        >
          📍 {cityInfo.city}
        </span>
      </div>

      {/* ── Active Experience Card (Left or Right) ── */}
      <div
        className="timeline-card-wrapper"
        style={{
          width: 'calc(42% - clamp(40px, 5.5vw, 85px))',
          marginLeft: isLeft ? '8%' : 'auto',
          marginRight: isLeft ? 'auto' : '8%',
          perspective: '1200px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={(event) => onSelect(exp, event.currentTarget)}
      >
        <div
          className="timeline-parallax-card"
          style={{
            background: isHovered ? 'rgba(10, 24, 48, 0.98)' : 'rgba(8, 18, 38, 0.92)',
            border: `1.8px solid ${isHovered ? '#3AC5A3' : 'rgba(58, 197, 163, 0.5)'}`,
            borderRadius: '18px',
            padding: 'clamp(12px, 2.2vmin, 28px) clamp(14px, 2.5vmin, 32px)',
            cursor: 'pointer',
            boxShadow: isHovered
              ? '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(58, 197, 163, 0.35)'
              : '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(58, 197, 163, 0.15)',
            backdropFilter: 'blur(16px)',
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${isHovered ? '10px' : '0px'})`,
            transformStyle: 'preserve-3d',
            transition: isHovered
              ? 'transform 0.1s ease-out'
              : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s, box-shadow 0.25s',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Hover Specular Glare */}
          {isHovered && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at ${(mouseTilt.x + 1) * 50}% ${(mouseTilt.y + 1) * 50}%, rgba(58, 197, 163, 0.2) 0%, transparent 60%)`,
                pointerEvents: 'none'
              }}
            />
          )}

          {/* Header Row: Company Logo & Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              transform: 'translateZ(20px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: 'clamp(28px, 4vmin, 50px)',
                  height: 'clamp(28px, 4vmin, 50px)',
                  borderRadius: '12px',
                  background: '#ffffff',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <img
                  src={exp.logo}
                  alt={exp.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 'clamp(1rem, 2.1vmin, 1.6rem)',
                    fontWeight: '700',
                    color: '#ffffff',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    lineHeight: '1.15',
                    margin: 0
                  }}
                >
                  {exp.title}
                </h3>
                <div style={{ marginTop: '4px' }}>
                  <span
                    style={{
                      color: '#3AC5A3',
                      fontSize: 'clamp(0.8rem, 1.5vmin, 1.02rem)',
                      fontWeight: '600',
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    {exp.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Click detail prompt arrow */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3AC5A3"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isHovered ? 'translateX(4px) translateY(-2px)' : 'none',
                transition: 'transform 0.2s ease',
                flexShrink: 0
              }}
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </div>

          {/* Description Paragraph */}
          <p
            style={{
              fontSize: 'clamp(0.8rem, 1.5vmin, 1rem)',
              lineHeight: '1.65',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '20px',
              transform: 'translateZ(10px)'
            }}
          >
            {exp.shortDesc}
          </p>

          {/* Tech Tags Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              transform: 'translateZ(15px)'
            }}
          >
            {exp.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#3AC5A3',
                  background: 'rgba(58, 197, 163, 0.1)',
                  border: '1px solid rgba(58, 197, 163, 0.3)',
                  padding: '4px 11px',
                  borderRadius: '6px'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Pinned "One Experience Per Scroll" Timeline Runway ─────────────────────
const ParallaxExperienceTimeline = ({ onSelectExperience }) => {
  const runwayRef = useRef(null);
  const stickyRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [idleExperienceIndex, setIdleExperienceIndex] = useState(null);
  const isTransitioningRef = useRef(false);

  const totalSteps = experiences.length;

  // Reveal the next-step hint only after navigation has been idle for 2 seconds.
  useEffect(() => {
    let timer;
    const viewport = stickyRef.current;
    const resetIdle = () => {
      clearTimeout(timer);
      setIdleExperienceIndex(null);
      timer = setTimeout(() => {
        const rect = runwayRef.current?.getBoundingClientRect();
        const midpoint = window.innerHeight / 2;
        if (!document.hidden && rect && rect.top <= midpoint && rect.bottom > midpoint) {
          setIdleExperienceIndex(activeIndex);
        }
      }, 2000);
    };

    window.addEventListener('scroll', resetIdle, { passive: true });
    document.addEventListener('visibilitychange', resetIdle);
    const activityEvents = ['wheel', 'touchmove'];
    activityEvents.forEach((event) => viewport?.addEventListener(event, resetIdle, { passive: true }));
    resetIdle();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', resetIdle);
      document.removeEventListener('visibilitychange', resetIdle);
      activityEvents.forEach((event) => viewport?.removeEventListener(event, resetIdle));
    };
  }, [activeIndex]);

  const showNextArrow = idleExperienceIndex === activeIndex;

  // Window scroll handler: maps vertical position inside runway to exact experience step
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!runwayRef.current || ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        if (!runwayRef.current) {
          ticking = false;
          return;
        }

        const rect = runwayRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight || 800;
        const totalDistance = runwayRef.current.offsetHeight - viewportHeight;

        if (totalDistance <= 0) {
          ticking = false;
          return;
        }

        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / totalDistance));

        // Exact index calculation: advances 1 experience per scroll step
        const calculatedIndex = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));
        setActiveIndex(calculatedIndex);

        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalSteps]);

  // Wheel event interceptor: snaps exactly ONE experience per wheel flick
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (!runwayRef.current) return;
      const rect = runwayRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 800;

      // Only intercept when the section is locked/sticky
      const isPinned = rect.top <= 5 && rect.bottom >= viewportHeight - 5;
      if (!isPinned) return;

      const delta = e.deltaY;
      if (Math.abs(delta) < 25) return; // ignore subtle trackpad jitter

      // Cooldown to prevent multi-skipping during one flick
      if (isTransitioningRef.current) {
        e.preventDefault();
        return;
      }

      const totalDistance = runwayRef.current.offsetHeight - viewportHeight;
      const stepDistance = totalDistance / (totalSteps - 1);

      if (delta > 0) {
        // Scrolling DOWN
        if (activeIndex < totalSteps - 1) {
          e.preventDefault();
          isTransitioningRef.current = true;
          const nextIndex = activeIndex + 1;
          const targetY = window.pageYOffset + rect.top + (nextIndex * stepDistance);
          window.scrollTo({ top: targetY, behavior: 'smooth' });
          setTimeout(() => { isTransitioningRef.current = false; }, 1050);
        }
        // If already at last experience, let the page naturally scroll down to Projects!
      } else if (delta < 0) {
        // Scrolling UP
        if (activeIndex > 0) {
          e.preventDefault();
          isTransitioningRef.current = true;
          const prevIndex = activeIndex - 1;
          const targetY = window.pageYOffset + rect.top + (prevIndex * stepDistance);
          window.scrollTo({ top: targetY, behavior: 'smooth' });
          setTimeout(() => { isTransitioningRef.current = false; }, 1050);
        }
        // If already at first experience, let the page naturally scroll up to About!
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeIndex, totalSteps]);

  // Jump to specific experience step (buttons / bullets)
  const jumpToStep = (index) => {
    if (!runwayRef.current) return;
    const rect = runwayRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 800;
    const totalDistance = runwayRef.current.offsetHeight - viewportHeight;
    const stepDistance = totalDistance / (totalSteps - 1);
    const targetY = window.pageYOffset + rect.top + (index * stepDistance);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const activeExp = experiences[activeIndex] || experiences[0];
  const [debouncedExpId, setDebouncedExpId] = useState(activeExp.id);

  // Debounce the map camera flight slightly so fast scrolling doesn't spam intermediate coordinates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedExpId(activeExp.id);
    }, 75);
    return () => clearTimeout(timer);
  }, [activeExp.id]);

  return (
    <div
      ref={runwayRef}
      className="experience-stepped-runway"
      style={{
        position: 'relative',
        height: `${totalSteps * 100}vh`, // Exactly 1 viewport height runway per experience
        width: '100%'
      }}
    >
      {/* ── Sticky 100vh Viewport: Showcases 1 Experience at a Time ── */}
      <div
        ref={stickyRef}
        className="experience-sticky-viewport"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: '#020716',
          zIndex: 8
        }}
      >
        {/* ── Full-Bleed Google Maps Background ── */}
        <TimelineGoogleMap
          activeExpId={debouncedExpId}
          onSelectExperience={onSelectExperience}
        />

        {/* ── Blurry Gradient Blend (Hi I'm Toby Section ↔ Map) ── */}
        <div className="about-map-blurry-transition" aria-hidden="true">
          <div className="blur-backdrop" />
          <div className="color-gradient" />
        </div>

        {/* ── Top Bar with Indicator, Step Controls & Progress (Floating Header) ── */}
        <div
          className="timeline-overlay-header"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 25,
            padding: '24px clamp(24px, 5vw, 60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', pointerEvents: 'auto' }}>
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#3AC5A3',
                letterSpacing: '2px'
              }}
            >
              02
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
              EXPERI<span style={{ color: '#3AC5A3' }}>ENCE</span>
            </h2>
            <span
              style={{
                fontSize: '0.85rem',
                color: '#a0a0ab',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'rgba(10, 20, 42, 0.8)',
                border: '1px solid rgba(58, 197, 163, 0.3)',
                padding: '4px 12px',
                borderRadius: '6px'
              }}
            >
              {activeIndex + 1} / {totalSteps}
            </span>
          </div>
        </div>

        {/* ── Main Stage: Central Spine & Exactly 1 Highlighted Experience (Exact 50vh alignment with map) ── */}
        <div
          className="timeline-overlay-stage"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '0 clamp(20px, 4vw, 50px)',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          {/* Central Spine Line (Runs vertically right through the middle) */}
          <div
            className="timeline-central-spine"
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '3px',
              background: 'rgba(58, 197, 163, 0.2)',
              transform: 'translateX(-50%)',
              zIndex: 5,
              borderRadius: '999px'
            }}
          >
            {/* Glowing Laser Fill down the spine */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${((activeIndex + 1) / totalSteps) * 100}%`,
                background: 'linear-gradient(180deg, #3AC5A3 0%, #00f0ff 80%, #ffffff 100%)',
                boxShadow: '0 0 14px #3AC5A3, 0 0 24px #00f0ff',
                borderRadius: '999px',
                transition: 'height 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </div>

          {/* Stepped Experience Cards: Directional Crossfade with Depth Blur */}
          {experiences.map((exp, idx) => (
            <SteppedExperienceCard
              key={exp.id}
              exp={exp}
              index={idx}
              activeIndex={activeIndex}
              onSelect={onSelectExperience}
            />
          ))}
        </div>

        {/* ── Next control near the bottom of the timeline spine ── */}
        <div
          className={`timeline-center-navigation${showNextArrow ? ' is-visible' : ''}`}
          aria-hidden={!showNextArrow}
        >
          <button
            type="button"
            className="timeline-center-nav-button"
            onClick={() => jumpToStep(activeIndex + 1)}
            disabled={!showNextArrow || activeIndex === totalSteps - 1}
            aria-label="Next experience"
            title="Next experience"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
            </svg>
          </button>
        </div>

        {/* ── Vertical Milestone Bullets (Right side indicator) ── */}
        <div
          className="timeline-milestone-navigation"
          style={{
            position: 'absolute',
            right: 'clamp(8px, 1.8vw, 24px)',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 25
          }}
        >
          {experiences.map((exp, idx) => (
            <button
              key={exp.id}
              onClick={() => jumpToStep(idx)}
              style={{
                width: idx === activeIndex ? '28px' : '10px',
                height: '10px',
                borderRadius: '999px',
                background: idx === activeIndex ? '#00f0ff' : 'rgba(58, 197, 163, 0.3)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: idx === activeIndex ? '0 0 12px #00f0ff' : 'none'
              }}
              title={exp.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParallaxExperienceTimeline;
