import React, { ReactElement } from "react";
import Game from "@/chess/game";

import { motion } from "framer-motion";

export default function ChessBoard({ game, onclick, style, turnedOver, setIsAnimating, className, children }: { game: Game, onclick: (row: number, col: number) => void, style?: React.CSSProperties, turnedOver?: boolean, setIsAnimating?:(bool: boolean)=>void, className?: string, children?: ReactElement }): React.ReactElement {
  const piece = {
    p: "bp",
    n: "bn",
    b: "bb",
    r: "br",
    q: "bq",
    k: "bk",
    P: "wp",
    N: "wn",
    B: "wb",
    R: "wr",
    Q: "wq",
    K: "wk",
  };

  const rows = [8, 7, 6, 5, 4, 3, 2, 1];
  const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  
  return (
    <div
      className={`grid grid-cols-8 grid-rows-8 aspect-square ${className}`}
      style={style}
    >
      {Array.from({ length: 8 * 8 }).map((_, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const isDarkSquare = (row + col) % 2 === 1;
        let pieceName = "";
        
        const pieceKey = game.board.grid[row][col];
        if (pieceKey) pieceName = piece[pieceKey as keyof typeof piece];

        // Check if the current square is a valid move
        const isValidMove = game.validMoves.some(([r, c]) => r === row && c === col);
        let isSelected = false;
        let isPrevMove = false;

        if (game.selection) {
          const [r, c] = game.selection;
          isSelected = (r === row) && (c === col);
        }

        if (game.board.prevMove.length !== 0) {
          const [from, to]     = game.board.prevMove;
          const [rFrom, cFrom] = from;
          const [rTo, cTo]     = to;
          isPrevMove = (rFrom === row && cFrom === col) || (rTo === row && cTo === col);
        }

        let backgroundColor = "";
        
        if      (isDarkSquare  && !(isSelected || isPrevMove)) backgroundColor = "bg-board-dark"; // Dark Square
        else if (!isDarkSquare && !(isSelected || isPrevMove)) backgroundColor = "bg-board-light"; // Light square

        if (game.board.isCheck(game.board.turn) && ((game.board.grid[row][col] === 'K' && game.board.turn === 'w') || (game.board.grid[row][col] === 'k' && game.board.turn === 'b'))) {
          // King Check
          if (isDarkSquare) backgroundColor = "bg-board-dark-danger";
          else              backgroundColor = "bg-board-light-danger";
        }
        
        if      (isDarkSquare  &&  (isSelected || isPrevMove)) backgroundColor = "bg-board-dark-highlighted"; // Dark Highlited Square
        else if (!isDarkSquare &&  (isSelected || isPrevMove)) backgroundColor = "bg-board-light-highlighted"; // Light Highlighted Square

        return (
          <motion.div
            key={`${row}-${col}`}
            onClick={() => {if (!turnedOver) onclick(row, col)}}
            className={`
              relative flex justify-center items-center z-10 ${backgroundColor}
              ${(row == 0 && col == 0) && "rounded-tl-sm"}
              ${(row == 0 && col == 7) && "rounded-tr-sm"}
              ${(row == 7 && col == 0) && "rounded-bl-sm"}
              ${(row == 7 && col == 7) && "rounded-br-sm"}
            `}
            animate={{
              rotateX: turnedOver ? 180 : 0,
              rotateY: turnedOver ? 180 : 0,
              opacity: turnedOver ? 0   : 100,
              visibility: turnedOver ? "hidden" : "visible",
            }}
            onAnimationComplete={() => {
              if (row == 7 && col == 7) {setIsAnimating?.(false)}
            }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
              delay: (row + col) * 0.1, // Creates a staggered effect
            }}
            style={{
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
            }}
          >
            {game.board.grid[row][col] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/chess/pieces/${pieceName}.png`}
                alt="Chess Piece"
                className="w-full h-full"
              />
            )}

            {/* Overlay a semi-transparent circle */}
            {isValidMove && !pieceKey && (
              <div
                className="absolute rounded-full"
                style={{
                  width: "35%",
                  height: "35%",
                  backgroundColor: "rgba(0, 0, 0, 0.2)", // Semi-transparent black circle
                }}
              />
            )}

            {/* Overlay a semi-transparent donut if there's a piece */}
            {isValidMove && pieceKey && (
              <div
                className="absolute rounded-full"
                style={{
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                  boxShadow: "inset 0 0 0 5px rgba(0, 0, 0, 0.2)", // Semi-transparent donut effect
                }}
              />
            )}

            {row == 7 && <div className={`absolute -bottom-px right-px text-xs md:text-sm font-semibold ${isDarkSquare ? "text-board-light" : "text-board-dark"}`}>{cols[col]}</div>}
            {col == 0 && <div className={`absolute -top-px    left-px  text-xs md:text-sm font-semibold ${isDarkSquare ? "text-board-light" : "text-board-dark"}`}>{rows[row]}</div>}
          </motion.div>
        );
      })}

      {/* Div hidden behind the board, revealed by turn over animation */}
      <div className={`absolute ${turnedOver ? "z-100 visible" : "z-0 hidden"} w-full h-full p-3 flex flex-col justify-center`}>
        {children}
      </div>
    </div>
  );
}
