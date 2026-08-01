'use client';

import { useEffect, useRef } from 'react';
import { useRngdleStore } from '@/lib/store/useRngdleStore';

export default function LifeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { grid, ageGrid, gridSize, isPlaying } = useRngdleStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get display size
    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / gridSize;

    // Clear canvas
    ctx.fillStyle = '#020617'; // slate-950
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#1E293B'; // slate-800
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= gridSize; i++) {
      const pos = i * cellSize;
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, height);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(width, pos);
      ctx.stroke();
    }

    // Draw symmetry axis line (center vertical divider)
    const midX = (gridSize / 2) * cellSize;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)'; // sky-400 glowing divider
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(midX, 0);
    ctx.lineTo(midX, height);
    ctx.stroke();

    // Render cells
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === 1) {
          const age = ageGrid[r][c];
          const x = c * cellSize;
          const y = r * cellSize;

          // Color scale based on age
          let fillColor = '#38BDF8'; // Age 1 (Sky-400)
          let glowColor = 'rgba(56, 189, 248, 0.4)';

          if (age === 2) {
            fillColor = '#34D399'; // Emerald-400
            glowColor = 'rgba(52, 211, 153, 0.4)';
          } else if (age >= 3 && age <= 6) {
            fillColor = '#6366F1'; // Indigo-500
            glowColor = 'rgba(99, 102, 241, 0.4)';
          } else if (age >= 7 && age <= 12) {
            fillColor = '#A855F7'; // Purple-500
            glowColor = 'rgba(168, 85, 247, 0.4)';
          } else if (age > 12) {
            fillColor = '#EC4899'; // Pink-500
            glowColor = 'rgba(236, 72, 153, 0.5)';
          }

          // Outer Cell Glow
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 8;

          // Inner rounded cell block
          ctx.fillStyle = fillColor;
          const padding = 1.5;
          ctx.fillRect(
            x + padding,
            y + padding,
            cellSize - padding * 2,
            cellSize - padding * 2
          );

          // Reset shadow
          ctx.shadowBlur = 0;
        }
      }
    }
  }, [grid, ageGrid, gridSize]);

  // Click to toggle cell manually
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
    <div className="relative flex flex-col items-center justify-center w-full max-w-xl aspect-square bg-slate-950 rounded-2xl border border-slate-800 p-3 shadow-2xl overflow-hidden group">
      {/* Background glow behind canvas */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-full blur-3xl pointer-events-none opacity-50 group-hover:opacity-75 transition-opacity" />

      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        onClick={handleCanvasClick}
        className="w-full h-full rounded-xl cursor-pointer bg-slate-950 relative z-10 touch-none"
      />

      {/* Grid Legend & Axis tag */}
      <div className="flex items-center justify-between w-full mt-3 px-2 text-[11px] text-slate-400 font-mono relative z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" /> Newborn
          <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" /> Young
          <span className="w-2 h-2 rounded-full bg-purple-500 ml-1" /> Mature
          <span className="w-2 h-2 rounded-full bg-pink-500 ml-1" /> Elder
        </span>
        <span className="text-slate-500">32x32 Symmetrical Torus</span>
      </div>
    </div>
  );
}
