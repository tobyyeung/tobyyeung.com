import React, { useState, useEffect, useRef } from 'react';
import ProjectModal from '../components/ProjectModal';
import ExperienceModal from '../components/ExperienceModal';
import ParallaxHeaderCity from '../components/ParallaxHeaderCity';
import ParallaxExperienceTimeline from '../components/ParallaxExperienceTimeline';
import ParallaxProjectsShowcase from '../components/ParallaxProjectsShowcase';
import CyberDecryptHeading from '../components/CyberDecryptHeading';
import CyberDecryptText from '../components/CyberDecryptText';
import { uiucCourses, ucsdCourses } from '../data/education';
import { skillsData } from '../data/skills';

const Home = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [detailSource, setDetailSource] = useState(null);
  const [activeSkillCategory, setActiveSkillCategory] = useState("Languages");
  const [showAllUiucCourses, setShowAllUiucCourses] = useState(false);

  // Parallax scroll & mouse tracking
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const placeholderRef = useRef(null);

  // Handle scroll parallax calculation
  useEffect(() => {
    const handleScroll = () => {
      const el = placeholderRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalScrollDistance = el.offsetHeight - window.innerHeight;
      const currentProgress = Math.min(Math.max(-rect.top / (totalScrollDistance || 1), 0), 1);
      setScrollProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle mouse move parallax on desktop
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth < 960) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="parallax-page">
      {/* Noise Texture Overlay */}
      <div className="noise-bg" />

      {/* Experience & Project Detail Modals */}
      <ExperienceModal
        exp={selectedExperience}
        sourceElement={detailSource}
        onClose={() => setSelectedExperience(null)}
      />
      <ProjectModal
        project={selectedProject}
        sourceElement={detailSource}
        onClose={() => setSelectedProject(null)}
      />

      {/* ─── Fixed Parallax Skyline Header Scene ─── */}
      <div
        id="hero"
        className="parallax-header"
        style={{
          opacity: scrollProgress > 0.95 ? Math.max(0, 1 - (scrollProgress - 0.95) * 20) : 1
        }}
      >
        <ParallaxHeaderCity
          scrollProgress={scrollProgress}
          mouseOffset={mouseOffset}
        />
      </div>

      {/* Scroll distance placeholder for header parallax ascent */}
      <div ref={placeholderRef} className="header-placeholder" />

      {/* ─── Editorial Portfolio Sections (Inspired by r4ms3s.cz) ─── */}
      <div className="section-coder">
        {/* ─── Section 01: About ─── */}
        <article id="about" style={{ position: 'relative' }}>
          <div className="parallax-container" style={{ position: 'relative', zIndex: 6 }}>
            <div className="article-heading-col">
              <span className="article-number">01</span>
              <CyberDecryptHeading />
            </div>

            <div className="article-content-col">
              <CyberDecryptText
                text="My name is Toby Yeung — I’m a Full-Stack Developer & AI Systems Engineer."
                highlights={[
                  { text: 'Toby Yeung', className: 'strong' },
                  { text: 'Full-Stack Developer', className: 'highlight' },
                  { text: 'AI Systems Engineer', className: 'highlight' }
                ]}
                delay={200}
                speed={32}
              />
              <CyberDecryptText
                text="Currently studying Computer Science & Economics at the University of Illinois Urbana-Champaign (UIUC)."
                highlights={[
                  { text: 'Computer Science & Economics', className: 'strong' },
                  { text: 'University of Illinois Urbana-Champaign (UIUC)', className: 'strong' }
                ]}
                delay={450}
                speed={32}
              />
              <CyberDecryptText
                text="I specialize in engineering high-performance web applications, scalable containerized microservices, local LLM inference pipelines, and Retrieval-Augmented Generation (RAG) architectures."
                delay={700}
                speed={30}
              />
              <CyberDecryptText
                text="Do you need React, FastAPI, Python, Docker, Kubernetes, PostgreSQL, or cutting-edge AI / RAG integration?"
                highlights={[
                  { text: 'React', className: 'strong' },
                  { text: 'FastAPI', className: 'strong' },
                  { text: 'Python', className: 'strong' },
                  { text: 'Docker', className: 'strong' },
                  { text: 'Kubernetes', className: 'strong' },
                  { text: 'PostgreSQL', className: 'strong' },
                  { text: 'AI / RAG', className: 'strong' }
                ]}
                delay={950}
                speed={32}
              />
              <p className="article-text">
                <a
                  href="mailto:tobycyeung@gmail.com?subject=Hello%20Toby!"
                  className="glitch-typo"
                  data-title="Let's talk"
                >
                  <span>Let's talk →</span>
                </a>
              </p>
            </div>
            <div style={{ clear: 'both' }} />
          </div>

          {/* Strong progressive blurry gradient transition on Toby section */}
          <div className="about-bottom-blurry-transition" aria-hidden="true">
            <div className="blur-backdrop" />
            <div className="color-gradient" />
          </div>
        </article>

        {/* ─── Section 02: Experience (One Experience Per Scroll with Cinematic Map Flight) ─── */}
        <div id="experience" style={{ position: 'relative', width: '100%', marginTop: '-4px' }}>
          <ParallaxExperienceTimeline onSelectExperience={(exp, source) => {
            setDetailSource(source);
            setSelectedExperience(exp);
          }} />
        </div>

        {/* ─── Section 03: Works × Projects (Pinned Horizontal Scroll) ─── */}
        <div id="projects" style={{ position: 'relative', width: '100%', marginTop: '-4px' }}>
          <ParallaxProjectsShowcase onSelectProject={(project, source) => {
            setDetailSource(source);
            setSelectedProject(project);
          }} />
        </div>

        {/* ─── Section 04: Education ─── */}
        <article id="education" style={{ marginTop: '-4px' }}>
          <div className="parallax-container section-flex-container section-flex-reverse">
            <div className="article-heading-col section-sticky-header">
              <span className="article-number">04</span>
              <h1 className="article-heading" style={{ whiteSpace: 'nowrap' }}>
                EDU<strong>CATION</strong>
              </h1>
            </div>

            <div className="article-content-col section-flex-content">
              {/* UIUC Education Card (Primary Degree) */}
              <div
                style={{
                  background: 'rgba(10, 19, 37, 0.75)',
                  border: '1px solid rgba(58, 197, 163, 0.28)',
                  borderRadius: '16px',
                  padding: '28px',
                  marginBottom: '22px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '10px',
                      padding: '4px',
                      width: '52px',
                      height: '52px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}images/education/uiuc.png`}
                      alt="UIUC Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', color: '#ffffff', textTransform: 'uppercase', margin: 0, lineHeight: 1.15 }}>
                      University of Illinois Urbana-Champaign
                    </h3>
                    <p style={{ color: '#3AC5A3', fontWeight: '600', fontSize: '0.98rem', margin: '4px 0 0 0' }}>
                      B.S. in Computer Science &amp; Economics (Expected May 2028)
                    </p>
                    <p style={{ color: '#a0a0ab', fontSize: '0.88rem', margin: '2px 0 0 0' }}>
                      GPA: 4.0 / 4.0 • Dean's List
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#a0a0ab', marginBottom: '10px', fontWeight: '500' }}>
                  Selected Coursework:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(showAllUiucCourses ? uiucCourses : uiucCourses.slice(0, 8)).map((c) => (
                    <span key={c} className="work-tag" style={{ color: '#ffffff', background: 'rgba(58, 197, 163, 0.09)', borderColor: 'rgba(58, 197, 163, 0.25)' }}>
                      {c}
                    </span>
                  ))}
                </div>
                {uiucCourses.length > 8 && (
                  <button
                    onClick={() => setShowAllUiucCourses(!showAllUiucCourses)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3AC5A3',
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: '0.88rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {showAllUiucCourses ? '← Show Less Coursework' : `+ Show All ${uiucCourses.length} Courses →`}
                  </button>
                )}
              </div>

              {/* Side-by-Side Row: UCSD Extended Studies & Honors/Awards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
                  gap: '20px',
                  alignItems: 'stretch'
                }}
              >
                {/* UCSD Extended Studies (Compact / Smaller) */}
                <div
                  style={{
                    background: 'rgba(10, 19, 37, 0.75)',
                    border: '1px solid rgba(58, 197, 163, 0.25)',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '8px',
                          padding: '3px',
                          width: '42px',
                          height: '42px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 3px 10px rgba(0,0,0,0.3)'
                        }}
                      >
                        <img
                          src={`${import.meta.env.BASE_URL}images/education/ucsd.png`}
                          alt="UC San Diego Logo"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <h4 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.2rem', color: '#ffffff', textTransform: 'uppercase', margin: 0, lineHeight: 1.15 }}>
                          UC San Diego Extended Studies
                        </h4>
                        <p style={{ color: '#3AC5A3', fontWeight: '600', fontSize: '0.82rem', margin: '3px 0 0 0' }}>
                          Machine Learning &amp; Deep Neural Networks
                        </p>
                        <p style={{ color: '#a0a0ab', fontSize: '0.78rem', margin: '2px 0 0 0' }}>
                          GPA: 4.0 / 4.0
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#a0a0ab', marginBottom: '8px', fontWeight: '500' }}>
                      Curriculum &amp; Specializations:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {ucsdCourses.map((c) => (
                        <span key={c} className="work-tag" style={{ color: '#ffffff', background: 'rgba(58, 197, 163, 0.08)', borderColor: 'rgba(58, 197, 163, 0.2)', fontSize: '0.74rem', padding: '3px 8px' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Honors & Awards (Compact / Smaller, side-by-side) */}
                <div
                  style={{
                    background: 'rgba(10, 19, 37, 0.55)',
                    border: '1px dashed rgba(58, 197, 163, 0.3)',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h4
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: '1.05rem',
                        fontWeight: '700',
                        color: '#3AC5A3',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: '12px'
                      }}
                    >
                      Honors &amp; Awards
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <h5 style={{ color: '#ffffff', fontSize: '0.88rem', fontWeight: '600', margin: 0 }}>The Coder Games 2020</h5>
                        <p style={{ color: '#a0a0ab', fontSize: '0.78rem', margin: '1px 0 0 0' }}>Typed Bracket Winner • theCoderSchool</p>
                      </div>
                      <div>
                        <h5 style={{ color: '#ffffff', fontSize: '0.88rem', fontWeight: '600', margin: 0 }}>CalChess Super States Championship</h5>
                        <p style={{ color: '#a0a0ab', fontSize: '0.78rem', margin: '1px 0 0 0' }}>8th Place (2022-23) • BayAreaChess</p>
                      </div>
                      <div>
                        <h5 style={{ color: '#ffffff', fontSize: '0.88rem', fontWeight: '600', margin: 0 }}>AP Scholar with Distinction</h5>
                        <p style={{ color: '#a0a0ab', fontSize: '0.78rem', margin: '1px 0 0 0' }}>Calculus AB (5), Chinese Language (5)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* ─── Section 05: Skills ─── */}
        <article id="skills">
          <div className="parallax-container">
            <div className="article-heading-col">
              <span className="article-number">05</span>
              <h1 className="article-heading">
                SKILLS <strong>&amp;</strong><br />
                STACK
              </h1>
            </div>

            <div className="article-content-col">
              {/* Skills Category Tabs */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {Object.keys(skillsData).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveSkillCategory(cat)}
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: '0.95rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: activeSkillCategory === cat ? '1px solid #3AC5A3' : '1px solid rgba(255, 255, 255, 0.15)',
                      background: activeSkillCategory === cat ? '#3AC5A3' : 'rgba(10, 19, 37, 0.6)',
                      color: activeSkillCategory === cat ? '#020716' : '#ffffff',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Skills Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px' }}>
                {skillsData[activeSkillCategory].map((skill) => (
                  <div
                    key={skill}
                    style={{
                      background: 'rgba(10, 19, 37, 0.6)',
                      border: '1px solid rgba(58, 197, 163, 0.15)',
                      borderRadius: '10px',
                      padding: '16px 12px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'transform 0.2s, border-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#3AC5A3';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = 'rgba(58, 197, 163, 0.15)';
                    }}
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}images/skills/${skill.replace(/[\/\\]/g, '_').toLowerCase()}.png`}
                      alt={skill}
                      style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#ffffff' }}>
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ clear: 'both' }} />
          </div>
        </article>

        {/* ─── Section 06: Follow Me / Contact ─── */}
        <article id="contact">
          <div className="parallax-container section-flex-container section-flex-reverse">
            <div className="article-heading-col section-sticky-header">
              <span className="article-number">06</span>
              <h1 className="article-heading">
                <strong>FOLLOW</strong><br />
                ME
              </h1>
            </div>

            <div className="article-content-col section-flex-content">
              <div className="social-links-grid">
                <a
                  href="https://www.linkedin.com/in/yeung-toby/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-item"
                >
                  <div className="social-link-left">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3AC5A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    <div>
                      <div className="social-link-name">LinkedIn</div>
                      <div className="social-link-handle">linkedin.com/in/yeung-toby</div>
                    </div>
                  </div>
                  <span style={{ color: '#3AC5A3', fontWeight: '600' }}>→</span>
                </a>

                <a
                  href="https://github.com/tobyyeung"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-item"
                >
                  <div className="social-link-left">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3AC5A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4" />
                    </svg>
                    <div>
                      <div className="social-link-name">GitHub</div>
                      <div className="social-link-handle">github.com/tobyyeung</div>
                    </div>
                  </div>
                  <span style={{ color: '#3AC5A3', fontWeight: '600' }}>→</span>
                </a>

                <a
                  href="mailto:tobycyeung@gmail.com"
                  className="social-link-item"
                >
                  <div className="social-link-left">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3AC5A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <div>
                      <div className="social-link-name">Email</div>
                      <div className="social-link-handle">tobycyeung@gmail.com</div>
                    </div>
                  </div>
                  <span style={{ color: '#3AC5A3', fontWeight: '600' }}>→</span>
                </a>
              </div>
            </div>
            <div style={{ clear: 'both' }} />
          </div>
        </article>

        {/* ─── Footer ─── */}
        <footer style={{
          marginTop: '20px',
          padding: '14px 0 16px 0',
          borderTop: '1px solid rgba(58, 197, 163, 0.15)',
          color: '#6b6b75',
          fontSize: '0.82rem'
        }}>
          <div className="parallax-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ margin: 0 }}>Copyright © 2026 Toby Yeung. All rights reserved.</p>
            <p style={{ margin: 0 }}>Based in Santa Clara, CA &amp; Champaign, IL</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
