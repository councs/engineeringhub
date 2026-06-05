import { create } from 'zustand';

export interface RpsState {
  // Config state
  initialRockCount: number;
  initialPaperCount: number;
  initialScissorsCount: number;
  
  // Simulation control state
  isPlaying: boolean;
  speedMultiplier: number;
  volume: number;
  isMuted: boolean;
  
  // Real-time stats state
  currentRockCount: number;
  currentPaperCount: number;
  currentScissorsCount: number;
  isFinished: boolean;
  winner: 'rock' | 'paper' | 'scissors' | null;
  dimensionMode: '2D' | '3D';
  movementMode: 'hunt' | 'chaos' | 'wander';
  resetKey: number;

  // Actions
  setInitialCounts: (rock: number, paper: number, scissors: number) => void;
  setSpeedMultiplier: (speed: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  updateCounts: (rock: number, paper: number, scissors: number) => void;
  finishSimulation: (winner: 'rock' | 'paper' | 'scissors') => void;
  setDimensionMode: (mode: '2D' | '3D') => void;
  setMovementMode: (mode: 'hunt' | 'chaos' | 'wander') => void;
}

export const useRpsStore = create<RpsState>((set, get) => ({
  initialRockCount: 20,
  initialPaperCount: 20,
  initialScissorsCount: 20,
  
  isPlaying: false,
  speedMultiplier: 1.0,
  volume: 0.5,
  isMuted: false,
  
  currentRockCount: 20,
  currentPaperCount: 20,
  currentScissorsCount: 20,
  isFinished: false,
  winner: null,
  dimensionMode: '3D',
  movementMode: 'hunt',
  resetKey: 0,

  setInitialCounts: (rock, paper, scissors) => set({
    initialRockCount: rock,
    initialPaperCount: paper,
    initialScissorsCount: scissors,
    currentRockCount: rock,
    currentPaperCount: paper,
    currentScissorsCount: scissors,
    isFinished: false,
    winner: null,
    isPlaying: false,
    resetKey: get().resetKey + 1
  }),

  setSpeedMultiplier: (speedMultiplier) => set({ speedMultiplier }),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  
  reset: () => {
    const state = get();
    set({
      currentRockCount: state.initialRockCount,
      currentPaperCount: state.initialPaperCount,
      currentScissorsCount: state.initialScissorsCount,
      isFinished: false,
      winner: null,
      isPlaying: false,
      resetKey: state.resetKey + 1
    });
  },

  updateCounts: (rock, paper, scissors) => set({
    currentRockCount: rock,
    currentPaperCount: paper,
    currentScissorsCount: scissors
  }),

  finishSimulation: (winner) => set({
    isFinished: true,
    winner,
    isPlaying: false
  }),

  setDimensionMode: (dimensionMode) => {
    set({ dimensionMode, isPlaying: false });
    get().reset();
  },

  setMovementMode: (movementMode) => set({ movementMode })
}));
