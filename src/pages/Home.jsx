import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import ExperienceCard from '../components/ExperienceCard';
import ExperienceModal from '../components/ExperienceModal';
import EducationCard from '../components/EducationCard';
import InteractiveUSMap from '../components/InteractiveUSMap';
import { getProjects } from '../data/projects';
import { experiences, TIMELINE_START_YEAR, TIMELINE_START_MONTH } from '../data/experiences';
import { uiucCourses, ucsdCourses } from '../data/education';
import { skillsData } from '../data/skills';
import { useBreakpoints } from '../hooks/useBreakpoints';
import { getPositionForDate, getBasePositionForDate, computeCardPositions } from '../utils/timelineUtils';
import { useInView } from '../hooks/useInView';
import ScrollIndicator from '../components/ScrollIndicator';


const Home = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [hoveredExpId, setHoveredExpId] = useState(null);
  const [activeSkillCategory, setActiveSkillCategory] = useState("Languages");
  const cardRefs = useRef({});
  const [cardHeights, setCardHeights] = useState({});

  const projectsRef = useRef(null);
  const experiencesRef = useRef(null);
  const educationRef = useRef(null);
  const projectsInView = useInView(projectsRef, { threshold: 0.1, triggerOnce: true });
  const experiencesInView = useInView(experiencesRef, { threshold: 0.1, triggerOnce: true });
  const educationInView = useInView(educationRef, { threshold: 0.1, triggerOnce: true });

  // Typewriter effect state
  const fullDescription = "A CS & Econ student @ UIUC, specializing in building full-stack apps, containerized microservices, and AI systems.";
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const { windowWidth, isMobileSm, isMobileLg, isDesktopSm } = useBreakpoints();

  const yearMarkers = [2026, 2025, 2024, 2023, 2022];
  const isMobileTimeline = isMobileLg;

  useEffect(() => {
    setProjects(getProjects());

    // Typewriter effect logic
    let typeInterval;

    const startTyping = () => {
      setIsTyping(true);
      setTypedText("");
      let currentIndex = 0;

      typeInterval = setInterval(() => {
        if (currentIndex <= fullDescription.length) {
          setTypedText(fullDescription.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 25); // Faster typing speed (25ms)
    };

    startTyping();

    return () => {
      clearInterval(typeInterval);
    };
  }, []);

  // Measure card heights after render & on resize
  const measureCards = useCallback(() => {
    const newHeights = {};
    let changed = false;
    for (const exp of experiences) {
      const el = cardRefs.current[exp.id];
      if (el) {
        const h = el.offsetHeight;
        newHeights[exp.id] = h;
        if (h !== cardHeights[exp.id]) changed = true;
      }
    }
    if (changed || Object.keys(newHeights).length !== Object.keys(cardHeights).length) {
      setCardHeights(newHeights);
    }
  }, [cardHeights]);

  // Measure on mount, after animations settle, and on window resize
  useEffect(() => {
    const t1 = setTimeout(measureCards, 50);
    const t2 = setTimeout(measureCards, 300);
    const t3 = setTimeout(measureCards, 800);

    window.addEventListener('resize', measureCards);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', measureCards);
    };
  }, [measureCards]);

  // Use ResizeObserver on individual cards for dynamic window size / content changes
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      measureCards();
    });
    for (const exp of experiences) {
      const el = cardRefs.current[exp.id];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [measureCards, experiencesInView]);

  // Compute collision-free positions from measured heights
  const { positions: cardPositions, totalHeight: timelineHeight } = useMemo(() => {
    if (isMobileTimeline) return { positions: {}, totalHeight: 0 };
    return computeCardPositions(experiences, cardHeights, 28);
  }, [cardHeights, isMobileTimeline]);

  // Sorting experiences 
  const sortedExperiences = useMemo(() => {
    return isMobileTimeline
      ? [...experiences].sort((a, b) => {
        const aTime = a.endY * 12 + a.endM;
        const bTime = b.endY * 12 + b.endM;
        if (aTime !== bTime) return bTime - aTime;
        return a.title.localeCompare(b.title);
      })
      : experiences;
  }, [isMobileTimeline]);

  // Chronological Overlap Calculation
  const expOverlapLevels = useMemo(() => {
    const levels = {};
    const calculateLevels = (side) => {
      const sideExps = experiences.filter(e => e.side === side).sort((a, b) => (b.endY * 12 + b.endM) - (a.endY * 12 + a.endM));
      const active = [];

      for (const exp of sideExps) {
        const start = exp.startY * 12 + exp.startM;
        const end = exp.endY * 12 + exp.endM;

        let level = 0;
        const usedLevels = new Set();

        for (const act of active) {
          if (act.start < end && act.end > start) {
            usedLevels.add(act.level);
          }
        }

        while (usedLevels.has(level)) level++;

        levels[exp.id] = level;
        active.push({ id: exp.id, start, end, level });
      }
    };

    calculateLevels('left');
    calculateLevels('right');
    return levels;
  }, []);

  return (
    <>
      <ExperienceModal
        exp={selectedExperience}
        onClose={() => setSelectedExperience(null)}
      />
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <ScrollIndicator />
      <main className="animate-fade-in" style={{ paddingBottom: '0' }}>
        {/* Hero Section */}
        <section id="hero" className="hero-landing-bg" style={{
          minHeight: '100vh',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated background image */}
          <div className="hero-bg-flow dark-overlay" style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}images/landingpage.jpg)`,
            display: 'none'
          }} />
          {/* Decorative Map Background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
            opacity: 0.7,
            pointerEvents: 'none'
          }}>
            <InteractiveUSMap decorative />
          </div>
          {/* Light mode variant — handled via CSS [data-theme='light'] selector on the same element */}
          <style>{`
            [data-theme='light'] .hero-bg-flow {
              background-image: url(${import.meta.env.BASE_URL}images/landingpage-light.png) !important;
            }
          `}</style>
          <div className="container" style={{ position: 'relative', zIndex: 11, textAlign: 'left', width: '100%' }}>
            <div style={{
              display: 'flex',
              flexDirection: windowWidth < 960 ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2.5rem'
            }}>
              {/* Left Info Column */}
              <div style={{ flex: 1, maxWidth: windowWidth < 960 ? '100%' : '780px', textAlign: 'left' }}>
                <h1 style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '1.25rem', lineHeight: '1.1', textAlign: 'left' }}>
                  <span style={{ fontSize: '2.2rem', color: '#ffffff', fontWeight: '500' }}>Hi, I'm</span>
                  <span className="hero-name-title" style={{
                    fontSize: '5rem',
                    display: 'inline-block',
                    width: 'fit-content',
                    paddingBottom: '0.2em',
                    marginBottom: '-0.2em',
                    color: '#3AC5A3',
                    fontWeight: '700'
                  }}>Toby Yeung</span>
                </h1>
                <p style={{ fontSize: '1.18rem', color: 'rgba(255, 255, 255, 0.92)', maxWidth: '720px', marginBottom: '2rem', lineHeight: '1.6', minHeight: windowWidth < 600 ? '90px' : '55px' }}>
                  {typedText}
                  <span className="cursor-blink" style={{ color: '#3AC5A3', opacity: isTyping ? 1 : 0.7 }}>|</span>
                </p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })} className="btn btn-primary" style={{ fontSize: '1.05rem', gap: '0.4rem' }}>
                    Experiences
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.2rem' }}><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                  </button>
                  <button onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} className="btn btn-primary" style={{ fontSize: '1.05rem', gap: '0.4rem' }}>
                    Explore Projects
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.2rem' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                  <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="btn btn-secondary" style={{ fontSize: '1.05rem', gap: '0.4rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    Contact Me
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" ref={experiencesRef} className="mesh-bg-base mesh-bg-1" style={{ padding: '4rem 0' }}>
          <div className="section-bg-number right">01</div>
          <div className="container">
            <h2 className="section-title">Experience</h2>

            <div style={{
              position: 'relative',
              maxWidth: '1000px',
              margin: '0 auto',
              height: isMobileTimeline ? 'auto' : `${timelineHeight}px`,
              display: isMobileTimeline ? 'flex' : 'block',
              flexDirection: 'column',
              gap: '2rem',
              transition: 'height 0.15s ease-out'
            }}>
              {/* The Central Vertical Spine */}
              <div style={{ position: 'absolute', left: isMobileTimeline ? '1.5rem' : '50%', top: 0, bottom: 0, transform: 'translateX(-50%)', width: '4px', background: 'var(--border-glass)', borderRadius: '4px' }}></div>

              {!isMobileTimeline && yearMarkers.map(year => {
                const topPx = getPositionForDate(year, 1, experiences);

                return (
                  <div key={year} style={{
                    position: 'absolute',
                    top: `${topPx}px`,
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-glass)',
                    boxShadow: 'var(--shadow-sm)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    zIndex: 50,
                    transition: 'top 0.15s ease-out'
                  }}>
                    {year}
                  </div>
                );
              })}

              {sortedExperiences.map((exp) => {
                const isCardOnLeft = exp.side === 'left';
                const renderAsLeft = isMobileTimeline ? false : isCardOnLeft;

                const topPx = isMobileTimeline ? 0 : (cardPositions[exp.id] ?? getPositionForDate(exp.endY, exp.endM, experiences));
                const startPx = getBasePositionForDate(exp.startY, exp.startM);
                const endPx = getBasePositionForDate(exp.endY, exp.endM);

                const dotHeight = Math.max(16, startPx - endPx);
                const dotWidth = '0.5rem';

                const isGreen = exp.id === 'invite' || exp.id === 'thecoderschool';
                const isBlue = exp.id === 'mathnasium' || exp.id === 'techknowhow_asst';
                const accentColor = isGreen ? 'var(--accent-primary)' : (isBlue ? '#38bdf8' : 'var(--accent-secondary)');
                const borderGlassColor = isGreen ? 'rgba(58, 197, 163, 0.15)' : (isBlue ? 'rgba(56, 189, 248, 0.2)' : 'rgba(168, 85, 247, 0.25)');

                const overlapLevel = expOverlapLevels[exp.id] || 0;
                const dotOffset = overlapLevel > 0 ? `-${1.5 - overlapLevel * 1}rem` : '-1.5rem';
                const xShiftAmount = overlapLevel * 2;
                const xShift = overlapLevel > 0 && !isMobileTimeline ? (renderAsLeft ? `-${xShiftAmount}rem` : `${xShiftAmount}rem`) : '0';

                // Determine chronological index for animation delay
                const sortedExps = [...experiences].sort((a, b) => (b.endY * 12 + b.endM) - (a.endY * 12 + a.endM));
                const animationIndex = sortedExps.findIndex(e => e.id === exp.id);

                return (
                  <ExperienceCard
                    key={exp.id}
                    exp={exp}
                    isMobileTimeline={isMobileTimeline}
                    renderAsLeft={renderAsLeft}
                    windowWidth={windowWidth}
                    hoveredExpId={hoveredExpId}
                    setHoveredExpId={setHoveredExpId}
                    topPx={topPx}
                    idealTopPx={endPx}
                    xShift={xShift}
                    dotWidth={dotWidth}
                    dotHeight={dotHeight}
                    dotOffset={dotOffset}
                    accentColor={accentColor}
                    borderGlassColor={borderGlassColor}
                    cardRef={el => { cardRefs.current[exp.id] = el; }}
                    animationIndex={animationIndex}
                    isVisible={experiencesInView}
                    onLearnMore={(selectedExp) => setSelectedExperience(selectedExp)}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" ref={projectsRef} className="mesh-bg-base mesh-bg-2" style={{ padding: '4rem 0' }}>
          <div className="section-bg-number left">02</div>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
              <div>
                <h2 className="section-title" style={{ marginBottom: '0.5rem', textAlign: 'left' }}>Projects</h2>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
              gap: '2.5rem',
              paddingTop: '1rem'
            }}>
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => setSelectedProject(project)}
                    animationIndex={index}
                    isVisible={projectsInView}
                  />
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No projects available. Add some in the Admin Panel.</p>
              )}
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" ref={educationRef} className="mesh-bg-base mesh-bg-3" style={{ padding: '4rem 0' }}>
          <div className="section-bg-number right">03</div>
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: '2rem', textAlign: 'left' }}>Education</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <EducationCard
                institution="University of Illinois Urbana-Champaign"
                url="https://illinois.edu/"
                degree="B.S. in Computer Science and Economics (Expected May 2028)"
                gpa="GPA: 4.0/4.0 (Dean's List)"
                courses={uiucCourses}
                logoUrl={import.meta.env.BASE_URL + "images/education/uiuc.png"}
                animationIndex={0}
                isVisible={educationInView}
              />
              <EducationCard
                institution="UC San Diego Extended Studies"
                url="https://extendedstudies.ucsd.edu/"
                gpa="GPA: 4.0/4.0"
                courses={ucsdCourses}
                initialShowCount={ucsdCourses.length}
                logoUrl={import.meta.env.BASE_URL + "images/education/ucsd.png"}
                animationIndex={1}
                isVisible={educationInView}
              />
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="mesh-bg-base mesh-bg-4" style={{ padding: '6rem 0' }}>
          <div className="section-bg-number left">04</div>
          <div className="container">
            <h2 className="section-title">Skills</h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
              {Object.keys(skillsData).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveSkillCategory(category)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '9999px',
                    background: activeSkillCategory === category ? 'var(--accent-primary)' : 'var(--bg-glass)',
                    border: `1px solid ${activeSkillCategory === category ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                    color: activeSkillCategory === category ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem'
                  }}
                >
                  {category}
                  <span style={{
                    background: activeSkillCategory === category ? 'var(--border-glass)' : 'var(--bg-secondary)',
                    padding: '0.15rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    color: activeSkillCategory === category ? 'var(--bg-primary)' : 'var(--text-tertiary)'
                  }}>
                    {skillsData[category].length}
                  </span>
                </button>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '1.5rem',
              justifyItems: 'center',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {skillsData[activeSkillCategory].map(skill => (
                <div key={skill} className="glass-panel" style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default',
                  borderRadius: '16px'
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    color: 'var(--text-primary)'
                  }}>
                    <img
                      src={`${import.meta.env.BASE_URL}images/skills/${skill.replace(/[\\/\\\\]/g, '_').toLowerCase()}.png`}
                      alt={skill}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <span style={{ display: 'none', fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 'bold' }}>
                      {skill.charAt(0)}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" style={{ padding: '6rem 0', background: 'var(--bg-secondary)' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>Contact Me</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                I'm currently open to new opportunities. Whether you have a question or just want to say hi, feel free to drop a message!
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const name = formData.get('name');
                const email = formData.get('email');
                const message = formData.get('message');
                window.location.href = `mailto:tobycyeung@gmail.com?subject=Message from ${name}&body=${encodeURIComponent(message + '\n\nFrom: ' + name + ' (' + email + ')')}`;
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                    <label htmlFor="name" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '500' }}>Name</label>
                    <input type="text" id="name" name="name" required placeholder="John Doe" style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-glass)',
                      background: 'rgba(0,0,0,0.2)',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontSize: '1rem'
                    }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                    <label htmlFor="email" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '500' }}>Email</label>
                    <input type="email" id="email" name="email" required placeholder="john@example.com" style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-glass)',
                      background: 'rgba(0,0,0,0.2)',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontSize: '1rem'
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <label htmlFor="message" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '500' }}>Message</label>
                  <textarea id="message" name="message" required placeholder="How can I help you?" rows="5" style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem', cursor: 'pointer' }}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-glass)',
          color: 'var(--text-tertiary)',
          background: 'var(--bg-primary)'
        }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '500' }}>
              <a href="mailto:tobycyeung@gmail.com" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>Email</a>
              <a href="https://www.linkedin.com/in/yeung-toby/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>LinkedIn</a>
              <a href="https://github.com/tobyyeung" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>GitHub</a>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.8rem', lineHeight: '1.4' }}>
              <p>Based in Santa Clara, CA</p>
              <p>&copy; {new Date().getFullYear()} Toby Yeung. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default Home;
