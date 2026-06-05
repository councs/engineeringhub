'use client';

import React from 'react';

// Classical cburnett vector representations of chess pieces loaded from official assets
const ChessPiece: React.FC<{ type: string; color: string }> = ({ type, color }) => {
  const pieceCode = `${color}${type.toUpperCase()}`;
  return (
    <img
      src={`https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/${pieceCode}.svg`}
      alt={`${color === 'w' ? 'White' : 'Black'} ${type}`}
      className="w-[85%] h-[85%] drop-shadow-md select-none pointer-events-none"
    />
  );
};

interface ChessBoardProps {
  board: any[][];
  selectedSquare: string | null;
  validMoves: string[];
  onSquareClick: (square: string) => void;
  isReversed: boolean;
}

export default function ChessBoard({
  board,
  selectedSquare,
  validMoves,
  onSquareClick,
  isReversed,
}: ChessBoardProps) {
  const ranks = isReversed ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const files = isReversed ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const getSquareName = (r: number, c: number): string => {
    const fileName = String.fromCharCode(97 + c);
    const rankName = (r + 1).toString();
    return `${fileName}${rankName}`;
  };

  return (
    <div className="w-full aspect-square bg-slate-900 border-4 border-slate-800 rounded-xl overflow-hidden shadow-2xl relative select-none">
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
        {ranks.map((r) =>
          files.map((c) => {
            const squareName = getSquareName(r, c);
            const piece = board[7 - r]?.[c]; // chess.js board index: row 0 is rank 8 (index 7-r)
            
            const isDark = (r + c) % 2 === 0;
            const isSelected = selectedSquare === squareName;
            const isValidTarget = validMoves.includes(squareName);

            // Sleek color tokens matching dark SCADA dashboard theme
            let squareColor = isDark
              ? 'bg-slate-700 hover:bg-slate-650'
              : 'bg-slate-600 hover:bg-slate-550';
            
            if (isSelected) {
              squareColor = 'bg-blue-500/50 hover:bg-blue-500/60';
            }

            return (
              <div
                key={squareName}
                onClick={() => onSquareClick(squareName)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${squareColor}`}
              >
                {/* Visual indicator for legal move targets */}
                {isValidTarget && (
                  <div className="absolute inset-0 flex items-center justify-center z-15">
                    {piece ? (
                      // If it's a capture target, draw a subtle outer ring
                      <div className="w-11/12 h-11/12 rounded-full border-4 border-amber-400/70" />
                    ) : (
                      // Empty square target, draw a simple centered dot
                      <div className="w-4 h-4 rounded-full bg-amber-400/80 animate-pulse" />
                    )}
                  </div>
                )}

                {/* Render piece */}
                {piece && (
                  <div className="w-5/6 h-5/6 flex items-center justify-center z-10 select-none">
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Rank and File coordinate text aids along borders */}
                {c === (isReversed ? 7 : 0) && (
                  <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-slate-400 opacity-60">
                    {r + 1}
                  </span>
                )}
                {r === (isReversed ? 7 : 0) && (
                  <span className="absolute bottom-1 right-1.5 text-[9px] font-mono font-bold text-slate-400 opacity-60">
                    {String.fromCharCode(97 + c)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
