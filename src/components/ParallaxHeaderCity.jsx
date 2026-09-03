import React, { useState, useEffect, useRef } from 'react';

// Geometric star positions across the canvas
const STARS = [
  { left: '8%', top: '12%', type: 'triangle', size: 10, delay: '0.2s' },
  { left: '22%', top: '28%', type: 'square', size: 7, delay: '1.4s' },
  { left: '38%', top: '15%', type: 'triangle', size: 8, delay: '0.8s' },
  { left: '52%', top: '35%', type: 'square', size: 6, delay: '2.1s' },
  { left: '68%', top: '18%', type: 'triangle', size: 9, delay: '1.7s' },
  { left: '82%', top: '25%', type: 'square', size: 8, delay: '0.5s' },
  { left: '92%', top: '45%', type: 'triangle', size: 7, delay: '2.8s' },
  { left: '14%', top: '55%', type: 'square', size: 7, delay: '1.9s' },
  { left: '76%', top: '65%', type: 'triangle', size: 8, delay: '0.3s' },
  { left: '88%', top: '75%', type: 'square', size: 6, delay: '1.1s' },
  { left: '30%', top: '70%', type: 'triangle', size: 10, delay: '2.5s' },
];

const SHOOTING_STARS = [
  { top: '15%', left: '20%', delay: '0s' },
  { top: '35%', left: '45%', delay: '3.5s' },
  { top: '25%', left: '75%', delay: '7s' },
  { top: '50%', left: '10%', delay: '5s' },
];

