import { create } from 'zustand';
import { soundEngine } from '@/lib/audio/soundEffects';

export type SeedRating = 'Common' | 'Rare' | 'Legendary' | 'Mythic';

export type RuleMode = 'B3/S23 (Conway)' | 'B36/S23 (HighLife)' | 'B357/S23 (Pattern Shift)' | 'B368/S23 (Replicator Overdrive)';

export interface TraitBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  rarityTier: 1 | 2 | 3;
  bonusPoints: number;
}

export interface ScoreBreakdown {
  lifespanPoints: number;
  peakPopPoints: number;
  chaosPoints: number;
  loopPoints: number;
  traitPoints: number;
  multiplier: number;
}

export interface FastEvalResult {
  seed: string;
  lifespan: number;
  peakPopulation: number;
  chaosVariance: number;
  period: number;
  score: number;
  rating: SeedRating;
  ruleMode: RuleMode;
  fillDensity: number;
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
  seed: string;
  gridSize: number;
  grid: number[][];
  ageGrid: number[][];
  generation: number;
  isPlaying: boolean;
  isSettled: boolean;
  settledInfo: SettledInfo | null;
  speed: number;
  isMuted: boolean;
  autoPauseOnSettled: boolean; // Controls whether active oscillator loops auto-stop or keep animating
  
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
  toggleMute: () => void;
  toggleAutoPause: () => void;
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

// Expanded Rule Mutators & Mathematical Rarity Evaluator
export function evaluateSeedTraits(seedStr: string): { traits: TraitBadge[]; ruleMode: RuleMode; fillDensity: number } {
  const traits: TraitBadge[] = [];
  let ruleMode: RuleMode = 'B3/S23 (Conway)';
  let maxTier: 1 | 2 | 3 = 1;

  const num = parseInt(seedStr, 10);

  // Tier 3: Quad Zeros or Meme Palindromes (~0.1% chance)
  const isQuadZero = seedStr.includes('0000');
  const isMemePalindrome = seedStr.length === 7 && seedStr === seedStr.split('').reverse().join('') && (seedStr.includes('420') || seedStr.includes('69'));
  
  if (isQuadZero || isMemePalindrome || num === 0) {
    maxTier = 3;
    ruleMode = 'B368/S23 (Replicator Overdrive)';
    traits.push({
      id: 'replicator_overdrive',
      name: 'Replicator Overdrive',
      emoji: '🌌',
      description: 'Ultra-rare Quad zero/Meme-palindrome: Mutates to HighLife Overdrive (B368/S23)',
      color: 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-pink-300 border-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.4)]',
      rarityTier: 3,
      bonusPoints: 1500,
    });
  }

  // Tier 2: Binary & Pattern Sequences (~3% chance)
  const isBinaryPattern = seedStr.includes('101010') || seedStr.includes('111000') || seedStr.includes('000111') || seedStr.includes('123456');
  if (isBinaryPattern) {
    if (maxTier < 2) {
      maxTier = 2;
      ruleMode = 'B357/S23 (Pattern Shift)';
    }
    traits.push({
      id: 'pattern_shift',
      name: 'Pattern Shift',
      emoji: '⚡',
      description: 'Binary sequence (101010 / 111000): Mutates rules to Pattern Shift (B357/S23)',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
      rarityTier: 2,
      bonusPoints: 450,
    });
  }

  // Tier 1: Meme Numbers & Triple Zeros (~15% chance)
  const isMemeDigit = seedStr.includes('420') || seedStr.includes('69') || seedStr.includes('67') || seedStr.includes('777') || seedStr.includes('000');
  if (isMemeDigit) {
    if (maxTier < 1) {
      ruleMode = 'B36/S23 (HighLife)';
    }
    traits.push({
      id: 'highlife_meme',
      name: 'HighLife Mutator',
      emoji: '💥',
      description: 'Contains 420, 69, 67, 777, or 000: Mutates to HighLife B36/S23 (Spawns Replicators!)',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      rarityTier: 1,
      bonusPoints: 150,
    });
  }

  // Palindrome
  if (seedStr.length === 7 && seedStr === seedStr.split('').reverse().join('')) {
    traits.push({
      id: 'palindrome',
      name: 'Palindrome',
      emoji: '🔄',
      description: 'Reads identically forwards and backwards',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      rarityTier: 2,
      bonusPoints: 300,
    });
  }

  // Extreme digits
  const isAllEven = /^[02468]+$/.test(seedStr);
  const isAllOdd = /^[13579]+$/.test(seedStr);
  if (isAllEven || isAllOdd || num < 1000) {
    traits.push({
      id: 'extreme',
      name: 'Extreme Digit',
      emoji: '🌋',
      description: 'All even, all odd, or low magnitude seed',
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      rarityTier: 2,
      bonusPoints: 250,
    });
  }

  let fillDensity = 0.22;
  if (maxTier === 2) fillDensity = 0.32;
  if (maxTier === 3) fillDensity = 0.42;

  return { traits, ruleMode, fillDensity };
}

