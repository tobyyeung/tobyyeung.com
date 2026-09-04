import { useState } from 'react';
import { skillsData } from '../data/skills';
import { siteLinks } from '../data/siteLinks';
import '../styles/skills.css';

const darkSkillLogos = new Set(['Markdown', 'Ollama', 'LLMs']);
const prominentSkillLogos = new Set(['Julia', 'LLMs']);

const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState('Languages');

  return (
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
          <div className="skills-categories" role="group" aria-label="Skill categories">
            {Object.keys(skillsData).map(category => (
              <button
                key={category}
                type="button"
                className={`skills-category${activeCategory === category ? ' is-active' : ''}`}
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="skills-grid">
            {skillsData[activeCategory].map(skill => {
              const href = siteLinks.skills[skill];
              const Card = href ? 'a' : 'div';
              return (
                <Card
                  key={skill}
                  className="skills-card"
                  {...(href ? {
                    href,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    title: `Learn about ${skill} (opens in a new tab)`
                  } : {})}
                >
                  <div className="skills-logo-area">
                    <img
                      src={`${import.meta.env.BASE_URL}images/skills/${skill.replace(/[\/\\]/g, '_').toLowerCase()}.png`}
                      alt={skill}
                      className={[
                        'skills-logo',
                        darkSkillLogos.has(skill) && 'skills-logo--light',
                        prominentSkillLogos.has(skill) && 'skills-logo--prominent',
                        skill === 'Julia' && 'skills-logo--julia'
                      ].filter(Boolean).join(' ')}
                      onError={event => { event.currentTarget.hidden = true; }}
                    />
                  </div>
                  <span className="skills-name">{skill}</span>
                </Card>
              );
            })}
          </div>
        </div>
        <div className="skills-clear" />
      </div>
    </article>
  );
};

export default SkillsSection;
