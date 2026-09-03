import React, { useState, useEffect, useRef, useCallback } from 'react';

// Authentic cyberpunk decryption glyphs (hex, matrix, logic symbols)
const CYBER_GLYPHS = '0123456789ABCDEF!@#$%^&*()_+-=[]{}|;:,.<>?/~';

// Line 1: "Hey! I'm" on the same line
const LINE1_TARGET = "Hey! I'm";
// Line 2: "Toby Yeung" in one line
const LINE2_NAME = 'Toby Yeung';

const TOTAL_CHARS = LINE1_TARGET.length + LINE2_NAME.length; // 18

const getRandomGlyph = () => CYBER_GLYPHS[Math.floor(Math.random() * CYBER_GLYPHS.length)];

const CyberDecryptHeading = () => {
  const containerRef = useRef(null);
  const [resolvedCount, setResolvedCount] = useState(TOTAL_CHARS); // initially full text
  const [randomGlyphs, setRandomGlyphs] = useState(() =>
    Array.from({ length: TOTAL_CHARS }, () => getRandomGlyph())
  );
  const [isDecrypting, setIsDecrypting] = useState(false);
  const intervalRef = useRef(null);
  const hasTriggeredOnScroll = useRef(false);

  // Main Decryption Loop: runs strictly ONCE on scroll into view
  const startDecryption = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setIsDecrypting(true);
    setResolvedCount(0);

    let currentResolved = 0;
    let tickCount = 0;

    intervalRef.current = setInterval(() => {
      tickCount++;

      // Scramble unresolved positions with random cyber glyphs every tick (35ms)
      setRandomGlyphs(Array.from({ length: TOTAL_CHARS }, () => getRandomGlyph()));

      // Resolve one letter every ~2 ticks (~70ms) for a smooth, deliberate reveal
      if (tickCount % 2 === 0) {
        currentResolved++;
        setResolvedCount(currentResolved);

        if (currentResolved >= TOTAL_CHARS) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsDecrypting(false);
        }
      }
    }, 35);
  }, []);

  // Trigger strictly ONCE when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggeredOnScroll.current) {
            hasTriggeredOnScroll.current = true;
            startDecryption();
            observer.disconnect(); // Disconnect permanently so it never triggers again
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startDecryption]);

  // Helper to render individual character
  const renderChar = (targetChar, globalIndex, isName = false) => {
    const isResolved = resolvedCount > globalIndex;

    // Preserve space characters
    if (targetChar === ' ') {
      return (
        <span key={globalIndex} style={{ display: 'inline-block', width: '0.3em' }}>
          &nbsp;
        </span>
      );
    }

    const charToDisplay = isResolved ? targetChar : randomGlyphs[globalIndex] || getRandomGlyph();

    if (isName) {
      return (
        <span
          key={globalIndex}
          className={isResolved ? 'glyph-name-resolved' : 'glyph-name-scrambling'}
        >
          {charToDisplay}
        </span>
      );
    }

    return (
      <span
        key={globalIndex}
        className={isResolved ? 'glyph-resolved' : 'glyph-scrambling'}
      >
        {charToDisplay}
      </span>
    );
  };

  return (
    <h1
      ref={containerRef}
      className="article-heading cyber-decrypt-heading"
      style={{ cursor: 'default', userSelect: 'none' }}
    >
      {/* Line 1: "Hey! I'm" on the same line */}
      <span className="decrypt-line" style={{ display: 'block', whiteSpace: 'nowrap' }}>
        {LINE1_TARGET.split('').map((char, i) => renderChar(char, i, false))}
      </span>
      {/* Line 2: "Toby Yeung" in one line */}
      <span className="decrypt-line" style={{ display: 'block', whiteSpace: 'nowrap' }}>
        <strong style={{ color: '#3AC5A3', whiteSpace: 'nowrap', display: 'inline-block' }}>
          {LINE2_NAME.split('').map((char, i) =>
            renderChar(char, LINE1_TARGET.length + i, true)
          )}
        </strong>
      </span>
      {isDecrypting && <span className="cyber-decrypt-cursor">▋</span>}
    </h1>
  );
};

export default CyberDecryptHeading;
