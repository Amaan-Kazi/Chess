"use client"
import { useState } from "react";

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Navbar from "@/components/navbar"

import Game from "@/chess/game"

export default function PassAndPlay() {
  const [game] = useState(new Game());
  const [version, setVersion] = useState(0); // manually trigger re renders
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionTarget, setPromotionTarget] = useState<number[] | null>(null);

  const click = (row: number, col: number) => {
    // Pawn Promotion
    if (game.selection !== null) {
      if (row === (game.board.turn === 'w' ? 0 : 7) && game.board.grid[game.selection![0]][game.selection![1]] === (game.board.turn === 'w' ? 'P' : 'p')) {
        for (const [r, c] of game.validMoves) {
          if (r === row && c === col) {
            setPromotionTarget([row, col]);
            setShowPromotionModal(true);
            return;
          }
        }
      }
    }

    game.select([row, col, 999]);
    setVersion(version + 1);
  };

  const promotion = (piece: string) => {
    const pieceCode = {
      "Queen":  300,
      "Knight": 301,
      "Rook":   302,
      "Bishop": 303,
    };

    game.select([promotionTarget![0], promotionTarget![1], pieceCode[piece as keyof typeof pieceCode]]);
    setVersion(version + 1);

    setShowPromotionModal(false);
    setPromotionTarget(null);
  }

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
            
            if      (isDarkSquare  && !(isSelected || isPrevMove)) backgroundColor = "#739552"; // Dark Square
            else if (!isDarkSquare && !(isSelected || isPrevMove)) backgroundColor = "#EBECD0"; // Light square

            if (game.board.isCheck(game.board.turn) && ((game.board.grid[row][col] === 'K' && game.board.turn === 'w') || (game.board.grid[row][col] === 'k' && game.board.turn === 'b'))) {
              // King Check
              if (isDarkSquare) backgroundColor = "#D36C50";
              else              backgroundColor = "#EB7D6A";
            }
            
            if      (isDarkSquare  &&  (isSelected || isPrevMove)) backgroundColor = "#B9CA43"; // Dark Highlited Square
            else if (!isDarkSquare &&  (isSelected || isPrevMove)) backgroundColor = "#F5F682"; // Light Highlighted Square

            return (
              <div
                key={`${row}-${col}`}
                onClick={() => click(row, col)}
                className="relative flex justify-center items-center"
                style={{
                  backgroundColor,
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
                      boxShadow: "inset 0 0 0 5px rgba(0, 0, 0, 0.2)", // Semi-transparent donut effect
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

      {/* Promotion Modal */}
      <div className={`absolute flex w-screen h-screen justify-center items-center ${!showPromotionModal && "hidden"}`}>
        <Card className="max-w-[80%]">
          <CardHeader>
            <CardTitle>Pawn Promotion</CardTitle>
            <CardDescription>Select a piece to promote to</CardDescription>
          </CardHeader>
          <CardContent className="flex">
            <Button className = "bg-red w-14 h-14 m-1 aspect-square" variant={"outline"} onClick={() => {promotion("Queen")}}>
              <img
                src={`/chess/pieces/${game.board.turn === 'w' ? 'wq' : 'bq'}.png`}
                alt="Chess Piece"
              />
            </Button>
            <Button className = "bg-red w-14 h-14 m-1 aspect-square" variant={"outline"} onClick={() => {promotion("Knight")}}>
              <img
                src={`/chess/pieces/${game.board.turn === 'w' ? 'wn' : 'bn'}.png`}
                alt="Chess Piece"
              />
            </Button>
            <Button className = "bg-red w-14 h-14 m-1 aspect-square" variant={"outline"} onClick={() => {promotion("Rook")}}>
              <img
                src={`/chess/pieces/${game.board.turn === 'w' ? 'wr' : 'br'}.png`}
                alt="Chess Piece"
              />
            </Button>
            <Button className = "bg-red w-14 h-14 m-1 aspect-square" variant={"outline"} onClick={() => {promotion("Bishop")}}>
              <img
                src={`/chess/pieces/${game.board.turn === 'w' ? 'wb' : 'bb'}.png`}
                alt="Chess Piece"
              />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
