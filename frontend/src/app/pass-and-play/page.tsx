"use client"
import { useState } from "react";

import Navbar from "@/components/navbar"

import Game from "@/chess/game"

export default function PassAndPlay() {
  const [game, setGame] = useState(new Game());

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

  const click = (row: number, col: number) => {
    setGame(game);
    console.log(`Square clicked: Row ${row}, Col ${col}`);
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
            
            const pieceKey = game.board.grid[row][col];
            if (pieceKey) {
              // Type assertion: tell TypeScript that pieceKey is one of the valid keys of `piece`
              pieceName = piece[pieceKey as keyof typeof piece];
            }

            return (
              <div
                key={`${row}-${col}`}
                onClick={() => click(row, col)}
                className={`flex justify-center items-center ${
                  isDarkSquare ? "bg-gray-700" : "bg-gray-300"
                }`}
                style={{ width: "100%", height: "100%" }}
              >
                {game.board.grid[row][col] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/chess/pieces/${pieceName}.png`}
                    alt="Chess Piece"
                    className="w-full h-full"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>Menu</div>
    </div>
  )
}
