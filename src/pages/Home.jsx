import React, { useState, useEffect, useRef, useMemo } from 'react';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import ExperienceCard from '../components/ExperienceCard';
import EducationCard from '../components/EducationCard';
import { getProjects } from '../data/projects';
import { experiences, TIMELINE_START_YEAR, TIMELINE_START_MONTH } from '../data/experiences';
import { uiucCourses, ucsdCourses } from '../data/education';
import { skillsData } from '../data/skills';
import { useBreakpoints } from '../hooks/useBreakpoints';
import { getPositionForDate, getBasePositionForDate } from '../utils/timelineUtils';
import { useInView } from '../hooks/useInView';
import ScrollIndicator from '../components/ScrollIndicator';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [hoveredExpId, setHoveredExpId] = useState(null);
  const [activeSkillCategory, setActiveSkillCategory] = useState("Languages");
  const [hoveredExpStretch, setHoveredExpStretch] = useState(0);
  const [staticStretches, setStaticStretches] = useState({});
  const cardRefs = useRef({});
  
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

  // Timeline setup
  const TIMELINE_HEIGHT = getPositionForDate(TIMELINE_START_YEAR, TIMELINE_START_MONTH, experiences, null, 0, staticStretches) + 30;
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
      }, 90); // Typing speed
    };

    startTyping();

    return () => {
      clearInterval(typeInterval);
    };
  }, []);

  useEffect(() => {
    if (!hoveredExpId) {
      setHoveredExpStretch(0);
      return;
    }
    setHoveredExpStretch(0);

    const checkHeight = () => {
      const el = cardRefs.current[hoveredExpId];
      if (!el) return;

      const hoveredExp = experiences.find(e => e.id === hoveredExpId);
      if (!hoveredExp) return;

      const relevantExps = isMobileTimeline ? [...experiences] : experiences.filter(e => e.side === hoveredExp.side);
      relevantExps.sort((a, b) => (b.endY * 12 + b.endM) - (a.endY * 12 + a.endM));

      const hoveredTime = hoveredExp.endY * 12 + hoveredExp.endM;
      const nextExp = relevantExps.find(e => (e.endY * 12 + e.endM) < hoveredTime);

      let gap = Infinity;
      if (nextExp) {
        const baseTop = getPositionForDate(hoveredExp.endY, hoveredExp.endM, experiences, null, 0, staticStretches);
        const nextTop = getPositionForDate(nextExp.endY, nextExp.endM, experiences, null, 0, staticStretches);
        gap = nextTop - baseTop;
      }

      const currentHeight = el.offsetHeight;
      const buffer = 20;
      const requiredStretch = Math.max(0, currentHeight - gap + buffer);

      setHoveredExpStretch(prev => {
        if (requiredStretch > prev) return requiredStretch;
        return prev;
      });
    };

    checkHeight();
    const interval = setInterval(checkHeight, 30);
    const timeout = setTimeout(() => clearInterval(interval), 400);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [hoveredExpId, isMobileTimeline, staticStretches]);

  useEffect(() => {
    const checkStaticHeights = () => {
      if (isMobileTimeline) return;
      const newStretches = {};

      const leftExps = experiences.filter(e => e.side === 'left').sort((a, b) => (b.endY * 12 + b.endM) - (a.endY * 12 + a.endM));
      const rightExps = experiences.filter(e => e.side === 'right').sort((a, b) => (b.endY * 12 + b.endM) - (a.endY * 12 + a.endM));

      const calculateSide = (exps) => {
        for (let i = 0; i < exps.length - 1; i++) {
          const exp = exps[i];
          const nextExp = exps[i + 1];
          const el = cardRefs.current[exp.id];
          if (!el) continue;

          const baseTop = getBasePositionForDate(exp.endY, exp.endM);
          const nextTop = getBasePositionForDate(nextExp.endY, nextExp.endM);
          const gap = nextTop - baseTop;

          const currentHeight = el.offsetHeight;
          const buffer = 40;
          const requiredStretch = Math.max(0, currentHeight - gap + buffer);

          if (requiredStretch > 0) {
            newStretches[exp.id] = requiredStretch;
          }
        }
      };

      calculateSide(leftExps);
      calculateSide(rightExps);

      setStaticStretches(prev => {
        let changed = false;
        if (Object.keys(newStretches).length !== Object.keys(prev).length) changed = true;
        else {
          for (const key in newStretches) {
            if (newStretches[key] !== prev[key]) changed = true;
          }
        }
        return changed ? newStretches : prev;
      });
    };

    checkStaticHeights();
    const interval = setInterval(checkStaticHeights, 200);
    const timeout = setTimeout(() => clearInterval(interval), 2000);

    window.addEventListener('resize', checkStaticHeights);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener('resize', checkStaticHeights);
    };
  }, [windowWidth, isMobileTimeline]);

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
      <ScrollIndicator />
      <main className="animate-fade-in" style={{ paddingBottom: '0' }}>
        {/* Hero Section */}
        <section id="hero" className="hero-landing-bg" style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '8rem 0',
          position: 'relative',
          '--hero-bg-img': `url(${import.meta.env.BASE_URL}images/landingpage.jpg)`,
          '--hero-bg-img-light': `url(${import.meta.env.BASE_URL}images/landingpage-light.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap-reverse', gap: '4rem', position: 'relative', zIndex: 11 }}>
          {/* Text Content */}
          <div style={{ flex: '1 1 500px' }}>
            <h1 style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
              <span style={{ fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: '500' }}>Hi, I'm</span>
              <span className="moving-gradient-hover" style={{ 
                fontSize: '5.5rem', 
                display: 'inline-block', 
                width: 'fit-content',
                paddingBottom: '0.2em',
                marginBottom: '-0.2em',
                filter: 'drop-shadow(1px 1px 0px #ffffff) drop-shadow(-1px -1px 0px #ffffff) drop-shadow(1px -1px 0px #ffffff) drop-shadow(-1px 1px 0px #ffffff)' 
              }}>Toby Yeung</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-primary)', maxWidth: '800px', marginBottom: '2.5rem', lineHeight: '1.6', minHeight: windowWidth < 600 ? '90px' : '60px' }}>
              {typedText}
              <span className="cursor-blink" style={{ opacity: isTyping ? 1 : 0.7 }}>|</span>
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="mailto:tobycyeung@gmail.com" className="btn btn-primary">Email Me</a>
              <a href="https://github.com/tobyyeung" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.75rem' }} aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path></svg>
              </a>
              <a href="https://www.linkedin.com/in/yeung-toby/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.75rem' }} aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          {/* Image Content */}
          <div style={{ flex: '1 1 350px', display: 'flex', justifyContent: 'center' }}>
            {/* Camera Body */}
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '450px', 
              aspectRatio: '3/2', 
              borderRadius: '32px', 
              background: 'linear-gradient(145deg, rgba(20, 30, 50, 0.8), #040812)', 
              border: '2px solid rgba(255, 255, 255, 0.1)', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              
              {/* Shutter Button */}
              <div style={{ position: 'absolute', top: '-12px', right: '40px', width: '45px', height: '12px', borderRadius: '6px 6px 0 0', background: 'linear-gradient(to bottom, #444, #222)', border: '2px solid rgba(255, 255, 255, 0.1)', borderBottom: 'none' }} />
              
              {/* Camera Dial */}
              <div style={{ position: 'absolute', top: '-8px', right: '100px', width: '35px', height: '8px', borderRadius: '4px 4px 0 0', background: '#333', border: '1px solid #111', borderBottom: 'none', backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)' }} />

              {/* Flash */}
              <div style={{ position: 'absolute', top: '25px', left: '30px', width: '50px', height: '25px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: 'inset 0 0 15px rgba(255, 255, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '80%', height: '40%', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '2px', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
              </div>

              {/* Red Recording Dot */}
              <div style={{ position: 'absolute', top: '30px', right: '35px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 10px var(--danger)', animation: 'blink 2s infinite' }} />

              {/* Camera Lens Outer Ring */}
              <div style={{ position: 'relative', width: '65%', aspectRatio: '1/1', borderRadius: '50%', padding: '12px', background: 'linear-gradient(135deg, #333, #111)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 15px 35px rgba(0,0,0,0.6)' }}>
                
                {/* Accent Gradient Ring */}
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', padding: '4px', background: 'var(--accent-gradient)' }}>
                  
                  {/* Deep Inner Lens Barrel */}
                  <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', border: '8px solid #050505', overflow: 'hidden', background: '#000', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9)' }}>
                    
                    {/* Lens Glare Reflection */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 10 }} />
                    
                    {/* The Photo */}
                    <img className="camera-pan" src={import.meta.env.BASE_URL + "images/self.jpg"} alt="Toby Yeung" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                  </div>
                </div>
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
            height: isMobileTimeline ? 'auto' : `${TIMELINE_HEIGHT}px`,
            display: isMobileTimeline ? 'flex' : 'block',
            flexDirection: 'column',
            gap: '2rem',
            transition: 'height 0.3s ease-in-out'
          }}>
            {/* The Central Vertical Spine */}
            <div style={{ position: 'absolute', left: isMobileTimeline ? '1.5rem' : '50%', top: 0, bottom: 0, transform: 'translateX(-50%)', width: '4px', background: 'var(--border-glass)', borderRadius: '4px' }}></div>

            {!isMobileTimeline && yearMarkers.map(year => {
              const topPx = getPositionForDate(year, 1, experiences, null, 0, staticStretches);

              return (
                <div key={year} style={{
                  position: 'absolute',
                  top: `${topPx}px`,
                  left: isMobileTimeline ? '1.5rem' : '50%',
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
                  transition: 'top 0.3s ease-in-out'
                }}>
                  {year}
                </div>
              );
            })}

            {sortedExperiences.map((exp) => {
              const isCardOnLeft = exp.side === 'left';
              const renderAsLeft = isMobileTimeline ? false : isCardOnLeft;

              const topPx = getPositionForDate(exp.endY, exp.endM, experiences, hoveredExpId, hoveredExpStretch, staticStretches);
              const startPx = getPositionForDate(exp.startY, exp.startM, experiences, hoveredExpId, hoveredExpStretch, staticStretches);

              const dotHeight = Math.max(20, startPx - topPx);
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
                  xShift={xShift}
                  dotWidth={dotWidth}
                  dotHeight={dotHeight}
                  dotOffset={dotOffset}
                  accentColor={accentColor}
                  borderGlassColor={borderGlassColor}
                  cardRef={el => { cardRefs.current[exp.id] = el; }}
                  animationIndex={animationIndex}
                  isVisible={experiencesInView}
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

      {/* Project Modal Overlay */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

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
