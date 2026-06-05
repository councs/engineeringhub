'use client';

import React, { useState, useRef, useMemo } from 'react';

interface DataPoint {
  day: number;
  price: number;
}

interface ChartDisplayProps {
  historicalData: DataPoint[];
  futureData: DataPoint[];
  reveal: boolean;
  netUp: boolean;
}

export default function ChartDisplay({ historicalData, futureData, reveal, netUp }: ChartDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint & { x: number; y: number } | null>(null);

  // Layout parameters for 800x400 coordinate space
  const width = 800;
  const height = 400;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 40;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Combine datasets to calculate axis scales
  const allData = useMemo(() => {
    return [...historicalData, ...futureData];
  }, [historicalData, futureData]);

  const { minPrice, maxPrice, minDay, maxDay } = useMemo(() => {
    const prices = allData.map((d) => d.price);
    const days = allData.map((d) => d.day);
    const minP = Math.min(...prices) * 0.95; // 5% buffer
    const maxP = Math.max(...prices) * 1.05; // 5% buffer
    return {
      minPrice: minP,
      maxPrice: maxP,
      minDay: Math.min(...days),
      maxDay: Math.max(...days),
    };
  }, [allData]);

  // Coordinate projection helper functions
  const getX = (day: number) => {
    return paddingLeft + ((day - minDay) / (maxDay - minDay)) * chartWidth;
  };

  const getY = (price: number) => {
    return paddingTop + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
  };

  // Generate SVG path for historical data
  const historicalPath = useMemo(() => {
    if (historicalData.length === 0) return '';
    return historicalData
      .map((d, index) => {
        const x = getX(d.day);
        const y = getY(d.price);
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [historicalData, minDay, maxDay, minPrice, maxPrice]);

  // Generate SVG path for future data (starts at Day 0)
  const futurePath = useMemo(() => {
    if (futureData.length === 0) return '';
    const dayZero = historicalData[historicalData.length - 1];
    const fullFuture = dayZero ? [dayZero, ...futureData] : futureData;
    return fullFuture
      .map((d, index) => {
        const x = getX(d.day);
        const y = getY(d.price);
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [historicalData, futureData, minDay, maxDay, minPrice, maxPrice]);

  // Generate vertical grid lines
  const gridLines = useMemo(() => {
    const lines = [];
    const step = 5;
    for (let day = Math.ceil(minDay / step) * step; day <= maxDay; day += step) {
      lines.push(day);
    }
    return lines;
  }, [minDay, maxDay]);

  // Generate horizontal price tick lines
  const priceTicks = useMemo(() => {
    const ticks = [];
    const range = maxPrice - minPrice;
    const step = range / 5;
    for (let i = 0; i <= 5; i++) {
      ticks.push(minPrice + step * i);
    }
    return ticks;
  }, [minPrice, maxPrice]);

  // Handle Mouse Hover relative to coordinates
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;

    // Convert clientX to SVG coordinate scale
    const svgX = (clientX / rect.width) * width;

    // Find nearest data point in visible data array
    const visibleData = reveal ? allData : historicalData;
    let nearest: DataPoint | null = null;
    let minDiff = Infinity;

    visibleData.forEach((d) => {
      const diff = Math.abs(getX(d.day) - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = d;
      }
    });

    if (nearest) {
      const pt = nearest as DataPoint;
      setHoveredPoint({
        day: pt.day,
        price: pt.price,
        x: getX(pt.day),
        y: getY(pt.price),
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div ref={containerRef} className="w-full bg-slate-900/50 p-4 sm:p-6 rounded-2xl border border-slate-800/80 shadow-2xl relative select-none">
      
      {/* Chart Headers */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Interactive Price History</span>
          <h3 className="text-lg font-bold text-slate-100">
            T-30 Days <span className="text-slate-400 font-normal">to</span> {reveal ? 'T+5 Reveal' : 'T-0 Snapshot'}
          </h3>
        </div>
        
        {/* Legendary Keys */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-500 inline-block border-t border-blue-500" />
            <span className="text-slate-400">Historical (T-30 to T-0)</span>
          </div>
          {reveal && (
            <div className="flex items-center gap-1.5 animate-pulse">
              <span className={`w-3 h-0.5 inline-block ${netUp ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <span className={netUp ? 'text-emerald-400' : 'text-rose-500'}>
                Future ({netUp ? 'UP' : 'DOWN'})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full aspect-[2/1] min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Defs for gradients */}
          <defs>
            <linearGradient id="historicalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="revealGradUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="revealGradDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4">
            {/* Horizontal price grids */}
            {priceTicks.map((p, idx) => (
              <line
                key={`grid-y-${idx}`}
                x1={paddingLeft}
                y1={getY(p)}
                x2={width - paddingRight}
                y2={getY(p)}
              />
            ))}
            
            {/* Vertical day grids */}
            {gridLines.map((day, idx) => (
              <line
                key={`grid-x-${idx}`}
                x1={getX(day)}
                y1={paddingTop}
                x2={getX(day)}
                y2={height - paddingBottom}
              />
            ))}
          </g>

          {/* X and Y Axis Text Labels */}
          <g fill="#64748b" className="text-[11px] font-mono select-none" textAnchor="end">
            {priceTicks.map((p, idx) => (
              <text
                key={`label-y-${idx}`}
                x={paddingLeft - 10}
                y={getY(p) + 4}
              >
                ${p.toFixed(2)}
              </text>
            ))}
          </g>
          
          <g fill="#64748b" className="text-[11px] font-mono select-none" textAnchor="middle">
            {gridLines.map((day, idx) => {
              let label = `${day > 0 ? '+' : ''}${day}`;
              if (day === 0) label = 'T-0';
              
              // Only draw positive labels if revealed
              if (day > 0 && !reveal) return null;
              
              return (
                <text
                  key={`label-x-${idx}`}
                  x={getX(day)}
                  y={height - paddingBottom + 20}
                >
                  {label}
                </text>
              );
            })}
          </g>

          {/* Phase Separation Divider at T-0 */}
          <line
            x1={getX(0)}
            y1={paddingTop}
            x2={getX(0)}
            y2={height - paddingBottom}
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <text
            x={getX(0)}
            y={paddingTop - 12}
            fill="#94a3b8"
            className="text-[10px] font-semibold tracking-wider text-center"
            textAnchor="middle"
          >
            SNAPSHOT
          </text>

          {/* Historical Data Area & Line */}
          <path
            d={`${historicalPath} L ${getX(0)} ${getY(minPrice)} L ${getX(minDay)} ${getY(minPrice)} Z`}
            fill="url(#historicalGrad)"
          />
          <path
            d={historicalPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Future Data Area & Line (Animate Draw on Reveal) */}
          {reveal && (
            <>
              <path
                d={`${futurePath} L ${getX(maxDay)} ${getY(minPrice)} L ${getX(0)} ${getY(minPrice)} Z`}
                fill={netUp ? 'url(#revealGradUp)' : 'url(#revealGradDown)'}
                className="animate-fade-in"
              />
              <path
                d={futurePath}
                fill="none"
                stroke={netUp ? '#10b981' : '#f43f5e'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 300,
                  strokeDashoffset: 300,
                  animation: 'revealLine 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                }}
              />
            </>
          )}

          {/* Hover interactive overlay cursor */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={height - paddingBottom}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="6"
                fill={
                  hoveredPoint.day > 0
                    ? netUp
                      ? '#10b981'
                      : '#f43f5e'
                    : '#3b82f6'
                }
                stroke="#1e293b"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay (HTML absolute position over SVG) */}
        {hoveredPoint && (
          <div
            className="absolute bg-slate-950/95 border border-slate-800 rounded-lg p-2 text-xs font-mono shadow-2xl pointer-events-none transition-all duration-75 z-20"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-semibold text-slate-400">
              Day: {hoveredPoint.day === 0 ? 'T-0 (Now)' : `${hoveredPoint.day > 0 ? '+' : ''}${hoveredPoint.day}`}
            </div>
            <div className="text-slate-100 font-bold mt-0.5 text-[13px]">
              ${hoveredPoint.price.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Embedded CSS Animations for custom reveal effect */}
      <style jsx global>{`
        @keyframes revealLine {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
