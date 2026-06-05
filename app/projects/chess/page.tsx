'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Chess } from 'chess.js';
import { ArrowLeft, Cpu } from 'lucide-react';
import ChessBoard from '@/components/chess/ChessBoard';
import MoveLog from '@/components/chess/MoveLog';
import EvalBar from '@/components/chess/EvalBar';
import GameSettings from '@/components/chess/GameSettings';
import { getBestMove, evaluateBoard } from '@/lib/chess/aiEngine';

export default function ChessGamePage() {
  const [isClient, setIsClient] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [isAiVsAi, setIsAiVsAi] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Game state representation
  const chessRef = useRef<Chess>(null);
  if (!chessRef.current) {
    chessRef.current = new Chess();
  }
  const game = chessRef.current;

  // React-synced rendering states
  const [fen, setFen] = useState(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [aiThinking, setAiThinking] = useState(false);

  // Maintain list of past positions to check/penalize repetitions
  const fenHistoryRef = useRef<string[]>([]);
  if (fenHistoryRef.current.length === 0) {
    fenHistoryRef.current = [game.fen()];
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  const board = useMemo(() => {
    return game.board();
  }, [fen]);

  const history = useMemo(() => {
    return game.history();
  }, [fen]);

  const evalScore = useMemo(() => {
    return evaluateBoard(fen);
  }, [fen]);

  // Compute captured pieces based on FEN
  const captured = useMemo(() => {
    const startingPieces: Record<string, number> = {
      P: 8, N: 2, B: 2, R: 2, Q: 1,
      p: 8, n: 2, b: 2, r: 2, q: 1,
    };
    
    const currentCount: Record<string, number> = {
      P: 0, N: 0, B: 0, R: 0, Q: 0,
      p: 0, n: 0, b: 0, r: 0, q: 0,
    };

    board.forEach((row) => {
      row.forEach((piece) => {
        if (piece && piece.type !== 'k') {
          const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
          currentCount[key] = (currentCount[key] || 0) + 1;
        }
      });
    });

    const capturedWhite: string[] = [];
    const capturedBlack: string[] = [];

    // White pieces captured (played by Black)
    for (const piece of ['P', 'N', 'B', 'R', 'Q']) {
      const diff = (startingPieces[piece] || 0) - (currentCount[piece] || 0);
      for (let i = 0; i < diff; i++) {
        capturedWhite.push(piece.toLowerCase());
      }
    }

    // Black pieces captured (played by White)
    for (const piece of ['p', 'n', 'b', 'r', 'q']) {
      const diff = (startingPieces[piece] || 0) - (currentCount[piece] || 0);
      for (let i = 0; i < diff; i++) {
        capturedBlack.push(piece.toLowerCase());
      }
    }

    return { w: capturedWhite, b: capturedBlack };
  }, [board]);

  // Determine game status text
  const gameStatus = useMemo(() => {
    if (isPaused) return 'Game Paused';
    if (aiThinking) return isAiVsAi ? 'Engine calculating next move...' : 'Engine calculating best response...';
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Black (AI)' : 'White (AI)';
      return `Checkmate! ${winner} wins.`;
    }
    if (game.isDraw()) {
      return 'Draw! (Stalemate, Repetition, or Material)';
    }
    if (game.inCheck()) {
      return `${game.turn() === 'w' ? 'White' : 'Black'} is in CHECK!`;
    }
    return `${game.turn() === 'w' ? 'White' : 'Black'} to move`;
  }, [fen, aiThinking, isAiVsAi, isPaused]);

  // Handle Square Selection and Moves
  const handleSquareClick = (square: string) => {
    if (game.isGameOver() || aiThinking || isAiVsAi || isPaused || game.turn() !== playerColor) return;

    // If clicking a valid move square
    if (validMoves.includes(square) && selectedSquare) {
      try {
        game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q', // Auto promote to queen for simplicity
        });
        const nextFen = game.fen();
        setFen(nextFen);
        fenHistoryRef.current.push(nextFen);
        setSelectedSquare(null);
        setValidMoves([]);
      } catch (err) {
        console.error('Invalid move attempted:', err);
      }
      return;
    }

    // If clicking a friendly piece, select it and fetch valid moves
    const piece = game.get(square as any);
    if (piece && piece.color === playerColor) {
      setSelectedSquare(square);
      const moves = game.moves({ square: square as any, verbose: true }) as any[];
      setValidMoves(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // AI Move triggers
  useEffect(() => {
    if (game.isGameOver() || isPaused) return;

    const isAITurn = isAiVsAi || game.turn() !== playerColor;
    if (isAITurn) {
      setAiThinking(true);
      // Run AI logic in a minor timeout to allow UI updates
      const timer = setTimeout(() => {
        const aiMove = getBestMove(game.fen(), difficulty, fenHistoryRef.current);
        if (aiMove) {
          try {
            // lan is e.g. e2e4 or e7e8q (promotion)
            const from = aiMove.substring(0, 2);
            const to = aiMove.substring(2, 4);
            const promotion = aiMove.substring(4, 5) || 'q';
            
            game.move({ from, to, promotion });
            const nextFen = game.fen();
            setFen(nextFen);
            fenHistoryRef.current.push(nextFen);
          } catch (err) {
            console.error('AI generated invalid move:', aiMove, err);
            // Fallback: play first legal move
            const moves = game.moves();
            if (moves.length > 0) {
              game.move(moves[0]);
              const nextFen = game.fen();
              setFen(nextFen);
              fenHistoryRef.current.push(nextFen);
            }
          }
        }
        setAiThinking(false);
      }, isAiVsAi ? 600 : 350); // Slower delay for AI vs AI simulation so humans can watch

      return () => clearTimeout(timer);
    }
  }, [fen, playerColor, difficulty, isAiVsAi, isPaused]);

  const handleResetGame = () => {
    game.reset();
    fenHistoryRef.current = [game.fen()];
    setFen(game.fen());
    setSelectedSquare(null);
    setValidMoves([]);
    setAiThinking(false);
    setIsPaused(false);
  };

  if (!isClient) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">LOADING CHESS ENGINE...</span>
        </div>
      </main>
    );
  }

  const isReversed = playerColor === 'b';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* SCADA / Bloomberg Navigation Header */}
      <header className="bg-slate-900/40 backdrop-blur border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400 animate-pulse" />
              <h1 className="text-base md:text-lg font-black text-slate-100 uppercase tracking-wider font-mono">
                Chess AI Simulator
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase font-mono hidden sm:block">
              Minimax Engine Bot Matchup
            </p>
          </div>
        </div>
      </header>

      {/* Main Chess Arena Grid */}
      <div className="flex-grow p-6 max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side settings and telemetry (Spans 3/12) */}
        <section className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
          <GameSettings
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            playerColor={playerColor}
            setPlayerColor={setPlayerColor}
            isAiVsAi={isAiVsAi}
            setIsAiVsAi={setIsAiVsAi}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            onReset={handleResetGame}
            gameStatus={gameStatus}
          />
        </section>

        {/* Center Grid: EvalBar + ChessBoard (Spans 6/12) */}
        <section className="lg:col-span-6 flex gap-4 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 shadow-2xl order-1 lg:order-2 items-stretch">
          <EvalBar score={evalScore} isReversed={isReversed} />
          
          <div className="flex-grow flex items-center justify-center">
            <ChessBoard
              board={board}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              onSquareClick={handleSquareClick}
              isReversed={isReversed}
            />
          </div>
        </section>

        {/* Right Side: Move logs & captured material (Spans 3/12) */}
        <section className="lg:col-span-3 flex flex-col gap-6 order-3">
          <MoveLog history={history} captured={captured} />
        </section>
      </div>
    </main>
  );
}
