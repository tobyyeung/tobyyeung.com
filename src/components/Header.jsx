import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBreakpoints } from '../hooks/useBreakpoints';

const NAV_SECTIONS = [
  { id: 'hero', label: 'About', desc: 'Overview & Bio' },
  { id: 'experience', label: 'Experience', desc: 'Career & Work History' },
  { id: 'projects', label: 'Projects', desc: 'Featured Applications' },
  { id: 'skills', label: 'Skills', desc: 'Technologies & Tools' },
  { id: 'contact', label: 'Contact', desc: 'Send a Message' },
];

const Header = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const { isTablet: isMobile, windowWidth } = useBreakpoints();
  const [activeSection, setActiveSection] = useState('hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track active section & scroll state position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const header = document.querySelector('header');
      const headerOffset = header ? header.offsetHeight : 0;
      const scrollY = window.scrollY + headerOffset + 80;

      for (let i = NAV_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV_SECTIONS[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(NAV_SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    setActiveSection(id);

    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const header = document.querySelector('header');
        const headerOffset = header ? header.offsetHeight : 0;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else if (location.pathname !== '/') {
        window.location.href = '/#/';
      }
    }, 50);
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
                src={import.meta.env.BASE_URL + 'images/logo.png'}
                alt="Toby Yeung Logo"
                className="header-logo-img"
                style={{ background: '#ffffff', padding: '3px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}
              />
              <div className="header-logo-text" style={{ textAlign: 'left', alignItems: 'flex-start' }}>
                <span className="header-logo-name" style={{ textAlign: 'left' }}>Toby Yeung</span>
                <span className="header-logo-subtitle" style={{ textAlign: 'left' }}>Software Engineer</span>
              </div>
            </button>
            <span className="tooltip-text">Back to Home</span>
          </div>

          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Right-side icons (mobile) */}
              <div className="header-actions">
                <a href="https://github.com/tobyyeung" target="_blank" rel="noopener noreferrer" className="header-icon-btn" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path></svg>
                </a>
                <button onClick={toggleTheme} className="header-icon-btn" aria-label="Toggle theme">
                  {theme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                  )}
                </button>
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
              {/* Pill Nav */}
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

              {/* Right-side icons */}
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
                <div className="header-tooltip-wrapper">
                  <button onClick={toggleTheme} className="header-icon-btn" aria-label="Toggle theme">
                    {theme === 'dark' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    )}
                  </button>
                  <span className="tooltip-text">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
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
