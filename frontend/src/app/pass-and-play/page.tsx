"use client"
import { useState } from "react";

import Navbar from "@/components/navbar"

import Game from "@/chess/game"

export default function PassAndPlay() {
  const [game] = useState(new Game());
  const [version, setVersion] = useState(0); // manually trigger re renders

  const click = (row: number, col: number) => {
    console.log(`Square clicked: Row ${row}, Col ${col}`);

    game.select([row, col]);
    console.log(game.validMoves);

    setVersion(version + 1);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar activePage="Pass And Play"/>

      <div className="flex flex-1 justify-center items-center">
        {/* Chess Board */}
        <div
          className="grid grid-cols-8 grid-rows-8 aspect-square m-5 select-none"
          style={{
            aspectRatio: "1 / 1",     // Maintain square aspect ratio
            width: "min(90vw, 75vh)", // Ensure it fits within both width and height
            maxWidth: "90vw",         // Avoid overflowing horizontally
            maxHeight: "75vh",        // Avoid overflowing vertically
          }}
        >
          {Array.from({ length: 8 * 8 }).map((_, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const isDarkSquare = (row + col) % 2 === 1;
            let pieceName = "";

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
            
            const pieceKey = game.board.grid[row][col];
            if (pieceKey) {
              // Type assertion: tell TypeScript that pieceKey is one of the valid keys of `piece`
              pieceName = piece[pieceKey as keyof typeof piece];
            }

            // Check if the current square is a valid move
            const isValidMove = game.validMoves.some(([r, c]) => r === row && c === col);

            return (
              <div
                key={`${row}-${col}`}
                onClick={() => click(row, col)}
                className="relative flex justify-center items-center"
                style={{
                  backgroundColor: isDarkSquare ? "#658a3f" : "#EBECD0",
                  width: "100%",
                  height: "100%"
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
                      boxShadow: "inset 0 0 0 5px rgba(0, 0, 0, 0.15)", // Semi-transparent donut effect
                    }}
                  />
                )}

                {row == 7 && <div className="absolute -bottom-px right-px text-sm font-semibold" style = {{color: isDarkSquare ? "#EBECD0" : "#658a3f"}}>{cols[col]}</div>}
                {col == 0 && <div className="absolute -top-px    left-px  text-sm font-semibold" style = {{color: isDarkSquare ? "#EBECD0" : "#658a3f"}}>{rows[row]}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div>Menu</div>
    </div>
  )
}
