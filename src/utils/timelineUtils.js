import { TIMELINE_END_YEAR, TIMELINE_END_MONTH } from '../data/experiences';

/**
 * Scaled down by 1.5x:
 * - 2026 - Present: Medium section (20px / month)
 * - 2025 - 2026: Small section (11px / month)
 * - 2024 - 2025: Big section (28px / month)
 * - 2023 - 2024: Medium section (19px / month)
 * - 2022 - 2023: Small section (11px / month)
 */
export const getBasePixelsForMonth = (y, m) => {
  if (y >= 2026) return 20; // 2026 - Present (Medium scaled)
  if (y === 2025) return 11; // 2025 - 2026 (Small scaled)
  if (y === 2024) return 28; // 2024 - 2025 (Big scaled)
  if (y === 2023) return 19; // 2023 - 2024 (Medium scaled)
  if (y <= 2022) return 11; // 2022 - 2023 (Small scaled)
  return 17;
};

export const getBasePositionForDate = (y, m) => {
  let px = 0;
  let currentY = TIMELINE_END_YEAR;
  let currentM = TIMELINE_END_MONTH;

  while (currentY > y || (currentY === y && currentM > m)) {
    px += getBasePixelsForMonth(currentY, currentM);
    currentM--;
    if (currentM === 0) {
      currentM = 12;
      currentY--;
    }
  }
  return px;
};

export const getPositionForDate = (y, m, _experiences, ..._rest) => {
  return getBasePositionForDate(y, m);
};

/**
 * Computes collision-free absolute `top` positions for each experience card
 * on the desktop (two-column) timeline.
 */
export const computeCardPositions = (experiences, cardHeights, cardGap = 14) => {
  const positions = {};

  const layoutSide = (side) => {
    const sideExps = experiences
      .filter(e => e.side === side)
      .sort((a, b) => (b.endY * 12 + b.endM) - (a.endY * 12 + a.endM)); // newest first

    let prevBottom = -Infinity;

    for (const exp of sideExps) {
      const idealTop = getBasePositionForDate(exp.endY, exp.endM);
      const height = cardHeights[exp.id] || 150;
      const adjustedTop = Math.max(idealTop, prevBottom + cardGap);

      positions[exp.id] = adjustedTop;
      prevBottom = adjustedTop + height;
    }
  };

  layoutSide('left');
  layoutSide('right');

  // Total height = max bottom across all cards + padding
  let maxBottom = 0;
  for (const exp of experiences) {
    const top = positions[exp.id] ?? 0;
    const h = cardHeights[exp.id] || 150;
    maxBottom = Math.max(maxBottom, top + h);
  }

  return { positions, totalHeight: maxBottom + 40 };
};
