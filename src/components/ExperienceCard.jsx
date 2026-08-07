import React from 'react';

const ExperienceCard = ({
  exp,
  isMobileTimeline,
  renderAsLeft,
  windowWidth,
  hoveredExpId,
  setHoveredExpId,
  topPx,
  idealTopPx,
  xShift,
  dotWidth,
  dotHeight,
  dotOffset,
  accentColor,
  borderGlassColor,
  cardRef,
  animationIndex,
  isVisible,
  onLearnMore
}) => {
  // Format duration string
  const duration = Math.max(1, (exp.endY - exp.startY) * 12 + (exp.endM - exp.startM));
  const yrs = Math.floor(duration / 12);
  const mos = duration % 12;
  let durStr = '';
  if (yrs > 0) durStr += `${yrs} yr${yrs > 1 ? 's' : ''} `;
  if (mos > 0 || yrs === 0) durStr += `${mos} mo${mos > 1 ? 's' : ''}`;

  // Spine line position anchored to ideal date position on central spine
  const spineTopPx = (!isMobileTimeline && idealTopPx !== undefined) ? (idealTopPx - topPx + 16) : 16;

  return (
    <div
      className={isVisible ? 'animate-experience' : ''}
      style={{
        position: isMobileTimeline ? 'relative' : 'absolute',
        top: isMobileTimeline ? 'auto' : `${topPx}px`,
        width: isMobileTimeline ? 'calc(100% - 4.5rem)' : 'calc(50% - 2.5rem)',
        ...(isMobileTimeline ? { left: '4.0rem' } : { [renderAsLeft ? 'left' : 'right']: 0 }),
        zIndex: hoveredExpId === exp.id ? 40 : 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: renderAsLeft ? 'flex-end' : 'flex-start',
        transition: isMobileTimeline ? 'none' : 'top 0.15s ease-out',
        opacity: isVisible ? undefined : 0,
        animationDelay: isVisible ? `${animationIndex * 250}ms` : '0ms'
      }}
    >
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Timeline Dot & Line on Spine */}
        <div
          style={{
            position: 'absolute',
            top: isMobileTimeline ? '1.1rem' : `${spineTopPx}px`,
            width: isMobileTimeline ? '0.75rem' : dotWidth,
            height: isMobileTimeline ? '0.75rem' : `${dotHeight}px`,
            borderRadius: '999px',
            background: accentColor,
            border: `2px solid var(--bg-primary)`,
            boxShadow: `0 0 0 2px var(--border-glass)`,
            [renderAsLeft ? 'right' : 'left']: isMobileTimeline ? '-2.75rem' : dotOffset,
            transition: isMobileTimeline ? 'none' : 'top 0.15s ease-out, height 0.15s ease-out',
            zIndex: 1
          }}
        ></div>

        {/* Timeline Card */}
        <div
          ref={cardRef}
          className="glass-panel"
          onMouseEnter={() => setHoveredExpId(exp.id)}
          onMouseLeave={() => setHoveredExpId(null)}
          onClick={() => onLearnMore && onLearnMore(exp)}
          style={{
            width: '100%',
            padding: '1rem 1.15rem',
            borderRadius: '16px',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            textAlign: renderAsLeft ? 'right' : 'left',
            position: 'relative',
            transform: `translateX(${xShift}) ${hoveredExpId === exp.id ? 'translateY(-4px)' : ''}`,
            border: `1px solid ${hoveredExpId === exp.id ? accentColor : borderGlassColor}`,
            boxShadow: hoveredExpId === exp.id ? `0 12px 32px ${borderGlassColor}` : 'var(--shadow-sm)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Header row: logo + date & title info */}
            <div style={{
              display: 'flex',
              flexDirection: windowWidth < 500
                ? 'column'
                : (renderAsLeft ? 'row-reverse' : 'row'),
              alignItems: windowWidth < 500 ? (renderAsLeft ? 'flex-end' : 'flex-start') : 'flex-start',
              gap: '0.75rem'
            }}>
              {/* Logo */}
              <div style={{
                background: '#ffffff',
                padding: '0.25rem',
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: 'var(--shadow-sm)',
                marginTop: '0.1rem'
              }}>
                <img src={exp.logo} alt={`${exp.title} Logo`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: renderAsLeft ? 'flex-end' : 'flex-start', minWidth: 0, width: '100%' }}>
                {/* Date & Learn More Button on the same row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  flexDirection: renderAsLeft ? 'row-reverse' : 'row',
                  gap: '0.5rem',
                  marginBottom: '0.15rem'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {exp.dateStr}{windowWidth >= 850 && ` • ${durStr.trim()}`}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onLearnMore) onLearnMore(exp);
                    }}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.73rem',
                      padding: '0.22rem 0.65rem',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: accentColor,
                      borderColor: borderGlassColor,
                      background: 'var(--bg-glass)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    Learn More
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>

                <h3 style={{ fontSize: '1.02rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 0.1rem', wordBreak: 'break-word', lineHeight: '1.25' }}>
                  {exp.role}
                </h3>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)', margin: 0, wordBreak: 'break-word' }}>
                  {exp.title}
                </h4>
              </div>
            </div>

            {/* Short Description */}
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              margin: '0.1rem 0 0',
              lineHeight: '1.45',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {exp.shortDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;
