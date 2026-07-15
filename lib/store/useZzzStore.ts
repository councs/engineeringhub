import { create } from 'zustand';

export interface ZzzNode {
  id: string;
  name: string;
  faction: string;
  attribute: string;
  emoji: string;
  color: string; // Theme color based on faction/attribute
  x: number;
  y: number;
}

export interface ZzzEdge {
  id: string;
  source: string;
  target: string;
  type: 'best-synergy' | 'faction-match' | 'attribute-match' | 'general';
}

interface ZzzState {
  nodes: ZzzNode[];
  edges: ZzzEdge[];
  
  // Actions
  updateNodePosition: (id: string, x: number, y: number) => void;
  addEdge: (source: string, target: string, type?: ZzzEdge['type']) => void;
  deleteEdge: (id: string) => void;
  clearEdges: () => void;
  arrangeInCircle: (centerX: number, centerY: number, radius: number) => void;
  resetToDefault: () => void;
}

const INITIAL_NODES: Omit<ZzzNode, 'x' | 'y'>[] = [
  { id: 'ellen', name: 'Ellen Joe', faction: 'Victoria Housekeeping', attribute: 'Ice', emoji: '🦈', color: '#38BDF8' }, // Sky-400
  { id: 'lycaon', name: 'Von Lycaon', faction: 'Victoria Housekeeping', attribute: 'Ice', emoji: '🐺', color: '#7DD3FC' }, // Sky-300
  { id: 'soukaku', name: 'Soukaku', faction: 'Section 6', attribute: 'Ice', emoji: '👹', color: '#0EA5E9' }, // Sky-500
  { id: 'zhuyuan', name: 'Zhu Yuan', faction: 'PubSec', attribute: 'Ether', emoji: '🚔', color: '#C084FC' }, // Purple-400
  { id: 'qingyi', name: 'Qingyi', faction: 'PubSec', attribute: 'Electric', emoji: '🎋', color: '#FACC15' }, // Yellow-400
  { id: 'anby', name: 'Anby Demara', faction: 'Cunning Hares', attribute: 'Electric', emoji: '🍔', color: '#A3E635' }, // Lime-400
  { id: 'nicole', name: 'Nicole Demara', faction: 'Cunning Hares', attribute: 'Ether', emoji: '💼', color: '#E879F9' }, // Fuchsia-400
  { id: 'billy', name: 'Billy Kid', faction: 'Cunning Hares', attribute: 'Physical', emoji: '🤖', color: '#94A3B8' }, // Slate-400
  { id: 'grace', name: 'Grace Howard', faction: 'Belobog Industries', attribute: 'Electric', emoji: '🔧', color: '#FB923C' }, // Orange-400
  { id: 'koleda', name: 'Koleda Belobog', faction: 'Belobog Industries', attribute: 'Fire', emoji: '🔨', color: '#F87171' }, // Red-400
  { id: 'ben', name: 'Ben Bigger', faction: 'Belobog Industries', attribute: 'Fire', emoji: '🐻', color: '#EF4444' }, // Red-500
];

const INITIAL_EDGES: ZzzEdge[] = [
  { id: 'e1', source: 'ellen', target: 'lycaon', type: 'best-synergy' },
  { id: 'e2', source: 'ellen', target: 'soukaku', type: 'best-synergy' },
  { id: 'e3', source: 'zhuyuan', target: 'qingyi', type: 'best-synergy' },
  { id: 'e4', source: 'zhuyuan', target: 'nicole', type: 'best-synergy' },
  { id: 'e5', source: 'anby', target: 'billy', type: 'faction-match' },
  { id: 'e6', source: 'anby', target: 'nicole', type: 'best-synergy' },
  { id: 'e7', source: 'grace', target: 'koleda', type: 'faction-match' },
  { id: 'e8', source: 'koleda', target: 'ben', type: 'best-synergy' },
];

export const useZzzStore = create<ZzzState>((set, get) => ({
  nodes: INITIAL_NODES.map((n, i) => {
    // Initial random positions inside a default space, circle layout will rearrange
    const angle = (i / INITIAL_NODES.length) * 2 * Math.PI;
    return {
      ...n,
      x: 400 + 250 * Math.cos(angle),
      y: 350 + 250 * Math.sin(angle),
    };
  }),
  edges: INITIAL_EDGES,

  updateNodePosition: (id, x, y) => set((state) => ({
    nodes: state.nodes.map((node) => node.id === id ? { ...node, x, y } : node),
  })),

  addEdge: (source, target, type = 'general') => set((state) => {
    // Don't add duplicate edges or self-loops
    if (source === target) return state;
    const exists = state.edges.some(
      (e) => (e.source === source && e.target === target) || (e.source === target && e.target === source)
    );
    if (exists) return state;

    const newEdge: ZzzEdge = {
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source,
      target,
      type,
    };

    return {
      edges: [...state.edges, newEdge],
    };
  }),

  deleteEdge: (id) => set((state) => ({
    edges: state.edges.filter((e) => e.id !== id),
  })),

  clearEdges: () => set({ edges: [] }),

  arrangeInCircle: (centerX, centerY, radius) => set((state) => {
    const n = state.nodes.length;
    return {
      nodes: state.nodes.map((node, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2; // start from top
        return {
          ...node,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }),
    };
  }),

  resetToDefault: () => set(() => ({
    nodes: INITIAL_NODES.map((n, i) => {
      const angle = (i / INITIAL_NODES.length) * 2 * Math.PI - Math.PI / 2;
      return {
        ...n,
        x: 400 + 220 * Math.cos(angle),
        y: 300 + 220 * Math.sin(angle),
      };
    }),
    edges: INITIAL_EDGES,
  })),
}));
