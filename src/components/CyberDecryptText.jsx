import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Diverse set of cyberpunk / matrix decryption glyphs
const CYBER_GLYPHS = '0123456789ABCDEF!@#$%^&*()_+-=[]{}|;:,.<>?/~';

const getRandomGlyph = () => CYBER_GLYPHS[Math.floor(Math.random() * CYBER_GLYPHS.length)];

/**
 * CyberDecryptText Component
 * 1. Initial play: Progressively decrypts text character-by-character on scroll into view.
 * 2. Post-initial hover: Only scrambles the characters immediately surrounding the cursor
 *    into continuously switching symbols, snapping back to normal when the mouse moves away.
 */
const CyberDecryptText = ({
  text,
  highlights = [],
  delay = 0,
  speed = 18,
  trigger = true,
  autoTriggerOnScroll = true,
  className = 'article-text',
  style = {}
}) => {
  const containerRef = useRef(null);
  const textLength = text.length;

  const [resolvedCount, setResolvedCount] = useState(textLength); // initially full text
  const [randomGlyphs, setRandomGlyphs] = useState(() =>
    Array.from({ length: textLength }, () => getRandomGlyph())
  );
  const [isDecrypting, setIsDecrypting] = useState(false);
  const hasFinishedInitial = useRef(false);
  const intervalRef = useRef(null);
  const hasTriggeredRef = useRef(false);

  // Active hover glitches: mapping of { [index]: glyph }
  const [hoverGlitches, setHoverGlitches] = useState({});
  const timeoutMapRef = useRef({});
  const hoverIntervalRef = useRef(null);

  // Precompute highlight spans for each character index
  const charTypes = useMemo(() => {
    const types = new Array(textLength).fill('normal');
    if (!highlights || highlights.length === 0) return types;

    highlights.forEach(({ text: matchText, className: type }) => {
      let startIndex = 0;
      while ((startIndex = text.indexOf(matchText, startIndex)) !== -1) {
        const endIndex = startIndex + matchText.length;
        for (let i = startIndex; i < endIndex; i++) {
          types[i] = type || 'strong';
        }
        startIndex = endIndex;
      }
    });

    return types;
  }, [text, textLength, highlights]);

  // Decryption Runner (Initial animation)
  const startDecryption = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setIsDecrypting(true);
    hasFinishedInitial.current = false;
    setResolvedCount(0);

    let currentResolved = 0;
    // Pacing across ~68 steps for deliberate duration (~2.1s)
    const charsPerStep = Math.max(1, Math.ceil(textLength / 68));

    intervalRef.current = setInterval(() => {
      setRandomGlyphs(Array.from({ length: textLength }, () => getRandomGlyph()));

      currentResolved += charsPerStep;
      setResolvedCount(Math.min(textLength, currentResolved));

      if (currentResolved >= textLength) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsDecrypting(false);
        hasFinishedInitial.current = true;
      }
    }, Math.max(32, speed));
  }, [textLength, speed]);

  // Scroll Trigger via IntersectionObserver
  useEffect(() => {
    if (!autoTriggerOnScroll) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            const timer = setTimeout(() => {
              startDecryption();
            }, delay);
            return () => clearTimeout(timer);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoTriggerOnScroll, delay, startDecryption]);

  // Manual trigger prop
  useEffect(() => {
    if (!autoTriggerOnScroll && trigger) {
      const timer = setTimeout(() => {
        startDecryption();
      }, delay);
      return () => {
        clearTimeout(timer);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [trigger, autoTriggerOnScroll, delay, startDecryption]);

  // Localized Cursor Scramble: Only triggered AFTER initial decryption has finished
  const handleCharHover = useCallback((hoverIndex) => {
    if (!hasFinishedInitial.current || isDecrypting) return;

    const RADIUS = 2; // Surrounding character radius (5 characters total)
    const updatedGlitches = {};

    for (let offset = -RADIUS; offset <= RADIUS; offset++) {
      const targetIdx = hoverIndex + offset;
      if (targetIdx >= 0 && targetIdx < textLength && text[targetIdx] !== ' ') {
        updatedGlitches[targetIdx] = getRandomGlyph();
      }
    }

    setHoverGlitches((prev) => ({
      ...prev,
      ...updatedGlitches
    }));

    // Reset snap-back timeouts for affected characters
    Object.keys(updatedGlitches).forEach((idxStr) => {
      const idx = parseInt(idxStr, 10);
      if (timeoutMapRef.current[idx]) {
        clearTimeout(timeoutMapRef.current[idx]);
      }
      timeoutMapRef.current[idx] = setTimeout(() => {
        setHoverGlitches((current) => {
          const next = { ...current };
          delete next[idx];
          return next;
        });
        delete timeoutMapRef.current[idx];
      }, 340 + Math.random() * 80);
    });
  }, [textLength, text, isDecrypting]);

  // Continuously cycle symbols while hover glitches are active
  useEffect(() => {
    const activeIndices = Object.keys(hoverGlitches);
    if (activeIndices.length === 0) {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
        hoverIntervalRef.current = null;
      }
      return;
    }

    if (!hoverIntervalRef.current) {
      hoverIntervalRef.current = setInterval(() => {
        setHoverGlitches((current) => {
          const currentKeys = Object.keys(current);
          if (currentKeys.length === 0) return current;
          const next = {};
          currentKeys.forEach((key) => {
            next[key] = getRandomGlyph();
          });
          return next;
        });
      }, 42);
    }
  }, [hoverGlitches]);

  // Clean up on unmount
  useEffect(() => {
    const timeouts = timeoutMapRef.current;
    return () => {
      Object.values(timeouts).forEach((t) => clearTimeout(t));
      if (hoverIntervalRef.current) clearInterval(hoverIntervalRef.current);
    };
  }, []);

  return (
    <p
      ref={containerRef}
      className={`${className} cyber-decrypt-paragraph`}
      style={{
        ...style,
        cursor: 'default',
        position: 'relative'
      }}
    >
      {text.split('').map((char, index) => {
        const isResolved = resolvedCount > index;

        // Preserve spaces
        if (char === ' ') {
          return (
            <span
              key={index}
              onMouseEnter={() => handleCharHover(index)}
              style={{ display: 'inline-block', width: '0.28em' }}
            >
              &nbsp;
            </span>
          );
        }

        const isHoverGlitched = Boolean(hoverGlitches[index]);
        const charToShow = isHoverGlitched
          ? hoverGlitches[index]
          : isResolved
            ? char
            : randomGlyphs[index] || getRandomGlyph();

        const type = charTypes[index];

        // Active localized hover scramble
        if (isHoverGlitched) {
          return (
            <span
              key={index}
              onMouseEnter={() => handleCharHover(index)}
              className="glyph-hover-scrambling"
            >
              {charToShow}
            </span>
          );
        }

        // Initial decryption scramble
        if (!isResolved) {
          return (
            <span key={index} className="glyph-p-scrambling">
              {charToShow}
            </span>
          );
        }

        // Resolved highlighted or normal text
        if (type === 'highlight') {
          return (
            <span
              key={index}
              onMouseEnter={() => handleCharHover(index)}
              className="highlight glyph-p-resolved"
            >
              {charToShow}
            </span>
          );
        }

        if (type === 'strong') {
          return (
            <strong
              key={index}
              onMouseEnter={() => handleCharHover(index)}
              className="glyph-p-resolved"
            >
              {charToShow}
            </strong>
          );
        }

        return (
          <span
            key={index}
            onMouseEnter={() => handleCharHover(index)}
            className="glyph-p-resolved"
          >
            {charToShow}
          </span>
        );
      })}

      {/* Trailing Cyber Cursor during initial decryption */}
      {isDecrypting && <span className="cyber-decrypt-cursor">▋</span>}
    </p>
  );
};

export default CyberDecryptText;