// Generate 2-way horizontal symmetrical grid from seed
function generateSymmetricalGrid(seedStr: string): { grid: number[][]; ageGrid: number[][]; fillDensity: number; ruleMode: RuleMode } {
  const seedNum = parseInt(seedStr, 10) || 1234567;
  const prng = mulberry32(seedNum);

  const { traits, ruleMode, fillDensity } = evaluateSeedTraits(seedStr);

  const grid: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  const ageGrid: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

  const halfWidth = GRID_SIZE / 2;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < halfWidth; c++) {
      const rand = prng();
      const alive = rand < fillDensity ? 1 : 0;
      
      grid[r][c] = alive;
      ageGrid[r][c] = alive ? 1 : 0;

      const mirroredCol = GRID_SIZE - 1 - c;
      grid[r][mirroredCol] = alive;
      ageGrid[r][mirroredCol] = alive ? 1 : 0;
    }
  }

  return { grid, ageGrid, fillDensity, ruleMode };
}

function evaluateCellNextState(isAlive: boolean, neighbors: number, ruleMode: RuleMode): boolean {
  if (ruleMode === 'B368/S23 (Replicator Overdrive)') {
    if (isAlive) return neighbors === 2 || neighbors === 3;
    return neighbors === 3 || neighbors === 6 || neighbors === 8;
  }
  if (ruleMode === 'B357/S23 (Pattern Shift)') {
    if (isAlive) return neighbors === 2 || neighbors === 3;
    return neighbors === 3 || neighbors === 5 || neighbors === 7;
  }
  if (ruleMode === 'B36/S23 (HighLife)') {
    if (isAlive) return neighbors === 2 || neighbors === 3;
    return neighbors === 3 || neighbors === 6;
  }
  if (isAlive) return neighbors === 2 || neighbors === 3;
  return neighbors === 3;
}

