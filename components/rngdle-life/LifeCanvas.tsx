'use client';

import { useEffect, useRef } from 'react';
import { useRngdleStore } from '@/lib/store/useRngdleStore';
import { Search, Eye, Sparkles, Target, Crosshair } from 'lucide-react';

export default function LifeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    gameMode,
    grid,
    ageGrid,
    gridSize,
    isPlaying,
    isInspecting,
    inspectCellInfo,
    evalResult,

    // Artillery State
    spawnEdge,
    spawnPos,
    projectileType,
  } = useRngdleStore();

  const trailRef = useRef<number[][]>([]);

  let liveCount = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === 1) liveCount++;
    }
  }

  const theme = evalResult?.theme || 'Terminal Green';
  const isSurging = liveCount > 350 && !isInspecting;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / gridSize;

    if (trailRef.current.length !== gridSize) {
      trailRef.current = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    }

    const trails = trailRef.current;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === 1) {
          trails[r][c] = 0;
        } else {
          if (trails[r][c] > 0) {
            trails[r][c] = Math.max(0, trails[r][c] - 0.20);
          }
        }
      }
    }

    let bgColor = '#020617';
    let gridColor = '#1E293B';
    let dividerColor = 'rgba(34, 197, 94, 0.3)';

    if (gameMode === 'artillery') {
      bgColor = '#0F040A';
      gridColor = '#3F0713';
      dividerColor = 'rgba(244, 63, 94, 0.5)';
    } else if (theme === 'Cyberpunk Neon') {
      bgColor = '#16021F';
      gridColor = '#4C0519';
      dividerColor = 'rgba(6, 182, 212, 0.5)';
    } else if (theme === 'Golden Solar') {
      bgColor = '#0F051D';
      gridColor = '#3B0764';
      dividerColor = 'rgba(245, 158, 11, 0.5)';
    }

    if (isInspecting) {
      bgColor = '#0B0F17';
      gridColor = '#1E293B';
      dividerColor = 'rgba(250, 204, 21, 0.6)';
    }

    // Clear Canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = gridSize >= 48 ? 0.3 : 0.5;

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

    // Central Axis Divider
    const midX = (gridSize / 2) * cellSize;
    ctx.strokeStyle = dividerColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(midX, 0);
    ctx.lineTo(midX, height);
    ctx.stroke();

    // 1. Ghost Trails
    if (!isInspecting) {
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const trailAlpha = trails[r][c];
          if (trailAlpha > 0 && grid[r][c] === 0) {
            const x = c * cellSize;
            const y = r * cellSize;
            
            if (gameMode === 'artillery') {
              ctx.fillStyle = `rgba(244, 63, 94, ${trailAlpha * 0.45})`;
            } else if (theme === 'Cyberpunk Neon') {
              ctx.fillStyle = `rgba(236, 72, 153, ${trailAlpha * 0.45})`;
            } else if (theme === 'Golden Solar') {
              ctx.fillStyle = `rgba(245, 158, 11, ${trailAlpha * 0.45})`;
            } else {
              ctx.fillStyle = `rgba(34, 197, 94, ${trailAlpha * 0.35})`;
            }
            
            const pad = cellSize > 12 ? 1.5 : 0.8;
            ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
          }
        }
      }
    }

    // 2. Active Living Cells
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === 1) {
          const age = ageGrid[r][c];
          const x = c * cellSize;
          const y = r * cellSize;

          let fillColor = '#22C55E';
          let glowColor = 'rgba(34, 197, 94, 0.4)';

          if (gameMode === 'artillery') {
            fillColor = '#F43F5E';
            glowColor = 'rgba(244, 63, 94, 0.6)';
          } else if (isInspecting) {
            fillColor = '#38BDF8';
            glowColor = 'rgba(56, 189, 248, 0.6)';
          } else if (theme === 'Golden Solar') {
            fillColor = age === 1 ? '#FACC15' : age <= 5 ? '#F59E0B' : '#FB923C';
            glowColor = 'rgba(245, 158, 11, 0.6)';
          } else if (theme === 'Cyberpunk Neon') {
            fillColor = age === 1 ? '#06B6D4' : age <= 5 ? '#EC4899' : '#A855F7';
            glowColor = 'rgba(236, 72, 153, 0.6)';
          } else {
            fillColor = age === 1 ? '#4ADE80' : age <= 5 ? '#22C55E' : '#16A34A';
            glowColor = 'rgba(34, 197, 94, 0.4)';
          }

          ctx.shadowColor = glowColor;
          ctx.shadowBlur = gridSize >= 48 ? 6 : 10;

          ctx.fillStyle = fillColor;
          const padding = cellSize > 12 ? 1.5 : 0.8;
          ctx.fillRect(
            x + padding,
            y + padding,
            cellSize - padding * 2,
            cellSize - padding * 2
          );

          ctx.shadowBlur = 0;
          trails[r][c] = 0.9;
        }
      }
    }

    // 3. ARTILLERY LAUNCHER TRAJECTORY PREVIEW & CROSSHAIRS
    if (gameMode === 'artillery' && !isPlaying) {
      let spawnR = 1;
      let spawnC = Math.max(0, Math.min(gridSize - 1, spawnPos));

      if (spawnEdge === 'top') {
        spawnR = 1;
        spawnC = spawnPos;
      } else if (spawnEdge === 'bottom') {
        spawnR = gridSize - 2;
        spawnC = spawnPos;
      } else if (spawnEdge === 'left') {
        spawnR = spawnPos;
        spawnC = 1;
      } else if (spawnEdge === 'right') {
        spawnR = spawnPos;
        spawnC = gridSize - 2;
      }

      const launchX = spawnC * cellSize + cellSize / 2;
      const launchY = spawnR * cellSize + cellSize / 2;

      ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      let targetX = width / 2;
      let targetY = height / 2;

      if (spawnEdge === 'top') {
        targetX = projectileType === 'glider' ? launchX + 120 : launchX;
        targetY = height - 20;
      } else if (spawnEdge === 'bottom') {
        targetX = projectileType === 'glider' ? launchX + 120 : launchX;
        targetY = 20;
      } else if (spawnEdge === 'left') {
        targetX = width - 20;
        targetY = projectileType === 'glider' ? launchY + 120 : launchY;
      } else if (spawnEdge === 'right') {
        targetX = 20;
        targetY = projectileType === 'glider' ? launchY + 120 : launchY;
      }

      ctx.beginPath();
      ctx.moveTo(launchX, launchY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#F43F5E';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(launchX, launchY, cellSize * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 4. Seed Inspector Focus Box
    if (isInspecting && inspectCellInfo) {
      const { row, col, mirroredCol, isAlive } = inspectCellInfo;

      const leftX = col * cellSize;
      const leftY = row * cellSize;

      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#FACC15';
      ctx.shadowBlur = 10;
      ctx.strokeRect(leftX + 0.5, leftY + 0.5, cellSize - 1, cellSize - 1);

      ctx.fillStyle = isAlive ? 'rgba(250, 204, 21, 0.5)' : 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(leftX + 1, leftY + 1, cellSize - 2, cellSize - 2);

      const rightX = mirroredCol * cellSize;
      const rightY = row * cellSize;

      ctx.strokeStyle = '#EC4899';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#EC4899';
      ctx.shadowBlur = 10;
      ctx.strokeRect(rightX + 0.5, rightY + 0.5, cellSize - 1, cellSize - 1);

      ctx.fillStyle = isAlive ? 'rgba(236, 72, 153, 0.5)' : 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(rightX + 1, rightY + 1, cellSize - 2, cellSize - 2);

      ctx.shadowBlur = 0;
    }
  }, [grid, ageGrid, gridSize, theme, gameMode, spawnEdge, spawnPos, projectileType, isPlaying, isInspecting, inspectCellInfo]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPlaying || isInspecting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellSize = rect.width / gridSize;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (gameMode === 'artillery') {
      if (row <= 2) {
        useRngdleStore.getState().setSpawnEdge('top');
        useRngdleStore.getState().setSpawnPos(col);
      } else if (row >= gridSize - 3) {
        useRngdleStore.getState().setSpawnEdge('bottom');
        useRngdleStore.getState().setSpawnPos(col);
      } else if (col <= 2) {
        useRngdleStore.getState().setSpawnEdge('left');
        useRngdleStore.getState().setSpawnPos(row);
      } else if (col >= gridSize - 3) {
        useRngdleStore.getState().setSpawnEdge('right');
        useRngdleStore.getState().setSpawnPos(row);
      }
      return;
    }

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

  // Concise Rule Mode Label for legend so text never cuts off
  const shortRuleLabel = evalResult?.ruleMode?.split(' ')[0] || 'B3/S23';

  return (
    <div className={`relative flex flex-col items-center justify-center w-full max-w-xl rounded-2xl border p-4 shadow-2xl overflow-hidden group transition-all duration-300 ${
      gameMode === 'artillery'
        ? 'bg-rose-950/80 border-rose-500/60 shadow-[0_0_35px_rgba(244,63,94,0.3)]'
        : isInspecting
        ? 'bg-slate-950 border-amber-500/60 shadow-[0_0_35px_rgba(250,204,21,0.25)]'
        : theme === 'Golden Solar'
        ? 'bg-purple-950/70 border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.35)]'
        : theme === 'Cyberpunk Neon'
        ? 'bg-purple-950/60 border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.3)]'
        : 'bg-slate-950 border-emerald-500/40 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
    } ${isSurging ? 'ring-2 ring-rose-500/80 shadow-[0_0_35px_rgba(244,63,94,0.5)]' : ''}`}>
      
      {/* Background glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-full blur-3xl pointer-events-none opacity-50 group-hover:opacity-75 transition-opacity" />

      {/* Inspection Mode HUD */}
      {isInspecting && inspectCellInfo && (
        <div className="absolute top-4 z-30 flex flex-wrap items-center gap-3 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-amber-500/50 rounded-xl shadow-xl text-slate-200 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <Search size={16} />
            <span>Pod {inspectCellInfo.podIndex} | Cell ({inspectCellInfo.row}, {inspectCellInfo.col})</span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">PRNG:</span>
            <span className="font-bold text-sky-400">{inspectCellInfo.prngVal}</span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Threshold:</span>
            <span className="text-slate-300">&lt; {inspectCellInfo.threshold}</span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className={`px-2.5 py-0.5 rounded text-xs font-extrabold flex items-center gap-1 border ${
            inspectCellInfo.isAlive
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}>
            <Sparkles size={12} />
            <span>{inspectCellInfo.isAlive ? 'ALIVE' : 'DEAD'}</span>
          </div>
        </div>
      )}

      {/* Population Surge Alert Badge */}
      {isSurging && (
        <div className="absolute top-4 z-20 px-3 py-1 bg-rose-500/90 text-slate-950 font-extrabold text-[10px] uppercase tracking-widest rounded-full shadow-lg animate-pulse">
          ⚡ Surge: Extreme Population Spike ({liveCount})!
        </div>
      )}

      {/* Canvas Square Aspect Ratio Container */}
      <div className="w-full aspect-square relative z-10">
        <canvas
          ref={canvasRef}
          width={512}
          height={512}
          onClick={handleCanvasClick}
          className="w-full h-full rounded-xl cursor-pointer touch-none"
        />
      </div>

      {/* Grid Legend & Axis tag - Clean flex-wrap layout so text never truncates */}
      <div className="flex flex-wrap items-center justify-between gap-2 w-full mt-3 px-1 text-[11px] text-slate-400 font-mono relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          {gameMode === 'artillery' ? (
            <span className="text-rose-400 font-extrabold flex items-center gap-1">
              <Crosshair size={12} /> Aiming: Click Border to Position Launcher
            </span>
          ) : isInspecting ? (
            <span className="text-amber-400 font-extrabold flex items-center gap-1">
              <Eye size={12} /> Inspecting Seed Construction...
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> New</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Young</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Mid</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Elder</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-300 font-bold shrink-0">
          <span>{gridSize}x{gridSize} ({evalResult?.podCount || 1} {evalResult?.podCount === 1 ? 'Pod' : 'Pods'})</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-extrabold" title={evalResult?.ruleMode}>{shortRuleLabel}</span>
        </div>
      </div>

    </div>
  );
}
