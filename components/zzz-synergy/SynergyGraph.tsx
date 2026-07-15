'use client';

import { useState, useRef, useEffect } from 'react';
import { useZzzStore, ZzzNode, ZzzEdge } from '@/lib/store/useZzzStore';
import { Trash2, Plus, Zap, Heart, ShieldAlert, Award } from 'lucide-react';

export default function SynergyGraph() {
  const {
    nodes,
    edges,
    updateNodePosition,
    addEdge,
    deleteEdge,
    clearEdges,
    arrangeInCircle,
    resetToDefault,
    addCustomCharacter,
    removeCharacterNode
  } = useZzzStore();

  // Custom Character Creation state
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('👤');
  const [customFaction, setCustomFaction] = useState('Cunning Hares');
  const [customAttribute, setCustomAttribute] = useState('Ice');

  const handleCreateCustomCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    let color = '#94A3B8'; // Physical (Slate)
    if (customAttribute === 'Ice') color = '#38BDF8';
    else if (customAttribute === 'Fire') color = '#EF4444';
    else if (customAttribute === 'Electric') color = '#FACC15';
    else if (customAttribute === 'Ether') color = '#C084FC';

    addCustomCharacter({
      name: customName.trim(),
      emoji: customEmoji.trim() || '👤',
      faction: customFaction,
      attribute: customAttribute,
      color,
    });

    setCustomName('');
    setCustomEmoji('👤');
  };

  const svgRef = useRef<SVGSVGElement>(null);
  
  // Dragging a node
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Drafting a new edge
  const [draftEdge, setDraftEdge] = useState<{
    sourceId: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Selected edge/node for customization/deletion
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedEdgeType, setSelectedEdgeType] = useState<ZzzEdge['type']>('general');

  // Trigger auto-layout on mount once
  useEffect(() => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const centerX = rect.width / 2 || 400;
      const centerY = rect.height / 2 || 300;
      arrangeInCircle(centerX, centerY, Math.min(centerX, centerY) * 0.7);
    }
  }, []);

  // Handle auto-layout trigger
  const handleAutoLayout = () => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      arrangeInCircle(centerX, centerY, Math.min(centerX, centerY) * 0.7);
    }
  };

  // Dragging nodes logic
  const handleNodeMouseDown = (e: React.MouseEvent, node: ZzzNode) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();
    
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      // Mouse position relative to the SVG canvas
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      dragOffset.current = {
        x: mouseX - node.x,
        y: mouseY - node.y
      };
      setDraggedNodeId(node.id);
    }
  };

  // Connection drafting logic (mouse down on anchor)
  const handleAnchorMouseDown = (e: React.MouseEvent, node: ZzzNode) => {
    e.stopPropagation();
    e.preventDefault();

    setDraftEdge({
      sourceId: node.id,
      startX: node.x,
      startY: node.y,
      currentX: node.x,
      currentY: node.y
    });
  };

  // Global mouse listeners for dragging/drafting
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (draggedNodeId) {
        // Enforce canvas boundaries
        const newX = Math.max(40, Math.min(rect.width - 40, mouseX - dragOffset.current.x));
        const newY = Math.max(40, Math.min(rect.height - 40, mouseY - dragOffset.current.y));
        updateNodePosition(draggedNodeId, newX, newY);
      } else if (draftEdge) {
        setDraftEdge(prev => prev ? {
          ...prev,
          currentX: mouseX,
          currentY: mouseY
        } : null);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (draggedNodeId) {
        setDraggedNodeId(null);
      } else if (draftEdge) {
        // Check if released over a target node
        if (svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          // Find node within radius
          const targetNode = nodes.find(node => {
            if (node.id === draftEdge.sourceId) return false;
            const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
            return dist < 36; // radius of node circle is 32 + tolerance
          });

          if (targetNode) {
            addEdge(draftEdge.sourceId, targetNode.id, 'general');
          }
        }
        setDraftEdge(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedNodeId, draftEdge, nodes]);

  // Update selected edge type
  const handleEdgeTypeChange = (type: ZzzEdge['type']) => {
    if (selectedEdgeId) {
      useZzzStore.setState(state => ({
        edges: state.edges.map(e => e.id === selectedEdgeId ? { ...e, type } : e)
      }));
      setSelectedEdgeType(type);
    }
  };

  // Get coordinates for node by ID
  const getNodeCoords = (id: string) => {
    const node = nodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  // Count overlaps for highlighting highly contested nodes
  const getNodeConnectionCount = (id: string) => {
    return edges.filter(e => e.source === id || e.target === id).length;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full h-[75vh]">
      
      {/* Sidebar Controls */}
      <div className="w-full xl:w-72 flex flex-col gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
        <div>
          <h3 className="text-lg font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
            Node Controls
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Drag the yellow handles (+) to connect characters. Double-click lines to delete.
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-800 pt-4">
          <button
            onClick={handleAutoLayout}
            className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-sm font-semibold transition-all border border-slate-700"
          >
            Arrange in Circle
          </button>
          <button
            onClick={resetToDefault}
            className="flex items-center justify-center gap-2 py-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-sm font-semibold transition-all text-slate-400 hover:text-slate-200"
          >
            Reset Connections
          </button>
          <button
            onClick={clearEdges}
            className="flex items-center justify-center gap-2 py-2.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 rounded-lg text-sm font-semibold transition-all border border-rose-900/30"
          >
            Clear All Synergy Lines
          </button>
        </div>

        {/* Selected Edge Editor */}
        {selectedEdgeId ? (
          <div className="flex flex-col gap-3 border-t border-slate-800 pt-4 animate-in fade-in duration-300">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Selected Synergy
            </span>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleEdgeTypeChange('best-synergy')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${selectedEdgeType === 'best-synergy' ? 'bg-amber-500/20 text-amber-400 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400'}`}
              >
                <Zap size={14} /> Best Team Synergy
              </button>
              
              <button
                onClick={() => handleEdgeTypeChange('faction-match')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${selectedEdgeType === 'faction-match' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/60' : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400'}`}
              >
                <Award size={14} /> Faction Match
              </button>

              <button
                onClick={() => handleEdgeTypeChange('attribute-match')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${selectedEdgeType === 'attribute-match' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60' : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400'}`}
              >
                <Heart size={14} /> Attribute Match
              </button>

              <button
                onClick={() => handleEdgeTypeChange('general')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${selectedEdgeType === 'general' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400'}`}
              >
                General Synergy
              </button>
            </div>

            <button
              onClick={() => {
                deleteEdge(selectedEdgeId);
                setSelectedEdgeId(null);
              }}
              className="flex items-center justify-center gap-2 py-2 mt-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_10px_rgba(220,38,38,0.2)]"
            >
              <Trash2 size={12} /> Delete Connection
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 border-t border-slate-800 pt-8 pb-4 text-center text-slate-500">
            <ShieldAlert size={28} className="opacity-40" />
            <span className="text-xs">Click any link line to customize or edit its synergy type.</span>
          </div>
        )}

        {/* Add Custom Character */}
        <form onSubmit={handleCreateCustomCharacter} className="flex flex-col gap-2.5 border-t border-slate-800 pt-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Create Bubble
          </span>
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Name..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-yellow-500 transition-colors rounded px-2.5 py-1.5 text-xs outline-none"
              required
            />
            <input 
              type="text"
              placeholder="Emoji"
              value={customEmoji}
              onChange={(e) => setCustomEmoji(e.target.value)}
              className="w-12 text-center bg-slate-950 border border-slate-800 focus:border-yellow-500 transition-colors rounded px-1.5 py-1.5 text-xs outline-none"
              title="Character Emoji"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={customFaction}
              onChange={(e) => setCustomFaction(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] font-medium outline-none focus:border-yellow-500 h-[28px]"
            >
              <option value="Cunning Hares">Cunning Hares</option>
              <option value="Victoria Housekeeping">Victoria Housekeeping</option>
              <option value="PubSec">PubSec</option>
              <option value="Belobog Industries">Belobog Industries</option>
              <option value="Section 6">Section 6</option>
              <option value="Sons of Calydon">Sons of Calydon</option>
              <option value="Custom Faction">Custom Faction</option>
            </select>

            <select
              value={customAttribute}
              onChange={(e) => setCustomAttribute(e.target.value)}
              className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] font-medium outline-none focus:border-yellow-500 h-[28px]"
            >
              <option value="Ice">Ice (Blue)</option>
              <option value="Fire">Fire (Red)</option>
              <option value="Electric">Electric (Yellow)</option>
              <option value="Ether">Ether (Purple)</option>
              <option value="Physical">Physical (Slate)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Create Character
          </button>
        </form>

        {/* Active Character List */}
        <div className="flex flex-col gap-2.5 border-t border-slate-800 pt-4 overflow-hidden flex-1 min-h-[160px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>Active Bubbles</span>
            <span className="text-[10px] text-slate-500 font-mono">{nodes.length} nodes</span>
          </span>
          <div className="overflow-y-auto pr-1 flex flex-col gap-1.5 flex-1 max-h-[18vh] xl:max-h-[25vh]">
            {nodes.length === 0 ? (
              <div className="text-center py-4 text-[10px] text-slate-600 italic">No active nodes. Click Create above!</div>
            ) : (
              nodes.map(node => (
                <div 
                  key={node.id}
                  className="flex items-center justify-between p-1.5 bg-slate-950/40 border border-slate-800 rounded-lg text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">{node.emoji}</span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-200 text-[11px] leading-tight">{node.name}</span>
                      <span className="text-[8px] text-slate-500 leading-none">{node.faction}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCharacterNode(node.id)}
                    className="p-1 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    title="Delete character bubble"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl relative overflow-hidden h-full">
        {/* Futuristic background grid */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating instruction overlay */}
        <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-lg border border-slate-800 pointer-events-none text-xs flex flex-col gap-1">
          <span className="font-bold text-slate-300">💡 Synergy Graph Guide</span>
          <span className="text-slate-400">1. Drag characters to organize custom groups.</span>
          <span className="text-slate-400">2. Drag yellow anchors (+) to another character to connect.</span>
          <span className="text-slate-400">3. Highly contested character nodes will glow neon.</span>
        </div>

        <svg 
          ref={svgRef}
          className="w-full h-full cursor-crosshair select-none relative z-0"
        >
          {/* Defs for gradients & filters */}
          <defs>
            <filter id="glow-best" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-node" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Connections (Edges) */}
          {edges.map((edge) => {
            const start = getNodeCoords(edge.source);
            const end = getNodeCoords(edge.target);
            const isSelected = selectedEdgeId === edge.id;
            
            // Edge Styling configuration
            let strokeColor = '#475569'; // Slate-600
            let strokeDash = 'none';
            let strokeWidth = 2;
            let filter = 'none';
            let flowClass = '';

            if (edge.type === 'best-synergy') {
              strokeColor = '#F59E0B'; // Amber-500
              strokeWidth = 3;
              filter = 'url(#glow-best)';
              flowClass = 'animate-[dash_2s_linear_infinite]';
              strokeDash = '8, 8';
            } else if (edge.type === 'faction-match') {
              strokeColor = '#06B6D4'; // Cyan-500
              strokeWidth = 2.5;
            } else if (edge.type === 'attribute-match') {
              strokeColor = '#10B981'; // Emerald-500
              strokeWidth = 2.5;
            }

            if (isSelected) {
              strokeColor = '#F43F5E'; // Rose-500
              strokeWidth += 1.5;
            }

            return (
              <g 
                key={edge.id}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEdgeId(edge.id);
                  setSelectedEdgeType(edge.type);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  deleteEdge(edge.id);
                  if (selectedEdgeId === edge.id) setSelectedEdgeId(null);
                }}
              >
                {/* Thick invisible interaction path to make clicking easier */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="transparent"
                  strokeWidth={15}
                />
                
                {/* Rendered connection line */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  filter={filter}
                  className={`transition-all duration-300 group-hover:stroke-rose-400 ${flowClass}`}
                />
              </g>
            );
          })}

          {/* Render Active Link Draft */}
          {draftEdge && (
            <line
              x1={draftEdge.startX}
              y1={draftEdge.startY}
              x2={draftEdge.currentX}
              y2={draftEdge.currentY}
              stroke="#FACC15" // Yellow-400
              strokeWidth={2}
              strokeDasharray="4, 4"
              className="pointer-events-none"
            />
          )}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const connectionsCount = getNodeConnectionCount(node.id);
            const isContested = connectionsCount >= 3;
            
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="select-none"
              >
                {/* Node Glow (Highly Contested nodes) */}
                {isContested && (
                  <circle
                    r={34}
                    fill="transparent"
                    stroke={node.color}
                    strokeWidth={4}
                    className="opacity-40 animate-ping pointer-events-none"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={30}
                  fill="#0F172A" // Slate-900
                  stroke={node.color}
                  strokeWidth={isContested ? 3.5 : 2}
                  className="cursor-grab active:cursor-grabbing hover:fill-slate-800 transition-colors shadow-2xl"
                  filter={isContested ? 'url(#glow-node)' : 'none'}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                />

                {/* Avatar Emoji */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="24"
                  className="pointer-events-none select-none"
                  y={-2}
                >
                  {node.emoji}
                </text>

                {/* Character Name Tag */}
                <g transform="translate(0, 48)">
                  <rect
                    x={-45}
                    y={-10}
                    width={90}
                    height={20}
                    rx={4}
                    fill="#1E293B" // Slate-800
                    stroke="#334155" // Slate-700
                    strokeWidth={1}
                    className="opacity-90"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#F1F5F9" // Slate-100
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {node.name}
                  </text>
                </g>

                {/* Drag-Link Anchor Handle */}
                <g 
                  transform="translate(24, -24)"
                  className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleAnchorMouseDown(e, node)}
                >
                  <circle
                    r={8}
                    fill="#FACC15" // Yellow-400
                    stroke="#0F172A"
                    strokeWidth={1.5}
                  >
                    <title>Drag to connect</title>
                  </circle>
                  <line x1={0} y1={-4} x2={0} y2={4} stroke="#000" strokeWidth={1.5} />
                  <line x1={-4} y1={0} x2={4} y2={0} stroke="#000" strokeWidth={1.5} />
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* CSS Keyframes for animated dashes */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </div>
  );
}