export function runFastForwardEvaluation(seedStr: string): FastEvalResult {
  const { grid: initialGrid, fillDensity, ruleMode } = generateSymmetricalGrid(seedStr);
  let currentGrid = initialGrid.map(row => [...row]);
  
  const { traits } = evaluateSeedTraits(seedStr);
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

    if (pop === 0) {
      lifespan = gen;
      break;
    }

    if (seenGridHashes.has(gridKey)) {
      const prevGen = seenGridHashes.get(gridKey)!;
      period = gen - prevGen;
      lifespan = gen;
      break;
    }
    seenGridHashes.set(gridKey, gen);

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

        const willBeAlive = evaluateCellNextState(currentGrid[r][c] === 1, n, ruleMode);
        nextGrid[r][c] = willBeAlive ? 1 : 0;
      }
    }
    currentGrid = nextGrid;
  }

  const meanPop = popHistory.reduce((a, b) => a + b, 0) / (popHistory.length || 1);
  const variance = popHistory.reduce((sum, val) => sum + Math.pow(val - meanPop, 2), 0) / (popHistory.length || 1);
  const chaosVariance = Math.round(Math.sqrt(variance));

  const lifespanPoints = Math.round(lifespan * 3.5);
  const peakPopPoints = Math.round(peakPop * 2.0);
  const chaosPoints = Math.round(chaosVariance * 5.0);
  const loopPoints = period > 1 ? period * 30 : period === 1 ? 15 : 0;
  
  const sumTraitBonus = traits.reduce((sum, t) => sum + t.bonusPoints, 0);
  const traitPoints = sumTraitBonus;

  const maxTier = traits.reduce((max, t) => Math.max(max, t.rarityTier), 1);
  const multiplier = maxTier === 3 ? 3.5 : maxTier === 2 ? 2.0 : 1.0;

  const rawScore = lifespanPoints + peakPopPoints + chaosPoints + loopPoints + traitPoints;
  const score = Math.round(rawScore * multiplier);

  let rating: SeedRating = 'Common';
  if (score >= 2500) rating = 'Mythic';
  else if (score >= 1200) rating = 'Legendary';
  else if (score >= 500) rating = 'Rare';

  return {
    seed: seedStr,
    lifespan,
    peakPopulation: peakPop,
    chaosVariance,
    period,
    score,
    rating,
    ruleMode,
    fillDensity,
    traits,
    breakdown: {
      lifespanPoints,
      peakPopPoints,
      chaosPoints,
      loopPoints,
      traitPoints,
      multiplier,
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
    const ruleMode = state.evalResult?.ruleMode || 'B3/S23 (Conway)';

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

        const isAlive = grid[r][c] === 1;
        const willBeAlive = evaluateCellNextState(isAlive, n, ruleMode);

        if (willBeAlive) {
          nextGrid[r][c] = 1;
          nextAgeGrid[r][c] = isAlive ? ageGrid[r][c] + 1 : 1;
          liveCount++;
        }
      }
    }

    const currentGridKey = grid.map(row => row.join('')).join('');
    const nextGridKey = nextGrid.map(row => row.join('')).join('');

    let isSettled = false;
    let settledInfo: SettledInfo | null = null;
    let isHardStaticStop = false;

    // 1. Extinction check (0 live cells)
    if (liveCount === 0) {
      isSettled = true;
      isHardStaticStop = true;
      settledInfo = {
        type: 'extinction',
        reason: 'Extinction: All cells have died out (0 Live Cells).',
        generation: state.generation + 1,
      };
    }
    // 2. Hard Static Equilibrium check (0 grid changes / Period 1)
    else if (currentGridKey === nextGridKey) {
      isSettled = true;
      isHardStaticStop = true;
      settledInfo = {
        type: 'static',
        reason: 'Hard Static Stop: No grid changes detected (Period-1 Still Life).',
        period: 1,
        generation: state.generation,
      };
    }
    // 3. Oscillator Loop repetition check (Period > 1 - Blinking/pulsing animation)
    else if (liveSeenHashes.has(nextGridKey)) {
      const prevGen = liveSeenHashes.get(nextGridKey)!;
      const period = (state.generation + 1) - prevGen;
      isSettled = true;
      settledInfo = {
        type: 'loop',
        reason: `Oscillator Loop Detected: Grid repeats state every ${period} ticks (Period-${period}).`,
        period,
        generation: state.generation + 1,
      };
    }

    // HARD STATIC STOP: If 0 grid changes occur or extinction happens, stop incrementing generation tick count immediately!
    if (isHardStaticStop) {
      if (timerId) clearTimeout(timerId);
      set({
        isPlaying: false,
        isSettled: true,
        settledInfo,
      });
      return;
    }

    const nextGen = state.generation + 1;
    const nextPopHistory = [...state.popHistory, liveCount];
    const nextPeak = Math.max(state.peakPopulation, liveCount);

    soundEngine.playTickBeep(liveCount, state.isMuted);
    liveSeenHashes.set(nextGridKey, nextGen);

    // Oscillator Loop check: auto-pause ONLY if autoPauseOnSettled is enabled, else keep animating!
    if (isSettled && settledInfo?.type === 'loop') {
      const shouldPause = state.autoPauseOnSettled;
      set({
        grid: nextGrid,
        ageGrid: nextAgeGrid,
        generation: nextGen,
        popHistory: nextPopHistory,
        peakPopulation: nextPeak,
        isSettled: true,
        settledInfo,
        isPlaying: shouldPause ? false : state.isPlaying,
      });

      if (shouldPause) {
        if (timerId) clearTimeout(timerId);
        return;
      }
    } else {
      set({
        grid: nextGrid,
        ageGrid: nextAgeGrid,
        generation: nextGen,
        popHistory: nextPopHistory,
        peakPopulation: nextPeak,
        isSettled,
        settledInfo: isSettled ? settledInfo : state.settledInfo,
      });
    }

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
    isMuted: false,
    autoPauseOnSettled: false,
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

      if (evalRes.rating === 'Legendary' || evalRes.rating === 'Mythic') {
        soundEngine.playFanfare(get().isMuted);
      }

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

      // If grid is in a hard static stop (0 changes), do not restart tick counter unless grid is modified or reset
      const state = get();
      if (state.isSettled && state.settledInfo?.type === 'static') {
        const currentKey = state.grid.map(row => row.join('')).join('');
        // Calculate 1 tick
        const ruleMode = state.evalResult?.ruleMode || 'B3/S23 (Conway)';
        let changes = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            let n = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = (r + dr + GRID_SIZE) % GRID_SIZE;
                const nc = (c + dc + GRID_SIZE) % GRID_SIZE;
                if (state.grid[nr][nc] === 1) n++;
              }
            }
            const isAlive = state.grid[r][c] === 1;
            const willBeAlive = evaluateCellNextState(isAlive, n, ruleMode);
            if (isAlive !== willBeAlive) changes++;
          }
        }

        if (changes === 0) {
          return; // Hard static stop: 0 changes, refuse to increment ticks pointlessly!
        }
      }

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

    toggleMute: () => {
      const nextMuted = !get().isMuted;
      soundEngine.setMuted(nextMuted);
      set({ isMuted: nextMuted });
    },

    toggleAutoPause: () => {
      set((state) => ({ autoPauseOnSettled: !state.autoPauseOnSettled }));
    },

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
        `Rule Mode: ${res.ruleMode} | Density: ${(res.fillDensity * 100).toFixed(0)}%`,
        `Traits: ${traitsStr}`,
        `Run Time to Loop: ${res.lifespan} Ticks ⏱️ | Peak Pop: ${res.peakPopulation} 🧬`,
        res.period > 0 ? `Loop Period: ${res.period} 🌀` : `Extinction/Static Gen: ${res.lifespan}`,
        `Live Run: Gen ${state.generation}${liveSettledStr}`,
        `https://councs.github.io/engineeringhub (Secret Prototype)`,
      ].join('\n');
    },
  };
});