const ParallaxHeaderCity = ({ scrollProgress = 0, mouseOffset = { x: 0, y: 0 } }) => {
  // Parallax translation factors for different depth layers
  // Layer 1 (closest, moves fastest) to Layer 5/Back (farthest, moves slowest)
  const titleY = scrollProgress * 300;
  const titleOpacity = Math.max(0, 1 - scrollProgress * 2.2);

  const layerBackY = -scrollProgress * 220 + mouseOffset.y * 10;
  const layerSideY = -scrollProgress * 420 + mouseOffset.y * 14;
  const layer1Y = -scrollProgress * 650 + mouseOffset.y * 22;
  const layer2Y = -scrollProgress * 550 + mouseOffset.y * 18;
  const layer3Y = -scrollProgress * 450 + mouseOffset.y * 16;
  const layer4Y = -scrollProgress * 360 + mouseOffset.y * 12;
  const layer5Y = -scrollProgress * 280 + mouseOffset.y * 8;

  return (
    <div className="parallax-header-content">
      {/* Stars Background */}
      <div className="parallax-stars">
        {STARS.map((s, idx) => (
          <div
            key={idx}
            className="star-geo"
            style={{
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: s.delay,
              transform: `translate(${mouseOffset.x * 15}px, ${mouseOffset.y * 15}px) rotate(45deg)`
            }}
          />
        ))}
      </div>

      {/* Shooting Stars */}
      <div className="shooting-stars">
        {SHOOTING_STARS.map((ss, idx) => (
          <div
            key={idx}
            className="shooting-star"
            style={{
              top: ss.top,
              left: ss.left,
              animationDelay: ss.delay
            }}
          />
        ))}
      </div>

      {/* Hero Title with Chromatic Glitch effect */}
      <div
        className="parallax-header-title"
        style={{
          transform: `translate3d(${mouseOffset.x * 25}px, calc(-50% + ${titleY}px), 0)`,
          opacity: titleOpacity
        }}
      >
        <h1 className="parallax-title-main">
          Toby Yeung
        </h1>
        <div className="parallax-title-sub">
          Full Stack &amp; AI Systems Engineer
        </div>
        <div className="parallax-title-tags">
          <span className="parallax-tag">CS &amp; Economics @ UIUC</span>
          <span className="parallax-tag">AI Researcher</span>
          <span className="parallax-tag">FastAPI × React × RAG</span>
        </div>
      </div>

      {/* ─── Isometric Architectural Layers (Vector Buildings) ─── */}

      {/* Layer: Distant Backdrop Horizon */}
      <div
        className="house-layer"
        style={{
          left: '10%',
          width: '80%',
          zIndex: 1,
          transform: `translate3d(0, ${layerBackY}px, 0)`
        }}
      >
        <svg viewBox="0 0 1000 700" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Distant building blocks */}
          <polygon points="200,700 200,300 350,220 500,300 500,700" fill="#08142e" opacity="0.75" />
          <polygon points="350,220 500,300 500,700 350,700" fill="#050e22" opacity="0.75" />
          {/* Grid lines on background structure */}
          <line x1="240" y1="320" x2="240" y2="700" stroke="#3AC5A3" strokeWidth="1" opacity="0.15" />
          <line x1="300" y1="280" x2="300" y2="700" stroke="#3AC5A3" strokeWidth="1" opacity="0.15" />
          <line x1="400" y1="280" x2="400" y2="700" stroke="#3AC5A3" strokeWidth="1" opacity="0.15" />
          {/* Subtle neon spires */}
          <line x1="350" y1="120" x2="350" y2="220" stroke="#3AC5A3" strokeWidth="2" opacity="0.7" />
          <circle cx="350" cy="115" r="4" fill="#3AC5A3" />
        </svg>
      </div>

      {/* Layer 5: Deep Middle Towers */}
      <div
        className="house-layer"
        style={{
          left: '28%',
          width: '44%',
          zIndex: 2,
          transform: `translate3d(0, ${layer5Y}px, 0)`
        }}
      >
        <svg viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Geometric hexagonal tower */}
          <polygon points="120,800 120,240 300,140 480,240 480,800" fill="#091838" />
          <polygon points="300,140 480,240 480,800 300,800" fill="#061128" />
          {/* Isometric roof facet */}
          <polygon points="120,240 300,140 300,170 120,270" fill="#152b57" />
          {/* Glowing teal server window slits */}
          <rect x="180" y="290" width="30" height="8" rx="2" fill="#3AC5A3" opacity="0.8" />
          <rect x="230" y="290" width="30" height="8" rx="2" fill="#3AC5A3" opacity="0.8" />
          <rect x="180" y="340" width="30" height="8" rx="2" fill="#38bdf8" opacity="0.7" />
          <rect x="230" y="340" width="30" height="8" rx="2" fill="#38bdf8" opacity="0.7" />
          <rect x="180" y="390" width="80" height="8" rx="2" fill="#3AC5A3" opacity="0.85" />
          {/* Antenna */}
          <line x1="300" y1="70" x2="300" y2="140" stroke="#38bdf8" strokeWidth="2.5" />
          <circle cx="300" cy="65" r="5" fill="#38bdf8" />
        </svg>
      </div>

      {/* Layer 4: Left Angled Tower */}
      <div
        className="house-layer"
        style={{
          left: '12%',
          width: '28%',
          zIndex: 3,
          transform: `translate3d(0, ${layer4Y}px, 0)`
        }}
      >
        <svg viewBox="0 0 400 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,900 50,280 220,180 350,250 350,900" fill="#0d214a" />
          <polygon points="220,180 350,250 350,900 220,900" fill="#091836" />
          {/* Cyber accents */}
          <line x1="80" y1="350" x2="190" y2="285" stroke="#3AC5A3" strokeWidth="2" opacity="0.6" />
          <line x1="80" y1="400" x2="190" y2="335" stroke="#3AC5A3" strokeWidth="2" opacity="0.6" />
          <circle cx="135" cy="460" r="16" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.5" />
          <circle cx="135" cy="460" r="6" fill="#38bdf8" opacity="0.7" />
        </svg>
      </div>

      {/* Layer 3: Right Tower */}
      <div
        className="house-layer"
        style={{
          right: '12%',
          width: '28%',
          zIndex: 3,
          transform: `translate3d(0, ${layer3Y}px, 0)`
        }}
      >
        <svg viewBox="0 0 400 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="30,900 30,220 180,130 330,220 330,900" fill="#0c1f44" />
          <polygon points="180,130 330,220 330,900 180,900" fill="#07142d" />
          {/* Windows / Cyber Traces */}
          <rect x="70" y="290" width="50" height="12" rx="3" fill="#3AC5A3" opacity="0.8" />
          <rect x="70" y="340" width="50" height="12" rx="3" fill="#3AC5A3" opacity="0.5" />
          <rect x="70" y="390" width="50" height="12" rx="3" fill="#38bdf8" opacity="0.8" />
        </svg>
      </div>

      {/* Layer 2: Main Central Hub */}
      <div
        className="house-layer"
        style={{
          left: '34%',
          width: '32%',
          zIndex: 4,
          transform: `translate3d(0, ${layer2Y}px, 0)`
        }}
      >
        <svg viewBox="0 0 500 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main front skyscraper facade */}
          <polygon points="60,1000 60,180 250,70 440,180 440,1000" fill="#102958" />
          <polygon points="250,70 440,180 440,1000 250,1000" fill="#0a1c3d" />
          {/* Glowing edge trim */}
          <line x1="60" y1="180" x2="250" y2="70" stroke="#3AC5A3" strokeWidth="3" />
          <line x1="250" y1="70" x2="440" y2="180" stroke="#38bdf8" strokeWidth="3" />
          <line x1="250" y1="70" x2="250" y2="1000" stroke="#3AC5A3" strokeWidth="2" opacity="0.4" />
          {/* Data center grid lights */}
          <g opacity="0.9">
            <rect x="110" y="240" width="40" height="16" rx="3" fill="#3AC5A3" />
            <rect x="170" y="240" width="40" height="16" rx="3" fill="#3AC5A3" />
            <rect x="110" y="290" width="40" height="16" rx="3" fill="#38bdf8" />
            <rect x="170" y="290" width="40" height="16" rx="3" fill="#38bdf8" />
            <rect x="110" y="340" width="100" height="16" rx="3" fill="#3AC5A3" />
            <rect x="110" y="390" width="40" height="16" rx="3" fill="#3AC5A3" />
            <rect x="170" y="390" width="40" height="16" rx="3" fill="#38bdf8" />
          </g>
          {/* Spire */}
          <line x1="250" y1="10" x2="250" y2="70" stroke="#3AC5A3" strokeWidth="3" />
          <circle cx="250" cy="8" r="6" fill="#3AC5A3" />
        </svg>
      </div>

      {/* Layer: Left & Right Foreground Silhouettes (Side wings) */}
      <div
        className="house-layer"
        style={{
          left: '-15%',
          width: '45%',
          zIndex: 5,
          transform: `translate3d(0, ${layerSideY}px, 0)`
        }}
      >
        <svg viewBox="0 0 600 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,1200 0,260 380,480 600,600 600,1200" fill="#061126" />
          <line x1="0" y1="260" x2="380" y2="480" stroke="#3AC5A3" strokeWidth="2.5" opacity="0.7" />
        </svg>
      </div>

      <div
        className="house-layer"
        style={{
          right: '-15%',
          width: '45%',
          zIndex: 5,
          transform: `translate3d(0, ${layerSideY}px, 0)`
        }}
      >
        <svg viewBox="0 0 600 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="600,1200 600,260 220,480 0,600 0,1200" fill="#040c1c" />
          <line x1="600" y1="260" x2="220" y2="480" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />
        </svg>
      </div>

      {/* Layer 1: Foreground Geometric Blocks */}
      <div
        className="house-layer"
        style={{
          left: '20%',
          width: '60%',
          zIndex: 6,
          transform: `translate3d(0, ${layer1Y}px, 0)`
        }}
      >
        <svg viewBox="0 0 800 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="180,1000 180,500 320,420 460,500 460,1000" fill="#14326b" />
          <polygon points="320,420 460,500 460,1000 320,1000" fill="#0d244f" />
          <line x1="180" y1="500" x2="320" y2="420" stroke="#3AC5A3" strokeWidth="3" />
          <line x1="320" y1="420" x2="460" y2="500" stroke="#3AC5A3" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
};

export default ParallaxHeaderCity;
