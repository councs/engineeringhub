import { create } from 'zustand';
import { soundEngine } from '@/lib/audio/soundEffects';

export type GameMode = 'classic' | 'artillery';

export type SeedRating = 'Common' | 'Rare' | 'Legendary' | 'Mythic';

export type RuleMode = 'B3/S23 (Conway)' | 'B36/S23 (HighLife)' | 'B357/S23 (Pattern Shift)' | 'B368/S23 (Replicator Overdrive)';

export type ClassArchetype = 'Archmage Cloning Engine' | 'Supernova' | 'Starship Fleet' | 'The Fortress';

export type ThemePalette = 'Terminal Green' | 'Cyberpunk Neon' | 'Golden Solar';

export type ProjectileType = 'glider' | 'lwss';

export type SpawnEdge = 'top' | 'left' | 'right' | 'bottom';

export interface TraitBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  rarityTier: 1 | 2 | 3;
  bonusPoints: number;
  ruleUnlocked: string;
}

export interface AppliedTraitInfo {
  id: string;
  name: string;
  emoji: string;
  description: string;
  bonusPoints: number;
  color: string;
  ruleUnlocked: string;
}

export interface ScoreBreakdown {
  baseScore: number;
  lifespanPoints: number;
  peakPopPoints: number;
  chaosPoints: number;
  loopPoints: number;
  traitPoints: number;
  multiplier: number;
  percentile: string;
  appliedTraits: AppliedTraitInfo[];
}

export interface ArchetypeInfo {
  title: ClassArchetype;
  emoji: string;
  description: string;
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
  gridSize: number;
  podCount: number;
  theme: ThemePalette;
  archetype: ArchetypeInfo;
  traits: TraitBadge[];
  breakdown: ScoreBreakdown;
}

export interface SettledInfo {
  type: 'static' | 'loop' | 'extinction';
  reason: string;
  period?: number;
  generation: number;
}

export interface InspectCellInfo {
  row: number;
  col: number;
  mirroredCol: number;
  index: number;
  totalCells: number;
  podIndex: number;
  prngVal: number;
  threshold: number;
  isAlive: boolean;
}

export interface ShotRecord {
  shotNum: number;
  type: ProjectileType;
  edge: SpawnEdge;
  pos: number;
  hpBefore: number;
  hpAfter: number;
}

export interface RngdleState {
  // Game Mode
  gameMode: GameMode;

  // Core state
  seed: string;
  gridSize: number;
  grid: number[][];
  ageGrid: number[][];
  generation: number;
  isPlaying: boolean;
  isSettled: boolean;
  settledInfo: SettledInfo | null;
  speed: number; // 1 to 100
  isMuted: boolean;
  autoPauseOnSettled: boolean;
  
  // Seed Inspector State
  isInspecting: boolean;
  inspectStep: number;
  inspectTotalSteps: number;
  inspectAutoPlay: boolean;
  inspectCellInfo: InspectCellInfo | null;

  // Artillery Mode State
  ammoCount: number;
  initialTargetHp: number;
  currentTargetHp: number;
  projectileType: ProjectileType;
  spawnEdge: SpawnEdge;
  spawnPos: number;
  artilleryTicksRemaining: number;
  shotHistory: ShotRecord[];
  isGameOver: boolean;
  artilleryFinalScore: number;
  percentDestroyed: number;

  // Analytics & Evaluation
  evalResult: FastEvalResult | null;
  peakPopulation: number;
  popHistory: number[];

  // Actions
  setGameMode: (mode: GameMode) => void;
  setSeed: (newSeed: string) => void;
  rollRandomSeed: () => void;
  play: () => void;
  pause: () => void;
  step: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  toggleMute: () => void;
  toggleAutoPause: () => void;
  
  // Inspector Actions
  startInspection: () => void;
  exitInspection: () => void;
  setInspectStep: (step: number) => void;
  stepInspection: (dir: 1 | -1) => void;
  toggleInspectAutoPlay: () => void;
  
  // Artillery Actions
  setProjectileType: (type: ProjectileType) => void;
  setSpawnEdge: (edge: SpawnEdge) => void;
  setSpawnPos: (pos: number) => void;
  fireArtillery: () => void;
  resetArtilleryRound: () => void;

  generateShareText: () => string;
  generateArtilleryShareText: () => string;
}

// Mulberry32 PRNG
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function speedToDelayMs(speedVal: number): number {
  const clamped = Math.max(1, Math.min(100, speedVal));
  return Math.max(10, Math.round(210 - clamped * 2));
}

