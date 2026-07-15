import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ZzzNode {
  id: string;
  name: string;
  faction: string;
  attribute: string;
  emoji: string;
  color: string; // Theme color based on element/type
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
  addCustomCharacter: (character: Omit<ZzzNode, 'id' | 'x' | 'y'>) => void;
  removeCharacterNode: (id: string) => void;
}

const INITIAL_NODES: Omit<ZzzNode, 'x' | 'y'>[] = [
  { id: 'ellen', name: 'Ellen Joe', faction: 'Victoria Housekeeping', attribute: 'Ice', emoji: '🦈', color: '#38BDF8' },
  { id: 'lycaon', name: 'Von Lycaon', faction: 'Victoria Housekeeping', attribute: 'Ice', emoji: '🐺', color: '#7DD3FC' },
  { id: 'soukaku', name: 'Soukaku', faction: 'Section 6', attribute: 'Ice', emoji: '👹', color: '#0EA5E9' },
  { id: 'zhuyuan', name: 'Zhu Yuan', faction: 'PubSec', attribute: 'Ether', emoji: '🚔', color: '#C084FC' },
  { id: 'qingyi', name: 'Qingyi', faction: 'PubSec', attribute: 'Electric', emoji: '🎋', color: '#FACC15' },
  { id: 'anby', name: 'Anby Demara', faction: 'Cunning Hares', attribute: 'Electric', emoji: '🍔', color: '#A3E635' },
];

const INITIAL_EDGES: ZzzEdge[] = [
  { id: 'e1', source: 'ellen', target: 'lycaon', type: 'best-synergy' },
  { id: 'e2', source: 'ellen', target: 'soukaku', type: 'best-synergy' },
  { id: 'e3', source: 'zhuyuan', target: 'qingyi', type: 'best-synergy' },
];

export const useZzzStore = create<ZzzState>()(
  persist(
    (set, get) => ({
      nodes: INITIAL_NODES.map((n, i) => {
        const angle = (i / INITIAL_NODES.length) * 2 * Math.PI;
        return {
          ...n,
          x: 400 + 220 * Math.cos(angle),
          y: 300 + 220 * Math.sin(angle),
        };
      }),
      edges: INITIAL_EDGES,

      updateNodePosition: (id, x, y) => set((state) => ({
        nodes: state.nodes.map((node) => node.id === id ? { ...node, x, y } : node),
      })),

      addEdge: (source, target, type = 'general') => set((state) => {
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
        if (n === 0) return state;
        return {
          nodes: state.nodes.map((node, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
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

      addCustomCharacter: (character) => set((state) => {
        const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNode: ZzzNode = {
          ...character,
          id,
          x: 400 + (Math.random() - 0.5) * 100,
          y: 300 + (Math.random() - 0.5) * 100,
        };
        return {
          nodes: [...state.nodes, newNode],
        };
      }),

      removeCharacterNode: (id) => set((state) => ({
        nodes: state.nodes.filter(n => n.id !== id),
        edges: state.edges.filter(e => e.source !== id && e.target !== id),
      })),
    }),
    {
      name: 'zzz-synergy-storage',
    }
  )
);
