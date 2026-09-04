import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBreakpoints } from '../hooks/useBreakpoints';
import { scrollToSectionPosition } from '../utils/sectionNavigation';

const NAV_SECTIONS = [
  { id: 'hero', label: 'Home', desc: 'Skyline & Overview' },
  { id: 'about', label: 'About', desc: 'Overview & Bio' },
  { id: 'experience', label: 'Experience', desc: 'Career & Work History' },
  { id: 'projects', label: 'Projects', desc: 'Featured Applications' },
  { id: 'education', label: 'Education', desc: 'Universities & Degrees' },
  { id: 'skills', label: 'Skills', desc: 'Technologies & Tools' },
  { id: 'contact', label: 'Contact', desc: 'Send a Message' },
];

const Header = () => {
  const location = useLocation();
  const { windowWidth } = useBreakpoints();
  const isMobile = windowWidth <= 1100;
  const [activeSection, setActiveSection] = useState('hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Share the actual navigation height with full-screen section overlays.
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return undefined;
    const updateHeight = () => {
      document.documentElement.style.setProperty('--site-header-height', `${header.offsetHeight}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Precise active section detection based on viewport position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // 1. Bottom of page threshold -> activate contact
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 70;
      if (isAtBottom) {
        setActiveSection('contact');
        return;
      }

      // 2. Top Skyline / Home check (before about section reaches upper viewport)
      const aboutEl = document.getElementById('about');
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 70;
      const anchorY = window.innerHeight * 0.38;

      const runway = document.querySelector('.experience-stepped-runway');
      const runwayRect = runway?.getBoundingClientRect();
      if (runwayRect && runwayRect.top <= 1 && runwayRect.bottom >= window.innerHeight - 1) {
        setActiveSection('experience');
        return;
      }

      if (aboutEl) {
        const aboutRect = aboutEl.getBoundingClientRect();
        if (aboutRect.top > anchorY) {
          setActiveSection('hero');
          return;
        }
      } else if (window.scrollY < 250) {
        setActiveSection('hero');
        return;
      }

      // 3. Check each section from bottom to top
      const sectionsInOrder = ['contact', 'skills', 'education', 'projects', 'experience', 'about'];
      for (const sectionId of sectionsInOrder) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Check if top has scrolled past anchor line and bottom is still visible
          if (rect.top <= anchorY && rect.bottom > headerHeight + 20) {
            setActiveSection(sectionId);
            return;
          }
        }
      }

      setActiveSection('hero');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    setActiveSection(id);
    // Explicit navigation takes priority over the experience animation lock.

    if (id === 'hero') {
      scrollToSectionPosition(0);
      return;
    }

    requestAnimationFrame(() => {
      const element = document.getElementById(id);
      if (element) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 70;
        const target = id === 'experience'
          ? element.querySelector('.experience-stepped-runway') || element
          : element;
        const elementPosition = target.getBoundingClientRect().top;
        // The timeline has a multi-screen runway, but its stage pins at top: 0.
        // Land at the start of that runway, not a header-offset partial screen.
        const offsetPosition = elementPosition + window.pageYOffset -
          (id === 'experience' ? 0 : headerHeight + 12);

        scrollToSectionPosition(Math.max(0, offsetPosition));
      } else if (location.pathname !== '/') {
        window.location.href = '/#/';
      }
    });
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100000,
      background: isScrolled ? 'var(--bg-glass)' : 'transparent',
      backdropFilter: isScrolled ? 'blur(12px)' : 'none',
      WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
      padding: '0.75rem 0',
      borderBottom: isScrolled ? '1px solid var(--border-glass)' : '1px solid transparent',
      transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease'
    }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo Group */}
          <div className="header-tooltip-wrapper">
            <button className="header-logo-group" onClick={() => scrollToSection('hero')}>
              <img
                src={import.meta.env.BASE_URL + 'images/self.jpg'}
                alt="Toby Yeung"
                className="header-logo-img"
              />
              <div className="header-logo-text" style={{ textAlign: 'left', alignItems: 'flex-start' }}>
                <span className="header-logo-name" style={{ textAlign: 'left' }}>Toby Yeung</span>
                <span className="header-logo-subtitle" style={{ textAlign: 'left' }}>CS + Econ @ UIUC</span>
              </div>
            </button>
            <span className="tooltip-text">Back to Top</span>
          </div>

          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Right-side icons (mobile) */}
              <div className="header-actions">
                <a href="https://github.com/tobyyeung" target="_blank" rel="noopener noreferrer" className="header-icon-btn" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path></svg>
                </a>
                <a href="https://www.linkedin.com/in/yeung-toby/" target="_blank" rel="noopener noreferrer" className="header-icon-btn" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}
                aria-label="Toggle menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {isMenuOpen ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </>
                  )}
                </svg>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {/* Pill Nav with Home and About buttons */}
              <nav className="pill-nav">
                {NAV_SECTIONS.map(section => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`pill-nav-link${activeSection === section.id ? ' active' : ''}`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>

              {/* Right-side icons (GitHub & LinkedIn) */}
              <div className="header-actions">
                <div className="header-tooltip-wrapper">
                  <a href="https://github.com/tobyyeung" target="_blank" rel="noopener noreferrer" className="header-icon-btn" aria-label="GitHub">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path></svg>
                  </a>
                  <span className="tooltip-text">GitHub Profile</span>
                </div>
                <div className="header-tooltip-wrapper">
                  <a href="https://www.linkedin.com/in/yeung-toby/" target="_blank" rel="noopener noreferrer" className="header-icon-btn" aria-label="LinkedIn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <span className="tooltip-text">LinkedIn Profile</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Dropdown Nav */}
        {isMobile && isMenuOpen && (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-glass)' }}>
            {NAV_SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="nav-btn"
                style={{
                  textAlign: 'left',
                  padding: '0.5rem 0',
                  color: activeSection === section.id ? 'var(--accent-primary)' : undefined
                }}
              >
                {activeSection === section.id ? `[ ${section.label} ]` : section.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