// Evaluate Seed Traits
export function evaluateSeedTraits(seedStr: string): { 
  traits: TraitBadge[]; 
  ruleMode: RuleMode; 
  fillDensity: number;
  gridSize: number;
  podCount: number;
  theme: ThemePalette;
} {
  const traits: TraitBadge[] = [];
  let ruleMode: RuleMode = 'B3/S23 (Conway)';
  let maxTier: 1 | 2 | 3 = 1;

  const num = parseInt(seedStr, 10);

  const isQuadZero = seedStr.includes('0000');
  const isMemePalindrome = seedStr.length === 7 && seedStr === seedStr.split('').reverse().join('') && (seedStr.includes('420') || seedStr.includes('69'));
  
  if (isQuadZero || isMemePalindrome || num === 0) {
    maxTier = 3;
    ruleMode = 'B368/S23 (Replicator Overdrive)';
    traits.push({
      id: 'replicator_overdrive',
      name: 'Replicator Overdrive',
      emoji: '🌌',
      description: 'Ultra-rare Quad zero/Meme-palindrome',
      color: 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-pink-300 border-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.4)]',
      rarityTier: 3,
      bonusPoints: 1500,
      ruleUnlocked: 'Unlocked 64x64 Grid (4 Corner Pods) & Replicator Overdrive B368/S23',
    });
  }

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
      description: 'Binary pattern sequence',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
      rarityTier: 2,
      bonusPoints: 450,
      ruleUnlocked: 'Unlocked 48x48 Grid (2 Corner Pods) & Pattern Shift B357/S23',
    });
  }

  const isMemeDigit = seedStr.includes('420') || seedStr.includes('69') || seedStr.includes('67') || seedStr.includes('777') || seedStr.includes('000');
  if (isMemeDigit) {
    if (maxTier < 1) {
      ruleMode = 'B36/S23 (HighLife)';
    }
    traits.push({
      id: 'highlife_meme',
      name: 'HighLife Mutator',
      emoji: '💥',
      description: 'Contains 420, 69, 67, 777, or 000',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      rarityTier: 1,
      bonusPoints: 150,
      ruleUnlocked: 'Unlocked 48x48 Grid (2 Corner Pods) & HighLife B36/S23 (Replicators)',
    });
  }

  if (seedStr.length === 7 && seedStr === seedStr.split('').reverse().join('')) {
    traits.push({
      id: 'palindrome',
      name: 'Palindrome',
      emoji: '🔄',
      description: 'Reads identically forwards and backwards',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      rarityTier: 2,
      bonusPoints: 300,
      ruleUnlocked: 'Unlocked Symmetrical Palindrome Bonus (+300 pts)',
    });
  }

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
      ruleUnlocked: 'Unlocked Extreme Digit Multiplier (+250 pts)',
    });
  }

  let gridSize = 32;
  let podCount = 1;
  let fillDensity = 0.22;
  let theme: ThemePalette = 'Terminal Green';

  if (maxTier === 3) {
    gridSize = 64;
    podCount = 4;
    fillDensity = 0.42;
    theme = 'Golden Solar';
  } else if (isMemeDigit || isBinaryPattern) {
    gridSize = 48;
    podCount = 2;
    fillDensity = 0.32;
    theme = 'Cyberpunk Neon';
  } else if (traits.length > 0) {
    gridSize = 32;
    podCount = 1;
    fillDensity = 0.26;
    theme = 'Terminal Green';
  } else {
    gridSize = 24;
    podCount = 1;
    fillDensity = 0.20;
    theme = 'Terminal Green';
  }

  return { traits, ruleMode, fillDensity, gridSize, podCount, theme };
}

