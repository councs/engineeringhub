'use client';

import { useEffect, useRef } from 'react';
import { useRngdleStore } from '@/lib/store/useRngdleStore';

export default function LifeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { grid, ageGrid, gridSize, isPlaying, evalResult } = useRngdleStore();

  // Ghost Trail Grid (32x32 float opacity decay values)
  const trailRef = useRef<number[][]>(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(0))
  );

  // Calculate live population count
  let liveCount = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === 1) liveCount++;
    }
  }

  const rating = evalResult?.rating || 'Common';
  const shouldShake = liveCount > 350;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / gridSize;

    // Decay ghost trail values and set new cell trails
    const trails = trailRef.current;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === 1) {
          trails[r][c] = 0; // Active cell overrides trail
        } else {
          // If cell just died or had trail, decay opacity over 3-4 frames
          if (trails[r][c] > 0) {
            trails[r][c] = Math.max(0, trails[r][c] - 0.25);
          }
        }
      }
    }

    // Grade Theme Color Palettes
    let bgColor = '#020617'; // Slate 950
    let gridColor = '#1E293B'; // Slate 800
    let dividerColor = 'rgba(56, 189, 248, 0.3)';

    if (rating === 'Rare') {
      bgColor = '#022C22'; // Emerald 950
      gridColor = '#065F46'; // Emerald 800
      dividerColor = 'rgba(52, 211, 153, 0.4)';
    } else if (rating === 'Legendary' || rating === 'Mythic') {
      bgColor = '#16021F'; // Cyber Obsidian
      gridColor = '#4C0519'; // Rose/Purple 900
      dividerColor = 'rgba(245, 158, 11, 0.4)'; // Cyber Gold divider
    }

    // Clear Canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= gridSize; i++) {
      const pos = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(width, pos);
      ctx.stroke();
    }

    // Draw Symmetrical Axis Divider
    const midX = (gridSize / 2) * cellSize;
    ctx.strokeStyle = dividerColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(midX, 0);
    ctx.lineTo(midX, height);
    ctx.stroke();

    // 1. Render Fading Ghost Trails (Dead Cell Particles)
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const trailAlpha = trails[r][c];
        if (trailAlpha > 0 && grid[r][c] === 0) {
          const x = c * cellSize;
          const y = r * cellSize;
          ctx.fillStyle = `rgba(239, 68, 68, ${trailAlpha * 0.4})`; // Fading red/rose particle trail
          ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
        }
      }
    }

    // 2. Render Active Living Cells
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === 1) {
          const age = ageGrid[r][c];
          const x = c * cellSize;
          const y = r * cellSize;

          let fillColor = '#38BDF8';
          let glowColor = 'rgba(56, 189, 248, 0.4)';

          if (rating === 'Mythic' || rating === 'Legendary') {
            // Cyberpunk Gold / Neon Pink Palette
            if (age === 1) {
              fillColor = '#F59E0B'; // Cyber Gold
              glowColor = 'rgba(245, 158, 11, 0.6)';
            } else if (age >= 2 && age <= 5) {
              fillColor = '#EC4899'; // Neon Pink
              glowColor = 'rgba(236, 72, 153, 0.6)';
            } else {
              fillColor = '#A855F7'; // Neon Purple
              glowColor = 'rgba(168, 85, 247, 0.6)';
            }
          } else if (rating === 'Rare') {
            // Mint / Teal Palette
            if (age === 1) {
              fillColor = '#34D399'; // Mint
              glowColor = 'rgba(52, 211, 153, 0.5)';
            } else {
              fillColor = '#2DD4BF'; // Teal
              glowColor = 'rgba(45, 212, 191, 0.5)';
            }
          } else {
            // Common Palette
            if (age === 2) {
              fillColor = '#34D399';
              glowColor = 'rgba(52, 211, 153, 0.4)';
            } else if (age >= 3 && age <= 6) {
              fillColor = '#6366F1';
              glowColor = 'rgba(99, 102, 241, 0.4)';
            } else if (age >= 7) {
              fillColor = '#EC4899';
              glowColor = 'rgba(236, 72, 153, 0.5)';
            }
          }

          // Outer Glow
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 10;

          ctx.fillStyle = fillColor;
          const padding = 1.5;
          ctx.fillRect(
            x + padding,
            y + padding,
            cellSize - padding * 2,
            cellSize - padding * 2
          );

          ctx.shadowBlur = 0;

          // Track position for death trail when cell dies next frame
          trails[r][c] = 0.9;
        }
      }
    }
  }, [grid, ageGrid, gridSize, rating]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellSize = rect.width / gridSize;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      const state = useRngdleStore.getState();
      const newGrid = state.grid.map((r, rIdx) =>
        r.map((cVal, cIdx) => {
          if (rIdx === row && cIdx === col) return cVal === 1 ? 0 : 1;
          return cVal;
        })
      );
      const newAgeGrid = state.ageGrid.map((r, rIdx) =>
        r.map((aVal, cIdx) => {
          if (rIdx === row && cIdx === col) return newGrid[row][col] ? 1 : 0;
          return aVal;
        })
      );

      useRngdleStore.setState({ grid: newGrid, ageGrid: newAgeGrid });
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center w-full max-w-xl aspect-square rounded-2xl border p-3 shadow-2xl overflow-hidden group transition-all duration-500 ${
      rating === 'Mythic' || rating === 'Legendary'
        ? 'bg-purple-950/60 border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.3)]'
        : rating === 'Rare'
        ? 'bg-emerald-950/60 border-emerald-500/50 shadow-[0_0_30px_rgba(52,211,153,0.2)]'
        : 'bg-slate-950 border-slate-800'
    } ${shouldShake ? 'animate-bounce' : ''}`}>
      
      {/* Background glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-full blur-3xl pointer-events-none opacity-50 group-hover:opacity-75 transition-opacity" />

      {/* Screen shake alert badge if live pop > 350 */}
      {shouldShake && (
        <div className="absolute top-4 z-20 px-3 py-1 bg-rose-500/90 text-slate-950 font-extrabold text-[10px] uppercase tracking-widest rounded-full shadow-lg animate-pulse">
          ⚡ Screen-Shake: Extreme Population Surge ({liveCount})!
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        onClick={handleCanvasClick}
        className="w-full h-full rounded-xl cursor-pointer relative z-10 touch-none"
      />

      {/* Grid Legend & Axis tag */}
      <div className="flex items-center justify-between w-full mt-3 px-2 text-[11px] text-slate-400 font-mono relative z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" /> Newborn
          <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" /> Young
          <span className="w-2 h-2 rounded-full bg-purple-500 ml-1" /> Mature
          <span className="w-2 h-2 rounded-full bg-pink-500 ml-1" /> Elder
        </span>
        <span className="text-slate-400 font-bold">{evalResult?.ruleMode || 'B3/S23'}</span>
      </div>
    </div>
  );
}
