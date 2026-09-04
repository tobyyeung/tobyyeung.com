import { useEffect, useRef, useState } from 'react';
import images from '../data/meteorImages.json';
import '../styles/imageMeteorShower.css';

const TRAIL_COLORS = ['#35dcc9', '#60a5fa', '#c084fc', '#fb7185', '#fbbf24', '#a3e635'];
const WAVES = 5;
const METEORS_PER_WAVE = 7;
const WAVE_SPACING = 0.8;
const FLIGHT_DURATION = 3.2;
const SEQUENCE_DURATION = 7200;

export default function ImageMeteorShower() {
  const [meteors, setMeteors] = useState([]);
  const containerRef = useRef(null);
  const nextId = useRef(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let previousY = window.scrollY;
    let lastSpawn = -Infinity;
    const spawn = () => {
      const now = Date.now();
      const bounds = containerRef.current.getBoundingClientRect();
      const burst = Array.from({ length: WAVES * METEORS_PER_WAVE }, (_, index) => {
        const wave = Math.floor(index / METEORS_PER_WAVE);
        const lane = index % METEORS_PER_WAVE;
        const size = 32 + Math.random() * 24;
        const availableHeight = Math.max(0, bounds.height - size - 16);
        const top = 8 + ((lane + 0.15 + Math.random() * 0.7) / METEORS_PER_WAVE) * availableHeight;
        const endY = Math.min(8 + availableHeight, Math.max(8, top + (Math.random() - 0.5) * availableHeight * 0.65));
        const drift = endY - top;
        return {
        id: nextId.current++,
        src: `${import.meta.env.BASE_URL}${images[Math.floor(Math.random() * images.length)]}`,
        top,
        drift,
        trailAngle: Math.atan2(-drift, bounds.width + 260) * 180 / Math.PI,
        size,
        color: TRAIL_COLORS[(lane + wave) % TRAIL_COLORS.length],
        delay: wave * WAVE_SPACING + Math.random() * 0.65,
        born: now,
        };
      });
      setMeteors(previous => [...previous.filter(meteor => now - meteor.born < SEQUENCE_DURATION), ...burst]);
    };
    const onScroll = () => {
      const y = window.scrollY;
      const downward = y > previousY;
      previousY = y;
      const rect = containerRef.current?.getBoundingClientRect();
      const visible = rect && rect.top < window.innerHeight && rect.bottom > 0;
      const running = downward && visible && !document.hidden && !reducedMotion.matches;
      if (!running) return;
      if (Date.now() - lastSpawn >= SEQUENCE_DURATION) {
        spawn();
        lastSpawn = Date.now();
      }
    };
    const stop = () => setMeteors([]);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', stop);
    reducedMotion.addEventListener('change', stop);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', stop);
      reducedMotion.removeEventListener('change', stop);
    };
  }, []);

  return (
    <div ref={containerRef} className="image-meteor-shower" aria-hidden="true">
      {meteors.map(meteor => (
        <div key={meteor.id} className="image-meteor" style={{
          top: `${meteor.top}px`, '--meteor-size': `${meteor.size}px`,
          '--meteor-drift': `${meteor.drift}px`, '--meteor-trail-angle': `${meteor.trailAngle}deg`,
          '--meteor-color': meteor.color, animationDuration: `${FLIGHT_DURATION}s`,
          animationDelay: `${meteor.delay}s`,
        }} onAnimationEnd={() => setMeteors(previous => previous.filter(item => item.id !== meteor.id))}>
          <img src={meteor.src} alt="" decoding="async" draggable="false" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />
        </div>
      ))}
    </div>
  );
}
