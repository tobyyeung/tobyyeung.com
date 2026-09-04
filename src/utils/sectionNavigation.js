let cancelPrevious;

// Keep timeline snapping suspended for the full shortcut scroll, including
// intermediate positions inside its multi-screen runway.
export function scrollToSectionPosition(top) {
  cancelPrevious?.();
  window.dispatchEvent(new Event('portfolio:section-navigation'));
  const target = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
  let frame;
  let finished = false;
  let settled = 0;
  const started = performance.now();
  const finish = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frame);
    window.removeEventListener('wheel', interrupt);
    window.removeEventListener('touchstart', interrupt);
    window.removeEventListener('keydown', interruptKey);
    cancelPrevious = undefined;
    window.dispatchEvent(new Event('portfolio:section-navigation-end'));
    window.dispatchEvent(new Event('scroll'));
  };
  const interrupt = () => {
    window.scrollTo({ top: window.scrollY, behavior: 'instant' });
    finish();
  };
  const interruptKey = event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) interrupt();
  };
  cancelPrevious = interrupt;
  window.addEventListener('wheel', interrupt, { passive: true });
  window.addEventListener('touchstart', interrupt, { passive: true });
  window.addEventListener('keydown', interruptKey);
  window.scrollTo({ top: target, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  const check = () => {
    settled = Math.abs(window.scrollY - target) < 2 ? settled + 1 : 0;
    if (settled >= 3 || performance.now() - started > 3000) return finish();
    frame = requestAnimationFrame(check);
  };
  frame = requestAnimationFrame(check);
}
