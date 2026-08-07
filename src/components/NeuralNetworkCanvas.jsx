import React, { useEffect, useRef } from 'react';

const KEYWORDS = [
  "React",
  "Python",
  "AI / ML",
  "C++",
  "Microservices",
  "Docker",
  "UIUC",
  "TypeScript",
  "PyTorch",
  "Full-Stack",
  "Node.js",
  "Economics"
];

const NeuralNetworkCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;

    // Mouse state
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 160,
      active: false
    };

    // Helper to get theme colors from document
    const getColors = () => {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      return {
        isDark,
        nodeBg: isDark ? 'rgba(58, 197, 163, 0.85)' : 'rgba(16, 140, 115, 0.9)',
        nodeGlow: isDark ? 'rgba(58, 197, 163, 0.4)' : 'rgba(16, 140, 115, 0.3)',
        text: isDark ? '#ffffff' : '#0f172a',
        textSubtle: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(30, 41, 59, 0.9)',
        line: isDark ? 'rgba(58, 197, 163, 0.15)' : 'rgba(16, 140, 115, 0.15)',
        lineActive: isDark ? 'rgba(58, 197, 163, 0.6)' : 'rgba(16, 140, 115, 0.6)',
        pulse: isDark ? '#38bdf8' : '#0284c7',
        badgeBg: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)',
        badgeBorder: isDark ? 'rgba(58, 197, 163, 0.3)' : 'rgba(16, 140, 115, 0.3)'
      };
    };

    let colors = getColors();

    // Node class
    class Node {
      constructor(isKeyword = false, keyword = '') {
        this.isKeyword = isKeyword;
        this.keyword = keyword;
        this.x = Math.random() * (width || 400);
        this.y = Math.random() * (height || 400);
        // Subtle drift velocities
        this.vx = (Math.random() - 0.5) * 0.75;
        this.vy = (Math.random() - 0.5) * 0.75;
        this.radius = isKeyword ? 6 : 3;
        this.hovered = false;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off canvas edges
        const margin = 20;
        if (this.x < margin) { this.x = margin; this.vx *= -1; }
        if (this.x > width - margin) { this.x = width - margin; this.vx *= -1; }
        if (this.y < margin) { this.y = margin; this.vy *= -1; }
        if (this.y > height - margin) { this.y = height - margin; this.vy *= -1; }

        // Mouse interaction drift
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            this.hovered = true;
            // Slight push away from mouse
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.2;
            this.y -= (dy / dist) * force * 1.2;
          } else {
            this.hovered = false;
          }
        } else {
          this.hovered = false;
        }

        this.pulsePhase += 0.03;
      }

      draw() {
        ctx.save();
        
        // Node circle
        ctx.beginPath();
        const currentRadius = this.hovered ? this.radius * 1.4 : this.radius + Math.sin(this.pulsePhase) * 0.5;
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        
        ctx.fillStyle = this.hovered ? colors.pulse : colors.nodeBg;
        ctx.shadowColor = this.hovered ? colors.pulse : colors.nodeGlow;
        ctx.shadowBlur = this.hovered ? 12 : 6;
        ctx.fill();

        // If it's a keyword node, render badge text
        if (this.isKeyword && this.keyword) {
          ctx.font = `${this.hovered ? '600 13px' : '500 12px'} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          const textMetrics = ctx.measureText(this.keyword);
          const paddingX = 10;
          const paddingY = 5;
          const rectW = textMetrics.width + paddingX * 2;
          const rectH = 22;
          const rectX = this.x - rectW / 2;
          const rectY = this.y - 14 - rectH;

          // Draw pill background
          ctx.beginPath();
          ctx.roundRect(rectX, rectY, rectW, rectH, 11);
          ctx.fillStyle = colors.badgeBg;
          ctx.strokeStyle = this.hovered ? colors.pulse : colors.badgeBorder;
          ctx.lineWidth = this.hovered ? 1.5 : 1;
          ctx.shadowColor = this.hovered ? colors.pulse : 'rgba(0, 0, 0, 0.1)';
          ctx.shadowBlur = this.hovered ? 10 : 4;
          ctx.fill();
          ctx.stroke();

          // Draw label text
          ctx.fillStyle = this.hovered ? (colors.isDark ? '#38bdf8' : '#0284c7') : colors.textSubtle;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 0;
          ctx.fillText(this.keyword, this.x, rectY + rectH / 2);
        }

        ctx.restore();
      }
    }

    // Nodes collection setup
    let nodes = [];

    const initNodes = () => {
      nodes = [];
      // Keyword nodes
      KEYWORDS.forEach((kw) => {
        nodes.push(new Node(true, kw));
      });
      // Extra structural nodes for neural connections density
      const extraNodesCount = Math.max(6, Math.floor((width * height) / 25000));
      for (let i = 0; i < extraNodesCount; i++) {
        nodes.push(new Node(false));
      }
    };

    // Pulses moving along network connections
    let pulses = [];
    const createPulse = (nodeA, nodeB) => {
      pulses.push({
        fromX: nodeA.x,
        fromY: nodeA.y,
        toX: nodeB.x,
        toY: nodeB.y,
        progress: 0,
        speed: 0.015 + Math.random() * 0.02
      });
    };

    // Resize handler
    const handleResize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = Math.max(380, rect.height || 420);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      colors = getColors();

      if (nodes.length === 0) {
        initNodes();
      } else {
        // Clamp existing node coordinates into new dimensions
        nodes.forEach(node => {
          node.x = Math.min(Math.max(node.x, 20), width - 20);
          node.y = Math.min(Math.max(node.y, 20), height - 20);
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse listeners
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Watch dark/light theme changes
    const observer = new MutationObserver(() => {
      colors = getColors();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Periodic random pulses
    const pulseInterval = setInterval(() => {
      if (nodes.length < 2) return;
      const i = Math.floor(Math.random() * nodes.length);
      const j = Math.floor(Math.random() * nodes.length);
      if (i !== j) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < 180) {
          createPulse(nodes[i], nodes[j]);
        }
      }
    }, 800);

    // Render / Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update & Draw Connection Lines
      const maxDistance = 160;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance);
            const isHovered = n1.hovered || n2.hovered;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);

            if (isHovered) {
              ctx.strokeStyle = colors.lineActive;
              ctx.lineWidth = 1.5;
            } else {
              ctx.strokeStyle = colors.line;
              ctx.lineWidth = 0.8;
            }

            ctx.globalAlpha = isHovered ? alpha * 0.9 : alpha * 0.6;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Update & Draw Pulses (synapse signals)
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const px = pulse.fromX + (pulse.toX - pulse.fromX) * pulse.progress;
        const py = pulse.fromY + (pulse.toY - pulse.fromY) * pulse.progress;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.pulse;
        ctx.shadowColor = colors.pulse;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      // Update & Draw Nodes
      nodes.forEach(node => {
        node.update();
        node.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(pulseInterval);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    };
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '380px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
};

export default NeuralNetworkCanvas;
