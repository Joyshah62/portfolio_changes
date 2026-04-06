'use client';

import { useEffect, useRef } from 'react';

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Responsive particle count
    const numParticles = Math.min(100, Math.floor((width * height) / 15000));
    const particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];

    for (let i = 0; i < numParticles; i++) {
       particles.push({
         x: Math.random() * width,
         y: Math.random() * height,
         vx: (Math.random() - 0.5) * 0.4,
         vy: (Math.random() - 0.5) * 0.4,
         radius: Math.random() * 1.5 + 0.5
       });
    }

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
       mouse.x = e.clientX;
       mouse.y = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;
    const limit = 140;

    const render = () => {
       ctx.clearRect(0, 0, width, height);
       
       for (let i = 0; i < particles.length; i++) {
         const p = particles[i];
         p.x += p.vx;
         p.y += p.vy;

         // Bounce off edges
         if (p.x < 0 || p.x > width) p.vx *= -1;
         if (p.y < 0 || p.y > height) p.vy *= -1;

         // Draw particle
         ctx.beginPath();
         ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
         ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
         ctx.fill();

         // Connect particles
         for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < limit) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(0, 255, 136, ${0.15 * (1 - dist / limit)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
         }

         // Mouse interaction (Draw lines to mouse)
         const dxMouse = p.x - mouse.x;
         const dyMouse = p.y - mouse.y;
         const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
         if (distMouse < 180) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.25 * (1 - distMouse / 180)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
         }
       }
       animationId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
       width = window.innerWidth;
       height = window.innerHeight;
       canvas.width = width;
       canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
       window.removeEventListener('mousemove', handleMouseMove);
       window.removeEventListener('resize', handleResize);
       cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
