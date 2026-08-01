import { create } from 'zustand';

export type SeedRating = 'Common' | 'Rare' | 'Legendary' | 'Mythic';

export interface TraitBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export interface ScoreBreakdown {
  lifespanPoints: number; // Pre-loop run time points (ticks survived before loop/steady state)
  peakPopPoints: number;  // Peak live population count points
  chaosPoints: number;    // Population Chaos SD points
  loopPoints: number;     // Oscillator period bonus points
  traitPoints: number;    // Special trait badges bonus points
}

export interface FastEvalResult {
  seed: string;
  lifespan: number; // Ticks survived before settling into loop/static/extinction
  peakPopulation: number;
  chaosVariance: number;
  period: number; // 0 if no loop detected, 1 for static, N for period-N oscillator
  score: number;
  rating: SeedRating;
  traits: TraitBadge[];
  breakdown: ScoreBreakdown;
}

export interface SettledInfo {
  type: 'static' | 'loop' | 'extinction';
  reason: string;
  period?: number;
  generation: number;
}

export interface RngdleState {
  // Core state
  seed: string; // 7-digit string e.g. "4206977"
  gridSize: number; // 32
  grid: number[][]; // 32x32 binary grid (1=alive, 0=dead)
  ageGrid: number[][]; // 32x32 cell age matrix
  generation: number;
  isPlaying: boolean;
  isSettled: boolean;
  settledInfo: SettledInfo | null;
  speed: number; // ms per tick (10ms to 200ms)
  
  // Analytics & Evaluation
  evalResult: FastEvalResult | null;
  peakPopulation: number;
  popHistory: number[];

  // Actions
  setSeed: (newSeed: string) => void;
  rollRandomSeed: () => void;
  play: () => void;
  pause: () => void;
  step: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  generateShareText: () => string;
}

const GRID_SIZE = 32;

// Mulberry32 deterministic PRNG
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Check seed traits
export function evaluateSeedTraits(seedStr: string): TraitBadge[] {
  const badges: TraitBadge[] = [];
  const num = parseInt(seedStr, 10);

  // Meme seed
  if (seedStr.includes('420') || seedStr.includes('69') || seedStr.includes('777')) {
    badges.push({
      id: 'meme',
      name: 'Meme Seed',
      emoji: '💥',
      description: 'Contains 420, 69, or 777',
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    });
  }

  // Palindrome
  if (seedStr.length === 7 && seedStr === seedStr.split('').reverse().join('')) {
    badges.push({
      id: 'palindrome',
      name: 'Palindrome',
      emoji: '🔄',
      description: 'Reads identically forwards and backwards',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    });
  }

  // Pattern (repeating sequences)
  if (
    (seedStr[0] === seedStr[2] && seedStr[1] === seedStr[3] && seedStr[2] === seedStr[4]) ||
    (seedStr[0] === seedStr[1] && seedStr[2] === seedStr[3] && seedStr[4] === seedStr[5])
  ) {
    badges.push({
      id: 'pattern',
      name: 'Pattern Sync',
      emoji: '⚡',
      description: 'Contains repeating pattern sequences',
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    });
  }

  // Extreme (All even, all odd, or small < 0001000)
  const isAllEven = /^[02468]+$/.test(seedStr);
  const isAllOdd = /^[13579]+$/.test(seedStr);
  if (isAllEven || isAllOdd || num < 1000) {
    badges.push({
      id: 'extreme',
      name: 'Extreme Digit',
      emoji: '🌋',
      description: 'All even, all odd, or low magnitude seed',
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    });
  }

  return badges;
}

// Generate 2-way horizontal symmetrical grid from seed
function generateSymmetricalGrid(seedStr: string): { grid: number[][]; ageGrid: number[][] } {
  const seedNum = parseInt(seedStr, 10) || 1234567;
  const prng = mulberry32(seedNum);

  const grid: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  const ageGrid: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

  const halfWidth = GRID_SIZE / 2; // 16

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < halfWidth; c++) {
      const rand = prng();
      const alive = rand < 0.38 ? 1 : 0;
      
      // Populate left half
      grid[r][c] = alive;
      ageGrid[r][c] = alive ? 1 : 0;

      // Mirror horizontally to right half
      const mirroredCol = GRID_SIZE - 1 - c;
      grid[r][mirroredCol] = alive;
      ageGrid[r][mirroredCol] = alive ? 1 : 0;
    }
  }

  return { grid, ageGrid };
}

