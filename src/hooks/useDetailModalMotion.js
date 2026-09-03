import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const sourceTransform = (panel, source) => {
  if (!source || !source.width || !source.height) return 'scale(0.88)';
  return `translate(${source.left + source.width / 2 - panel.left - panel.width / 2}px, ${source.top + source.height / 2 - panel.top - panel.height / 2}px) scale(${source.width / panel.width}, ${source.height / panel.height})`;
};

export const useDetailModalMotion = (item, onClose, sourceElement) => {
  const [closingItem, setClosingItem] = useState(null);
  const timer = useRef(null);
  const panelRef = useRef(null);
  const animationRef = useRef(null);
  const sourceRectRef = useRef(null);
  const isClosing = Boolean(item) && closingItem === item;

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!item || !panel) return undefined;
    sourceRectRef.current = sourceElement?.getBoundingClientRect();
    const previousVisibility = sourceElement?.style.visibility;
    if (sourceElement) sourceElement.style.visibility = 'hidden';
    const target = panel.getBoundingClientRect();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animationRef.current = panel.animate([
      { transform: sourceTransform(target, sourceRectRef.current), opacity: 0.7, borderRadius: '18px' },
      { transform: 'none', opacity: 1, borderRadius: getComputedStyle(panel).borderRadius }
      ], { duration: 280, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'backwards' });
    }
    return () => {
      animationRef.current?.cancel();
      if (sourceElement) sourceElement.style.visibility = previousVisibility;
    };
  }, [item, sourceElement]);

  const requestClose = useCallback(() => {
    if (!item || timer.current !== null) return;
    setClosingItem(item);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const panel = panelRef.current;
    if (panel && !reducedMotion) {
      // Capture the live opening position so an early close never jumps.
      const currentStyle = getComputedStyle(panel);
      const currentTransform = currentStyle.transform;
      const currentOpacity = currentStyle.opacity;
      animationRef.current?.cancel();
      const destination = sourceElement?.isConnected
        ? sourceElement.getBoundingClientRect()
        : sourceRectRef.current;
      animationRef.current = panel.animate([
        { transform: currentTransform, opacity: currentOpacity },
        { transform: sourceTransform(panel.getBoundingClientRect(), destination), opacity: 0, borderRadius: '18px' }
      ], { duration: 350, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      setClosingItem(null);
      onClose();
    }, reducedMotion ? 0 : 350);
  }, [item, onClose, sourceElement]);

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
      timer.current = null;
    };
  }, [item]);

  useEffect(() => {
    if (!item) return undefined;
    // Lock the root, not body: body overflow can change sticky containing blocks.
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [item, requestClose]);

  return { isClosing, requestClose, panelRef };
};
