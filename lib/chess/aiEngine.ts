import { Chess } from 'chess.js';

// Piece-Square Tables (PSTs) represent positional values for pieces on the board.
// Values are from White's perspective. Row 0 is the top (rank 8), Row 7 is the bottom (rank 1).
const pawnPST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const knightPST = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const bishopPST = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const rookPST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const queenPST = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  5,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const kingPST = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

const pieceValues: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Normalize FEN to compare positions accurately (ignores move clock and turn index)
function normalizeFen(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ');
}

// Static Evaluation of the board
export function evaluateBoard(fen: string): number {
  const game = new Chess(fen);
  let totalEvaluation = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const type = piece.type;
        const color = piece.color;
        let val = pieceValues[type] || 0;

        // Positional values
        let pstValue = 0;
        switch (type) {
          case 'p': pstValue = pawnPST[color === 'w' ? r : 7 - r][c]; break;
          case 'n': pstValue = knightPST[color === 'w' ? r : 7 - r][c]; break;
          case 'b': pstValue = bishopPST[color === 'w' ? r : 7 - r][c]; break;
          case 'r': pstValue = rookPST[color === 'w' ? r : 7 - r][c]; break;
          case 'q': pstValue = queenPST[color === 'w' ? r : 7 - r][c]; break;
          case 'k': pstValue = kingPST[color === 'w' ? r : 7 - r][c]; break;
        }

        const score = val + pstValue;
        if (color === 'w') {
          totalEvaluation += score;
        } else {
          totalEvaluation -= score;
        }
      }
    }
  }

  // Add small random noise (+/- 4 centipawns) to break deterministic ties and prevent infinite repetitions
  const jitter = (Math.random() - 0.5) * 8;
  return totalEvaluation + jitter;
}

// Minimax with Alpha-Beta Pruning
// Returns [bestMoveString, score]
export function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean,
  gameHistory: string[] = []
): [string | null, number] {
  if (depth === 0 || game.isGameOver()) {
    return [null, evaluateBoard(game.fen())];
  }

  const moves = game.moves({ verbose: true });
  
  // Sort moves slightly (captures first) to optimize alpha-beta pruning efficiency
  moves.sort((a, b) => {
    const aScore = a.captured ? 10 : 0;
    const bScore = b.captured ? 10 : 0;
    return bScore - aScore;
  });

  let bestMove: string | null = null;

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' });
      
      // Calculate repetition penalty
      const normFen = normalizeFen(game.fen());
      const isRepetition = gameHistory.includes(normFen);
      const repPenalty = isRepetition ? -300 : 0; // Penalize White for repeating position
      
      const [_, score] = minimax(game, depth - 1, alpha, beta, false, gameHistory);
      const totalScore = score + repPenalty;
      game.undo();

      if (totalScore > maxEval) {
        maxEval = totalScore;
        bestMove = move.lan; // Use long algebraic notation (e.g. e2e4)
      }
      alpha = Math.max(alpha, totalScore);
      if (beta <= alpha) {
        break; // Beta cutoff
      }
    }
    return [bestMove, maxEval];
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' });
      
      // Calculate repetition penalty
      const normFen = normalizeFen(game.fen());
      const isRepetition = gameHistory.includes(normFen);
      const repPenalty = isRepetition ? 300 : 0; // Penalize Black (minimizing) for repeating position
      
      const [_, score] = minimax(game, depth - 1, alpha, beta, true, gameHistory);
      const totalScore = score + repPenalty;
      game.undo();

      if (totalScore < minEval) {
        minEval = totalScore;
        bestMove = move.lan;
      }
      beta = Math.min(beta, totalScore);
      if (beta <= alpha) {
        break; // Alpha cutoff
      }
    }
    return [bestMove, minEval];
  }
}

// Main API interface to fetch AI move
// difficulty: 'easy' | 'medium' | 'hard'
// gameHistory: Array of previous FEN strings to check/penalize repetitions
export function getBestMove(
  fen: string,
  difficulty: 'easy' | 'medium' | 'hard',
  gameHistory: string[] = []
): string | null {
  const game = new Chess(fen);
  const isAIWhite = game.turn() === 'w';

  // Define depth based on difficulty
  let depth = 2; // medium
  if (difficulty === 'easy') {
    depth = 1;
  } else if (difficulty === 'hard') {
    depth = 3;
  }

  // Easy mode: introduces occasional random noise/moves
  if (difficulty === 'easy' && Math.random() < 0.2) {
    const moves = game.moves();
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      // Convert to long algebraic notation to match standard minimax interface
      const tempGame = new Chess(fen);
      const m = tempGame.move(randomMove);
      return m.lan;
    }
  }

  // Normalize game history list for comparison
  const normalizedHistory = gameHistory.map(normalizeFen);

  const [bestMove, _] = minimax(game, depth, -Infinity, Infinity, isAIWhite, normalizedHistory);
  return bestMove;
}