// Fast-Forward Evaluator (200 ticks simulation)
export function runFastForwardEvaluation(seedStr: string): FastEvalResult {
  const { grid: initialGrid } = generateSymmetricalGrid(seedStr);
  let currentGrid = initialGrid.map(row => [...row]);
  
  const traits = evaluateSeedTraits(seedStr);
  const popHistory: number[] = [];
  const seenGridHashes = new Map<string, number>();

  let peakPop = 0;
  let lifespan = 200;
  let period = 0;

  for (let gen = 0; gen < 200; gen++) {
    let pop = 0;
    const gridKey = currentGrid.map(row => row.join('')).join('');

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c] === 1) pop++;
      }
    }

    popHistory.push(pop);
    if (pop > peakPop) peakPop = pop;

    // Check for extinction
    if (pop === 0) {
      lifespan = gen;
      break;
    }

    // Check for loop / stability repetition
    if (seenGridHashes.has(gridKey)) {
      const prevGen = seenGridHashes.get(gridKey)!;
      period = gen - prevGen;
      lifespan = gen;
      break;
    }
    seenGridHashes.set(gridKey, gen);

    // Compute next Conway generation
    const nextGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = (r + dr + GRID_SIZE) % GRID_SIZE;
            const nc = (c + dc + GRID_SIZE) % GRID_SIZE;
            if (currentGrid[nr][nc] === 1) n++;
          }
        }

        if (currentGrid[r][c] === 1) {
          nextGrid[r][c] = (n === 2 || n === 3) ? 1 : 0;
        } else {
          nextGrid[r][c] = (n === 3) ? 1 : 0;
        }
      }
    }
    currentGrid = nextGrid;
  }

  // Calculate Chaos Variance (Standard Deviation of Population)
  const meanPop = popHistory.reduce((a, b) => a + b, 0) / (popHistory.length || 1);
  const variance = popHistory.reduce((sum, val) => sum + Math.pow(val - meanPop, 2), 0) / (popHistory.length || 1);
  const chaosVariance = Math.round(Math.sqrt(variance));

  // Compute Breakdown & Score:
  // 1. Lifespan / Run Time before loop (3.0 pts per tick)
  const lifespanPoints = Math.round(lifespan * 3.0);
  
  // 2. Peak Population Points (1.5 pts per cell)
  const peakPopPoints = Math.round(peakPop * 1.5);
  
  // 3. Chaos SD Points (4.0 pts per SD unit)
  const chaosPoints = Math.round(chaosVariance * 4.0);
  
  // 4. Oscillator Loop Bonus (Period * 20 pts, or 10 pts for static)
  const loopPoints = period > 1 ? period * 20 : period === 1 ? 10 : 0;
  
  // 5. Trait Badges Bonus (50 pts per trait)
  const traitPoints = traits.length * 50;

  const score = lifespanPoints + peakPopPoints + chaosPoints + loopPoints + traitPoints;

  let rating: SeedRating = 'Common';
  if (score >= 700) rating = 'Mythic';
  else if (score >= 450) rating = 'Legendary';
  else if (score >= 250) rating = 'Rare';

  return {
    seed: seedStr,
    lifespan,
    peakPopulation: peakPop,
    chaosVariance,
    period,
    score,
    rating,
    traits,
    breakdown: {
      lifespanPoints,
      peakPopPoints,
      chaosPoints,
      loopPoints,
      traitPoints,
    },
  };
}

