'use client';

import { useEffect, useRef } from 'react';
import { useRpsStore } from '@/lib/store/useRpsStore';
import { playSortSound } from '@/lib/utils/audio';

// Constants for 2D physics
const MAX_SPEED = 3.5;
const STEER_FORCE = 0.18;
const COLLISION_DIST = 26; // collision radius in px
const FLEE_DIST = 160;

interface Entity2D {
  id: number;
  type: 'rock' | 'paper' | 'scissors';
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function SimulationCanvas2d() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    isPlaying,
    speedMultiplier,
    volume,
    isMuted,
    initialRockCount,
    initialPaperCount,
    initialScissorsCount,
    updateCounts,
    finishSimulation,
    isFinished,
    movementMode,
    resetKey
  } = useRpsStore();

  // Keep entities in a ref so they persist when pausing/playing
  const entitiesRef = useRef<Entity2D[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  // Helper to (re)initialize entities
  const initEntities = (width: number, height: number) => {
    let entities: Entity2D[] = [];
    let idCounter = 0;

    const spawnType = (type: 'rock' | 'paper' | 'scissors', count: number) => {
      for (let i = 0; i < count; i++) {
        const x = 30 + Math.random() * (width - 60);
        const y = 30 + Math.random() * (height - 60);
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle);
        const vy = Math.sin(angle);

        entities.push({
          id: idCounter++,
          type,
          x,
          y,
          vx,
          vy
        });
      }
    };

    spawnType('rock', initialRockCount);
    spawnType('paper', initialPaperCount);
    spawnType('scissors', initialScissorsCount);

    entitiesRef.current = entities;
    updateCounts(initialRockCount, initialPaperCount, initialScissorsCount);
  };

  // Effect to handle initialization and resizing
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 400;
    canvas.width = width;
    canvas.height = height;

    // Reset and initialize entities
    initEntities(width, height);

    // Draw initial static frame
    drawFrame(width, height);

    // Handle resizing
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      canvas.width = w;
      canvas.height = h;
      drawFrame(w, h);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initialRockCount, initialPaperCount, initialScissorsCount, resetKey]);

  // Effect to handle simulation loop on play/pause changes
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const emojis = {
      rock: '🪨',
      paper: '📄',
      scissors: '✂️'
    };

    // Main animation loop frame update
    const updateFrame = () => {
      if (!isPlaying || isFinished) {
        // Stop scheduling frames if paused or finished
        return;
      }

      const stepSpeed = MAX_SPEED * speedMultiplier;
      const steerForce = STEER_FORCE * speedMultiplier;
      const entities = entitiesRef.current;

      // 0. Compute counts for doomed state check
      let rockCount = 0;
      let paperCount = 0;
      let scissorsCount = 0;
      entities.forEach(e => {
        if (e.type === 'rock') rockCount++;
        else if (e.type === 'paper') paperCount++;
        else if (e.type === 'scissors') scissorsCount++;
      });

      const isRockDoomed = scissorsCount === 0 && paperCount > 0;
      const isPaperDoomed = rockCount === 0 && scissorsCount > 0;
      const isScissorsDoomed = paperCount === 0 && rockCount > 0;

      // 1. Physics update
      entities.forEach(entity => {
        const isDoomed = 
          (entity.type === 'rock' && isRockDoomed) ||
          (entity.type === 'paper' && isPaperDoomed) ||
          (entity.type === 'scissors' && isScissorsDoomed);

        const currentMaxSpeed = isDoomed ? stepSpeed * 0.35 : stepSpeed;

        let prey: Entity2D | null = null;
        let predator: Entity2D | null = null;
        let minPreyDist = Infinity;
        let minPredDist = Infinity;

        const targets = {
          rock: { prey: 'scissors', predator: 'paper' },
          paper: { prey: 'rock', predator: 'scissors' },
          scissors: { prey: 'paper', predator: 'rock' }
        };

        const behavior = targets[entity.type];

        // Find closest predator and prey
        entities.forEach(other => {
          if (other.id === entity.id) return;
          const dx = other.x - entity.x;
          const dy = other.y - entity.y;
          const dist = Math.hypot(dx, dy);

          if (other.type === behavior.prey) {
            if (dist < minPreyDist) {
              minPreyDist = dist;
              prey = other;
            }
          } else if (other.type === behavior.predator) {
            if (dist < minPredDist) {
              minPredDist = dist;
              predator = other;
            }
          }
        });

        let ax = 0;
        let ay = 0;

        if (movementMode === 'wander') {
          ax += (Math.random() - 0.5) * currentMaxSpeed * 0.4;
          ay += (Math.random() - 0.5) * currentMaxSpeed * 0.4;
        } else {
          // Hunt Mode
          if (prey) {
            const dx = (prey as Entity2D).x - entity.x;
            const dy = (prey as Entity2D).y - entity.y;
            const dist = Math.hypot(dx, dy) || 1;
            const destVx = (dx / dist) * currentMaxSpeed;
            const destVy = (dy / dist) * currentMaxSpeed;
            ax += (destVx - entity.vx) * steerForce;
            ay += (destVy - entity.vy) * steerForce;
          }

          if (predator && minPredDist < FLEE_DIST) {
            const dx = entity.x - (predator as Entity2D).x;
            const dy = entity.y - (predator as Entity2D).y;
            const dist = Math.hypot(dx, dy) || 1;
            const destVx = (dx / dist) * currentMaxSpeed * 1.3;
            const destVy = (dy / dist) * currentMaxSpeed * 1.3;
            ax += (destVx - entity.vx) * steerForce;
            ay += (destVy - entity.vy) * steerForce;
          }

          if (movementMode === 'chaos') {
            ax += (Math.random() - 0.5) * currentMaxSpeed * 0.6;
            ay += (Math.random() - 0.5) * currentMaxSpeed * 0.6;
          }
        }

        entity.vx += ax;
        entity.vy += ay;

        const speed = Math.hypot(entity.vx, entity.vy) || 1;
        if (speed > currentMaxSpeed) {
          entity.vx = (entity.vx / speed) * currentMaxSpeed;
          entity.vy = (entity.vy / speed) * currentMaxSpeed;
        }

        entity.x += entity.vx;
        entity.y += entity.vy;

        // Boundaries check
        const r = 14;
        if (entity.x > width - r) { entity.x = width - r; entity.vx *= -1; }
        if (entity.x < r) { entity.x = r; entity.vx *= -1; }
        if (entity.y > height - r) { entity.y = height - r; entity.vy *= -1; }
        if (entity.y < r) { entity.y = r; entity.vy *= -1; }
      });

      // 2. Collision checking
      let hasCollisions = false;
      for (let i = 0; i < entities.length; i++) {
        const e1 = entities[i];
        for (let j = i + 1; j < entities.length; j++) {
          const e2 = entities[j];
          if (e1.type === e2.type) continue;

          const dx = e1.x - e2.x;
          const dy = e1.y - e2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < COLLISION_DIST) {
            let winner: Entity2D | null = null;
            let loser: Entity2D | null = null;

            if (
              (e1.type === 'rock' && e2.type === 'scissors') ||
              (e1.type === 'paper' && e2.type === 'rock') ||
              (e1.type === 'scissors' && e2.type === 'paper')
            ) {
              winner = e1;
              loser = e2;
            } else {
              winner = e2;
              loser = e1;
            }

            loser.type = winner.type;

            const pushX = (dx / (dist || 1)) * 1.5;
            const pushY = (dy / (dist || 1)) * 1.5;
            winner.vx += pushX;
            winner.vy += pushY;
            loser.vx -= pushX;
            loser.vy -= pushY;

            hasCollisions = true;
          }
        }
      }

      if (hasCollisions) {
        playSortSound(50, 100, volume, isMuted);
      }

      // 3. Count update & game over check
      let rocks = 0;
      let papers = 0;
      let scissors = 0;

      entities.forEach(e => {
        if (e.type === 'rock') rocks++;
        else if (e.type === 'paper') papers++;
        else if (e.type === 'scissors') scissors++;
      });

      updateCounts(rocks, papers, scissors);

      const total = rocks + papers + scissors;
      if (rocks === total) finishSimulation('rock');
      else if (papers === total) finishSimulation('paper');
      else if (scissors === total) finishSimulation('scissors');

      // Draw active frame with wiggles
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, width - 8, height - 8);

      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      entities.forEach(entity => {
        const isDoomed = 
          (entity.type === 'rock' && isRockDoomed) ||
          (entity.type === 'paper' && isPaperDoomed) ||
          (entity.type === 'scissors' && isScissorsDoomed);

        const time = Date.now() * 0.012;
        const wobbleFreq = isDoomed ? 4.0 : (movementMode === 'chaos' ? 2.5 : 1.2);
        const wobbleAmp = isDoomed ? 8.0 : (movementMode === 'chaos' ? 5.0 : 2.0);
        
        const shakeX = Math.sin(time * wobbleFreq * 1.5 + entity.id) * wobbleAmp;
        const shakeY = Math.cos(time * wobbleFreq * 1.0 + entity.id) * wobbleAmp;

        const emoji = isDoomed ? '😱' : emojis[entity.type];
        ctx.fillText(emoji, entity.x + shakeX, entity.y + shakeY);
      });

      // Request next frame
      animationFrameIdRef.current = requestAnimationFrame(updateFrame);
    };

    if (isPlaying && !isFinished) {
      animationFrameIdRef.current = requestAnimationFrame(updateFrame);
    } else {
      // Draw static frame once (flat emojis, no wiggling or CPU consumption)
      drawFrame(width, height);
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, isFinished, speedMultiplier, volume, isMuted, movementMode]);

  // Static frame drawing utility
  const drawFrame = (w: number, h: number) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const emojis = {
      rock: '🪨',
      paper: '📄',
      scissors: '✂️'
    };

    let rockCount = 0;
    let paperCount = 0;
    let scissorsCount = 0;
    entitiesRef.current.forEach(e => {
      if (e.type === 'rock') rockCount++;
      else if (e.type === 'paper') paperCount++;
      else if (e.type === 'scissors') scissorsCount++;
    });

    const isRockDoomed = scissorsCount === 0 && paperCount > 0;
    const isPaperDoomed = rockCount === 0 && scissorsCount > 0;
    const isScissorsDoomed = paperCount === 0 && rockCount > 0;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    entitiesRef.current.forEach(entity => {
      const isDoomed = 
        (entity.type === 'rock' && isRockDoomed) ||
        (entity.type === 'paper' && isPaperDoomed) ||
        (entity.type === 'scissors' && isScissorsDoomed);
      const emoji = isDoomed ? '😱' : emojis[entity.type];
      ctx.fillText(emoji, entity.x, entity.y);
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-[60vh] md:h-[65vh] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full bg-[#030712]" />
    </div>
  );
}
