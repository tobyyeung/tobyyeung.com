import React, { useState, useEffect, useRef } from 'react';

const COMMAND = 'start https://tobyyeung.github.io/web/';
const TYPE_SPEED = 55;
const PAUSE_AFTER_CMD = 500;
const WEBSITE_SHOW_DURATION = 2500;
const SHUTTER_CLOSE_MS = 500;
const SHUTTER_HOLD_MS = 300;
const SHUTTER_OPEN_MS = 500;

const HeroVisual = () => {
  const [phase, setPhase] = useState('terminal');
  const [typed, setTyped] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showFlash, setShowFlash] = useState(false);
  const timeoutRef = useRef(null);

  // Typing
  useEffect(() => {
    if (phase !== 'terminal') return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i <= COMMAND.length) setTyped(COMMAND.slice(0, i));
      else {
        clearInterval(interval);
        timeoutRef.current = setTimeout(() => setPhase('website'), PAUSE_AFTER_CMD);
      }
    }, TYPE_SPEED);
    return () => { clearInterval(interval); if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [phase]);

  // Cursor blink
  useEffect(() => {
    if (phase !== 'terminal') return;
    const blink = setInterval(() => setShowCursor(c => !c), 530);
    return () => clearInterval(blink);
  }, [phase]);

  // Website → shutter close
  useEffect(() => {
    if (phase !== 'website') return;
    const t = setTimeout(() => setPhase('shutter-close'), WEBSITE_SHOW_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  // Close → hold + flash
  useEffect(() => {
    if (phase !== 'shutter-close') return;
    const t = setTimeout(() => {
      setShowFlash(true);
      setPhase('shutter-hold');
    }, SHUTTER_CLOSE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Hold → open
  useEffect(() => {
    if (phase !== 'shutter-hold') return;
    const t = setTimeout(() => setPhase('shutter-open'), SHUTTER_HOLD_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Open → camera
  useEffect(() => {
    if (phase !== 'shutter-open') return;
    const t = setTimeout(() => setPhase('camera'), SHUTTER_OPEN_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Flash fade (decoupled)
  useEffect(() => {
    if (!showFlash) return;
    const t = setTimeout(() => setShowFlash(false), 600);
    return () => clearTimeout(t);
  }, [showFlash]);

  const isClosed = phase === 'shutter-close' || phase === 'shutter-hold';
  const showShutter = phase === 'website' || phase === 'shutter-close' || phase === 'shutter-hold' || phase === 'shutter-open';
  const showCamera = phase === 'shutter-hold' || phase === 'shutter-open' || phase === 'camera';
  const isCameraPhase = phase === 'camera';

  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: '450px', aspectRatio: '3/2',
      // NO overflow: hidden here, so the camera's shadows can extend beautifully!
    }}>

      {/* ===== UNCLIPPED CONTENT (Camera) ===== */}
      {/* Kept behind the clipped shutter/terminal so it reveals smoothly */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: showCamera ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: isCameraPhase ? 'auto' : 'none',
        zIndex: 1,
      }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '32px', background: 'linear-gradient(145deg, rgba(20, 30, 50, 0.8), #040812)', border: '2px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: '-12px', right: '40px', width: '45px', height: '12px', borderRadius: '6px 6px 0 0', background: 'linear-gradient(to bottom, #444, #222)', border: '2px solid rgba(255,255,255,0.1)', borderBottom: 'none' }} />
          <div style={{ position: 'absolute', top: '-8px', right: '100px', width: '35px', height: '8px', borderRadius: '4px 4px 0 0', background: '#333', border: '1px solid #111', borderBottom: 'none', backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)' }} />
          <div style={{ position: 'absolute', top: '25px', left: '30px', width: '50px', height: '25px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 0 15px rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '80%', height: '40%', background: 'rgba(255,255,255,0.8)', borderRadius: '2px', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
          </div>
          <div style={{ position: 'absolute', top: '30px', right: '35px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 10px var(--danger)', animation: 'blink 2s infinite' }} />
          <div style={{ position: 'relative', width: '65%', aspectRatio: '1/1', borderRadius: '50%', padding: '12px', background: 'linear-gradient(135deg, #333, #111)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 15px 35px rgba(0,0,0,0.6)' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', padding: '4px', background: 'var(--accent-gradient)' }}>
              <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', border: '8px solid #050505', overflow: 'hidden', background: '#000', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 10 }} />
                <img className="camera-pan" src={import.meta.env.BASE_URL + "images/self.jpg"} alt="Toby Yeung" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CLIPPED CONTENT (Terminal, Website, Shutter) ===== */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '16px', overflow: 'hidden',
        pointerEvents: isCameraPhase ? 'none' : 'auto',
        opacity: isCameraPhase ? 0 : 1, // Completely fade out clipped wrapper when done
        transition: 'opacity 0.2s ease',
        zIndex: 2,
      }}>

        {/* ===== TERMINAL ===== */}
        <div style={{
          position: 'absolute', inset: 0,
          opacity: phase === 'terminal' ? 1 : 0,
          transform: phase === 'terminal' ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          pointerEvents: phase === 'terminal' ? 'auto' : 'none',
          zIndex: 3,
        }}>
          <div style={{ width: '100%', height: '100%', background: '#0c0c0c', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex', alignItems: 'center', padding: '8px 14px',
              background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.06)',
              gap: '8px', minHeight: '36px',
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontFamily: "'Consolas', monospace", marginLeft: '8px' }}>Command Prompt</span>
            </div>
            <div style={{ flex: 1, padding: '16px 18px', fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace", fontSize: 'clamp(0.7rem, 1.3vw, 0.9rem)', lineHeight: '1.7', color: '#cccccc', overflow: 'hidden' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>Microsoft Windows [Version 10.0.26100]</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>(c) Microsoft Corporation. All rights reserved.</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', wordBreak: 'break-all' }}>
                <span style={{ color: '#e5c07b', whiteSpace: 'nowrap' }}>C:\Users\Toby&gt;&nbsp;</span>
                <span style={{ color: '#3AC5A3' }}>{typed}</span>
                <span style={{ color: '#3AC5A3', opacity: showCursor ? 1 : 0, transition: 'opacity 0.05s', fontWeight: 'bold' }}>▌</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== FAKE WEBSITE ===== */}
        <div style={{
          position: 'absolute', inset: 0,
          opacity: (phase === 'website' || phase === 'shutter-close') ? 1 : 0,
          transform: (phase === 'website' || phase === 'shutter-close') ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          pointerEvents: 'none', zIndex: 2,
        }}>
          <div style={{ width: '100%', height: '100%', background: '#0A1325', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '8px', minHeight: '32px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '3px 10px', fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif", overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>🔒 </span>tobyyeung.github.io/web/
              </div>
            </div>
            <div style={{ flex: 1, background: 'linear-gradient(180deg, #0e1a30 0%, #0A1325 100%)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ color: '#3AC5A3', fontSize: '0.6rem', fontWeight: '700', fontFamily: "'Outfit', sans-serif", fontStyle: 'italic' }}>Toby Yeung</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Experience', 'Projects', 'Education'].map(item => (
                    <div key={item} style={{ width: item.length * 3.5, height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px' }} />
                  ))}
                  <div style={{ width: '32px', height: '10px', background: '#3AC5A3', borderRadius: '5px', marginTop: '-3px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ width: '40px', height: '5px', background: 'rgba(255,255,255,0.25)', borderRadius: '2px' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', fontFamily: "'Outfit', sans-serif", background: 'linear-gradient(to right, #3AC5A3, #2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: '1.1' }}>Toby Yeung</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                    <div style={{ width: '90%', height: '3px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px' }} />
                    <div style={{ width: '75%', height: '3px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px' }} />
                    <div style={{ width: '60%', height: '3px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    <div style={{ width: '40px', height: '10px', background: '#3AC5A3', borderRadius: '4px' }} />
                    <div style={{ width: '14px', height: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px' }} />
                    <div style={{ width: '14px', height: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px' }} />
                  </div>
                </div>
                <div style={{ width: '60px', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #333, #111)', border: '2px solid #3AC5A3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'linear-gradient(135deg, #8ba4b8, #4a6f8a)', border: '2px solid #111' }} />
                  </div>
                </div>
              </div>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(58,197,163,0.4), transparent)', animation: 'heroScanDown 2s ease-in-out infinite', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* ===== SHUTTER BLADES ===== */}
        {showShutter && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 6,
            overflow: 'hidden', pointerEvents: 'none',
            // Punches a 36px radius hole. Since the blades naturally form an octagon with 34.8px inscribed radius 
            // and 37.7px circumscribed radius, this mask perfectly shaves off the sharp corners to round them!
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 36px, black 37px)',
            maskImage: 'radial-gradient(circle at 50% 50%, transparent 36px, black 37px)',
          }}>
            {/* Exact center point for translational shutter math */}
          <div style={{
            position: 'absolute',
            width: 0, height: 0,
            left: '50%', top: '50%',
          }}>
            {Array.from({ length: 11 }, (_, i) => {
              const polygon_sides = 10; // Exactly 10 sides as requested
              const virtual_i = i % polygon_sides;
              const angle_increment = (Math.PI * 2) / polygon_sides;
              const exterior_angle = angle_increment;
              
              // Exact user math for translating blades (sliding instead of rotating!)
              const radius = isClosed ? 35 : 1200; 
              const x = radius * Math.cos(angle_increment * virtual_i);
              const y = -radius * Math.sin(angle_increment * virtual_i); // CSS Y is inverted
              
              const rotationDeg = (-Math.PI / 2 - exterior_angle / 2 - exterior_angle * virtual_i) * (180 / Math.PI);
              
              const isPatch = i === polygon_sides;
              // 36 degrees = 0.628 rad. Patch is 15 degrees = 0.26 rad.
              // Add 0.01 rad (0.5 deg) overlap to structural blades to seal anti-aliasing gaps.
              const wedge_angle = isPatch ? 0.26 : exterior_angle + 0.01;
              const clipPoly = `polygon(0 0, 100% 0, 100% ${Math.tan(wedge_angle) * 100}%)`;
              
              return (
                <div key={i} style={{
                  position: 'absolute',
                  left: 0, top: 0,
                  transform: `translate(${x}px, ${y}px) rotate(${rotationDeg}deg)`,
                  transformOrigin: '0 0',
                  transition: `transform ${isClosed ? SHUTTER_CLOSE_MS : SHUTTER_OPEN_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                  // Drop shadow gives the overlapping fan effect
                  filter: 'drop-shadow(2px 5px 10px rgba(0,0,0,0.8))',
                }}>
                  <div style={{
                    width: '2000px', height: '2000px',
                    transformOrigin: '0 0',
                    WebkitClipPath: clipPoly,
                    clipPath: clipPoly,
                    // Exact user template colors and 1px stroke highlight
                    background: 'linear-gradient(90deg, #222 0%, #000 30%, #000 100%)',
                    boxShadow: 'inset 0 1px 0 #444',
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

        {/* ===== FLASH ===== */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,255,255,0.98)',
          opacity: showFlash ? 1 : 0,
          transition: showFlash ? 'opacity 0.05s ease-in' : 'opacity 0.4s ease-out',
          zIndex: 5, pointerEvents: 'none', borderRadius: 'inherit',
        }} />

      </div>

      <style>{`
        @keyframes heroScanDown {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default HeroVisual;