export const useRngdleStore = create<RngdleState>((set, get) => {
  const initialSeed = '4206977';
  const initialGrids = generateSymmetricalGrid(initialSeed);
  const initialEval = runFastForwardEvaluation(initialSeed);

  let timerId: NodeJS.Timeout | null = null;
  const liveSeenHashes = new Map<string, number>();

  const runTick = () => {
    const state = get();
    if (!state.isPlaying) return;

    const grid = state.grid;
    const ageGrid = state.ageGrid;
    const nextGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    const nextAgeGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

    let liveCount = 0;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = (r + dr + GRID_SIZE) % GRID_SIZE;
            const nc = (c + dc + GRID_SIZE) % GRID_SIZE;
            if (grid[nr][nc] === 1) n++;
          }
        }

        if (grid[r][c] === 1) {
          if (n === 2 || n === 3) {
            nextGrid[r][c] = 1;
            nextAgeGrid[r][c] = ageGrid[r][c] + 1;
            liveCount++;
          }
        } else {
          if (n === 3) {
            nextGrid[r][c] = 1;
            nextAgeGrid[r][c] = 1;
            liveCount++;
          }
        }
      }
    }

    const nextGen = state.generation + 1;
    const nextPopHistory = [...state.popHistory, liveCount];
    const nextPeak = Math.max(state.peakPopulation, liveCount);

    const currentGridKey = grid.map(row => row.join('')).join('');
    const nextGridKey = nextGrid.map(row => row.join('')).join('');

    let isSettled = false;
    let settledInfo: SettledInfo | null = null;

    // 1. Extinction check
    if (liveCount === 0) {
      isSettled = true;
      settledInfo = {
        type: 'extinction',
        reason: 'Extinction: All cells have died out.',
        generation: nextGen,
      };
    }
    // 2. Static equilibrium check (Period 1)
    else if (currentGridKey === nextGridKey) {
      isSettled = true;
      settledInfo = {
        type: 'static',
        reason: 'Steady State Equilibrium: Grid has settled into a static configuration (Period-1 Still Life).',
        period: 1,
        generation: nextGen,
      };
    }
    // 3. Oscillator Loop repetition check
    else if (liveSeenHashes.has(nextGridKey)) {
      const prevGen = liveSeenHashes.get(nextGridKey)!;
      const period = nextGen - prevGen;
      isSettled = true;
      settledInfo = {
        type: 'loop',
        reason: `Oscillator Loop Detected: Grid repeats state every ${period} ticks (Period-${period}).`,
        period,
        generation: nextGen,
      };
    }

    liveSeenHashes.set(nextGridKey, nextGen);

    if (isSettled) {
      if (timerId) clearTimeout(timerId);
      set({
        grid: nextGrid,
        ageGrid: nextAgeGrid,
        generation: nextGen,
        popHistory: nextPopHistory,
        peakPopulation: nextPeak,
        isPlaying: false,
        isSettled: true,
        settledInfo,
      });
      return;
    }

    set({
      grid: nextGrid,
      ageGrid: nextAgeGrid,
      generation: nextGen,
      popHistory: nextPopHistory,
      peakPopulation: nextPeak,
      isSettled: false,
      settledInfo: null,
    });

    if (state.isPlaying) {
      timerId = setTimeout(runTick, state.speed);
    }
  };

  return {
    seed: initialSeed,
    gridSize: GRID_SIZE,
    grid: initialGrids.grid,
    ageGrid: initialGrids.ageGrid,
    generation: 0,
    isPlaying: false,
    isSettled: false,
    settledInfo: null,
    speed: 50, // 50ms tick
    evalResult: initialEval,
    peakPopulation: initialEval.peakPopulation,
    popHistory: [initialEval.peakPopulation],

    setSeed: (newSeedStr) => {
      const cleanSeed = newSeedStr.replace(/\D/g, '').slice(0, 7).padStart(7, '0');
      const { grid, ageGrid } = generateSymmetricalGrid(cleanSeed);
      const evalRes = runFastForwardEvaluation(cleanSeed);

      if (timerId) clearTimeout(timerId);
      liveSeenHashes.clear();
      const initialKey = grid.map(row => row.join('')).join('');
      liveSeenHashes.set(initialKey, 0);

      set({
        seed: cleanSeed,
        grid,
        ageGrid,
        generation: 0,
        isPlaying: false,
        isSettled: false,
        settledInfo: null,
        evalResult: evalRes,
        peakPopulation: evalRes.peakPopulation,
        popHistory: [evalRes.peakPopulation],
      });
    },

    rollRandomSeed: () => {
      const randNum = Math.floor(1000000 + Math.random() * 9000000).toString();
      get().setSeed(randNum);
    },

    play: () => {
      if (get().isPlaying) return;
      if (get().isSettled) {
        set({ isSettled: false, settledInfo: null });
      }
      set({ isPlaying: true });
      timerId = setTimeout(runTick, get().speed);
    },

    pause: () => {
      if (timerId) clearTimeout(timerId);
      set({ isPlaying: false });
    },

    step: () => {
      if (get().isPlaying) get().pause();
      runTick();
    },

    reset: () => {
      const state = get();
      if (timerId) clearTimeout(timerId);
      const { grid, ageGrid } = generateSymmetricalGrid(state.seed);

      liveSeenHashes.clear();
      const initialKey = grid.map(row => row.join('')).join('');
      liveSeenHashes.set(initialKey, 0);

      set({
        grid,
        ageGrid,
        generation: 0,
        isPlaying: false,
        isSettled: false,
        settledInfo: null,
        popHistory: [state.evalResult?.peakPopulation || 0],
        peakPopulation: state.evalResult?.peakPopulation || 0,
      });
    },

    setSpeed: (speed) => set({ speed }),

    generateShareText: () => {
      const state = get();
      const res = state.evalResult;
      if (!res) return '';

      const ratingEmoji = res.rating === 'Mythic' ? '🌟' : res.rating === 'Legendary' ? '🔥' : res.rating === 'Rare' ? '💎' : '⚙️';
      const traitsStr = res.traits.map(t => `${t.name} ${t.emoji}`).join(' | ') || 'Standard Seed';
      const liveSettledStr = state.settledInfo ? ` | Settled: ${state.settledInfo.reason}` : '';

      return [
        `🧬 RNGdle Life #${res.seed}`,
        `Rating: ${res.rating} ${ratingEmoji} (Power Score: ${res.score})`,
        `Traits: ${traitsStr}`,
        `Run Time to Loop: ${res.lifespan} Ticks ⏱️ | Peak Pop: ${res.peakPopulation} 🧬`,
        res.period > 0 ? `Loop Period: ${res.period} 🌀` : `Extinction/Static Gen: ${res.lifespan}`,
        `Live Run: Gen ${state.generation}${liveSettledStr}`,
        `https://councs.github.io/engineeringhub (Secret Prototype)`,
      ].join('\n');
    },
  };
});
