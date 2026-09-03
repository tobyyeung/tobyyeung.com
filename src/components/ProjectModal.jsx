import React from 'react';
import { createPortal } from 'react-dom';
import { useDetailModalMotion } from '../hooks/useDetailModalMotion';
import { useBreakpoints } from '../hooks/useBreakpoints';

const ProjectModal = ({ project, onClose, sourceElement }) => {
  const { isTablet } = useBreakpoints();

  const { isClosing, requestClose, panelRef } = useDetailModalMotion(project, onClose, sourceElement);

  if (!project) return null;

  return createPortal(
    <div
      className={`detail-modal-backdrop${isClosing ? ' is-closing' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(2, 7, 22, 0.18)',
        zIndex: 100010,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={requestClose}
    >
      {/* Modal Content container */}
      <div
        className="detail-modal-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        style={{
          background: 'color-mix(in srgb, var(--bg-primary) 74%, transparent)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glass)',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={requestClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.5)',
            border: 'none',
            color: 'white',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            fontSize: '1.25rem'
          }}
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Top Header Section (Title, Buttons, and Tags span across both sides) */}
        <div style={{ padding: '2.5rem 2.5rem 1rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
          {/* Title and Buttons Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingRight: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', lineHeight: 1.1, margin: 0 }}>
              {project.title}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', alignItems: 'center' }}>
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path></svg>
                  Source Code
                </a>
              )}
              {project.websiteUrl && (
                <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  Live Demo
                </a>
              )}
            </div>
          </div>
          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {project.technologies && project.technologies.map((tech, idx) => (
              <span 
                key={idx} 
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-primary)',
                  padding: '0.35rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Content Section (Split into left and right) */}
        <div style={{ display: 'flex', flexDirection: isTablet ? 'column-reverse' : 'row', flex: 1 }}>
          {/* Details Section (Left side) */}
          <div style={{ flex: '1 1 50%', padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>


            <div 
              className="modal-description"
              style={{ 
                color: 'var(--text-primary)', 
                fontSize: '1.1rem', 
                lineHeight: '1.8',
                marginBottom: '2.5rem'
              }}
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          </div>

          {/* Image Section (Right side) */}
          <div style={{ flex: '1 1 50%', minHeight: isTablet ? '220px' : 'auto', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isTablet ? '2rem 2rem 0' : '2.5rem' }}>
            <img 
              src={project.imageUrl || `https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800&sig=${project.id}`} 
              alt={project.title} 
              style={{ maxWidth: '100%', maxHeight: isTablet ? '300px' : '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}
            />
          </div>
        </div>
      </div>
      
      {/* Small inline style block for keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-description strong {
          color: var(--text-primary);
          font-weight: 700;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ProjectModal;
