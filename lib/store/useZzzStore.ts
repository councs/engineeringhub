import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export interface ZzzCharacter {
  id: string;
  name: string;
  faction: string;
  attribute: string;
  emoji: string;
  color: string;
}

export const ALL_ZZZ_CHARACTERS: ZzzCharacter[] = [
  { id: 'ellen', name: 'Ellen Joe', faction: 'Victoria Housekeeping', attribute: 'Ice', emoji: '🦈', color: '#38BDF8' },
  { id: 'lycaon', name: 'Von Lycaon', faction: 'Victoria Housekeeping', attribute: 'Ice', emoji: '🐺', color: '#7DD3FC' },
  { id: 'rina', name: 'Alexandrina', faction: 'Victoria Housekeeping', attribute: 'Electric', emoji: '👻', color: '#FACC15' },
  { id: 'corin', name: 'Corin Wickes', faction: 'Victoria Housekeeping', attribute: 'Physical', emoji: '🪚', color: '#94A3B8' },
  { id: 'zhuyuan', name: 'Zhu Yuan', faction: 'PubSec', attribute: 'Ether', emoji: '🚔', color: '#C084FC' },
  { id: 'qingyi', name: 'Qingyi', faction: 'PubSec', attribute: 'Electric', emoji: '🎋', color: '#FACC15' },
  { id: 'jane', name: 'Jane Doe', faction: 'PubSec (Undercover)', attribute: 'Physical', emoji: '🐭', color: '#EF4444' },
  { id: 'seth', name: 'Seth Lowell', faction: 'PubSec', attribute: 'Electric', emoji: '🐯', color: '#60A5FA' },
  { id: 'anby', name: 'Anby Demara', faction: 'Cunning Hares', attribute: 'Electric', emoji: '🍔', color: '#A3E635' },
  { id: 'nicole', name: 'Nicole Demara', faction: 'Cunning Hares', attribute: 'Ether', emoji: '💼', color: '#E879F9' },
  { id: 'billy', name: 'Billy Kid', faction: 'Cunning Hares', attribute: 'Physical', emoji: '🤖', color: '#94A3B8' },
  { id: 'nekomata', name: 'Nekomata', faction: 'Cunning Hares', attribute: 'Physical', emoji: '🐱', color: '#F87171' },
  { id: 'grace', name: 'Grace Howard', faction: 'Belobog Industries', attribute: 'Electric', emoji: '🔧', color: '#FB923C' },
  { id: 'koleda', name: 'Koleda Belobog', faction: 'Belobog Industries', attribute: 'Fire', emoji: '🔨', color: '#F87171' },
  { id: 'ben', name: 'Ben Bigger', faction: 'Belobog Industries', attribute: 'Fire', emoji: '🐻', color: '#EF4444' },
  { id: 'anton', name: 'Anton Ivanov', faction: 'Belobog Industries', attribute: 'Electric', emoji: '🔋', color: '#FB923C' },
  { id: 'soukaku', name: 'Soukaku', faction: 'Section 6', attribute: 'Ice', emoji: '👹', color: '#0EA5E9' },
  { id: 'miyabi', name: 'Hoshimi Miyabi', faction: 'Section 6', attribute: 'Ice', emoji: '🦊', color: '#38BDF8' },
  { id: 'harumasa', name: 'Harumasa', faction: 'Section 6', attribute: 'Electric', emoji: '🏹', color: '#FACC15' },
  { id: 'soldier11', name: 'Soldier 11', faction: 'Obols Squad', attribute: 'Fire', emoji: '👓', color: '#EF4444' },
  { id: 'lucy', name: 'Lucy', faction: 'Sons of Calydon', attribute: 'Fire', emoji: '🐷', color: '#FB923C' },
  { id: 'piper', name: 'Piper Wheel', faction: 'Sons of Calydon', attribute: 'Physical', emoji: '🛞', color: '#94A3B8' },
  { id: 'caesar', name: 'Caesar King', faction: 'Sons of Calydon', attribute: 'Physical', emoji: '🛡️', color: '#EF4444' },
  { id: 'burnice', name: 'Burnice White', faction: 'Sons of Calydon', attribute: 'Fire', emoji: '🍹', color: '#FB923C' },
  { id: 'yanagi', name: 'Tsukishiro Yanagi', faction: 'Section 6', attribute: 'Electric', emoji: '☯️', color: '#FACC15' },
  { id: 'lighter', name: 'Lighter', faction: 'Sons of Calydon', attribute: 'Fire', emoji: '🥊', color: '#EF4444' },
];

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
  addCharacterNode: (charId: string) => void;
  removeCharacterNode: (charId: string) => void;
}

const INITIAL_NODES: Omit<ZzzNode, 'x' | 'y'>[] = [
  { id: 'ellen', name: 'Ellen Joe', faction: 'Victoria Housekeeping', attribute: 'Ice', emoji: '🦈', color: '#38BDF8' },
  { id: 'lycaon', name: 'Von Lycaon', faction: 'Victoria Housekeeping', attribute: 'Ice', emoji: '🐺', color: '#7DD3FC' },
  { id: 'soukaku', name: 'Soukaku', faction: 'Section 6', attribute: 'Ice', emoji: '👹', color: '#0EA5E9' },
  { id: 'zhuyuan', name: 'Zhu Yuan', faction: 'PubSec', attribute: 'Ether', emoji: '🚔', color: '#C084FC' },
  { id: 'qingyi', name: 'Qingyi', faction: 'PubSec', attribute: 'Electric', emoji: '🎋', color: '#FACC15' },
  { id: 'anby', name: 'Anby Demara', faction: 'Cunning Hares', attribute: 'Electric', emoji: '🍔', color: '#A3E635' },
  { id: 'nicole', name: 'Nicole Demara', faction: 'Cunning Hares', attribute: 'Ether', emoji: '💼', color: '#E879F9' },
  { id: 'billy', name: 'Billy Kid', faction: 'Cunning Hares', attribute: 'Physical', emoji: '🤖', color: '#94A3B8' },
  { id: 'grace', name: 'Grace Howard', faction: 'Belobog Industries', attribute: 'Electric', emoji: '🔧', color: '#FB923C' },
  { id: 'koleda', name: 'Koleda Belobog', faction: 'Belobog Industries', attribute: 'Fire', emoji: '🔨', color: '#F87171' },
  { id: 'ben', name: 'Ben Bigger', faction: 'Belobog Industries', attribute: 'Fire', emoji: '🐻', color: '#EF4444' },
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

export const useZzzStore = create<ZzzState>()(
  persist(
    (set, get) => ({
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

      addCharacterNode: (charId) => set((state) => {
        if (state.nodes.some(n => n.id === charId)) return state;
        const charData = ALL_ZZZ_CHARACTERS.find(c => c.id === charId);
        if (!charData) return state;
        
        const newNode: ZzzNode = {
          ...charData,
          x: 400 + (Math.random() - 0.5) * 60,
          y: 300 + (Math.random() - 0.5) * 60,
        };
        return { nodes: [...state.nodes, newNode] };
      }),

      removeCharacterNode: (charId) => set((state) => ({
        nodes: state.nodes.filter(n => n.id !== charId),
        edges: state.edges.filter(e => e.source !== charId && e.target !== charId),
      })),
    }),
    {
      name: 'zzz-synergy-storage',
    }
  )
);