// Generate Symmetrical Grid
function generateSymmetricalGrid(seedStr: string, forceGridSize?: number): { 
  grid: number[][]; 
  ageGrid: number[][]; 
  fillDensity: number; 
  ruleMode: RuleMode;
  gridSize: number;
  podCount: number;
  theme: ThemePalette;
} {
  const seedNum = parseInt(seedStr, 10) || 1234567;
  const prng = mulberry32(seedNum);

  const evalRes = evaluateSeedTraits(seedStr);
  const gridSize = forceGridSize || evalRes.gridSize;
  const { traits, ruleMode, fillDensity, podCount, theme } = evalRes;

  const grid: number[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  const ageGrid: number[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

  const podLocations: { r0: number; c0: number; pSize: number }[] = [];
  const pSize = 16;

  if (podCount === 1 || forceGridSize) {
    const r0 = Math.floor((gridSize - pSize) / 2);
    const c0 = Math.floor((gridSize - pSize) / 2);
    podLocations.push({ r0, c0, pSize });
  } else if (podCount === 2) {
    podLocations.push({ r0: 4, c0: 4, pSize });
    podLocations.push({ r0: gridSize - pSize - 4, c0: gridSize - pSize - 4, pSize });
  } else if (podCount === 4) {
    podLocations.push({ r0: 4, c0: 4, pSize });
    podLocations.push({ r0: 4, c0: gridSize - pSize - 4, pSize });
    podLocations.push({ r0: gridSize - pSize - 4, c0: 4, pSize });
    podLocations.push({ r0: gridSize - pSize - 4, c0: gridSize - pSize - 4, pSize });
  }

  podLocations.forEach((pod) => {
    const halfP = pod.pSize / 2;
    for (let r = 0; r < pod.pSize; r++) {
      for (let c = 0; c < halfP; c++) {
        const rand = prng();
        const alive = rand < fillDensity ? 1 : 0;

        const realR = pod.r0 + r;
        const realC = pod.c0 + c;
        const mirroredC = pod.c0 + (pod.pSize - 1 - c);

        if (realR >= 0 && realR < gridSize && realC >= 0 && realC < gridSize) {
          grid[realR][realC] = alive;
          ageGrid[realR][realC] = alive ? 1 : 0;
          grid[realR][mirroredC] = alive;
          ageGrid[realR][mirroredC] = alive ? 1 : 0;
        }
      }
    }
  });

  return { grid, ageGrid, fillDensity, ruleMode, gridSize, podCount, theme };
}

// Compute inspection grid
function computeInspectionState(seedStr: string, stepIndex: number): { 
  grid: number[][]; 
  ageGrid: number[][]; 
  cellInfo: InspectCellInfo | null;
  totalSteps: number;
} {
  const seedNum = parseInt(seedStr, 10) || 1234567;
  const prng = mulberry32(seedNum);
  const { fillDensity, gridSize, podCount } = evaluateSeedTraits(seedStr);

  const grid: number[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  const ageGrid: number[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

  const podLocations: { r0: number; c0: number; pSize: number }[] = [];
  const pSize = 16;

  if (podCount === 1) {
    podLocations.push({ r0: Math.floor((gridSize - pSize) / 2), c0: Math.floor((gridSize - pSize) / 2), pSize });
  } else if (podCount === 2) {
    podLocations.push({ r0: 4, c0: 4, pSize });
    podLocations.push({ r0: gridSize - pSize - 4, c0: gridSize - pSize - 4, pSize });
  } else if (podCount === 4) {
    podLocations.push({ r0: 4, c0: 4, pSize });
    podLocations.push({ r0: 4, c0: gridSize - pSize - 4, pSize });
    podLocations.push({ r0: gridSize - pSize - 4, c0: 4, pSize });
    podLocations.push({ r0: gridSize - pSize - 4, c0: gridSize - pSize - 4, pSize });
  }

  const cellsPerPod = pSize * (pSize / 2);
  const totalSteps = podLocations.length * cellsPerPod;

  const clampedStep = Math.max(0, Math.min(totalSteps, stepIndex));
  let cellInfo: InspectCellInfo | null = null;

  let stepCounter = 0;
  for (let pIdx = 0; pIdx < podLocations.length; pIdx++) {
    const pod = podLocations[pIdx];
    const halfP = pod.pSize / 2;

    for (let r = 0; r < pod.pSize; r++) {
      for (let c = 0; c < halfP; c++) {
        stepCounter++;
        const randVal = prng();
        const isAlive = randVal < fillDensity;

        if (stepCounter <= clampedStep) {
          const realR = pod.r0 + r;
          const realC = pod.c0 + c;
          const mirroredC = pod.c0 + (pod.pSize - 1 - c);

          if (realR >= 0 && realR < gridSize && realC >= 0 && realC < gridSize) {
            grid[realR][realC] = isAlive ? 1 : 0;
            ageGrid[realR][realC] = isAlive ? 1 : 0;
            grid[realR][mirroredC] = isAlive ? 1 : 0;
            ageGrid[realR][mirroredC] = isAlive ? 1 : 0;
          }

          if (stepCounter === clampedStep) {
            cellInfo = {
              row: realR,
              col: realC,
              mirroredCol: mirroredC,
              index: stepCounter,
              totalCells: totalSteps,
              podIndex: pIdx + 1,
              prngVal: Number(randVal.toFixed(4)),
              threshold: Number(fillDensity.toFixed(4)),
              isAlive,
            };
          }
        }
      }
    }
  }

  return { grid, ageGrid, cellInfo, totalSteps };
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

// Evaluate Class Archetype
export function evaluateClassArchetype(
  ruleMode: RuleMode, 
  peakPop: number, 
  chaosSD: number, 
  isStatic: boolean
): ArchetypeInfo {
  if (ruleMode.includes('HighLife') || ruleMode.includes('Replicator')) {
    return {
      title: 'Archmage Cloning Engine',
      emoji: '🧙‍♂️',
      description: 'HighLife rules active spawning exponential diagonal Replicators!',
    };
  }
  if (peakPop >= 300) {
    return {
      title: 'Supernova',
      emoji: '⚡',
      description: 'Massive population surge exceeding 300 live cells!',
    };
  }
  if (chaosSD >= 70) {
    return {
      title: 'Starship Fleet',
      emoji: '🚀',
      description: 'High population motion and kinetic glider dynamics!',
    };
  }
  return {
    title: 'The Fortress',
    emoji: '🛡️',
    description: 'Low-variance defensive structure or static equilibrium.',
  };
}

export function runFastForwardEvaluation(seedStr: string): FastEvalResult {
  const { grid: initialGrid, fillDensity, ruleMode, gridSize, podCount, theme } = generateSymmetricalGrid(seedStr);
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

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
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

    const nextGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = (r + dr + gridSize) % gridSize;
            const nc = (c + dc + gridSize) % gridSize;
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
  
  const baseScore = lifespanPoints + peakPopPoints + chaosPoints + loopPoints;
  const sumTraitBonus = traits.reduce((sum, t) => sum + t.bonusPoints, 0);
  const traitPoints = sumTraitBonus;

  const maxTier = traits.reduce((max, t) => Math.max(max, t.rarityTier), 1);
  const multiplier = maxTier === 3 ? 3.5 : maxTier === 2 ? 2.0 : 1.0;

  const rawScore = baseScore + traitPoints;
  const score = Math.round(rawScore * multiplier);

  let rating: SeedRating = 'Common';
  let percentile = 'Top 45% Common Seed';

  if (score >= 2500) {
    rating = 'Mythic';
    percentile = 'Top 0.5% Mythic Seed!';
  } else if (score >= 1200) {
    rating = 'Legendary';
    percentile = 'Top 3.2% Legendary Seed!';
  } else if (score >= 500) {
    rating = 'Rare';
    percentile = 'Top 14.5% Rare Seed!';
  }

  const archetype = evaluateClassArchetype(ruleMode, peakPop, chaosVariance, period === 1);

  const appliedTraits: AppliedTraitInfo[] = traits.map(t => ({
    id: t.id,
    name: t.name,
    emoji: t.emoji,
    description: t.description,
    bonusPoints: t.bonusPoints,
    color: t.color,
    ruleUnlocked: t.ruleUnlocked,
  }));

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
    gridSize,
    podCount,
    theme,
    archetype,
    traits,
    breakdown: {
      baseScore,
      lifespanPoints,
      peakPopPoints,
      chaosPoints,
      loopPoints,
      traitPoints,
      multiplier,
      percentile,
      appliedTraits,
    },
  };
}

// Projectile Pattern Stamp Helper
function stampProjectile(
  grid: number[][], 
  ageGrid: number[][], 
  type: ProjectileType, 
  edge: SpawnEdge, 
  pos: number,
  gridSize: number
) {
  let pattern: number[][] = [];

  if (type === 'glider') {
    if (edge === 'top' || edge === 'left') {
      pattern = [
        [0, 1, 0],
        [0, 0, 1],
        [1, 1, 1],
      ];
    } else if (edge === 'right') {
      pattern = [
        [0, 1, 0],
        [1, 0, 0],
        [1, 1, 1],
      ];
    } else {
      pattern = [
        [1, 1, 1],
        [0, 0, 1],
        [0, 1, 0],
      ];
    }
  } else {
    if (edge === 'left' || edge === 'right') {
      pattern = [
        [0, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0],
      ];
    } else {
      pattern = [
        [1, 0, 1, 0],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 1],
      ];
    }
  }

  let startR = 1;
  let startC = Math.max(0, Math.min(gridSize - pattern[0].length, pos));

  if (edge === 'top') {
    startR = 1;
    startC = Math.max(0, Math.min(gridSize - pattern[0].length, pos));
  } else if (edge === 'bottom') {
    startR = gridSize - pattern.length - 1;
    startC = Math.max(0, Math.min(gridSize - pattern[0].length, pos));
  } else if (edge === 'left') {
    startR = Math.max(0, Math.min(gridSize - pattern.length, pos));
    startC = 1;
  } else if (edge === 'right') {
    startR = Math.max(0, Math.min(gridSize - pattern.length, pos));
    startC = gridSize - pattern[0].length - 1;
  }

  for (let r = 0; r < pattern.length; r++) {
    for (let c = 0; c < pattern[0].length; c++) {
      if (pattern[r][c] === 1) {
        const realR = startR + r;
        const realC = startC + c;
        if (realR >= 0 && realR < gridSize && realC >= 0 && realC < gridSize) {
          grid[realR][realC] = 1;
          ageGrid[realR][realC] = 1;
        }
      }
    }
  }
}

export const useRngdleStore = create<RngdleState>((set, get) => {
  const initialSeed = '4206977';
  const initialGrids = generateSymmetricalGrid(initialSeed);
  const initialEval = runFastForwardEvaluation(initialSeed);

  let timerId: NodeJS.Timeout | null = null;
  let inspectTimerId: NodeJS.Timeout | null = null;
  const liveSeenHashes = new Map<string, number>();

  const calculateTargetHp = (g: number[][], size: number): number => {
    let count = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (g[r][c] === 1) count++;
      }
    }
    return count;
  };

  const runTick = () => {
    const state = get();
    if (!state.isPlaying) return;

    const gridSize = state.gridSize;
    const grid = state.grid;
    const ageGrid = state.ageGrid;
    const ruleMode = state.evalResult?.ruleMode || 'B3/S23 (Conway)';

    const nextGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    const nextAgeGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

    let liveCount = 0;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = (r + dr + gridSize) % gridSize;
            const nc = (c + dc + gridSize) % gridSize;
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

    if (liveCount === 0) {
      isSettled = true;
      isHardStaticStop = true;
      settledInfo = {
        type: 'extinction',
        reason: 'Extinction: All cells have died out (0 Live Cells).',
        generation: state.generation + 1,
      };
    } else if (currentGridKey === nextGridKey) {
      isSettled = true;
      isHardStaticStop = true;
      settledInfo = {
        type: 'static',
        reason: 'Hard Static Stop: No grid changes detected (Period-1 Still Life).',
        period: 1,
        generation: state.generation,
      };
    } else if (liveSeenHashes.has(nextGridKey)) {
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

    if (state.gameMode === 'artillery') {
      const remainingTicks = state.artilleryTicksRemaining - 1;
      const updatedTargetHp = liveCount;

      const hpDestroyedPct = Math.max(0, Math.min(100, Math.round(((state.initialTargetHp - updatedTargetHp) / (state.initialTargetHp || 1)) * 100)));
      const isWon = hpDestroyedPct >= 90 || updatedTargetHp <= 5;
      const isOutOfAmmo = state.ammoCount === 0 && (remainingTicks <= 0 || isSettled);

      if (isWon || isOutOfAmmo) {
        if (timerId) clearTimeout(timerId);
        const finalPct = Math.max(0, Math.min(100, Math.round(((state.initialTargetHp - updatedTargetHp) / (state.initialTargetHp || 1)) * 100)));
        const unusedAmmoBonus = state.ammoCount * 500;
        const rarityBonus = state.evalResult?.score || 0;
        const finalArtilleryScore = Math.round((finalPct * 100) + unusedAmmoBonus + rarityBonus);

        set({
          grid: nextGrid,
          ageGrid: nextAgeGrid,
          generation: state.generation + 1,
          currentTargetHp: updatedTargetHp,
          percentDestroyed: finalPct,
          artilleryFinalScore: finalArtilleryScore,
          isPlaying: false,
          isGameOver: true,
        });
        return;
      }

      if (remainingTicks <= 0 || isSettled) {
        if (timerId) clearTimeout(timerId);
        set({
          grid: nextGrid,
          ageGrid: nextAgeGrid,
          generation: state.generation + 1,
          currentTargetHp: updatedTargetHp,
          percentDestroyed: hpDestroyedPct,
          isPlaying: false,
          artilleryTicksRemaining: 0,
        });
        return;
      }

      soundEngine.playTickBeep(liveCount, state.isMuted);
      liveSeenHashes.set(nextGridKey, state.generation + 1);

      set({
        grid: nextGrid,
        ageGrid: nextAgeGrid,
        generation: state.generation + 1,
        currentTargetHp: updatedTargetHp,
        percentDestroyed: hpDestroyedPct,
        artilleryTicksRemaining: remainingTicks,
      });

      if (state.isPlaying) {
        const delay = speedToDelayMs(state.speed);
        timerId = setTimeout(runTick, delay);
      }
      return;
    }

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
      const delay = speedToDelayMs(state.speed);
      timerId = setTimeout(runTick, delay);
    }
  };

  const runInspectAutoTick = () => {
    const state = get();
    if (!state.isInspecting || !state.inspectAutoPlay) return;

    if (state.inspectStep >= state.inspectTotalSteps) {
      set({ inspectAutoPlay: false });
      if (inspectTimerId) clearTimeout(inspectTimerId);
      return;
    }

    const nextStep = state.inspectStep + 1;
    state.setInspectStep(nextStep);

    if (get().inspectAutoPlay && nextStep < get().inspectTotalSteps) {
      const delay = speedToDelayMs(get().speed);
      inspectTimerId = setTimeout(runInspectAutoTick, delay);
    } else if (nextStep >= get().inspectTotalSteps) {
      set({ inspectAutoPlay: false });
    }
  };

  const initArtilleryStateForSeed = (seedStr: string) => {
    const { grid, ageGrid } = generateSymmetricalGrid(seedStr, 48);
    const targetHp = calculateTargetHp(grid, 48);
    return {
      gridSize: 48,
      grid,
      ageGrid,
      initialTargetHp: targetHp,
      currentTargetHp: targetHp,
      ammoCount: 3,
      projectileType: 'glider' as ProjectileType,
      spawnEdge: 'top' as SpawnEdge,
      spawnPos: 22,
      artilleryTicksRemaining: 0,
      shotHistory: [],
      isGameOver: false,
      artilleryFinalScore: 0,
      percentDestroyed: 0,
      generation: 0,
      isPlaying: false,
    };
  };

  return {
    gameMode: 'classic',

    seed: initialSeed,
    gridSize: initialGrids.gridSize,
    grid: initialGrids.grid,
    ageGrid: initialGrids.ageGrid,
    generation: 0,
    isPlaying: false,
    isSettled: false,
    settledInfo: null,
    speed: 80,
    isMuted: false,
    autoPauseOnSettled: false,
    
    // Inspection State
    isInspecting: false,
    inspectStep: 0,
    inspectTotalSteps: 128,
    inspectAutoPlay: false,
    inspectCellInfo: null,

    // Artillery State
    ammoCount: 3,
    initialTargetHp: 0,
    currentTargetHp: 0,
    projectileType: 'glider',
    spawnEdge: 'top',
    spawnPos: 22,
    artilleryTicksRemaining: 0,
    shotHistory: [],
    isGameOver: false,
    artilleryFinalScore: 0,
    percentDestroyed: 0,

    evalResult: initialEval,
    peakPopulation: initialEval.peakPopulation,
    popHistory: [initialEval.peakPopulation],

    setGameMode: (mode) => {
      if (timerId) clearTimeout(timerId);
      if (inspectTimerId) clearTimeout(inspectTimerId);
      const state = get();

      if (mode === 'artillery') {
        const artState = initArtilleryStateForSeed(state.seed);
        set({
          gameMode: 'artillery',
          isInspecting: false,
          ...artState,
        });
      } else {
        const { grid, ageGrid, gridSize } = generateSymmetricalGrid(state.seed);
        set({
          gameMode: 'classic',
          gridSize,
          grid,
          ageGrid,
          generation: 0,
          isPlaying: false,
          isGameOver: false,
        });
      }
    },

    setSeed: (newSeedStr) => {
      const cleanSeed = newSeedStr.replace(/\D/g, '').slice(0, 7).padStart(7, '0');
      const evalRes = runFastForwardEvaluation(cleanSeed);

      if (timerId) clearTimeout(timerId);
      if (inspectTimerId) clearTimeout(inspectTimerId);
      liveSeenHashes.clear();

      if (get().gameMode === 'artillery') {
        const artState = initArtilleryStateForSeed(cleanSeed);
        set({
          seed: cleanSeed,
          evalResult: evalRes,
          ...artState,
        });
      } else {
        const { grid, ageGrid, gridSize } = generateSymmetricalGrid(cleanSeed);
        const initialKey = grid.map(row => row.join('')).join('');
        liveSeenHashes.set(initialKey, 0);

        if (evalRes.rating === 'Legendary' || evalRes.rating === 'Mythic') {
          soundEngine.playFanfare(get().isMuted);
        }

        set({
          seed: cleanSeed,
          gridSize,
          grid,
          ageGrid,
          generation: 0,
          isPlaying: false,
          isInspecting: false,
          inspectStep: 0,
          inspectAutoPlay: false,
          inspectCellInfo: null,
          isSettled: false,
          settledInfo: null,
          evalResult: evalRes,
          peakPopulation: evalRes.peakPopulation,
          popHistory: [evalRes.peakPopulation],
        });
      }
    },

    rollRandomSeed: () => {
      const randNum = Math.floor(1000000 + Math.random() * 9000000).toString();
      get().setSeed(randNum);
    },

    play: () => {
      if (get().isInspecting) {
        get().exitInspection();
      }

      if (get().isPlaying) return;

      const state = get();
      const gridSize = state.gridSize;
      if (state.isSettled && state.settledInfo?.type === 'static') {
        const ruleMode = state.evalResult?.ruleMode || 'B3/S23 (Conway)';
        let changes = 0;
        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            let n = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = (r + dr + gridSize) % gridSize;
                const nc = (c + dc + gridSize) % gridSize;
                if (state.grid[nr][nc] === 1) n++;
              }
            }
            const isAlive = state.grid[r][c] === 1;
            const willBeAlive = evaluateCellNextState(isAlive, n, ruleMode);
            if (isAlive !== willBeAlive) changes++;
          }
        }

        if (changes === 0) {
          return;
        }
      }

      if (get().isSettled) {
        set({ isSettled: false, settledInfo: null });
      }
      set({ isPlaying: true });
      const delay = speedToDelayMs(get().speed);
      timerId = setTimeout(runTick, delay);
    },

    pause: () => {
      if (timerId) clearTimeout(timerId);
      if (inspectTimerId) clearTimeout(inspectTimerId);
      set({ isPlaying: false, inspectAutoPlay: false });
    },

    step: () => {
      if (get().isInspecting) get().exitInspection();
      if (get().isPlaying) get().pause();
      runTick();
    },

    reset: () => {
      const state = get();
      if (timerId) clearTimeout(timerId);
      if (inspectTimerId) clearTimeout(inspectTimerId);

      if (state.gameMode === 'artillery') {
        get().resetArtilleryRound();
      } else {
        const { grid, ageGrid, gridSize } = generateSymmetricalGrid(state.seed);
        liveSeenHashes.clear();
        const initialKey = grid.map(row => row.join('')).join('');
        liveSeenHashes.set(initialKey, 0);

        set({
          gridSize,
          grid,
          ageGrid,
          generation: 0,
          isPlaying: false,
          isInspecting: false,
          inspectStep: 0,
          inspectAutoPlay: false,
          inspectCellInfo: null,
          isSettled: false,
          settledInfo: null,
          popHistory: [state.evalResult?.peakPopulation || 0],
          peakPopulation: state.evalResult?.peakPopulation || 0,
        });
      }
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

    // Seed Inspector Actions
    startInspection: () => {
      const state = get();
      if (timerId) clearTimeout(timerId);
      if (inspectTimerId) clearTimeout(inspectTimerId);

      const { grid, ageGrid, cellInfo, totalSteps } = computeInspectionState(state.seed, 1);

      set({
        isPlaying: false,
        isInspecting: true,
        inspectStep: 1,
        inspectTotalSteps: totalSteps,
        inspectAutoPlay: false,
        grid,
        ageGrid,
        inspectCellInfo: cellInfo,
      });

      if (cellInfo) {
        soundEngine.playInspectCellBeep(cellInfo.isAlive, cellInfo.index, totalSteps, state.isMuted);
      }
    },

    exitInspection: () => {
      const state = get();
      if (inspectTimerId) clearTimeout(inspectTimerId);
      const { grid, ageGrid, gridSize } = generateSymmetricalGrid(state.seed);

      set({
        isInspecting: false,
        inspectStep: 0,
        inspectAutoPlay: false,
        inspectCellInfo: null,
        gridSize,
        grid,
        ageGrid,
      });
    },

    setInspectStep: (stepIndex) => {
      const state = get();
      const { grid, ageGrid, cellInfo, totalSteps } = computeInspectionState(state.seed, stepIndex);
      const clampedStep = Math.max(0, Math.min(totalSteps, stepIndex));

      if (cellInfo) {
        soundEngine.playInspectCellBeep(cellInfo.isAlive, cellInfo.index, totalSteps, state.isMuted);
      }

      set({
        inspectStep: clampedStep,
        inspectTotalSteps: totalSteps,
        grid,
        ageGrid,
        inspectCellInfo: cellInfo,
      });
    },

    stepInspection: (dir) => {
      const state = get();
      const targetStep = state.inspectStep + dir;
      state.setInspectStep(targetStep);
    },

    toggleInspectAutoPlay: () => {
      const state = get();
      const nextState = !state.inspectAutoPlay;

      if (inspectTimerId) clearTimeout(inspectTimerId);
      set({ inspectAutoPlay: nextState });

      if (nextState) {
        const delay = speedToDelayMs(state.speed);
        inspectTimerId = setTimeout(runInspectAutoTick, delay);
      }
    },

    // Artillery Mode Actions
    setProjectileType: (type) => set({ projectileType: type }),
    setSpawnEdge: (edge) => set({ spawnEdge: edge }),
    setSpawnPos: (pos) => set({ spawnPos: Math.max(0, Math.min(47, pos)) }),

    fireArtillery: () => {
      const state = get();
      if (state.ammoCount <= 0 || state.isGameOver || state.isPlaying) return;

      const newGrid = state.grid.map(row => [...row]);
      const newAgeGrid = state.ageGrid.map(row => [...row]);

      stampProjectile(newGrid, newAgeGrid, state.projectileType, state.spawnEdge, state.spawnPos, 48);

      soundEngine.playFanfare(state.isMuted);

      const shotNum = 4 - state.ammoCount;
      const hpBefore = state.currentTargetHp;

      const newHistory: ShotRecord[] = [
        ...state.shotHistory,
        {
          shotNum,
          type: state.projectileType,
          edge: state.spawnEdge,
          pos: state.spawnPos,
          hpBefore,
          hpAfter: hpBefore,
        },
      ];

      set({
        grid: newGrid,
        ageGrid: newAgeGrid,
        ammoCount: state.ammoCount - 1,
        artilleryTicksRemaining: 60,
        shotHistory: newHistory,
        isPlaying: true,
      });

      const delay = speedToDelayMs(state.speed);
      timerId = setTimeout(runTick, delay);
    },

    resetArtilleryRound: () => {
      if (timerId) clearTimeout(timerId);
      const state = get();
      const artState = initArtilleryStateForSeed(state.seed);
      set(artState);
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
        `Rank: ${res.breakdown.percentile}`,
        `Archetype: ${res.archetype.emoji} ${res.archetype.title}`,
        `Rating: ${res.rating} ${ratingEmoji} (Power Score: ${res.score})`,
        `Grid: ${res.gridSize}x${res.gridSize} (${res.podCount} Pods) | Rule: ${res.ruleMode}`,
        `Traits: ${traitsStr}`,
        `Run Time to Loop: ${res.lifespan} Ticks ⏱️ | Peak Pop: ${res.peakPopulation} 🧬`,
        res.period > 0 ? `Loop Period: ${res.period} 🌀` : `Extinction/Static Gen: ${res.lifespan}`,
        `Live Run: Gen ${state.generation}${liveSettledStr}`,
        `https://councs.github.io/engineeringhub (Secret Prototype)`,
      ].join('\n');
    },

    generateArtilleryShareText: () => {
      const state = get();
      const pct = state.percentDestroyed;
      const score = state.artilleryFinalScore;
      const ammoLeft = state.ammoCount;

      const resultEmoji = pct >= 90 ? '🏆 VICTORY!' : '💥 TARGET COLLAPSED!';

      return [
        `🚀 Glider Artillery Destruction #${state.seed}`,
        `${resultEmoji} - ${pct}% Target Destroyed`,
        `Destruction Score: ${score} Pts 🎯`,
        `Unused Ammo: ${ammoLeft} / 3 Gliders Left 🚀`,
        `Seed Rarity: ${state.evalResult?.rating || 'Common'}`,
        `https://councs.github.io/engineeringhub (Secret Prototype)`,
      ].join('\n');
    },
  };
});
