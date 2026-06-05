import { create } from 'zustand';

const DEFAULT_ARRAY_SIZE = 50;
const BOGO_DEFAULT_SIZE = 6;

export interface SortingState {
  dataArray: number[];
  comparing: [number, number] | null;
  swapping: [number, number] | null;
  sorted: number[];
  comparisons: number;
  accesses: number;
  
  isPlaying: boolean;
  speed: number;
  algorithm: string;
  isFinished: boolean;
  arraySize: number;
  isMuted: boolean;
  volume: number;

  // Actions
  generateNewArray: (size?: number) => void;
  setSpeed: (speed: number) => void;
  setAlgorithm: (algo: string) => void;
  setArraySize: (size: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  updateStateFromEngine: (stepData: any) => void;
  setFinished: (finished: boolean) => void;
}

const generateRandomArray = (size: number) => 
  Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 5);

export const useSortingStore = create<SortingState>((set, get) => ({
  dataArray: generateRandomArray(DEFAULT_ARRAY_SIZE),
  initialArray: [],
  comparing: null,
  swapping: null,
  sorted: [],
  comparisons: 0,
  accesses: 0,
  
  isPlaying: false,
  speed: 50, // ms delay, default speed
  algorithm: 'Bubble Sort',
  isFinished: false,
  arraySize: DEFAULT_ARRAY_SIZE,
  isMuted: false,
  volume: 0.5, // 50% default volume

  generateNewArray: (size) => {
    const targetSize = size ?? get().arraySize;
    const newArray = generateRandomArray(targetSize);
    set({
      dataArray: newArray,
      comparing: null,
      swapping: null,
      sorted: [],
      comparisons: 0,
      accesses: 0,
      isPlaying: false,
      isFinished: false,
    });
  },

  setSpeed: (speed: number) => set({ speed }),
  
  setAlgorithm: (algorithm: string) => {
    const currentSize = get().arraySize;
    let nextSize = currentSize;
    
    // Automatically manage safe sizes for Bogo Sort
    if (algorithm === 'Bogo Sort') {
      if (currentSize > 8) {
        nextSize = BOGO_DEFAULT_SIZE;
      }
    } else if (get().algorithm === 'Bogo Sort' && currentSize <= 8) {
      // Revert to default size when leaving Bogo Sort if size is tiny
      nextSize = DEFAULT_ARRAY_SIZE;
    }

    set({ algorithm, isPlaying: false, arraySize: nextSize });
    get().generateNewArray(nextSize); 
  },

  setArraySize: (arraySize: number) => {
    set({ arraySize, isPlaying: false });
    get().generateNewArray(arraySize);
  },

  setVolume: (volume: number) => set({ volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  play: () => {
    if (get().isFinished) {
      get().generateNewArray(get().arraySize);
    }
    set({ isPlaying: true });
  },
  
  pause: () => set({ isPlaying: false }),

  reset: () => {
    get().generateNewArray(get().arraySize);
  },

  updateStateFromEngine: (stepData) => set({
    dataArray: stepData.array,
    comparing: stepData.comparing,
    swapping: stepData.swapping,
    sorted: stepData.sorted,
    comparisons: stepData.comparisons,
    accesses: stepData.accesses,
  }),

  setFinished: (isFinished) => set({ isFinished, isPlaying: false })
}));

